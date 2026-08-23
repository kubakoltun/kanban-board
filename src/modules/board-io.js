// Board Export / Import (JSON backup file), going through the API for import
import { state } from './state.js';
import { importBoardApi } from './api.js';

export function exportBoardData() {
    const data = {
        tasks: state.tasks,
        history: state.history,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function importBoardData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        const result = await importBoardApi({
            tasks: Array.isArray(data.tasks) ? data.tasks : [],
            history: Array.isArray(data.history) ? data.history : []
        });

        state.tasks = result.tasks;
        state.history = result.history;
        return true;
    } catch (e) {
        console.error('Import failed:', e);
        return false;
    }
}
