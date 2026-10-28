import { Modal } from './Modal.jsx';
import { Icon } from './Icon.jsx';
import { useHistory, useClearHistory } from '../hooks/queries.js';
import { formatTimeAgo } from '../lib/format.js';

const ACTIONS = {
    created: ['action-created', 'plus'],
    moved: ['action-moved', 'arrow'],
    deleted: ['action-deleted', 'trash'],
    timer: ['action-timer', 'clock']
};

export function HistoryModal({ meta, onClose }) {
    const { data: history = [], isPending } = useHistory();
    const clear = useClearHistory();
    const statusLabel = (key) => meta.statuses.find(s => s.key === key)?.label ?? key;

    const StatusBadge = ({ status }) => (
        <span className={`status-badge status-${status}`}>{statusLabel(status)}</span>
    );

    const renderText = ({ action, description, metadata }) =>
        action === 'moved' && metadata
            ? <>Moved "<strong>{metadata.task}</strong>" from <StatusBadge status={metadata.from} /> → <StatusBadge status={metadata.to} /></>
            : description;

    return (
        <Modal onClose={onClose}>
            <div className="modal-header">
                <h2>Activity Log</h2>
                <button className="btn-secondary" style={{ border: 'none', padding: '0.5rem' }} aria-label="Close" onClick={onClose}>
                    <Icon name="close" />
                </button>
            </div>

            <div className="history-container">
                {isPending && <p style={{ textAlign: 'center', color: '#888' }}>Loading…</p>}
                {!isPending && history.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>No activity yet</p>}
                {history.map(entry => {
                    const [cssClass, icon] = ACTIONS[entry.action] ?? ['action-cleared', 'history'];
                    const when = new Date(entry.timestamp);
                    return (
                        <div key={entry.id} className={`history-item ${cssClass}`}>
                            <div className="history-icon-wrapper"><Icon name={icon} size={10} /></div>
                            <div className="history-content">
                                <div className="history-header">
                                    <span className="history-action-label">{entry.action}</span>
                                    <span className="history-time" title={when.toLocaleString()}>{formatTimeAgo(when)}</span>
                                </div>
                                <div className="history-text">{renderText(entry)}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="btn-danger-outline" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                    disabled={clear.isPending}
                    onClick={() => window.confirm('Clear history?') && clear.mutate()}>
                Clear History
            </button>
        </Modal>
    );
}
