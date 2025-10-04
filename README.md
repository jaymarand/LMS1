This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Project Overview

An online learning platform built with Next.js App Router. It uses Clerk for auth, Drizzle ORM with Neon Postgres, Google Gemini for course generation, and YouTube Data API for related videos.

## Tech Stack

- **Framework**: `next@15`, React 18
- **Styling**: Tailwind CSS v4
- **Auth**: Clerk (`@clerk/nextjs`)
- **DB/ORM**: Neon + Drizzle (`drizzle-orm`, `@neondatabase/serverless`)
- **AI**: Google Generative AI (`@google/genai`)
- **Misc**: Axios, Lucide, Radix UI primitives

## Prerequisites

- Node.js 18.18+ or 20+
- npm 9+ (or pnpm/yarn/bun)
- A Postgres database (Neon recommended)
- Accounts/keys for: Google AI Studio (Gemini), YouTube Data API v3, AIGuruLab, Clerk

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` – Postgres connection string (Neon works well)
- `GEMINI_API_KEY` – Google Generative AI key
- `YOUTUBE_API_KEY` – YouTube Data API v3 key
- `AI_GURU_LAB_API` – AIGuruLab image generation API key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` – Clerk publishable key
- `CLERK_SECRET_KEY` – Clerk secret key

References in code:

- `config/db.jsx` uses `DATABASE_URL`
- `app/api/generate-course-layout/route.jsx` uses `GEMINI_API_KEY` and `AI_GURU_LAB_API`
- `app/api/generate-course-content/route.jsx` uses `YOUTUBE_API_KEY`
- `middleware.js`/`app/layout.js` rely on Clerk configuration

## Install

```bash
npm install
```

## Database

- Make sure your `DATABASE_URL` is set and the target database is reachable (Neon often requires `sslmode=require`).
- Define schema is in `config/schema.js`. This project does not include migrations; create tables according to the schema or add Drizzle Kit migrations as needed.

## Development

```bash
npm run dev
```

Then open http://localhost:3000

## Build & Start

```bash
npm run build
npm start
```

## Lint

```bash
npm run lint
```

## Deployment

Vercel is recommended for Next.js. Set the same env vars in your Vercel project. Ensure the database is accessible from Vercel.

## Notes

- `next.config.mjs` allows images from `firebasestorage.googleapis.com`.
- Clerk middleware in `middleware.js` protects non-public routes. Configure your Clerk instance to match your domain/origin.
