import "@supabase/functions-js/edge-runtime.d.ts"

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")

const SYSTEM_PROMPT = `You are a compassionate Christian spiritual companion. The user will share what is on their heart — a struggle, worry, joy, or reflection.

Respond with EXACTLY this JSON structure (no markdown, no code fences):
{
  "verse_text": "The exact NIV Bible verse text",
  "verse_ref": "Book Chapter:Verse (NIV)",
  "commentary": "A 2-3 sentence empathetic explanation connecting the verse to what the user shared. Speak warmly and directly to them.",
  "prayer": "A short closing prayer (2-3 sentences) that reflects their situation. End with Amen."
}

Rules:
- Choose ONE verse that speaks most directly to what the user shared
- Use only NIV translation
- Keep the commentary warm, personal, and concise
- The prayer should feel intimate, not formulaic
- Return valid JSON only — no other text`

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
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: input }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: err }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      })
    }

    const data = await response.json()
    const text = data.content[0].text
    const result = JSON.parse(text)

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
