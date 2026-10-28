import { useMemo } from 'react';
import { applyFilters, applySort, hasActiveFilters } from '../lib/filters.js';
import { useMoveTask } from '../hooks/queries.js';
import { Column } from './Column.jsx';

export function Board({ meta, tasks, filters, onEditTask, onOpenLogs }) {
    const move = useMoveTask();

    const { visible, totals } = useMemo(() => {
        const known = new Set(meta.statuses.map(s => s.key));
        const fallback = meta.statuses[0].key;
        // tasks with an unknown status land in the first column
        const normalized = tasks.map(t => (known.has(t.status) ? t : { ...t, status: fallback }));

        const totals = Object.groupBy(normalized, t => t.status);
        const visible = Object.groupBy(applySort(applyFilters(normalized, filters), filters), t => t.status);
        return { visible, totals };
    }, [tasks, meta, filters]);

    const filtering = hasActiveFilters(filters);

    return (
        <main>
            <div className="kanban-board">
                {meta.statuses.map(status => (
                    <Column
                        key={status.key}
                        status={status}
                        tasks={visible[status.key] ?? []}
                        total={totals[status.key]?.length ?? 0}
                        filtering={filtering}
                        meta={meta}
                        onDropTask={(id) => {
                            const task = tasks.find(t => String(t.id) === id);
                            if (task && task.status !== status.key) move.mutate({ task, status: status.key });
                        }}
                        onEdit={onEditTask}
                        onLogs={onOpenLogs}
                    />
                ))}
            </div>
        </main>
    );
}
