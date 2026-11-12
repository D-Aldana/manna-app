import { View, Pressable, Text, useWindowDimensions, Platform } from "react-native"
import { Drawer } from "expo-router/drawer"
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer"
import { Feather } from "@expo/vector-icons"
import { useFonts } from "expo-font"
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond"
import { Nunito_400Regular, Nunito_600SemiBold } from "@expo-google-fonts/nunito"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import styled from "@emotion/native"
import { ThemeProvider, useTheme } from "@/theme/ThemeContext"
import { MannaMark } from "@/components/MannaMark"

const AppName = styled.Text({
  fontSize: 32,
  fontFamily: "CormorantGaramond_600SemiBold",
  letterSpacing: 2,
  textAlign: "center",
  paddingTop: 16,
  paddingBottom: 8,
})

const Divider = styled.View({
  height: 1,
  marginHorizontal: 24,
  marginVertical: 12,
})

const ThemeRow = styled(Pressable)({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 20,
  paddingVertical: 14,
  marginHorizontal: 8,
  borderRadius: 12,
})

const ThemeLabel = styled.Text({
  fontSize: 15,
  fontFamily: "Nunito_600SemiBold",
  marginLeft: 16,
  letterSpacing: 0.3,
})

const NAV_ITEMS = [
  { label: "New Pouring", icon: "droplet", route: "index" },
  { label: "Past Reflections", icon: "book", route: "(history)" },
  { label: "Support Manna", icon: "gift", route: "support" },
  { label: "Share Feedback", icon: "message-circle", route: "feedback" },
] as const

function NavLabel({ color, label }: { color: string; label: string }) {
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.8}
      style={{
        color,
        fontFamily: "Nunito_600SemiBold",
        fontSize: 16,
        letterSpacing: 0.3,
      }}
    >
      {label}
    </Text>
  )
}

function CustomDrawerContent(props: React.ComponentProps<typeof DrawerContentScrollView>) {
  const { theme, mode, toggleTheme } = useTheme()
  const activeRoute = props.state.routes[props.state.index]?.name

  // Tip Jar is gated off iOS to comply with App Store Guideline 3.1.1 (donations require IAP)
  const navItems = NAV_ITEMS.filter((item) => Platform.OS !== "ios" || item.route !== "support")

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
        <AppName style={{ color: theme.accent }}>manna</AppName>
        <Divider style={{ backgroundColor: theme.border }} />

        {navItems.map((item) => (
          <DrawerItem
            key={item.route}
            label={({ color }) => <NavLabel color={color} label={item.label} />}
            focused={activeRoute === item.route}
            activeTintColor={theme.accent}
            inactiveTintColor={theme.textSecondary}
            activeBackgroundColor={theme.background}
            icon={({ color, size }) => <Feather name={item.icon} size={size} color={color} />}
            style={{ borderRadius: 12, marginHorizontal: 8 }}
            onPress={() => props.navigation.navigate(item.route)}
          />
        ))}

        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <MannaMark height={200} color={theme.accent} opacity={0.1} />
        </View>

        <Divider style={{ backgroundColor: theme.border }} />

        <ThemeRow onPress={toggleTheme}>
          <Feather name={mode === "light" ? "moon" : "sun"} size={20} color={theme.textSecondary} />
          <ThemeLabel style={{ color: theme.textSecondary }}>
            {mode === "light" ? "Dark Mode" : "Light Mode"}
          </ThemeLabel>
        </ThemeRow>

        <View style={{ height: 24 }} />
      </DrawerContentScrollView>
    </View>
  )
}

function DrawerLayout() {
  const { theme } = useTheme()
  const { width } = useWindowDimensions()

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.surface,
          width: Math.min(300, width * 0.85),
        },
      }}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="(history)" />
      <Drawer.Screen name="support" />
      <Drawer.Screen name="feedback" />
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
