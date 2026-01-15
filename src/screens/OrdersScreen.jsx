import { View, Text, FlatList, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
import { fetchOrders } from "../store/ordersThunks";

export default function OrdersScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: orders = [], loading, error } = useSelector(
    (state) => state.orders
  );

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders(user.uid));
    }
  }, [dispatch, user]);

  return (
    <ScreenContainer>
      <Header title="Mis Órdenes" />

      {loading && <Text style={styles.center}>Cargando...</Text>}

      {error && <Text style={styles.center}>Error: {error}</Text>}

      {!loading && orders.length === 0 && (
        <Text style={styles.center}>No tenés órdenes</Text>
      )}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const total = Number(item.total) || 0;
          const products = Array.isArray(item.items)
            ? item.items.reduce((acc, p) => acc + (p.quantity || 0), 0)
            : 0;

          return (
            <View style={styles.card}>
              <Text style={styles.bold}>Orden #{item.id}</Text>
              <Text>Total: ${total}</Text>
              <Text>Productos: {products}</Text>
            </View>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  bold: {
    fontWeight: "bold",
  },
});
