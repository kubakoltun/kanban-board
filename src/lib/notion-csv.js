import Papa from 'papaparse';

// Notion column -> what this importer does with it.
// Columns not listed here (Blocked by, Figma File, ID, ...) are ignored.
const REQUIRED_COLUMNS = ['Name'];

const pad = (n) => String(n).padStart(2, '0');

// "October 26, 2024" or "October 17, 2024 5:54 PM" -> Date | null
function parseNotionDate(value) {
    if (!value?.trim()) return null;
    const d = new Date(value.trim());
    return Number.isNaN(d.getTime()) ? null : d;
}

// Local calendar date, so we don't shift a day via UTC conversion
const toDateOnly = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseNotionCsv(text) {
    const { data, meta } = Papa.parse(text.replace(/^\uFEFF/, ''), {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim()
    });

    const missing = REQUIRED_COLUMNS.filter(c => !meta.fields?.includes(c));
    if (missing.length) {
        throw new Error(`Doesn't look like a Notion export (missing column: ${missing.join(', ')})`);
    }

    const tasks = data
        .filter(row => row['Name']?.trim())
        .map(row => {
            const created = parseNotionDate(row['Created time']);
            const due = parseNotionDate(row['Due date']);
            // People columns can hold several names - take the first
            const assigneeName = row['Assign']?.split(',')[0].trim() || null;

            return {
                title: row['Name'].trim(),
                content: '',
                status: row['Status']?.trim() || null,     // server maps label -> status key
                priority: row['Priority']?.trim() || null, // server maps label -> priority key
                dueDate: due ? toDateOnly(due) : null,
                assigneeName,                              // server maps name -> user id
                createdAt: created ? created.toISOString() : undefined
            };
        });

    return {
        mode: 'append',
        tasks,
        history: [{
            action: 'imported',
            description: `Imported ${tasks.length} task${tasks.length === 1 ? '' : 's'} from a Notion CSV`
        }]
    };
}
