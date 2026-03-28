import { Pressable } from "react-native";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";

function ThemeToggle() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <Pressable onPress={toggleTheme} style={{ marginRight: 16 }}>
      <Feather
        name={mode === "light" ? "sun" : "moon"}
        size={20}
        color={theme.text}
      />
    </Pressable>
  );
}

function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerRight: () => <ThemeToggle />,
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
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabLayout />
    </ThemeProvider>
  );
}
