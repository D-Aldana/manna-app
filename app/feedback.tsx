import { useState } from "react"
import {
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Linking,
} from "react-native"
import styled from "@emotion/native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import { useTheme } from "@/theme/ThemeContext"
import { CONTENT_MAX_WIDTH } from "@/theme/layout"
import { sendFeedback } from "@/lib/feedback"

const MAX_CHARS = 4000
const CONTACT_EMAIL = "manna@builtbydustin.dev"

const GradientBg = styled(LinearGradient)({
  flex: 1,
})

const BackButton = styled(Pressable)({
  position: "absolute",
  left: 16,
  zIndex: 10,
  padding: 8,
})

const Container = styled.View({
  flex: 1,
  paddingHorizontal: 32,
  width: "100%",
  maxWidth: CONTENT_MAX_WIDTH,
  alignSelf: "center",
})

const IconCircle = styled.View({
  width: 88,
  height: 88,
  borderRadius: 44,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 28,
  alignSelf: "center",
})

const Title = styled.Text({
  fontSize: 34,
  fontFamily: "CormorantGaramond_600SemiBold",
  letterSpacing: 0.5,
  textAlign: "center",
  marginBottom: 16,
})

const Body = styled.Text({
  fontSize: 16,
  fontFamily: "Nunito_400Regular",
  lineHeight: 26,
  letterSpacing: 0.2,
  textAlign: "center",
  marginBottom: 28,
})

const InputCard = styled.View({
  borderRadius: 24,
  borderWidth: 1,
  paddingHorizontal: 20,
  paddingVertical: 18,
  marginBottom: 20,
})

const FeedbackInput = styled(TextInput)({
  fontSize: 17,
  lineHeight: 26,
  fontFamily: "Nunito_400Regular",
  textAlignVertical: "top",
  minHeight: 160,
  padding: 0,
  margin: 0,
})

const SubmitButton = styled.Pressable({
  alignSelf: "stretch",
  paddingVertical: 16,
  borderRadius: 24,
  alignItems: "center",
  marginBottom: 14,
})

const SubmitText = styled.Text({
  fontSize: 16,
  fontFamily: "Nunito_600SemiBold",
  letterSpacing: 0.5,
})

const HelperText = styled.Text({
  fontSize: 13,
  fontFamily: "Nunito_400Regular",
  textAlign: "center",
  marginTop: 4,
})

const ContactSection = styled.View({
  alignItems: "center",
  marginTop: 28,
})

const DividerRow = styled.View({
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "stretch",
  marginBottom: 20,
})

const DividerLine = styled.View({
  flex: 1,
  height: 1,
})

const DividerLabel = styled.Text({
  fontSize: 12,
  fontFamily: "Nunito_600SemiBold",
  letterSpacing: 1.5,
  textTransform: "uppercase",
  marginHorizontal: 14,
})

const ContactRow = styled.Pressable({
  flexDirection: "row",
  alignItems: "center",
})

const ContactLabel = styled.Text({
  fontSize: 16,
  fontFamily: "Nunito_600SemiBold",
  letterSpacing: 0.3,
  marginLeft: 10,
})

export default function FeedbackScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)

  const canSend = text.trim().length > 0 && !sending

  const handleSend = async () => {
    if (!canSend) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Keyboard.dismiss()
    setSending(true)
    setError(false)
    try {
      await sendFeedback(text.trim())
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setSent(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  const handleContact = () => {
    Haptics.selectionAsync()
    Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => {})
  }

  if (sent) {
    return (
      <GradientBg colors={theme.backgroundGradient}>
        <BackButton onPress={() => router.back()} style={{ top: insets.top + 8 }}>
          <Feather name="arrow-left" size={20} color={theme.textSecondary} />
        </BackButton>
        <Container style={{ justifyContent: "center" }}>
          <IconCircle style={{ backgroundColor: theme.surface }}>
            <Feather name="check" size={36} color={theme.accent} />
          </IconCircle>
          <Title style={{ color: theme.text }}>Thank you</Title>
          <Body style={{ color: theme.textSecondary }}>
            Your message has been received. We read every note, and we’re grateful you took the time
            to share it.
          </Body>
          <SubmitButton style={{ backgroundColor: theme.accent }} onPress={() => router.back()}>
            <SubmitText style={{ color: theme.background }}>Done</SubmitText>
          </SubmitButton>
        </Container>
      </GradientBg>
    )
  }

  return (
    <GradientBg colors={theme.backgroundGradient}>
      <BackButton onPress={() => router.back()} style={{ top: insets.top + 8 }}>
        <Feather name="arrow-left" size={20} color={theme.textSecondary} />
      </BackButton>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Container style={{ justifyContent: "center", paddingTop: insets.top + 56 }}>
          <IconCircle style={{ backgroundColor: theme.surface }}>
            <Feather name="message-circle" size={36} color={theme.accent} />
          </IconCircle>
          <Title style={{ color: theme.text }}>Share Feedback</Title>
          <Body style={{ color: theme.textSecondary }}>
            Found something amiss, or have a thought to share? Tell us — your words help shape
            Manna.
          </Body>
          <InputCard style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
            <FeedbackInput
              multiline
              maxLength={MAX_CHARS}
              value={text}
              onChangeText={setText}
              placeholder="Write your message…"
              placeholderTextColor={theme.textSecondary}
              selectionColor={theme.accent}
              editable={!sending}
              style={{ color: theme.text }}
            />
          </InputCard>
          <SubmitButton
            disabled={!canSend}
            onPress={handleSend}
            style={{
              backgroundColor: canSend ? theme.accent : theme.surface,
              borderWidth: canSend ? 0 : 1,
              borderColor: theme.border,
            }}
          >
            {sending ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <SubmitText style={{ color: canSend ? theme.background : theme.textSecondary }}>
                Send
              </SubmitText>
            )}
          </SubmitButton>
          {error && (
            <HelperText style={{ color: theme.textSecondary }}>
              Couldn’t send your message. Please check your connection and try again.
            </HelperText>
          )}
          <ContactSection>
            <DividerRow>
              <DividerLine style={{ backgroundColor: theme.border }} />
              <DividerLabel style={{ color: theme.textSecondary }}>or email directly</DividerLabel>
              <DividerLine style={{ backgroundColor: theme.border }} />
            </DividerRow>
            <ContactRow onPress={handleContact} hitSlop={8}>
              <Feather name="mail" size={18} color={theme.accent} />
              <ContactLabel style={{ color: theme.accent }}>Email us instead</ContactLabel>
            </ContactRow>
          </ContactSection>
        </Container>
      </KeyboardAvoidingView>
    </GradientBg>
  )
}
