// Cached DOM references, grouped by the feature area that uses them
export const modalElements = {
    modal: document.getElementById('task-modal'),
    title: document.getElementById('modal-title'),
    form: document.getElementById('task-form'),
    idInput: document.getElementById('task-id'),
    idDisplay: document.getElementById('task-id-input'),
    idGroup: document.getElementById('task-id-group'),
    titleInput: document.getElementById('task-title'),
    descInput: document.getElementById('task-desc'),
    urlInput: document.getElementById('task-url'),
    priorityInput: document.getElementById('task-priority'),
    dueDateInput: document.getElementById('task-due-date'),
    assignedUserInput: document.getElementById('task-assigned-user'),
    recurrenceTypeInput: document.getElementById('task-recurrence-type'),
    recurrenceIntervalInput: document.getElementById('task-recurrence-interval'),
    recurrenceEndInput: document.getElementById('task-recurrence-end'),
    recurrenceSettingsContainer: document.querySelector('.recurrence-settings'),
    tagsContainer: document.getElementById('task-tags'),
    tagsInput: document.getElementById('task-tags-input'),
    subtaskInput: document.getElementById('subtask-input'),
    addSubtaskBtn: document.getElementById('add-subtask-btn'),
    subtasksList: document.getElementById('task-subtasks')
};

export const historyElements = {
    modal: document.getElementById('history-modal'),
    list: document.getElementById('history-list')
};

export const timeLogsElements = {
    modal: document.getElementById('time-logs-modal'),
    list: document.getElementById('time-logs-list'),
    totalDurationContainer: document.getElementById('total-duration-container'),
    memoHistoryList: document.getElementById('memo-history-list')
};

export const analyticsElements = {
    modal: document.getElementById('analytics-modal'),
    content: document.getElementById('analytics-content')
};

export const filterElements = {
    search: document.getElementById('task-search'),
    priority: document.getElementById('filter-priority'),
    tags: document.getElementById('filter-tags'),
    status: document.getElementById('filter-status'),
    dueDate: document.getElementById('filter-due-date'),
    sortDueDate: document.getElementById('sort-due-date')
};

// NOTE: these keys must match the `data-status` values used in index.html
// exactly (todo / progress / ready-for-review / done). A mismatch here is
// what silently broke the "Ready For Review" column before - tasks with an
// unrecognized status get force-reset to 'todo' by the board's safety net.
export const boardElements = {
    columns: {
        todo: document.getElementById('todo-container'),
        progress: document.getElementById('progress-container'),
        'ready-for-review': document.getElementById('ready-for-review-container'),
        done: document.getElementById('done-container')
    },
    columnWrappers: {
        todo: document.getElementById('todo-col'),
        progress: document.getElementById('progress-col'),
        'ready-for-review': document.getElementById('ready-for-review-col'),
        done: document.getElementById('done-col')
    },
    counts: {
        todo: document.querySelector('#todo-col .count'),
        progress: document.querySelector('#progress-col .count'),
        'ready-for-review': document.querySelector('#ready-for-review-col .count'),
        done: document.querySelector('#done-col .count')
    }
};
