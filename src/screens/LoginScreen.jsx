import { View, TextInput, Button, StyleSheet, Text, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "../store/authThunks";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = () => {
    if (!email || !password) return;
    dispatch(login({ email, password }));
  };

  const handleRegister = () => {
    if (!email || !password) return;
    dispatch(register({ email, password }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <View style={styles.button}>
            <Button title="Ingresar" onPress={handleLogin} />
          </View>
          <View style={styles.button}>
            <Button title="Registrarse" onPress={handleRegister} />
          </View>
        </>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "600",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#999",
    marginBottom: 20,
    paddingVertical: 8,
  },
  button: {
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginTop: 15,
    textAlign: "center",
  },
});
