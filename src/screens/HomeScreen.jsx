import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Button,
} from "react-native";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
import { fetchProducts } from "../store/productsThunks";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { addToCart } from "../store/cartSlice";
import { saveCart } from "../store/cartThunks";
import { showToast } from "../store/uiSlice";

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);
  const cartItems = useSelector((state) => state.cart.items);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  /* ===========================
     agregar al carrito
  ============================ */
  const handleAddToCart = (product) => {
    const cartItem = cartItems.find(
      (ci) => ci.id === product.id
    );

    const currentQty = cartItem ? cartItem.quantity : 0;

    // No permitir superar stock
    if (currentQty >= product.stock) {
      dispatch(
        showToast({
          message: "Stock insuficiente",
          type: "error",
        })
      );
      return;
    }

    // Redux (cantidad +1)
    dispatch(addToCart({ ...product, quantity: 1 }));

    // Persistencia local
    const updatedCart = cartItem
      ? cartItems.map((i) =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      : [...cartItems, { ...product, quantity: 1 }];

    dispatch(saveCart(updatedCart));

    dispatch(
      showToast({
        message: "Producto agregado al carrito",
        type: "success",
      })
    );
  };

  return (
    <ScreenContainer>
      <Header title="Productos" />

      <View style={styles.logout}>
        <Button title="Logout" onPress={handleLogout} />
      </View>

      {loading && <Text>Cargando...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const cartItem = cartItems.find(
            (ci) => ci.id === item.id
          );

          const qtyInCart = cartItem ? cartItem.quantity : 0;
          const outOfStock = item.stock <= qtyInCart;

          return (
            <View style={styles.card}>
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="contain"
              />

              <Text style={styles.title}>{item.title}</Text>
              <Text>${item.price}</Text>
              <Text>Stock: {item.stock - qtyInCart}</Text>

              <Button
                title={
                  outOfStock
                    ? "Sin stock"
                    : "Agregar al carrito"
                }
                disabled={outOfStock}
                onPress={() => handleAddToCart(item)}
              />
            </View>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logout: {
    marginBottom: 10,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
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
