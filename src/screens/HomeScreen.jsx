// src/screens/HomeScreen.js
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Button,
  TouchableOpacity,
} from "react-native";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
import { fetchProducts } from "../store/productsThunks";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { addToCartAndPersist } from "../store/cartThunks";
import { showToast } from "../store/uiSlice";

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);
  const cartItems = useSelector((state) => state.cart.items);

  const [category, setCategory] = useState("Todos");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const categories = useMemo(() => {
    const set = new Set(["Todos"]);
    (items || []).forEach((p) => {
      if (p?.category) set.add(String(p.category));
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (category === "Todos") return items;
    return (items || []).filter((p) => String(p.category) === category);
  }, [items, category]);

  const cartCount = useMemo(() => {
    return (cartItems || []).reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
  }, [cartItems]);

  const getQtyInCart = useCallback(
    (productId) => {
      const id = productId != null ? String(productId) : "";
      const cartItem = cartItems.find((ci) => String(ci.id) === id);
      return cartItem ? Number(cartItem.quantity) || 0 : 0;
    },
    [cartItems]
  );

  const handleAddToCart = (product) => {
    const id = product?.id != null ? String(product.id) : null;
    if (!id) {
      dispatch(showToast({ message: "Producto sin id (revisá Firestore)", type: "error" }));
      return;
    }

    const currentQty = getQtyInCart(id);
    const stock = Number(product.stock) || 0;

    if (currentQty >= stock) {
      dispatch(showToast({ message: "Stock insuficiente", type: "error" }));
      return;
    }

    dispatch(addToCartAndPersist({ ...product, id }));
    dispatch(showToast({ message: "Producto agregado al carrito", type: "success" }));
  };

  return (
    <ScreenContainer>
      <Header title="Productos" />

      <View style={styles.topRow}>
        <Button title="Logout" onPress={handleLogout} />
        <Button title="Actualizar" onPress={() => dispatch(fetchProducts())} />
      </View>

      <Text style={styles.cartInfo}>Carrito: {cartCount} item(s)</Text>

      {categories.length > 1 && (
        <View style={styles.categories}>
          <FlatList
            data={categories}
            keyExtractor={(c) => c}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const active = item === category;
              return (
                <TouchableOpacity
                  onPress={() => setCategory(item)}
                  style={[styles.catPill, active && styles.catPillActive]}
                >
                  <Text style={[styles.catText, active && styles.catTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {loading && <Text style={styles.center}>Cargando...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        windowSize={7}
        removeClippedSubviews
        renderItem={({ item }) => {
          const qtyInCart = getQtyInCart(item.id);
          const stock = Number(item.stock) || 0;
          const outOfStock = stock <= qtyInCart;

          return (
            <View style={styles.card}>
              {!!item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode="contain"
                />
              )}

              <Text style={styles.title}>{item.title}</Text>
              <Text>${item.price}</Text>
              <Text>Stock: {Math.max(stock - qtyInCart, 0)}</Text>

              <Button
                title={outOfStock ? "Sin stock" : "Agregar al carrito"}
                disabled={outOfStock}
                onPress={() => handleAddToCart(item)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? <Text style={styles.center}>No hay productos</Text> : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  cartInfo: {
    marginBottom: 8,
    fontWeight: "600",
    color: "#333",
  },
  center: {
    textAlign: "center",
    marginTop: 10,
  },
  categories: {
    marginBottom: 10,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  catPillActive: {
    borderColor: "#111",
  },
  catText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
  catTextActive: {
    color: "#111",
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  image: {
    height: 150,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  error: {
    color: "red",
    marginVertical: 10,
  },
});
