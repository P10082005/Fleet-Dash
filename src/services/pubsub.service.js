const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const { redisUrl } = require("../config/env");

const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

let connected = false;

function attachRedisListeners() {
  pubClient.on("error", (error) => {
    console.error("Redis publisher error:", error.message);
  });

  subClient.on("error", (error) => {
    console.error("Redis subscriber error:", error.message);
  });
}

async function connectRedis() {
  if (connected) return;

  attachRedisListeners();

  await pubClient.connect();
  await subClient.connect();

  connected = true;
}

function attachRedisAdapter(io) {
  io.adapter(createAdapter(pubClient, subClient));
}

async function publishTelemetry(telemetry) {
  if (!connected) return;
  await pubClient.publish("fleet:telemetry", JSON.stringify(telemetry));
}

async function subscribeTelemetry(handler) {
  if (!connected) return;

  await subClient.subscribe("fleet:telemetry", (message) => {
    handler(JSON.parse(message));
  });
}

async function closeRedis() {
  if (pubClient.isOpen) await pubClient.quit();
  if (subClient.isOpen) await subClient.quit();
  connected = false;
}

module.exports = {
  connectRedis,
  attachRedisAdapter,
  publishTelemetry,
  subscribeTelemetry,
  closeRedis
};