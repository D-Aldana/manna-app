import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"
import { parseVerseRef } from "./osis.ts"
import { createYouVersionSource, type VerseSource } from "./verse-source.ts"

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!
const YOUVERSION_APP_KEY = Deno.env.get("YOUVERSION_APP_KEY")!
const BIBLE_ID = Deno.env.get("BIBLE_ID")!
const BIBLE_ABBREVIATION = Deno.env.get("BIBLE_ABBREVIATION") ?? "BSB"
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

// Cost protection. A Pouring is a few paragraphs; the daily cap is a flood
// breaker, not a normal-usage limit. Both tunable without a code change.
const MAX_INPUT_CHARS = Number(Deno.env.get("MAX_INPUT_CHARS") ?? 4000)
const DAILY_CALL_LIMIT = Number(Deno.env.get("DAILY_CALL_LIMIT") ?? 1000)
// Per-source cap, keyed on both user and IP so one IP minting many anon users
// is still bounded. The IP limit is looser since carrier-grade NAT pools many
// real users behind one address. The global daily limit catches distributed floods.
const RATE_LIMIT_PER_USER = Number(Deno.env.get("RATE_LIMIT_PER_USER") ?? 20)
const RATE_LIMIT_PER_IP = Number(Deno.env.get("RATE_LIMIT_PER_IP") ?? 60)
const RATE_WINDOW_SECONDS = 3600

// Fallback only. The live prompt is the `reflect_system_prompt` row in
// app_config (editable in the Supabase dashboard, no deploy); this is used if
// that row is missing or the lookup fails. Keep it in sync as a safety net.
const DEFAULT_SYSTEM_PROMPT = `You are a compassionate Christian spiritual companion. The user shares what is on their heart.

Respond with ONLY valid JSON (no markdown, no code fences):
{"verse_ref":"Book Chapter:Verse","commentary":"2-3 warm sentences connecting the verse to the user","prayer":"2-3 sentence closing prayer ending with Amen."}

Rules for verse_ref:
- ONE single verse only (e.g. "John 3:16", "Psalm 23:1", "1 Peter 5:7"). No ranges. No parentheticals.
- Use full book names. Use "Psalm" or "Psalms" — not "Ps".
- Must be a real verse in the standard Protestant canon.

Warm and personal, not formulaic.`

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type ClaudeReflection = {
  verse_ref: string
  commentary: string
  prayer: string
}

// Cache the DB-sourced prompt across warm invocations so edits propagate within
// a minute without a per-request lookup.
const PROMPT_TTL_MS = 60_000
let cachedPrompt: string | null = null
let cachedPromptAt = 0

async function getSystemPrompt(supabase: ReturnType<typeof createClient>): Promise<string> {
  const now = Date.now()
  if (cachedPrompt && now - cachedPromptAt < PROMPT_TTL_MS) return cachedPrompt

  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "reflect_system_prompt")
    .maybeSingle()

  if (error) {
    console.error("Prompt fetch error:", error)
    return cachedPrompt ?? DEFAULT_SYSTEM_PROMPT
  }

  cachedPrompt = (data?.value as string) ?? DEFAULT_SYSTEM_PROMPT
  cachedPromptAt = now
  return cachedPrompt
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    const { input } = await req.json()
    if (!input || typeof input !== "string") {
      return jsonResponse({ error: "input is required" }, 400)
    }
    if (input.length > MAX_INPUT_CHARS) {
      return jsonResponse({ error: "input is too long" }, 413)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Per-source rate limit. Runs before the global counter so blocked requests
    // don't inflate it. Fails open on a counter error.
    const buckets = [{ key: `ip:${clientIp(req)}`, limit: RATE_LIMIT_PER_IP }]
    const userId = userIdFromJwt(req)
    if (userId) buckets.push({ key: `user:${userId}`, limit: RATE_LIMIT_PER_USER })
    for (const { key, limit } of buckets) {
      const { data: hits, error: rlErr } = await supabase.rpc("bump_rate_limit", {
        p_bucket: key,
        p_window_seconds: RATE_WINDOW_SECONDS,
      })
      if (rlErr) {
        console.error("Rate limit error:", rlErr)
        break
      }
      if (typeof hits === "number" && hits > limit) {
        return jsonResponse({ error: "Too many requests. Please rest and try again later." }, 429)
      }
    }

    // Daily circuit breaker — stop calling Claude past the cap. Fail open on a
    // counter error; the Anthropic spend limit is the hard backstop.
    const { data: callCount, error: counterErr } = await supabase.rpc("increment_usage_counter")
    if (counterErr) {
      console.error("Usage counter error:", counterErr)
    } else if (typeof callCount === "number" && callCount > DAILY_CALL_LIMIT) {
      return jsonResponse({ error: "Daily limit reached. Please try again tomorrow." }, 503)
    }

    const verseSource = createYouVersionSource({
      appKey: YOUVERSION_APP_KEY,
      bibleId: BIBLE_ID,
      abbreviation: BIBLE_ABBREVIATION,
    })

    const systemPrompt = await getSystemPrompt(supabase)
    let reflection = await callClaude(input, systemPrompt)
    let verse = await resolveVerse(reflection.verse_ref, verseSource, supabase)

    if (verse.status === "not_found" || verse.status === "unparseable") {
      reflection = await callClaude(input, systemPrompt, reflection.verse_ref)
      verse = await resolveVerse(reflection.verse_ref, verseSource, supabase)
    }

    if (verse.status !== "ok") {
      console.error("Verse resolution failed:", verse)
      return jsonResponse({ error: `Could not resolve verse: ${verse.status}` }, 502)
    }

    return jsonResponse({
      verse_text: verse.text,
      verse_ref: `${verse.canonical} (${verseSource.abbreviation})`,
      commentary: reflection.commentary,
      prayer: reflection.prayer,
    })
  } catch (err) {
    console.error("Edge function error:", err)
    return jsonResponse({ error: `Edge function: ${err.message}` }, 500)
  }
})

