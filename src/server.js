require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");

const connectDB = require("./config/db");
const setupSocket = require("./sockets/socket");

const {
  connectRedis
} = require("./services/pubsub.service");

const telemetryRoutes = require("./routes/telemetry.routes");
const vehiclesRoutes = require("./routes/vehicles.routes");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/telemetry", telemetryRoutes);
app.use("/api/vehicles", vehiclesRoutes);

app.use((error, _req, res, _next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

async function startServer() {
  try {
    // 1. Connect MongoDB first.
    await connectDB();

    // 2. Connect Redis publisher/subscriber first.
    await connectRedis();

    // 3. Only NOW create Socket.IO and Redis subscriptions.
    const io = setupSocket(server);

    // 4. Allow routes such as POST /api/vehicles to emit events.
    app.set("io", io);

    // 5. Start the HTTP server only after all dependencies are ready.
    server.listen(PORT, () => {
      console.log(`FleetDash running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start FleetDash:", error);
    process.exit(1);
  }
}

startServer();