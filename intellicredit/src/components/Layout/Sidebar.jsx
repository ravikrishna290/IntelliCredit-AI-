import { NavLink } from 'react-router-dom';
import {
    UploadCloud,
    FileText,
    RefreshCcw,
    Globe,
    Users,
    ShieldAlert,
    CheckSquare,
    FileSignature,
    LayoutDashboard,
    BrainCircuit
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
    { name: 'Data Ingestion', href: '/', icon: UploadCloud },
    { name: 'Document Intelligence', href: '/document-intelligence', icon: FileText },
    { name: 'GST & Bank Analysis', href: '/cross-analysis', icon: RefreshCcw },
    { name: 'AI Research Agent', href: '/research-agent', icon: Globe },
    { name: 'Due Diligence Portal', href: '/due-diligence', icon: Users },
    { name: 'Credit Risk Scoring', href: '/risk-scoring', icon: ShieldAlert },
    { name: 'Loan Recommendation', href: '/recommendation', icon: CheckSquare },
    { name: 'CAM Generator', href: '/cam-generator', icon: FileSignature },
    { name: 'Command Center', href: '/command-center', icon: LayoutDashboard },
    { name: 'Explainable AI', href: '/explainable-ai', icon: BrainCircuit },
];

export default function Sidebar() {
    return (
        <div className="glass-panel" style={{ width: 'var(--sidebar-width)', height: '100%', display: 'flex', flexDirection: 'column', borderRight: 'var(--glass-border)', borderRadius: 0 }}>

            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: 'var(--glass-border)' }}>
                <div style={{ background: 'var(--accent-primary)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                    <BrainCircuit size={20} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }} className="text-gradient">INTELLICREDIT AI</h2>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Corporate Intelligence</span>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>
                    Intelligence Modules
                </p>

                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            background: isActive ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                            border: isActive ? '1px solid rgba(0, 229, 255, 0.2)' : '1px solid transparent',
                            transition: 'all var(--transition-normal)',
                            fontWeight: isActive ? 600 : 400
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                                <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        style={{ position: 'absolute', left: 0, width: '3px', height: '24px', background: 'var(--accent-primary)', borderRadius: '0 4px 4px 0' }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '1.5rem', borderTop: 'var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-panel-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'var(--glass-border)' }}>
                    <span style={{ fontSize: '1.2rem' }}>👨‍💼</span>
                </div>
                <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Credit Manager</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--status-success)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-success)' }}></span>
                        System Online
                    </p>
                </div>
            </div>
        </div>
    );
}
