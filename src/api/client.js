const API_BASE = '/api';

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!res.ok) throw new Error(`${options.method || 'GET'} ${path} failed (${res.status})`);
    return res.status === 204 ? null : res.json();
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
    meta: () => request('/meta'),
    tasks: () => request('/tasks'),
    createTask: (f) => request('/tasks', json('POST', f)),
    updateTask: (id, f) => request(`/tasks/${id}`, json('PUT', f)),
    deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
    history: () => request('/history'),
    createHistory: (e) => request('/history', json('POST', e)),
    clearHistory: () => request('/history', { method: 'DELETE' }),
    importBoard: (p) => request('/board/import', json('POST', p))
};
