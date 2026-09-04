import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Vehicle } from "../types/vehicle";

interface MapViewProps {
  vehicles: Vehicle[];
}

function MapView({ vehicles }: MapViewProps) {
  return (
    <div className="map-container">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.vehicleId}
            position={[vehicle.latitude, vehicle.longitude]}
          >
            <Popup>
              <strong>Vehicle:</strong> {vehicle.vehicleId}
              <br />
              <strong>Speed:</strong> {vehicle.speed} km/h
              <br />
              <strong>Status:</strong> {vehicle.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;