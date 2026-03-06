# Assignment 1 — SuiLens: Monolith vs Microservices

**Nama:** Muttaqin Muzakkir
**NPM:** 2306207101

Sistem rental lensa kamera untuk **Studio Komet Biru**, diimplementasikan dalam dua arsitektur:

| Arsitektur | Direktori | Port | Cara Menjalankan |
|---|---|---|---|
| **Monolith** | `suilens-monolith/` | 3000 | Lihat `suilens-monolith/README.md` |
| **Microservices** | `suilens-microservices/` | 5173 (frontend) | Lihat di bawah |

---

## Microservices

### Cara Menjalankan

```bash
cd suilens-microservices
docker compose up --build -d
```

Tunggu ~30 detik, lalu buka [http://localhost:5173](http://localhost:5173).

Semua schema database, seed data, dan migrasi dijalankan otomatis saat startup.

## Daftar Service dan Port

| Service | Port | Keterangan |
|---------|------|------------|
| **Catalog Service** | 3001 | Mengelola katalog lensa |
| **Order Service** | 3002 | Menangani pemesanan rental dengan reservasi stok per-cabang |
| **Notification Service** | 3003 | Membuat notifikasi dari event asynchronous |
| **Inventory Service** | 3004 | Mengelola stok lensa per-cabang, reserve/release |
| **Frontend** | 5173 | Vue 3 + Vuetify SPA via Nginx |
| **RabbitMQ** | 5672 / 15672 | Message broker (management UI di :15672, guest/guest) |
| **catalog-db** | 5433 | PostgreSQL untuk catalog-service |
| **order-db** | 5434 | PostgreSQL untuk order-service |
| **notification-db** | 5435 | PostgreSQL untuk notification-service |
| **inventory-db** | 5436 | PostgreSQL untuk inventory-service |

## Pola Komunikasi

### Sinkron (HTTP)
- **Order -> Catalog**: Mengambil detail lensa untuk kalkulasi harga
- **Order -> Inventory**: Reservasi stok sebelum membuat order (pengecekan atomik)

### Asinkron (RabbitMQ)
- **order.placed** -> Notification Service: Membuat notifikasi konfirmasi order
- **order.cancelled** -> Inventory Service: Melepas stok yang sudah direservasi (idempoten)
- **order.cancelled** -> Notification Service: Membuat notifikasi pembatalan

## Cabang (Branch)

| Kode | Nama | Lokasi |
|------|------|--------|
| KB-JKT-S | Kebayoran Baru | Jakarta Selatan (studio utama) |
| KB-JKT-E | Jatinegara | Jakarta Timur |
| KB-JKT-N | Kelapa Gading | Jakarta Utara |

## API Endpoints

### Catalog Service
- `GET /api/lenses` — Daftar semua lensa
- `GET /api/lenses/:id` — Detail lensa berdasarkan ID

### Order Service
- `POST /api/orders` — Buat order (wajib menyertakan `branchCode`)
- `GET /api/orders` — Daftar semua order
- `GET /api/orders/:id` — Detail order berdasarkan ID
- `PATCH /api/orders/:id/cancel` — Batalkan order (memicu pelepasan stok)

### Inventory Service
- `GET /api/inventory/branches` — Daftar semua cabang
- `GET /api/inventory/lenses/:lensId` — Stok lensa di semua cabang
- `POST /api/inventory/reserve` — Reservasi stok (dipanggil oleh order-service)

## Contoh Pengujian

```bash
# Daftar cabang
curl http://localhost:3004/api/inventory/branches

# Stok lensa
LENS_ID=$(curl -s http://localhost:3001/api/lenses | jq -r '.[0].id')
curl http://localhost:3004/api/inventory/lenses/$LENS_ID

# Buat order
curl -X POST http://localhost:3002/api/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "lensId": "'$LENS_ID'",
    "branchCode": "KB-JKT-S",
    "startDate": "2026-03-10",
    "endDate": "2026-03-12"
  }'

# Batalkan order (stok dilepas via RabbitMQ)
curl -X PATCH http://localhost:3002/api/orders/<ORDER_ID>/cancel
```

## Jawaban Pertanyaan D3: Microservices vs Monolith

### (a) Ketahanan: Notification Service Mati

Jika notification-service mati, order tetap bisa dibuat. RabbitMQ menyimpan pesan dalam queue (durable) sampai notification-service hidup kembali. Ini keuntungan utama asynchronous messaging — producer dan consumer tidak perlu online bersamaan.

Pada monolith, jika modul notifikasi error, seluruh request bisa gagal kecuali ada error handling yang ketat.

### (b) Kompleksitas: Alur Pembuatan Order

Pembuatan order di microservices membutuhkan 3 panggilan HTTP (catalog -> inventory -> DB insert) ditambah 1 publish event. Pada monolith, cukup 1 database transaction dengan JOIN. Microservices menambah latensi dan kompleksitas, tetapi memberikan independent deployability dan technology heterogeneity.

### (c) Inventory Service Mati

Jika inventory-service mati, pembuatan order **gagal** karena stock reservation bersifat sinkron. Mitigasi yang bisa diterapkan:
- **Circuit breaker**: Setelah beberapa kali gagal, langsung return error tanpa mencoba
- **Retry with backoff**: Coba ulang dengan jeda yang meningkat
- **Fallback status**: Buat order dengan status "pending_verification" dan verifikasi stok nanti

### (d) Sync vs Async Reservation

Stock reservation menggunakan synchronous HTTP untuk menjamin konsistensi — user langsung tahu apakah stok tersedia. Alternatifnya adalah async reservation (eventual consistency) yang lebih resilient tapi bisa menyebabkan overselling.

Dead Letter Queue (DLQ) digunakan untuk menangani pesan yang gagal diproses setelah beberapa kali retry, mencegah infinite loop dan memungkinkan investigasi manual.

## Tech Stack

- **Runtime**: Bun 1.3
- **Framework**: Elysia
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 16
- **Message Broker**: RabbitMQ 3
- **Frontend**: Vue 3, Vuetify 3, TanStack Query, Pinia
- **Proxy**: Nginx
- **Containerization**: Docker Compose
