import { api } from '../api/client.js';

export async function exportBoard() {
    // fetch fresh so the backup never depends on what happens to be cached
    const [tasks, history] = await Promise.all([api.tasks(), api.history()]);
    const data = { tasks, history, exportDate: new Date().toISOString(), version: '1.0' };

    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `kanban-backup-${new Date().toISOString().slice(0, 10)}.json`
    });
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export async function readBoardFile(file) {
    let data;
    try {
        data = JSON.parse(await file.text());
    } catch {
        throw new Error('the file is not valid JSON');
    }
    return {
        tasks: Array.isArray(data?.tasks) ? data.tasks : [],
        history: Array.isArray(data?.history) ? data.history : []
    };
}
