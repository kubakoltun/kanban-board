// Express app entry point
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { tasksRouter } from './routes/tasks.js';
import { historyRouter } from './routes/history.js';
import { boardRouter } from './routes/board.js';
import { usersRouter } from './routes/users.js';

dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/tasks', tasksRouter);
app.use('/api/history', historyRouter);
app.use('/api/board', boardRouter);
app.use('/api/users', usersRouter);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Kanban API listening on http://localhost:${port}`);
});
