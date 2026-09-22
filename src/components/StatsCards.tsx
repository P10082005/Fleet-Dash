import type { ConnectionStatus, Telemetry } from "../types/telemetry";

type StatsCardsProps = {
  connectionStatus: ConnectionStatus;
  vehicleCount: number;
  eventCount: number;
  latestTelemetry: Telemetry | null;
};

export default function StatsCards({
  connectionStatus,
  vehicleCount,
  eventCount,
  latestTelemetry
}: StatsCardsProps) {
  const statusLabel =
    connectionStatus === "connected"
      ? "Live"
      : connectionStatus === "connecting"
        ? "Connecting"
        : "Offline";

  return (
    <section className="stats-grid">
      <article className="stat-card">
        <span>Connection</span>
        <strong className={connectionStatus}>{statusLabel}</strong>
        <small>Socket.IO live transport</small>
      </article>

      <article className="stat-card">
        <span>Tracked Vehicles</span>
        <strong>{vehicleCount}</strong>
        <small>Unique latest positions</small>
      </article>

      <article className="stat-card">
        <span>Events Received</span>
        <strong>{eventCount}</strong>
        <small>Current browser session</small>
      </article>

      <article className="stat-card">
        <span>Latest Speed</span>
        <strong>
          {latestTelemetry
            ? `${latestTelemetry.speed.toFixed(1)} km/h`
            : "--"}
        </strong>
        <small>
          {latestTelemetry
            ? latestTelemetry.vehicleId
            : "No live event yet"}
        </small>
      </article>
    </section>
  );
}