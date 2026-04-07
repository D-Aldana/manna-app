import { useState, useEffect, useRef, type ReactNode } from "react"
import { TextInput, ScrollView, Animated, View, Pressable } from "react-native"
import styled from "@emotion/native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "expo-router"
import { DrawerActions } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/theme/ThemeContext"
import { reflect } from "@/lib/reflect"
import { createEntry, updateEntry } from "@/lib/entries"

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
  position: "absolute",
  left: 24,
  right: 24,
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
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (speed <= 0) {
      setDisplayed(fullText)
      setDone(true)
      return
    }
    const timeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        i++
        setDisplayed(fullText.slice(0, i))
        if (i >= fullText.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
    }, delay)
    return () => clearTimeout(timeout)
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
  const [response, setResponse] = useState<{
    verse_text: string
    verse_ref: string
    commentary: string
    prayer: string
  } | null>(null)
  const titleFullText = "What\u2019s on your heart?"
  const title = useTypewriter(titleFullText, 45)
  const titleDuration = titleFullText.length * 45
  const placeholder = useTypewriter("Pour it out...", 45, titleDuration + 200)

  const screenOpacity = useRef(new Animated.Value(1))

  const handleSubmit = () => {
    Animated.timing(screenOpacity.current, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(async () => {
      setLoading(true)
      screenOpacity.current.setValue(1)
      try {
        const entry = await createEntry(text)
        const result = await reflect(text)
        await updateEntry(entry.id, result)
        setResponse(result)
      } catch (err) {
        console.error("Reflect failed:", err)
        setResponse(null)
      }
      setLoading(false)
      setSubmitted(true)
    })
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

  if (submitted && response) {
    return (
      <GradientBg colors={theme.backgroundGradient}>
        <Container style={{ paddingTop: insets.top + 48, justifyContent: "flex-start" }}>
          <ResponseContainer>
            <VerseContainer>
              <QuoteMark style={{ color: theme.accent }}>&ldquo;</QuoteMark>
              <VerseText style={{ color: theme.text }}>{response.verse_text}</VerseText>
              <VerseRef style={{ color: theme.textSecondary }}>— {response.verse_ref}</VerseRef>
            </VerseContainer>
            <Commentary style={{ color: theme.textSecondary }}>{response.commentary}</Commentary>
            <Prayer style={{ color: theme.accent }}>{response.prayer}</Prayer>
            <BackButton
              style={{ backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }}
              onPress={() => {
                setSubmitted(false)
                setResponse(null)
                setText("")
              }}
            >
              <BackText style={{ color: theme.text }}>New Pouring</BackText>
            </BackButton>
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
          <Container>
            <Title style={{ color: theme.accent }}>{title.text}</Title>
            {title.done && (
              <InputSection style={{ top: "55%" }}>
                <FadeIn>
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
                </FadeIn>
              </InputSection>
            )}
          </Container>
        </GradientBg>
      </Animated.View>
    </View>
  )
}
