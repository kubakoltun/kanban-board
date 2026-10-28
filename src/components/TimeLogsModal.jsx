import { useState } from 'react';
import { Modal } from './Modal.jsx';
import { Icon } from './Icon.jsx';
import { useTasks } from '../hooks/queries.js';
import { useNow } from '../hooks/useNow.js';
import { formatTime, dayKey, dayLabel } from '../lib/format.js';

const hm = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

// newest log first; each finished log is paired with its memo, the running one with the draft
function pairLogsWithMemos(task) {
    const memos = [...(task.memoSessions ?? [])].reverse();
    return [...(task.timeLogs ?? [])].reverse().map(log => ({
        ...log,
        running: !log.end,
        note: ((log.end ? memos.shift() : task.activeMemoSession)?.note ?? '').trim()
    }));
}

function LogEntry({ log }) {
    const [open, setOpen] = useState(false);
    const start = new Date(log.start);
    const expandable = log.note.includes('\n');
    const firstLine = log.note.split(/\r?\n/)[0];

    return (
        <article className="log-entry">
            <div className="log-entry-top">
                <div className="log-left-rail">
                    <span className="log-date">{start.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <span className="log-time-range">{hm(start)} → {log.end ? hm(new Date(log.end)) : 'Running...'}</span>
                </div>
                <div className="log-duration-badge">
                    <Icon name="clock" size={14} />
                    <span>{log.end ? formatTime(log.end - log.start) : 'Running'}</span>
                </div>
            </div>
            <div className="log-main">
                <div className="log-entry-header">Memo</div>
                <p className={`log-entry-note-preview ${log.note ? '' : 'is-empty'}`}>
                    {firstLine || 'No memo written for this session.'}
                </p>
                {expandable && (
                    <>
                        <button className="log-entry-expand" aria-expanded={open} onClick={() => setOpen(o => !o)}>
                            {open ? 'Hide full note' : 'Show full note'}
                        </button>
                        {open && <p className="log-entry-note-full">{log.note}</p>}
                    </>
                )}
            </div>
            <div className="log-entry-footer">
                <span className={`log-status-chip ${log.running ? 'is-running' : 'is-complete'}`}>
                    <span className={`log-status-dot ${log.running ? 'is-running' : 'is-complete'}`} />
                    {log.running ? 'Running session' : 'Completed session'}
                </span>
            </div>
        </article>
    );
}

export function TimeLogsModal({ taskId, onClose }) {
    const { data: tasks = [] } = useTasks();
    const task = tasks.find(t => t.id === taskId); // live copy, so the modal updates while a timer runs
    const now = useNow(Boolean(task?.isTracking));
    if (!task) return null;

    const total = (task.totalTime || 0) + (task.isTracking && task.lastStartTime ? now - task.lastStartTime : 0);
    const entries = pairLogsWithMemos(task);
    const groups = Object.entries(Object.groupBy(entries, e => dayKey(new Date(e.start))));

    const memoHistory = [
        ...(task.activeMemoSession ? [{ ...task.activeMemoSession, draft: true }] : []),
        ...[...(task.memoSessions ?? [])].reverse()
    ];

    return (
        <Modal onClose={onClose}>
            <div className="modal-header">
                <h2>Time Logs</h2>
                <button className="btn-secondary" style={{ border: 'none', padding: '0.5rem' }} aria-label="Close" onClick={onClose}>
                    <Icon name="close" />
                </button>
            </div>

            <div className="simple-total-header">Total Duration <span className="simple-time">{formatTime(total)}</span></div>

            <div>
                {entries.length === 0 && (
                    <div className="time-logs-empty time-logs-empty--none">
                        <p>{task.isTracking ? 'A session is currently running.' : 'No sessions recorded yet. Start a timer to begin logging time.'}</p>
                    </div>
                )}
                {groups.map(([key, list]) => {
                    const label = dayLabel(new Date(list[0].start));
                    return (
                        <section key={key} className="log-day-group">
                            {label !== 'Today' && <div className="log-day-group-title">{label}</div>}
                            {list.map(log => <LogEntry key={log.start} log={log} />)}
                        </section>
                    );
                })}
            </div>

            <div>
                {memoHistory.length === 0 && <p>No memo sessions yet</p>}
                {memoHistory.map((s, i) => (
                    <div key={s.startedAt ?? i} className={`memo-history-entry ${s.draft ? 'is-draft' : ''}`}>
                        <div className="memo-history-meta">
                            <span className="memo-history-time">
                                {s.startedAt ? new Date(s.startedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown time'}
                            </span>
                            <span className="memo-history-duration">{Number.isFinite(s.duration) ? formatTime(s.duration) : 'Running...'}</span>
                        </div>
                        <p className="memo-history-note">{(s.note || '').trim() || 'No summary added.'}</p>
                    </div>
                ))}
            </div>
        </Modal>
    );
}
