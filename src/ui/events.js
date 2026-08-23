// Global event wiring: modal triggers, delegated card clicks, filters, memo autosave
import { state } from '../modules/state.js';
import { exportBoardData, importBoardData } from '../modules/board-io.js';
import { clearHistory } from '../modules/history.js';
import { toggleTimer } from '../modules/timer.js';
import { addSubtask, toggleSubtask, removeSubtask, deleteTask, clearAllTasks } from '../modules/tasks.js';

import { modalElements, historyElements, timeLogsElements, analyticsElements } from './dom.js';
import { renderTasks, setupFilterListeners } from './board.js';
import {
    openModal, closeModal, handleTaskSubmit,
    addModalSubtask, renderModalSubtasks, syncRecurrenceFieldState,
    setupModalCloseOnEscape, setupTaskIdSelectOnFocus
} from './task-modal.js';
import { setupTagsInput } from './tags-input.js';
import { openHistoryModal, closeHistoryModal, renderHistory } from './history-panel.js';
import { openAnalyticsModal, closeAnalyticsModal } from './analytics-panel.js';
import { openTimeLogs, closeTimeLogsModal } from './time-logs-panel.js';
import { queueMemoDraftSave, flushMemoDraftSave } from './memo.js';

export function setupEventListeners() {
    setupModalTriggers();
    setupSubtaskModalControls();
    setupHistoryAndAnalyticsTriggers();
    setupBoardActionButtons();
    setupImportExport();

    setupTagsInput();
    setupModalCloseOnEscape();
    setupTaskIdSelectOnFocus();
    setupFilterListeners();

    window.addEventListener('click', handleGlobalClick);
    document.addEventListener('input', handleMemoInput);
    document.addEventListener('blur', handleMemoBlur, true);
    document.addEventListener('keydown', handleInlineSubtaskEnter);

    modalElements.recurrenceTypeInput?.addEventListener('change', syncRecurrenceFieldState);
    syncRecurrenceFieldState();
}

function setupModalTriggers() {
    document.getElementById('add-task-btn').addEventListener('click', () => openModal());
    document.getElementById('cancel-modal').addEventListener('click', closeModal);
    modalElements.form.addEventListener('submit', (e) => handleTaskSubmit(e, renderTasks));
}

function setupSubtaskModalControls() {
    modalElements.addSubtaskBtn?.addEventListener('click', () => {
        addModalSubtask(modalElements.subtaskInput?.value || '');
    });

    modalElements.subtaskInput?.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        addModalSubtask(modalElements.subtaskInput.value);
    });

    modalElements.subtasksList?.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.modal-subtask-remove');
        if (!removeBtn) return;

        removeBtn.closest('.subtask-item')?.remove();
        if (modalElements.subtasksList.querySelectorAll('.subtask-item').length === 0) {
            renderModalSubtasks([]);
        }
    });

    modalElements.subtasksList?.addEventListener('change', (e) => {
        if (!e.target.classList.contains('modal-subtask-toggle')) return;
        const text = e.target.closest('.subtask-item')?.querySelector('.subtask-text');
        text?.classList.toggle('is-done', e.target.checked);
    });
}

function setupHistoryAndAnalyticsTriggers() {
    document.getElementById('history-btn').addEventListener('click', openHistoryModal);
    document.getElementById('close-history').addEventListener('click', closeHistoryModal);
    document.getElementById('analytics-btn').addEventListener('click', openAnalyticsModal);
    document.getElementById('close-analytics').addEventListener('click', closeAnalyticsModal);
    document.getElementById('close-logs-btn').addEventListener('click', closeTimeLogsModal);

    document.getElementById('clear-history-btn').addEventListener('click', async () => {
        if (!confirm('Clear history?')) return;
        await clearHistory();
        renderHistory();
    });
}

function setupBoardActionButtons() {
    document.getElementById('clear-all-btn').addEventListener('click', async () => {
        if (!confirm('Delete all tasks?')) return;
        await clearAllTasks();
        renderTasks();
    });
}

function setupImportExport() {
    document.getElementById('export-btn').addEventListener('click', exportBoardData);

    document.getElementById('import-btn-trigger').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => handleImportedFile(event.target.result);
        reader.readAsText(file);
    });
}

async function handleImportedFile(fileContent) {
    if (await importBoardData(fileContent)) {
        renderTasks();
        renderHistory();
        alert('Board imported successfully!');
    }
    else {
        alert('Failed to import board. Invalid file format.');
    }
}

