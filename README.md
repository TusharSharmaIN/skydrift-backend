# SkyDrift — Backend API

Backend for the [SkyDrift Flutter app](https://github.com/TusharSharmaIN/skydrift-app). Accepts a cloud photo, runs it through Gemini Vision, stores the reading, and serves it back.

## Highlights

☁️ Cloud photo → Gemini Vision → shape + short reading  
🗄️ Drift history stored in PostgreSQL  
🖼️ Images uploaded to Cloudinary  
🚀 Dev (local Docker + Postgres) and Prod (Render + Neon + Cloudinary) environments  
🏗️ NestJS with TypeORM, modular structure

## Stack

NestJS · TypeORM · PostgreSQL · Cloudinary · Gemini API · Docker

## Quick Start (Local)

```bash
cp .env.example .env.local   # fill in your keys
docker compose up --build    # starts API + Postgres
```

API runs at `http://localhost:3000`.

### Without Docker

```bash
npm install
npm run start:dev
```

Needs a local Postgres running or set `DATABASE_URL` in `.env.local`.

## Scripts

```bash
npm run start:dev    # watch mode
npm run start:prod   # production (requires build)
npm run build        # compile to dist/
npm run test         # unit tests
npm run lint         # oxlint
```

## Structure

```
src/
├── modules/
│   ├── drift/      # core drift logic (create, list, get)
│   ├── vision/     # Gemini API integration
│   ├── storage/    # Cloudinary upload
│   └── voice/      # (TBD)
├── config/         # env validation & config service
├── common/         # shared pipes, filters, etc.
└── main.ts
```

## Environment Variables

Copy `.env.example` and fill in:

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default `3000`) |
| `GEMMA_API_KEY` | Gemini API key |
| `DATABASE_URL` | Postgres connection string (prod / remote) |
| `DB_HOST/PORT/USERNAME/PASSWORD/NAME` | Local Postgres (Docker) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Production Deployment

> Hosted on [Render](https://render.com) (free Docker-based web service). First request after an idle period may take 10–30s to wake up.

### Infrastructure

| Service | Provider | Notes |
|---|---|---|
| **API** | Render (free tier) | Docker deploy, auto-deploy on push to `main` |
| **Database** | [Neon](https://neon.tech) (free tier) | Serverless Postgres, `ap-southeast-1` region, pooler endpoint |
| **Image Storage** | [Cloudinary](https://cloudinary.com) (free tier) | Cloud name: `jjb9fsde` |
| **AI** | Google Gemini API | `GEMMA_API_KEY` set in Render environment vars |

### Neon Database

- Region: `ap-southeast-1` (Singapore)
- Uses the **pooler** endpoint with `?sslmode=require`
- Branch: `main`

### Render Setup

Set these env vars in Render → Environment:

```
NODE_ENV=production
DATABASE_URL=<neon pooler connection string>
GEMMA_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Render uses the `Dockerfile` directly — the multi-stage build produces a slim production image (no dev deps, non-root `node` user).
