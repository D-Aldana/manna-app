import { decrypt, encrypt } from "@/lib/crypto"
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

// Text fields are stored AES-256 encrypted; id/created_at/user_id stay plaintext
// for ordering and RLS.
const ENCRYPTED_FIELDS = ["input", "verse_text", "verse_ref", "commentary", "prayer"] as const

async function mapFields(
  row: Record<string, unknown>,
  transform: (value: string) => Promise<string>,
) {
  const out: Record<string, unknown> = { ...row }
  await Promise.all(
    ENCRYPTED_FIELDS.filter((f) => typeof row[f] === "string" && row[f] !== "").map(async (f) => {
      out[f] = await transform(row[f] as string)
    }),
  )
  return out
}

const decryptRow = (row: Record<string, unknown>) => mapFields(row, decrypt)
const encryptFields = (fields: Record<string, unknown>) => mapFields(fields, encrypt)

export async function createEntry(input: string) {
  await ensureSession()
  const { data, error } = await supabase
    .from("entries")
    .insert(await encryptFields({ input }))
    .select()
    .single()

  if (error) throw error
  return (await decryptRow(data)) as Entry
}

export async function updateEntry(
  id: string,
  fields: Partial<Pick<Entry, "verse_text" | "verse_ref" | "commentary" | "prayer">>,
) {
  await ensureSession()
  const { data, error } = await supabase
    .from("entries")
    .update(await encryptFields(fields))
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return (await decryptRow(data)) as Entry
}

export async function getEntries() {
  await ensureSession()
  const { data, error } = await supabase
    .from("entries")
    .select()
    .order("created_at", { ascending: false })

  if (error) throw error
  return (await Promise.all(data.map(decryptRow))) as Entry[]
}

export async function getEntry(id: string) {
  await ensureSession()
  const { data, error } = await supabase.from("entries").select().eq("id", id).single()

  if (error) throw error
  return (await decryptRow(data)) as Entry
}

export async function deleteEntry(id: string) {
  await ensureSession()
  const { error } = await supabase.from("entries").delete().eq("id", id)

  if (error) throw error
}
