import { supabase } from "@/lib/supabase"

type ReflectResponse = {
  verse_text: string
  verse_ref: string
  commentary: string
  prayer: string
}

export async function reflect(input: string): Promise<ReflectResponse> {
  const { data, error } = await supabase.functions.invoke("reflect", {
    body: { input },
  })

  if (error) throw error
  return data as ReflectResponse
}
