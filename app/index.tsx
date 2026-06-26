import { useState, useEffect, useRef, type ReactNode } from "react"
import {
  TextInput,
  ScrollView,
  Animated,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native"
import styled from "@emotion/native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "expo-router"
import { DrawerActions } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"
import { useTheme } from "@/theme/ThemeContext"
import { reflect } from "@/lib/reflect"
import { createEntry, updateEntry } from "@/lib/entries"
import { useVoiceInput } from "@/lib/useVoiceInput"
import { useShareVerse } from "@/components/ShareVerseImage"

const STORAGE_KEY = "manna_current_reflection"

// Matches the reflect edge function's input cap; the server enforces the same
// limit as a backstop. Show a countdown once the user nears it.
const MAX_CHARS = 4000
const CHARS_WARN_AT = MAX_CHARS - 200

type ReflectionData = {
  input: string
  verse_text: string
  verse_ref: string
  commentary: string
  prayer: string
}

const GradientBg = styled(LinearGradient)({
  flex: 1,
})

const MenuButton = styled(Pressable)({
  position: "absolute",
  left: 16,
  zIndex: 10,
  padding: 8,
})

const ThemeToggleButton = styled(Pressable)({
  position: "absolute",
  right: 16,
  zIndex: 10,
  padding: 8,
})

const Container = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 24,
  paddingBottom: 48,
})

const Title = styled.Text({
  fontSize: 34,
  fontFamily: "CormorantGaramond_600SemiBold",
  textAlign: "center",
  letterSpacing: 0.5,
  lineHeight: 44,
})

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const promptSeeds = [
  { label: "I’m anxious about…", value: "I’m anxious about " },
  { label: "I’m grateful for…", value: "I’m grateful for " },
  { label: "I’m struggling with…", value: "I’m struggling with " },
  { label: "I need guidance on…", value: "I need guidance on " },
]

// Soft "light from above" wash to give the blank page atmosphere.
const GlowOverlay = styled(LinearGradient)({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "55%",
})

const WritingContainer = styled.View({
  flex: 1,
  paddingHorizontal: 28,
})

const PourTitle = styled.Text({
  fontSize: 32,
  fontFamily: "CormorantGaramond_600SemiBold",
  textAlign: "center",
  letterSpacing: 0.5,
  lineHeight: 42,
  minHeight: 42,
})

const InputCard = styled.View({
  flex: 1,
  marginTop: 24,
  borderRadius: 28,
  borderWidth: 1,
  paddingHorizontal: 22,
  paddingVertical: 22,
})

const WritingInput = styled(TextInput)({
  flex: 1,
  fontSize: 19,
  lineHeight: 30,
  fontFamily: "Nunito_400Regular",
  textAlignVertical: "top",
  padding: 0,
  margin: 0,
})

const Overlay = styled(Animated.View)({
  position: "absolute",
  top: 22,
  left: 22,
  right: 22,
})

const OverlayPlaceholder = styled.Text({
  fontSize: 19,
  lineHeight: 30,
  fontFamily: "Nunito_400Regular",
})

const ChipRow = styled.View({
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 24,
})

const Chip = styled.Pressable({
  borderWidth: 1,
  borderRadius: 18,
  paddingVertical: 9,
  paddingHorizontal: 14,
  marginRight: 8,
  marginBottom: 8,
})

const ChipText = styled.Text({
  fontSize: 14,
  fontFamily: "Nunito_400Regular",
  letterSpacing: 0.2,
})

const Footer = styled.View({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 28,
  paddingTop: 12,
})

const WordCount = styled.Text({
  fontSize: 13,
  fontFamily: "Nunito_400Regular",
  letterSpacing: 0.3,
})

const PourButton = styled.Pressable({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 14,
  paddingHorizontal: 26,
  borderRadius: 24,
})

const PourLabel = styled.Text({
  fontSize: 16,
  fontFamily: "Nunito_600SemiBold",
  letterSpacing: 1,
  marginRight: 8,
})

const FooterRight = styled.View({
  flexDirection: "row",
  alignItems: "center",
})

