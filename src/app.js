const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const telemetryRoutes = require("./routes/telemetry.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "fleetdash-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/telemetry", telemetryRoutes);

module.exports = app;