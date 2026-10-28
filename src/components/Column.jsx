import { useState } from 'react';
import { TaskCard } from './TaskCard.jsx';

export function Column({ status, tasks, total, filtering, meta, onDropTask, onEdit, onLogs }) {
    const [dragOver, setDragOver] = useState(false);

    return (
        <div
            className={`column ${dragOver ? 'drag-over' : ''}`}
            data-status={status.key}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false); }}
            onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                onDropTask(e.dataTransfer.getData('text/plain'));
            }}
        >
            <div className="column-header">
                <span>{status.label}</span>
                <span className="count">{filtering ? `${tasks.length}/${total}` : total}</span>
            </div>
            <div className="tasks-container">
                {tasks.length === 0
                    ? <div className="empty-state"><p>No tasks yet</p></div>
                    : tasks.map(task => <TaskCard key={task.id} task={task} meta={meta} onEdit={onEdit} onLogs={onLogs} />)}
            </div>
        </div>
    );
}
