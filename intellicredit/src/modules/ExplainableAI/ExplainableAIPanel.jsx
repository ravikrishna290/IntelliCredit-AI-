import { BrainCircuit, Cpu, Binary, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { useAppContext } from '../../context/AppContext';

const mockShapplyFeatureData = [
    { feature: 'GST-Bank Variance', impact: -0.32 },
    { feature: 'Pending Litigations', impact: -0.18 },
    { feature: 'W.C. Cycle Delay', impact: -0.12 },
    { feature: 'EBITDA Margin', impact: 0.05 },
    { feature: 'Collateral LTV', impact: 0.15 },
].sort((a, b) => a.impact - b.impact); // Ascending for horizontal bar

const mockAuditTrail = [
    { dataPoint: 'Bank Inflows (Q3)', value: '₹31.8 Cr', color: 'var(--status-danger)', source: 'HDFC Acct ****4592 (Pg 12-48)', rule: '#RULE_VARIANCE_GSTR' },
    { dataPoint: 'NCLT Petition Amount', value: '₹2.4 Cr', color: 'var(--status-danger)', source: 'e-Courts Scraper (CP(IB) No. 342)', rule: '#RULE_IBC_LITIGATION' },
    { dataPoint: 'Plant Operations', value: 'Reduced Capacity', color: 'var(--status-warning)', source: 'Due Diligence Portal (Site Visit)', rule: '#RULE_QUALITATIVE_DOWNGRADE' }
];

export default function ExplainableAIPanel() {
    const { globalAIState } = useAppContext();

    // Sort SHAP values ascending just in case API didn't
    const rawShap = globalAIState?.explainableAi?.shapValues || mockShapplyFeatureData;
    const sortedShap = [...rawShap].sort((a, b) => a.impact - b.impact);

    const activeData = {
        shapValues: sortedShap,
        auditTrail: globalAIState?.explainableAi?.auditTrail || mockAuditTrail
    };

    return (
        <div className="flex-col gap-6" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
            <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BrainCircuit size={24} color="var(--accent-primary)" />
                    Explainable AI (XAI) Engine
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Unboxing the black box: Model transparency, feature importance, and attribution.</p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
                {/* Model Architecture & Pipeline Status */}
                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Cpu size={18} /> Model Ensemble Topology
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <ModelNode title="OCR & Table Extraction" desc="LayoutLMv3 (Confidence: 99.2%)" active />
                        <ModelNode title="Anomaly Detection" desc="Isolation Forest / XGBoost (Confidence: 96.8%)" active alert />
                        <ModelNode title="NLP Sentiment & Risk Extractor" desc="FinBERT-Large (Confidence: 92.4%)" active />
                        <ModelNode title="Credit Scoring Matrix" desc="Ensemble Gradient Boosting (Final Output)" active border="var(--status-danger)" />
                    </div>
                </div>

                {/* Feature Importance (SHAP values) */}
                <div className="glass-panel" style={{ flex: 1.5, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Binary size={18} /> Local Feature Attribution (SHAP Values)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        How individual features influenced the final credit score from the baseline. Negative values increase risk.
                    </p>

                    <div style={{ flex: 1, minHeight: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={activeData.shapValues} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                                <YAxis dataKey="feature" type="category" stroke="var(--text-muted)" tick={{ fontSize: 12, fill: 'var(--text-primary)' }} width={120} />
                                <RechartsTooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: 'var(--bg-panel)', border: 'var(--glass-border)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="impact" >
                                    {activeData.shapValues.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.impact < 0 ? 'var(--status-danger)' : 'var(--status-success)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Eye size={18} /> Transparent Audit Trail
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '0.75rem 0' }}>Data Point</th>
                            <th style={{ padding: '0.75rem 0' }}>Extracted Value</th>
                            <th style={{ padding: '0.75rem 0' }}>Lineage (Source Doc)</th>
                            <th style={{ padding: '0.75rem 0' }}>Override Rule Triggered</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeData.auditTrail.map((trail, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem 0', color: 'var(--text-primary)' }}>{trail.dataPoint}</td>
                                <td style={{ padding: '1rem 0', color: trail.color }}>{trail.value}</td>
                                <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{trail.source}</td>
                                <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{trail.rule}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ModelNode({ title, desc, active, alert, border }) {
    return (
        <div style={{
            padding: '1rem',
            background: alert ? 'rgba(255,23,68,0.1)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${border ? border : alert ? 'rgba(255,23,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px',
            position: 'relative'
        }}>
            <h4 style={{ fontSize: '0.95rem', margin: 0, color: alert ? 'var(--status-danger)' : 'var(--text-primary)' }}>{title}</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{desc}</p>
        </div>
    );
}
