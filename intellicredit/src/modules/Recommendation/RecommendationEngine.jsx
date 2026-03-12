import { CheckSquare, XCircle, FileWarning, Percent, IndianRupee, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function RecommendationEngine() {
    const { globalAIState } = useAppContext();

    const activeData = globalAIState?.recommendation || {
        decision: "REJECT",
        reasoning: "Loan application rejected due to artificial revenue inflation via circular trading, elevated litigation risk under NCLT Sec 9, and negative operating cash flows despite strong physical collateral.",
        confidence: 96.8,
        requestedLimit: "₹45.0 Cr",
        suggestedRate: "N/A",
        covenants: "Even if approved as exception, requires 100% Cash Collateral and Quarterly Forensic Audit.",
        decisionDrivers: [
            { impact: "-8.4 pts", color: "var(--status-danger)", desc: "GST vs Bank Reconciliation reveals ₹13.4 Cr unexplained variance (High Probability of Circular Trading)." },
            { impact: "-6.2 pts", color: "var(--status-danger)", desc: "Active IBC Section 9 petition by Gamma Materials indicating severe liquidity distress." },
            { impact: "-4.1 pts", color: "var(--status-danger)", desc: "Due Diligence site visit confirms operational shutdown of Plant 2 without prior disclosure." },
            { impact: "+2.5 pts", color: "var(--status-success)", desc: "High quality Real Estate collateral (LTV of 42%), but insufficient to mitigate structural cash flow risks." }
        ]
    };

    return (
        <div className="flex-col gap-6" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
            <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckSquare size={24} color="var(--accent-primary)" />
                    Loan Recommendation Engine
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Explainable AI decision formulation and covenant structuring.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', background: activeData.decision.includes('APPROVE') ? 'linear-gradient(135deg, rgba(0,230,118,0.1) 0%, rgba(20,21,28,0.8) 100%)' : 'linear-gradient(135deg, rgba(255,23,68,0.1) 0%, rgba(20,21,28,0.8) 100%)', border: `1px solid ${activeData.decision.includes('APPROVE') ? 'rgba(0,230,118,0.3)' : 'rgba(255,23,68,0.3)'}` }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: activeData.decision.includes('APPROVE') ? 'var(--status-success)' : 'var(--status-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {activeData.decision.includes('APPROVE') ? <CheckCircle2 size={24} /> : <XCircle size={24} />} Decision: {activeData.decision}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        "{activeData.reasoning}"
                    </p>
                </div>
                <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', minWidth: '300px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Confidence Score</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, color: 'var(--text-primary)' }}>{activeData.confidence}</span>
                        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <IndianRupee size={16} /> Requested Limit
                    </h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{activeData.requestedLimit}</p>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Percent size={16} /> Suggested Interest Rate
                    </h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, opacity: activeData.suggestedRate === 'N/A' ? 0.5 : 1 }}>{activeData.suggestedRate}</p>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldAlert size={16} /> Overriding Covenants
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--status-warning)', margin: 0, lineHeight: 1.5 }}>
                        {activeData.covenants}
                    </p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileWarning size={18} color="var(--accent-tertiary)" /> Major Decision Drivers (Explainable AI)
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: 0, paddingLeft: '1rem', color: 'var(--text-secondary)' }}>
                    {activeData.decisionDrivers.map((driver, i) => (
                        <li key={i}>
                            <strong style={{ color: driver.color }}>{driver.impact}:</strong> {driver.desc}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
