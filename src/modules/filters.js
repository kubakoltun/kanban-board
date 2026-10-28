// Task filtering, sorting, and tag-list derivation for the toolbar
import { state } from './state.js';

export function applyFilters(tasks) {
    const searchValue = state.filters.search.trim().toLowerCase();
    const { priority: priorityValue, tag: tagValue, status: statusValue, dueDate: dueDateValue, user: userValue } = state.filters;

    return tasks.filter(task =>
        matchesPriority(task, priorityValue) &&
        matchesStatus(task, statusValue) &&
        matchesTag(task, tagValue) &&
        matchesUser(task, userValue) &&
        matchesSearch(task, searchValue) &&
        matchesDueDateFilter(task, dueDateValue)
    );
}

function matchesPriority(task, priorityValue) {
    if (priorityValue === 'all') return true;
    return (task.priority || 'medium') === priorityValue;
}

function matchesStatus(task, statusValue) {
    if (statusValue === 'all') return true;
    return task.status === statusValue;
}

function matchesUser(task, userValue) {
    if (userValue === 'all') return true;
    const userList = (task.user || []).map(user => user.toLowerCase());
    return userList.includes(userValue);
}

function matchesTag(task, tagValue) {
    if (tagValue === 'all') return true;
    const tagList = (task.tags || []).map(tag => tag.toLowerCase());
    return tagList.includes(tagValue);
}

function matchesSearch(task, searchValue) {
    if (!searchValue) return true;

    const titleMatch = task.title?.toLowerCase().includes(searchValue);

    const descriptionMatch = task.description?.toLowerCase().includes(searchValue);

    const tagMatch = (task.tags || []).some(tag => {
        tag.toLowerCase().includes(searchValue)
    });

    return Boolean(
        titleMatch ||
        descriptionMatch ||
        tagMatch
    );
}

export function matchesDueDateFilter(task, filterValue) {
    if (filterValue === 'all') return true;

    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    if (filterValue === 'no-date') return !dueDate;
    if (!dueDate) return false;

    const todayStart = startOfDay(new Date());
    const dueStart = startOfDay(dueDate);

    switch (filterValue) {
        case 'overdue':
            return dueStart < todayStart;
        case 'today':
            return dueStart.getTime() === todayStart.getTime();
        case 'next-7':
            return isWithinNextDays(dueStart, todayStart, 7);
        default:
            return true;
    }
}

function isWithinNextDays(dueStart, todayStart, days) {
    const rangeEnd = new Date(todayStart);
    rangeEnd.setDate(rangeEnd.getDate() + days);
    return dueStart >= todayStart && dueStart <= rangeEnd;
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function sortTasksByDueDate(tasks) {
    const sortOrder = state.filters.sortDueDate || 'none';
    if (sortOrder === 'none') return tasks;

    return [...tasks].sort((a, b) => compareByDueDate(a, b, sortOrder));
}

function compareByDueDate(a, b, sortOrder) {
    const aHasDueDate = Boolean(a.dueDate);
    const bHasDueDate = Boolean(b.dueDate);

    if (!aHasDueDate && !bHasDueDate) return 0;
    if (!aHasDueDate) return 1;
    if (!bHasDueDate) return -1;

    const aTime = new Date(a.dueDate).getTime();
    const bTime = new Date(b.dueDate).getTime();
    if (aTime === bTime) return 0;

    return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
}

export function getAvailableTags(tasks) {
    const tagSet = new Set();
    tasks.forEach(task => {
        (task.tags || []).forEach(tag => {
            if (tag) tagSet.add(tag.toLowerCase());
        });
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}
