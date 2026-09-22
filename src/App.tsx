import { useCallback, useEffect, useMemo, useState } from "react";

import "./index.css";

import { useFleetSocket } from "./hooks/useFleetSocket";
import { createVehicle, getVehicles } from "./services/vehiclesApi";

import type {
  CreateVehiclePayload,
  GeofenceAlert,
  Telemetry,
  Vehicle
} from "./types/telemetry";

const INITIAL_VEHICLES: Vehicle[] = [
  {
    vehicleId: "TRUCK-001",
    driverName: "Demo Driver",
    registrationNumber: "KA-01-AA-1001",
    latitude: 12.9716,
    longitude: 77.5946,
    speed: 38,
    heading: 90,
    status: "Moving",
    lastUpdate: "Demo data"
  },
  {
    vehicleId: "TRUCK-002",
    driverName: "Demo Driver",
    registrationNumber: "KA-01-AA-1002",
    latitude: 12.976,
    longitude: 77.602,
    speed: 45,
    heading: 120,
    status: "Moving",
    lastUpdate: "Demo data"
  },
  {
    vehicleId: "TRUCK-003",
    driverName: "Demo Driver",
    registrationNumber: "KA-01-AA-1003",
    latitude: 12.961,
    longitude: 77.585,
    speed: 0,
    heading: 180,
    status: "Stopped",
    lastUpdate: "Demo data"
  }
];

const INITIAL_ALERTS: GeofenceAlert[] = [
  {
    vehicleId: "TRUCK-001",
    alertType: "enter",
    geofenceId: "Infotact Campus Zone",
    timestamp: "2026-09-22T09:20:00.000Z"
  },
  {
    vehicleId: "TRUCK-003",
    alertType: "exit",
    geofenceId: "Infotact Campus Zone",
    timestamp: "2026-09-22T09:13:00.000Z"
  }
];

