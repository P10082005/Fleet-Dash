import type { GeofenceAlert } from "../types/telemetry";

interface AlertPanelProps {
  alerts: GeofenceAlert[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#fff3cd", borderRadius: "8px" }}>
      <h3>Recent Alerts</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {alerts.map((alert, index) => (
          <li key={index} style={{ marginBottom: "8px" }}>
            {alert.alertType === "enter" ? "🟢" : "🔴"}
            Vehicle {alert.vehicleId} {alert.alertType === "enter" ? "entered" : "exited"} geofence {alert.geofenceId} at {new Date(alert.timestamp).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
}