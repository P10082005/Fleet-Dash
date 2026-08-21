const mongoose = require("mongoose");

const telemetryPointSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    speed: {
      type: Number,
      default: 0,
      min: 0
    },
    heading: {
      type: Number,
      default: 0,
      min: 0,
      max: 360
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
      trim: true
    },
    bucketStart: {
      type: Date,
      required: true
    },
    bucketEnd: {
      type: Date,
      required: true
    },
    points: {
      type: [telemetryPointSchema],
      default: []
    },
    pointCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

telemetryBucketSchema.index(
  {
    vehicleId: 1,
    bucketStart: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  "TelemetryBucket",
  telemetryBucketSchema
);