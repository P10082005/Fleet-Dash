const TelemetryBucket = require("../models/TelemetryBucket");

function getHourBucket(dateInput) {
  const timestamp = new Date(dateInput);

  if (Number.isNaN(timestamp.getTime())) {
    throw new Error("Invalid telemetry timestamp");
  }

  const bucketStart = new Date(timestamp);
  bucketStart.setUTCMinutes(0, 0, 0);

  const bucketEnd = new Date(bucketStart);
  bucketEnd.setUTCHours(bucketEnd.getUTCHours() + 1);

  return { bucketStart, bucketEnd };
}

async function saveTelemetryPoint(point) {
  const { bucketStart, bucketEnd } = getHourBucket(point.timestamp);

  return TelemetryBucket.findOneAndUpdate(
    {
      vehicleId: point.vehicleId,
      bucketStart
    },
    {
      $setOnInsert: {
        vehicleId: point.vehicleId,
        bucketStart,
        bucketEnd
      },
      $push: {
        points: {
          timestamp: point.timestamp,
          latitude: point.latitude,
          longitude: point.longitude,
          speed: point.speed,
          heading: point.heading
        }
      },
      $inc: {
        pointCount: 1
      }
    },
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  );
}

module.exports = {
  getHourBucket,
  saveTelemetryPoint
};