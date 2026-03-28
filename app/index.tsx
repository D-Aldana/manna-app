import styled from "@emotion/native";
import { useTheme } from "../src/theme/ThemeContext";

export default function PouringScreen() {
  const { theme } = useTheme();

  return (
    <Container style={{ backgroundColor: theme.background }}>
      <Title style={{ color: theme.text }}>Pouring</Title>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
});

const Title = styled.Text({
  fontSize: 24,
  fontWeight: "bold",
});
