.PHONY: migrate seed db-reset dev

migrate:
	docker compose exec web npx prisma migrate deploy

seed:
	docker compose exec web node prisma/seed.js

db-reset:
	docker compose exec web npx prisma migrate reset --force

dev:
	docker compose up --build -d
