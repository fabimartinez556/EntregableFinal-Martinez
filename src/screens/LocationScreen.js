// src/screens/LocationScreen.js
import { View, Text, Button, StyleSheet, ActivityIndicator, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserLocation } from "../store/locationSlice";

const LocationScreen = () => {
  const dispatch = useDispatch();
  const { coords, mapUrl, addressText, loading, error } = useSelector((state) => state.location);

  const handleGetLocation = () => {
    dispatch(fetchUserLocation());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ubicación de entrega</Text>

      {loading && <ActivityIndicator size="large" />}

      {coords && (
        <View style={styles.locationBox}>
          <Text>Latitud: {coords.latitude}</Text>
          <Text>Longitud: {coords.longitude}</Text>
          {!!addressText && <Text style={styles.addr}>Dirección: {addressText}</Text>}
        </View>
      )}

      {!!mapUrl && (
        <Image
          source={{ uri: mapUrl }}
          style={styles.map}
          resizeMode="cover"
        />
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Obtener ubicación actual" onPress={handleGetLocation} />
    </View>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold",
  },
  locationBox: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    width: "100%",
  },
  addr: {
    marginTop: 8,
  },
  map: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});
