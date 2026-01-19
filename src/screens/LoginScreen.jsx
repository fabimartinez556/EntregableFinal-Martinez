// src/screens/LoginScreen.js
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "../store/authThunks";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const canSubmit = useMemo(() => {
    const e = email.trim();
    const p = password.trim();
    return e.length > 0 && p.length >= 6;
  }, [email, password]);

  const handleLogin = () => {
    if (!canSubmit) return;
    dispatch(login({ email, password }));
  };

  const handleRegister = () => {
    if (!canSubmit) return;
    dispatch(register({ email, password }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
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
          placeholder="Password (mín. 6)"
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
              <Button title="Ingresar" onPress={handleLogin} disabled={!canSubmit} />
            </View>
            <View style={styles.button}>
              <Button title="Registrarse" onPress={handleRegister} disabled={!canSubmit} />
            </View>
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
        {!canSubmit && (
          <Text style={styles.hint}>Ingresá email y contraseña (mínimo 6 caracteres).</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 18,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#999",
    marginBottom: 18,
    paddingVertical: 8,
  },
  button: {
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  hint: {
    marginTop: 10,
    textAlign: "center",
    color: "#666",
    fontSize: 12,
  },
});
