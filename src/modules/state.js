export const state = {
    tasks: [],
    history: [],
    activeMemoDraftTaskId: null,
    viewedTaskId: null,   // For UI tracking (which task's logs are open)
    draggedTask: null,    // For Drag & Drop
    filters: {
        search: '',
        priority: 'all',
        tag: 'all',
        status: 'all',
        dueDate: 'all',
        sortDueDate: 'none'
    }
};
