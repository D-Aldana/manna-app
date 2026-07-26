import AsyncStorage from "@react-native-async-storage/async-storage"

// The Pouring screen's cached reflection, kept separate from saved history.
// `entry_id` links it to the history entry once saved, so deleting that entry
// can also clear this cache.
export const CURRENT_REFLECTION_KEY = "manna_current_reflection"

export type CurrentReflection = {
  input: string
  verse_text: string
  verse_ref: string
  commentary: string
  prayer: string
  entry_id?: string
}

export async function clearCurrentReflectionIfEntry(entryId: string) {
  const stored = await AsyncStorage.getItem(CURRENT_REFLECTION_KEY)
  if (!stored) return
  try {
    const data = JSON.parse(stored) as CurrentReflection
    if (data.entry_id === entryId) {
      await AsyncStorage.removeItem(CURRENT_REFLECTION_KEY)
    }
  } catch {
    // Unreadable cache — leave it; the Pouring screen owns recovery.
  }
}
