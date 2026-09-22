const { Server } = require("socket.io");

const {
  subscribeTelemetry,
  subscribeAlerts,
  attachRedisAdapter
} = require("../services/pubsub.service");

const {
  encodeTelemetry
} = require("../services/binary-telemetry.service");

function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]
  });

  attachRedisAdapter(io);

  io.on("connection", (socket) => {
    console.log(`✅ Frontend Socket.IO client connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(`❌ Socket.IO client disconnected: ${socket.id} | ${reason}`);
    });
  });

  subscribeTelemetry((telemetry) => {
    console.log(
      `📡 Redis telemetry received for ${telemetry.vehicleId}. Broadcasting to ${io.engine.clientsCount} client(s).`
    );

    const binaryPayload = encodeTelemetry(telemetry);

    io.emit("telemetry:binary", {
      vehicleId: telemetry.vehicleId,
      payload: binaryPayload
    });

    io.emit("telemetry:update", telemetry);
  });

  subscribeAlerts((alert) => {
    console.log(
      `🚨 Geofence alert for ${alert.vehicleId}: ${alert.alertType}`
    );

    io.emit("geofence:alert", alert);
  });

  return io;
}

module.exports = setupSocket;