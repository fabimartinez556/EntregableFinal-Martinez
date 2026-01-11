import { FlatList, Text, View, StyleSheet, Pressable } from "react-native";
import categories from "../Data/categories.json";

export default function Categories() {
  const renderItem = ({ item }) => (
    <Pressable style={styles.item}>
      <Text style={styles.text}>{item.title}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingBottom: 20,
  },
  item: {
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "#e0f2f1",
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
  },
});
