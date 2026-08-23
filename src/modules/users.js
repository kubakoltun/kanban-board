// Assignable users - loaded once at startup, looked up by id everywhere else
import { state } from './state.js';
import { fetchUsers } from './api.js';

export async function loadUsers() {
    try {
        state.users = await fetchUsers();
    } catch (e) {
        console.error('Failed to load users:', e);
        state.users = [];
    }
}

export function findUser(userId) {
    if (!userId && userId !== 0) return null;
    return state.users.find(u => String(u.id) === String(userId)) || null;
}

export function formatUserName(user) {
    if (!user) return '';
    return `${user.name} ${user.surname}`.trim();
}
