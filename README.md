# Live Demo - Piotr Wierzba Roofing

A hackathon demo: a roofing contractor website that updates live during a simulated client call.

## Setup

```bash
cd template
bun install
bun dev
```

Runs on `http://localhost:3000`.

## Deploy to Vercel

```bash
cd template
vercel
```

## Demo Commands

Replace `localhost:3000` with your Vercel URL when deployed.

### Step 1: Change colors & font

Client says: "Can we try a cooler, more modern look?"

```bash
curl -X POST localhost:3000/api/theme -H "Content-Type: application/json" -d '{"themeVariant":"slate"}'
```

### Step 2: Fix the roof photo

Client says: "That photo doesn't look right, can you change it?"

```bash
curl -X POST localhost:3000/api/photo -H "Content-Type: application/json" -d '{"roofPhotoFixed":true}'
```

Changes the image in the "Built with integrity" section.

### Step 3: Change FAQ question

Client says: "Change the first question to ask about roofing materials."

```bash
curl -X POST localhost:3000/api/faq -H "Content-Type: application/json" -d '{"faqFirstQuestion":"What types of roofing materials do you offer?"}'
```

### Reset everything

```bash
curl -X POST localhost:3000/api/reset
```

### Health check

```bash
curl localhost:3000/api/health
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/state` | Get or update full state |
| POST | `/api/theme` | Change colors & font |
| POST | `/api/photo` | Fix roof photo |
| POST | `/api/faq` | Change FAQ question |
| POST | `/api/reset` | Reset to defaults |
| GET | `/api/health` | Health check |

## Architecture

```
Website  --polls GET /api/state every 2s-->  Next.js API Routes
         <--JSON--                           POST /api/state via curl
```

Everything runs as one Next.js app. State is held in-memory via `globalThis`. Changes triggered via curl appear on the website within 2 seconds.
