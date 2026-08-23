// Activity History Module - persisted via the API, no local storage
import { state } from './state.js';
import { createHistoryEntryApi, clearHistoryApi } from './api.js';

export async function addToHistory(action, description, metadata = null) {
    const entry = await createHistoryEntryApi({ action, description, metadata });
    state.history.unshift(entry); // Add to beginning
}

export async function clearHistory() {
    await clearHistoryApi();
    state.history = [];
}

const TIME_UNITS = [
    { seconds: 31536000, label: 'years' },
    { seconds: 2592000, label: 'months' },
    { seconds: 86400, label: 'days' },
    { seconds: 3600, label: 'hours' },
    { seconds: 60, label: 'mins' }
];

export function formatTimeAgo(date) {
    const secondsElapsed = Math.floor((new Date() - date) / 1000);

    for (const unit of TIME_UNITS) {
        const interval = secondsElapsed / unit.seconds;
        if (interval > 1) {
            return `${Math.floor(interval)} ${unit.label} ago`;
        }
    }

    return `${Math.floor(secondsElapsed)} seconds ago`;
}