async function handleInlineSubtaskEnter(e) {
    if (!e.target.classList?.contains('subtask-inline-input')) return;
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const taskId = e.target.dataset.taskId;
    await addSubtask(taskId, e.target.value);
    renderTasks();
}

function handleMemoInput(e) {
    if (!e.target.classList?.contains('active-memo-input')) return;
    const taskId = e.target.dataset.memoTaskId;
    if (taskId) queueMemoDraftSave(taskId, e.target.value);
}

function handleMemoBlur(e) {
    if (!e.target.classList?.contains('active-memo-input')) return;
    const taskId = e.target.dataset.memoTaskId;
    if (taskId) flushMemoDraftSave(taskId, e.target.value);
}

function handleGlobalClick(e) {
    if (handleModalBackdropClick(e)) return;
    if (e.target.classList?.contains('active-memo-input')) return;

    const btn = e.target.closest('button');
    if (!btn) return;

    const card = btn.closest('.task-card');
    handleCardButtonClick(e, btn, card);
}

function handleModalBackdropClick(e) {
    if (e.target === modalElements.modal) { closeModal(); return true; }
    if (e.target === historyElements.modal) { closeHistoryModal(); return true; }
    if (e.target === timeLogsElements.modal) { closeTimeLogsModal(); return true; }
    if (e.target === analyticsElements.modal) { closeAnalyticsModal(); return true; }
    return false;
}

function handleCardButtonClick(e, btn, card) {
    if (btn.classList.contains('timer-btn') && card) return handleTimerButtonClick(e, btn, card);
    if (btn.classList.contains('edit-btn') && card) return handleEditButtonClick(card);
    if (btn.classList.contains('delete-btn') && card) return handleDeleteButtonClick(card);
    if (btn.classList.contains('subtask-toggle-btn') && card) return handleSubtaskToggleClick(e, btn, card);
    if (btn.classList.contains('subtask-remove-btn') && card) return handleSubtaskRemoveClick(e, btn, card);
    if (btn.classList.contains('subtask-inline-add-btn') && card) return handleSubtaskInlineAddClick(e, card);
    if (btn.classList.contains('details-toggle') && card) return handleDetailsToggleClick(e, btn, card);
    if (btn.classList.contains('view-logs-btn') && card) return handleViewLogsClick(e, card);
}

async function handleTimerButtonClick(e, btn, card) {
    e.stopPropagation();
    const taskId = card.dataset.id;
    const action = btn.dataset.action;

    if (action === 'pause' && !confirmPauseWithoutMemo(card, taskId)) {
        return;
    }

    await toggleTimer(taskId, action);
    renderTasks();
}

function confirmPauseWithoutMemo(card, taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    const memoInput = card.querySelector('.active-memo-input');
    const note = memoInput ? memoInput.value.trim() : (task?.activeMemoSession?.note || '').trim();

    if (memoInput) flushMemoDraftSave(taskId, memoInput.value);
    if (note) return true;

    const shouldAddSummary = confirm('No memo summary was added for this session. Do you want to add one before stopping the timer?');
    if (shouldAddSummary) {
        memoInput?.focus();
        return false;
    }
    return true;
}

export function handleEditButtonClick(card) {
    const task = state.tasks.find(t => t.id === card.dataset.id);
    openModal(task);
}

async function handleDeleteButtonClick(card) {
    const task = state.tasks.find(t => t.id === card.dataset.id);
    if (!task || !confirm('Delete task?')) return;

    await deleteTask(task.id);
    renderTasks();
}

async function handleSubtaskToggleClick(e, btn, card) {
    e.stopPropagation();
    await toggleSubtask(card.dataset.id, btn.dataset.subtaskId);
    renderTasks();
}

async function handleSubtaskRemoveClick(e, btn, card) {
    e.stopPropagation();
    await removeSubtask(card.dataset.id, btn.dataset.subtaskId);
    renderTasks();
}

async function handleSubtaskInlineAddClick(e, card) {
    e.stopPropagation();
    const input = card.querySelector('.subtask-inline-input');
    await addSubtask(card.dataset.id, input?.value || '');
    renderTasks();
}

function handleDetailsToggleClick(e, btn, card) {
    e.stopPropagation();
    card.classList.toggle('is-expanded');
    const details = card.querySelector('.task-details');
    const expanded = card.classList.contains('is-expanded');
    if (details) details.hidden = !expanded;
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

function handleViewLogsClick(e, card) {
    e.stopPropagation();
    openTimeLogs(card.dataset.id);
}
