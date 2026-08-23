// Express app entry point
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { tasksRouter } from '../server/routes/tasks.js';
import { historyRouter } from '../server/routes/history.js';
import { boardRouter } from '../server/routes/board.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/tasks', tasksRouter);
app.use('/api/history', historyRouter);
app.use('/api/board', boardRouter);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Kanban API listening on http://localhost:${port}`);
});
