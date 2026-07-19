import { useState } from "react"
import { Platform, Pressable } from "react-native"
import styled from "@emotion/native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { Redirect, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import { useTheme } from "@/theme/ThemeContext"
import { CONTENT_MAX_WIDTH } from "@/theme/layout"
import { openDonationPage } from "@/lib/donations"

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
  justifyContent: "center",
  alignItems: "center",
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
  marginBottom: 36,
})

const SupportButton = styled.Pressable({
  alignSelf: "stretch",
  paddingVertical: 16,
  borderRadius: 24,
  alignItems: "center",
  marginBottom: 14,
})

const SupportText = styled.Text({
  fontSize: 16,
  fontFamily: "Nunito_600SemiBold",
  letterSpacing: 0.5,
})

const LaterButton = styled.Pressable({
  paddingVertical: 12,
  alignItems: "center",
})

const LaterText = styled.Text({
  fontSize: 15,
  fontFamily: "Nunito_400Regular",
  letterSpacing: 0.3,
})

const ErrorText = styled.Text({
  fontSize: 13,
  fontFamily: "Nunito_400Regular",
  textAlign: "center",
  marginTop: 12,
})

export default function SupportScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [failed, setFailed] = useState(false)

  // Tip Jar is unavailable on iOS to comply with App Store Guideline 3.1.1 (donations require IAP)
  if (Platform.OS === "ios") return <Redirect href="/" />

  const handleSupport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setFailed(false)
    const ok = await openDonationPage()
    if (!ok) setFailed(true)
  }

  return (
    <GradientBg colors={theme.backgroundGradient}>
      <BackButton onPress={() => router.back()} style={{ top: insets.top + 8 }}>
        <Feather name="arrow-left" size={20} color={theme.textSecondary} />
      </BackButton>
      <Container>
        <IconCircle style={{ backgroundColor: theme.surface }}>
          <Feather name="gift" size={36} color={theme.accent} />
        </IconCircle>
        <Title style={{ color: theme.text }}>Support Manna</Title>
        <Body style={{ color: theme.textSecondary }}>
          Manna is free, and always will be. It runs on a small monthly cost for the servers and
          care that keep it going. If it has been a comfort to you, your support helps keep it
          running and ad-free.
        </Body>
        <SupportButton style={{ backgroundColor: theme.accent }} onPress={handleSupport}>
          <SupportText style={{ color: theme.background }}>Help keep Manna running</SupportText>
        </SupportButton>
        <LaterButton onPress={() => router.back()}>
          <LaterText style={{ color: theme.textSecondary }}>Maybe later</LaterText>
        </LaterButton>
        {failed && (
          <ErrorText style={{ color: theme.textSecondary }}>
            Couldn&apos;t open the page. Please check your connection.
          </ErrorText>
        )}
      </Container>
    </GradientBg>
  )
}
