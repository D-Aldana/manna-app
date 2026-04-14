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
  Share,
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

const STORAGE_KEY = "manna_current_reflection"

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

const InputSection = styled.View({
  alignSelf: "stretch",
  marginTop: 32,
})

const InputWrapper = styled.View({})

const InputContainer = styled.View({
  borderWidth: 3,
  borderRadius: 24,
  minHeight: 60,
  justifyContent: "center",
  paddingHorizontal: 18,
  paddingVertical: 16,
})

const PlaceholderOverlay = styled.Text({
  position: "absolute",
  left: 18,
  fontSize: 18,
  fontFamily: "Nunito_400Regular",
})

const Input = styled(TextInput)({
  fontSize: 18,
  fontFamily: "Nunito_400Regular",
  padding: 0,
  margin: 0,
})

const SubmitOuter = styled.View({
  position: "absolute",
  bottom: -65,
  left: 0,
  right: 0,
  alignItems: "center",
})

const SubmitButton = styled.Pressable({
  paddingVertical: 14,
  paddingHorizontal: 42,
  borderRadius: 24,
})

const SubmitText = styled.Text({
  fontSize: 16,
  fontFamily: "Nunito_600SemiBold",
  letterSpacing: 1,
})

const ResponseContainer = styled(ScrollView)({
  flex: 1,
  paddingHorizontal: 24,
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

function Fade({ visible, children }: { visible: boolean; children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(opacity.current, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [visible])

  return (
    <Animated.View style={{ opacity: opacity.current }} pointerEvents={visible ? "auto" : "none"}>
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
  const [error, setError] = useState("")
  const [restoring, setRestoring] = useState(true)
  const titleFullText = "What\u2019s on your heart?"
  const title = useTypewriter(restoring ? "" : titleFullText, 45)
  const titleDuration = titleFullText.length * 45
  const placeholder = useTypewriter(restoring ? "" : "Pour it out...", 45, titleDuration + 200)

  const screenOpacity = useRef(new Animated.Value(1))
  const inputOpacity = useRef(new Animated.Value(0))

  useEffect(() => {
    if (title.done) {
      Animated.timing(inputOpacity.current, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start()
    }
  }, [title.done])

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
    Animated.timing(screenOpacity.current, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(async () => {
      setLoading(true)
      screenOpacity.current.setValue(1)
      setError("")
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
    await AsyncStorage.removeItem(STORAGE_KEY)
  }

  const handleShare = () => {
    if (!response) return
    Share.share({
      message: `\u201C${response.verse_text}\u201D\n\u2014 ${response.verse_ref}`,
    })
  }

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
    const isCredits = error.includes("credit") || error.includes("billing") || error.includes("429")
    const isOverloaded = error.includes("529") || error.includes("overloaded")

    const title = isNetwork
      ? "No connection"
      : isCredits
        ? "Service unavailable"
        : isOverloaded
          ? "A moment of rest"
          : "Something went wrong"

    const message = isNetwork
      ? "It looks like you\u2019re offline. Check your connection and try again."
      : isCredits
        ? "The reflection service is temporarily unavailable. Please try again later."
        : isOverloaded
          ? "The service is resting under heavy load. Please try again in a moment."
          : "We weren\u2019t able to complete your reflection. Your words are still here."

    const icon = isNetwork ? "wifi-off" : isCredits ? "cloud-off" : "cloud-off"

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
            name={icon as "wifi-off" | "cloud-off"}
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
    return (
      <GradientBg colors={theme.backgroundGradient}>
        <MenuButton
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          style={{ top: insets.top + 8 }}
        >
          <Feather name="menu" size={20} color={theme.textSecondary} />
        </MenuButton>
        <Container style={{ paddingTop: insets.top + 48, justifyContent: "flex-start" }}>
          <ResponseContainer>
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
                onPress={handleShare}
              >
                <BackText style={{ color: theme.text }}>Share Verse</BackText>
              </BackButton>
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
      </GradientBg>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <MenuButton
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={{ top: insets.top + 8 }}
      >
        <Feather name="menu" size={20} color={theme.textSecondary} />
      </MenuButton>
      <ThemeToggleButton onPress={toggleTheme} style={{ top: insets.top + 8 }}>
        <Feather name={mode === "light" ? "sun" : "moon"} size={20} color={theme.textSecondary} />
      </ThemeToggleButton>
      <Animated.View style={{ flex: 1, opacity: screenOpacity.current }}>
        <GradientBg colors={theme.backgroundGradient}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <Container
              onStartShouldSetResponder={() => {
                Keyboard.dismiss()
                return false
              }}
            >
              <Title style={{ color: theme.accent }}>{title.text}</Title>
              <Animated.View
                style={{ opacity: inputOpacity.current, alignSelf: "stretch" }}
                pointerEvents={title.done ? "auto" : "none"}
              >
                <InputSection>
                  <InputWrapper>
                    <InputContainer style={{ borderColor: theme.border }}>
                      <Input
                        multiline
                        submitBehavior="submit"
                        returnKeyType="send"
                        onSubmitEditing={() => text.length > 0 && handleSubmit()}
                        value={text}
                        onChangeText={setText}
                        style={{ color: theme.accent }}
                      />
                      {text.length === 0 && placeholder.text.length > 0 && (
                        <PlaceholderOverlay style={{ color: theme.accent }} pointerEvents="none">
                          {placeholder.text}
                        </PlaceholderOverlay>
                      )}
                    </InputContainer>
                    <Fade visible={text.length > 0}>
                      <SubmitOuter>
                        <SubmitButton
                          style={{ backgroundColor: theme.accent }}
                          onPress={handleSubmit}
                        >
                          <SubmitText style={{ color: theme.background }}>Pour</SubmitText>
                        </SubmitButton>
                      </SubmitOuter>
                    </Fade>
                  </InputWrapper>
                </InputSection>
              </Animated.View>
            </Container>
          </KeyboardAvoidingView>
        </GradientBg>
      </Animated.View>
    </View>
  )
}
