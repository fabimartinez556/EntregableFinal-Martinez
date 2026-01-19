// src/store/ordersThunks.js
import { doc, runTransaction } from "firebase/firestore";
import { db, realtimeDb } from "../firebase/firebaseConfig";
import {
  setOrders,
  setOrdersLoading,
  setOrdersError,
  setOrdersFinished,
} from "./ordersSlice";
import { fetchProducts } from "./productsThunks";
import { showToast } from "./uiSlice";
import { ref, push, set, get } from "firebase/database";
import { GOOGLE_MAPS_API_KEY } from "../config/googleMaps";
import { readOrdersCache, saveOrdersCache } from "../data/database";
import { clearCartAndPersist } from "./cartThunks";

/* =======================
   FETCH ORDERS (CACHE -> REALTIME)
======================= */
export const fetchOrders = (userId) => {
  return async (dispatch) => {
    try {
      dispatch(setOrdersLoading());

      // 1) Cache (best-effort)
      try {
        const cached = await readOrdersCache(userId, 50);
        if (Array.isArray(cached) && cached.length > 0) {
          dispatch(setOrders(cached));
        }
      } catch (e) {
        console.log("Cache orders error:", e);
      }

      // 2) Realtime DB
      const snapshot = await get(ref(realtimeDb, `orders/${userId}`));

      if (!snapshot.exists()) {
        dispatch(setOrders([]));
        return;
      }

      const data = snapshot.val();

      const orders = Object.entries(data).map(([id, order]) => {
        const rawItems = order?.items;
        const itemsArray = Array.isArray(rawItems)
          ? rawItems
          : rawItems && typeof rawItems === "object"
          ? Object.values(rawItems)
          : [];
        return { id, ...order, items: itemsArray };
      });

      orders.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      dispatch(setOrders(orders));

      // 3) Save cache (best-effort)
      try {
        await saveOrdersCache(userId, orders);
      } catch (e) {
        console.log("Save orders cache error:", e);
      }
    } catch (error) {
      dispatch(setOrdersError(error?.message || "Error al cargar órdenes"));
    }
  };
};

/* =======================
   CREATE ORDER
======================= */
export const createOrder = (
  items,
  total,
  user,
  location,
  shippingMethod = "delivery",
  onComplete
) => {
  return async (dispatch) => {
    try {
      dispatch(setOrdersLoading());

      const safeItems = Array.isArray(items) ? items : [];
      const safeTotal = Number(total) || 0;

      // Transaction: primero lee TODO, después escribe TODO
      await runTransaction(db, async (transaction) => {
        const rows = safeItems.map((it) => {
          const productId = it?.id != null ? String(it.id) : null;
          const qty = Number(it?.quantity) || 0;
          return { productId, qty, title: it?.title || "producto" };
        });

        if (rows.some((r) => !r.productId)) throw new Error("Producto sin id");
        if (rows.some((r) => r.qty <= 0)) throw new Error("Cantidad inválida");

        // READS
        const reads = await Promise.all(
          rows.map(async (r) => {
            const refDoc = doc(db, "productos", r.productId);
            const snap = await transaction.get(refDoc);
            return { ...r, refDoc, snap };
          })
        );

        // VALIDAR
        for (const r of reads) {
          if (!r.snap.exists()) throw new Error("Producto inexistente");
          const stock = Number(r.snap.data()?.stock) || 0;
          if (stock < r.qty) throw new Error(`Stock insuficiente de ${r.title}`);
        }

        // WRITES
        for (const r of reads) {
          const stock = Number(r.snap.data()?.stock) || 0;
          transaction.update(r.refDoc, { stock: stock - r.qty });
        }
      });

      const now = Date.now();

      const method = shippingMethod === "pickup" ? "pickup" : "delivery";
      const fee = method === "pickup" ? 0 : safeTotal >= 30000 ? 0 : 2500;
      const etaMinutes = method === "pickup" ? null : 45;

      const lat = location?.latitude ?? null;
      const lng = location?.longitude ?? null;

      // Delivery exige ubicación
      if (method === "delivery" && (lat == null || lng == null)) {
        throw new Error("Ubicación requerida para delivery");
      }

      const mapUrl =
        GOOGLE_MAPS_API_KEY && lat != null && lng != null
          ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&markers=color:red%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
          : null;

      const orderPayload = {
        items: safeItems,
        total: safeTotal,
        email: user.email,

        shipping: { method, fee, etaMinutes },

        // Solo guardamos location si hay coords
        location:
          lat != null && lng != null
            ? { latitude: lat, longitude: lng, mapUrl }
            : null,

        // addressText solo tiene sentido en delivery
        addressText: method === "delivery" ? location?.addressText ?? null : null,

        status: "pendiente",
        statusHistory: [{ status: "pendiente", at: now }],
        createdAt: now,
      };

      const orderRef = push(ref(realtimeDb, `orders/${user.uid}`));
      await set(orderRef, orderPayload);

      await dispatch(clearCartAndPersist());

      dispatch(fetchProducts());
      dispatch(fetchOrders(user.uid));

      dispatch(
        showToast({ message: "Compra realizada con éxito 🎉", type: "success" })
      );
      dispatch(setOrdersFinished());
      onComplete?.();
    } catch (error) {
      dispatch(setOrdersError(error?.message || "Error al confirmar compra"));
      dispatch(
        showToast({
          message: error?.message || "Error al confirmar compra",
          type: "error",
        })
      );
    }
  };
};
