import { Platform } from "react-native";

const impl = Platform.OS === "web"
  ? require("./database.web")
  : require("./database.native");

export const getDb = impl.getDb;
export const initDb = impl.initDb;

export const saveProductsCache = impl.saveProductsCache;
export const readProductsCache = impl.readProductsCache;
export const clearProductsCache = impl.clearProductsCache;

export const saveOrdersCache = impl.saveOrdersCache;
export const readOrdersCache = impl.readOrdersCache;
export const clearOrdersCache = impl.clearOrdersCache;
