const http = require("http");
const app = require("./app");
const connectDatabase = require("./config/db");
const { connectRedis } = require("./services/pubsub.service");
const { port } = require("./config/env");
const setupSocket = require("./sockets/socket");

async function startServer() {
  await connectDatabase();
  await connectRedis();

  const server = http.createServer(app);
  setupSocket(server);

  server.listen(port, () => {
    console.log(`FleetDash running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});