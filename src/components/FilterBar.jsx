import { FILTERS, isActive } from '../lib/filters.js';

export function FilterBar({ meta, values, onChange }) {
    return (
        <section className="toolbar" aria-label="Task filters">
            {FILTERS.map(f => {
                const id = `filter-${f.key}`;
                const value = values[f.key];
                const className = isActive(f, value) ? 'filter-active' : '';

                return (
                    <div key={f.key} className={`toolbar-field ${f.type === 'text' ? 'toolbar-search' : ''}`}>
                        <label htmlFor={id}>{f.label}</label>
                        {f.type === 'text' ? (
                            <input id={id} type="text" className={className} placeholder={f.placeholder}
                                   value={value} onChange={e => onChange(f.key, e.target.value)} />
                        ) : (
                            <select id={id} className={className} value={value}
                                    onChange={e => onChange(f.key, e.target.value)}>
                                <option value={f.initial ?? 'all'}>{f.defaultLabel}</option>
                                {f.options(meta).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        )}
                    </div>
                );
            })}
        </section>
    );
}
