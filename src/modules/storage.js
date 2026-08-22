// Persistence: localStorage load/save + one-time migration of older task shapes
import { state } from './state.js';
import { normalizeTaskRecurrence, normalizeTaskSubtasks } from './task-model.js';

const TASKS_KEY = 'kanban-tasks';
const HISTORY_KEY = 'kanban-history';

function migrateTask(task) {
    return {
        ...task,
        totalTime: task.totalTime || 0,
        isTracking: task.isTracking || false,
        lastStartTime: task.lastStartTime || null,
        timeLogs: task.timeLogs || [],
        memoSessions: task.memoSessions || [],
        activeMemoSession: task.activeMemoSession || null,
        priority: task.priority || 'medium',
        dueDate: task.dueDate || null,
        tags: task.tags || [],
        url: task.url || '',
        subtasks: normalizeTaskSubtasks(task.subtasks),
        ...normalizeTaskRecurrence(task)
    };
}

function restoreActiveMemoDraft() {
    const activeMemoTask = state.tasks.find(task => task.isTracking && task.activeMemoSession);
    state.activeMemoDraftTaskId = activeMemoTask ? activeMemoTask.id : null;
}

export function loadData() {
    try {
        const loadedTasks = localStorage.getItem(TASKS_KEY);
        const parsedTasks = loadedTasks ? JSON.parse(loadedTasks) : [];
        state.tasks = parsedTasks.map(migrateTask);
        restoreActiveMemoDraft();
    } catch (e) {
        console.error('Failed to load tasks:', e);
        state.tasks = [];
    }

    try {
        const loadedHistory = localStorage.getItem(HISTORY_KEY);
        state.history = loadedHistory ? JSON.parse(loadedHistory) : [];
    } catch (e) {
        console.error('Failed to load history:', e);
        state.history = [];
    }
}

export function saveData() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(state.tasks));
}

export function saveHistory() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
}
