import { useRef, useState } from 'react';

export function TagsInput({ id, value, onChange }) {
    const [draft, setDraft] = useState('');
    const inputRef = useRef(null);

    const add = (raw) => {
        const incoming = raw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        const next = [...new Set([...value, ...incoming])];
        if (next.length !== value.length) onChange(next);
    };

    const commit = () => { add(draft); setDraft(''); };

    const handleChange = (e) => {
        const text = e.target.value;
        if (!text.includes(',')) return setDraft(text);
        const parts = text.split(',');          // typed or pasted commas
        add(parts.slice(0, -1).join(','));
        setDraft(parts.at(-1).trimStart());
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); commit(); }
        if (e.key === 'Backspace' && !draft) onChange(value.slice(0, -1));
    };

    return (
        <div id="task-tags" className="tags-input-container" onClick={() => inputRef.current?.focus()}>
            {value.map(tag => (
                <span key={tag} className="tag-chip">
                    {tag}
                    <button type="button" className="tag-chip-remove" aria-label={`Remove tag ${tag}`}
                            onClick={(e) => { e.stopPropagation(); onChange(value.filter(t => t !== tag)); }}>
                        ×
                    </button>
                </span>
            ))}
            <input ref={inputRef} id={id} type="text" value={draft} placeholder="Type and press comma..."
                   onChange={handleChange} onKeyDown={handleKeyDown} onBlur={commit} />
        </div>
    );
}
