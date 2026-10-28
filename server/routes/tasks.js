// Task endpoints - thin HTTP layer over Drizzle
import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { tasks } from '../db/schema.js';
import { toTaskValues } from '../db/task-values.js';

export const tasksRouter = Router();

tasksRouter.get('/', async (_req, res) => {
    const rows = await db.select().from(tasks).orderBy(tasks.createdAt);
    res.json(rows);
});

tasksRouter.post('/', async (req, res) => {
    const fields = req.body;

    const [created] = await db.insert(tasks).values(toTaskValues(fields)).returning();

    res.status(201).json(created);
});

tasksRouter.put('/:id', async (req, res) => {
    const id = parseTaskId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid task id' });

    const fields = req.body;

    const [updated] = await db.update(tasks)
        .set(toTaskValues(fields))
        .where(eq(tasks.id, id))
        .returning();

    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
});

tasksRouter.delete('/:id', async (req, res) => {
    const id = parseTaskId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid task id' });

    await db.delete(tasks).where(eq(tasks.id, id));
    res.status(204).end();
});

// Clear the whole board
tasksRouter.delete('/', async (_req, res) => {
    await db.delete(tasks);
    res.status(204).end();
});

function parseTaskId(rawId) {
    const id = Number.parseInt(rawId, 10);
    return Number.isFinite(id) ? id : null;
}
