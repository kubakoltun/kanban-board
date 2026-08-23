// User endpoints - a deliberately small table (id, name, surname) used to
// populate the "assigned to" dropdown on tasks.
import { Router } from 'express';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';

export const usersRouter = Router();

usersRouter.get('/', async (_req, res) => {
    const rows = await db.select().from(users).orderBy(users.surname, users.name);
    res.json(rows);
});

usersRouter.post('/', async (req, res) => {
    const { name, surname } = req.body;

    if (!name?.trim() || !surname?.trim()) {
        return res.status(400).json({ error: 'name and surname are required' });
    }

    const [created] = await db.insert(users).values({
        name: name.trim(),
        surname: surname.trim()
    }).returning();

    res.status(201).json(created);
});
