import { Router } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { statuses, priorities, users, tasks } from '../db/schema.js';

export const metaRouter = Router();

metaRouter.get('/', async (_req, res) => {
    const [statusRows, priorityRows, userRows, tagRows] = await Promise.all([
        db.select().from(statuses).orderBy(statuses.position),
        db.select().from(priorities).orderBy(priorities.position),
        db.select().from(users).orderBy(users.surname, users.name),
        // distinct tags straight from the jsonb arrays
        db.execute(sql`
            select distinct lower(t) as tag
            from ${tasks}, jsonb_array_elements_text(${tasks.tags}) as t
            order by 1
        `)
    ]);

    res.json({
        statuses: statusRows,
        priorities: priorityRows,
        users: userRows,
        tags: tagRows.map(r => r.tag)
    });
});
