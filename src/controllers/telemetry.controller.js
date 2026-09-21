const {
  parseTelemetry,
  pool
} = require("../services/ingestion.service");

const {
  saveTelemetryPoint
} = require("../services/bucket.service");

const {
  publishTelemetry,
  publishAlert
} = require("../services/pubsub.service");

const {
  checkGeofences
} = require("../services/geofence.service");

const MAX_QUEUE_LENGTH = 1000;

async function ingestTelemetry(req, res) {
  try {
    if (pool.queue.length >= MAX_QUEUE_LENGTH) {
      return res.status(429).json({
        success: false,
        error: "Telemetry queue is busy. Please retry shortly."
      });
    }

    const telemetry = await parseTelemetry(req.body);

    const bucket = await saveTelemetryPoint(telemetry);

    const alerts = checkGeofences(telemetry);

    await publishTelemetry(telemetry);

    await Promise.all(
      alerts.map((alert) => publishAlert(alert))
    );

    return res.status(202).json({
      success: true,
      message: "Telemetry stored successfully",
      data: {
        vehicleId: bucket.vehicleId,
        bucketStart: bucket.bucketStart,
        bucketEnd: bucket.bucketEnd,
        pointCount: bucket.pointCount,
        alerts
      }
    });
  } catch (error) {
    console.error("Telemetry ingestion failed:", error.message);

    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  ingestTelemetry
};