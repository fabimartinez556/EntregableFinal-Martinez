// src/screens/CartScreen.js
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
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
import EmptyState from "../components/EmptyState";
import Price from "../components/Price";
import Segmented from "../components/Segmented";

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
    const arr = Array.isArray(cartItems) ? cartItems : [];
    return arr.reduce((sum, item) => {
      const price = Number(item?.price) || 0;
      const qty = Number(item?.quantity) || 0;
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  const itemsCount = useMemo(() => {
    const arr = Array.isArray(cartItems) ? cartItems : [];
    return arr.reduce((acc, it) => acc + (Number(it?.quantity) || 0), 0);
  }, [cartItems]);

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
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
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

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <View style={styles.itemTop}>
          <Text style={styles.title} numberOfLines={1}>
            {item?.title}
          </Text>
          <Price value={item?.price} style={styles.price} />
        </View>

        <View style={styles.itemBottom}>
          <Text style={styles.muted}>Cantidad: {item?.quantity}</Text>
          <Button
            title="Eliminar"
            onPress={() => {
              setSelectedItem(item);
              setModalVisible(true);
            }}
            disabled={ordersLoading}
          />
        </View>
      </View>
    ),
    [ordersLoading]
  );

  const footer = useMemo(() => {
    if (!cartItems?.length) return null;

    const fee =
      shippingMethod === "pickup" ? 0 : Number(total) >= 30000 ? 0 : 2500;

    const grandTotal = Number(total) + Number(fee);

    return (
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.muted}>Items</Text>
          <Text style={styles.bold}>{itemsCount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.muted}>Subtotal</Text>
          <Price value={total} style={styles.bold} />
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.muted}>
            Envío ({shippingMethod === "pickup" ? "Retiro" : "Delivery"})
          </Text>
          <Price value={fee} style={styles.bold} />
        </View>

        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.totalText}>Total</Text>
          <Price value={grandTotal} style={styles.totalText} />
        </View>
      </View>
    );
  }, [cartItems?.length, itemsCount, shippingMethod, total]);

  return (
    <ScreenContainer>
      <Header title="Carrito" />

      {ordersLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
          <Text>Procesando compra...</Text>
        </View>
      )}

      {!cartItems?.length && !ordersLoading ? (
        <EmptyState
          title="Carrito vacío"
          subtitle="Agregá productos desde la pantalla de Productos."
        />
      ) : (
        <>
          <Segmented
            value={shippingMethod}
            onChange={setShippingMethod}
            options={[
              { label: "Delivery", value: "delivery" },
              { label: "Retiro", value: "pickup" },
            ]}
          />

          <FlatList
            data={cartItems}
            keyExtractor={(item) => String(item?.id)}
            initialNumToRender={10}
            windowSize={7}
            removeClippedSubviews
            renderItem={renderItem}
            ListFooterComponent={footer}
          />

          <View style={styles.checkout}>
            <Button
              title={ordersLoading ? "Procesando..." : "Finalizar compra"}
              onPress={handleCheckout}
              disabled={ordersLoading}
            />
          </View>
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
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  itemBottom: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    fontWeight: "800",
  },
  price: {
    fontWeight: "800",
  },
  muted: {
    color: "#666",
  },
  bold: {
    fontWeight: "800",
  },
  summary: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  summaryTotal: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "900",
  },
  checkout: {
    padding: 10,
  },
});
