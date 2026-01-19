// src/components/EmptyState.js
import { View, Text, StyleSheet } from "react-native";

export default function EmptyState({ title = "Sin datos", subtitle }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  sub: {
    marginTop: 6,
    color: "#666",
    textAlign: "center",
  },
});
