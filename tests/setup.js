const { pool } = require("../src/services/ingestion.service");

afterAll(async () => {
  await pool.close();
});