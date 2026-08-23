import { state } from './modules/state.js';
import { loadData } from './modules/load.js';
import { restoreActiveTimers, getActiveTimerIds, formatTime } from './modules/timer.js';
import { initDragSystem } from './modules/drag.js';
import { renderTasks, setupEventListeners } from './ui/index.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    restoreActiveTimers();
    setupEventListeners();
    setupDragAndDrop();
    renderTasks();
    startTimerTickLoop();
});

function setupDragAndDrop() {
    const columns = document.querySelectorAll('.column');
    initDragSystem(columns, () => renderTasks());
}

function startTimerTickLoop() {
    setInterval(() => {
        const activeIds = getActiveTimerIds();
        if (activeIds.size === 0) return;

        activeIds.forEach(id => updateRunningTimerDisplay(id));
    }, 1000);
}

function updateRunningTimerDisplay(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentTotal = task.totalTime + (Date.now() - task.lastStartTime);

    const el = document.getElementById(`timer-${task.id}`);
    if (el) {
        el.innerHTML = `<span class="recording-dot"></span> ${formatTime(currentTotal)}`;
    }

    if (state.viewedTaskId === taskId) {
        const modalDisplay = document.querySelector('.total-time-display');
        if (modalDisplay) modalDisplay.innerText = formatTime(currentTotal);
    }
}
