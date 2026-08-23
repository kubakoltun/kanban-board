// Optional convenience script: inserts a couple of sample users so the
// "assigned to" dropdown has something in it right after first setup.
// Run with: npm run db:seed
import { db } from './client.js';
import { users } from './schema.js';

const sampleUsers = [
    { name: 'Al', surname: 'Azame' },
    { name: 'Manty', surname: 'Besterski' },
    { name: 'Monty', surname: 'Besterski' }
];

const inserted = await db.insert(users).values(sampleUsers).returning();
console.log(`Seeded ${inserted.length} users:`, inserted);
process.exit(0);
