import { View, Text, StyleSheet, Pressable } from "react-native";

export default function TaskItem({ item, onDelete, onToggle }) {
  return (
    <Pressable
      onPress={() => onToggle(item.id)}
      style={[
        styles.item,
        item.completed && styles.completed,
      ]}
    >
      <Text style={styles.text}>{item.description}</Text>

      <Pressable onPress={() => onDelete(item.id)}>
        <Text style={styles.delete}>✕</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "teal",
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  completed: {
    backgroundColor: "#999",
  },
  text: {
    color: "#fff",
  },
  delete: {
    color: "#fff",
    fontWeight: "bold",
  },
});
