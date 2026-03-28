import { Pressable } from "react-native";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";

function ThemeToggle() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <Pressable onPress={toggleTheme}>
      <Feather
        name={mode === "light" ? "sun" : "moon"}
        size={20}
        color={theme.tabBarInactive}
      />
    </Pressable>
  );
}

function TabLayout() {
  const { theme } = useTheme();

  return (
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
      <Tabs.Screen
        name="theme-toggle"
        options={{
          tabBarButton: () => <ThemeToggle />,
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabLayout />
    </ThemeProvider>
  );
}
