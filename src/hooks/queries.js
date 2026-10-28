import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { startTimer, stopTimer } from '../lib/task-model.js';

export const useMeta = () => useQuery({ queryKey: ['meta'], queryFn: api.meta });
export const useTasks = () => useQuery({ queryKey: ['tasks'], queryFn: api.tasks });
export const useHistory = () => useQuery({ queryKey: ['history'], queryFn: api.history });

const SCOPE = { id: 'tasks' }; // mutations in the same scope run one after another
const findTask = (qc, id) => qc.getQueryData(['tasks'])?.find(t => t.id === id);
const replaceTask = (qc, saved) =>
    qc.setQueryData(['tasks'], old => old?.map(t => (t.id === saved.id ? saved : t)));
const invalidateBoard = (qc) =>
    ['tasks', 'history', 'meta'].forEach(k => qc.invalidateQueries({ queryKey: [k] }));

export function useMoveTask() {
    const qc = useQueryClient();

    return useMutation({
        scope: SCOPE,
        mutationFn: async ({ task, status }) => {
            const fresh = findTask(qc, task.id) ?? task;
            const stopping = (status === 'done' || status === 'todo') && fresh.isTracking;
            const next = {
                ...(stopping ? stopTimer(fresh) : fresh),
                status,
                completedAt: status === 'done' ? new Date().toISOString() : null
            };

            await api.updateTask(task.id, next);
            if (stopping) {
                await api.createHistory({ action: 'timer', description: `Auto-stopped timer for "${task.title}" (Moved to ${status})` });
            }
            await api.createHistory({
                action: 'moved',
                description: `Moved "${task.title}" from ${task.status} to ${status}`,
                metadata: { from: task.status, to: status, task: task.title }
            });
        },
        onMutate: async ({ task, status }) => {
            await qc.cancelQueries({ queryKey: ['tasks'] });
            const previous = qc.getQueryData(['tasks']);
            qc.setQueryData(['tasks'], old => old.map(t => (t.id === task.id ? { ...t, status } : t)));
            return { previous };
        },
        onError: (_e, _v, ctx) => qc.setQueryData(['tasks'], ctx.previous),
        onSettled: () => invalidateBoard(qc)
    });
}

export function useSaveTask() {
    const qc = useQueryClient();

    return useMutation({
        scope: SCOPE,
        mutationFn: async ({ id, fields }) => {
            if (!id) {
                const created = await api.createTask(fields);
                await api.createHistory({ action: 'created', description: `Created "${created.title}"` });
                return created;
            }
            const current = findTask(qc, id);
            if (!current) throw new Error('Task no longer exists');
            return api.updateTask(id, { ...current, ...fields });
        },
        onSettled: () => invalidateBoard(qc)
    });
}

// Small in-place edits (timer, memo, subtasks): transform the freshest copy, PUT it, store the server's row.
function useUpdateTask(transform) {
    const qc = useQueryClient();
    return useMutation({
        scope: SCOPE,
        mutationFn: async (arg) => {
            const current = findTask(qc, arg.id);
            if (!current) throw new Error('Task no longer exists');
            return api.updateTask(arg.id, transform(current, arg));
        },
        onSuccess: (saved) => replaceTask(qc, saved)
    });
}

export const useToggleTimer = () =>
    useUpdateTask((t, { action }) => (action === 'start' ? startTimer(t) : stopTimer(t)));

export const useSaveMemo = () =>
    useUpdateTask((t, { note }) =>
        t.activeMemoSession ? { ...t, activeMemoSession: { ...t.activeMemoSession, note } } : t);

export const useToggleSubtask = () =>
    useUpdateTask((t, { subtaskId }) => ({
        ...t, subtasks: t.subtasks.map(s => (s.id === subtaskId ? { ...s, done: !s.done } : s))
    }));

export const useRemoveSubtask = () =>
    useUpdateTask((t, { subtaskId }) => ({ ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) }));

export const useAddSubtask = () =>
    useUpdateTask((t, { text }) => ({ ...t, subtasks: [...(t.subtasks ?? []), { text, done: false }] }));

export function useDeleteTask() {
    const qc = useQueryClient();
    return useMutation({
        scope: SCOPE,
        mutationFn: async (task) => {
            await api.deleteTask(task.id);
            await api.createHistory({ action: 'deleted', description: `Deleted "${task.title}"` });
        },
        onSettled: () => invalidateBoard(qc)
    });
}

export function useClearHistory() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: api.clearHistory, onSuccess: () => qc.setQueryData(['history'], []) });
}

export function useImportBoard() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: api.importBoard, onSuccess: () => invalidateBoard(qc) });
}
