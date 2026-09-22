export interface Telemetry {
  vehicleId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
}

export interface MapBounds {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

export interface GeofenceAlert {
  vehicleId: string;
  alertType: "enter" | "exit";
  geofenceId: string;
  timestamp: string;
}

export interface BinaryTelemetryMessage {
  vehicleId: string;
  payload: ArrayBuffer | Uint8Array;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface Vehicle {
  vehicleId: string;
  driverName: string;
  registrationNumber: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: "Moving" | "Stopped";
  lastUpdate: string;
}

export interface CreateVehiclePayload {
  vehicleId: string;
  driverName: string;
  registrationNumber: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
}