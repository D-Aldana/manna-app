import { Linking } from "react-native"

export const DONATION_URL = process.env.EXPO_PUBLIC_DONATION_URL

export async function openDonationPage() {
  if (!DONATION_URL) return false
  try {
    await Linking.openURL(DONATION_URL)
    return true
  } catch {
    return false
  }
}
