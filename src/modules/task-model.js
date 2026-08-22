// Task domain model: shape, defaults, and recurrence logic.
// No DOM and no storage access here - pure data functions.
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

// Builds the next occurrence of a recurring task once the current one is done.
export function createNextRecurringTask(task) {
    const recurrence = normalizeTaskRecurrence(task);
    if (recurrence.recurrenceType === 'none') return null;

    const baseDate = task.dueDate ? new Date(task.dueDate) : new Date();
    if (!Number.isFinite(baseDate.getTime())) return null;

    const nextDueDate = calculateNextDueDate(baseDate, recurrence);
    if (isPastRecurrenceEnd(nextDueDate, recurrence.recurrenceEnd)) return null;

    return {
        ...task,
        id: generateId(),
        status: 'todo',
        createdAt: new Date().toISOString(),
        dueDate: nextDueDate.toISOString().slice(0, 10),
        totalTime: 0,
        isTracking: false,
        lastStartTime: null,
        timeLogs: [],
        memoSessions: [],
        activeMemoSession: null,
        subtasks: normalizeTaskSubtasks(task.subtasks).map(subtask => ({
            id: generateId(),
            text: subtask.text,
            done: false
        }))
    };
}

// Builds a brand-new task object. The ID is assigned right here, at creation
// time, so it exists as soon as the task is saved for the first time.
export function createTask(fields) {
    const recurrence = normalizeTaskRecurrence(fields);

    return {
        id: generateId(),
        content: fields.content,
        url: fields.url || '',
        status: 'todo',
        createdAt: new Date().toISOString(),
        priority: fields.priority || 'medium',
        dueDate: fields.dueDate || null,
        tags: fields.tags || [],
        recurrenceType: recurrence.recurrenceType,
        recurrenceInterval: recurrence.recurrenceInterval,
        recurrenceEnd: recurrence.recurrenceEnd,
        totalTime: 0,
        isTracking: false,
        lastStartTime: null,
        timeLogs: [],
        memoSessions: [],
        activeMemoSession: null,
        subtasks: normalizeTaskSubtasks(fields.subtasks)
    };
}
