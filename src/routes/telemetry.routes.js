const express = require("express");

const {
  ingestTelemetry
} = require("../controllers/telemetry.controller");

const {
  getVehicleTelemetry
} = require("../controllers/telemetry-query.controller");

const router = express.Router();

router.post("/", ingestTelemetry);

router.get("/:vehicleId", getVehicleTelemetry);

module.exports = router;