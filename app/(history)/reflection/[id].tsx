import { useState, useEffect, useRef } from "react"
import { ScrollView, Pressable, Modal, Animated, Share } from "react-native"
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

const ShareButton = styled(Pressable)({
  position: "absolute",
  right: 16,
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

const Overlay = styled.Pressable({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
})

const ModalCard = styled(Animated.View)({
  width: "80%",
  borderRadius: 24,
  padding: 32,
  alignItems: "center",
})

const ModalTitle = styled.Text({
  fontSize: 22,
  fontFamily: "CormorantGaramond_600SemiBold",
  marginBottom: 12,
  textAlign: "center",
})

const ModalBody = styled.Text({
  fontSize: 15,
  fontFamily: "Nunito_400Regular",
  lineHeight: 22,
  textAlign: "center",
  marginBottom: 28,
})

const ModalButton = styled.Pressable({
  width: "100%",
  paddingVertical: 14,
  borderRadius: 24,
  alignItems: "center",
  marginBottom: 12,
})

const ModalButtonText = styled.Text({
  fontSize: 16,
  fontFamily: "Nunito_600SemiBold",
  letterSpacing: 0.5,
})

export default function ReflectionScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const modalScale = useRef(new Animated.Value(0.9))
  const modalOpacity = useRef(new Animated.Value(0))

  useEffect(() => {
    if (id) {
      getEntry(id)
        .then(setEntry)
        .catch(() => setLoadError(true))
    }
  }, [id])

  useEffect(() => {
    if (confirmDelete) {
      Animated.parallel([
        Animated.spring(modalScale.current, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.timing(modalOpacity.current, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      modalScale.current.setValue(0.9)
      modalOpacity.current.setValue(0)
    }
  }, [confirmDelete])

  const handleDelete = async () => {
    if (!id) return
    await deleteEntry(id)
    setConfirmDelete(false)
    router.back()
  }

  if (loadError) {
    return (
      <GradientBg colors={theme.backgroundGradient}>
        <BackButton onPress={() => router.back()} style={{ top: insets.top + 8 }}>
          <Feather name="arrow-left" size={20} color={theme.textSecondary} />
        </BackButton>
        <LoadingContainer>
          <Feather name="cloud-off" size={40} color={theme.textSecondary} />
          <LoadingText style={{ color: theme.text, marginTop: 16 }}>
            Couldn&apos;t load this reflection
          </LoadingText>
          <LoadingText style={{ color: theme.textSecondary, fontSize: 14, marginTop: 8 }}>
            Check your connection and try again.
          </LoadingText>
        </LoadingContainer>
      </GradientBg>
    )
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
      <ShareButton
        onPress={() =>
          Share.share({
            message: `\u201C${entry.verse_text}\u201D\n\u2014 ${entry.verse_ref}`,
          })
        }
        style={{ top: insets.top + 8 }}
      >
        <Feather name="share" size={20} color={theme.textSecondary} />
      </ShareButton>
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
            onPress={() => setConfirmDelete(true)}
          >
            <ActionText style={{ color: "#c44" }}>Delete</ActionText>
          </ActionButton>
        </ResponseContainer>
      </Container>

      <Modal visible={confirmDelete} transparent animationType="none">
        <Overlay onPress={() => setConfirmDelete(false)}>
          <ModalCard
            style={{
              backgroundColor: theme.surface,
              transform: [{ scale: modalScale.current }],
              opacity: modalOpacity.current,
            }}
          >
            <ModalTitle style={{ color: theme.text }}>Let go of this reflection?</ModalTitle>
            <ModalBody style={{ color: theme.textSecondary }}>
              This will permanently remove it from your history.
            </ModalBody>
            <ModalButton style={{ backgroundColor: "#c44" }} onPress={handleDelete}>
              <ModalButtonText style={{ color: "#fff" }}>Delete</ModalButtonText>
            </ModalButton>
            <ModalButton
              style={{
                backgroundColor: theme.background,
                borderColor: theme.border,
                borderWidth: 1,
              }}
              onPress={() => setConfirmDelete(false)}
            >
              <ModalButtonText style={{ color: theme.text }}>Keep</ModalButtonText>
            </ModalButton>
          </ModalCard>
        </Overlay>
      </Modal>
    </GradientBg>
  )
}
