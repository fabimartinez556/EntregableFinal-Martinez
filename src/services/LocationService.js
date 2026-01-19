// src/services/LocationService.js
import { Platform } from "react-native";
import * as Location from "expo-location";
import { GOOGLE_MAPS_API_KEY } from "../config/googleMaps";

const buildStaticMapUrl = (lat, lng) => {
  if (!GOOGLE_MAPS_API_KEY) return null;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&markers=color:red%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
};

async function reverseGeocodeGoogle(lat, lng) {
  if (!GOOGLE_MAPS_API_KEY) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const json = await res.json();
    return json?.results?.[0]?.formatted_address ?? null;
  } catch {
    return null;
  }
}

function webGeoErrorMessage(err) {
  const code = err?.code;
  if (code === 1) return "Ubicación bloqueada por el navegador (permití Ubicación).";
  if (code === 2) return "No se pudo determinar la ubicación (signal/GPS no disponible).";
  if (code === 3) return "Tiempo de espera agotado obteniendo ubicación.";

  return err?.message || "No se pudo obtener ubicación.";
}

async function getWebCoords() {
  // en web, geolocation requiere contexto seguro:
  // localhost OK; en IP/host puede fallar si no es https.
  return new Promise((resolve, reject) => {
    if (!globalThis?.navigator?.geolocation) {
      reject(
        new Error(
          "Geolocalización no disponible en este navegador (usá localhost/https)."
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(new Error(webGeoErrorMessage(err))),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  });
}

export const getUserLocationWithMapAndAddress = async () => {
  // WEB
  if (Platform.OS === "web") {
    const coords = await getWebCoords();
    const latitude = coords.latitude;
    const longitude = coords.longitude;

    const mapUrl = buildStaticMapUrl(latitude, longitude);
    const addressText = await reverseGeocodeGoogle(latitude, longitude);

    return { latitude, longitude, mapUrl, addressText };
  }

  // ANDROID / IOS
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("Permiso de ubicación denegado");

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = loc.coords;
  const mapUrl = buildStaticMapUrl(latitude, longitude);

  let addressText = null;
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    const a = places?.[0];
    if (a) {
      const parts = [
        a.street,
        a.streetNumber,
        a.city,
        a.region,
        a.country,
      ].filter(Boolean);
      addressText = parts.length ? parts.join(" ") : null;
    }
  } catch {}

  return { latitude, longitude, mapUrl, addressText };
};
