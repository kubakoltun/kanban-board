# Kanban API (Express + Drizzle ORM + PostgreSQL)

## Setup

1. Install dependencies:
   ```
   cd server
   npm install
   ```
2. Copy `.env.example` to `.env` and point `DATABASE_URL` at your Postgres instance.
3. Push the schema to the database:
   ```
   npm run db:push
   ```
4. (Optional) Seed a couple of sample users so the "assigned to" dropdown
   has something in it:
   ```
   npm run db:seed
   ```
5. Start the API:
   ```
   npm run dev
   ```
   It listens on `http://localhost:3001` by default (`PORT` in `.env`).

## Model

Three tables, defined in `db/schema.js`:

- **users** - id (serial, DB-generated), name, surname.
- **tasks** - id (serial, DB-generated - a plain incrementing number), title,
  content, url, status, priority, due_date, tags (jsonb),
  assigned_user_id (FK -> users.id, nullable, set null on user delete),
  recurrence fields, time-tracking fields (total_time, is_tracking,
  last_start_time, time_logs, memo_sessions, active_memo_session),
  subtasks (jsonb), created_at.
- **history** - id (serial, DB-generated), action, description,
  metadata (jsonb), timestamp.

## Endpoints

- `GET /api/tasks` / `POST /api/tasks` / `PUT /api/tasks/:id` / `DELETE /api/tasks/:id`
- `DELETE /api/tasks` - clears the whole board
- `GET /api/users` / `POST /api/users`
- `GET /api/history` / `POST /api/history` / `DELETE /api/history`
- `POST /api/board/import` - replaces all tasks + history with an imported set

The frontend (`src/modules/api.js`) talks to these directly the PostgreSQL database is the single source of truth.
