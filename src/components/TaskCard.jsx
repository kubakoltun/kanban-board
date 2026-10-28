import { useEffect, useState } from 'react';
import { Icon } from './Icon.jsx';
import { useNow } from '../hooks/useNow.js';
import { formatTime } from '../lib/format.js';
import { sessionState } from '../lib/task-model.js';
import {
    useToggleTimer, useSaveMemo, useToggleSubtask, useRemoveSubtask, useAddSubtask, useDeleteTask
} from '../hooks/queries.js';

const MS_IN_DAY = 86_400_000;

function dueClass(task) {
    const due = task.dueDate ? new Date(task.dueDate).getTime() : NaN;
    if (!Number.isFinite(due)) return '';
    const diff = due - Date.now();
    return diff < 0 ? 'is-overdue' : diff <= MS_IN_DAY ? 'is-due-soon' : '';
}

function timerLabel(task) {
    if (task.status === 'done') return 'Timer complete';
    if (task.status === 'todo') return 'Not started';
    return task.isTracking ? 'Running' : 'Paused';
}

function TimerSection({ task }) {
    const now = useNow(task.isTracking);
    const running = task.isTracking && task.lastStartTime ? now - task.lastStartTime : 0;
    const chip = sessionState(task);
    const showChip = task.isTracking && task.status !== 'todo' && task.status !== 'done';

    return (
        <div className={`task-secondary-row task-timer ${task.isTracking ? 'is-running' : ''}`}>
            <div className="task-timer-header">
                <span className={`task-timer-state ${task.isTracking ? 'is-active' : ''}`}>
                    {task.isTracking && <span className="recording-dot" />}{timerLabel(task)}
                </span>
                {showChip && <span className={`session-state-chip session-state-chip--${chip.tone}`}>{chip.label}</span>}
            </div>
            <span className="timer-display">{formatTime((task.totalTime || 0) + running)}</span>
        </div>
    );
}

