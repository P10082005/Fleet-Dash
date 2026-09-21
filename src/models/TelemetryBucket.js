const mongoose = require("mongoose");

const telemetryPointSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    speed: {
      type: Number,
      required: true
    },
    heading: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const telemetryBucketSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      index: true
    },
    bucketStart: {
      type: Date,
      required: true
    },
    bucketEnd: {
      type: Date,
      required: true
    },
    pointCount: {
      type: Number,
      default: 0
    },
    points: {
      type: [telemetryPointSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

telemetryBucketSchema.index(
  {
    vehicleId: 1,
    bucketStart: -1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  "TelemetryBucket",
  telemetryBucketSchema
);