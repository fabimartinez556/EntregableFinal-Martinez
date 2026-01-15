import { View, Text, FlatList, StyleSheet } from "react-native";
import { useEffect, useMemo } from "react";
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
    if (user?.uid) {
      dispatch(fetchOrders(user.uid));
    }
  }, [dispatch, user?.uid]);

  // 🔽 Ordenar por fecha descendente
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aDate = a.createdAt?.seconds || 0;
      const bDate = b.createdAt?.seconds || 0;
      return bDate - aDate;
    });
  }, [orders]);

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "-";
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  return (
    <ScreenContainer>
      <Header title="Mis Órdenes" />

      {loading && <Text style={styles.center}>Cargando...</Text>}

      {error && <Text style={styles.center}>Error: {error}</Text>}

      {!loading && sortedOrders.length === 0 && (
        <Text style={styles.center}>No tenés órdenes</Text>
      )}

      <FlatList
        data={sortedOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          sortedOrders.length === 0 && !loading ? styles.emptyList : null
        }
        renderItem={({ item }) => {
          const total = Number(item.total) || 0;
          const products = Array.isArray(item.items)
            ? item.items.reduce(
                (acc, p) => acc + (Number(p.quantity) || 0),
                0
              )
            : 0;

          return (
            <View style={styles.card}>
              <Text style={styles.bold}>Orden #{item.id}</Text>
              <Text>Fecha: {formatDate(item.createdAt)}</Text>
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
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  bold: {
    fontWeight: "bold",
  },
});
