import { db } from './client.js';
import { statuses, priorities, users } from './schema.js';

export async function seedLookups() {
    await db.insert(statuses).values([
        { key: 'todo', label: 'To Do', position: 1 },
        { key: 'progress', label: 'In Progress', position: 2 },
        { key: 'ready-for-review', label: 'Ready For Review', position: 3 },
        { key: 'done', label: 'Done', position: 4 },
        { key: 'rejected', label: 'Rejected', position: 5 }
    ]).onConflictDoNothing();

    await db.insert(users).values([
        { id: 1, name: 'Al', surname: 'Azame' },
        { id: 2, name: 'Manty', surname: 'Besterski' },
        { id: 3, name: 'Kazany', surname: 'Mereze' },
    ]).onConflictDoNothing();

    await db.insert(priorities).values([
        { key: 'high', label: 'High', position: 1 },
        { key: 'medium', label: 'Medium', position: 2 },
        { key: 'low', label: 'Low', position: 3 }
    ]).onConflictDoNothing();
}
