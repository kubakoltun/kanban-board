// Task CRUD operations - the business logic behind the board.
// Talks to the API (Postgres via Drizzle on the server); state.tasks is kept
// in sync with whatever the server confirms back.
import { state } from './state.js';
import { generateId } from './id.js';
import { normalizeTaskRecurrence } from './task-model.js';
import { createTaskApi, updateTaskApi, deleteTaskApi, clearTasksApi } from './api.js';
import { addToHistory } from './history.js';

// Task ids come back from the database as numbers, but any id read off the
// DOM (dataset attributes) is always a string - compare loosely by string
// so lookups work regardless of which side the id came from.
export function findTask(taskId) {
    return state.tasks.find(t => String(t.id) === String(taskId));
}

export async function createTaskFromForm(fields) {
    const recurrence = normalizeTaskRecurrence(fields);

    const task = await createTaskApi({
        title: fields.title,
        content: fields.content,
        url: fields.url || '',
        priority: fields.priority || 'medium',
        dueDate: fields.dueDate || null,
        tags: fields.tags || [],
        assignedUserId: fields.assignedUserId || null,
        recurrenceType: recurrence.recurrenceType,
        recurrenceInterval: recurrence.recurrenceInterval,
        recurrenceEnd: recurrence.recurrenceEnd,
        subtasks: fields.subtasks || []
    });

    state.tasks.push(task);
    await addToHistory('created', `Created "${task.title}"`);
    return task;
}

export async function updateTaskFromForm(taskId, fields) {
    const task = findTask(taskId);
    if (!task) return null;

    const recurrence = normalizeTaskRecurrence(fields);
    Object.assign(task, {
        title: fields.title,
        content: fields.content,
        url: fields.url || '',
        priority: fields.priority || 'medium',
        dueDate: fields.dueDate || null,
        tags: fields.tags || [],
        assignedUserId: fields.assignedUserId || null,
        recurrenceType: recurrence.recurrenceType,
        recurrenceInterval: recurrence.recurrenceInterval,
        recurrenceEnd: recurrence.recurrenceEnd,
        subtasks: fields.subtasks || []
    });

    return persistTask(task);
}

// Saves the full current shape of a task back to the server. Used whenever
// something mutates a task object in place (timer ticks, drag moves,
// subtask toggles) rather than going through the edit form.
export async function persistTask(task) {
    const saved = await updateTaskApi(task.id, task);
    Object.assign(task, saved);
    return task;
}

export async function deleteTask(taskId) {
    const task = findTask(taskId);
    if (!task) return;

    await deleteTaskApi(taskId);
    state.tasks = state.tasks.filter(t => t.id !== task.id);
    await addToHistory('deleted', `Deleted "${task.title}"`);
}

export async function clearAllTasks() {
    await clearTasksApi();
    state.tasks = [];
    await addToHistory('cleared', 'Cleared all tasks');
}

export async function toggleSubtask(taskId, subtaskId) {
    const task = findTask(taskId);
    if (!task) return;

    task.subtasks = (task.subtasks || []).map(subtask =>
        subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
    );
    await persistTask(task);
}

export async function removeSubtask(taskId, subtaskId) {
    const task = findTask(taskId);
    if (!task) return;

    task.subtasks = (task.subtasks || []).filter(subtask => subtask.id !== subtaskId);
    await persistTask(task);
}

export async function addSubtask(taskId, text) {
    const normalized = typeof text === 'string' ? text.trim() : '';
    const task = findTask(taskId);
    if (!task || !normalized) return;

    task.subtasks = [...(task.subtasks || []), { id: generateId(), text: normalized, done: false }];
    await persistTask(task);
}
