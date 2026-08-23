// Add/Edit Task Modal
import { generateId } from '../modules/id.js';
import { normalizeTaskRecurrence } from '../modules/task-model.js';
import { createTaskFromForm, updateTaskFromForm } from '../modules/tasks.js';
import { modalElements } from './dom.js';
import { escapeHtml } from './format.js';
import { clearTagChips, addTagChip, getTagsFromChips } from './tags-input.js';

function normalizeSubtaskText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

export function renderModalSubtasks(subtasks = []) {
    const { subtasksList } = modalElements;
    if (!subtasksList) return;

    subtasksList.innerHTML = '';
    if (subtasks.length === 0) {
        subtasksList.innerHTML = '<li class="subtask-empty">No subtasks yet.</li>';
        return;
    }

    subtasks.forEach(subtask => {
        subtasksList.appendChild(buildSubtaskListItem(subtask));
    });
}

function buildSubtaskListItem(subtask) {
    const li = document.createElement('li');
    li.className = 'subtask-item';
    li.dataset.subtaskId = subtask.id;
    li.innerHTML = `
        <label>
            <input type="checkbox" class="modal-subtask-toggle" ${subtask.done ? 'checked' : ''} />
            <span class="subtask-text ${subtask.done ? 'is-done' : ''}">${escapeHtml(subtask.text)}</span>
        </label>
        <button type="button" class="modal-subtask-remove" aria-label="Remove subtask">×</button>
    `;
    return li;
}

export function getModalSubtasks() {
    const { subtasksList } = modalElements;
    if (!subtasksList) return [];

    return Array.from(subtasksList.querySelectorAll('.subtask-item'))
        .map(item => ({
            id: item.dataset.subtaskId || generateId(),
            text: normalizeSubtaskText(item.querySelector('.subtask-text')?.textContent || ''),
            done: Boolean(item.querySelector('.modal-subtask-toggle')?.checked)
        }))
        .filter(subtask => subtask.text);
}

export function addModalSubtask(text) {
    const normalized = normalizeSubtaskText(text);
    if (!normalized) return;

    const subtasks = getModalSubtasks();
    subtasks.push({ id: generateId(), text: normalized, done: false });
    renderModalSubtasks(subtasks);

    const { subtaskInput } = modalElements;
    if (subtaskInput) {
        subtaskInput.value = '';
        subtaskInput.focus();
    }
}

export function syncRecurrenceFieldState() {
    const { recurrenceTypeInput, recurrenceSettingsContainer, recurrenceIntervalInput, recurrenceEndInput } = modalElements;
    if (!recurrenceTypeInput) return;

    const isRecurring = recurrenceTypeInput.value !== 'none';
    recurrenceSettingsContainer?.classList.toggle('is-disabled', !isRecurring);

    if (recurrenceIntervalInput) {
        recurrenceIntervalInput.disabled = !isRecurring;
        if (!isRecurring) recurrenceIntervalInput.value = '1';
    }

    if (recurrenceEndInput) {
        recurrenceEndInput.disabled = !isRecurring;
        if (!isRecurring) recurrenceEndInput.value = '';
    }
}

// The ID field only has something to show once a task actually has an id
// (i.e. when editing) - a brand-new task doesn't get one until the database
// assigns it on save.
function fillModalForExistingTask(task) {
    const {
        title, idInput, idGroup, titleInput, descInput, urlInput,
        priorityInput, dueDateInput, recurrenceTypeInput,
        recurrenceIntervalInput, recurrenceEndInput
    } = modalElements;

    title.innerText = 'Edit Task';
    idInput.value = task.id;
    if (idGroup) idGroup.hidden = false;
    titleInput.value = task.title || '';
    descInput.value = task.content;
    if (urlInput) urlInput.value = task.url || '';
    if (priorityInput) priorityInput.value = task.priority || 'medium';
    if (dueDateInput) dueDateInput.value = task.dueDate ? task.dueDate.slice(0, 10) : '';

    const recurrence = normalizeTaskRecurrence(task);
    if (recurrenceTypeInput) recurrenceTypeInput.value = recurrence.recurrenceType;
    if (recurrenceIntervalInput) recurrenceIntervalInput.value = recurrence.recurrenceInterval;
    if (recurrenceEndInput) recurrenceEndInput.value = recurrence.recurrenceEnd ? recurrence.recurrenceEnd.slice(0, 10) : '';

    (task.tags || []).forEach(tag => addTagChip(tag));
    renderModalSubtasks(task.subtasks || []);
}

