import { randomUUID } from 'node:crypto';

export function toTaskValues(f) {
    return {
        title: f.title,
        content: f.content,
        url: f.url || '',
        status: f.status || 'todo',
        priority: f.priority || 'medium',
        dueDate: f.dueDate || null,
        tags: f.tags || [],
        assignedUserId: f.assignedUserId || null,
        totalTime: f.totalTime || 0,
        isTracking: f.isTracking || false,
        lastStartTime: f.lastStartTime ?? null,
        timeLogs: f.timeLogs || [],
        memoSessions: f.memoSessions || [],
        activeMemoSession: f.activeMemoSession || null,
        subtasks: (f.subtasks || []).map(s => ({
            id: s.id ?? randomUUID(),
            text: s.text,
            done: Boolean(s.done)
        })),
        completedAt: f.completedAt ? new Date(f.completedAt) : null
    };
}
