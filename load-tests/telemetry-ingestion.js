import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    telemetry_load: {
      executor: "ramping-arrival-rate",
      startRate: 100,
      timeUnit: "1s",
      preAllocatedVUs: 100,
      maxVUs: 3000,
      stages: [
        { target: 500, duration: "30s" },
        { target: 1000, duration: "30s" },
        { target: 2000, duration: "60s" }
      ]
    }
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"]
  }
};

export default function () {
  const vehicleNumber = Math.floor(Math.random() * 5000) + 1;

  const payload = JSON.stringify({
    vehicleId: `TRUCK-${vehicleNumber}`,
    latitude: 12.94 + Math.random() * 0.06,
    longitude: 77.55 + Math.random() * 0.09,
    speed: Math.round(20 + Math.random() * 70),
    heading: Math.round(Math.random() * 359),
    timestamp: new Date().toISOString()
  });

  const response = http.post(
    "http://localhost:5000/api/telemetry",
    payload,
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  check(response, {
    "telemetry accepted": (result) => result.status === 202
  });

  sleep(0.01);
}