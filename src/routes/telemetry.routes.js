const express = require("express");
const {
  ingestTelemetry
} = require("../controllers/telemetry.controller");

const router = express.Router();

router.post("/", ingestTelemetry);

module.exports = router;