function fillModalForNewTask() {
    const {
        title, idInput, idGroup, titleInput, descInput, urlInput,
        priorityInput, dueDateInput, recurrenceTypeInput,
        recurrenceIntervalInput, recurrenceEndInput
    } = modalElements;

    title.innerText = 'Add New Task';
    idInput.value = '';
    if (idGroup) idGroup.hidden = true; // No ID exists yet until the task is saved
    titleInput.value = '';
    descInput.value = '';
    if (urlInput) urlInput.value = '';
    if (priorityInput) priorityInput.value = 'medium';
    if (dueDateInput) dueDateInput.value = '';
    if (recurrenceTypeInput) recurrenceTypeInput.value = 'none';
    if (recurrenceIntervalInput) recurrenceIntervalInput.value = '1';
    if (recurrenceEndInput) recurrenceEndInput.value = '';

    renderModalSubtasks([]);
}

export function openModal(task = null) {
    modalElements.modal.classList.add('active');
    document.body.classList.add('modal-open');
    clearTagChips();

    if (task) {
        fillModalForExistingTask(task);
    } 
    else {
        fillModalForNewTask();
    }

    syncRecurrenceFieldState();
    const formBody = modalElements.form?.querySelector('.task-form-body');
    if (formBody) formBody.scrollTop = 0;
    modalElements.titleInput.focus();
}

export function closeModal() {
    modalElements.modal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// Registered once (in events.js), rather than re-added on every openModal()
// call - that would otherwise pile up duplicate listeners.
export function setupModalCloseOnEscape() {
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' && e.key !== 'Esc') return;
        if (!modalElements.modal.classList.contains('active')) return;
        closeModal();
    });
}

// The ID field is read-only, but a click/focus selects its whole contents
// so it's still one quick copy (Ctrl/Cmd+C) away.
export function setupTaskIdSelectOnFocus() {
    const selectAll = () => modalElements.idInput?.select();
    modalElements.idInput?.addEventListener('click', selectAll);
    modalElements.idInput?.addEventListener('focus', selectAll);
}

function readFormFields() {
    const {
        idInput, titleInput, descInput, urlInput, priorityInput, dueDateInput,
        recurrenceTypeInput, recurrenceIntervalInput, recurrenceEndInput
    } = modalElements;

    return {
        id: idInput.value,
        title: titleInput.value.trim(),
        content: descInput.value.trim(),
        url: urlInput ? urlInput.value.trim() : '',
        priority: priorityInput ? priorityInput.value : 'medium',
        dueDate: dueDateInput ? dueDateInput.value : null,
        recurrenceType: recurrenceTypeInput ? recurrenceTypeInput.value : 'none',
        recurrenceInterval: recurrenceIntervalInput ? Number.parseInt(recurrenceIntervalInput.value, 10) : 1,
        recurrenceEnd: recurrenceEndInput ? (recurrenceEndInput.value || null) : null,
        tags: getTagsFromChips(),
        subtasks: getModalSubtasks()
    };
}

export async function handleTaskSubmit(e, onSaved) {
    e.preventDefault();
    const fields = readFormFields();
    if (!fields.title || !fields.content) return;

    if (fields.id) {
        await updateTaskFromForm(fields.id, fields);
    } 
    else {
        await createTaskFromForm(fields);
    }

    onSaved?.();
    closeModal();
}
