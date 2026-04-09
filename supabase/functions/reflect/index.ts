import "@supabase/functions-js/edge-runtime.d.ts"

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")

const SYSTEM_PROMPT = `You are a compassionate Christian spiritual companion. The user shares what is on their heart.

Respond with ONLY valid JSON (no markdown, no code fences):
{"verse_text":"exact NIV text","verse_ref":"Book Ch:V (NIV)","commentary":"2-3 warm sentences connecting the verse to the user","prayer":"2-3 sentence closing prayer ending with Amen."}

ONE verse, NIV only, warm and personal, not formulaic.`

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    })
  }

  try {
    const { input } = await req.json()

    if (!input || typeof input !== "string") {
      return new Response(JSON.stringify({ error: "input is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: input }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("Anthropic API error:", response.status, err)
      return new Response(JSON.stringify({ error: `Anthropic ${response.status}: ${err}` }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      })
    }

    const data = await response.json()
    const raw = data.content[0].text
    const cleaned = raw.replace(/```json\s*|```\s*/g, "").trim()
    const result = JSON.parse(cleaned)

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Edge function error:", err)
    return new Response(JSON.stringify({ error: `Edge function: ${err.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
