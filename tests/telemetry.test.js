const request = require("supertest");
const app = require("../src/app");

describe("Telemetry API", () => {
  it("should accept valid telemetry", async () => {
    const res = await request(app)
      .post("/api/telemetry")
      .send({
        vehicleId: "TRUCK-TEST",
        latitude: 12.9716,
        longitude: 77.5946,
        speed: 45,
        heading: 90,
        timestamp: new Date().toISOString()
      });

    expect(res.statusCode).toBe(202);
    expect(res.body.success).toBe(true);
  });
});