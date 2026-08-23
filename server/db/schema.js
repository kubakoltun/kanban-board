// Drizzle ORM schema - the single source of truth for the DB shape.
// Run `npm run db:push` (or generate + migrate) after changing this file.
import {
    pgTable,
    uuid,
    text,
    integer,
    bigint,
    boolean,
    date,
    jsonb,
    timestamp
} from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
    id: uuid('id').defaultRandom().primaryKey(),

    // Core content
    title: text('title').notNull(),
    content: text('content').notNull(),
    url: text('url').default(''),
    status: text('status').notNull().default('todo'),
    priority: text('priority').notNull().default('medium'),
    dueDate: date('due_date'),
    tags: jsonb('tags').notNull().default([]),

    // Recurrence
    recurrenceType: text('recurrence_type').notNull().default('none'),
    recurrenceInterval: integer('recurrence_interval').notNull().default(1),
    recurrenceEnd: date('recurrence_end'),

    // Time tracking (durations/timestamps stored as ms since epoch)
    totalTime: bigint('total_time', { mode: 'number' }).notNull().default(0),
    isTracking: boolean('is_tracking').notNull().default(false),
    lastStartTime: bigint('last_start_time', { mode: 'number' }),
    timeLogs: jsonb('time_logs').notNull().default([]),
    memoSessions: jsonb('memo_sessions').notNull().default([]),
    activeMemoSession: jsonb('active_memo_session'),

    // Subtasks are simple enough to live as JSON rather than a child table
    subtasks: jsonb('subtasks').notNull().default([]),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const history = pgTable('history', {
    id: uuid('id').defaultRandom().primaryKey(),
    action: text('action').notNull(),
    description: text('description').notNull(),
    metadata: jsonb('metadata'),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow()
});