async function callClaude(
  input: string,
  systemPrompt: string,
  badRef?: string,
): Promise<ClaudeReflection> {
  const messages: Array<{ role: string; content: string }> = [{ role: "user", content: input }]
  if (badRef) {
    messages.push({
      role: "assistant",
      content: `{"verse_ref":"${badRef}","commentary":"...","prayer":"..."}`,
    })
    messages.push({
      role: "user",
      content: `The reference "${badRef}" could not be found. Pick a different real verse and respond again in the same JSON format.`,
    })
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 384,
      system: systemPrompt,
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic ${response.status}: ${err}`)
  }

  const data = await response.json()
  const raw = data.content[0].text
  const cleaned = raw.replace(/```json\s*|```\s*/g, "").trim()
  const parsed = JSON.parse(cleaned)
  if (!parsed.verse_ref || !parsed.commentary || !parsed.prayer) {
    throw new Error(`Claude returned incomplete JSON: ${cleaned.slice(0, 200)}`)
  }
  return parsed
}

type VerseResolution =
  | { status: "ok"; text: string; canonical: string }
  | { status: "not_found" }
  | { status: "unparseable" }
  | { status: "upstream_error"; detail: string }

async function resolveVerse(
  rawRef: string,
  source: VerseSource,
  supabase: ReturnType<typeof createClient>,
): Promise<VerseResolution> {
  const parsed = parseVerseRef(rawRef)
  if (!parsed) return { status: "unparseable" }

  const cached = await supabase
    .from("verse_cache")
    .select("verse_text")
    .eq("source_id", source.sourceId)
    .eq("osis_ref", parsed.osis)
    .maybeSingle()

  if (cached.data?.verse_text) {
    return { status: "ok", text: cached.data.verse_text, canonical: parsed.canonical }
  }

  const fetched = await source.fetchVerse(parsed.osis)
  if (!fetched.ok && fetched.reason === "not_found") {
    return { status: "not_found" }
  }
  if (!fetched.ok) {
    return { status: "upstream_error", detail: fetched.detail }
  }

  await supabase.from("verse_cache").upsert({
    source_id: source.sourceId,
    osis_ref: parsed.osis,
    verse_text: fetched.text,
  })

  return { status: "ok", text: fetched.text, canonical: parsed.canonical }
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")
  return fwd ? fwd.split(",")[0].trim() : "unknown"
}

// The API gateway already verified the JWT (verify_jwt=true); we only read `sub`
// for the rate-limit key, so decoding the payload without re-verifying is safe.
function userIdFromJwt(req: Request): string | null {
  const auth = req.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) return null
  try {
    const payload = auth.slice(7).split(".")[1]
    if (!payload) return null
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
    return typeof json.sub === "string" ? json.sub : null
  } catch {
    return null
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  })
}
