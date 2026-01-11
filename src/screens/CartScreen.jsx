import { View, Text, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";

export default function CartScreen() {
  return (
    <ScreenContainer>
      <Header title="Carrito" />

      <View style={styles.content}>
        <Text style={styles.text}>
          No hay productos en el carrito
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: "#555",
  },
});
