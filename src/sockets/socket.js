const { Server } = require("socket.io");
const { subscribeTelemetry, attachRedisAdapter } = require("../services/pubsub.service");

function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*"
    },
    transports: ["websocket", "polling"]
  });

  attachRedisAdapter(io);

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join-fleet", (fleetId) => {
      socket.join(`fleet:${fleetId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  subscribeTelemetry((telemetry) => {
    io.emit("telemetry:update", telemetry);
  });

  return io;
}

module.exports = setupSocket;