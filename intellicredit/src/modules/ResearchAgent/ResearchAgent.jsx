import { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Globe, BookOpen, AlertCircle, TrendingDown, RefreshCw, Building, CreditCard, FileCheck, Newspaper } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const mockRadarData = [
    { subject: 'Financial Stability', A: 85, fullMark: 100 },
    { subject: 'Market Sentiment', A: 45, fullMark: 100 },
    { subject: 'Promoter Reputation', A: 60, fullMark: 100 },
    { subject: 'Regulatory Compliance', A: 90, fullMark: 100 },
    { subject: 'Litigation Risk', A: 30, fullMark: 100 },
    { subject: 'Sector Outlook', A: 55, fullMark: 100 },
];

export default function ResearchAgent() {
    const { globalAIState, currentBorrower } = useAppContext();
    const [isResearching, setIsResearching] = useState(false);
    const [liveResearch, setLiveResearch] = useState(null);
    const [error, setError] = useState('');

    const activeData = globalAIState?.researchAgent || { radarData: mockRadarData, sentimentData: [], litigation: [], sectorOutlook: { trend: 'Neutral', desc: 'Upload a document first to see AI-generated sector analysis.' } };
    const radarData = liveResearch?.radarData || activeData.radarData;
    const sentData = liveResearch?.sentimentData || activeData.sentimentData || [];
    const litigation = liveResearch?.litigation || activeData.litigation || [];
    const sector = liveResearch?.sectorOutlook || activeData.sectorOutlook || {};

    const runResearch = async () => {
        setIsResearching(true);
        setError('');
        try {
            const kpis = globalAIState?.documentIntelligence?.kpis || {};
            const res = await fetch('http://localhost:5000/api/research-company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: currentBorrower?.name || globalAIState?.companyName || 'Unknown Company',
                    industry: currentBorrower?.industry || globalAIState?.industry || '',
                    financialSummary: `Revenue: ${kpis.totalRevenue || 'N/A'}, EBITDA: ${kpis.ebitdaMargin || 'N/A'}, Debt: ${kpis.totalDebt || 'N/A'}`
                })
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json();
            setLiveResearch(data.research);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsResearching(false);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={24} color="var(--accent-secondary)" /> AI Research Agent
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Secondary intelligence: MCA21 · CIBIL Commercial · GSTR-2A/3B · e-Courts · News Sentiment
                    </p>
                </div>
                <button className="btn-primary" onClick={runResearch} disabled={isResearching}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                    <RefreshCw size={16} style={{ animation: isResearching ? 'spin 1s linear infinite' : 'none' }} />
                    {isResearching ? 'Researching…' : 'Run Secondary Research'}
                </button>
            </div>

            {error && <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)', borderRadius: 8, color: 'var(--status-danger)', fontSize: '0.85rem' }}>{error}</div>}

            {/* MCA + CIBIL + GST cards (shown after live research) */}
            {liveResearch && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <IntelCard icon={<Building size={18} />} title="MCA21 Status" color="var(--accent-primary)">
                        <InfoRow label="CIN Status" value={liveResearch.mcaStatus?.cinStatus} />
                        <InfoRow label="Last ROC Filing" value={liveResearch.mcaStatus?.lastFilingDate} />
                        <InfoRow label="Charges" value={liveResearch.mcaStatus?.chargesRegistered} />
                        {liveResearch.mcaStatus?.directorFlags?.map((f, i) => (
                            <p key={i} style={{ fontSize: '0.78rem', color: 'var(--status-warning)', margin: '0.25rem 0' }}>⚠ {f}</p>
                        ))}
                    </IntelCard>

                    <IntelCard icon={<CreditCard size={18} />} title="CIBIL Commercial Signal" color="var(--accent-secondary)">
                        <InfoRow label="Score Range" value={liveResearch.cibildSignal?.estimatedScore} />
                        <InfoRow label="DPD Status" value={liveResearch.cibildSignal?.dpd} />
                        <InfoRow label="Facilities" value={liveResearch.cibildSignal?.existingFacilities} />
                        {liveResearch.cibildSignal?.flags?.map((f, i) => (
                            <p key={i} style={{ fontSize: '0.78rem', color: 'var(--status-danger)', margin: '0.25rem 0' }}>🚩 {f}</p>
                        ))}
                    </IntelCard>

                    <IntelCard icon={<FileCheck size={18} />} title="GST Intelligence" color="var(--accent-tertiary)">
                        <InfoRow label="GSTR-2A vs 3B" value={liveResearch.gstIntelligence?.gstr2aVs3bGap} />
                        <InfoRow label="Missing Suppliers" value={liveResearch.gstIntelligence?.missingSuppliers} />
                        <InfoRow label="ITC Reversal Risk" value={liveResearch.gstIntelligence?.reversalRisk} />
                        {liveResearch.gstIntelligence?.circularTradingFlag && (
                            <p style={{ fontSize: '0.78rem', color: 'var(--status-danger)', margin: '0.25rem 0' }}>🚩 Circular trading flag raised</p>
                        )}
                    </IntelCard>
                </div>
            )}

            {/* Charts Row */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>External Intelligence Profile</h3>
                    <div style={{ flex: 1, minHeight: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Company" dataKey="A" stroke="var(--accent-secondary)" fill="var(--accent-secondary)" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>News Sentiment Trend (6mo)</h3>
                    <div style={{ flex: 1, minHeight: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: 'var(--glass-border)', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="score" stroke="var(--accent-tertiary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent-tertiary)' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* News + Litigation + Sector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* News Headlines */}
                {liveResearch?.newsSummary?.length > 0 && (
                    <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                            <Newspaper size={18} /> News Headlines
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {liveResearch.newsSummary.map((n, i) => (
                                <div key={i} style={{ paddingBottom: '0.75rem', borderBottom: i < liveResearch.newsSummary.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.headline}</p>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: n.sentiment === 'Positive' ? 'var(--status-success)' : n.sentiment === 'Negative' ? 'var(--status-danger)' : 'var(--text-muted)' }}>
                                        {n.sentiment} · {n.source} · {n.date}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Litigation */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--status-danger)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-danger)' }}>
                        <AlertCircle size={18} /> e-Courts Findings
                    </h3>
                    {litigation.length > 0 ? (
                        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 0 }}>
                            {litigation.map((item, i) => (
                                <li key={i}><strong style={{ color: 'var(--text-primary)' }}>{item.title}:</strong> {item.desc}</li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active litigation findings. Click "Run Secondary Research" to query e-Courts.</p>
                    )}
                </div>

                {/* Sector Outlook */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--status-warning)', gridColumn: liveResearch?.newsSummary?.length > 0 ? '1 / -1' : '2' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-warning)' }}>
                        <TrendingDown size={18} /> Sector Outlook: {sector.trend || 'Neutral'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                        {sector.desc || 'Upload a document and run secondary research to see CRISIL/ICRA sector intelligence.'}
                    </p>
                </div>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function IntelCard({ icon, title, color, children }) {
    return (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {icon} {title}
            </h3>
            {children}
        </div>
    );
}

function InfoRow({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{label}</span>
            <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
        </div>
    );
}
