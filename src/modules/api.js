// Fetch-based API client - the only place in the frontend that talks to the backend.
// There is no localStorage anywhere anymore; the database is the source of truth.
const API_BASE = '/api';

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });

    if (!res.ok) {
        throw new Error(`API request failed: ${options.method || 'GET'} ${path} (${res.status})`);
    }

    if (res.status === 204) return null;
    return res.json();
}

// -- Tasks --
export function fetchTasks() {
    return request('/tasks');
}

export function createTaskApi(fields) {
    return request('/tasks', { method: 'POST', body: JSON.stringify(fields) });
}

export function updateTaskApi(id, fields) {
    return request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(fields) });
}

export function deleteTaskApi(id) {
    return request(`/tasks/${id}`, { method: 'DELETE' });
}

export function clearTasksApi() {
    return request('/tasks', { method: 'DELETE' });
}

// -- History --
export function fetchHistory() {
    return request('/history');
}

export function createHistoryEntryApi(entry) {
    return request('/history', { method: 'POST', body: JSON.stringify(entry) });
}

export function clearHistoryApi() {
    return request('/history', { method: 'DELETE' });
}

// -- Board (bulk import) --
export function importBoardApi(payload) {
    return request('/board/import', { method: 'POST', body: JSON.stringify(payload) });
}
