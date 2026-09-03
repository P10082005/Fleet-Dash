import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";
import MapView from "./MapView";
import "../App.css";
function Dashboard() {
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
             <p>25</p>
          </div>
          <div className="card">
             <h3>Active Vehicals</h3>
             <p>18</p>
          </div>
          <div className="card">
            <h3>Maintenance</h3>
            <p>4</p>
          </div>
          <div className="map-section">
            <h2>Live Fleet Map</h2>
            <MapView />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;