function MemoPanel({ task }) {
    const saveMemo = useSaveMemo();
    const serverNote = task.activeMemoSession?.note ?? '';
    const [draft, setDraft] = useState(serverNote);
    const dirty = draft !== serverNote;

    // debounced autosave
    useEffect(() => {
        if (!dirty) return;
        const id = setTimeout(() => saveMemo.mutate({ id: task.id, note: draft }), 400);
        return () => clearTimeout(id);
    }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

    const startedAt = task.activeMemoSession?.startedAt
        ? new Date(task.activeMemoSession.startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : 'now';
    const inputId = `memo-${task.id}`;

    return (
        <div className="active-memo-panel">
            <label htmlFor={inputId}>Session Memo</label>
            <p className="memo-guidance-text">1–2 sentence summary of what you finished and what is next.</p>
            <p className="memo-guidance-text">Session started at {startedAt}.</p>
            <textarea
                id={inputId} className="active-memo-input" value={draft}
                placeholder="Add a short summary while you work..."
                onChange={e => setDraft(e.target.value)}
                onBlur={() => dirty && saveMemo.mutate({ id: task.id, note: draft })}
            />
            <p className="memo-save-status" aria-live="polite">
                {saveMemo.isPending ? 'Saving…' : saveMemo.isSuccess ? 'Draft saved' : ''}
            </p>
        </div>
    );
}

function Subtasks({ task }) {
    const toggle = useToggleSubtask();
    const remove = useRemoveSubtask();
    const add = useAddSubtask();
    const [draft, setDraft] = useState('');
    const subtasks = task.subtasks ?? [];
    const done = subtasks.filter(s => s.done).length;
    const ratio = subtasks.length ? done / subtasks.length : 0;
    const tone = ratio >= 1 ? 'complete' : ratio >= 0.5 ? 'mid' : 'low';

    const submit = () => {
        const text = draft.trim();
        if (!text) return;
        add.mutate({ id: task.id, text });
        setDraft('');
    };

    return (
        <>
            {subtasks.length > 0 && (
                <>
                    <div className="task-progress">
                        <div className="task-progress-header">
                            <span className="task-progress-label">Subtasks</span>
                            <span className="task-progress-count">{done}/{subtasks.length}</span>
                        </div>
                        <div className="task-progress-bar" role="progressbar" aria-valuemin={0}
                             aria-valuemax={subtasks.length} aria-valuenow={done}>
                            <span className={`task-progress-fill task-progress-fill--${tone}`} style={{ width: `${ratio * 100}%` }} />
                        </div>
                    </div>
                    <ul className="subtask-preview-list">
                        {subtasks.slice(0, 3).map(s => (
                            <li key={s.id} className={`subtask-preview-item ${s.done ? 'is-done' : ''}`}>
                                <button className="subtask-toggle-btn" title="Toggle subtask"
                                        onClick={() => toggle.mutate({ id: task.id, subtaskId: s.id })}>{s.done ? '✓' : '○'}</button>
                                <span className="subtask-preview-text">{s.text}</span>
                                <button className="subtask-remove-btn" title="Remove subtask"
                                        onClick={() => remove.mutate({ id: task.id, subtaskId: s.id })}>×</button>
                            </li>
                        ))}
                        {subtasks.length > 3 && <li className="subtask-preview-more">+{subtasks.length - 3} more</li>}
                    </ul>
                </>
            )}
            <div className="subtask-quick-add">
                <input type="text" className="subtask-inline-input" placeholder="Add subtask..." aria-label="Add subtask"
                       value={draft} onChange={e => setDraft(e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }} />
                <button className="subtask-inline-add-btn" title="Add subtask" onClick={submit}>Add</button>
            </div>
        </>
    );
}

export function TaskCard({ task, meta, onEdit, onLogs }) {
    const [expanded, setExpanded] = useState(false);
    const timer = useToggleTimer();
    const del = useDeleteTask();
    const assignee = meta.users.find(u => u.id === task.assignedUserId);
    const canTime = task.status !== 'todo' && task.status !== 'done';
    const hasDetails = Boolean(task.url || task.dueDate || task.tags?.length || task.subtasks?.length || task.isTracking);

    return (
        <div
            className={`task-card ${expanded ? 'is-expanded' : ''} ${dueClass(task)}`}
            draggable
            data-priority={task.priority || 'medium'}
            onDragStart={e => { e.dataTransfer.setData('text/plain', String(task.id)); e.currentTarget.classList.add('dragging'); }}
            onDragEnd={e => e.currentTarget.classList.remove('dragging')}
            onDoubleClick={e => { if (!e.target.closest('button, input, textarea, a, .task-details')) onEdit(task); }}
        >
            <div className="task-id-row">
                <input 
                    className="task-id-input" 
                    value={task.id} readOnly aria-label="Task ID"
                    onClick={e => e.currentTarget.select()} 
                />
            </div>
            <div className="task-title-row"><div className="task-title">{task.title}</div></div>
            <p className="task-description">{task.content}</p>
            <div className="task-priority-row">
                {task.priority && <span className={`badge badge-${task.priority}`}>{task.priority}</span>}
                {assignee
                    ? <span className="badge badge-assignee">{assignee.name} {assignee.surname}</span>
                    : <span className="badge badge-unassigned">Unassigned</span>}
            </div>

            <TimerSection task={task} />

            <div className={`task-details ${hasDetails ? '' : 'is-empty'}`} hidden={!expanded}>
                {task.url && (
                    <a className="task-link" href={task.url} target="_blank" rel="noopener noreferrer">{task.url}</a>
                )}
                <div className="task-metadata-bar">
                    {!task.dueDate && !task.tags?.length && <span className="task-muted">No metadata added</span>}
                    {task.dueDate && <span className="badge badge-date">{new Date(task.dueDate).toLocaleDateString()}</span>}
                    {(task.tags ?? []).map(tag => <span key={tag} className="badge badge-tag">#{tag}</span>)}
                </div>
                <Subtasks task={task} />
                {task.isTracking
                    ? <MemoPanel key={task.activeMemoSession?.startedAt} task={task} />
                    : <div className="active-memo-panel"><span className="task-muted">Start a timer session to capture notes.</span></div>}
            </div>

            <div className="task-meta task-actions-row">
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                <div className="task-actions">
                    {canTime && (
                        <button className={`timer-btn ${task.isTracking ? 'pause-btn' : 'start-btn'}`}
                                title={task.isTracking ? 'Pause Timer' : 'Start Timer'} disabled={timer.isPending}
                                onClick={() => timer.mutate({ id: task.id, action: task.isTracking ? 'pause' : 'start' })}>
                            <Icon name={task.isTracking ? 'pause' : 'play'} size={14} />
                        </button>
                    )}
                    <button className="view-logs-btn" title="View Time Logs" onClick={() => onLogs(task)}>
                        <Icon name="clock" size={14} />
                    </button>
                    {task.status !== 'done' && (
                        <button className="edit-btn" aria-label="Edit" onClick={() => onEdit(task)}>
                            <Icon name="edit" size={14} />
                        </button>
                    )}
                    <button className="delete-btn" aria-label="Delete"
                            onClick={() => window.confirm('Delete task?') && del.mutate(task)}>
                        <Icon name="trash" size={14} />
                    </button>
                    <button className="details-toggle" aria-label="Toggle Details" title="Toggle Details"
                            aria-expanded={expanded} onClick={() => setExpanded(v => !v)}>Details</button>
                </div>
            </div>
        </div>
    );
}
