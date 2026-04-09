import { supabase } from "@/lib/supabase"

type ReflectResponse = {
  verse_text: string
  verse_ref: string
  commentary: string
  prayer: string
}

export async function reflect(input: string): Promise<ReflectResponse> {
  const { data, error } = await supabase.functions.invoke<ReflectResponse>("reflect", {
    body: { input },
  })

  if (error) {
    const detail = (data as Record<string, string>)?.error ?? error.message
    throw new Error(detail || "Edge function error")
  }
  if (!data) throw new Error("No response from reflect function")
  return data
}
