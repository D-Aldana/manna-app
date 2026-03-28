export const LightTheme = {
  background: "#F5F0E8",
  backgroundGradient: ["#FAF5ED", "#F5F0E8"] as const,
  surface: "#FAF7F2",
  text: "#2C2C2C",
  textSecondary: "#6B6B6B",
  accent: "#B8977E",
  border: "#E8E2DA",
  tabBar: "#EDE8DF",
  tabBarInactive: "#B0A89E",
  tabBarActive: "#8C7561",
}

export const DarkTheme = {
  background: "#231F1C",
  backgroundGradient: ["#2E2824", "#231F1C"] as const,
  surface: "#2E2926",
  text: "#E8E4DF",
  textSecondary: "#A89E95",
  accent: "#D4A66A",
  border: "#3A3330",
  tabBar: "#1C1916",
  tabBarInactive: "#7A706A",
  tabBarActive: "#D4A66A",
}

export type Theme = typeof LightTheme
