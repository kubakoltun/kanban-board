// Timer Module - mutates the task in memory, then persists it via the API
import { state } from './state.js';
import { persistTask } from './tasks.js';

// Track running timers in a Set so the tick loop doesn't have to scan every task
const activeTimerIds = new Set();

export async function toggleTimer(taskId, action) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (action === 'start') {
        startTimer(task, taskId);
    } 
    else if (action === 'pause') {
        pauseTimer(task, taskId);
    }

    await persistTask(task);
}

function startTimer(task, taskId) {
    task.isTracking = true;
    task.lastStartTime = Date.now();

    if (!task.timeLogs) task.timeLogs = [];
    task.timeLogs.push({ start: Date.now(), end: null });

    if (!task.memoSessions) task.memoSessions = [];
    task.activeMemoSession = {
        taskId,
        startedAt: new Date(task.lastStartTime).toISOString(),
        endedAt: null,
        note: '',
        duration: null
    };

    state.activeMemoDraftTaskId = taskId;
    activeTimerIds.add(taskId);
}

function pauseTimer(task, taskId) {
    if (!task.isTracking) return;

    const now = Date.now();
    const sessionDuration = now - task.lastStartTime;
    task.totalTime += sessionDuration;
    task.isTracking = false;
    task.lastStartTime = null;

    closeLastTimeLog(task, now);
    finalizeMemoSession(task, sessionDuration, now);

    if (state.activeMemoDraftTaskId === taskId) {
        state.activeMemoDraftTaskId = null;
    }
    activeTimerIds.delete(taskId);
}

function closeLastTimeLog(task, now) {
    if (!task.timeLogs || task.timeLogs.length === 0) return;

    const lastLog = task.timeLogs[task.timeLogs.length - 1];
    if (!lastLog.end) {
        lastLog.end = now;
    }
}

function finalizeMemoSession(task, sessionDuration, now) {
    if (!task.activeMemoSession) return;

    const finalizedMemo = {
        ...task.activeMemoSession,
        endedAt: new Date(now).toISOString(),
        duration: sessionDuration
    };
    task.memoSessions.push(finalizedMemo);
    task.activeMemoSession = null;
}

export async function updateActiveMemoDraft(taskId, note = '') {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || !task.activeMemoSession) return;

    task.activeMemoSession.note = note;
    state.activeMemoDraftTaskId = taskId;
    await persistTask(task);
}

export function getTaskMemoHistory(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    return task ? (task.memoSessions || []) : [];
}

export function getActiveTimerIds() {
    return activeTimerIds;
}

export function restoreActiveTimers() {
    // Call on load to repopulate the Set from what the server returned
    state.tasks.forEach(task => {
        if (!task.isTracking) return;

        activeTimerIds.add(task.id);
        if (task.activeMemoSession) {
            state.activeMemoDraftTaskId = task.id;
        }
    });
}

export function formatTime(ms) {
    if (!ms || isNaN(ms)) ms = 0;

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const pad = (num) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
