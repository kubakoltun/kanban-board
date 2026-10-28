import 'express-async-errors'; 
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tasksRouter } from './routes/tasks.js';
import { historyRouter } from './routes/history.js';
import { boardRouter } from './routes/board.js';
import { usersRouter } from './routes/users.js';
import { metaRouter } from './routes/meta.js';
import { seedLookups } from './db/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/tasks', tasksRouter);
app.use('/api/history', historyRouter);
app.use('/api/board', boardRouter);
app.use('/api/users', usersRouter);
app.use('/api/meta', metaRouter);

// Error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

// Frontend
const frontendPath = path.join(__dirname, '../dist');

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

await seedLookups();
app.listen(port, '0.0.0.0', () => {
    console.log(`Kanban app listening on port ${port}`);
});
