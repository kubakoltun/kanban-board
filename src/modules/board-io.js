// Board Export / Import (JSON backup file)
import { state } from './state.js';
import { normalizeTaskRecurrence, normalizeTaskSubtasks } from './task-model.js';
import { saveData, saveHistory } from './storage.js';

export function exportBoardData() {
    const data = {
        tasks: state.tasks,
        history: state.history,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importTasks(tasks) {
    if (!Array.isArray(tasks)) return;

    state.tasks = tasks.map(task => ({
        ...task,
        memoSessions: task.memoSessions || [],
        activeMemoSession: task.activeMemoSession || null,
        subtasks: normalizeTaskSubtasks(task.subtasks),
        ...normalizeTaskRecurrence(task)
    }));
    saveData();
}

function importHistory(history) {
    if (!Array.isArray(history)) return;

    state.history = history;
    saveHistory();
}

export function importBoardData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        importTasks(data.tasks);
        importHistory(data.history);
        
        return true;
    } catch (e) {
        console.error('Import failed:', e);
        
        return false;
    }
}
