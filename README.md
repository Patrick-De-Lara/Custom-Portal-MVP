# Custom Portal

A full-stack application with Next.js frontend and Express.js backend.

## Project Structure

```
Custome Portal/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   └── app/      # Next.js app directory
│   ├── package.json
│   └── tsconfig.json
├── backend/           # Express.js backend API
│   ├── src/
│   │   ├── server.ts
│   │   └── routes/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

### Running the Application

#### Development Mode

1. Start the backend server (from `backend/` directory):
```bash
npm run dev
```
The API will be available at http://localhost:5000

2. Start the frontend application (from `frontend/` directory):
```bash
npm run dev
```
The app will be available at http://localhost:3000

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

## Technologies Used

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **React 18** - UI library
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **dotenv** - Environment variables

## API Endpoints

- `GET /` - API information
- `GET /api/health` - Health check endpoint

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Features

- ✅ TypeScript support for both frontend and backend
- ✅ Hot reloading in development mode
- ✅ API proxy configuration in Next.js
- ✅ CORS enabled for cross-origin requests
- ✅ Security headers with Helmet
- ✅ Request logging with Morgan
- ✅ Health check endpoint
- ✅ Error handling middleware

## Development

### Adding New API Routes

1. Create a new route file in `backend/src/routes/`
2. Import and register it in `backend/src/routes/index.ts`

### Adding New Pages

1. Create new page files in `frontend/src/app/`
2. Follow Next.js App Router conventions

## License

ISC
