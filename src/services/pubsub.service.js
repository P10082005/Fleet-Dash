const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const { redisUrl } = require("../config/env");

const TELEMETRY_CHANNEL = "fleet:telemetry";
const ALERT_CHANNEL = "fleet:alerts";

const pubClient = createClient({
  url: redisUrl
});

const subClient = pubClient.duplicate();

let connected = false;
let listenersAttached = false;

function attachRedisListeners() {
  if (listenersAttached) return;

  listenersAttached = true;

  pubClient.on("error", (error) => {
    console.error("Redis publisher error:", error.message);
  });

  subClient.on("error", (error) => {
    console.error("Redis subscriber error:", error.message);
  });

  pubClient.on("connect", () => {
    console.log("Redis publisher connected");
  });

  subClient.on("connect", () => {
    console.log("Redis subscriber connected");
  });
}

async function connectRedis() {
  if (connected) return;

  attachRedisListeners();

  if (!pubClient.isOpen) {
    await pubClient.connect();
  }

  if (!subClient.isOpen) {
    await subClient.connect();
  }

  connected = true;
  console.log("Redis Pub/Sub ready");
}

function attachRedisAdapter(io) {
  io.adapter(createAdapter(pubClient, subClient));
}

async function publishTelemetry(telemetry) {
  if (!connected) {
    throw new Error("Redis is not connected");
  }

  await pubClient.publish(
    TELEMETRY_CHANNEL,
    JSON.stringify(telemetry)
  );
}

async function publishAlert(alert) {
  if (!connected) {
    throw new Error("Redis is not connected");
  }

  await pubClient.publish(
    ALERT_CHANNEL,
    JSON.stringify(alert)
  );
}

async function subscribeTelemetry(handler) {
  if (!connected) {
    throw new Error("Redis is not connected");
  }

  await subClient.subscribe(TELEMETRY_CHANNEL, (message) => {
    try {
      handler(JSON.parse(message));
    } catch (error) {
      console.error("Failed to parse telemetry Pub/Sub message:", error.message);
    }
  });
}

async function subscribeAlerts(handler) {
  if (!connected) {
    throw new Error("Redis is not connected");
  }

  await subClient.subscribe(ALERT_CHANNEL, (message) => {
    try {
      handler(JSON.parse(message));
    } catch (error) {
      console.error("Failed to parse alert Pub/Sub message:", error.message);
    }
  });
}

async function closeRedis() {
  connected = false;

  if (subClient.isOpen) {
    await subClient.quit();
  }

  if (pubClient.isOpen) {
    await pubClient.quit();
  }
}

module.exports = {
  connectRedis,
  attachRedisAdapter,
  publishTelemetry,
  publishAlert,
  subscribeTelemetry,
  subscribeAlerts,
  closeRedis
};