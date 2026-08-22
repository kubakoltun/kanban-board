// Small formatting / escaping helpers shared across UI modules
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function normalizeUrl(url) {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
}

export function formatUrlLabel(url) {
    const trimmed = url.trim();
    return trimmed.length > 48 ? `${trimmed.slice(0, 45)}...` : trimmed;
}

export function formatStatus(status) {
    const map = { todo: 'To Do', progress: 'In Progress', 'on-hold': 'On Hold', done: 'Done' };
    return map[status] || status;
}

export function getWeekStart(date) {
    const localDate = new Date(date);
    const day = localDate.getDay();
    const diff = (day + 6) % 7;
    localDate.setDate(localDate.getDate() - diff);
    localDate.setHours(0, 0, 0, 0);
    return localDate;
}

export function getDayGroupLabel(dateValue) {
    const dayDate = new Date(dateValue);
    dayDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (dayDate.getTime() === today.getTime()) return 'Today';
    if (dayDate.getTime() === yesterday.getTime()) return 'Yesterday';

    return dayDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// Copies text to the clipboard, with a fallback for browsers/contexts
// where the async Clipboard API is not available
export async function copyToClipboard(text) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}
