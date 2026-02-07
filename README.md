# The Spark Pit

This project was bootstrapped by [Emergent](https://emergent.sh).

## Ops / Local Dev (Stage 1.3)

### Required env vars (backend)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
REDIS_URL=redis://redis:6379/0
```

### Docker Compose snippet (Redis + ARQ worker)
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  arq_worker:
    build: ./backend
    command: arq worker.WorkerSettings
    environment:
      - REDIS_URL=redis://redis:6379/0
      - MONGO_URL=${MONGO_URL}
      - DB_NAME=${DB_NAME}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
```

### Worker run command (local)
```
cd backend
arq worker.WorkerSettings
```

### Verify worker is alive
Check logs for: `SparkPit ARQ worker online`
