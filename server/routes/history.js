// Activity history endpoints
import { Router } from 'express';
import { desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { history } from '../db/schema.js';

export const historyRouter = Router();

historyRouter.get('/', async (_req, res) => {
    const rows = await db.select().from(history).orderBy(desc(history.timestamp));
    res.json(rows);
});

historyRouter.post('/', async (req, res) => {
    const { action, description, metadata = null } = req.body;

    const [created] = await db.insert(history).values({
        action,
        description,
        metadata
    }).returning();

    res.status(201).json(created);
});

historyRouter.delete('/', async (_req, res) => {
    await db.delete(history);
    res.status(204).end();
});
