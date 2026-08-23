// Initial board load - pulls tasks + history from the API into state
import { state } from './state.js';
import { fetchTasks, fetchHistory } from './api.js';

export async function loadData() {
    try {
        state.tasks = await fetchTasks();
    } catch (e) {
        console.error('Failed to load tasks:', e);
        state.tasks = [];
    }

    try {
        state.history = await fetchHistory();
    } catch (e) {
        console.error('Failed to load history:', e);
        state.history = [];
    }

    restoreActiveMemoDraft();
}

function restoreActiveMemoDraft() {
    const activeMemoTask = state.tasks.find(task => task.isTracking && task.activeMemoSession);
    state.activeMemoDraftTaskId = activeMemoTask ? activeMemoTask.id : null;
}
