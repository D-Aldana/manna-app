import { useRef, useState } from "react"
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition"

type VoiceStatus = "idle" | "listening" | "denied" | "unavailable" | "error"

// Speech-to-text for the Pouring field. Prefers on-device recognition so audio
// never leaves the phone, matching the app's privacy-first principle; falls back
// to the platform recognizer only when on-device isn't available.
export function useVoiceInput(onTranscript: (text: string, isFinal: boolean) => void) {
  const [status, setStatus] = useState<VoiceStatus>("idle")
  const onTranscriptRef = useRef(onTranscript)
  onTranscriptRef.current = onTranscript

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript ?? ""
    if (transcript) onTranscriptRef.current(transcript, event.isFinal)
  })

  useSpeechRecognitionEvent("end", () => {
    setStatus((s) => (s === "listening" ? "idle" : s))
  })

  useSpeechRecognitionEvent("error", (event) => {
    setStatus(event.error === "not-allowed" ? "denied" : "error")
  })

  const start = async () => {
    try {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setStatus("unavailable")
        return
      }
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
      if (!perm.granted) {
        setStatus("denied")
        return
      }
      setStatus("listening")
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        continuous: true,
        requiresOnDeviceRecognition: ExpoSpeechRecognitionModule.supportsOnDeviceRecognition(),
      })
    } catch {
      setStatus("error")
    }
  }

  const stop = () => {
    ExpoSpeechRecognitionModule.stop()
    setStatus((s) => (s === "listening" ? "idle" : s))
  }

  return { status, isListening: status === "listening", start, stop }
}
