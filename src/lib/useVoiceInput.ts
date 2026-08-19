import { useCallback, useEffect, useRef, useState } from "react"
import { AppState, Platform } from "react-native"
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionErrorCode,
} from "expo-speech-recognition"

type VoiceStatus = "idle" | "listening" | "denied" | "unavailable" | "error"

const ANDROID_ON_DEVICE_SERVICE = "com.google.android.as"

// Errors that mean the on-device recognizer can't serve this request (no offline
// model installed, simulator, unsupported locale) rather than that the user said
// nothing — worth one retry through the platform recognizer.
const ON_DEVICE_FAILURES: ExpoSpeechRecognitionErrorCode[] = [
  "service-not-allowed",
  "language-not-supported",
  "audio-capture",
  "client",
  "unknown",
]

// Speech-to-text for the Pouring field. Prefers on-device recognition so audio
// never leaves the phone, matching the app's privacy-first principle; falls back
// to the platform recognizer only when on-device isn't available.
export function useVoiceInput(onTranscript: (text: string, isFinal: boolean) => void) {
  const [status, setStatus] = useState<VoiceStatus>("idle")
  const [error, setError] = useState<ExpoSpeechRecognitionErrorCode | null>(null)
  // null until the permission check resolves — the mic stays hidden until then
  // rather than appearing and then vanishing.
  const [available, setAvailable] = useState<boolean | null>(null)
  const onTranscriptRef = useRef(onTranscript)
  onTranscriptRef.current = onTranscript
  const onDevice = useRef(false)
  const stopping = useRef(false)

  // Offer voice input unless we know it can't work: an undetermined permission
  // still lets the first tap show the system prompt, but a settled denial means
  // there's nothing the mic button could do.
  const refreshAvailability = useCallback(async () => {
    try {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setAvailable(false)
        return
      }
      const perm = await ExpoSpeechRecognitionModule.getPermissionsAsync()
      setAvailable(perm.granted || perm.canAskAgain)
    } catch {
      setAvailable(false)
    }
  }, [])

  // Re-check on resume so enabling the mic in Settings brings the button back.
  useEffect(() => {
    refreshAvailability()
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshAvailability()
    })
    return () => sub.remove()
  }, [refreshAvailability])

  const begin = (preferOnDevice: boolean) => {
    onDevice.current = preferOnDevice
    stopping.current = false
    setError(null)
    setStatus("listening")
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: true,
      requiresOnDeviceRecognition: preferOnDevice,
    })
  }

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript ?? ""
    if (transcript) onTranscriptRef.current(transcript, event.isFinal)
  })

  useSpeechRecognitionEvent("end", () => {
    stopping.current = false
    setStatus((s) => (s === "listening" ? "idle" : s))
  })

  useSpeechRecognitionEvent("error", (event) => {
    if (__DEV__) console.warn("[voice] error", event.error, event.message, event.code)

    // Our own stop() finalising, not a failure the user needs to see.
    if (event.error === "aborted" || stopping.current) return

    if (event.error === "not-allowed") {
      setStatus("denied")
      return
    }

    // On-device recognition failed on its own terms — retry over the platform
    // recognizer once before telling the user voice input is broken.
    if (onDevice.current && ON_DEVICE_FAILURES.includes(event.error)) {
      onDevice.current = false
      setTimeout(() => begin(false), 300)
      return
    }

    setError(event.error)
    setStatus("error")
  })

  const start = async () => {
    try {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setStatus("unavailable")
        return
      }
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
      if (!perm.granted) {
        setAvailable(perm.canAskAgain)
        setStatus("denied")
        return
      }
      // Android reports on-device support even when no offline model is
      // installed; only trust it when an English model is actually downloaded.
      let preferOnDevice = ExpoSpeechRecognitionModule.supportsOnDeviceRecognition()
      if (preferOnDevice && Platform.OS === "android") {
        const locales = await ExpoSpeechRecognitionModule.getSupportedLocales({
          androidRecognitionServicePackage: ANDROID_ON_DEVICE_SERVICE,
        }).catch(() => null)
        preferOnDevice = !!locales?.installedLocales.some((l) => l.toLowerCase().startsWith("en"))
      }
      begin(preferOnDevice)
    } catch {
      setStatus("error")
    }
  }

  const stop = () => {
    stopping.current = true
    ExpoSpeechRecognitionModule.stop()
    setStatus((s) => (s === "listening" ? "idle" : s))
  }

  return {
    status,
    error,
    available: available === true,
    isListening: status === "listening",
    start,
    stop,
  }
}
