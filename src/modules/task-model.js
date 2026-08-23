// Task domain model: shape helpers and recurrence logic.
// No DB access here - the server (Drizzle) owns ids/defaults; this file
// only prepares/validates the data that gets sent over the wire.
import { generateId } from './id.js';

export const RECURRENCE_TYPES = ['none', 'daily', 'weekly', 'monthly'];

export function normalizeTaskSubtasks(subtasks) {
    if (!Array.isArray(subtasks)) return [];

    return subtasks
        .map(subtask => {
            const text = typeof subtask?.text === 'string' ? subtask.text.trim() : '';
            if (!text) return null;

            return {
                id: subtask.id || generateId(),
                text,
                done: Boolean(subtask.done)
            };
        })
        .filter(Boolean);
}

export function normalizeTaskRecurrence(task) {
    const recurrenceType = RECURRENCE_TYPES.includes(task.recurrenceType) ? task.recurrenceType : 'none';
    const parsedInterval = Number.parseInt(task.recurrenceInterval, 10);
    const recurrenceInterval = Number.isFinite(parsedInterval) && parsedInterval > 0 ? parsedInterval : 1;
    const recurrenceEnd = recurrenceType === 'none' ? null : (task.recurrenceEnd || null);

    return {
        recurrenceType,
        recurrenceInterval,
        recurrenceEnd
    };
}

function calculateNextDueDate(baseDate, recurrence) {
    const nextDueDate = new Date(baseDate);
    const interval = recurrence.recurrenceInterval;

    if (recurrence.recurrenceType === 'daily') {
        nextDueDate.setDate(nextDueDate.getDate() + interval);
    } 
    else if (recurrence.recurrenceType === 'weekly') {
        nextDueDate.setDate(nextDueDate.getDate() + (7 * interval));
    } 
    else if (recurrence.recurrenceType === 'monthly') {
        nextDueDate.setMonth(nextDueDate.getMonth() + interval);
    }

    return nextDueDate;
}

function isPastRecurrenceEnd(date, recurrenceEnd) {
    if (!recurrenceEnd) return false;

    const endDate = new Date(recurrenceEnd);
    endDate.setHours(23, 59, 59, 999);
    return date > endDate;
}

// Builds the *fields* for the next occurrence of a recurring task once the
// current one is marked done. The caller persists them via the API - the
// database assigns the new id, this function never does.
export function buildNextRecurringTaskFields(task) {
    const recurrence = normalizeTaskRecurrence(task);
    if (recurrence.recurrenceType === 'none') return null;

    const baseDate = task.dueDate ? new Date(task.dueDate) : new Date();
    if (!Number.isFinite(baseDate.getTime())) return null;

    const nextDueDate = calculateNextDueDate(baseDate, recurrence);
    if (isPastRecurrenceEnd(nextDueDate, recurrence.recurrenceEnd)) return null;

    return {
        title: task.title,
        content: task.content,
        url: task.url,
        priority: task.priority,
        dueDate: nextDueDate.toISOString().slice(0, 10),
        tags: task.tags,
        recurrenceType: recurrence.recurrenceType,
        recurrenceInterval: recurrence.recurrenceInterval,
        recurrenceEnd: recurrence.recurrenceEnd,
        subtasks: normalizeTaskSubtasks(task.subtasks).map(subtask => ({
            id: generateId(),
            text: subtask.text,
            done: false
        }))
    };
}
