import { Router } from 'express';
import { db } from '../db/client.js';
import { tasks, history, users, statuses, priorities } from '../db/schema.js';
import { toTaskValues } from '../db/task-values.js';

export const boardRouter = Router();

// "In progress", "in-progress", "IN_PROGRESS" all become "in progress"
const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/[\s_-]+/g, ' ');

// Lookup keyed by normalised key and label -> key
const keyLookup = (rows) => {
    const map = new Map();
    rows.forEach(r => { map.set(norm(r.key), r.key); map.set(norm(r.label), r.key); });
    return map;
};

boardRouter.post('/import', async (req, res) => {
    const importedTasks = Array.isArray(req.body.tasks) ? req.body.tasks : [];
    const importedHistory = Array.isArray(req.body.history) ? req.body.history : [];
    const append = req.body.mode === 'append';

    const result = await db.transaction(async (tx) => {
        const userRows = await tx.select().from(users);
        const ctx = {
            knownUsers: new Set(userRows.map(u => u.id)),
            usersByName: new Map(userRows.map(u => [norm(`${u.name} ${u.surname}`), u.id])),
            statuses: keyLookup(await tx.select().from(statuses)),
            priorities: keyLookup(await tx.select().from(priorities))
        };

        if (!append) {
            await tx.delete(tasks);
            await tx.delete(history);
        }

        const insertedTasks = importedTasks.length
            ? await tx.insert(tasks).values(importedTasks.map(t => toTaskRow(t, ctx))).returning()
            : [];
        const insertedHistory = importedHistory.length
            ? await tx.insert(history).values(importedHistory.map(toHistoryRow)).returning()
            : [];

        return { tasks: insertedTasks, history: insertedHistory };
    });

    res.json(result);
});

function toTaskRow(t, ctx) {
    // Backups carry assignedUserId; CSV imports carry assigneeName instead
    const candidateId = t.assignedUserId ?? ctx.usersByName.get(norm(t.assigneeName));
    const status = ctx.statuses.get(norm(t.status)) ?? 'not-started';
    const priority = ctx.priorities.get(norm(t.priority)) ?? 'medium';

    return {
        ...toTaskValues({
            ...t,
            status,
            priority,
            assignedUserId: ctx.knownUsers.has(candidateId) ? candidateId : null
        }),
        createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
        // keep done tasks consistent with how useMoveTask sets completedAt
        completedAt: t.completedAt
            ? new Date(t.completedAt)
            : status === 'done' ? new Date() : null
    };
}

function toHistoryRow(entry) {
    return {
        action: entry.action,
        description: entry.description,
        metadata: entry.metadata || null,
        timestamp: entry.timestamp ? new Date(entry.timestamp) : undefined
    };
}
