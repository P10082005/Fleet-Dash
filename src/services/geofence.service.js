const turf = require("@turf/turf");
const geofences = require("../config/geofences");

const vehicleGeofenceStates = new Map();

function getVehicleGeofenceKey(vehicleId, geofenceId) {
  return `${vehicleId}:${geofenceId}`;
}

function checkGeofences(telemetry) {
  const { vehicleId, latitude, longitude, timestamp } = telemetry;

  const point = turf.point([longitude, latitude]);
  const alerts = [];

  for (const geofence of geofences) {
    const isInside = turf.booleanPointInPolygon(point, geofence);
    const stateKey = getVehicleGeofenceKey(vehicleId, geofence.id);
    const previousState = vehicleGeofenceStates.get(stateKey);

    if (previousState === undefined) {
      vehicleGeofenceStates.set(stateKey, isInside);
      continue;
    }

    if (previousState === isInside) {
      continue;
    }

    vehicleGeofenceStates.set(stateKey, isInside);

    if (isInside && geofence.properties.alertOnEnter) {
      alerts.push({
        alertType: "GEOFENCE_ENTER",
        vehicleId,
        geofenceId: geofence.id,
        geofenceName: geofence.name,
        latitude,
        longitude,
        timestamp
      });
    }

    if (!isInside && geofence.properties.alertOnExit) {
      alerts.push({
        alertType: "GEOFENCE_EXIT",
        vehicleId,
        geofenceId: geofence.id,
        geofenceName: geofence.name,
        latitude,
        longitude,
        timestamp
      });
    }
  }

  return alerts;
}

function clearVehicleGeofenceState(vehicleId) {
  for (const key of vehicleGeofenceStates.keys()) {
    if (key.startsWith(`${vehicleId}:`)) {
      vehicleGeofenceStates.delete(key);
    }
  }
}

module.exports = {
  checkGeofences,
  clearVehicleGeofenceState
};