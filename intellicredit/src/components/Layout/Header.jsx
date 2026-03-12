import { Bell, Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Header() {
    const { currentBorrower } = useAppContext();

    return (
        <header className="glass-panel" style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            borderRadius: 0,
            borderBottom: 'var(--glass-border)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'var(--glass-border)' }}>
                    <Search size={16} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search borrower or PAN..."
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            width: '250px',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Evaluation:</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, background: 'rgba(0, 229, 255, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(0, 229, 255, 0.2)', color: 'var(--accent-primary)' }}>
                        {currentBorrower.name}
                    </span>
                </div>

                <button style={{ position: 'relative', padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'var(--glass-border)' }}>
                    <Bell size={20} color="var(--text-primary)" />
                    <span style={{ position: 'absolute', top: '0px', right: '2px', width: '8px', height: '8px', background: 'var(--status-danger)', borderRadius: '50%', border: '2px solid var(--bg-surface)' }}></span>
                </button>
            </div>
        </header>
    );
}
