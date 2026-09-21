const BINARY_TELEMETRY_SIZE = 32;

function encodeTelemetry(telemetry) {
  const buffer = new ArrayBuffer(BINARY_TELEMETRY_SIZE);
  const view = new DataView(buffer);

  view.setFloat64(0, new Date(telemetry.timestamp).getTime(), true);
  view.setFloat64(8, Number(telemetry.latitude), true);
  view.setFloat64(16, Number(telemetry.longitude), true);
  view.setFloat32(24, Number(telemetry.speed), true);
  view.setFloat32(28, Number(telemetry.heading), true);

  return buffer;
}

function decodeTelemetry(buffer) {
  const view = new DataView(buffer);

  return {
    timestamp: new Date(view.getFloat64(0, true)).toISOString(),
    latitude: view.getFloat64(8, true),
    longitude: view.getFloat64(16, true),
    speed: view.getFloat32(24, true),
    heading: view.getFloat32(28, true)
  };
}

module.exports = {
  BINARY_TELEMETRY_SIZE,
  encodeTelemetry,
  decodeTelemetry
};