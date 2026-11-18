import { useRef } from 'react';
import { Icon } from './Icon.jsx';
import { useImportBoard } from '../hooks/queries.js';
import { exportBoard, readBoardFile } from '../lib/board-io.js';

export function Header({ onOpen }) {
    const fileRef = useRef(null);
    const importBoard = useImportBoard();

    const onFile = async (e) => {
        const file = e.target.files[0];
        e.target.value = '';
        if (!file) return;

        const isCsv = file.name.toLowerCase().endsWith('.csv');
        const message = isCsv
            ? 'Tasks from this CSV will be added to the board. Continue?'
            : 'Importing replaces every task and history entry on the board. Continue?';
        if (!window.confirm(message)) return;

        try {
            await importBoard.mutateAsync(await readBoardFile(file));
            alert('Board imported successfully!');
        } catch (err) {
            alert(`Failed to import board: ${err.message}`);
        }
    };

    return (
        <header>
            <h1>Kanban</h1>
            <div className="header-actions">
                <button id="history-btn" className="btn-secondary" onClick={() => onOpen('history')}>
                    <Icon name="history" /> History
                </button>
                <button id="analytics-btn" className="btn-secondary" onClick={() => onOpen('analytics')}>
                    <Icon name="analytics" /> Analytics
                </button>
                <button id="export-btn" className="btn-secondary" title="Export Board"
                    onClick={() => exportBoard().catch(err => alert(`Export failed: ${err.message}`))}
                >
                    <Icon name="export" /> Export
                </button>
                <button id="import-btn-trigger" className="btn-secondary" title="Import Board"
                    disabled={importBoard.isPending} onClick={() => fileRef.current.click()}
                >
                    <Icon name="import" /> Import
                </button>
                <input ref={fileRef} type="file" accept=".json,.csv" hidden onChange={onFile} />
                <button id="add-task-btn" onClick={() => onOpen('task')}>
                    <Icon name="plus" /> New Task
                </button>
            </div>
        </header>
    );
}
