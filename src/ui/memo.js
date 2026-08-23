// Session memo autosave (debounced) + the small status/state chips it drives
import { findTask } from '../modules/tasks.js';
import { updateActiveMemoDraft } from '../modules/timer.js';

const memoDraftTimers = new Map();
const memoSaveStatusTimestamps = new Map();

export function getSessionStateMeta(task) {
    const memoNote = task.activeMemoSession?.note?.trim() || '';

    if (task.isTracking) {
        return memoNote
            ? { label: 'Recording', tone: 'recording' }
            : { label: 'Awaiting summary', tone: 'awaiting' };
    }

    return { label: 'Paused', tone: 'paused' };
}

export function getMemoSaveStatusText(taskId) {
    const lastSavedAt = memoSaveStatusTimestamps.get(taskId);
    if (!lastSavedAt) return '';
    return Date.now() - lastSavedAt <= 5000 ? 'Autosaved just now' : 'Draft saved';
}

function getTaskCardById(taskId) {
    return Array.from(document.querySelectorAll('.task-card')).find(card => card.dataset.id === taskId) || null;
}

export function syncMemoSessionUiState(taskId) {
    const task = findTask(taskId);
    const card = getTaskCardById(taskId);
    if (!task || !card) return;

    const chip = card.querySelector('[data-session-state-chip]');
    if (chip) {
        const chipMeta = getSessionStateMeta(task);
        chip.textContent = chipMeta.label;
        chip.className = `session-state-chip session-state-chip--${chipMeta.tone}`;
    }

    const saveStatus = card.querySelector('[data-memo-save-status]');
    if (saveStatus) {
        saveStatus.textContent = getMemoSaveStatusText(taskId);
    }
}

export function queueMemoDraftSave(taskId, note, delay = 400) {
    if (memoDraftTimers.has(taskId)) {
        clearTimeout(memoDraftTimers.get(taskId));
    }

    const timer = setTimeout(() => {
        updateActiveMemoDraft(taskId, note);
        memoSaveStatusTimestamps.set(taskId, Date.now());
        syncMemoSessionUiState(taskId);
        memoDraftTimers.delete(taskId);
    }, delay);

    memoDraftTimers.set(taskId, timer);
}

export function flushMemoDraftSave(taskId, note) {
    if (memoDraftTimers.has(taskId)) {
        clearTimeout(memoDraftTimers.get(taskId));
        memoDraftTimers.delete(taskId);
    }

    updateActiveMemoDraft(taskId, note);
    memoSaveStatusTimestamps.set(taskId, Date.now());
    syncMemoSessionUiState(taskId);
}
