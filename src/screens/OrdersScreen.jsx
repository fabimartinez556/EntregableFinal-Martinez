import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Linking, Alert } from "react-native";
import { useEffect, useMemo, useState } from "react";
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

  const [mapErrors, setMapErrors] = useState({});

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchOrders(user.uid));
    }
  }, [dispatch, user?.uid]);

  // Ordenar por fecha (más reciente primero)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [orders]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString();
  };

  const openMaps = (lat, lng) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Error", "No se puede abrir la aplicación de mapas.");
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => Alert.alert("Error", err.message));
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
            ? item.items.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0)
            : 0;

          return (
            <View style={styles.card}>
              <Text style={styles.bold}>Orden #{item.id}</Text>
              <Text>Fecha: {formatDate(item.createdAt)}</Text>
              <Text>Total: ${total}</Text>
              <Text>Productos: {products}</Text>

              {/* 📍 UBICACIÓN */}
              {item.location && (
                <View style={styles.location}>
                  <Text style={styles.subtitle}>Entrega</Text>
                  <Text>
                    ({item.location.latitude}, {item.location.longitude})
                  </Text>

                  {item.location?.mapUrl && !mapErrors[item.id] ? (
                    <TouchableOpacity
                      onPress={() =>
                        openMaps(item.location.latitude, item.location.longitude)
                      }
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: item.location.mapUrl }}
                        style={styles.map}
                        resizeMode="cover"
                        onError={() =>
                          setMapErrors((prev) => ({ ...prev, [item.id]: true }))
                        }
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.map, styles.mapPlaceholder]}>
                      <Text style={{ textAlign: "center", color: "#555" }}>
                        Mapa no disponible
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* 📦 ESTADO */}
              {item.status && (
                <Text style={styles.status}>
                  Estado: {item.status.toUpperCase()}
                </Text>
              )}
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
    borderBottomColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  bold: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  location: {
    marginTop: 10,
  },
  subtitle: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  map: {
    width: "100%",
    height: 140,
    marginTop: 6,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  mapPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  status: {
    marginTop: 8,
    fontWeight: "bold",
    color: "green",
  },
});
