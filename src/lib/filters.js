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
// Adding a filter means adding an object here and nothing else.
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
        key: 'sort', label: 'Sort by due date', defaultLabel: 'Default order', initial: 'none',
        options: () => [
            { value: 'asc', label: 'Due date ascending' },
            { value: 'desc', label: 'Due date descending' }
        ],
        sort: (a, b, dir) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            const diff = parseDate(a.dueDate) - parseDate(b.dueDate);
            return dir === 'desc' ? -diff : diff;
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
    const v = values[f.key];
    return isActive(f, v) ? [...tasks].sort((a, b) => f.sort(a, b, v)) : tasks;
}
