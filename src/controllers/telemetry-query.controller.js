const TelemetryBucket = require("../models/TelemetryBucket");

async function getVehicleTelemetry(req, res) {
  try {
    const { vehicleId } = req.params;
    const { from, to, limit = 24 } = req.query;

    const query = {
      vehicleId
    };

    if (from || to) {
      query.bucketStart = {};

      if (from) {
        query.bucketStart.$gte = new Date(from);
      }

      if (to) {
        query.bucketStart.$lte = new Date(to);
      }
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 24, 1), 168);

    const buckets = await TelemetryBucket.find(query)
      .sort({ bucketStart: -1 })
      .limit(safeLimit)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        vehicleId,
        bucketCount: buckets.length,
        buckets
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
  getVehicleTelemetry
};