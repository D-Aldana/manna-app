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

const SYSTEM_PROMPT = `You are a compassionate Christian spiritual companion. The user shares what is on their heart.

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    const { input } = await req.json()
    if (!input || typeof input !== "string") {
      return jsonResponse({ error: "input is required" }, 400)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const verseSource = createYouVersionSource({
      appKey: YOUVERSION_APP_KEY,
      bibleId: BIBLE_ID,
      abbreviation: BIBLE_ABBREVIATION,
    })

    let reflection = await callClaude(input)
    let verse = await resolveVerse(reflection.verse_ref, verseSource, supabase)

    if (verse.status === "not_found" || verse.status === "unparseable") {
      reflection = await callClaude(input, reflection.verse_ref)
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

async function callClaude(input: string, badRef?: string): Promise<ClaudeReflection> {
  const messages: Array<{ role: string; content: string }> = [{ role: "user", content: input }]
  if (badRef) {
    messages.push({
      role: "assistant",
      content: `{"verse_ref":"${badRef}","commentary":"...","prayer":"..."}`,
    })
    messages.push({
      role: "user",
      content: `The reference "${badRef}" could not be found. Pick a different real NIV verse and respond again in the same JSON format.`,
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
      system: SYSTEM_PROMPT,
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  })
}
