import { View, Text, StyleSheet } from "react-native";

export default function DetailScreen({ route }) {
  const { id, description } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle de la tarea</Text>
      <Text>ID: {id}</Text>
      <Text>Descripción: {description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
});
