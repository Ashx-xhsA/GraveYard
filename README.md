# GraveYard

> A cyber cemetery where everything finds its digital eternity.

GraveYard is an online memorial ground. It is split into **blocks** (themed cemetery areas), each holding a field of **graves**. Anyone can wander the blocks and read the graves; signed-in visitors can raise graves of their own, leave messages, and lay offerings from their inventory.

It is a work in progress.

## Features

- Browse cemetery blocks, each with its own background and grave icons
- Grave pages with epitaph, photos, and an activity feed
- Accounts, and creating / editing your own graves with photo upload
- Lay offerings from your inventory and leave messages at a grave

More is planned: daily rewards, collectible flowers, per-block themes, and an admin panel.

## Tech stack

| | |
|---|---|
| Client | React 19, TypeScript, Vite 7, Tailwind CSS 4, React Router 7 |
| Server | Node.js, Express 4, Mongoose 8 (MongoDB) |
| Storage | MongoDB Atlas, AWS S3 (photos) |
| Hosting | Client on Vercel, server deployed separately |

## Getting started

Requires Node.js and a MongoDB connection string (a local instance or Atlas).

```bash
npm install
npm --prefix client install
npm --prefix server install
```

Copy the example env files and fill them in:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

At minimum, `server/.env` needs `MONGO_URI` and `JWT_SECRET`. The S3 variables are only needed for photo upload. Each example file explains its variables.

Then:

```bash
npm run seed   # optional: load sample blocks and graves
npm run dev    # start server and client together
```

The client runs on Vite's default port and proxies `/api` to the server on `http://localhost:5001` (port 5000 is taken by AirPlay on macOS).

| Command | What it does |
|---|---|
| `npm run dev` | Start server and client together |
| `npm run dev:server` / `npm run dev:client` | Start just one side |
| `npm run seed` | Seed the database |
| `npm --prefix client run build` | Type-check and build the client |
| `npm --prefix client run lint` | Lint the client |

## Project structure

```
client/            React app (deployed to Vercel)
  src/components/  Pages and UI components
  src/i18n/        UI copy
  src/types.ts     Shared data types
server/            Express API
  src/routes/      API routes
  src/models/      Mongoose models
  seed.js          Sample data
  migrate-*.js     One-off data migrations
```

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/:blockID` | A cemetery block, e.g. `/sea-1` |
| `/:blockID/:graveID` | A single grave, e.g. `/sea-1/grave-1` |
| `/about` | About |

The API is served under `/api` — see `server/src/routes/`.
