// src/screens/CartScreen.js
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
import ConfirmModal from "../components/ConfirmModal";
import { removeFromCartAndPersist } from "../store/cartThunks";
import { createOrder } from "../store/ordersThunks";
import { getUserLocationWithMapAndAddress } from "../services/LocationService";
import { showToast } from "../store/uiSlice";

export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  const ordersLoading = useSelector((state) => state.orders.loading);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // delivery | pickup
  const [shippingMethod, setShippingMethod] = useState("delivery");

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  // Resumen envío (mismo cálculo que en ordersThunks para que coincida)
  const shippingPreview = useMemo(() => {
    if (shippingMethod === "pickup") {
      return { method: "pickup", fee: 0, etaMinutes: null, label: "Retiro en sucursal" };
    }
    const fee = total >= 30000 ? 0 : 2500;
    return { method: "delivery", fee, etaMinutes: 45, label: "Delivery" };
  }, [shippingMethod, total]);

  const handleRemove = useCallback(
    (id) => {
      dispatch(removeFromCartAndPersist(id));
      dispatch(showToast({ message: "Producto eliminado", type: "info" }));
    },
    [dispatch]
  );

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

    if (cartItems.length === 0) {
      Alert.alert("Carrito vacío", "Agregá productos antes de comprar");
      return;
    }

    let location = null;

    // Para delivery pedimos ubicación sí o sí
    if (shippingMethod === "delivery") {
      try {
        location = await getUserLocationWithMapAndAddress();
      } catch (error) {
        Alert.alert(
          "Ubicación requerida",
          error?.message || "No se pudo obtener ubicación"
        );
        return;
      }
    }

    dispatch(
      createOrder(cartItems, total, user, location, shippingMethod, () => {
        navigation.navigate("Orders");
      })
    );
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
          <View style={styles.shippingRow}>
            <Pressable
              onPress={() => setShippingMethod("delivery")}
              style={[
                styles.pill,
                shippingMethod === "delivery" && styles.pillActive,
              ]}
              disabled={ordersLoading}
            >
              <Text
                style={[
                  styles.pillText,
                  shippingMethod === "delivery" && styles.pillTextActive,
                ]}
              >
                Delivery
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShippingMethod("pickup")}
              style={[
                styles.pill,
                shippingMethod === "pickup" && styles.pillActive,
              ]}
              disabled={ordersLoading}
            >
              <Text
                style={[
                  styles.pillText,
                  shippingMethod === "pickup" && styles.pillTextActive,
                ]}
              >
                Retiro
              </Text>
            </Pressable>
          </View>

          <View style={styles.shippingBox}>
            <Text style={styles.shippingTitle}>Envío</Text>
            <Text>Método: {shippingPreview.label}</Text>
            <Text>Costo: ${shippingPreview.fee}</Text>
            {shippingPreview.etaMinutes != null && (
              <Text>ETA: {shippingPreview.etaMinutes} min</Text>
            )}
            {shippingMethod === "pickup" && (
              <Text style={styles.shippingNote}>
                Retiro: se guarda sin ubicación.
              </Text>
            )}
            {shippingMethod === "delivery" && (
              <Text style={styles.shippingNote}>
                Delivery: se solicitará tu ubicación al confirmar.
              </Text>
            )}
          </View>

          <FlatList
            data={cartItems}
            keyExtractor={(item) => String(item.id)}
            initialNumToRender={10}
            windowSize={7}
            removeClippedSubviews
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
            ListFooterComponent={
              cartItems.length > 0 ? (
                <Text style={styles.total}>Total: ${total}</Text>
              ) : null
            }
          />

          <Button
            title={ordersLoading ? "Procesando..." : "Finalizar compra"}
            onPress={handleCheckout}
            disabled={ordersLoading}
          />
        </>
      )}

      <ConfirmModal
        visible={modalVisible}
        title="Eliminar producto"
        message={selectedItem ? `¿Eliminar ${selectedItem.title} del carrito?` : ""}
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
  shippingRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  pillActive: {
    borderColor: "#111",
  },
  pillText: {
    fontWeight: "700",
    fontSize: 12,
    color: "#333",
  },
  pillTextActive: {
    color: "#111",
  },
  shippingBox: {
    marginHorizontal: 10,
    marginBottom: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  shippingTitle: {
    fontWeight: "800",
    marginBottom: 4,
  },
  shippingNote: {
    marginTop: 6,
    color: "#666",
    fontSize: 12,
  },
  item: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
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
