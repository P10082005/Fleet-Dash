import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

import type {
  BinaryTelemetryMessage,
  ConnectionStatus,
  GeofenceAlert,
  Telemetry,
  Vehicle
} from "../types/telemetry";

const SOCKET_URL = "http://localhost:5000";

function toArrayBuffer(payload: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (payload instanceof ArrayBuffer) {
    return payload;
  }

  return payload.buffer.slice(
    payload.byteOffset,
    payload.byteOffset + payload.byteLength
  ) as ArrayBuffer;
}

function decodeTelemetry(message: BinaryTelemetryMessage): Telemetry {
  const buffer = toArrayBuffer(message.payload);
  const view = new DataView(buffer);

  return {
    vehicleId: message.vehicleId,
    timestamp: new Date(view.getFloat64(0, true)).toISOString(),
    latitude: view.getFloat64(8, true),
    longitude: view.getFloat64(16, true),
    speed: view.getFloat32(24, true),
    heading: view.getFloat32(28, true)
  };
}

type UseFleetSocketOptions = {
  onTelemetry: (telemetry: Telemetry) => void;
  onAlert: (alert: GeofenceAlert) => void;
  onVehicleCreated: (vehicle: Vehicle) => void;
};

export function useFleetSocket({
  onTelemetry,
  onAlert,
  onVehicleCreated
}: UseFleetSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  const onTelemetryRef = useRef(onTelemetry);
  const onAlertRef = useRef(onAlert);
  const onVehicleCreatedRef = useRef(onVehicleCreated);

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  useEffect(() => {
    onTelemetryRef.current = onTelemetry;
  }, [onTelemetry]);

  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);

  useEffect(() => {
    onVehicleCreatedRef.current = onVehicleCreated;
  }, [onVehicleCreated]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"]
    });

    socketRef.current = socket;

    function handleConnect() {
      setConnectionStatus("connected");
    }

    function handleDisconnect() {
      setConnectionStatus("disconnected");
    }

    function handleConnectError() {
      setConnectionStatus("disconnected");
    }

    function handleBinaryTelemetry(message: BinaryTelemetryMessage) {
      try {
        const telemetry = decodeTelemetry(message);
        onTelemetryRef.current(telemetry);
      } catch (error) {
        console.error("Failed to decode telemetry:", error);
      }
    }

    function handleAlert(alert: GeofenceAlert) {
      onAlertRef.current(alert);
    }

    function handleVehicleCreated(vehicle: Vehicle) {
      onVehicleCreatedRef.current(vehicle);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("telemetry:binary", handleBinaryTelemetry);
    socket.on("geofence:alert", handleAlert);
    socket.on("vehicle:created", handleVehicleCreated);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("telemetry:binary", handleBinaryTelemetry);
      socket.off("geofence:alert", handleAlert);
      socket.off("vehicle:created", handleVehicleCreated);

      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return {
    connectionStatus
  };
}