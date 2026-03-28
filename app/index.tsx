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

const InputWrapper = styled.View({})

const Input = styled(TextInput)({
  fontSize: 18,
  lineHeight: 28,
  textAlignVertical: "center",
  padding: 16,
  borderWidth: 1,
  borderRadius: 24,
  minHeight: 65,
})

const SubmitWrapper = styled.View({
  alignSelf: "center",
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
  fontWeight: "600",
})

const ResponseContainer = styled(ScrollView)({
  flex: 1,
  paddingHorizontal: 24,
})

const Verse = styled.Text({
  fontSize: 20,
  fontWeight: "bold",
  lineHeight: 30,
  marginBottom: 16,
})

const Commentary = styled.Text({
  fontSize: 16,
  lineHeight: 26,
  marginBottom: 16,
})

const Prayer = styled.Text({
  fontSize: 16,
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
  fontWeight: "600",
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

export default function PouringScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const [text, setText] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const showButton = text.length > 0

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
      <InputWrapper>
        <Input
          placeholder="What's on your heart..."
          placeholderTextColor={theme.textSecondary}
          multiline
          value={text}
          onChangeText={setText}
          style={{ color: theme.text, borderColor: theme.border }}
        />
        {showButton && (
          <FadeIn>
            <SubmitWrapper>
              <SubmitButton
                style={{ backgroundColor: theme.accent }}
                onPress={() => setSubmitted(true)}
              >
                <SubmitText style={{ color: theme.background }}>Pour</SubmitText>
              </SubmitButton>
            </SubmitWrapper>
          </FadeIn>
        )}
      </InputWrapper>
    </Container>
  )
}
