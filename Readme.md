# FleetDash

FleetDash is a high-throughput fleet telemetry backend built with Node.js, Express, MongoDB, Redis, Socket.IO, and worker threads. It receives vehicle telemetry, processes it efficiently, stores it in MongoDB using hourly buckets, and broadcasts live updates to connected clients.

## Features

- Telemetry ingestion through REST API.
- CPU-heavy parsing handled with worker threads.
- Hourly bucket storage in MongoDB.
- Redis Pub/Sub for real-time broadcasting.
- Socket.IO support for live dashboard updates.
- Backpressure handling for burst traffic.
- Health check endpoint for quick verification.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- Socket.IO
- Worker Threads

## How It Works

1. A vehicle sends telemetry data to the `POST /api/telemetry` endpoint.
2. The payload is processed in a worker thread so the main server stays responsive.
3. The cleaned telemetry data is stored in MongoDB in an hourly bucket document.
4. MongoDB `$push` appends the point to the bucket’s `points` array, and `$inc` increases the `pointCount` atomically [web:151][web:149].
5. The saved telemetry is published to Redis Pub/Sub for live broadcasting.
6. Socket.IO clients receive the update instantly through the `telemetry:update` event.
7. The dashboard can display the latest vehicle data in real time.

Worker threads are useful for CPU-intensive JavaScript operations, while Redis Pub/Sub is designed for broadcasting real-time events to many consumers [web:5][web:52].

## Project Structure

```text
src/
├── app.js
├── server.js
├── config/
│   ├── db.js
│   └── env.js
├── controllers/
│   └── telemetry.controller.js
├── models/
│   └── TelemetryBucket.js
├── routes/
│   └── telemetry.routes.js
├── services/
│   ├── bucket.service.js
│   ├── ingestion.service.js
│   ├── pubsub.service.js
│   └── worker-pool.service.js
├── sockets/
│   └── socket.js
└── workers/
    └── telemetry.worker.js
```

## Prerequisites

- Node.js 18+ or newer.
- MongoDB running locally or in Docker.
- Redis running locally or in Docker.

## Installation

```bash
git clone <your-repo-url>
cd Fleet-Dash
npm install
```

If you are using the Socket.IO Redis adapter package in PowerShell, install it like this:

```powershell
npm install "@socket.io/redis-adapter"
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fleetdash
REDIS_URL=redis://127.0.0.1:6379
```

## Running the Project

Start MongoDB and Redis first, then run:

```bash
npm run dev
```

The API will start at:

```text
http://localhost:5000
```

## API Endpoints

### Health Check

```http
GET /health
```

Example response:

```json
{
  "success": true,
  "service": "fleetdash-api",
  "timestamp": "2026-09-03T00:00:00.000Z"
}
```

### Telemetry Ingestion

```http
POST /api/telemetry
```

Example request body:

```json
{
  "vehicleId": "TRUCK-001",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "speed": 45,
  "heading": 90,
  "timestamp": "2026-09-03T00:00:00.000Z"
}
```

Example success response:

```json
{
  "success": true,
  "message": "Telemetry stored successfully",
  "data": {
    "vehicleId": "TRUCK-001",
    "bucketStart": "2026-09-03T00:00:00.000Z",
    "bucketEnd": "2026-09-03T01:00:00.000Z",
    "pointCount": 1
  }
}
```

## MongoDB Storage Design

Telemetry is grouped into hourly bucket documents by `vehicleId`. Each bucket contains:

- `vehicleId`
- `bucketStart`
- `bucketEnd`
- `points[]`
- `pointCount`

This design keeps related telemetry together and makes time-based queries efficient. MongoDB update operators such as `$push` and `$inc` are used to append new points and update the counter in a single atomic document update [web:151][web:149][web:42].

## Real-Time Flow

- After telemetry is saved, it is published to Redis Pub/Sub.
- Socket.IO subscribes to the Redis channel.
- Connected clients receive `telemetry:update` events immediately.

Redis Pub/Sub is ideal for live broadcast-style updates where many consumers need the same event at once [web:52].

## Testing

You can test the ingestion endpoint with PowerShell:

```powershell
$body = @{
  vehicleId = "TRUCK-001"
  latitude = 12.9716
  longitude = 77.5946
  speed = 45
  heading = 90
  timestamp = (Get-Date).ToUniversalTime().ToString("o")
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:5000/api/telemetry" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Check MongoDB data in `mongosh`:

```javascript
use fleetdash
db.telemetrybuckets.find().pretty()
```

## Troubleshooting

- If `npm run dev` fails, confirm MongoDB is running.
- If Redis connection fails, start Redis on port `6379`.
- If the API returns `Cannot POST`, verify the route is mounted correctly.
- If a module is missing, confirm the file path in `require()` is correct.

## License

This project is for internship and academic use.