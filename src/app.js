const express = require("express");
const path = require("path");
const telemetryRoutes = require("./routes/telemetry.routes");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "fleetdash-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/telemetry", telemetryRoutes);

module.exports = app;