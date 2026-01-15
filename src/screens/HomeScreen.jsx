import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Button,
  Alert,
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

  const buildUpdatedCart = (items, product) => {
    const found = items.find((i) => i.id === product.id);

    if (found) {
      return items.map((i) =>
        i.id === product.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      );
    }

    return [...items, { ...product, quantity: 1 }];
  };

  const handleAddToCart = (item) => {
    const cartItem = cartItems.find((ci) => ci.id === item.id);
    const currentQty = cartItem ? cartItem.quantity : 0;

    if (currentQty + 1 > item.stock) {
      Alert.alert(
        "Stock insuficiente",
        `No hay suficiente stock de ${item.title}`
      );
      return;
    }

    dispatch(addToCart({ ...item, quantity: 1 }));

    const updatedCart = buildUpdatedCart(cartItems, item);
    dispatch(saveCart(updatedCart));
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
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text>${item.price}</Text>
            <Text>Stock: {item.stock}</Text>
            <Button
              title="Agregar al carrito"
              onPress={() => handleAddToCart(item)}
            />
          </View>
        )}
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
