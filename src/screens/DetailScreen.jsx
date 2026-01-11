import { Text, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

export default function DetailScreen({ route }) {
  const { id, description } = route.params;

  return (
    <ScreenContainer>
      <Text style={styles.text}>ID: {id}</Text>
      <Text style={styles.text}>Tarea: {description}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    marginVertical: 10,
  },
});
