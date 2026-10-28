// Board-level rendering: columns, counts, and the filter toolbar wiring
import { state } from '../modules/state.js';
import { applyFilters, sortTasksByDueDate, getAvailableTags } from '../modules/filters.js';
import { boardElements, filterElements } from './dom.js';
import { createTaskCard, createEmptyState } from './task-card.js';

export function renderTasks() {
    updateTagFilterOptions(state.tasks);
    updateFilterIndicators();

    const filteredTasks = sortTasksByDueDate(applyFilters(state.tasks));
    const hasActiveFilters = hasAnyActiveFilter();

    clearColumns();
    const { taskCounts, totalCounts } = renderTaskCards(filteredTasks);
    fillEmptyColumns();
    updateColumnCounts(taskCounts, totalCounts, hasActiveFilters);
}

function hasAnyActiveFilter() {
    const { search, priority, tag, status, dueDate } = state.filters;
    return Boolean(search.trim() || priority !== 'all' || tag !== 'all' || status !== 'all' || dueDate !== 'all');
}

function clearColumns() {
    Object.values(boardElements.columns).forEach(el => el.innerHTML = '');
    Object.keys(boardElements.counts).forEach(k => boardElements.counts[k].innerText = '0');
}

function renderTaskCards(filteredTasks) {
    const taskCounts = { todo: 0, progress: 0, 'ready-for-review': 0, done: 0 };
    const totalCounts = { todo: 0, progress: 0, 'ready-for-review': 0, done: 0 };

    state.tasks.forEach(task => {
        if (totalCounts[task.status] !== undefined) totalCounts[task.status]++;
    });

    filteredTasks.forEach(task => {
        if (!boardElements.columns[task.status]) {
            task.status = 'todo'; // Safety net for a corrupted/unknown status
        }

        const card = createTaskCard(task);
        boardElements.columns[task.status]?.appendChild(card);
        taskCounts[task.status]++;
    });

    return { taskCounts, totalCounts };
}

function fillEmptyColumns() {
    Object.keys(boardElements.columns).forEach(status => {
        if (boardElements.columns[status].children.length === 0) {
            boardElements.columns[status].appendChild(createEmptyState());
        }
    });
}

function updateColumnCounts(taskCounts, totalCounts, hasActiveFilters) {
    Object.keys(totalCounts).forEach(status => {
        const totalCount = totalCounts[status];
        const countLabel = hasActiveFilters
            ? `${taskCounts[status]}/${totalCount}`
            : `${totalCount}`;

        if (boardElements.counts[status]) boardElements.counts[status].innerText = countLabel;
    });
}

// -- Toolbar filters --
export function setupFilterListeners() {
    if (!filterElements.search) return;

    if (filterElements.sortDueDate) {
        filterElements.sortDueDate.value = state.filters.sortDueDate;
    }

    filterElements.search.addEventListener('input', () => {
        state.filters.search = filterElements.search.value;
        renderTasks();
    });
    filterElements.priority?.addEventListener('change', () => {
        state.filters.priority = filterElements.priority.value;
        renderTasks();
    });
    filterElements.tags?.addEventListener('change', () => {
        state.filters.tag = filterElements.tags.value;
        renderTasks();
    });
    filterElements.users?.addEventListener('change', () => {
        state.filters.user = filterElements.users.value;
        renderTasks();
    });
    filterElements.status?.addEventListener('change', () => {
        state.filters.status = filterElements.status.value;
        renderTasks();
    });
    filterElements.dueDate?.addEventListener('change', () => {
        state.filters.dueDate = filterElements.dueDate.value;
        renderTasks();
    });
    filterElements.sortDueDate?.addEventListener('change', () => {
        state.filters.sortDueDate = filterElements.sortDueDate.value;
        renderTasks();
    });
}

function updateTagFilterOptions(tasks) {
    const { tags: tagsSelect } = filterElements;
    if (!tagsSelect) return;

    const currentSelection = tagsSelect.value || state.filters.tag;
    const sortedTags = getAvailableTags(tasks);

    tagsSelect.innerHTML = '<option value="all">All tags</option>';
    sortedTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = `#${tag}`;
        tagsSelect.appendChild(option);
    });

    const selectionStillValid = sortedTags.includes(currentSelection);
    tagsSelect.value = selectionStillValid ? currentSelection : 'all';
    state.filters.tag = selectionStillValid ? currentSelection : 'all';
}

function updateFilterIndicators() {
    if (!filterElements.search) return;

    const filterMap = new Map([
        [filterElements.search, state.filters.search.trim() !== ''],
        [filterElements.priority, state.filters.priority !== 'all'],
        [filterElements.tags, state.filters.tag !== 'all'],
        [filterElements.users, state.filters.tag !== 'all'],
        [filterElements.status, state.filters.status !== 'all'],
        [filterElements.dueDate, state.filters.dueDate !== 'all'],
        [filterElements.sortDueDate, state.filters.sortDueDate !== 'none']
    ]);

    filterMap.forEach((isActive, element) => {
        element?.classList.toggle('filter-active', isActive);
    });
}
