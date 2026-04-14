import { useRef, useCallback } from "react"
import { View } from "react-native"
import styled from "@emotion/native"
import { LinearGradient } from "expo-linear-gradient"
import ViewShot from "react-native-view-shot"
import * as Sharing from "expo-sharing"
import { useTheme } from "@/theme/ThemeContext"

const Card = styled(LinearGradient)({
  width: 360,
  paddingVertical: 48,
  paddingHorizontal: 32,
  alignItems: "center",
  justifyContent: "center",
})

const QuoteMark = styled.Text({
  fontSize: 48,
  fontFamily: "CormorantGaramond_600SemiBold",
  lineHeight: 48,
  marginBottom: -4,
})

const VerseText = styled.Text({
  fontSize: 22,
  fontFamily: "CormorantGaramond_600SemiBold",
  lineHeight: 34,
  letterSpacing: 0.3,
  textAlign: "center",
})

const VerseRef = styled.Text({
  fontSize: 13,
  fontFamily: "Nunito_400Regular",
  marginTop: 16,
  letterSpacing: 0.5,
})

const AppName = styled.Text({
  fontSize: 12,
  fontFamily: "CormorantGaramond_600SemiBold",
  letterSpacing: 2,
  marginTop: 32,
  opacity: 0.4,
})

type Props = {
  verseText: string
  verseRef: string
}

export function useShareVerse({ verseText, verseRef }: Props) {
  const { theme } = useTheme()
  const viewShotRef = useRef<ViewShot>(null)

  const share = useCallback(async () => {
    if (!viewShotRef.current?.capture) return
    const uri = await viewShotRef.current.capture()
    await Sharing.shareAsync(uri, { mimeType: "image/png" })
  }, [])

  const renderShareImage = () => (
    <View style={{ position: "absolute", left: -9999 }}>
      <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
        <Card colors={theme.backgroundGradient}>
          <QuoteMark style={{ color: theme.accent }}>&ldquo;</QuoteMark>
          <VerseText style={{ color: theme.text }}>{verseText}</VerseText>
          <VerseRef style={{ color: theme.textSecondary }}>&mdash; {verseRef}</VerseRef>
          <AppName style={{ color: theme.text }}>MANNA</AppName>
        </Card>
      </ViewShot>
    </View>
  )

  return { share, renderShareImage }
}
