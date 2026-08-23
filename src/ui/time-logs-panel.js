// Time Logs modal rendering (per-task session history + memo history)
import { state } from '../modules/state.js';
import { findTask } from '../modules/tasks.js';
import { formatTime } from '../modules/timer.js';
import { timeLogsElements } from './dom.js';
import { escapeHtml, getDayGroupLabel } from './format.js';

export function openTimeLogs(taskId) {
    const task = findTask(taskId);
    if (!task) return;

    state.viewedTaskId = taskId;
    timeLogsElements.modal.classList.add('active');
    renderTimeLogs(task);
}

export function closeTimeLogsModal() {
    state.viewedTaskId = null;
    timeLogsElements.modal.classList.remove('active');
}

export function renderTimeLogs(task) {
    timeLogsElements.list.innerHTML = '';
    if (timeLogsElements.memoHistoryList) timeLogsElements.memoHistoryList.innerHTML = '';

    renderTotalDuration(task);
    renderSessionEntries(task);
    renderMemoHistory(task);
}

function renderTotalDuration(task) {
    let currentTotal = task.totalTime || 0;
    if (task.isTracking && task.lastStartTime) {
        currentTotal += Date.now() - task.lastStartTime;
    }

    timeLogsElements.totalDurationContainer.innerHTML = `
        <div class="simple-total-header">
            Total Duration <span class="simple-time">${formatTime(currentTotal)}</span>
        </div>
    `;
}

function getSessionEntriesForLogs(task) {
    const logs = task.timeLogs || [];
    const memoQueue = [...(task.memoSessions || [])].reverse();

    return [...logs].reverse().map(log => {
        const memoMatch = log.end ? memoQueue.shift() : task.activeMemoSession || null;
        return { ...log, note: memoMatch?.note || '', isRunning: !log.end };
    });
}

function createTimeLogsEmptyState(variant, message) {
    const empty = document.createElement('div');
    empty.className = `time-logs-empty time-logs-empty--${variant}`;
    empty.innerHTML = `<p>${message}</p>`;
    return empty;
}

function renderSessionEntries(task) {
    const entries = getSessionEntriesForLogs(task);

    if (entries.length === 0) {
        const emptyState = task.isTracking
            ? createTimeLogsEmptyState('active', 'A session is currently running. Add your memo while you work.')
            : createTimeLogsEmptyState('none', 'No sessions recorded yet. Start a timer to begin logging time.');
        timeLogsElements.list.appendChild(emptyState);
        return;
    }

    const hasMemoText = entries.some(entry => Boolean(entry.note?.trim()));
    if (!hasMemoText) {
        timeLogsElements.list.appendChild(
            createTimeLogsEmptyState('nomemo', 'Sessions found, but no memo notes were added yet.')
        );
    }

    const groupsByDay = groupEntriesByDay(entries);
    Object.entries(groupsByDay).forEach(([dayKey, dayEntries]) => {
        timeLogsElements.list.appendChild(buildDayGroup(task, dayKey, dayEntries));
    });

    wireLogEntryExpanders();
}

function groupEntriesByDay(entries) {
    return entries.reduce((groups, entry) => {
        const dayKey = new Date(entry.start).toDateString();
        if (!groups[dayKey]) groups[dayKey] = [];
        groups[dayKey].push(entry);
        return groups;
    }, {});
}

function buildDayGroup(task, dayKey, dayEntries) {
    const dayGroup = document.createElement('section');
    dayGroup.className = 'log-day-group';

    const dayLabel = getDayGroupLabel(new Date(dayKey));
    if (dayLabel !== 'Today') {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'log-day-group-title';
        dayHeader.textContent = dayLabel;
        dayGroup.appendChild(dayHeader);
    }

    dayEntries.forEach((log, index) => {
        dayGroup.appendChild(buildLogEntry(task, dayKey, log, index));
    });

    return dayGroup;
}

