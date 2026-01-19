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
import EmptyState from "../components/EmptyState";
import Price from "../components/Price";

export default function OrdersScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: orders = [], loading, error } = useSelector(
    (state) => state.orders
  );

  const [mapErrors, setMapErrors] = useState({});

  useEffect(() => {
    setMapErrors({});
    if (user?.uid) dispatch(fetchOrders(user.uid));
  }, [dispatch, user?.uid]);

  const onRefresh = useCallback(() => {
    if (user?.uid) dispatch(fetchOrders(user.uid));
  }, [dispatch, user?.uid]);

  const sortedOrders = useMemo(() => {
    const arr = Array.isArray(orders) ? orders : [];
    return [...arr].sort((a, b) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0));
  }, [orders]);

  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return "-";
    try {
      // deja consistente en AR
      return new Date(timestamp).toLocaleString("es-AR");
    } catch {
      return "-";
    }
  }, []);

  const openMaps = useCallback(async (lat, lng) => {
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
  }, []);

  const renderStatusChip = useCallback((status) => {
    const s = String(status || "").toLowerCase();
    const label = s ? s.toUpperCase() : "SIN ESTADO";
    const ok = s === "entregado";

    return (
      <View style={[styles.chip, ok ? styles.chipOk : styles.chipPending]}>
        <Text style={styles.chipText}>{label}</Text>
      </View>
    );
  }, []);

  const renderMethodBadge = useCallback((method) => {
    const m = method === "pickup" ? "pickup" : "delivery";
    const label = m === "pickup" ? "RETIRO" : "DELIVERY";

    return (
      <View
        style={[
          styles.methodBadge,
          m === "pickup" ? styles.methodPickup : styles.methodDelivery,
        ]}
      >
        <Text style={styles.methodText}>{label}</Text>
      </View>
    );
  }, []);

  const renderTimeline = useCallback(
    (history = []) => {
      if (!Array.isArray(history) || history.length === 0) return null;

      const items = [...history].sort((a, b) => (a?.at ?? 0) - (b?.at ?? 0));

      return (
        <View style={styles.timeline}>
          <Text style={styles.subtitle}>Seguimiento</Text>

          {items.map((h, idx) => (
            <View
              key={`${String(h?.status || "status")}-${String(h?.at || idx)}`}
              style={styles.timelineRow}
            >
              <View style={styles.dot} />
              <View style={styles.timelineText}>
                <Text style={styles.timelineStatus}>
                  {String(h?.status || "estado").toUpperCase()}
                </Text>
                <Text style={styles.timelineDate}>{formatDate(h?.at)}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    },
    [formatDate]
  );

  const renderItem = useCallback(
    ({ item }) => {
      const total = Number(item?.total) || 0;

      const productsCount = Array.isArray(item?.items)
        ? item.items.reduce((acc, p) => acc + (Number(p?.quantity) || 0), 0)
        : 0;

      // compat: si falta shipping en órdenes viejas, asumimos delivery
      const shipping = item?.shipping || null;
      const method = shipping?.method === "pickup" ? "pickup" : "delivery";

      const fee =
        method === "pickup"
          ? 0
          : shipping?.fee != null
          ? Number(shipping.fee)
          : null;

      const eta =
        method === "pickup"
          ? null
          : shipping?.etaMinutes != null
          ? Number(shipping.etaMinutes)
          : null;

      // ✅ Si es retiro, NO mostramos ubicación/mapa aunque exista en datos
      const showLocation = method === "delivery";

      const lat =
        showLocation && item?.location?.latitude != null
          ? item.location.latitude
          : null;

      const lng =
        showLocation && item?.location?.longitude != null
          ? item.location.longitude
          : null;

      const showShippingBlock = Boolean(shipping) || Boolean(item?.addressText);

      return (
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.leftTop}>
              <Text style={styles.bold} numberOfLines={1}>
                Orden #{item?.id}
              </Text>
              {renderMethodBadge(method)}
            </View>

            <View style={styles.rightTop}>{renderStatusChip(item?.status)}</View>
          </View>

          <Text style={styles.meta}>Fecha: {formatDate(item?.createdAt)}</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Price value={total} style={styles.summaryValue} />
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Productos</Text>
              <Text style={styles.summaryValueText}>{productsCount}</Text>
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Costo envío</Text>
              {fee != null && !Number.isNaN(fee) ? (
                <Price value={fee} style={styles.summaryValue} />
              ) : (
                <Text style={styles.summaryValueText}>-</Text>
              )}
            </View>
          </View>

          {showShippingBlock && (
            <View style={styles.block}>
              <Text style={styles.subtitle}>Envío</Text>
              <Text>Método: {method === "pickup" ? "Retiro" : "Delivery"}</Text>

              {method === "delivery" &&
                eta != null &&
                !Number.isNaN(eta) &&
                eta > 0 && <Text>ETA: {eta} min</Text>}

              {method === "delivery" && !!item?.addressText && (
                <Text>Dirección: {item.addressText}</Text>
              )}

              {method === "pickup" && (
                <Text style={styles.pickupHint}>
                  Retiro en punto de entrega (sin ubicación).
                </Text>
              )}
            </View>
          )}

          {lat != null && lng != null && (
            <View style={styles.block}>
              <Text style={styles.subtitle}>Ubicación</Text>
              <Text style={styles.coords}>
                ({lat}, {lng})
              </Text>

              {item?.location?.mapUrl && !mapErrors[item.id] ? (
                <TouchableOpacity
                  onPress={() => openMaps(lat, lng)}
                  activeOpacity={0.85}
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
                  <Text style={styles.placeholderText}>Mapa no disponible</Text>
                </View>
              )}
            </View>
          )}

          {renderTimeline(item?.statusHistory)}
        </View>
      );
    },
    [
      formatDate,
      mapErrors,
      openMaps,
      renderMethodBadge,
      renderStatusChip,
      renderTimeline,
    ]
  );

  const showEmpty = !loading && sortedOrders.length === 0;

  return (
    <ScreenContainer>
      <Header title="Mis Órdenes" />

      {loading && sortedOrders.length === 0 && (
        <Text style={styles.center}>Cargando...</Text>
      )}

      {!!error && <Text style={styles.center}>Error: {error}</Text>}

      {showEmpty ? (
        <EmptyState
          title="No tenés órdenes"
          subtitle="Cuando confirmes una compra, van a aparecer acá."
        />
      ) : (
        <FlatList
          data={sortedOrders}
          keyExtractor={(item, index) => String(item?.id ?? index)}
          refreshControl={
            <RefreshControl refreshing={!!loading} onRefresh={onRefresh} />
          }
          initialNumToRender={8}
          windowSize={7}
          removeClippedSubviews
          renderItem={renderItem}
        />
      )}
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
    borderBottomColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 10,
  },
  leftTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
  },
  rightTop: {
    alignItems: "flex-end",
  },

  bold: {
    fontWeight: "bold",
    fontSize: 16,
  },
  meta: {
    color: "#444",
  },

  methodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  methodDelivery: {
    borderColor: "#111",
    backgroundColor: "#fff",
  },
  methodPickup: {
    borderColor: "#0f766e",
    backgroundColor: "#e6fffb",
  },
  methodText: {
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.4,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  summaryBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "700",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111",
  },
  summaryValueText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111",
  },

  block: {
    marginTop: 12,
  },
  subtitle: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  pickupHint: {
    marginTop: 4,
    color: "#555",
  },

  coords: {
    color: "#555",
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
