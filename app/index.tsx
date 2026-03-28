import { useState, useEffect, useRef, type ReactNode } from "react"
import { TextInput, ScrollView, Animated } from "react-native"
import styled from "@emotion/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/theme/ThemeContext"

const Container = styled.View({
  flex: 1,
  justifyContent: "center",
  paddingHorizontal: 24,
})

const Title = styled.Text({
  fontSize: 32,
  fontFamily: "CormorantGaramond_600SemiBold",
  textAlign: "center",
  marginBottom: 24,
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
  bottom: -56,
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

function FadeIn({ children }: { children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(opacity.current, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [])

  return <Animated.View style={{ opacity: opacity.current }}>{children}</Animated.View>
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
  const [submitted, setSubmitted] = useState(false)
  const title = useTypewriter("What\u2019s on your heart?", 45)
  const titleDuration = "What\u2019s on your heart?".length * 45
  const placeholder = useTypewriter("Let it out...", 45, titleDuration + 300)

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
    <Container style={{ backgroundColor: theme.background }}>
      <Title style={{ color: theme.accent }}>{title.text}</Title>
      {title.done && (
        <FadeIn>
          <InputWrapper>
            <InputContainer style={{ borderColor: theme.border }}>
              <Input multiline value={text} onChangeText={setText} style={{ color: theme.text }} />
              {text.length === 0 && placeholder.text.length > 0 && (
                <PlaceholderOverlay style={{ color: theme.textSecondary }} pointerEvents="none">
                  {placeholder.text}
                </PlaceholderOverlay>
              )}
            </InputContainer>
            {text.length > 0 && (
              <FadeIn>
                <SubmitOuter>
                  <SubmitButton
                    style={{ backgroundColor: theme.accent }}
                    onPress={() => setSubmitted(true)}
                  >
                    <SubmitText style={{ color: theme.background }}>Pour</SubmitText>
                  </SubmitButton>
                </SubmitOuter>
              </FadeIn>
            )}
          </InputWrapper>
        </FadeIn>
      )}
    </Container>
  )
}
