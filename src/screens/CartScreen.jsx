import { View, Text, FlatList, Button, StyleSheet, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
import { removeFromCart } from "../store/cartSlice";
import { saveCart } from "../store/cartThunks";
import { createOrder } from "../store/ordersThunks";

export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleRemove = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    dispatch(removeFromCart(id));
    dispatch(saveCart(updatedCart));
  };

  const handleCheckout = () => {
    if (!user) {
      Alert.alert("Error", "Debés estar logueado");
      return;
    }

    // 🔥 THUNK CORRECTO
    dispatch(
      createOrder(cartItems, total, user, () => {
        navigation.navigate("Orders");
        Alert.alert("Compra realizada", "Tu orden fue creada");
      })
    );
  };

  return (
    <ScreenContainer>
      <Header title="Carrito" />

      {cartItems.length === 0 ? (
        <Text style={styles.empty}>Carrito vacío</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.title}>{item.title}</Text>
                <Text>Cantidad: {item.quantity}</Text>
                <Text>Precio: ${item.price}</Text>
                <Button
                  title="Eliminar"
                  onPress={() => handleRemove(item.id)}
                />
              </View>
            )}
          />

          <Text style={styles.total}>Total: ${total}</Text>

          <Button title="Finalizar compra" onPress={handleCheckout} />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  item: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  title: {
    fontWeight: "bold",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
  },
});
