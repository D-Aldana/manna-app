import { Pressable, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";

function ThemeToggle() {
  const { theme, mode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable onPress={toggleTheme} style={[styles.toggle, { top: insets.top + 8 }]}>
      <Feather name={mode === "light" ? "sun" : "moon"} size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

function TabLayout() {
  const { theme } = useTheme();

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
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabLayout />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  toggle: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    padding: 8,
  },
});
