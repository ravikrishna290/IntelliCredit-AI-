import { LayoutDashboard, Activity, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function RiskCommandCenter() {
    const { currentBorrower, globalAIState } = useAppContext();

    // Safely extract global state or fallback to hardcoded mock values for the visual demo
    const riskScoring = globalAIState?.riskScoring || { overallScore: 55 };
    const recommendation = globalAIState?.recommendation || { decision: 'REJECT', confidence: 96.8 };
    const kpis = globalAIState?.documentIntelligence?.kpis || { totalRevenue: '₹245.0 Cr', ebitdaMargin: '17.1%', totalDebt: '₹155.0 Cr' };
    const research = globalAIState?.researchAgent || null;

    return (
        <div className="flex-col gap-6" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
            <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LayoutDashboard size={24} color="var(--accent-primary)" />
                    Risk Visualization Command Center
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Unified overview of all AI intelligence streams for {currentBorrower.name}.</p>
            </div>

            {/* Top Banner */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: recommendation.decision.includes('APPROVE') ? 'linear-gradient(90deg, rgba(20,21,28,0.8) 0%, rgba(0,230,118,0.1) 100%)' : 'linear-gradient(90deg, rgba(20,21,28,0.8) 0%, rgba(255,23,68,0.1) 100%)' }}>
                <div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>System Recommendation</p>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: recommendation.decision.includes('APPROVE') ? 'var(--status-success)' : 'var(--status-danger)' }}>{recommendation.decision}</h1>
                </div>
                <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Overall Risk Score</p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{riskScoring.overallScore}/100</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Anomaly Confidence</p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'var(--status-danger)' }}>{recommendation.confidence}%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Network Graph Placeholder */}
                <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LinkIcon size={18} /> Promoter Network Graph
                    </h3>
                    <div style={{ flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Activity size={48} color="var(--accent-secondary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-muted)' }}>Dynamic D3.js Force Layout Visualization</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--status-danger)', marginTop: '0.5rem' }}>Highlighting circular fund routes to AlphaCorp and BetaLogistics.</p>
                        </div>
                    </div>
                </div>

                {/* Legal Timeline */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={18} color="var(--status-warning)" /> Legal & Dispute Timeline
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                        {/* Timeline line */}
                        <div style={{ position: 'absolute', left: '11px', top: '5px', bottom: '5px', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>

                        {research && research.litigation && research.litigation.map((lit, i) => (
                            <TimelineItem key={i} date="Recent" title={lit.title} desc={lit.desc} color="var(--status-danger)" />
                        ))}

                        {!research && (
                            <>
                                <TimelineItem date="Oct 2023" title="NCLT Sec 9 Petition" desc="Filed by Gamma Materials for ₹2.4 Cr dues." color="var(--status-danger)" />
                                <TimelineItem date="Aug 2023" title="High Court Summons" desc="EPF misappropriation case initiated." color="var(--status-warning)" />
                                <TimelineItem date="Mar 2023" title="GST Audit Notice" desc="Dept raised queries on Q3 ITC claims." color="var(--status-warning)" />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Key Financial Indicators</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Revenue (FY24)</span><span>{kpis.totalRevenue}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>EBITDA</span><span>{kpis.ebitdaMargin}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Total Outst. Debt</span><span>{kpis.totalDebt}</span></div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>DSCR (Projected)</span><span style={{ color: 'var(--status-danger)', fontWeight: 600 }}>0.85x</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>External Environment</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Sector Outlook</span><span style={{ color: research?.sectorOutlook?.trend === 'Negative' ? 'var(--status-danger)' : 'var(--text-primary)' }}>{research?.sectorOutlook?.trend || 'Negative'}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>News Sentiment</span><span>{research?.sentimentData?.[0]?.score ? `${research.sentimentData[0].score}/100` : '40/100 (Deteriorating)'}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Regulatory Risk</span><span>Moderate</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TimelineItem({ date, title, desc, color }) {
    return (
        <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-panel)', border: `2px solid ${color}`, zIndex: 2, flexShrink: 0 }}></div>
            <div style={{ paddingTop: '2px' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: color, fontWeight: 600 }}>{date}</p>
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{desc}</p>
            </div>
        </div>
    );
}
