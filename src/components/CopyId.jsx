import { useEffect, useRef, useState } from 'react';

export function CopyId({ id }) {
    const [copied, setCopied] = useState(false);
    const timer = useRef();
    useEffect(() => () => clearTimeout(timer.current), []);

    const copy = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(String(id));
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard API unavailable (non-secure context) */
        }
    };

    return (
        <div className="task-id-row">
            <span className="task-id-text">#{id}</span>
            <button
                type="button"
                className={`copy-id-btn ${copied ? 'is-copied' : ''}`}
                aria-label={copied ? 'Copied' : 'Copy task ID'}
                title={copied ? 'Copied!' : 'Copy task ID'}
                onClick={copy}
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {copied
                        ? <polyline points="20 6 9 17 4 12" />
                        : <>
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </>}
                </svg>
            </button>
        </div>
    );
}
