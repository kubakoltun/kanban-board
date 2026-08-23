// Whole-board operations (currently just import - export is done client-side
// straight from already-loaded state, so it needs no round trip)
import { Router } from 'express';
import { db } from '../db/client.js';
import { tasks, history } from '../db/schema.js';

export const boardRouter = Router();

boardRouter.post('/import', async (req, res) => {
    const importedTasks = Array.isArray(req.body.tasks) ? req.body.tasks : [];
    const importedHistory = Array.isArray(req.body.history) ? req.body.history : [];

    const result = await db.transaction(async (tx) => {
        await tx.delete(tasks);
        await tx.delete(history);

        const insertedTasks = importedTasks.length
            ? await tx.insert(tasks).values(importedTasks.map(toTaskRow)).returning()
            : [];

        const insertedHistory = importedHistory.length
            ? await tx.insert(history).values(importedHistory.map(toHistoryRow)).returning()
            : [];

        return { tasks: insertedTasks, history: insertedHistory };
    });

    res.json(result);
});

function toTaskRow(task) {
    return {
        title: task.title || '',
        content: task.content || '',
        url: task.url || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate || null,
        tags: task.tags || [],
        recurrenceType: task.recurrenceType || 'none',
        recurrenceInterval: task.recurrenceInterval || 1,
        recurrenceEnd: task.recurrenceEnd || null,
        totalTime: task.totalTime || 0,
        isTracking: task.isTracking || false,
        lastStartTime: task.lastStartTime || null,
        timeLogs: task.timeLogs || [],
        memoSessions: task.memoSessions || [],
        activeMemoSession: task.activeMemoSession || null,
        subtasks: task.subtasks || []
    };
}

function toHistoryRow(entry) {
    return {
        action: entry.action,
        description: entry.description,
        metadata: entry.metadata || null
    };
}
