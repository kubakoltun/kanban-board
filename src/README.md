# Kanban API (Express + Drizzle ORM + PostgreSQL)

## Setup

1. Install dependencies:
   ```
   cd src
   npm install
   ```
2. Copy `.env.example` to `.env` and point `DATABASE_URL` at your Postgres instance.
3. Push the schema to the database:
   ```
   npm run db:push
   ```
4. Start the API:
   ```
   npm run dev
   ```
   It listens on `http://localhost:3001` by default (`PORT` in `.env`).

## Model

Two tables, defined in `db/schema.js`:

- **tasks** - id (uuid, DB-generated), title, content, url, status, priority,
  due_date, tags (jsonb), recurrence fields, time-tracking fields
  (total_time, is_tracking, last_start_time, time_logs, memo_sessions,
  active_memo_session), subtasks (jsonb), created_at.
- **history** - id (uuid, DB-generated), action, description, metadata (jsonb),
  timestamp.

## Endpoints

- `GET /api/tasks` / `POST /api/tasks` / `PUT /api/tasks/:id` / `DELETE /api/tasks/:id`
- `DELETE /api/tasks` - clears the whole board
- `GET /api/history` / `POST /api/history` / `DELETE /api/history`
- `POST /api/board/import` - replaces all tasks + history with an imported set

The frontend (`src/modules/api.js`) talks to these directly - there is no
localStorage involved anymore, the database is the single source of truth.
