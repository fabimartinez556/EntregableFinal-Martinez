import * as Location from "expo-location";
import { GOOGLE_MAPS_API_KEY } from "../config/googleMaps";

export const getUserLocationWithMap = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Permiso de ubicación denegado");
  }

  const location = await Location.getCurrentPositionAsync({});

  const { latitude, longitude } = location.coords;

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&markers=color:red%7C${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

  return {
    latitude,
    longitude,
    mapUrl: staticMapUrl,
  };
};
