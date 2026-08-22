// Drag & Drop Module
import { state } from './state.js';
import { createNextRecurringTask } from './task-model.js';
import { saveData } from './storage.js';
import { addToHistory } from './history.js';
import { toggleTimer } from './timer.js';

let renderCallback = null;

export function initDragSystem(columns, renderCb) {
    renderCallback = renderCb;

    columns.forEach(column => {
        const container = column.querySelector('.tasks-container');
        column.addEventListener('dragover', (e) => handleDragOver(e, column, container));
        column.addEventListener('dragleave', () => column.classList.remove('drag-over'));
        column.addEventListener('drop', (e) => handleDrop(e, column));
    });
}

function handleDragOver(e, column, container) {
    e.preventDefault();
    column.classList.add('drag-over');

    const afterElement = getDragAfterElement(container, e.clientY);
    const draggable = document.querySelector('.dragging');

    if (afterElement == null) {
        container.appendChild(draggable);
    } 
    else {
        container.insertBefore(draggable, afterElement);
    }
}

function handleDrop(e, column) {
    e.preventDefault();
    column.classList.remove('drag-over');

    const status = column.dataset.status;
    const draggable = document.querySelector('.dragging');
    if (!draggable) return; // Touch drag edge case

    const task = state.tasks.find(t => t.id === draggable.dataset.id);
    if (!task) return;

    if (task.status !== status) {
        moveTaskToStatus(task, status);
    }

    updateTaskOrder();
    saveData();
    renderCallback?.();
}

function moveTaskToStatus(task, status) {
    const oldStatus = task.status;
    task.status = status;

    if ((status === 'done' || status === 'todo') && task.isTracking) {
        toggleTimer(task.id, 'pause');
        addToHistory('timer', `Auto-stopped timer for "${task.content}" (Moved to ${status})`);
    }

    if (status === 'done') {
        spawnNextRecurrence(task);
    }

    addToHistory('moved', `Moved "${task.content}" from ${oldStatus} to ${status}`, {
        from: oldStatus, to: status, task: task.content
    });
}

function spawnNextRecurrence(task) {
    const nextTask = createNextRecurringTask(task);
    if (!nextTask) return;

    state.tasks.push(nextTask);
    addToHistory('created', `Created recurring task "${nextTask.content}" for ${nextTask.dueDate || 'next cycle'}`);
}

function updateTaskOrder() {
    // Re-read the DOM to find the new order of IDs
    const newOrder = [];
    const seenIds = new Set();

    document.querySelectorAll('.column').forEach(col => {
        const status = col.dataset.status;
        col.querySelectorAll('.task-card').forEach(card => {
            const task = state.tasks.find(t => t.id === card.dataset.id);
            if (!task) return;

            task.status = status; // Ensure status reflects the column it's in
            seenIds.add(task.id);
            newOrder.push(task);
        });
    });

    // Keep newly-created tasks that aren't yet represented in the current DOM pass
    state.tasks.forEach(task => {
        if (!seenIds.has(task.id)) {
            newOrder.push(task);
        }
    });

    state.tasks = newOrder;
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
