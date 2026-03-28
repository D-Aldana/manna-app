import { Pressable, View } from "react-native"
import styled from "@emotion/native"
import { Drawer } from "expo-router/drawer"
import { DrawerActions } from "@react-navigation/native"
import { useNavigation } from "expo-router"
import { Feather } from "@expo/vector-icons"
import { useFonts } from "expo-font"
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond"
import { Nunito_400Regular, Nunito_600SemiBold } from "@expo-google-fonts/nunito"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ThemeProvider, useTheme } from "@/theme/ThemeContext"

const ToggleButton = styled(Pressable)({
  position: "absolute",
  right: 16,
  zIndex: 10,
  padding: 8,
})

const DrawerToggle = styled(Pressable)({
  position: "absolute",
  left: 16,
  zIndex: 10,
  padding: 8,
})

function MenuButton() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  return (
    <DrawerToggle
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={{ top: insets.top + 8 }}
    >
      <Feather name="menu" size={20} color={theme.textSecondary} />
    </DrawerToggle>
  )
}

function ThemeToggle() {
  const { theme, mode, toggleTheme } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <ToggleButton onPress={toggleTheme} style={{ top: insets.top + 8 }}>
      <Feather name={mode === "light" ? "sun" : "moon"} size={20} color={theme.textSecondary} />
    </ToggleButton>
  )
}

function DrawerLayout() {
  const { theme } = useTheme()

  return (
    <View style={{ flex: 1 }}>
      <MenuButton />
      <ThemeToggle />
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: theme.surface,
            width: 280,
          },
          drawerActiveTintColor: theme.accent,
          drawerInactiveTintColor: theme.textSecondary,
          drawerLabelStyle: {
            fontFamily: "Nunito_600SemiBold",
            fontSize: 16,
            letterSpacing: 0.3,
          },
          drawerItemStyle: {
            borderRadius: 12,
            paddingHorizontal: 4,
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "New Pouring",
            drawerIcon: ({ color, size }) => <Feather name="droplet" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="history"
          options={{
            title: "Past Reflections",
            drawerIcon: ({ color, size }) => <Feather name="book" size={size} color={color} />,
          }}
        />
      </Drawer>
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <DrawerLayout />
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
