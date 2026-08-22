// Task CRUD operations - the business logic behind the board.
// Pure state + storage + history, no DOM access.
import { state } from './state.js';
import { generateId } from './id.js';
import { createTask, normalizeTaskRecurrence } from './task-model.js';
import { saveData } from './storage.js';
import { addToHistory } from './history.js';

export function findTask(taskId) {
    return state.tasks.find(t => t.id === taskId);
}

export function createTaskFromForm(fields) {
    const task = createTask(fields);
    state.tasks.push(task);
    saveData();
    addToHistory('created', `Created "${task.content}"`);
    return task;
}

export function updateTaskFromForm(taskId, fields) {
    const task = findTask(taskId);
    if (!task) return null;

    const recurrence = normalizeTaskRecurrence(fields);
    task.content = fields.content;
    task.url = fields.url || '';
    task.priority = fields.priority || 'medium';
    task.dueDate = fields.dueDate || null;
    task.tags = fields.tags || [];
    task.recurrenceType = recurrence.recurrenceType;
    task.recurrenceInterval = recurrence.recurrenceInterval;
    task.recurrenceEnd = recurrence.recurrenceEnd;
    task.subtasks = fields.subtasks || [];

    saveData();
    return task;
}

export function deleteTask(taskId) {
    const task = findTask(taskId);
    if (!task) return;

    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveData();
    addToHistory('deleted', `Deleted "${task.content}"`);
}

export function clearAllTasks() {
    state.tasks = [];
    saveData();
    addToHistory('cleared', 'Cleared all tasks');
}

export function toggleSubtask(taskId, subtaskId) {
    const task = findTask(taskId);
    if (!task) return;

    task.subtasks = (task.subtasks || []).map(subtask =>
        subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
    );
    saveData();
}

export function removeSubtask(taskId, subtaskId) {
    const task = findTask(taskId);
    if (!task) return;

    task.subtasks = (task.subtasks || []).filter(subtask => subtask.id !== subtaskId);
    saveData();
}

export function addSubtask(taskId, text) {
    const normalized = typeof text === 'string' ? text.trim() : '';
    const task = findTask(taskId);
    if (!task || !normalized) return;

    task.subtasks = [...(task.subtasks || []), { id: generateId(), text: normalized, done: false }];
    saveData();
}
