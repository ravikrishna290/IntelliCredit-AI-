import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldAlert, Info } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const mockRiskDimensions = [
    { name: 'Character', score: 38, max: 100, color: 'var(--status-danger)', text: 'Poor promoter reputation, ongoing litigation, and evasive management.', evidence: ['NCLT Petition (Sec 9)', 'e-Courts Labor Dispute'] },
    { name: 'Capacity', score: 45, max: 100, color: 'var(--status-warning)', text: 'Revenue inflation suspected; actual cash flow cannot support debt servicing.', evidence: ['GSTR-1 vs Bank Variance: 29.6%', 'Working Capital Cycle: 84 Days'] },
    { name: 'Capital', score: 60, max: 100, color: 'var(--status-warning)', text: 'Moderate equity cushion, but high leverage ratio limits buffer against shocks.', evidence: ['Total Debt: ₹155 Cr', 'Promoter Shareholding: 62.5%'] },
    { name: 'Collateral', score: 85, max: 100, color: 'var(--status-success)', text: 'Strong physical asset backing; real estate properties in prime industrial zones.', evidence: ['Asset Valuation: ₹180 Cr', 'LTV Ratio: 42%'] },
    { name: 'Conditions', score: 50, max: 100, color: 'var(--status-warning)', text: 'Macro-economic headwinds in the industrial equipment sector.', evidence: ['CRISIL Rating: Negative Outlook'] },
];

export default function RiskScoringEngine() {
    const { globalAIState } = useAppContext();

    const activeData = globalAIState?.riskScoring || {
        finalRating: 'C',
        interpretation: 'Very High Risk / Reject',
        overallScore: 55,
        dimensions: mockRiskDimensions
    };

    // Derived from active data
    const scoringData = activeData.dimensions.map(d => ({ name: d.name, value: d.score, color: d.color }));

    return (
        <div className="flex-col gap-6" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldAlert size={24} color="var(--status-danger)" />
                        Credit Risk Scoring Engine
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>AI Evaluation based on the 5 C's of Credit.</p>
                </div>
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 2rem' }}>
                    <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, marginBottom: '0.25rem' }}>Final AI Borrower Rating</p>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', color: activeData.finalRating === 'A' || activeData.finalRating === 'B' ? 'var(--status-success)' : 'var(--status-danger)', lineHeight: 1 }}>{activeData.finalRating}</h1>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, marginBottom: '0.25rem' }}>Interpretation</p>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activeData.interpretation}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
                {/* Score Chart */}
                <div className="glass-panel" style={{ width: '300px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', alignSelf: 'flex-start' }}>Score Distribution</h3>
                    <div style={{ width: '100%', height: '250px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={scoringData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {scoringData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: 'var(--glass-border)', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>{activeData.overallScore}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100 avg</p>
                        </div>
                    </div>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                        {activeData.dimensions.map(d => (
                            <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }}></div>
                                    <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                                </div>
                                <span style={{ fontWeight: 600 }}>{d.score}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {activeData.dimensions.map(dim => (
                        <div key={dim.name} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: dim.color }}>
                                    {dim.name}
                                    <span style={{ fontSize: '0.8rem', padding: '0.1rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--text-primary)' }}>
                                        Score: {dim.score}/100
                                    </span>
                                </h3>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                                {dim.text}
                            </p>
                            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    <Info size={14} /> Evidence:
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {dim.evidence.map((ev, i) => (
                                        <span key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                            {ev}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
