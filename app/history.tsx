import styled from "@emotion/native"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "@/theme/ThemeContext"

const GradientBg = styled(LinearGradient)({
  flex: 1,
})

const Container = styled.View({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
})

const Title = styled.Text({
  fontSize: 24,
  fontFamily: "CormorantGaramond_600SemiBold",
})

export default function HistoryScreen() {
  const { theme } = useTheme()

  return (
    <GradientBg colors={theme.backgroundGradient}>
      <Container>
        <Title style={{ color: theme.text }}>History</Title>
      </Container>
    </GradientBg>
  )
}
