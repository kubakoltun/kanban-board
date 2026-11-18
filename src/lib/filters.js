const ALL = 'all';
const toOption = ({ key, label }) => ({ value: key, label });

const parseDate = (s) => { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };

const DUE_OPTIONS = [
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Due today' },
    { value: 'next-7', label: 'Next 7 days' },
    { value: 'no-date', label: 'No due date' }
];

// Rank per priority key. Missing priority counts as 'medium', same as the priority filter.
const PRIORITY_RANK = { low: 0, medium: 1, high: 2 };
const rankOf = (t) => PRIORITY_RANK[t.priority || 'medium'] ?? PRIORITY_RANK.medium;

function matchesDue(task, v) {
    if (v === 'no-date') return !task.dueDate;
    if (!task.dueDate) return false;
    const due = parseDate(task.dueDate), t0 = today();
    if (v === 'overdue') return due < t0;
    if (v === 'today') return due.getTime() === t0.getTime();
    if (v === 'next-7') { const end = new Date(t0); end.setDate(end.getDate() + 7); return due >= t0 && due <= end; }
    return true;
}

// One entry = one toolbar control + its matching logic.
// Adding a filter means adding an object here
export const FILTERS = [
    {
        key: 'search', type: 'text', label: 'Search', placeholder: 'Search tasks or tags...', initial: '',
        match: (t, v) => {
            const q = v.trim().toLowerCase();
            return !q || [t.title, t.content, ...(t.tags ?? [])].some(s => s?.toLowerCase().includes(q));
        }
    },
    {
        key: 'priority', label: 'Priority', defaultLabel: 'All priorities',
        options: m => m.priorities.map(toOption),
        match: (t, v) => (t.priority || 'medium') === v
    },
    {
        key: 'user', label: 'User', defaultLabel: 'All users',
        options: m => [
            { value: 'unassigned', label: 'Unassigned' },
            ...m.users.map(u => ({ value: String(u.id), label: `${u.name} ${u.surname}`.trim() }))
        ],
        match: (t, v) => v === 'unassigned' ? t.assignedUserId == null : String(t.assignedUserId) === v
    },
    {
        key: 'tag', label: 'Tags', defaultLabel: 'All tags',
        options: m => m.tags.map(tag => ({ value: tag, label: `#${tag}` })),
        match: (t, v) => (t.tags ?? []).some(tag => tag.toLowerCase() === v)
    },
    {
        key: 'status', label: 'Status', defaultLabel: 'All statuses',
        options: m => m.statuses.map(toOption),
        match: (t, v) => t.status === v
    },
    {
        key: 'dueDate', label: 'Due date', defaultLabel: 'All due dates',
        options: () => DUE_OPTIONS,
        match: matchesDue
    },
    {
        key: 'sort', label: 'Sort by priority', defaultLabel: 'Default order', initial: 'none',
        options: () => [
            { value: 'desc', label: 'Highest priority first' },
            { value: 'asc', label: 'Lowest priority first' }
        ],
        sort: (a, b, dir) => {
            const diff = rankOf(a) - rankOf(b);
            if (diff) return dir === 'desc' ? -diff : diff;

            // same priority: soonest due date first, undated last, then oldest first
            if (a.dueDate && b.dueDate) {
                const d = parseDate(a.dueDate) - parseDate(b.dueDate);
                if (d) return d;
            } else if (a.dueDate || b.dueDate) {
                return a.dueDate ? -1 : 1;
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
    }
];

export const INITIAL_FILTERS = Object.fromEntries(FILTERS.map(f => [f.key, f.initial ?? ALL]));
export const isActive = (f, v) => v !== (f.initial ?? ALL);
export const hasActiveFilters = (values) => FILTERS.some(f => f.match && isActive(f, values[f.key]));

export function applyFilters(tasks, values) {
    return tasks.filter(t =>
        FILTERS.every(f => !f.match || !isActive(f, values[f.key]) || f.match(t, values[f.key]))
    );
}

export function applySort(tasks, values) {
    const f = FILTERS.find(f => f.sort);
    const dir = values[f.key];
    if (dir !== 'asc' && dir !== 'desc') return tasks;
    return [...tasks].sort((a, b) => f.sort(a, b, dir));
}
