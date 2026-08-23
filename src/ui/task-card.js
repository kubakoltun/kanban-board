// Renders an individual task card for the board
import { state } from '../modules/state.js';
import { formatTime } from '../modules/timer.js';
import { escapeHtml, normalizeUrl, formatUrlLabel } from './format.js';
import { getIcon } from './icons.js';
import { getSessionStateMeta, getMemoSaveStatusText } from './memo.js';
import { handleEditButtonClick } from './events.js';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export function createTaskCard(task) {
    const div = document.createElement('div');
    div.classList.add('task-card');
    div.setAttribute('draggable', 'true');
    div.dataset.id = task.id;
    div.dataset.priority = task.priority || 'medium';
    applyDueDateClass(div, task);

    div.innerHTML = buildCardMarkup(task);

    const detailsPanel = div.querySelector('.task-details');
    if (detailsPanel) detailsPanel.hidden = true;

    attachDragHandlers(div, task);
    attachIdSelectHandler(div);

    return div;
}

function applyDueDateClass(div, task) {
    const dueTimestamp = task.dueDate ? new Date(task.dueDate).getTime() : null;
    if (!Number.isFinite(dueTimestamp)) return;

    const now = Date.now();
    if (dueTimestamp < now) {
        div.classList.add('is-overdue');
    } 
    else if (dueTimestamp - now <= MS_IN_DAY) {
        div.classList.add('is-due-soon');
    }
}

function attachDragHandlers(div, task) {
    div.addEventListener('dragstart', () => {
        div.classList.add('dragging');
        state.draggedTask = task;
    });
    div.addEventListener('dragend', () => {
        div.classList.remove('dragging');
        state.draggedTask = null;
    });

    // Clicking anywhere on the card (that isn't a button, the details panel,
    // or the ID field) opens it for editing.
    div.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        if (e.target.closest('.task-details')) return;
        if (e.target.closest('.task-id-input')) return;

        const card = e.target.closest('.task-card');
        if (card) handleEditButtonClick(card);
    });
}

// The ID field is read-only; clicking it selects its contents so it's a
// quick Ctrl/Cmd+C away without needing a dedicated copy button.
function attachIdSelectHandler(div) {
    const idInput = div.querySelector('.task-id-input');
    idInput?.addEventListener('click', (e) => {
        e.stopPropagation();
        idInput.select();
    });
}

function buildCardMarkup(task) {
    return `
        <div class="task-id-row">
            <input type="text" class="task-id-input" value="${task.id}" readonly aria-label="Task ID" />
        </div>
        <div class="task-title-row">
            <div class="task-title">${escapeHtml(task.title)}</div>
        </div>
        <p class="task-description">${escapeHtml(task.content)}</p>
        <div class="task-priority-row">
            ${buildPriorityBadge(task)}
        </div>
        ${buildTimerSection(task)}
        <div class="task-details ${hasDetails(task) ? '' : 'is-empty'}">
            ${buildUrlLink(task)}
            ${buildMetadataBar(task)}
            ${buildProgressBar(task)}
            ${buildSubtaskPreview(task)}
            ${buildSubtaskQuickAdd(task)}
            ${buildMemoPanel(task)}
        </div>
        <div class="task-meta task-actions-row">
            <span>${new Date(task.createdAt).toLocaleDateString()}</span>
            <div class="task-actions">
                ${buildTimerControl(task)}
                <button class="view-logs-btn" title="View Time Logs">${getIcon('clock')}</button>
                ${buildEditButton(task)}
                <button class="delete-btn" aria-label="Delete">${getIcon('trash')}</button>
                <button class="details-toggle" aria-label="Toggle Details" title="Toggle Details" aria-expanded="false">Details</button>
            </div>
        </div>
    `;
}

function buildPriorityBadge(task) {
    return task.priority ? `<span class="badge badge-${task.priority}">${task.priority}</span>` : '';
}

function buildEditButton(task) {
    if (task.status === 'done') return '';
    return `<button class="edit-btn" aria-label="Edit">${getIcon('edit')}</button>`;
}

// -- Timer section --

function buildTimerSection(task) {
    const isTracking = Boolean(task.isTracking);
    const currentSession = isTracking ? Date.now() - task.lastStartTime : 0;
    const totalDisplay = formatTime((task.totalTime || 0) + currentSession);
    const timerStateClass = isTracking ? 'is-active' : '';

    return `
        <div class="task-secondary-row task-timer ${isTracking ? 'is-running' : ''}">
            <div class="task-timer-header">
                <span class="task-timer-state ${timerStateClass}">${isTracking ? '<span class="recording-dot"></span>' : ''}${getTimerStateLabel(task, isTracking)}</span>
                ${buildSessionStateChip(task, isTracking)}
            </div>
            <span class="timer-display" id="timer-${task.id}">${totalDisplay}</span>
        </div>
    `;
}

function getTimerStateLabel(task, isTracking) {
    if (task.status === 'done') return 'Timer complete';
    if (task.status === 'todo') return 'Not started';
    return isTracking ? 'Running' : 'Paused';
}

function buildSessionStateChip(task, isTracking) {
    const showChip = isTracking && task.status !== 'todo' && task.status !== 'done';
    if (!showChip) return '';

    const { label, tone } = getSessionStateMeta(task);
    return `<span class="session-state-chip session-state-chip--${tone}" data-session-state-chip>${label}</span>`;
}

function buildTimerControl(task) {
    if (task.status === 'todo' || task.status === 'done') return '';

    const isTracking = Boolean(task.isTracking);
    return isTracking
        ? `<button class="timer-btn pause-btn" title="Pause Timer" data-action="pause">${getIcon('pause')}</button>`
        : `<button class="timer-btn start-btn" title="Start Timer" data-action="start">${getIcon('play')}</button>`;
}

