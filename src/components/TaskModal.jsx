import { useState } from 'react';
import { Modal } from './Modal.jsx';
import { TagsInput } from './TagsInput.jsx';
import { UserSelect } from './UserSelect.jsx';
import { useSaveTask } from '../hooks/queries.js';
import { normalizeTaskSubtasks } from '../lib/task-model.js';

// New subtasks have no id until the server assigns one, so the list needs its own React key.
let tempKey = 0;
const withKey = (s) => ({ ...s, key: s.id ?? `new-${tempKey++}` });

function toFormState(task) {
    return {
        title: task?.title ?? '',
        content: task?.content ?? '',
        url: task?.url ?? '',
        priority: task?.priority || 'medium',
        dueDate: task?.dueDate?.slice(0, 10) ?? '',
        assignedUserId: String(task?.assignedUserId ?? ''),
        tags: task?.tags ?? [],
        subtasks: (task?.subtasks ?? []).map(withKey)
    };
}

const Field = ({ label, htmlFor, className = '', children }) => (
    <div className={`form-group ${className}`}>
        <label htmlFor={htmlFor}>{label}</label>
        {children}
    </div>
);

export function TaskModal({ task = null, meta, onClose }) {
    const save = useSaveTask();
    const [form, setForm] = useState(() => toFormState(task));
    const [subtaskDraft, setSubtaskDraft] = useState('');

    const set = (key) => (value) => setForm(f => ({ ...f, [key]: value }));
    const bind = (key) => ({ value: form[key], onChange: (e) => set(key)(e.target.value) });

    const addSubtask = () => {
        const text = subtaskDraft.trim();
        if (!text) return;
        set('subtasks')([...form.subtasks, withKey({ text, done: false })]);
        setSubtaskDraft('');
    };
    const patchSubtask = (key, patch) =>
        set('subtasks')(form.subtasks.map(s => (s.key === key ? { ...s, ...patch } : s)));
    const removeSubtask = (key) => set('subtasks')(form.subtasks.filter(s => s.key !== key));

    const submit = (e) => {
        e.preventDefault();
        const title = form.title.trim();
        const content = form.content.trim();
        if (!title || !content) return;

        save.mutate({
            id: task?.id,
            fields: {
                title,
                content,
                url: form.url.trim(),
                priority: form.priority,
                dueDate: form.dueDate || null,
                assignedUserId: form.assignedUserId ? Number(form.assignedUserId) : null,
                tags: form.tags,
                subtasks: normalizeTaskSubtasks(form.subtasks)
            }
        }, { onSuccess: onClose });
    };

    return (
        <Modal id="task-modal" onClose={onClose} className="task-modal-content">
            <div className="task-modal-header">
                <h2 id="modal-title">{task ? 'Edit Task' : 'Add New Task'}</h2>
            </div>
            <form id="task-form" onSubmit={submit}>
                <input type="hidden" id="task-id" value={task?.id ?? ''} readOnly />
                <div className="task-form-body">
                    <Field label="Title" htmlFor="task-title">
                        <input id="task-title" type="text" placeholder="Task title" maxLength={300} required autoFocus {...bind('title')} />
                    </Field>

                    {task && (
                        <Field label="Task ID" htmlFor="task-id-input">
                            <div className="task-id-input-row">
                                <input id="task-id-input" name="task-id-input" type="text" readOnly
                                    aria-label="Task ID" value={task.id} onFocus={e => e.target.select()} />
                            </div>
                        </Field>
                    )}

                    <Field label="Task Description" htmlFor="task-desc">
                        <textarea id="task-desc" placeholder="What needs to be done?" required {...bind('content')} />
                    </Field>

                    <Field label="User" htmlFor="task-assigned-user">
                        <UserSelect id="task-assigned-user" value={form.assignedUserId} onChange={set('assignedUserId')} />
                    </Field>

                    <Field label="Related URL" htmlFor="task-url">
                        <input id="task-url" type="url" placeholder="https://example.com" {...bind('url')} />
                    </Field>

                    <div className="form-row">
                        <Field label="Priority" htmlFor="task-priority">
                            <select id="task-priority" {...bind('priority')}>
                                {meta.priorities.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Due Date" htmlFor="task-due-date">
                            <input id="task-due-date" type="date" {...bind('dueDate')} />
                        </Field>
                    </div>

                    <Field label="Tags" htmlFor="task-tags-input">
                        <TagsInput id="task-tags-input" value={form.tags} onChange={set('tags')} />
                    </Field>

                    <Field label="Subtasks" htmlFor="subtask-input" className="subtask-form-group">
                        <div className="subtask-input-row">
                            <input
                                id="subtask-input" type="text" placeholder="Add subtask and press Enter"
                                value={subtaskDraft} onChange={e => setSubtaskDraft(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                            />
                            <button type="button" id="add-subtask-btn" className="btn-secondary" onClick={addSubtask}>Add</button>
                        </div>
                        <ul id="task-subtasks" className="subtask-list" aria-label="Task subtasks">
                            {form.subtasks.length === 0 && <li className="subtask-empty">No subtasks yet.</li>}
                            {form.subtasks.map(s => (
                                <li key={s.key} className="subtask-item">
                                    <label>
                                        <input type="checkbox" className="modal-subtask-toggle" checked={s.done}
                                               onChange={e => patchSubtask(s.key, { done: e.target.checked })} />
                                        <span className={`subtask-text ${s.done ? 'is-done' : ''}`}>{s.text}</span>
                                    </label>
                                    <button type="button" className="modal-subtask-remove" aria-label="Remove subtask"
                                            onClick={() => removeSubtask(s.key)}>Close</button>
                                </li>
                            ))}
                        </ul>
                    </Field>
                </div>

                {save.isError && <p className="error">Couldn't save: {save.error.message}</p>}
                <div className="modal-actions">
                    <button type="button" id="cancel-modal" className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={save.isPending}>Save Task</button>
                </div>
            </form>
        </Modal>
    );
}
