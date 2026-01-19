// src/components/Price.js
import { Text } from "react-native";

export default function Price({ value, currency = "$", style }) {
  const n = Number(value) || 0;
  const formatted = `${currency}${n.toLocaleString("es-AR")}`;
  return <Text style={style}>{formatted}</Text>;
}
