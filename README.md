Class Rack

Quick start

1) Copy env file (if needed)
   cp .env.example .env

2) Start docker services
   make dev

3) Run migrations
   make migrate

4) Seed the database (optional)
   make seed

5) Open the app
   http://localhost:3003

Common commands

- Start/rebuild containers
  make dev

- Apply migrations
  make migrate

- Reset database (drops + re-applies migrations)
  make db-reset

- Seed data
  make seed

Docker shortcuts (same as Makefile)

- Start services
  docker compose up --build -d

- Apply migrations
  docker compose exec classrack-11249-web npx prisma migrate deploy

- Reset database
  docker compose exec classrack-11249-web npx prisma migrate reset --force

- Seed data
  docker compose exec classrack-11249-web node prisma/seed.js

Testing

- Unit + component tests
  npm test

- E2E tests
  npm run test:e2e

Notes

- If you run Prisma locally, regenerate the client:
  npx prisma generate
- If you run Prisma inside Docker, regenerate the client:
  docker compose exec classrack-11249-web npx prisma generate
