import { Pressable, View, useWindowDimensions } from "react-native"
import styled from "@emotion/native"
import { Tabs } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { useFonts } from "expo-font"
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond"
import { Nunito_400Regular, Nunito_600SemiBold } from "@expo-google-fonts/nunito"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ThemeProvider, useTheme } from "@/theme/ThemeContext"

const ToggleButton = styled(Pressable)({
  position: "absolute",
  right: 16,
  zIndex: 10,
  padding: 8,
})

function ThemeToggle() {
  const { theme, mode, toggleTheme } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <ToggleButton onPress={toggleTheme} style={{ top: insets.top + 8 }}>
      <Feather name={mode === "light" ? "sun" : "moon"} size={20} color={theme.textSecondary} />
    </ToggleButton>
  )
}

function TabLayout() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const pillWidth = 120
  const pillLeft = (width - pillWidth) / 2

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemeToggle />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            bottom: insets.bottom + 12,
            left: pillLeft,
            width: pillWidth,
            backgroundColor: theme.tabBar,
            borderRadius: 24,
            height: 48,
            borderTopWidth: 0,
            elevation: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: theme.tabBarActive,
          tabBarInactiveTintColor: theme.tabBarInactive,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Pouring",
            tabBarIcon: ({ color, size }) => <Feather name="droplet" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color, size }) => <Feather name="book" size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  )
}

export default function RootLayout() {
  const [loaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
  })

  if (!loaded) return null

  return (
    <ThemeProvider>
      <TabLayout />
    </ThemeProvider>
  )
}
