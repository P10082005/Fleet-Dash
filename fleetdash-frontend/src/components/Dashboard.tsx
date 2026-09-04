import { useState } from "react";
import type { Vehicle } from "../types/vehicle";
import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";
import MapView from "./MapView";
import "../App.css";
function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2> Fleet_Dash</h2>
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
        <p> Real-time fleet monitoring</p>

        <div className="cards">
          <div className="card">
             <h3>total Vehicals</h3>
             <p>{vehicles.length}</p>
          </div>
          <div className="card">
             <h3>Active Vehicals</h3>
             <p>{vehicles.filter((v) => v.status === "moving").length}</p>
             <p>{vehicles.filter((v) => v.status === "stopped").length}</p>
             <p>{vehicles.filter((v) => v.status === "alert").length}</p>
          </div>
          <div className="card">
            <h3>Maintenance</h3>
            <p>4</p>
          </div>
          <div className="map-section">
            <h2>Live Fleet Map</h2>
            <MapView vehicles={vehicles} />
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
        </div>
      </main>
    </div>
  );
}

export default Dashboard;