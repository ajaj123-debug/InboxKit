# Real-Time Collaborative Pixel Map

A playful, real-time web app where users can capture blocks on a shared grid. Built with **Django Channels** and **React**.

## Features
- **Real-Time Updates**: Instant block capture visibility for all connected users via WebSockets.
- **Interactive Grid**: 50x30 grid of conquerable blocks.
- **Dynamic Colors**: Choose from a neon palette to claim territory.
- **Optimized Performance**: Efficient rendering using React Memo and CSS Grid.
- **Dark Mode UI**: Sleek, immersive design with hover effects and animations.

## Tech Stack
- **Backend**: Django, Django Channels (WebSockets), Daphne (ASGI), Django REST Framework.
- **Frontend**: React (Vite), CSS Modules (Vanilla), Framer Motion.
- **Database**: SQLite (local dev), scalable to Postgres.

## Setup & Run

### 1. Backend
Navigate to `colorful_map/backend`:
```bash
cd colorful_map/backend
../backend/venv/Scripts/activate
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend
Navigate to `colorful_map/frontend`:
```bash
cd colorful_map/frontend
npm run dev
```

### 3. Play
Open your browser at `http://localhost:5173`.
Open multiple tabs/windows to see real-time updates!

## How It Works
1. **Initial Load**: Fetches current grid state via REST API (`/api/blocks/`).
2. **WebSocket Connection**: Connects to `ws://localhost:8000/ws/game/` for live events.
3. **Capture**: Clicking a block sends a `capture` action to the server.
4. **Broadcast**: Server updates DB and broadcasts `block_update` to all clients.
5. **Render**: React updates only the changed block efficiently.

## Future Improvements
- Authenticaton for persistent user ownership.
- Leaderboard for most territory.
- Zoom/Pan controls for infinite canvas.
