const geofences = [
  {
    id: "infotact-campus-zone",
    name: "Infotact Campus Zone",
    type: "Feature",
    properties: {
      alertOnEnter: true,
      alertOnExit: true
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [77.5900, 12.9680],
          [77.6050, 12.9680],
          [77.6050, 12.9800],
          [77.5900, 12.9800],
          [77.5900, 12.9680]
        ]
      ]
    }
  }
];

module.exports = geofences;