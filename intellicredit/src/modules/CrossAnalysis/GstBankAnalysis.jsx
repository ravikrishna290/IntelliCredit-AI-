import { AlertTriangle, RefreshCcw, SearchX, ArrowRightLeft } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const mockAnomalies = [
    { id: 1, type: 'critical', title: 'Circular Trading Pattern Detected', desc: '₹12.5 Cr moved between related parties (TechNova, AlphaCorp, BetaLogistics) within 48 hours without underlying e-way bills.', source: 'Bank Statement + E-Way Bill Portal' },
    { id: 2, type: 'warning', title: 'Revenue Inflation Flag', desc: 'GSTR-1 sales reported as ₹45.2 Cr for Q3, but corresponding banking inflows show only ₹31.8 Cr (-29.6% variance).', source: 'GSTR-1 vs Bank Inflow' },
    { id: 3, type: 'warning', title: 'Input Tax Credit Mismatch', desc: '₹8.4 Cr of ITC claimed in GSTR-3B does not reflect in GSTR-2A, indicating potential supplier defaults.', source: 'GSTR-3B vs GSTR-2A' },
    { id: 4, type: 'info', title: 'Unexplained Cash Withdrawals', desc: 'Sharp increase in cash withdrawals (₹1.2 Cr) immediately following loan disbursal from HDFC on Oct 14.', source: 'Bank Statement Analysis' }
];

const mockReconciliation = {
    gstr1: 45.2,
    bankInflow: 31.8,
    variance: '₹13.4 Cr',
    aiInsight: 'The borrower appears to be artificially inflating revenue via GST filings to secure higher credit limits, while actual cash flows do not support the reported turnover.'
};

export default function GstBankAnalysis() {
    const { globalAIState } = useAppContext();

    const activeData = globalAIState?.crossAnalysis || {
        riskLevel: 'Elevated',
        anomalies: mockAnomalies,
        reconciliation: mockReconciliation
    };

    return (
        <div className="flex-col gap-6" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCcw size={24} color="var(--accent-primary)" />
                        GST & Bank Statement Cross Analysis
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>AI-driven detection of anomalies, circular trading, and revenue inflation.</p>
                </div>
                <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '1.5rem' }}>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Risk Level</p>
                        <p style={{ fontWeight: 700, color: 'var(--status-danger)', margin: 0, fontSize: '1.1rem', textTransform: 'capitalize' }}>{activeData.riskLevel}</p>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Anomalies</p>
                        <p style={{ fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>{activeData.anomalies.length} Detected</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
                {/* Anomaly Feed */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {activeData.anomalies.map(anomaly => (
                        <div key={anomaly.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${anomaly.type === 'critical' ? 'var(--status-danger)' : anomaly.type === 'warning' ? 'var(--status-warning)' : 'var(--status-info)'}` }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ paddingTop: '2px' }}>
                                    {anomaly.type === 'critical' ? <AlertTriangle color="var(--status-danger)" /> :
                                        anomaly.type === 'warning' ? <SearchX color="var(--status-warning)" /> :
                                            <ArrowRightLeft color="var(--status-info)" />}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: anomaly.type === 'critical' ? 'var(--status-danger)' : 'var(--text-primary)' }}>{anomaly.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.75rem', lineHeight: 1.6 }}>{anomaly.desc}</p>
                                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                                        Source: {anomaly.source}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* GST vs Bank Reconciliation Chart Placeholder */}
                <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Reconciliation Gap</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <ReconciliationBar label="GSTR-1 Declared" value={activeData.reconciliation.gstr1} color="var(--status-success)" />
                            <ReconciliationBar label="Banking Inflows" value={activeData.reconciliation.bankInflow} color="var(--accent-primary)" />
                            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                            <p style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-danger)', fontWeight: 600 }}>
                                <span>Unexplained Variance</span>
                                <span>{activeData.reconciliation.variance}</span>
                            </p>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(255,23,68,0.1) 0%, rgba(20,21,28,0.8) 100%)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--status-danger)' }}>AI Insight</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {activeData.reconciliation.aiInsight}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReconciliationBar({ label, value, color }) {
    const max = 50;
    const width = (value / max) * 100;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>{label}</span>
                <span style={{ fontWeight: 600 }}>₹{value} Cr</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${width}%`, height: '100%', background: color, borderRadius: '4px' }}></div>
            </div>
        </div>
    );
}