const MicButton = styled.Pressable({
  width: 52,
  height: 52,
  borderRadius: 26,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
})

const VoiceHint = styled.Text({
  fontSize: 13,
  fontFamily: "Nunito_400Regular",
  letterSpacing: 0.3,
  textAlign: "center",
  paddingHorizontal: 28,
  marginTop: 10,
})

const ResponseContainer = styled(ScrollView)({
  flex: 1,
  paddingHorizontal: 24,
})

const PouredRecap = styled.View({
  marginBottom: 28,
  paddingBottom: 22,
  borderBottomWidth: 1,
})

const PouredLabel = styled.Text({
  fontSize: 12,
  fontFamily: "Nunito_600SemiBold",
  letterSpacing: 1.5,
  textTransform: "uppercase",
  marginBottom: 10,
})

const PouredText = styled.Text({
  fontSize: 15,
  fontFamily: "CormorantGaramond_400Regular",
  fontStyle: "italic",
  lineHeight: 24,
  letterSpacing: 0.2,
})

const PouredToggle = styled.Text({
  fontSize: 13,
  fontFamily: "Nunito_600SemiBold",
  letterSpacing: 0.3,
  marginTop: 10,
})

const VerseContainer = styled.View({
  alignItems: "center",
  marginBottom: 28,
  paddingHorizontal: 8,
})

const QuoteMark = styled.Text({
  fontSize: 56,
  fontFamily: "CormorantGaramond_600SemiBold",
  lineHeight: 56,
  marginBottom: -8,
})

const VerseText = styled.Text({
  fontSize: 24,
  fontFamily: "CormorantGaramond_600SemiBold",
  lineHeight: 36,
  letterSpacing: 0.3,
  textAlign: "center",
})

const VerseRef = styled.Text({
  fontSize: 14,
  fontFamily: "Nunito_400Regular",
  marginTop: 12,
  letterSpacing: 0.5,
})

const Commentary = styled.Text({
  fontSize: 16,
  fontFamily: "Nunito_400Regular",
  lineHeight: 28,
  letterSpacing: 0.2,
  marginBottom: 24,
})

const Prayer = styled.Text({
  fontSize: 18,
  fontFamily: "CormorantGaramond_400Regular",
  fontStyle: "italic",
  lineHeight: 30,
  letterSpacing: 0.3,
  marginBottom: 24,
})

const BackButton = styled.Pressable({
  alignSelf: "center",
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 24,
  marginBottom: 16,
})

const BackText = styled.Text({
  fontSize: 16,
  fontFamily: "Nunito_600SemiBold",
  letterSpacing: 0.5,
})

const LoadingContainer = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
})

const SelahText = styled.Text({
  fontSize: 44,
  fontFamily: "CormorantGaramond_600SemiBold",
  fontStyle: "italic",
  letterSpacing: 2,
})

const SelahSubtext = styled.Text({
  fontSize: 14,
  fontFamily: "Nunito_400Regular",
  marginTop: 12,
  letterSpacing: 2,
})

const selahPhrases = [
  "be still...",
  "be present...",
  "breathe...",
  "rest here...",
  "wait in peace...",
]

function PulsingSelah({ color, subtextColor }: { color: string; subtextColor: string }) {
  const opacity = useRef(new Animated.Value(0.3))
  const [phraseIndex, setPhraseIndex] = useState(0)
  const subtextOpacity = useRef(new Animated.Value(1))

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity.current, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity.current, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    )
    pulse.start()
    return () => pulse.stop()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(subtextOpacity.current, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setPhraseIndex((prev) => (prev + 1) % selahPhrases.length)
        Animated.timing(subtextOpacity.current, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start()
      })
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  return (
    <Animated.View style={{ opacity: opacity.current, alignItems: "center" }}>
      <SelahText style={{ color }}>Selah</SelahText>
      <Animated.View style={{ opacity: subtextOpacity.current }}>
        <SelahSubtext style={{ color: subtextColor }}>{selahPhrases[phraseIndex]}</SelahSubtext>
      </Animated.View>
    </Animated.View>
  )
}

