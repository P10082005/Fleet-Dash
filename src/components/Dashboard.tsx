import { useState } from "react";
import { useFleetSocket } from "../hooks/useFleetSocket";
import { CanvasMap } from "../components/CanvasMap";
import { AlertPanel } from "../components/AlertPanel";
import type { GeofenceAlert, Telemetry } from "../types/telemetry";

const MAP_BOUNDS = {
    minLatitude: 12.94,
    maxLatitude: 13.00,
    minLongitude: 77.55,
    maxLongitude: 77.64
};

export function Dashboard() {
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);

    const { connectionStatus } = useFleetSocket({
        onTelemetry: (newTelemetry) => {
            setTelemetry(newTelemetry);
        },
        onAlert: (newAlert) => {
            setAlerts((prev) => [...prev, newAlert]);
        }
    });

    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <span className="logo-icon">🚛</span>
                        <h1 className="logo-text">FleetDash</h1>
                    </div>
                    <div className={`status-badge ${connectionStatus}`}>
                        <span className="status-dot" />
                        <span className="status-text">
                            {connectionStatus === "connected" ? "Live Connection" : "Disconnected"}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                {/* Left Column */}
                <div className="left-column">
                    {/* Map Card */}
                    <div className="card map-card">
                        <div className="card-header">
                            <h2 className="card-title">
                                <span className="card-icon">📍</span>
                                Live Vehicle Tracking
                            </h2>
                        </div>
                        <div className="card-body">
                            {telemetry ? (
                                <CanvasMap telemetry={telemetry} bounds={MAP_BOUNDS} />
                            ) : (
                                <div className="waiting-state">
                                    <div className="spinner" />
                                    <p className="waiting-text">Waiting for live telemetry data...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Card */}
                    {telemetry && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">
                                    <span className="card-icon">📊</span>
                                    Real-time Statistics
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="stats-grid">
                                    <StatCard
                                        label="Speed"
                                        value={telemetry.speed}
                                        unit="km/h"
                                        icon="⚡"
                                        color="#3b82f6"
                                    />
                                    <StatCard
                                        label="Heading"
                                        value={telemetry.heading}
                                        unit="°"
                                        icon="🧭"
                                        color="#10b981"
                                    />
                                    <StatCard
                                        label="Latitude"
                                        value={telemetry.latitude.toFixed(6)}
                                        unit=""
                                        icon="📍"
                                        color="#8b5cf6"
                                    />
                                    <StatCard
                                        label="Longitude"
                                        value={telemetry.longitude.toFixed(6)}
                                        unit=""
                                        icon="📍"
                                        color="#f59e0b"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="right-column">
                    {/* Vehicle Info Card */}
                    {telemetry && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">
                                    <span className="card-icon">🚗</span>
                                    {telemetry.vehicleId}
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="info-list">
                                    <InfoRow label="Vehicle ID" value={telemetry.vehicleId} />
                                    <InfoRow
                                        label="Last Update"
                                        value={new Date(telemetry.timestamp).toLocaleTimeString()}
                                    />
                                    <InfoRow
                                        label="Position"
                                        value={`${telemetry.latitude.toFixed(4)}, ${telemetry.longitude.toFixed(4)}`}
                                    />
                                    <InfoRow label="Speed" value={`${telemetry.speed} km/h`} />
                                    <InfoRow label="Heading" value={`${telemetry.heading}°`} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Alerts Card */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">
                                <span className="card-icon">🔔</span>
                                Recent Alerts
                            </h2>
                        </div>
                        <div className="card-body">
                            <AlertPanel alerts={alerts} />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p className="footer-text">
                    FleetDash v1.0 • Real-time Vehicle Telemetry Dashboard
                </p>
            </footer>
        </div>
    );
}

// Stat Card Component
function StatCard({
    label,
    value,
    unit,
    icon,
    color
}: {
    label: string;
    value: string | number;
    unit: string;
    icon: string;
    color: string;
}) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
                {icon}
            </div>
            <div className="stat-content">
                <span className="stat-label">{label}</span>
                <span className="stat-value">
                    {value}
                    <small className="stat-unit">{unit}</small>
                </span>
            </div>
        </div>
    );
}

// Info Row Component
function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="info-row">
            <span className="info-label">{label}</span>
            <span className="info-value">{value}</span>
        </div>
    );
}