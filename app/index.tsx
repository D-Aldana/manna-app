import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../src/theme/ThemeContext";

export default function PouringScreen() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Pouring</Text>
      <Pressable onPress={toggleTheme} style={[styles.toggle, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={{ color: theme.textSecondary }}>
          {mode === "light" ? "Switch to Sanctuary" : "Switch to Morning"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  toggle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
});
