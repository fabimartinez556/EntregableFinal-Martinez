// src/components/Categories.js
import { FlatList, Text, View, StyleSheet, Pressable } from "react-native";
import categories from "../data/categories.json";

export default function Categories({ selectedId, onSelect }) {
  const handleSelect = (item) => {
    if (typeof onSelect === "function") onSelect(item);
  };

  const renderItem = ({ item }) => {
    const active = String(item.id) === String(selectedId);

    return (
      <Pressable
        onPress={() => handleSelect(item)}
        style={({ pressed }) => [
          styles.item,
          active && styles.itemActive,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.text, active && styles.textActive]}>{item.title}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        initialNumToRender={12}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 20, paddingTop: 8 },
  item: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "#e0f2f1",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cde7e6",
  },
  itemActive: {
    borderColor: "#0f766e",
  },
  text: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  textActive: { color: "#0f766e" },
  pressed: { opacity: 0.85 },
});
