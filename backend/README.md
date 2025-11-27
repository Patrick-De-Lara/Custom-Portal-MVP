# Backend - Express.js API

This is the backend API built with Express.js and TypeScript.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then, run the development server:

```bash
npm run dev
```

The server will start at [http://localhost:5000](http://localhost:5000)

## Project Structure

- `src/` - Source code
  - `server.ts` - Main application entry point
  - `routes/` - API route handlers
    - `index.ts` - Route aggregator
    - `health.ts` - Health check endpoints
- `dist/` - Compiled TypeScript output (generated)

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server

## API Endpoints

### Health Check
- `GET /api/health` - Check backend health status

### Root
- `GET /` - API information

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)
