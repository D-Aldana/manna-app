import { useState, useEffect, useRef, type ReactNode } from "react"
import { TextInput, ScrollView, Animated } from "react-native"
import styled from "@emotion/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/theme/ThemeContext"

const Container = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 24,
  paddingBottom: 48,
})

const Title = styled.Text({
  fontSize: 32,
  fontFamily: "CormorantGaramond_600SemiBold",
  textAlign: "center",
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
  paddingHorizontal: 32,
  borderRadius: 24,
})

const SubmitText = styled.Text({
  fontSize: 16,
  fontFamily: "Nunito_600SemiBold",
})

const ResponseContainer = styled(ScrollView)({
  flex: 1,
  paddingHorizontal: 24,
})

const Verse = styled.Text({
  fontSize: 22,
  fontFamily: "CormorantGaramond_600SemiBold",
  lineHeight: 32,
  marginBottom: 16,
})

const Commentary = styled.Text({
  fontSize: 16,
  fontFamily: "Nunito_400Regular",
  lineHeight: 26,
  marginBottom: 16,
})

const Prayer = styled.Text({
  fontSize: 16,
  fontFamily: "CormorantGaramond_400Regular",
  fontStyle: "italic",
  lineHeight: 26,
  marginBottom: 16,
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
})

const LoadingContainer = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
})

const SelahText = styled.Text({
  fontSize: 40,
  fontFamily: "CormorantGaramond_600SemiBold",
  fontStyle: "italic",
})

const SelahSubtext = styled.Text({
  fontSize: 14,
  fontFamily: "Nunito_400Regular",
  marginTop: 8,
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
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
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
    }).start(() => {
      setLoading(true)
      screenOpacity.current.setValue(1)
      setTimeout(() => {
        setLoading(false)
        setSubmitted(true)
      }, 3000)
    })
  }

  if (loading) {
    return (
      <LoadingContainer style={{ backgroundColor: theme.background }}>
        <FadeIn>
          <PulsingSelah color={theme.accent} subtextColor={theme.textSecondary} />
        </FadeIn>
      </LoadingContainer>
    )
  }

  if (submitted) {
    return (
      <Container style={{ backgroundColor: theme.background, paddingTop: insets.top + 48 }}>
        <ResponseContainer>
          <Verse style={{ color: theme.text }}>
            &ldquo;Come to me, all you who are weary and burdened, and I will give you rest.&rdquo;
            {"\n"}— Matthew 11:28 (NIV)
          </Verse>
          <Commentary style={{ color: theme.textSecondary }}>
            Jesus speaks these words as an invitation to anyone carrying the weight of life&apos;s
            struggles. He doesn&apos;t ask you to have it all figured out first — He simply asks you
            to come. The rest He offers isn&apos;t just physical; it&apos;s a deep, soul-level peace
            that comes from trusting Him with your burdens.
          </Commentary>
          <Prayer style={{ color: theme.accent }}>
            Lord, I bring my weariness to You. Help me to lay down what I&apos;ve been carrying and
            find true rest in Your presence. Amen.
          </Prayer>
          <BackButton
            style={{ backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }}
            onPress={() => {
              setSubmitted(false)
              setText("")
            }}
          >
            <BackText style={{ color: theme.text }}>New Pouring</BackText>
          </BackButton>
        </ResponseContainer>
      </Container>
    )
  }

  return (
    <Animated.View style={{ flex: 1, opacity: screenOpacity.current }}>
      <Container style={{ backgroundColor: theme.background }}>
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
                    <SubmitButton style={{ backgroundColor: theme.accent }} onPress={handleSubmit}>
                      <SubmitText style={{ color: theme.background }}>Pour</SubmitText>
                    </SubmitButton>
                  </SubmitOuter>
                </Fade>
              </InputWrapper>
            </FadeIn>
          </InputSection>
        )}
      </Container>
    </Animated.View>
  )
}
