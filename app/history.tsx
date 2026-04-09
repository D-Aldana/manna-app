import { useState, useCallback } from "react"
import { FlatList, Pressable } from "react-native"
import styled from "@emotion/native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "expo-router"
import { DrawerActions } from "@react-navigation/native"
import { useFocusEffect } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/theme/ThemeContext"
import { getEntries, type Entry } from "@/lib/entries"

const GradientBg = styled(LinearGradient)({
  flex: 1,
})

const MenuButton = styled(Pressable)({
  position: "absolute",
  left: 16,
  zIndex: 10,
  padding: 8,
})

const Header = styled.Text({
  fontSize: 28,
  fontFamily: "CormorantGaramond_600SemiBold",
  textAlign: "center",
  marginBottom: 24,
})

const Card = styled(Pressable)({
  borderRadius: 16,
  padding: 20,
  marginHorizontal: 24,
  marginBottom: 16,
  borderWidth: 1,
})

const VerseText = styled.Text({
  fontSize: 18,
  fontFamily: "CormorantGaramond_600SemiBold",
  lineHeight: 28,
  marginBottom: 8,
})

const VerseRef = styled.Text({
  fontSize: 13,
  fontFamily: "Nunito_400Regular",
  letterSpacing: 0.5,
  marginBottom: 12,
})

const InputPreview = styled.Text({
  fontSize: 14,
  fontFamily: "Nunito_400Regular",
  lineHeight: 20,
})

const DateText = styled.Text({
  fontSize: 12,
  fontFamily: "Nunito_400Regular",
  marginTop: 8,
})

const EmptyContainer = styled.View({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 32,
})

const EmptyText = styled.Text({
  fontSize: 18,
  fontFamily: "CormorantGaramond_600SemiBold",
  textAlign: "center",
  marginTop: 16,
})

const EmptySubtext = styled.Text({
  fontSize: 14,
  fontFamily: "Nunito_400Regular",
  textAlign: "center",
  marginTop: 8,
})

const ExpandedCommentary = styled.Text({
  fontSize: 15,
  fontFamily: "Nunito_400Regular",
  lineHeight: 24,
  marginBottom: 12,
})

const ExpandedPrayer = styled.Text({
  fontSize: 16,
  fontFamily: "CormorantGaramond_400Regular",
  fontStyle: "italic",
  lineHeight: 26,
})

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function HistoryScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      getEntries()
        .then((data) => setEntries(data.filter((e) => e.verse_text)))
        .finally(() => setLoading(false))
    }, []),
  )

  const renderEntry = ({ item }: { item: Entry }) => {
    const expanded = expandedId === item.id

    return (
      <Card
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        onPress={() => setExpandedId(expanded ? null : item.id)}
      >
        <VerseText style={{ color: theme.text }}>&ldquo;{item.verse_text}&rdquo;</VerseText>
        <VerseRef style={{ color: theme.textSecondary }}>— {item.verse_ref}</VerseRef>
        {expanded && (
          <>
            <ExpandedCommentary style={{ color: theme.textSecondary }}>
              {item.commentary}
            </ExpandedCommentary>
            <ExpandedPrayer style={{ color: theme.accent }}>{item.prayer}</ExpandedPrayer>
          </>
        )}
        <InputPreview
          style={{ color: theme.textSecondary, opacity: 0.7 }}
          numberOfLines={expanded ? undefined : 1}
        >
          {item.input}
        </InputPreview>
        <DateText style={{ color: theme.textSecondary, opacity: 0.5 }}>
          {formatDate(item.created_at)}
        </DateText>
      </Card>
    )
  }

  return (
    <GradientBg colors={theme.backgroundGradient}>
      <MenuButton
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={{ top: insets.top + 8 }}
      >
        <Feather name="menu" size={20} color={theme.textSecondary} />
      </MenuButton>
      {entries.length === 0 && !loading ? (
        <EmptyContainer>
          <Feather name="book-open" size={40} color={theme.textSecondary} />
          <EmptyText style={{ color: theme.text }}>No saved reflections yet</EmptyText>
          <EmptySubtext style={{ color: theme.textSecondary }}>
            After a pouring, tap &ldquo;Save to History&rdquo; to keep it here.
          </EmptySubtext>
        </EmptyContainer>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderEntry}
          contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: 32 }}
          ListHeaderComponent={<Header style={{ color: theme.accent }}>Past Reflections</Header>}
        />
      )}
    </GradientBg>
  )
}
