import { useEffect } from 'react';

export function Modal({ id, onClose, className = '', children }) {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        document.body.classList.add('modal-open');
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.classList.remove('modal-open');
        };
    }, [onClose]);

    return (
        <div id={id} className="modal active" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className={`modal-content ${className}`}>{children}</div>
        </div>
    );
}
