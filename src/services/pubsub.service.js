const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const { redisUrl } = require("../config/env");

const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

async function connectRedis() {
  pubClient.on("error", (error) => {
    console.error("Redis publisher error:", error);
  });

  subClient.on("error", (error) => {
    console.error("Redis subscriber error:", error);
  });

  if (!pubClient.isOpen) {
    await pubClient.connect();
  }

  if (!subClient.isOpen) {
    await subClient.connect();
  }
}

function attachRedisAdapter(io) {
  io.adapter(createAdapter(pubClient, subClient));
}

async function publishTelemetry(telemetry) {
  await pubClient.publish("fleet:telemetry", JSON.stringify(telemetry));
}

async function subscribeTelemetry(handler) {
  await subClient.subscribe("fleet:telemetry", (message) => {
    handler(JSON.parse(message));
  });
}

module.exports = {
  connectRedis,
  attachRedisAdapter,
  publishTelemetry,
  subscribeTelemetry
};