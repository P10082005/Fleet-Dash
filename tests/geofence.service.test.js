const {
  checkGeofences,
  clearVehicleGeofenceState
} = require("../src/services/geofence.service");

describe("Geofence service", () => {
  const vehicleId = "TEST-GEOFENCE-VEHICLE";

  afterEach(() => {
    clearVehicleGeofenceState(vehicleId);
  });

  it("creates an entry alert when a vehicle moves from outside to inside", () => {
    const outside = {
      vehicleId,
      latitude: 12.9600,
      longitude: 77.5800,
      timestamp: new Date().toISOString()
    };

    const inside = {
      vehicleId,
      latitude: 12.9720,
      longitude: 77.5960,
      timestamp: new Date().toISOString()
    };

    expect(checkGeofences(outside)).toEqual([]);

    const alerts = checkGeofences(inside);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].alertType).toBe("GEOFENCE_ENTER");
    expect(alerts[0].vehicleId).toBe(vehicleId);
  });
});