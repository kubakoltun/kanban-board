// Activity History Module
import { state } from './state.js';
import { generateId } from './id.js';
import { saveHistory } from './storage.js';

export function addToHistory(action, description, metadata = null) {
    const entry = {
        id: generateId(),
        action,
        description,
        metadata,
        timestamp: new Date().toISOString()
    };
    state.history.unshift(entry); // Add to beginning
    saveHistory();
}

export function clearHistory() {
    state.history = [];
    saveHistory();
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
