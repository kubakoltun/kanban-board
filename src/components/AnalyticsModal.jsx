import { Modal } from './Modal.jsx';
import { Icon } from './Icon.jsx';
import { useTasks } from '../hooks/queries.js';
import { formatTime, dayKey, weekStart } from '../lib/format.js';

function countBy(tasks, keyFn) {
    const counts = {};
    for (const t of tasks) {
        const date = new Date(t.completedAt ?? t.createdAt); // older done tasks have no completedAt
        if (Number.isNaN(date.getTime())) continue;
        const key = keyFn(date);
        counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts).sort(([a], [b]) => b.localeCompare(a));
}

function CountSection({ title, entries }) {
    return (
        <section className="analytics-section">
            <h3>{title}</h3>
            <div className="analytics-list">
                {entries.length === 0
                    ? <p className="analytics-empty">No completed tasks yet</p>
                    : entries.map(([period, count]) => (
                        <div key={period} className="analytics-row">
                            <span className="analytics-label">{period}</span>
                            <span className="analytics-value">{count}</span>
                        </div>
                    ))}
            </div>
        </section>
    );
}

export function AnalyticsModal({ meta, onClose }) {
    const { data: tasks = [] } = useTasks();
    const now = Date.now();

    const total = tasks.reduce(
        (sum, t) => sum + (t.totalTime || 0) + (t.isTracking && t.lastStartTime ? now - t.lastStartTime : 0), 0);

    const timeByStatus = Object.fromEntries(meta.statuses.map(s => [s.key, 0]));
    tasks.forEach(t => {
        const key = t.status in timeByStatus ? t.status : meta.statuses[0].key;
        timeByStatus[key] += t.totalTime || 0;
    });

    const done = tasks.filter(t => t.status === 'done');

    return (
        <Modal onClose={onClose}>
            <div className="modal-header">
                <h2>Analytics</h2>
                <button className="btn-secondary" style={{ border: 'none', padding: '0.5rem' }} aria-label="Close" onClick={onClose}>
                    <Icon name="close" />
                </button>
            </div>

            <section className="analytics-section analytics-highlight">
                <h3>Total time tracked</h3>
                <p className="analytics-total-time">{formatTime(total)}</p>
            </section>

            <section className="analytics-section">
                <h3>Time by status</h3>
                <div className="analytics-grid">
                    {meta.statuses.map(s => (
                        <div key={s.key} className="analytics-card">
                            <span className="analytics-card-title">{s.label}</span>
                            <span className="analytics-card-time">{formatTime(timeByStatus[s.key])}</span>
                        </div>
                    ))}
                </div>
            </section>

            <CountSection title="Tasks completed per day" entries={countBy(done, dayKey)} />
            <CountSection title="Tasks completed per week" entries={countBy(done, d => dayKey(weekStart(d)))} />
        </Modal>
    );
}
