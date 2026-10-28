import { useCallback, useEffect, useState } from 'react';
import { INITIAL_FILTERS } from '../lib/filters.js';

const fromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(Object.entries(INITIAL_FILTERS).map(([k, d]) => [k, params.get(k) ?? d]));
};

export function useFilters() {
    const [values, setValues] = useState(fromUrl);

    useEffect(() => {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(values)) if (v !== INITIAL_FILTERS[k]) params.set(k, v);
        const qs = params.toString();
        window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
    }, [values]);

    const setValue = useCallback((key, value) => setValues(v => ({ ...v, [key]: value })), []);
    return { values, setValue };
}
