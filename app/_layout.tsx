import { Pressable } from "react-native"
import styled from "@emotion/native"
import { Tabs } from "expo-router"
import { Feather } from "@expo/vector-icons"
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

  return (
    <>
      <ThemeToggle />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: theme.tabBar, borderTopColor: theme.border },
          tabBarActiveTintColor: theme.tabBarActive,
          tabBarInactiveTintColor: theme.tabBarInactive,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Pouring",
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
          }}
        />
      </Tabs>
    </>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabLayout />
    </ThemeProvider>
  )
}
