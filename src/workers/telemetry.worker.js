const { parentPort } = require("node:worker_threads");

function normalizeTelemetry(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Telemetry must be an object");
  }

  const vehicleId = String(input.vehicleId || "").trim();
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  const speed = Number(input.speed ?? 0);
  const heading = Number(input.heading ?? 0);
  const timestamp = input.timestamp ? new Date(input.timestamp) : new Date();

  if (!vehicleId) {
    throw new Error("vehicleId is required");
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error("Invalid latitude");
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("Invalid longitude");
  }

  if (!Number.isFinite(speed) || speed < 0) {
    throw new Error("Invalid speed");
  }

  if (!Number.isFinite(heading) || heading < 0 || heading > 360) {
    throw new Error("Invalid heading");
  }

  if (Number.isNaN(timestamp.getTime())) {
    throw new Error("Invalid timestamp");
  }

  return {
    vehicleId,
    latitude,
    longitude,
    speed,
    heading,
    timestamp: timestamp.toISOString()
  };
}

parentPort.on("message", (message) => {
  try {
    const telemetry = normalizeTelemetry(message);
    parentPort.postMessage({
      success: true,
      telemetry
    });
  } catch (error) {
    parentPort.postMessage({
      success: false,
      error: error.message
    });
  }
});