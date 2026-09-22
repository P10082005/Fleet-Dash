const express = require("express");
const Vehicle = require("../models/Vehicle");

const router = express.Router();

function toDashboardVehicle(vehicle) {
  const source = vehicle.toObject ? vehicle.toObject() : vehicle;

  return {
    vehicleId: source.vehicleId,
    driverName: source.driverName || "",
    registrationNumber: source.registrationNumber || "",
    latitude: source.latitude,
    longitude: source.longitude,
    speed: source.speed ?? 0,
    heading: source.heading ?? 0,
    status: source.status || (source.speed > 0 ? "Moving" : "Stopped"),
    lastUpdate: source.updatedAt
      ? new Date(source.updatedAt).toISOString()
      : new Date().toISOString()
  };
}

function validateVehicleInput(body) {
  const vehicleId = String(body.vehicleId || "").trim().toUpperCase();
  const driverName = String(body.driverName || "").trim();
  const registrationNumber = String(body.registrationNumber || "")
    .trim()
    .toUpperCase();

  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const speed = Number(body.speed ?? 0);
  const heading = Number(body.heading ?? 0);

  if (!vehicleId) {
    return { error: "vehicleId is required." };
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return { error: "latitude must be between -90 and 90." };
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { error: "longitude must be between -180 and 180." };
  }

  if (!Number.isFinite(speed) || speed < 0) {
    return { error: "speed must be a non-negative number." };
  }

  if (!Number.isFinite(heading) || heading < 0 || heading > 360) {
    return { error: "heading must be between 0 and 360." };
  }

  return {
    value: {
      vehicleId,
      driverName,
      registrationNumber,
      latitude,
      longitude,
      speed,
      heading
    }
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      vehicles: vehicles.map(toDashboardVehicle)
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const validation = validateVehicleInput(req.body);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const input = validation.value;

    const existingVehicle = await Vehicle.findOne({
      vehicleId: input.vehicleId
    });

    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: `${input.vehicleId} already exists.`
      });
    }

    const vehicle = await Vehicle.create({
      ...input,
      status: input.speed > 0 ? "Moving" : "Stopped"
    });

    const dashboardVehicle = toDashboardVehicle(vehicle);
    const io = req.app.get("io");

    if (io) {
      io.emit("vehicle:created", dashboardVehicle);
    }

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully.",
      vehicle: dashboardVehicle
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This vehicle ID already exists."
      });
    }

    next(error);
  }
});

module.exports = router;