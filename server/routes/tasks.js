// Task endpoints - thin HTTP layer over Drizzle
import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { tasks } from '../db/schema.js';

export const tasksRouter = Router();

tasksRouter.get('/', async (_req, res) => {
    const rows = await db.select().from(tasks).orderBy(tasks.createdAt);
    res.json(rows);
});

tasksRouter.post('/', async (req, res) => {    
    const fields = req.body;

    const [created] = await db.insert(tasks).values({
        title: fields.title,
        content: fields.content,
        url: fields.url || '',
        status: fields.status || 'todo',
        priority: fields.priority || 'medium',
        dueDate: fields.dueDate || null,
        tags: fields.tags || [],
        recurrenceType: fields.recurrenceType || 'none',
        recurrenceInterval: fields.recurrenceInterval || 1,
        recurrenceEnd: fields.recurrenceEnd || null,
        totalTime: fields.totalTime || 0,
        isTracking: fields.isTracking || false,
        lastStartTime: fields.lastStartTime || null,
        timeLogs: fields.timeLogs || [],
        memoSessions: fields.memoSessions || [],
        activeMemoSession: fields.activeMemoSession || null,
        subtasks: fields.subtasks || []
    }).returning();

    res.status(201).json(created);
});

tasksRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;

    const [updated] = await db.update(tasks)
        .set({
            title: fields.title,
            content: fields.content,
            url: fields.url || '',
            status: fields.status,
            priority: fields.priority || 'medium',
            dueDate: fields.dueDate || null,
            tags: fields.tags || [],
            recurrenceType: fields.recurrenceType || 'none',
            recurrenceInterval: fields.recurrenceInterval || 1,
            recurrenceEnd: fields.recurrenceEnd || null,
            totalTime: fields.totalTime || 0,
            isTracking: fields.isTracking || false,
            lastStartTime: fields.lastStartTime ?? null,
            timeLogs: fields.timeLogs || [],
            memoSessions: fields.memoSessions || [],
            activeMemoSession: fields.activeMemoSession || null,
            subtasks: fields.subtasks || []
        })
        .where(eq(tasks.id, id))
        .returning();

    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
});

tasksRouter.delete('/:id', async (req, res) => {
    await db.delete(tasks).where(eq(tasks.id, req.params.id));
    res.status(204).end();
});

// Clear the whole board
tasksRouter.delete('/', async (_req, res) => {
    await db.delete(tasks);
    res.status(204).end();
});
