import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const MAX_MESSAGE_CHARS = Number(Deno.env.get("MAX_FEEDBACK_CHARS") ?? 4000)
// Abuse cap. Feedback is occasional, so these are tight; a flood is almost
// certainly spam. Keyed on both user and IP, same as the reflect function.
const RATE_LIMIT_PER_USER = Number(Deno.env.get("FEEDBACK_RATE_LIMIT_PER_USER") ?? 10)
const RATE_LIMIT_PER_IP = Number(Deno.env.get("FEEDBACK_RATE_LIMIT_PER_IP") ?? 30)
const RATE_WINDOW_SECONDS = 3600

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    const { message, platform } = await req.json()
    if (!message || typeof message !== "string" || !message.trim()) {
      return jsonResponse({ error: "message is required" }, 400)
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      return jsonResponse({ error: "message is too long" }, 413)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const userId = userIdFromJwt(req)
    const buckets = [{ key: `feedback:ip:${clientIp(req)}`, limit: RATE_LIMIT_PER_IP }]
    if (userId) buckets.push({ key: `feedback:user:${userId}`, limit: RATE_LIMIT_PER_USER })
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
        return jsonResponse({ error: "Too many messages. Please try again later." }, 429)
      }
    }

    const { error } = await supabase.from("feedback").insert({
      message: message.trim(),
      user_id: userId,
      platform: typeof platform === "string" ? platform.slice(0, 32) : null,
    })

    if (error) {
      console.error("Feedback insert error:", error)
      return jsonResponse({ error: "Could not save feedback" }, 500)
    }

    return jsonResponse({ ok: true })
  } catch (err) {
    console.error("Edge function error:", err)
    return jsonResponse({ error: `Edge function: ${err.message}` }, 500)
  }
})

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")
  return fwd ? fwd.split(",")[0].trim() : "unknown"
}

// The gateway already verified the JWT (verify_jwt=true); we only read `sub`,
// so decoding the payload without re-verifying is safe.
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
