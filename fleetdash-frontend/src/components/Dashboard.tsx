import { useState } from "react";
import { useEffect } from "react";
import type { Vehicle } from "../types/vehicle";
import { connectSocket, disconnectSocket, socket } from "../services/socket";
import MapView from "./MapView";
import "../App.css";

function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isConnected, setIsConnected] = useState(false);

 useEffect(() => {
  connectSocket();

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const handleTelemetryUpdate = (telemetry: any) => {
  const vehicle: Vehicle = {
    vehicleId: telemetry.vehicleId,
    latitude: telemetry.latitude,
    longitude: telemetry.longitude,
    speed: telemetry.speed,
    status: telemetry.speed > 0 ? "moving" : "stopped",
  };

  setVehicles((currentVehicles) => {
    const existingVehicle = currentVehicles.find(
      (v) => v.vehicleId === vehicle.vehicleId
    );

    if (existingVehicle) {
      return currentVehicles.map((v) =>
        v.vehicleId === vehicle.vehicleId ? vehicle : v
      );
    }

    return [...currentVehicles, vehicle];
  });
};

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);
  socket.on("telemetry:update", handleTelemetryUpdate);

  return () => {
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
    socket.off("telemetry:update", handleTelemetryUpdate);
    disconnectSocket();
  };
}, []);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Fleet_Dash</h2>

        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Vehicles</a>
          <a href="#">Drivers</a>
          <a href="#">Maintenance</a>
          <a href="#">Reports</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1>Fleet Dashboard</h1>
        <p>Real-time fleet monitoring</p>

        {/* Connection Status */}
        <div
          className={`connection-status ${
            isConnected ? "connected" : "disconnected"
          }`}
        >
          {isConnected
            ? "● Connected to server"
            : "● Disconnected from server"}
        </div>

        {/* Dashboard Cards */}
        <div className="cards">
          <div className="card">
            <h3>Total Vehicles</h3>
            <p>{vehicles.length}</p>
          </div>

          <div className="card">
            <h3>Active Vehicles</h3>
            <p>
              {vehicles.filter((v) => v.status === "moving").length}
            </p>
          </div>

          <div className="card">
            <h3>Stopped Vehicles</h3>
            <p>
              {vehicles.filter((v) => v.status === "stopped").length}
            </p>
          </div>

          <div className="card">
            <h3>Alerts</h3>
            <p>
              {vehicles.filter((v) => v.status === "alert").length}
            </p>
          </div>

          <div className="card">
            <h3>Maintenance</h3>
            <p>4</p>
          </div>
        </div>

        {/* Live Map */}
        <div className="map-section">
          <h2>Live Fleet Map</h2>
          <MapView vehicles={vehicles} />

          {/* Vehicle Details */}
          <div className="vehicle-list">
            <h2>Vehicle Details</h2>

            {vehicles.length === 0 ? (
              <p>No vehicle data available yet.</p>
            ) : (
              <div className="vehicle-table">
                {vehicles.map((vehicle) => (
                  <div className="vehicle-row" key={vehicle.vehicleId}>
                    <span>{vehicle.vehicleId}</span>
                    <span>{vehicle.speed} km/h</span>
                    <span>{vehicle.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;