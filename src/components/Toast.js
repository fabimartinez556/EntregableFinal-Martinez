// src/components/Toast.js
import { Text, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "../store/uiSlice";

export default function Toast() {
  const dispatch = useDispatch();
  const { visible, message, type } = useSelector((state) => state.ui.toast);

  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();

    timerRef.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start(() => dispatch(hideToast()));
    }, 2500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [visible, dispatch, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.toast, styles[type] || styles.success, { opacity }]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    zIndex: 999,
    elevation: 10,
    pointerEvents: "none",
  },
  success: {
    backgroundColor: "#2e7d32",
  },
  error: {
    backgroundColor: "#c62828",
  },
  info: {
    backgroundColor: "#1565c0",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});
