import { Platform } from "react-native"
import { ensureSession, supabase } from "@/lib/supabase"

export async function sendFeedback(message: string): Promise<void> {
  // feedback runs with verify_jwt=true, so we need an (anonymous) session token.
  await ensureSession()

  const { error } = await supabase.functions.invoke("feedback", {
    body: { message, platform: Platform.OS },
  })

  if (error) {
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
}
