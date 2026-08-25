const path = require("node:path");
const { Worker } = require("node:worker_threads");

const workerPath = path.join(__dirname, "../workers/telemetry.worker.js");

function parseTelemetry(payload) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath);

    const cleanup = async () => {
      await worker.terminate();
    };

    worker.once("message", async (result) => {
      await cleanup();

      if (!result.success) {
        return reject(new Error(result.error));
      }

      resolve(result.telemetry);
    });

    worker.once("error", async (error) => {
      await cleanup();
      reject(error);
    });

    worker.postMessage(payload);
  });
}

module.exports = {
  parseTelemetry
};