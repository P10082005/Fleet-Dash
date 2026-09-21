const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {
  it("returns the service health status", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.service).toBe("fleetdash-api");
    expect(response.body.timestamp).toBeDefined();
  });
});