// -- Details section pieces --

function buildUrlLink(task) {
    if (!task.url) return '';
    return `<a class="task-link" href="${escapeHtml(normalizeUrl(task.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(formatUrlLabel(task.url))}</a>`;
}

function buildMetadataBar(task) {
    const dateHtml = task.dueDate ? `<span class="badge badge-date">📅 ${new Date(task.dueDate).toLocaleDateString()}</span>` : '';
    const recurrenceText = formatRecurrenceBadge(task);
    const recurrenceHtml = recurrenceText ? `<span class="badge badge-recurrence">${escapeHtml(recurrenceText)}</span>` : '';
    const tagsHtml = (task.tags || []).map(tag => `<span class="badge badge-tag">#${tag}</span>`).join('');

    if (!dateHtml && !recurrenceHtml && !tagsHtml) {
        return '<div class="task-metadata-bar"><span class="task-muted">No metadata added</span></div>';
    }
    return `<div class="task-metadata-bar">${dateHtml} ${recurrenceHtml} ${tagsHtml}</div>`;
}

const RECURRENCE_UNIT_LABELS = {
    daily: ['day', 'days'],
    weekly: ['week', 'weeks'],
    monthly: ['month', 'months']
};

function formatRecurrenceBadge(task) {
    if (!task.recurrenceType || task.recurrenceType === 'none') return '';

    const [single, plural] = RECURRENCE_UNIT_LABELS[task.recurrenceType] || ['cycle', 'cycles'];
    const interval = task.recurrenceInterval || 1;
    const intervalText = interval === 1 ? `every ${single}` : `every ${interval} ${plural}`;
    return `Repeats ${intervalText}`;
}

function getSubtaskProgress(task) {
    const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
    const total = subtasks.length;
    const done = subtasks.filter(subtask => subtask.done).length;
    return { done, total, ratio: total === 0 ? 0 : done / total };
}

function getSubtaskProgressTone(ratio) {
    if (ratio >= 1) return 'complete';
    if (ratio >= 0.5) return 'mid';
    return 'low';
}

function buildProgressBar(task) {
    const progress = getSubtaskProgress(task);
    if (progress.total === 0) return '';

    const tone = getSubtaskProgressTone(progress.ratio);
    return `
        <div class="task-progress">
            <div class="task-progress-header">
                <span class="task-progress-label">Subtasks</span>
                <span class="task-progress-count">${progress.done}/${progress.total}</span>
            </div>
            <div class="task-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${progress.total}" aria-valuenow="${progress.done}">
                <span class="task-progress-fill task-progress-fill--${tone}" style="width:${progress.ratio * 100}%"></span>
            </div>
        </div>
    `;
}

function buildSubtaskPreview(task) {
    const progress = getSubtaskProgress(task);
    if (progress.total === 0) return '';

    const items = (task.subtasks || []).slice(0, 3).map(subtask => `
        <li class="subtask-preview-item ${subtask.done ? 'is-done' : ''}">
            <button class="subtask-toggle-btn" data-subtask-id="${subtask.id}" title="Toggle subtask">${subtask.done ? '✓' : '○'}</button>
            <span class="subtask-preview-text">${escapeHtml(subtask.text)}</span>
            <button class="subtask-remove-btn" data-subtask-id="${subtask.id}" title="Remove subtask">×</button>
        </li>
    `).join('');

    const more = progress.total > 3 ? `<li class="subtask-preview-more">+${progress.total - 3} more</li>` : '';
    return `<ul class="subtask-preview-list">${items}${more}</ul>`;
}

function buildSubtaskQuickAdd(task) {
    return `
        <div class="subtask-quick-add">
            <input type="text" class="subtask-inline-input" data-task-id="${task.id}" placeholder="Add subtask..." aria-label="Add subtask" />
            <button class="subtask-inline-add-btn" data-task-id="${task.id}" title="Add subtask">Add</button>
        </div>
    `;
}

function buildMemoPanel(task) {
    if (!task.isTracking) {
        return '<div class="active-memo-panel"><span class="task-muted">Start a timer session to capture notes.</span></div>';
    }

    const memoDraft = task.activeMemoSession?.note || '';
    const sessionStartTime = task.activeMemoSession?.startedAt
        ? new Date(task.activeMemoSession.startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : 'now';
    const saveStatusText = getMemoSaveStatusText(task.id);

    return `
        <div class="active-memo-panel">
            <label for="memo-${task.id}">Session Memo</label>
            <p class="memo-guidance-text">1–2 sentence summary of what you finished and what is next.</p>
            <p class="memo-guidance-text">Session started at ${escapeHtml(sessionStartTime)}.</p>
            <textarea
                id="memo-${task.id}"
                class="active-memo-input"
                data-memo-task-id="${task.id}"
                placeholder="Add a short summary while you work..."
            >${escapeHtml(memoDraft)}</textarea>
            <p class="memo-save-status" data-memo-save-status="${task.id}" aria-live="polite">${escapeHtml(saveStatusText)}</p>
        </div>
    `;
}

function hasDetails(task) {
    return Boolean(
        task.url ||
        task.dueDate ||
        (task.recurrenceType && task.recurrenceType !== 'none') ||
        (task.tags && task.tags.length) ||
        (task.subtasks && task.subtasks.length) ||
        task.isTracking
    );
}

export function createEmptyState() {
    const div = document.createElement('div');
    div.classList.add('empty-state');
    div.innerHTML = `${getIcon('plus-lg')} <p>No tasks yet</p>`;
    return div;
}
