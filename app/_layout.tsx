import { View, Pressable } from "react-native"
import { Drawer } from "expo-router/drawer"
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer"
import { Feather } from "@expo/vector-icons"
import Svg, { Path } from "react-native-svg"
import { useFonts } from "expo-font"
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond"
import { Nunito_400Regular, Nunito_600SemiBold } from "@expo-google-fonts/nunito"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import styled from "@emotion/native"
import { ThemeProvider, useTheme } from "@/theme/ThemeContext"

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

function CustomDrawerContent(props: React.ComponentProps<typeof DrawerContentScrollView>) {
  const { theme, mode, toggleTheme } = useTheme()
  const currentIndex = props.state.index

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
        <AppName style={{ color: theme.accent }}>manna</AppName>
        <Divider style={{ backgroundColor: theme.border }} />

        <DrawerItem
          label="New Pouring"
          focused={currentIndex === 0}
          activeTintColor={theme.accent}
          inactiveTintColor={theme.textSecondary}
          activeBackgroundColor={theme.background}
          icon={({ color, size }) => <Feather name="droplet" size={size} color={color} />}
          labelStyle={{
            fontFamily: "Nunito_600SemiBold",
            fontSize: 16,
            letterSpacing: 0.3,
          }}
          style={{ borderRadius: 12, marginHorizontal: 8 }}
          onPress={() => props.navigation.navigate("index")}
        />
        <DrawerItem
          label="Past Reflections"
          focused={currentIndex === 1}
          activeTintColor={theme.accent}
          inactiveTintColor={theme.textSecondary}
          activeBackgroundColor={theme.background}
          icon={({ color, size }) => <Feather name="book" size={size} color={color} />}
          labelStyle={{
            fontFamily: "Nunito_600SemiBold",
            fontSize: 16,
            letterSpacing: 0.3,
          }}
          style={{ borderRadius: 12, marginHorizontal: 8 }}
          onPress={() => props.navigation.navigate("(history)")}
        />

        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Svg width={240} height={240} viewBox="0 0 466 466" opacity={0.1}>
            <Path
              d="M319.944,174.625c30.954-0.731,62.944-15.445,88.133-40.633c26.17-26.171,40.991-59.543,40.664-91.561c-0.045-4.354-3.563-7.873-7.918-7.918c-0.336-0.003-0.673-0.005-1.01-0.005c-31.701,0-64.705,14.823-90.551,40.668c-25.239,25.24-39.917,57.177-40.636,88.137l-68.853,68.853v-45.33c21.384-22.401,33.588-55.363,33.588-91.056c0-37.01-13.117-71.088-35.989-93.496c-3.111-3.047-8.088-3.047-11.197,0c-22.872,22.407-35.989,56.485-35.989,93.496c0,35.694,12.204,68.656,33.588,91.056v61.33l-42.99,42.99v-37.193c14.063-4.584,24.199-21.062,24.199-41.245c0-23.844-14.144-42.521-32.199-42.521c-18.057,0-32.2,18.677-32.2,42.521c0,20.184,10.136,36.661,24.2,41.245v53.193l-54.371,54.371v-37.193c14.063-4.584,24.199-21.062,24.199-41.245c0-23.844-14.144-42.521-32.199-42.521c-18.057,0-32.2,18.677-32.2,42.521c0,20.184,10.136,36.661,24.2,41.245v53.193l-74.814,74.814c-3.124,3.125-3.124,8.189,0,11.314c1.562,1.562,3.609,2.343,5.657,2.343s4.095-0.781,5.657-2.343l39.453-39.453h53.544c4.584,14.064,21.062,24.2,41.245,24.2c23.844,0,42.521-14.144,42.521-32.2s-18.678-32.2-42.521-32.2c-20.184,0-36.661,10.136-41.245,24.2H86.365l20.648-20.648c0.752-0.53,1.407-1.185,1.937-1.937l20.581-20.581h61.329c22.401,21.384,55.363,33.588,91.056,33.588c37.01,0,71.089-13.117,93.497-35.989c3.047-3.11,3.047-8.087,0-11.197c-22.408-22.872-56.487-35.989-93.497-35.989c-35.693,0-68.655,12.204-91.056,33.588h-45.329l31.853-31.853c0.752-0.53,1.407-1.185,1.937-1.937l75.769-75.769h53.544c4.584,14.064,21.062,24.2,41.245,24.2c23.844,0,42.521-14.144,42.521-32.2c0-18.056-18.677-32.199-42.521-32.199c-20.184,0-36.661,10.136-41.245,24.199h-37.544L319.944,174.625z M231.773,19.767c16.138,19.209,25.588,46.973,25.588,76.015s-9.45,56.806-25.588,76.015c-16.138-19.208-25.588-46.972-25.588-76.015S215.635,38.975,231.773,19.767z M156.582,212.719c0-14.128,7.57-26.521,16.2-26.521s16.199,12.393,16.199,26.521s-7.569,26.521-16.199,26.521S156.582,226.847,156.582,212.719z M86.211,283.09c0-14.128,7.57-26.521,16.2-26.521s16.199,12.393,16.199,26.521s-7.569,26.521-16.199,26.521S86.211,297.218,86.211,283.09z M165.154,400.004c14.128,0,26.521,7.57,26.521,16.2s-12.394,16.2-26.521,16.2s-26.521-7.57-26.521-16.2S151.026,400.004,165.154,400.004z M281.915,331.45c29.043,0,56.807,9.45,76.016,25.588c-19.209,16.138-46.973,25.588-76.016,25.588c-29.042,0-56.806-9.45-76.015-25.588C225.11,340.9,252.873,331.45,281.915,331.45z M349.878,215.28c14.128,0,26.521,7.569,26.521,16.199s-12.393,16.2-26.521,16.2s-26.521-7.57-26.521-16.2S335.75,215.28,349.878,215.28z M360.577,86.491c20.825-20.825,46.638-33.562,71.845-35.671c-2.169,24.996-15.12,51.318-35.659,71.857c-20.825,20.826-46.638,33.562-71.845,35.671C327.086,133.353,340.038,107.03,360.577,86.491z"
              fill={theme.accent}
            />
          </Svg>
        </View>

        <Divider style={{ backgroundColor: theme.border }} />

        <ThemeRow onPress={toggleTheme}>
          <Feather name={mode === "light" ? "sun" : "moon"} size={20} color={theme.textSecondary} />
          <ThemeLabel style={{ color: theme.textSecondary }}>
            {mode === "light" ? "Light" : "Dark"}
          </ThemeLabel>
        </ThemeRow>

        <View style={{ height: 24 }} />
      </DrawerContentScrollView>
    </View>
  )
}

function DrawerLayout() {
  const { theme } = useTheme()

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.surface,
          width: 260,
        },
      }}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="(history)" />
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
