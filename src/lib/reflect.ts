import { ensureSession, supabase } from "@/lib/supabase"

type ReflectResponse = {
  verse_text: string
  verse_ref: string
  commentary: string
  prayer: string
}

export async function reflect(input: string): Promise<ReflectResponse> {
  // reflect runs with verify_jwt=true, so we need an (anonymous) session token.
  await ensureSession()

  const { data, error } = await supabase.functions.invoke<ReflectResponse>("reflect", {
    body: { input },
  })

  if (error) {
    // FunctionsHttpError carries the raw Response in `context`; pull the status
    // and JSON body so callers can distinguish 429/503 from other failures.
    let detail = error.message
    const res = (error as { context?: Response }).context
    if (res?.json) {
      try {
        const body = await res.json()
        if (body?.error) detail = `${res.status}: ${body.error}`
      } catch {
        // no JSON body; keep the generic message
      }
    }
    throw new Error(detail || "Edge function error")
  }
  if (!data) throw new Error("No response from reflect function")
  return data
}
