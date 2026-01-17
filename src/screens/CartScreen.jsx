import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
import ConfirmModal from "../components/ConfirmModal";
import { removeFromCart } from "../store/cartSlice";
import { saveCart } from "../store/cartThunks";
import { createOrder } from "../store/ordersThunks";
import { getCurrentLocation } from "../services/LocationService";


export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  const ordersLoading = useSelector((state) => state.orders.loading);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleRemove = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    dispatch(removeFromCart(id));
    dispatch(saveCart(updatedCart));
  };

  const confirmRemove = () => {
    if (!selectedItem) return;
    handleRemove(selectedItem.id);
    setSelectedItem(null);
    setModalVisible(false);
  };
  const handleCheckout = async () => {
  if (!user) {
    Alert.alert("Error", "Debés estar logueado");
    return;
  }

  try {
    // 1️⃣ Obtener ubicación del dispositivo
    const location = await getCurrentLocation();

    // 2️⃣ Crear orden con ubicación incluida
    dispatch(
      createOrder(cartItems, total, user, location, () => {
        navigation.navigate("Orders");
      })
    );
  } catch (error) {
    Alert.alert("Ubicación requerida", error.message);
  }
};

  return (
    <ScreenContainer>
      <Header title="Carrito" />

      {ordersLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
          <Text>Procesando compra...</Text>
        </View>
      )}

      {cartItems.length === 0 && !ordersLoading ? (
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
                  onPress={() => {
                    setSelectedItem(item);
                    setModalVisible(true);
                  }}
                  disabled={ordersLoading}
                />
              </View>
            )}
          />

          <Text style={styles.total}>Total: ${total}</Text>

          <Button
            title="Finalizar compra"
            onPress={handleCheckout}
            disabled={ordersLoading}
          />
        </>
      )}

      <ConfirmModal
        visible={modalVisible}
        title="Eliminar producto"
        message={
          selectedItem ? `¿Eliminar ${selectedItem.title} del carrito?` : ""
        }
        onConfirm={confirmRemove}
        onCancel={() => {
          setSelectedItem(null);
          setModalVisible(false);
        }}
      />
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
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
