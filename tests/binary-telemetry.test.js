const {
  encodeTelemetry,
  decodeTelemetry
} = require("../src/services/binary-telemetry.service");

describe("Binary telemetry encoding", () => {
  it("encodes and decodes telemetry values", () => {
    const telemetry = {
      timestamp: "2026-09-17T10:00:00.000Z",
      latitude: 12.9716,
      longitude: 77.5946,
      speed: 45,
      heading: 90
    };

    const buffer = encodeTelemetry(telemetry);
    const decoded = decodeTelemetry(buffer);

    expect(decoded.latitude).toBeCloseTo(12.9716, 4);
    expect(decoded.longitude).toBeCloseTo(77.5946, 4);
    expect(decoded.speed).toBeCloseTo(45, 2);
    expect(decoded.heading).toBeCloseTo(90, 2);
  });
});