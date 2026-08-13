# ShopEase — E-Commerce Full Stack

## Architecture

```
Frontend (React) :3000  ──→  Backend (Next.js API) :8000
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
               MongoDB          Percona          Redis
              :27017           MySQL :3306      :6379
           (Products,        (Transactions,   (Cart,
            Users,            Payments)       Sessions,
            Orders)                           Cache)
                                    │
                               RabbitMQ :5672
                          (Orders, Notifications,
                           Inventory queues)
                          Management UI :15672
```

## Quick Start

```bash
# 1. Clone and go to project root
cd ecommerce

# 2. Start all services
docker compose up -d

# 3. Check all services are healthy
docker compose ps

# 4. View logs
docker compose logs -f backend

# 5. Open
# Frontend:        http://localhost:3000
# Backend API:     http://localhost:8000/api/health
# RabbitMQ UI:     http://localhost:15672  (admin/password)
```

## API Endpoints

| Method | Endpoint               | Auth     | Description          |
|--------|------------------------|----------|----------------------|
| GET    | /api/health            | None     | Health check all DBs |
| POST   | /api/auth/signup       | None     | Register user        |
| POST   | /api/auth/login        | None     | Login                |
| GET    | /api/products          | None     | List products        |
| GET    | /api/products/:id      | None     | Get product          |
| POST   | /api/products          | Admin    | Create product       |
| PUT    | /api/products/:id      | Admin    | Update product       |
| DELETE | /api/products/:id      | Admin    | Delete product       |
| GET    | /api/cart              | User     | Get cart             |
| POST   | /api/cart              | User     | Add to cart          |
| DELETE | /api/cart              | User     | Clear cart           |
| GET    | /api/orders            | User     | My orders            |
| POST   | /api/orders            | User     | Place order          |
| GET    | /api/orders/:id        | User     | Order detail         |
| PUT    | /api/orders/:id        | Admin    | Update order status  |

## Database Roles

| DB       | Used For                                    |
|----------|---------------------------------------------|
| MongoDB  | Products, Users, Orders (flexible schema)   |
| Percona  | Transactions, Payments (ACID compliance)    |
| Redis    | Cart, Sessions, Product cache, Rate limits  |
| RabbitMQ | Order processing, Emails, Inventory updates |
