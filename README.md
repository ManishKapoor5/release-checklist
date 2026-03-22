# Release Checklist Tool

A comprehensive tracking tool to visualize and manage software deployment steps using React, Apollo GraphQL, Node.js, and Prisma ORM.

## Architecture Stack
- **Frontend**: React SPA (using Vite), modern Vanilla CSS for rich user interface, and Apollo Client.
- **Backend API**: Node.js & Express serving a GraphQL API powered by GraphQL Yoga.
- **Database**: PostgreSQL database driven by Prisma ORM.
- **Docker**: Simple Docker-compose setup for local development.

## Setup Instructions

### 1. Database Configuration (Docker)
Ensure Docker is installed, then spin up the PostgreSQL container:
```bash
docker-compose up -d
```
This will start a Postgres database listening on port `5432`.

### 2. Backend Setup
Execute the following commands in the backend directory:
```bash
cd backend
npm install
# Push schema to the Postgres database
npx prisma db push
# Generate the Prisma Client
npx prisma generate

# Start the Node.js API server
npm run dev
```
The GraphQL endpoint will be available at: `http://localhost:4000/graphql`

### 3. Frontend Setup
In a new terminal, execute these commands in the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## API

Single GraphQL endpoint: `POST /graphql`  
GraphQL Playground available at: `GET /graphql`

### Queries

```graphql
# Fetch all releases
query {
  releases {
    id
    name
    targetDate
    status
    additionalInfo
    steps
  }
}

# Fetch a single release
query {
  release(id: "uuid-here") {
    id
    name
    status
    steps
  }
}
```

### Mutations

```graphql
# Create a new release
mutation {
  createRelease(
    name: "Version 2.0.0"
    targetDate: "2024-12-01T00:00:00Z"
    additionalInfo: "Optional notes"
  ) { id status }
}

# Update a release (steps, info, name, date — all optional)
mutation {
  updateRelease(
    id: "uuid-here"
    steps: "{\"All tests are passing\": true}"
    additionalInfo: "Updated notes"
  ) { id status }
}

# Delete a release
mutation {
  deleteRelease(id: "uuid-here")
}
```

## Database Schema

Table: `releases`

| Column          | Type      | Notes                          |
|-----------------|-----------|--------------------------------|
| id              | UUID      | Primary key, auto-generated    |
| name            | TEXT      | Required                       |
| targetDate      | TIMESTAMP | Required                       |
| additionalInfo  | TEXT      | Optional                       |
| steps           | JSONB     | e.g. `{"All tests are passing": true}` |
| createdAt       | TIMESTAMP | Auto-set on create             |
| updatedAt       | TIMESTAMP | Auto-updated on every save     |

> `status` (`planned` | `ongoing` | `done`) is **computed dynamically** — not stored in the database.
