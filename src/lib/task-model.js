// No DB access here - the server (Drizzle) owns ids/defaults; this file
// only prepares/validates the data that gets sent over the wire.

export function normalizeTaskSubtasks(subtasks) {
    if (!Array.isArray(subtasks)) return [];

    return subtasks
        .map(subtask => {
            const text = typeof subtask?.text === 'string' ? subtask.text.trim() : '';
            if (!text) return null;

            return {
                id: subtask.id,
                text,
                done: Boolean(subtask.done)
            };
        })
        .filter(Boolean);
}

export function stopTimer(task, now = Date.now()) {
    if (!task.isTracking) return task;
    const duration = now - task.lastStartTime;
    const last = task.timeLogs.length - 1;
    const memo = task.activeMemoSession && {
        ...task.activeMemoSession, endedAt: new Date(now).toISOString(), duration
    };
    return {
        ...task,
        isTracking: false,
        lastStartTime: null,
        totalTime: task.totalTime + duration,
        timeLogs: task.timeLogs.map((l, i) => (i === last && !l.end ? { ...l, end: now } : l)),
        memoSessions: memo ? [...task.memoSessions, memo] : task.memoSessions,
        activeMemoSession: null
    };
}

export function startTimer(task, now = Date.now()) {
    if (task.isTracking) return task;
    return {
        ...task,
        isTracking: true,
        lastStartTime: now,
        timeLogs: [...(task.timeLogs ?? []), { start: now, end: null }],
        activeMemoSession: {
            taskId: task.id, startedAt: new Date(now).toISOString(),
            endedAt: null, note: '', duration: null
        }
    };
}

export function sessionState(task) {
    if (!task.isTracking) return { label: 'Paused', tone: 'paused' };
    return task.activeMemoSession?.note?.trim()
        ? { label: 'Recording', tone: 'recording' }
        : { label: 'Awaiting summary', tone: 'awaiting' };
}