import { View, Text, Button, StyleSheet, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserLocation } from "../store/locationSlice";

const LocationScreen = () => {
  const dispatch = useDispatch();

  const { coords, loading, error } = useSelector(
    (state) => state.location
  );

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
        </View>
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
  error: {
    color: "red",
    marginBottom: 10,
  },
});
