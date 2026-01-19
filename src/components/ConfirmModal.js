// src/components/ConfirmModal.js
import { View, Text, Modal, StyleSheet, Pressable } from "react-native";

export default function ConfirmModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={!!visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title || "Confirmar acción"}</Text>
          <Text style={styles.message}>{message || "¿Estás seguro?"}</Text>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
              onPress={onCancel}
            >
              <Text>Cancelar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}
              onPress={onConfirm}
              android_ripple={{ color: "#ffffff33" }}
            >
              <Text style={styles.confirmText}>Confirmar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "auto",
  },
  modal: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    marginBottom: 20,
    fontSize: 15,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancel: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  confirm: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "teal",
    borderRadius: 6,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
