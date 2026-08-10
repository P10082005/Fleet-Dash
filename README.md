# CodingAgent-SyncDoc Backend

Backend API for SyncDoc document management built with Node.js, Express, MongoDB, and Mongoose.  
This API stores documents as AST-based nested nodes and supports create, read, update, and delete operations.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Postman for API testing

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

```env
MONGO_URI=your_mongodb_connection_string
PORT=4000
API_KEY=your_secret_key
```

### 3. Start the server

```bash
node server.js
```

The backend runs on the port defined in `.env`.

## Project Structure

```txt
CodingAgent-SyncDoc/
├── db.js
├── server.js
├── models/
│   ├── Document.js
│   └── AstNode.js
├── routes/
│   └── documents.js
├── controllers/
│   └── documentController.js
├── services/
│   └── astService.js
└── middleware/
    ├── apiKey.js
    └── errorHandler.js
```

## API Endpoints

Base URL: `http://localhost:3000`

### Documents

#### POST `/documents`
Create a new document.

Example request body:

```json
{
  "title": "Spec 1",
  "nodes": [
    {
      "nodeId": "n1",
      "type": "heading",
      "content": "Intro",
      "props": { "level": 2 },
      "children": []
    }
  ]
}
```

#### GET `/documents`
Get all documents.

#### GET `/documents/:id`
Get a single document by ID.

#### PUT `/documents/:id`
Update the full document.

#### DELETE `/documents/:id`
Delete a document.

### AST Node Operations

#### PATCH `/documents/:id/nodes/:nodeId`
Update a single AST node.

Example request body:

```json
{
  "content": "Updated Intro",
  "props": { "level": 3 }
}
```

#### DELETE `/documents/:id/nodes/:nodeId`
Delete a single AST node.

## Validation Rules

- `title` is required.
- `nodes` must be an array.
- `type` must be a non-empty string.
- `heading` nodes require `props.level` from 1 to 6.
- `list` nodes must contain only `list_item` children.
- Nested children are validated recursively.

## Authentication

All `/documents` routes require an `x-api-key` header.

Example:

```http
x-api-key: your_secret_key
```

If the key is missing or invalid, the API returns `401 Unauthorized`.

## Error Handling

The backend uses a global error handler to return JSON errors instead of HTML error pages.

Example response:

```json
{
  "error": "Document not found"
}
```

## Testing

Use Postman to test all endpoints with:

- `Content-Type: application/json`
- `x-api-key: your_secret_key`

## Git Branch

Current work is maintained on:

```bash
Database&AST
```