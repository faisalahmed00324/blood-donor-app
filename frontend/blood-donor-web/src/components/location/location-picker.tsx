import { Alert, Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { Icon, type LatLngExpression } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultMarkerIcon = new Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationPickerProps = {
  value: Coordinates | null;
  onChange: (value: Coordinates) => void;
  height?: string;
};

function ClickableMarker({ value, onChange }: { value: Coordinates | null; onChange: (value: Coordinates) => void }) {
  useMapEvents({
    click(event) {
      onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });

  if (!value) {
    return null;
  }

  return <Marker position={[value.latitude, value.longitude]} icon={defaultMarkerIcon} />;
}

export function LocationPicker({ value, onChange, height = "320px" }: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const mapCenter = useMemo<LatLngExpression>(() => {
    if (value) {
      return [value.latitude, value.longitude];
    }

    return [23.8103, 90.4125];
  }, [value]);

  useEffect(() => {
    if (value) {
      setLocationError(null);
    }
  }, [value]);

  const useCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported on this device.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setLocationError("Location access was denied. You can still place the pin manually on the map.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <Flex direction="column" gap={4}>
      <Flex gap={3} wrap="wrap" align="center">
        <Button type="button" variant="outline" colorPalette="red" onClick={useCurrentLocation} disabled={isLocating}>
          {isLocating ? "Locating..." : "Use Current Location"}
        </Button>
        <Text fontSize="sm" color="gray.500">
          Tap the map to place or move the pin.
        </Text>
        {isLocating && <Spinner size="sm" color="red.500" />}
      </Flex>

      {locationError && (
        <Alert.Root status="warning" borderRadius="md">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{locationError}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" overflow="hidden">
        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom style={{ height, width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickableMarker value={value} onChange={onChange} />
        </MapContainer>
      </Box>

      <Text fontSize="sm" color="gray.600">
        {value
          ? `Selected location: ${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`
          : "No location selected yet. Use current location or pin it on the map."}
      </Text>
    </Flex>
  );
}
