// Whole-board operations (currently just import - export is done client-side
// straight from already-loaded state, so it needs no round trip)
import { Router } from 'express';
import { db } from '../db/client.js';
import { tasks, history, users } from '../db/schema.js';
import { toTaskValues } from '../db/task-values.js';

export const boardRouter = Router();

boardRouter.post('/import', async (req, res) => {
    const importedTasks = Array.isArray(req.body.tasks) ? req.body.tasks : [];
    const importedHistory = Array.isArray(req.body.history) ? req.body.history : [];

    const result = await db.transaction(async (tx) => {
        // a backup may reference users that don't exist in this database
        const knownUsers = new Set((await tx.select({ id: users.id }).from(users)).map(u => u.id));

        await tx.delete(tasks);
        await tx.delete(history);

        const insertedTasks = importedTasks.length
            ? await tx.insert(tasks).values(importedTasks.map(t => toTaskRow(t, knownUsers))).returning()
            : [];
        const insertedHistory = importedHistory.length
            ? await tx.insert(history).values(importedHistory.map(toHistoryRow)).returning()
            : [];

        return { tasks: insertedTasks, history: insertedHistory };
    });

    res.json(result);
});

const toTaskRow = (t, knownUsers) => ({
    ...toTaskValues({ ...t, assignedUserId: knownUsers.has(t.assignedUserId) ? t.assignedUserId : null }),
    createdAt: t.createdAt ? new Date(t.createdAt) : undefined
});

function toHistoryRow(entry) {
    return {
        action: entry.action,
        description: entry.description,
        metadata: entry.metadata || null,
        timestamp: entry.timestamp ? new Date(entry.timestamp) : undefined
    };
}