function formatDashboardTime(isoTimestamp: string) {
  if (isoTimestamp === "Demo data") {
    return "Demo data";
  }

  const date = new Date(isoTimestamp);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function upsertVehicle(currentVehicles: Vehicle[], incomingVehicle: Vehicle) {
  const exists = currentVehicles.some(
    (vehicle) => vehicle.vehicleId === incomingVehicle.vehicleId
  );

  if (!exists) {
    return [incomingVehicle, ...currentVehicles];
  }

  return currentVehicles.map((vehicle) =>
    vehicle.vehicleId === incomingVehicle.vehicleId
      ? { ...vehicle, ...incomingVehicle }
      : vehicle
  );
}

function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [alerts, setAlerts] = useState<GeofenceAlert[]>(INITIAL_ALERTS);
  const [selectedVehicleId, setSelectedVehicleId] = useState("TRUCK-002");

  const [eventsReceived, setEventsReceived] = useState(0);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [vehicleFormError, setVehicleFormError] = useState("");

  const selectedVehicle = useMemo(() => {
    return (
      vehicles.find((vehicle) => vehicle.vehicleId === selectedVehicleId) ??
      vehicles[0]
    );
  }, [selectedVehicleId, vehicles]);

  const movingVehicleCount = useMemo(() => {
    return vehicles.filter((vehicle) => vehicle.status === "Moving").length;
  }, [vehicles]);

  const handleTelemetry = useCallback((telemetry: Telemetry) => {
  setVehicles((currentVehicles) => {
    const existingVehicle = currentVehicles.find(
      (vehicle) => vehicle.vehicleId === telemetry.vehicleId
    );

    if (!existingVehicle) {
      return [
        {
          vehicleId: telemetry.vehicleId,
          driverName: "",
          registrationNumber: "",
          latitude: telemetry.latitude,
          longitude: telemetry.longitude,
          speed: telemetry.speed,
          heading: telemetry.heading,
          status: telemetry.speed > 0 ? "Moving" : "Stopped",
          lastUpdate: telemetry.timestamp
        },
        ...currentVehicles
      ];
    }

    return currentVehicles.map((vehicle) =>
      vehicle.vehicleId === telemetry.vehicleId
        ? {
            ...vehicle,
            latitude: telemetry.latitude,
            longitude: telemetry.longitude,
            speed: telemetry.speed,
            heading: telemetry.heading,
            status: telemetry.speed > 0 ? "Moving" : "Stopped",
            lastUpdate: telemetry.timestamp
          }
        : vehicle
    );
  });

  setSelectedVehicleId(telemetry.vehicleId);
  setEventsReceived((count) => count + 1);
}, []);

  const handleAlert = useCallback((alert: GeofenceAlert) => {
    setAlerts((currentAlerts) => [alert, ...currentAlerts].slice(0, 8));
  }, []);

  const handleVehicleCreated = useCallback((vehicle: Vehicle) => {
  setVehicles((currentVehicles) => {
    const existingVehicle = currentVehicles.find(
      (currentVehicle) => currentVehicle.vehicleId === vehicle.vehicleId
    );

    if (!existingVehicle) {
      return [vehicle, ...currentVehicles];
    }

    return currentVehicles.map((currentVehicle) =>
      currentVehicle.vehicleId === vehicle.vehicleId
        ? {
            ...currentVehicle,
            ...vehicle,
            driverName:
              vehicle.driverName || currentVehicle.driverName || "",
            registrationNumber:
              vehicle.registrationNumber ||
              currentVehicle.registrationNumber ||
              ""
          }
        : currentVehicle
    );
  });

  setSelectedVehicleId(vehicle.vehicleId);
}, []);

  const { connectionStatus } = useFleetSocket({
    onTelemetry: handleTelemetry,
    onAlert: handleAlert,
    onVehicleCreated: handleVehicleCreated
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadRegisteredVehicles() {
      try {
        const savedVehicles = await getVehicles();

        if (isCancelled || savedVehicles.length === 0) {
          return;
        }

        setVehicles((currentVehicles) =>
          savedVehicles.reduce(
            (nextVehicles, vehicle) => upsertVehicle(nextVehicles, vehicle),
            currentVehicles
          )
        );
      } catch (error) {
        console.warn("Could not load saved vehicles:", error);
      }
    }

    void loadRegisteredVehicles();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleCreateVehicle(payload: CreateVehiclePayload) {
    try {
      setIsSavingVehicle(true);
      setVehicleFormError("");

      const createdVehicle = await createVehicle(payload);

      setVehicles((currentVehicles) =>
        upsertVehicle(currentVehicles, createdVehicle)
      );

      setSelectedVehicleId(createdVehicle.vehicleId);
      setIsAddVehicleOpen(false);
    } catch (error) {
      setVehicleFormError(
        error instanceof Error ? error.message : "Unable to add vehicle."
      );
    } finally {
      setIsSavingVehicle(false);
    }
  }

  function closeAddVehicleModal() {
    if (isSavingVehicle) {
      return;
    }

    setVehicleFormError("");
    setIsAddVehicleOpen(false);
  }

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="eyebrow">INFOTACT • LIVE OPERATIONS</div>
          <h1>FleetDash</h1>
          <p>High-throughput telemetry monitoring with live geofence alerts.</p>
        </div>

        <div
          className={`connection-pill ${
            connectionStatus === "connected" ? "is-connected" : ""
          }`}
        >
          <span className="connection-dot" />
          <span>
            {connectionStatus === "connected" ? "Connected" : connectionStatus}
          </span>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="summary-grid">
          <SummaryCard
            label="CONNECTION"
            value={connectionStatus === "connected" ? "Live" : "Offline"}
            description="Socket.IO live transport"
            tone={connectionStatus === "connected" ? "success" : "danger"}
          />

          <SummaryCard
            label="TRACKED VEHICLES"
            value={vehicles.length}
            description={`${movingVehicleCount} currently moving`}
          />

          <SummaryCard
            label="EVENTS RECEIVED"
            value={eventsReceived}
            description="Current browser session"
          />

          <SummaryCard
            label="LATEST SPEED"
            value={selectedVehicle ? `${selectedVehicle.speed} km/h` : "--"}
            description={
              selectedVehicle
                ? `${selectedVehicle.vehicleId} latest reading`
                : "No vehicle selected"
            }
          />
        </section>

        <section className="main-grid">
          <article className="panel map-panel">
            <div className="panel-heading">
              <div>
                <h2>Live Vehicle Map</h2>
                <p>Click a marker or a table row to select a vehicle.</p>
              </div>

              <button
                className="primary-button"
                type="button"
                onClick={() => setIsAddVehicleOpen(true)}
              >
                + Add vehicle
              </button>
            </div>

            <div className="map-area">
              <FleetMap
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={setSelectedVehicleId}
              />

              <div className="map-legend">
                <span>
                  <i className="legend-dot vehicle-legend" />
                  Vehicle
                </span>

                <span>
                  <i className="legend-square zone-legend" />
                  Geofence zone
                </span>
              </div>
            </div>
          </article>

          <aside className="panel alerts-panel">
            <div className="panel-heading">
              <div>
                <h2>Geofence Alerts</h2>
                <p>Vehicle entry and exit notifications</p>
              </div>
            </div>

            <div className="alerts-content">
              {alerts.length === 0 ? (
                <div className="empty-state">
                  <p>No geofence alerts received yet.</p>
                </div>
              ) : (
                alerts.map((alert, index) => (
                  <div
                    className="alert-row"
                    key={`${alert.vehicleId}-${alert.timestamp}-${index}`}
                  >
                    <span
                      className={`alert-icon ${
                        alert.alertType === "enter"
                          ? "alert-entered"
                          : "alert-exited"
                      }`}
                    >
                      {alert.alertType === "enter" ? "↗" : "↘"}
                    </span>

                    <div className="alert-details">
                      <strong>{alert.vehicleId}</strong>
                      <span>
                        {alert.alertType === "enter" ? "Entered" : "Exited"}{" "}
                        {alert.geofenceId}
                      </span>
                    </div>

                    <time>{formatDashboardTime(alert.timestamp)}</time>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>

        <section className="bottom-grid">
          <article className="panel fleet-table-panel">
            <div className="panel-heading">
              <div>
                <h2>Fleet Status</h2>
                <p>Vehicles from demo data, MongoDB, and live telemetry.</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Status</th>
                    <th>Speed</th>
                    <th>Heading</th>
                    <th>Updated</th>
                  </tr>
                </thead>

                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.vehicleId}
                      className={
                        vehicle.vehicleId === selectedVehicleId
                          ? "selected-row"
                          : ""
                      }
                      onClick={() => setSelectedVehicleId(vehicle.vehicleId)}
                    >
                      <td className="vehicle-id-cell">{vehicle.vehicleId}</td>
                      <td>{vehicle.driverName || "—"}</td>
                      <td>
                        <span
                          className={`status-tag ${
                            vehicle.status === "Moving" ? "moving" : "stopped"
                          }`}
                        >
                          <i />
                          {vehicle.status}
                        </span>
                      </td>
                      <td>{vehicle.speed} km/h</td>
                      <td>{vehicle.heading}°</td>
                      <td>{formatDashboardTime(vehicle.lastUpdate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel selected-panel">
            <div className="panel-heading">
              <div>
                <h2>Selected Vehicle</h2>
                <p>Latest available telemetry.</p>
              </div>
            </div>

            {selectedVehicle && (
              <>
                <div className="selected-vehicle-header">
                  <div className="selected-marker">●</div>

                  <div>
                    <strong>{selectedVehicle.vehicleId}</strong>
                    <span>
                      {selectedVehicle.registrationNumber || "No registration"} •{" "}
                      {selectedVehicle.status}
                    </span>
                  </div>
                </div>

                <div className="selected-metrics">
                  <Metric
                    label="Latitude"
                    value={selectedVehicle.latitude.toFixed(6)}
                  />
                  <Metric
                    label="Longitude"
                    value={selectedVehicle.longitude.toFixed(6)}
                  />
                  <Metric label="Speed" value={`${selectedVehicle.speed} km/h`} />
                  <Metric label="Heading" value={`${selectedVehicle.heading}°`} />
                </div>
              </>
            )}
          </article>
        </section>
      </main>

      {isAddVehicleOpen && (
        <AddVehicleModal
          error={vehicleFormError}
          isSaving={isSavingVehicle}
          onClose={closeAddVehicleModal}
          onSubmit={handleCreateVehicle}
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  tone = "default"
}: {
  label: string;
  value: string | number;
  description: string;
  tone?: "default" | "success" | "danger";
}) {
  return (
    <article className="summary-card">
      <span className="summary-label">{label}</span>
      <strong className={`summary-value ${tone}`}>{value}</strong>
      <span className="summary-description">{description}</span>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AddVehicleModal({
  error,
  isSaving,
  onClose,
  onSubmit
}: {
  error: string;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateVehiclePayload) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateVehiclePayload>({
    vehicleId: "",
    driverName: "",
    registrationNumber: "",
    latitude: 12.9716,
    longitude: 77.5946,
    speed: 0,
    heading: 0
  });

  function updateString(
    field: "vehicleId" | "driverName" | "registrationNumber",
    value: string
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  }

  function updateNumber(
    field: "latitude" | "longitude" | "speed" | "heading",
    value: string
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: Number(value)
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      ...form,
      vehicleId: form.vehicleId.trim().toUpperCase(),
      driverName: form.driverName.trim(),
      registrationNumber: form.registrationNumber.trim().toUpperCase()
    });
  }

  return (
    <div className="modal-backdrop">
      <section
        className="vehicle-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-vehicle-title"
      >
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">FLEET MANAGEMENT</span>
            <h2 id="add-vehicle-title">Add a vehicle</h2>
            <p>Save a truck in MongoDB and broadcast it to all dashboards.</p>
          </div>

          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form className="vehicle-form" onSubmit={handleSubmit}>
          <label>
            Vehicle ID
            <input
              required
              placeholder="TRUCK-006"
              value={form.vehicleId}
              onChange={(event) => updateString("vehicleId", event.target.value)}
            />
          </label>

          <label>
            Driver name
            <input
              placeholder="Arjun Kumar"
              value={form.driverName}
              onChange={(event) => updateString("driverName", event.target.value)}
            />
          </label>

          <label>
            Registration number
            <input
              placeholder="KA-01-AB-1234"
              value={form.registrationNumber}
              onChange={(event) =>
                updateString("registrationNumber", event.target.value)
              }
            />
          </label>

          <div className="form-grid">
            <label>
              Latitude
              <input
                required
                type="number"
                step="any"
                min="-90"
                max="90"
                value={form.latitude}
                onChange={(event) => updateNumber("latitude", event.target.value)}
              />
            </label>

            <label>
              Longitude
              <input
                required
                type="number"
                step="any"
                min="-180"
                max="180"
                value={form.longitude}
                onChange={(event) =>
                  updateNumber("longitude", event.target.value)
                }
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Initial speed
              <input
                required
                type="number"
                min="0"
                value={form.speed}
                onChange={(event) => updateNumber("speed", event.target.value)}
              />
            </label>

            <label>
              Heading
              <input
                required
                type="number"
                min="0"
                max="360"
                value={form.heading}
                onChange={(event) => updateNumber("heading", event.target.value)}
              />
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button
              className="form-cancel"
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button className="form-submit" type="submit" disabled={isSaving}>
              {isSaving ? "Adding..." : "Add vehicle"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FleetMap({
  vehicles,
  selectedVehicleId,
  onSelectVehicle
}: {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (vehicleId: string) => void;
}) {
  const width = 900;
  const height = 500;

  const minLatitude = 12.93;
  const maxLatitude = 13.01;
  const minLongitude = 77.55;
  const maxLongitude = 77.64;

  function project(latitude: number, longitude: number) {
    const x =
      ((longitude - minLongitude) / (maxLongitude - minLongitude)) *
        (width - 120) +
      60;

    const y =
      ((maxLatitude - latitude) / (maxLatitude - minLatitude)) *
        (height - 120) +
      60;

    return { x, y };
  }

  return (
    <svg
      className="map-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Fleet tracking map"
    >
      <defs>
        <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
          <path
            d="M 45 0 L 0 0 0 45"
            fill="none"
            stroke="#1b2a40"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width={width} height={height} fill="#07111f" />
      <rect width={width} height={height} fill="url(#grid)" />

      <path
        d="M 0 130 C 190 80, 350 230, 520 155 S 760 105, 900 150"
        fill="none"
        stroke="#163452"
        strokeWidth="18"
      />

      <path
        d="M 190 500 C 290 405, 340 365, 440 270 S 640 150, 760 0"
        fill="none"
        stroke="#163452"
        strokeWidth="14"
      />

      <rect
        x="380"
        y="195"
        width="220"
        height="145"
        className="geofence-shape"
      />

      <text x="395" y="220" className="geofence-label">
        Infotact Campus Zone
      </text>

      {vehicles.map((vehicle) => {
        const point = project(vehicle.latitude, vehicle.longitude);
        const isSelected = vehicle.vehicleId === selectedVehicleId;

        return (
          <g
            key={vehicle.vehicleId}
            className="map-vehicle"
            transform={`translate(${point.x} ${point.y})`}
            onClick={() => onSelectVehicle(vehicle.vehicleId)}
          >
            <circle
              r={isSelected ? 20 : 15}
              className={isSelected ? "vehicle-ring selected" : "vehicle-ring"}
            />

            <circle r={isSelected ? 9 : 7} className="vehicle-dot" />

            <path
              d="M 0 -23 L -6 -10 L 6 -10 Z"
              className="vehicle-arrow"
              transform={`rotate(${vehicle.heading})`}
            />

            {isSelected && (
              <g transform="translate(18 -42)">
                <rect width="142" height="44" rx="7" className="vehicle-tooltip" />
                <text x="10" y="18" className="tooltip-title">
                  {vehicle.vehicleId}
                </text>
                <text x="10" y="33" className="tooltip-text">
                  {vehicle.speed} km/h • {vehicle.status}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default App;