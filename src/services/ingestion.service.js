const os = require("node:os");
const WorkerPool = require("./worker-pool.service");

const poolSize = Math.max(2, Math.min(os.cpus().length - 1, 8));
const pool = new WorkerPool(poolSize);

function parseTelemetry(payload) {
  return pool.execute(payload);
}

module.exports = {
  parseTelemetry,
  pool
};