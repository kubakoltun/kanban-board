import { useMeta } from '../hooks/queries.js';

export function UserSelect({ id, value, onChange }) {
    const { data } = useMeta();

    return (
        <select id={id} value={value} onChange={e => onChange(e.target.value)}>
            <option value="">Unassigned</option>
            {data?.users.map(u => <option key={u.id} value={u.id}>{u.name} {u.surname}</option>)}
        </select>
    );
}
