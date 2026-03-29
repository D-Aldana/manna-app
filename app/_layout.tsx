import { Drawer } from "expo-router/drawer"
import { Feather } from "@expo/vector-icons"
import { useFonts } from "expo-font"
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond"
import { Nunito_400Regular, Nunito_600SemiBold } from "@expo-google-fonts/nunito"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ThemeProvider, useTheme } from "@/theme/ThemeContext"

function DrawerLayout() {
  const { theme } = useTheme()

  return (
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
