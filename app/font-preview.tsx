import { ScrollView } from "react-native"
import styled from "@emotion/native"
import { useFonts } from "expo-font"
import { Lora_400Regular, Lora_700Bold } from "@expo-google-fonts/lora"
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond"
import { PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display"
import { Inter_400Regular } from "@expo-google-fonts/inter"
import { Nunito_400Regular } from "@expo-google-fonts/nunito"
import { Karla_400Regular } from "@expo-google-fonts/karla"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/theme/ThemeContext"

const Container = styled(ScrollView)({
  flex: 1,
  paddingHorizontal: 24,
})

const PairingCard = styled.View({
  marginBottom: 32,
  padding: 20,
  borderRadius: 16,
  borderWidth: 1,
})

const Label = styled.Text({
  fontSize: 12,
  fontWeight: "bold",
  letterSpacing: 1,
  textTransform: "uppercase",
  marginBottom: 12,
})

const TitleText = styled.Text({
  fontSize: 26,
  marginBottom: 8,
})

const BodyText = styled.Text({
  fontSize: 16,
  lineHeight: 26,
})

const verse = `"Come to me, all you who are weary and burdened, and I will give you rest."`
const body =
  "Jesus speaks these words as an invitation to anyone carrying the weight of life's struggles. He simply asks you to come."

export default function FontPreviewScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  const [loaded] = useFonts({
    Lora_400Regular,
    Lora_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Nunito_400Regular,
    Karla_400Regular,
  })

  if (!loaded) return null

  const pairings = [
    {
      label: "1. Cormorant Garamond + Nunito",
      titleFont: "CormorantGaramond_600SemiBold",
      bodyFont: "Nunito_400Regular",
    },
    {
      label: "2. Lora + Inter",
      titleFont: "Lora_700Bold",
      bodyFont: "Inter_400Regular",
    },
    {
      label: "3. Playfair Display + Karla",
      titleFont: "PlayfairDisplay_700Bold",
      bodyFont: "Karla_400Regular",
    },
    {
      label: "4. Cormorant Garamond + Inter",
      titleFont: "CormorantGaramond_600SemiBold",
      bodyFont: "Inter_400Regular",
    },
    {
      label: "5. Lora + Nunito",
      titleFont: "Lora_700Bold",
      bodyFont: "Nunito_400Regular",
    },
    {
      label: "6. Playfair Display + Nunito",
      titleFont: "PlayfairDisplay_700Bold",
      bodyFont: "Nunito_400Regular",
    },
  ]

  return (
    <Container
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40 }}
    >
      {pairings.map((p) => (
        <PairingCard
          key={p.label}
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
          <Label style={{ color: theme.accent }}>{p.label}</Label>
          <TitleText style={{ color: theme.text, fontFamily: p.titleFont }}>{verse}</TitleText>
          <BodyText style={{ color: theme.textSecondary, fontFamily: p.bodyFont }}>{body}</BodyText>
        </PairingCard>
      ))}
    </Container>
  )
}
