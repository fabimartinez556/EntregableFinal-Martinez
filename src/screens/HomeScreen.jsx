import { View, TextInput, Button, StyleSheet } from "react-native";
import { useState } from "react";
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function HomeScreen() {
  const [textItem, setTextItem] = useState("");

  const handleAddTask = () => {
    if (!textItem.trim()) return;
    // por ahora solo limpia el input (sin redux)
    setTextItem("");
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <ScreenContainer>
      <Header title="Mis Tareas" />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Nueva tarea"
          value={textItem}
          onChangeText={setTextItem}
          style={styles.input}
        />
        <Button title="Agregar" onPress={handleAddTask} />
      </View>

      <Button title="Logout" onPress={handleLogout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 20,
  },
  input: {
    borderBottomWidth: 1,
    flex: 1,
    paddingVertical: 4,
  },
});
