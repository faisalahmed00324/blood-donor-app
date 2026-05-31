import * as ExpoLocation from "expo-location";
import MapView, { Marker, type MapPressEvent } from "react-native-maps";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationPickerProps = {
  value: Coordinates | null;
  onChange: (value: Coordinates) => void;
};

const defaultRegion = {
  latitude: 23.8103,
  longitude: 90.4125,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    const permission = await ExpoLocation.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setError("Location permission was denied. You can still pin the map manually.");
      setLoading(false);
      return;
    }

    try {
      const current = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Highest });
      onChange({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch {
      setError("Could not fetch your current location. Please pin the map manually.");
    } finally {
      setLoading(false);
    }
  };

  const onMapPress = (event: MapPressEvent) => {
    onChange(event.nativeEvent.coordinate);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={useCurrentLocation}>
          <Text style={styles.buttonText}>{loading ? "Locating..." : "Use Current Location"}</Text>
        </TouchableOpacity>
        {loading ? <ActivityIndicator size="small" color="#dc2626" /> : null}
      </View>

      <Text style={styles.helper}>Tap the map to place or move the pin.</Text>

      <MapView
        style={styles.map}
        initialRegion={value ? { ...value, latitudeDelta: 0.08, longitudeDelta: 0.08 } : defaultRegion}
        region={value ? { ...value, latitudeDelta: 0.08, longitudeDelta: 0.08 } : undefined}
        onPress={onMapPress}
      >
        {value ? <Marker coordinate={value} /> : null}
      </MapView>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.coordinates}>
        {value
          ? `Selected location: ${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`
          : "No location selected yet."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  button: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  buttonText: {
    color: "#b91c1c",
    fontWeight: "700",
  },
  helper: {
    color: "#6b7280",
    fontSize: 13,
  },
  map: {
    height: 260,
    borderRadius: 18,
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
  },
  coordinates: {
    color: "#374151",
    fontSize: 13,
  },
});
