# SuiLens Monolith

Monolith implementation untuk sistem rental lensa kamera **Studio Komet Biru**.

**Nama:** Muttaqin Muzakkir
**NPM:** 2306207101

## Cara Menjalankan

```bash
docker compose up --build -d
```

Semua schema database, seed data, dan migrasi dijalankan otomatis saat startup. Aplikasi berjalan di [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Runtime**: Bun 1.3
- **Framework**: Elysia
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 16
- **Containerization**: Docker Compose

## API Endpoints

### Catalog
- `GET /api/lenses` — Daftar semua lensa
- `GET /api/lenses/:id` — Detail lensa berdasarkan ID

### Orders
- `POST /api/orders` — Buat order baru
- `GET /api/orders` — Daftar semua order
- `GET /api/orders/:id` — Detail order berdasarkan ID
- `PATCH /api/orders/:id/cancel` — Batalkan order

### Health
- `GET /health` — Health check

## Contoh Pengujian

```bash
# Daftar lensa
curl http://localhost:3000/api/lenses

# Buat order
LENS_ID=$(curl -s http://localhost:3000/api/lenses | jq -r '.[0].id')
curl -X POST http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "lensId": "'$LENS_ID'",
    "startDate": "2026-03-10",
    "endDate": "2026-03-15"
  }'

# Batalkan order
curl -X PATCH http://localhost:3000/api/orders/<ORDER_ID>/cancel
```

## Arsitektur

Semua modul (catalog, order, notification) berjalan dalam satu proses Elysia dengan satu database PostgreSQL. Pembuatan order menggunakan single database transaction yang mencakup insert order + insert notification secara atomik.
