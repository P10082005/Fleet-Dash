const path = require("node:path");
const { Worker } = require("node:worker_threads");

class WorkerPool {
  constructor(size = 4) {
    this.size = size;
    this.workers = [];
    this.queue = [];
    this.workerPath = path.join(__dirname, "../workers/telemetry.worker.js");

    for (let i = 0; i < size; i += 1) {
      this.addWorker();
    }
  }

  addWorker() {
    const worker = new Worker(this.workerPath);

    const item = {
      worker,
      busy: false,
      resolve: null,
      reject: null
    };

    worker.on("message", (result) => {
      item.busy = false;

      if (result.success) {
        item.resolve(result.telemetry);
      } else {
        item.reject(new Error(result.error));
      }

      item.resolve = null;
      item.reject = null;
      this.processQueue();
    });

    worker.on("error", (error) => {
      item.busy = false;

      if (item.reject) {
        item.reject(error);
      }

      item.resolve = null;
      item.reject = null;
      this.processQueue();
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker exited with code ${code}`);
      }
    });

    this.workers.push(item);
  }

  execute(payload) {
    return new Promise((resolve, reject) => {
      this.queue.push({ payload, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    const availableWorker = this.workers.find((item) => !item.busy);
    const nextTask = this.queue.shift();

    if (!availableWorker || !nextTask) {
      if (nextTask) this.queue.unshift(nextTask);
      return;
    }

    availableWorker.busy = true;
    availableWorker.resolve = nextTask.resolve;
    availableWorker.reject = nextTask.reject;
    availableWorker.worker.postMessage(nextTask.payload);
  }

  async close() {
    await Promise.all(
      this.workers.map((item) => item.worker.terminate())
    );
  }
}

module.exports = WorkerPool;