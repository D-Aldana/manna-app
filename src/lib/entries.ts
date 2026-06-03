import { ensureSession, supabase } from "@/lib/supabase"

export type Entry = {
  id: string
  created_at: string
  input: string
  verse_text: string | null
  verse_ref: string | null
  commentary: string | null
  prayer: string | null
}

export async function createEntry(input: string) {
  await ensureSession()
  const { data, error } = await supabase.from("entries").insert({ input }).select().single()

  if (error) throw error
  return data as Entry
}

export async function updateEntry(
  id: string,
  fields: Partial<Pick<Entry, "verse_text" | "verse_ref" | "commentary" | "prayer">>,
) {
  await ensureSession()
  const { data, error } = await supabase
    .from("entries")
    .update(fields)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Entry
}

export async function getEntries() {
  await ensureSession()
  const { data, error } = await supabase
    .from("entries")
    .select()
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Entry[]
}

export async function getEntry(id: string) {
  await ensureSession()
  const { data, error } = await supabase.from("entries").select().eq("id", id).single()

  if (error) throw error
  return data as Entry
}

export async function deleteEntry(id: string) {
  await ensureSession()
  const { error } = await supabase.from("entries").delete().eq("id", id)

  if (error) throw error
}
