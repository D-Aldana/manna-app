import { gcm } from "@noble/ciphers/aes.js"
import { bytesToHex, hexToBytes, utf8ToBytes, bytesToUtf8 } from "@noble/ciphers/utils.js"
import * as Crypto from "expo-crypto"
import * as SecureStore from "expo-secure-store"

// AES-256-GCM encryption for user entries at rest. The key is generated once
// per device and kept in the Keychain/Keystore — it never leaves the device,
// so Supabase only ever stores ciphertext.

const KEY_STORE = "manna_entry_key_v1"
const PREFIX = "enc:v1:"
const IV_BYTES = 12

let keyPromise: Promise<Uint8Array> | null = null

function getKey(): Promise<Uint8Array> {
  keyPromise ??= (async () => {
    try {
      const stored = await SecureStore.getItemAsync(KEY_STORE)
      if (stored) return hexToBytes(stored)
      const key = Crypto.getRandomBytes(32)
      await SecureStore.setItemAsync(KEY_STORE, bytesToHex(key), {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      })
      return key
    } catch (err) {
      keyPromise = null // allow retry on next call
      throw err
    }
  })()
  return keyPromise
}

export async function encrypt(plain: string): Promise<string> {
  const key = await getKey()
  const iv = Crypto.getRandomBytes(IV_BYTES)
  const ciphertext = gcm(key, iv).encrypt(utf8ToBytes(plain))
  return PREFIX + bytesToHex(iv) + bytesToHex(ciphertext)
}

export async function decrypt(value: string): Promise<string> {
  // Rows saved before encryption (or any non-encrypted value) pass through as-is.
  if (!value.startsWith(PREFIX)) return value
  const key = await getKey()
  const hex = value.slice(PREFIX.length)
  const iv = hexToBytes(hex.slice(0, IV_BYTES * 2))
  const ciphertext = hexToBytes(hex.slice(IV_BYTES * 2))
  return bytesToUtf8(gcm(key, iv).decrypt(ciphertext))
}
