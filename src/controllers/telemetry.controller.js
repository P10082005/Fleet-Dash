const { parseTelemetry } = require("../services/ingestion.service");
const { saveTelemetryPoint } = require("../services/bucket.service");
const { publishTelemetry } = require("../services/pubsub.service");

async function ingestTelemetry(req, res) {
  try {
    const telemetry = await parseTelemetry(req.body);
    const bucket = await saveTelemetryPoint(telemetry);

    await publishTelemetry(telemetry);

    return res.status(202).json({
      success: true,
      message: "Telemetry stored successfully",
      data: {
        vehicleId: bucket.vehicleId,
        bucketStart: bucket.bucketStart,
        bucketEnd: bucket.bucketEnd,
        pointCount: bucket.pointCount
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  ingestTelemetry
};