function FadeIn({ children }: { children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(opacity.current, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  return <Animated.View style={{ opacity: opacity.current }}>{children}</Animated.View>
}

function DelayedFadeIn({ delay = 0, children }: { delay?: number; children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0))
  const translateY = useRef(new Animated.Value(12))

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity.current, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY.current, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()
    }, delay)
    return () => clearTimeout(timeout)
  }, [delay])

  return (
    <Animated.View
      style={{ opacity: opacity.current, transform: [{ translateY: translateY.current }] }}
    >
      {children}
    </Animated.View>
  )
}

function useTypewriter(fullText: string, speed = 60, delay = 0) {
  const skip = !fullText || speed <= 0
  const [displayed, setDisplayed] = useState(skip ? fullText : "")
  const [done, setDone] = useState(skip)

  useEffect(() => {
    if (skip) return
    let cancelled = false
    let i = 0
    const start = Date.now() + delay

    function tick() {
      if (cancelled) return
      const elapsed = Date.now() - start
      if (elapsed < 0) {
        requestAnimationFrame(tick)
        return
      }
      const target = Math.min(Math.floor(elapsed / speed) + 1, fullText.length)
      if (target !== i) {
        i = target
        setDisplayed(fullText.slice(0, i))
      }
      if (i >= fullText.length) {
        setDone(true)
        return
      }
      requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
    return () => {
      cancelled = true
    }
  }, [fullText, speed, delay])

  return { text: displayed, done }
}

export default function PouringScreen() {
  const { theme, mode, toggleTheme } = useTheme()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [response, setResponse] = useState<ReflectionData | null>(null)
  const [saved, setSaved] = useState(false)
  const [inputExpanded, setInputExpanded] = useState(false)
  const [error, setError] = useState("")
  const [restoring, setRestoring] = useState(true)
  const titleFullText = "What\u2019s on your heart?"
  const title = useTypewriter(restoring ? "" : titleFullText, 45)
  const placeholder = useTypewriter(restoring ? "" : "Pour it out\u2026", 45, 600)
  const inputRef = useRef<TextInput>(null)

  const canPour = text.trim().length > 0
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const nearLimit = text.length >= CHARS_WARN_AT
  const charsLeft = MAX_CHARS - text.length

  const screenOpacity = useRef(new Animated.Value(1))
  const enter = useRef(new Animated.Value(0))
  const pour = useRef(new Animated.Value(0))

  // The writing surface is interactive immediately; this is ambiance, not a gate.
  useEffect(() => {
    if (!restoring) {
      Animated.timing(enter.current, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start()
    }
  }, [restoring])

  useEffect(() => {
    Animated.spring(pour.current, {
      toValue: canPour ? 1 : 0,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start()
  }, [canPour])

  const guideVisible = text.length === 0
  const guide = useRef(new Animated.Value(1))

  useEffect(() => {
    Animated.timing(guide.current, {
      toValue: guideVisible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start()
  }, [guideVisible])

  const handleSeed = (value: string) => {
    Haptics.selectionAsync()
    setText(value)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  // Speech-to-text: snapshot the text at start, then append the live transcript.
  const voiceBase = useRef("")
  const micPulse = useRef(new Animated.Value(0))
  const voice = useVoiceInput((transcript, isFinal) => {
    const base = voiceBase.current
    const joiner = base && !base.endsWith(" ") ? " " : ""
    const next = (base + joiner + transcript).slice(0, MAX_CHARS)
    setText(next)
    if (isFinal) voiceBase.current = next
  })

  useEffect(() => {
    if (voice.isListening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse.current, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(micPulse.current, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
      )
      loop.start()
      return () => loop.stop()
    }
    micPulse.current.setValue(0)
  }, [voice.isListening])

  const toggleVoice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (voice.isListening) {
      voice.stop()
      return
    }
    Keyboard.dismiss()
    voiceBase.current = text
    voice.start()
  }

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        const data = JSON.parse(stored) as ReflectionData
        setResponse(data)
        setText(data.input)
        setSubmitted(true)
      }
      setRestoring(false)
    })
  }, [])

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Keyboard.dismiss()
    if (voice.isListening) voice.stop()
    Animated.timing(screenOpacity.current, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(async () => {
      setLoading(true)
      screenOpacity.current.setValue(1)
      setError("")
      setInputExpanded(false)
      try {
        const result = await reflect(text)
        const reflection = { input: text, ...result }
        setResponse(reflection)
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reflection))
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : JSON.stringify(err)
        console.error("Reflect failed:", message)
        setError(message)
        setResponse(null)
      }
      setLoading(false)
      setSubmitted(true)
      setSaved(false)
    })
  }

  const handleSave = async () => {
    if (!response) return
    try {
      const entry = await createEntry(response.input)
      await updateEntry(entry.id, {
        verse_text: response.verse_text,
        verse_ref: response.verse_ref,
        commentary: response.commentary,
        prayer: response.prayer,
      })
      setSaved(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : JSON.stringify(err)
      console.error("Save failed:", message)
    }
  }

  const handleNewPouring = async () => {
    setSubmitted(false)
    setResponse(null)
    setText("")
    setSaved(false)
    setInputExpanded(false)
    await AsyncStorage.removeItem(STORAGE_KEY)
  }

  const { share: handleShare, renderShareImage } = useShareVerse({
    verseText: response?.verse_text ?? "",
    verseRef: response?.verse_ref ?? "",
  })

  if (restoring) {
    return <GradientBg colors={theme.backgroundGradient} style={{ flex: 1 }} />
  }

  if (loading) {
    return (
      <GradientBg colors={theme.backgroundGradient}>
        <LoadingContainer>
          <FadeIn>
            <PulsingSelah color={theme.accent} subtextColor={theme.textSecondary} />
          </FadeIn>
        </LoadingContainer>
      </GradientBg>
    )
  }

  if (submitted && error) {
    const isNetwork =
      error.includes("Network") || error.includes("fetch") || error.includes("Failed")
    const isRateLimited = error.includes("429") || error.includes("Too many requests")
    const isDailyLimit = error.includes("503") || error.includes("Daily limit")
    const isCredits = error.includes("credit") || error.includes("billing")
    const isOverloaded = error.includes("529") || error.includes("overloaded")

    const title = isNetwork
      ? "No connection"
      : isRateLimited
        ? "A moment of stillness"
        : isDailyLimit
          ? "Resting for today"
          : isCredits
            ? "Service unavailable"
            : isOverloaded
              ? "A moment of rest"
              : "Something went wrong"

    const message = isNetwork
      ? "It looks like you\u2019re offline. Check your connection and try again."
      : isRateLimited
        ? "You\u2019ve poured out many times in a short while. Rest a moment, then return when you\u2019re ready."
        : isDailyLimit
          ? "Manna is resting for today. Please return tomorrow to pour out your heart."
          : isCredits
            ? "The reflection service is temporarily unavailable. Please try again later."
            : isOverloaded
              ? "The service is resting under heavy load. Please try again in a moment."
              : "We weren\u2019t able to complete your reflection. Your words are still here."

    const icon = isNetwork ? "wifi-off" : isRateLimited || isDailyLimit ? "clock" : "cloud-off"

    return (
      <GradientBg colors={theme.backgroundGradient}>
        <MenuButton
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          style={{ top: insets.top + 8 }}
        >
          <Feather name="menu" size={20} color={theme.textSecondary} />
        </MenuButton>
        <Container style={{ paddingTop: insets.top + 48 }}>
          <Feather
            name={icon as "wifi-off" | "cloud-off" | "clock"}
            size={40}
            color={theme.textSecondary}
            style={{ marginBottom: 24 }}
          />
          <Title style={{ color: theme.accent, marginBottom: 16 }}>{title}</Title>
          <Commentary style={{ color: theme.textSecondary, textAlign: "center", marginBottom: 32 }}>
            {message}
          </Commentary>
          <BackButton style={{ backgroundColor: theme.accent }} onPress={handleSubmit}>
            <BackText style={{ color: theme.background }}>Try Again</BackText>
          </BackButton>
          <BackButton
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
            }}
            onPress={handleNewPouring}
          >
            <BackText style={{ color: theme.text }}>Start Over</BackText>
          </BackButton>
        </Container>
      </GradientBg>
    )
  }

  if (submitted && response) {
    const inputIsLong = (response.input?.length ?? 0) > 180
    return (
      <GradientBg colors={theme.backgroundGradient}>
        <MenuButton
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          style={{ top: insets.top + 8 }}
        >
          <Feather name="menu" size={20} color={theme.textSecondary} />
        </MenuButton>
        <ThemeToggleButton onPress={handleShare} style={{ top: insets.top + 8 }}>
          <Feather name="share" size={20} color={theme.textSecondary} />
        </ThemeToggleButton>
        <Container style={{ paddingTop: insets.top + 48, justifyContent: "flex-start" }}>
          <ResponseContainer>
            {response.input ? (
              <DelayedFadeIn delay={100}>
                <PouredRecap style={{ borderBottomColor: theme.border }}>
                  <PouredLabel style={{ color: theme.textSecondary }}>You poured out</PouredLabel>
                  <PouredText
                    style={{ color: theme.textSecondary }}
                    numberOfLines={inputIsLong && !inputExpanded ? 4 : undefined}
                  >
                    {response.input}
                  </PouredText>
                  {inputIsLong ? (
                    <Pressable onPress={() => setInputExpanded((v) => !v)} hitSlop={8}>
                      <PouredToggle style={{ color: theme.accent }}>
                        {inputExpanded ? "Show less" : "Show more"}
                      </PouredToggle>
                    </Pressable>
                  ) : null}
                </PouredRecap>
              </DelayedFadeIn>
            ) : null}
            <DelayedFadeIn delay={200}>
              <VerseContainer>
                <QuoteMark style={{ color: theme.accent }}>&ldquo;</QuoteMark>
                <VerseText style={{ color: theme.text }}>{response.verse_text}</VerseText>
                <VerseRef style={{ color: theme.textSecondary }}>— {response.verse_ref}</VerseRef>
              </VerseContainer>
            </DelayedFadeIn>
            <DelayedFadeIn delay={800}>
              <Commentary style={{ color: theme.textSecondary }}>{response.commentary}</Commentary>
            </DelayedFadeIn>
            <DelayedFadeIn delay={1400}>
              <Prayer style={{ color: theme.accent }}>{response.prayer}</Prayer>
            </DelayedFadeIn>
            <DelayedFadeIn delay={2000}>
              {!saved ? (
                <BackButton style={{ backgroundColor: theme.accent }} onPress={handleSave}>
                  <BackText style={{ color: theme.background }}>Save to History</BackText>
                </BackButton>
              ) : (
                <BackText
                  style={{ color: theme.textSecondary, textAlign: "center", marginBottom: 16 }}
                >
                  Saved
                </BackText>
              )}
              <BackButton
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 1,
                }}
                onPress={handleNewPouring}
              >
                <BackText style={{ color: theme.text }}>New Pouring</BackText>
              </BackButton>
            </DelayedFadeIn>
          </ResponseContainer>
        </Container>
        {renderShareImage()}
      </GradientBg>
    )
  }

  const enterStyle = {
    opacity: enter.current,
    transform: [
      { translateY: enter.current.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
    ],
  }

  const voiceHint =
    voice.status === "listening"
      ? "Listening… tap the mic when you’re done"
      : voice.status === "denied"
        ? "Microphone access is off — enable it in Settings to speak"
        : voice.status === "unavailable"
          ? "Voice input isn’t available on this device"
          : voice.status === "error"
            ? "Didn’t catch that — tap the mic to try again"
            : null

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <GradientBg colors={theme.backgroundGradient}>
        <GlowOverlay
          pointerEvents="none"
          colors={[
            hexToRgba(theme.accent, mode === "light" ? 0.1 : 0.09),
            hexToRgba(theme.accent, 0),
          ]}
        />
        <Animated.View style={{ flex: 1, opacity: screenOpacity.current }}>
          <MenuButton
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={{ top: insets.top + 8 }}
          >
            <Feather name="menu" size={20} color={theme.textSecondary} />
          </MenuButton>
          <ThemeToggleButton onPress={toggleTheme} style={{ top: insets.top + 8 }}>
            <Feather
              name={mode === "light" ? "sun" : "moon"}
              size={20}
              color={theme.textSecondary}
            />
          </ThemeToggleButton>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <WritingContainer
              style={{ paddingTop: insets.top + 64 }}
              onStartShouldSetResponder={() => {
                Keyboard.dismiss()
                return false
              }}
            >
              <PourTitle style={{ color: theme.accent }}>{title.text}</PourTitle>
              <Animated.View style={[{ flex: 1 }, enterStyle]}>
                <InputCard
                  style={{
                    borderColor: theme.border,
                    backgroundColor: hexToRgba(theme.surface, mode === "light" ? 0.5 : 0.35),
                  }}
                >
                  <WritingInput
                    ref={inputRef}
                    multiline
                    maxLength={MAX_CHARS}
                    value={text}
                    onChangeText={setText}
                    selectionColor={theme.accent}
                    style={{ color: theme.text }}
                  />
                  <Overlay
                    pointerEvents={guideVisible ? "box-none" : "none"}
                    style={{ opacity: guide.current }}
                  >
                    {placeholder.text.length > 0 && (
                      <OverlayPlaceholder style={{ color: theme.textSecondary }}>
                        {placeholder.text}
                      </OverlayPlaceholder>
                    )}
                    <ChipRow>
                      {promptSeeds.map((seed) => (
                        <Chip
                          key={seed.value}
                          onPress={() => handleSeed(seed.value)}
                          style={{
                            borderColor: theme.border,
                            backgroundColor: hexToRgba(theme.surface, 0.6),
                          }}
                        >
                          <ChipText style={{ color: theme.textSecondary }}>{seed.label}</ChipText>
                        </Chip>
                      ))}
                    </ChipRow>
                  </Overlay>
                </InputCard>
              </Animated.View>
            </WritingContainer>
            <Animated.View style={enterStyle}>
              {voiceHint ? (
                <VoiceHint style={{ color: theme.textSecondary }}>{voiceHint}</VoiceHint>
              ) : null}
              <Footer style={{ paddingBottom: insets.bottom + 12 }}>
                <Animated.View
                  style={{
                    transform: [
                      {
                        scale: micPulse.current.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.12],
                        }),
                      },
                    ],
                  }}
                >
                  <MicButton
                    onPress={toggleVoice}
                    accessibilityLabel={
                      voice.isListening ? "Stop listening" : "Speak your reflection"
                    }
                    style={{
                      backgroundColor: voice.isListening ? theme.accent : "transparent",
                      borderColor: voice.isListening ? theme.accent : theme.border,
                    }}
                  >
                    <Feather
                      name="mic"
                      size={22}
                      color={voice.isListening ? theme.background : theme.accent}
                    />
                  </MicButton>
                </Animated.View>
                <FooterRight>
                  <WordCount
                    style={{
                      color: nearLimit ? theme.accent : theme.textSecondary,
                      opacity: nearLimit ? 0.9 : canPour ? 0.7 : 0,
                      marginRight: 14,
                    }}
                  >
                    {nearLimit
                      ? `${charsLeft} left`
                      : `${wordCount} ${wordCount === 1 ? "word" : "words"}`}
                  </WordCount>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          scale: pour.current.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.96, 1],
                          }),
                        },
                      ],
                      opacity: pour.current.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.45, 1],
                      }),
                    }}
                  >
                    <PourButton
                      disabled={!canPour}
                      onPress={handleSubmit}
                      style={{
                        backgroundColor: canPour ? theme.accent : theme.surface,
                        borderWidth: canPour ? 0 : 1,
                        borderColor: theme.border,
                      }}
                    >
                      <PourLabel
                        style={{ color: canPour ? theme.background : theme.textSecondary }}
                      >
                        Pour
                      </PourLabel>
                      <Feather
                        name="droplet"
                        size={16}
                        color={canPour ? theme.background : theme.textSecondary}
                      />
                    </PourButton>
                  </Animated.View>
                </FooterRight>
              </Footer>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </GradientBg>
    </View>
  )
}
