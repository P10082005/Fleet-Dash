const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    driverName: {
      type: String,
      trim: true,
      default: ""
    },
    registrationNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: ""
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
      default: 0
    },
    heading: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["Moving", "Stopped"],
      default: "Stopped"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);