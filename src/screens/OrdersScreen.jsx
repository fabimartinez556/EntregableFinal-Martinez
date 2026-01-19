// src/screens/OrdersScreen.js
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  RefreshControl,
} from "react-native";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
import { fetchOrders } from "../store/ordersThunks";

export default function OrdersScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: orders = [], loading, error } = useSelector((state) => state.orders);

  const [mapErrors, setMapErrors] = useState({});

  useEffect(() => {
    if (user?.uid) dispatch(fetchOrders(user.uid));
  }, [dispatch, user?.uid]);

  const onRefresh = useCallback(() => {
    if (user?.uid) dispatch(fetchOrders(user.uid));
  }, [dispatch, user?.uid]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [orders]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return "-";
    }
  };

  const openMaps = async (lat, lng) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Error", "No se puede abrir la aplicación de mapas.");
        return;
      }
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert("Error", err?.message || "No se pudo abrir Maps");
    }
  };

  const renderStatusChip = (status) => {
    const s = String(status || "").toLowerCase();
    const label = s ? s.toUpperCase() : "SIN ESTADO";
    return (
      <View style={[styles.chip, s === "entregado" ? styles.chipOk : styles.chipPending]}>
        <Text style={styles.chipText}>{label}</Text>
      </View>
    );
  };

  const renderTimeline = (history = []) => {
    if (!Array.isArray(history) || history.length === 0) return null;

    const items = [...history].sort((a, b) => (a.at ?? 0) - (b.at ?? 0));

    return (
      <View style={styles.timeline}>
        <Text style={styles.subtitle}>Seguimiento</Text>
        {items.map((h, idx) => (
          <View key={`${h.status || "status"}-${idx}`} style={styles.timelineRow}>
            <View style={styles.dot} />
            <View style={styles.timelineText}>
              <Text style={styles.timelineStatus}>
                {String(h.status || "estado").toUpperCase()}
              </Text>
              <Text style={styles.timelineDate}>{formatDate(h.at)}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <Header title="Mis Órdenes" />

      {loading && sortedOrders.length === 0 && <Text style={styles.center}>Cargando...</Text>}
      {error && <Text style={styles.center}>Error: {error}</Text>}
      {!loading && sortedOrders.length === 0 && <Text style={styles.center}>No tenés órdenes</Text>}

      <FlatList
        data={sortedOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={sortedOrders.length === 0 && !loading ? styles.emptyList : null}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        initialNumToRender={8}
        windowSize={7}
        removeClippedSubviews
        renderItem={({ item }) => {
          const total = Number(item.total) || 0;

          const productsCount = Array.isArray(item.items)
            ? item.items.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0)
            : 0;

          const shipping = item.shipping || null;
          const fee = shipping?.fee != null ? Number(shipping.fee) : null;
          const eta = shipping?.etaMinutes != null ? Number(shipping.etaMinutes) : null;

          const lat = item.location?.latitude;
          const lng = item.location?.longitude;

          return (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.bold}>Orden #{item.id}</Text>
                {renderStatusChip(item.status)}
              </View>

              <Text>Fecha: {formatDate(item.createdAt)}</Text>
              <Text>Total: ${total}</Text>
              <Text>Productos: {productsCount}</Text>

              {(shipping || item.addressText) && (
                <View style={styles.block}>
                  <Text style={styles.subtitle}>Envío</Text>
                  {shipping?.method && (
                    <Text>Método: {shipping.method === "pickup" ? "Retiro" : "Delivery"}</Text>
                  )}
                  {fee != null && !Number.isNaN(fee) && <Text>Costo: ${fee}</Text>}
                  {eta != null && !Number.isNaN(eta) && <Text>ETA: {eta} min</Text>}
                  {item.addressText && <Text>Dirección: {item.addressText}</Text>}
                </View>
              )}

              {lat != null && lng != null && (
                <View style={styles.block}>
                  <Text style={styles.subtitle}>Ubicación</Text>
                  <Text>
                    ({lat}, {lng})
                  </Text>

                  {item.location?.mapUrl && !mapErrors[item.id] ? (
                    <TouchableOpacity onPress={() => openMaps(lat, lng)} activeOpacity={0.85}>
                      <Image
                        source={{ uri: item.location.mapUrl }}
                        style={styles.map}
                        resizeMode="cover"
                        onError={() => setMapErrors((prev) => ({ ...prev, [item.id]: true }))}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.map, styles.mapPlaceholder]}>
                      <Text style={styles.placeholderText}>Mapa no disponible</Text>
                    </View>
                  )}
                </View>
              )}

              {renderTimeline(item.statusHistory)}
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
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
    fontSize: 16,
  },
  block: {
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
  placeholderText: {
    textAlign: "center",
    color: "#555",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipPending: {
    backgroundColor: "#eee",
  },
  chipOk: {
    backgroundColor: "#d7f5d7",
  },
  chipText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  timeline: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#999",
    marginTop: 4,
    marginRight: 10,
  },
  timelineText: {
    flex: 1,
  },
  timelineStatus: {
    fontWeight: "bold",
  },
  timelineDate: {
    color: "#666",
    marginTop: 1,
  },
});
