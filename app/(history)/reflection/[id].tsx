import { useState, useEffect } from "react"
import { ScrollView, Pressable, Alert } from "react-native"
import styled from "@emotion/native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/theme/ThemeContext"
import { getEntry, deleteEntry, type Entry } from "@/lib/entries"

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
  justifyContent: "flex-start",
  alignItems: "center",
  paddingHorizontal: 24,
  paddingBottom: 48,
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

const ActionButton = styled.Pressable({
  alignSelf: "center",
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 24,
  marginBottom: 16,
})

const ActionText = styled.Text({
  fontSize: 16,
  fontFamily: "Nunito_600SemiBold",
  letterSpacing: 0.5,
})

const LoadingContainer = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
})

const LoadingText = styled.Text({
  fontSize: 18,
  fontFamily: "CormorantGaramond_600SemiBold",
})

export default function ReflectionScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [entry, setEntry] = useState<Entry | null>(null)

  useEffect(() => {
    if (id) {
      getEntry(id).then(setEntry)
    }
  }, [id])

  const handleDelete = () => {
    Alert.alert("Delete Reflection", "Are you sure you want to delete this reflection?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!id) return
          await deleteEntry(id)
          router.back()
        },
      },
    ])
  }

  if (!entry) {
    return (
      <GradientBg colors={theme.backgroundGradient}>
        <LoadingContainer>
          <LoadingText style={{ color: theme.textSecondary }}>Loading...</LoadingText>
        </LoadingContainer>
      </GradientBg>
    )
  }

  return (
    <GradientBg colors={theme.backgroundGradient}>
      <BackButton onPress={() => router.back()} style={{ top: insets.top + 8 }}>
        <Feather name="arrow-left" size={20} color={theme.textSecondary} />
      </BackButton>
      <Container style={{ paddingTop: insets.top + 48 }}>
        <ResponseContainer>
          <VerseContainer>
            <QuoteMark style={{ color: theme.accent }}>&ldquo;</QuoteMark>
            <VerseText style={{ color: theme.text }}>{entry.verse_text}</VerseText>
            <VerseRef style={{ color: theme.textSecondary }}>— {entry.verse_ref}</VerseRef>
          </VerseContainer>
          <Commentary style={{ color: theme.textSecondary }}>{entry.commentary}</Commentary>
          <Prayer style={{ color: theme.accent }}>{entry.prayer}</Prayer>
          <ActionButton
            style={{ backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }}
            onPress={handleDelete}
          >
            <ActionText style={{ color: "#c44" }}>Delete</ActionText>
          </ActionButton>
        </ResponseContainer>
      </Container>
    </GradientBg>
  )
}
