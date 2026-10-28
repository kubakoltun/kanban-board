// Activity Log modal rendering
import { state } from '../modules/state.js';
import { formatTimeAgo } from '../modules/history.js';
import { historyElements } from './dom.js';
import { escapeHtml, formatStatus } from '../lib/format.js';

const ACTION_META = {
    created: {
        cssClass: 'action-created',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>'
    },
    moved: {
        cssClass: 'action-moved',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>'
    },
    deleted: {
        cssClass: 'action-deleted',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a.5.5 0 0 1-1-0V3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0-1h3A.5.5 0 0 1 11 2.5v.5h4a.5.5 0 0 1 .5.5z"/></svg>'
    },
    timer: {
        cssClass: 'action-timer',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>'
    },
    default: {
        cssClass: 'action-cleared',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg>'
    }
};

export function openHistoryModal() {
    historyElements.modal.classList.add('active');
    renderHistory();
}

export function closeHistoryModal() {
    historyElements.modal.classList.remove('active');
}

export function renderHistory() {
    historyElements.list.innerHTML = '';

    if (state.history.length === 0) {
        historyElements.list.innerHTML = '<p style="text-align:center;color:#888;">No activity yet</p>';
        return;
    }

    state.history.forEach(entry => {
        historyElements.list.appendChild(buildHistoryItem(entry));
    });
}

function buildHistoryItem(entry) {
    const meta = ACTION_META[entry.action] || ACTION_META.default;

    const item = document.createElement('div');
    item.classList.add('history-item', meta.cssClass);
    item.innerHTML = `
        <div class="history-icon-wrapper">${meta.icon}</div>
        <div class="history-content">
            <div class="history-header">
                <span class="history-action-label">${entry.action}</span>
                <span class="history-time" title="${new Date(entry.timestamp).toLocaleString()}">${formatTimeAgo(new Date(entry.timestamp))}</span>
            </div>
            <div class="history-text">${buildHistoryEntryText(entry)}</div>
        </div>
    `;
    return item;
}

function buildHistoryEntryText(entry) {
    if (entry.action !== 'moved' || !entry.metadata) {
        return escapeHtml(entry.description);
    }

    const fromBadge = `<span class="status-badge status-${entry.metadata.from}">${formatStatus(entry.metadata.from)}</span>`;
    const toBadge = `<span class="status-badge status-${entry.metadata.to}">${formatStatus(entry.metadata.to)}</span>`;
    const arrowIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style="margin: 0 4px; vertical-align: middle; color: var(--text-secondary);"><path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/></svg>`;

    return `Moved "<strong>${escapeHtml(entry.metadata.task)}</strong>" from ${fromBadge} ${arrowIcon} ${toBadge}`;
}
