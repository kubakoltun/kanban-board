import { useCallback, useState } from 'react';
import { useMeta, useTasks } from './hooks/queries.js';
import { useFilters } from './hooks/useFilters.js';
import { Header } from './components/Header.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { Board } from './components/Board.jsx';
import { TaskModal } from './components/TaskModal.jsx';
import { HistoryModal } from './components/HistoryModal.jsx';
import { AnalyticsModal } from './components/AnalyticsModal.jsx';
import { TimeLogsModal } from './components/TimeLogsModal.jsx';

const MODALS = { task: TaskModal, history: HistoryModal, analytics: AnalyticsModal, logs: TimeLogsModal };

export default function App() {
    const meta = useMeta();
    const tasks = useTasks();
    const { values, setValue } = useFilters();
    const [modal, setModal] = useState(null); // { kind, ...props for that modal }

    const openModal = (kind, props) => setModal({ kind, ...props });
    const closeModal = useCallback(() => setModal(null), []);

    if (meta.isPending || tasks.isPending) return <p className="loading">Loading…</p>;
    if (meta.isError || tasks.isError) return <p className="error">Failed to load the board.</p>;

    const ActiveModal = modal && MODALS[modal.kind];

    return (
        <>
            <Header onOpen={openModal} />
            <FilterBar meta={meta.data} values={values} onChange={setValue} />
            <Board
                meta={meta.data}
                tasks={tasks.data}
                filters={values}
                onEditTask={(task) => openModal('task', { task })}
                onOpenLogs={(task) => openModal('logs', { taskId: task.id })}
            />
            {ActiveModal && <ActiveModal {...modal} meta={meta.data} onClose={closeModal} />}
        </>
    );
}
