---
description: Deploy the School Management System
---

# Deployment Workflow

Follow these steps to deploy the application to production.

## 1. Environment Setup
Ensure `.env` contains:
```env
DATABASE_URL=...
AUTH_SECRET=...
NEXT_PUBLIC_APP_URL=...
REDIS_URL=...
S3_BUCKET=...
S3_REGION=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
PAYMENT_ENCRYPTION_KEY=...
```

## 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

## 3. Database Migration
Apply schema changes to your production database.
```bash
npx prisma migrate deploy
npx prisma generate
```

## 4. Build Application
This compiles the Next.js app and optimizes assets.
```bash
npm run build
```

## 5. Start Server
Runs the production server.
```bash
// turbo
npm start
```