function buildLogEntry(task, dayKey, log, index) {
    const startDate = new Date(log.start);
    const endDate = log.end ? new Date(log.end) : null;
    const startTime = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const endTime = endDate ? endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Running...';
    const duration = log.end ? formatTime(log.end - log.start) : 'Running';

    const noteText = (log.note || '').trim();
    const firstLine = escapeHtml((noteText.split(/\r?\n/)[0] || '').trim());
    const hasExpandableMemo = Boolean(noteText && noteText.includes('\n'));
    const memoId = `log-note-${task.id}-${dayKey.replace(/\s+/g, '-')}-${index}`;

    const div = document.createElement('article');
    div.className = 'log-entry';
    div.innerHTML = `
        <div class="log-entry-top">
            <div class="log-left-rail">
                <span class="log-date">${startDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                <span class="log-time-range">${startTime} → ${endTime}</span>
            </div>
            <div class="log-duration-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                </svg>
                <span>${duration}</span>
            </div>
        </div>
        <div class="log-main">
            <div class="log-entry-header">Memo</div>
            <p class="log-entry-note-preview ${noteText ? '' : 'is-empty'}">${firstLine || 'No memo written for this session.'}</p>
            ${hasExpandableMemo
                ? `<button class="log-entry-expand" data-expand-target="${memoId}" aria-expanded="false">Show full note</button>
                   <p id="${memoId}" class="log-entry-note-full" hidden>${escapeHtml(noteText)}</p>`
                : ''}
        </div>
        <div class="log-entry-footer">
            <span class="log-status-chip ${log.isRunning ? 'is-running' : 'is-complete'}">
                <span class="log-status-dot ${log.isRunning ? 'is-running' : 'is-complete'}"></span>
                ${log.isRunning ? 'Running session' : 'Completed session'}
            </span>
        </div>
    `;
    return div;
}

function wireLogEntryExpanders() {
    timeLogsElements.list.querySelectorAll('.log-entry-expand').forEach(button => {
        button.addEventListener('click', () => toggleLogEntryExpander(button));
    });
}

function toggleLogEntryExpander(button) {
    const targetId = button.dataset.expandTarget;
    const fullNote = targetId && timeLogsElements.list.querySelector(`#${targetId}`);
    if (!fullNote) return;

    const isOpen = !fullNote.hasAttribute('hidden');
    if (isOpen) {
        fullNote.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = 'Show full note';
    } 
    else {
        fullNote.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
        button.textContent = 'Hide full note';
    }
}

function renderMemoHistory(task) {
    if (!timeLogsElements.memoHistoryList) return;

    const activeDraft = task.activeMemoSession
        ? [{
            ...task.activeMemoSession,
            duration: task.lastStartTime ? Date.now() - task.lastStartTime : null,
            endedAt: null,
            isDraft: true
        }]
        : [];
    const allEntries = [...activeDraft, ...(task.memoSessions || [])].reverse();

    if (allEntries.length === 0) {
        timeLogsElements.memoHistoryList.innerHTML = '<p>No memo sessions yet</p>';
        return;
    }

    allEntries.forEach(session => {
        timeLogsElements.memoHistoryList.appendChild(buildMemoHistoryEntry(session));
    });
}

function buildMemoHistoryEntry(session) {
    const entry = document.createElement('div');
    entry.className = `memo-history-entry ${session.isDraft ? 'is-draft' : ''}`;

    const startedAt = session.startedAt ? new Date(session.startedAt) : null;
    const periodLabel = startedAt && !Number.isNaN(startedAt.getTime())
        ? startedAt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
        : 'Unknown time';
    const durationLabel = Number.isFinite(session.duration) ? formatTime(session.duration) : 'Running...';
    const noteText = (session.note || '').trim() || 'No summary added.';

    entry.innerHTML = `
        <div class="memo-history-meta">
            <span class="memo-history-time">${periodLabel}</span>
            <span class="memo-history-duration">${durationLabel}</span>
        </div>
        <p class="memo-history-note">${escapeHtml(noteText)}</p>
    `;
    return entry;
}
