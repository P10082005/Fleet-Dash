# FleetDash

FleetDash is a high-throughput, event-driven fleet telemetry dashboard built with Node.js, Express, MongoDB, Redis, and Socket.IO. It is designed to ingest thousands of vehicle telemetry events, store them efficiently in MongoDB bucket-style documents, and broadcast real-time updates to connected clients.

## Features

- High-throughput telemetry ingestion.
- CPU-heavy parsing handled with Node.js worker threads.
- Hourly bucket storage in MongoDB for efficient querying.
- Redis Pub/Sub for live event broadcasting.
- Socket.IO for real-time dashboard updates.
- Validation for telemetry payloads.
- Ready for scaling and load testing.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- Socket.IO
- Worker Threads

## How It Works

1. A client sends telemetry data to the `POST /api/telemetry` endpoint.
2. The request payload is passed to a worker thread for validation and normalization.
3. The cleaned telemetry data is stored in MongoDB using an hourly bucket pattern.
4. The same telemetry event is published to Redis Pub/Sub.
5. Socket.IO subscribers receive the event instantly and update the live dashboard.

Worker threads are useful for CPU-intensive JavaScript operations, while Redis Pub/Sub is meant for broadcasting real-time events to many consumers [web:5][web:52]. MongoDB update operators such as `$push` and `$inc` are used to append telemetry points to bucket documents and increment the stored point count [web:42][web:150].

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

- Node.js 18+ or 20+
- MongoDB running locally or in Docker
- Redis running locally or in Docker

## Installation

```bash
git clone <your-repo-url>
cd Fleet-Dash
npm install
```

If you are using the Redis adapter package, install it with quotes in PowerShell:

```powershell
npm install "@socket.io/redis-adapter"
```

## Environment Variables

Create a `.env` file:

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

The server should start on:

```text
http://localhost:5000
```

## API Endpoints

### Health Check

```http
GET /health
```

Response:

```json
{
  "success": true,
  "service": "fleetapi",
  "timestamp": "2026-08-30T00:00:00.000Z"
}
```

### Telemetry Ingestion

```http
POST /api/telemetry
```

Request body:

```json
{
  "vehicleId": "TRUCK-001",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "speed": 45,
  "heading": 90,
  "timestamp": "2026-08-30T00:00:00.000Z"
}
```

Success response:

```json
{
  "success": true,
  "message": "Telemetry stored successfully",
  "data": {
    "vehicleId": "TRUCK-001",
    "bucketStart": "2026-08-30T00:00:00.000Z",
    "bucketEnd": "2026-08-30T01:00:00.000Z",
    "pointCount": 1
  }
}
```

## MongoDB Storage Design

Telemetry is stored in hourly buckets by vehicle ID. Each document contains:

- `vehicleId`
- `bucketStart`
- `bucketEnd`
- `points[]`
- `pointCount`

This approach reduces document sprawl and improves query efficiency for time-based telemetry data. MongoDB’s `$push` operator is used to append telemetry points to the array, and `$inc` updates the point count atomically [web:42][web:150].

## Real-Time Flow

- Telemetry is published to Redis Pub/Sub after being stored.
- Socket.IO listens to the Redis channel.
- Connected clients receive `telemetry:update` events instantly.

Redis Pub/Sub is ideal for live broadcast-style messaging, but it is not durable storage, so offline subscribers miss messages [web:52]. That is acceptable for live dashboard updates.

## Testing

You can test the API with PowerShell:

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

## Troubleshooting

- If `npm run dev` fails, check that MongoDB is running.
- If Redis connection fails, start Redis on port `6379`.
- If a route returns `Cannot POST`, confirm the router is mounted correctly.
- If a module is missing, verify the file path in `require()`.

## License

This project is for internship and learning purposes.