export function formatTime(ms) {
    const total = Math.floor((Number.isFinite(ms) ? ms : 0) / 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
}

const UNITS = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatTimeAgo(date) {
    const seconds = Math.round((date - Date.now()) / 1000); // negative = past
    for (const [unit, size] of UNITS) {
        if (Math.abs(seconds) >= size) return rtf.format(Math.trunc(seconds / size), unit);
    }
    return rtf.format(seconds, 'second');
}

export const dayKey = (date) => date.toLocaleDateString('sv-SE'); // local YYYY-MM-DD

export function weekStart(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
    d.setHours(0, 0, 0, 0);
    return d;
}

export function dayLabel(date) {
    const key = dayKey(date);
    const t = new Date();
    if (key === dayKey(t)) return 'Today';
    t.setDate(t.getDate() - 1);
    if (key === dayKey(t)) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}