// Analytics modal rendering
import { state } from '../modules/state.js';
import { formatTime } from '../modules/timer.js';
import { analyticsElements } from './dom.js';
import { getWeekStart } from './format.js';

const STATUS_LABELS = {
    todo: 'To Do',
    progress: 'In Progress',
    'ready-for-review': 'Ready For Review',
    done: 'Done'
};

export function openAnalyticsModal() {
    analyticsElements.modal.classList.add('active');
    renderAnalytics();
}

export function closeAnalyticsModal() {
    analyticsElements.modal.classList.remove('active');
}

export function renderAnalytics() {
    if (!analyticsElements.content) return;

    const totalTracked = calculateTotalTrackedTime();
    const timeByStatus = calculateTimeByStatus();
    const doneTasks = state.tasks.filter(task => task.status === 'done');
    const dayEntries = sortedEntries(groupCompletedBy(doneTasks, getDayKey));
    const weekEntries = sortedEntries(groupCompletedBy(doneTasks, getWeekKey));

    analyticsElements.content.innerHTML = `
        <section class="analytics-section analytics-highlight">
            <h3>Total time tracked</h3>
            <p class="analytics-total-time">${formatTime(totalTracked)}</p>
        </section>
        <section class="analytics-section">
            <h3>Time by status</h3>
            <div class="analytics-grid">
                ${Object.keys(STATUS_LABELS).map(status => `
                    <div class="analytics-card">
                        <span class="analytics-card-title">${STATUS_LABELS[status]}</span>
                        <span class="analytics-card-time">${formatTime(timeByStatus[status] || 0)}</span>
                    </div>
                `).join('')}
            </div>
        </section>
        <section class="analytics-section">
            <h3>Tasks completed per day</h3>
            <div class="analytics-list">${renderCountList(dayEntries, 'No completed tasks yet')}</div>
        </section>
        <section class="analytics-section">
            <h3>Tasks completed per week</h3>
            <div class="analytics-list">${renderCountList(weekEntries, 'No completed tasks yet')}</div>
        </section>
    `;
}

function calculateTotalTrackedTime() {
    const now = Date.now();
    return state.tasks.reduce((sum, task) => {
        const activeSession = task.isTracking && task.lastStartTime ? now - task.lastStartTime : 0;
        return sum + (task.totalTime || 0) + activeSession;
    }, 0);
}

function calculateTimeByStatus() {
    return state.tasks.reduce((acc, task) => {
        const statusKey = task.status || 'todo';
        acc[statusKey] = (acc[statusKey] || 0) + (task.totalTime || 0);
        return acc;
    }, { todo: 0, progress: 0, 'ready-for-review': 0, done: 0 });
}

function getDayKey(date) {
    return date.toISOString().slice(0, 10);
}

function getWeekKey(date) {
    return getWeekStart(date).toISOString().slice(0, 10);
}

function groupCompletedBy(tasks, keyFn) {
    return tasks.reduce((acc, task) => {
        const createdDate = new Date(task.createdAt);
        if (Number.isNaN(createdDate.getTime())) return acc;

        const key = keyFn(createdDate);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
}

function sortedEntries(counts) {
    return Object.entries(counts).sort(([a], [b]) => b.localeCompare(a));
}

function renderCountList(entries, emptyText) {
    if (entries.length === 0) return `<p class="analytics-empty">${emptyText}</p>`;

    return entries.map(([period, count]) => `
        <div class="analytics-row">
            <span class="analytics-label">${period}</span>
            <span class="analytics-value">${count}</span>
        </div>
    `).join('');
}
