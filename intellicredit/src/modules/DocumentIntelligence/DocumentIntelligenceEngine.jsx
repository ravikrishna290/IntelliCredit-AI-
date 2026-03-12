import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { IndianRupee, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const revenueData = [
    { year: 'FY21', revenue: 120, ebitda: 18 },
    { year: 'FY22', revenue: 155, ebitda: 24 },
    { year: 'FY23', revenue: 198, ebitda: 31 },
    { year: 'FY24', revenue: 245, ebitda: 42 },
];

const debtData = [
    { month: 'Apr', st_debt: 45, lt_debt: 120 },
    { month: 'Jun', st_debt: 50, lt_debt: 115 },
    { month: 'Sep', st_debt: 42, lt_debt: 110 },
    { month: 'Dec', st_debt: 38, lt_debt: 105 },
    { month: 'Mar', st_debt: 55, lt_debt: 100 },
];

const mockKpis = {
    totalRevenue: "₹245.0 Cr", revenueTrend: "+23.7%", revenuePositive: true,
    ebitdaMargin: "17.1%", ebitdaTrend: "+1.2%", ebitdaPositive: true,
    totalDebt: "₹155.0 Cr", debtTrend: "-8.5%", debtPositive: true,
    workingCap: "84 Days", workingCapTrend: "+12 Days", workingCapPositive: false
};

const mockEntities = [
    { metric: 'Contingent Liabilities', value: '₹12.4 Cr', source: 'Audited Financials FY24 (Note 14)', conf: '98%' },
    { metric: 'Promoter Shareholding', value: '62.5%', source: 'MCA Shareholding Disclosures', conf: '100%' },
    { metric: 'Related Party Txns', value: '₹4.2 Cr', source: 'Audited Financials FY24 (Note 32)', conf: '94%' },
    { metric: 'Pending Legal Claims', value: '₹1.8 Cr', source: 'Directors Report FY24', conf: '89%' }
];

export default function DocumentIntelligenceEngine() {
    const { globalAIState } = useAppContext();

    // Use AI generated data if available, otherwise fallback to mock
    const activeData = globalAIState?.documentIntelligence || {
        revenueData: revenueData,
        debtData: debtData,
        kpis: mockKpis,
        extractedEntities: mockEntities
    };

    return (
        <div className="flex-col gap-6" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingBottom: '2rem' }}>
            <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Document Intelligence Engine</h2>
                <p style={{ color: 'var(--text-muted)' }}>Deep extraction of financial KPIs from parsed documents.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
                <KpiCard title="Total Revenue" value={activeData.kpis.totalRevenue} trend={activeData.kpis.revenueTrend} positive={activeData.kpis.revenuePositive} icon={<IndianRupee />} />
                <KpiCard title="EBITDA Margin" value={activeData.kpis.ebitdaMargin} trend={activeData.kpis.ebitdaTrend} positive={activeData.kpis.ebitdaPositive} icon={<TrendingUp />} />
                <KpiCard title="Total Debt" value={activeData.kpis.totalDebt} trend={activeData.kpis.debtTrend} positive={activeData.kpis.debtPositive} icon={<Landmark />} />
                <KpiCard title="Working Cap Cycle" value={activeData.kpis.workingCap} trend={activeData.kpis.workingCapTrend} positive={activeData.kpis.workingCapPositive} icon={<TrendingDown />} />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', height: '350px' }}>
                {/* Revenue Trend Chart */}
                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Revenue & EBITDA Trend (Cr)</h3>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activeData.revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="year" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-panel)', border: 'var(--glass-border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Bar dataKey="revenue" name="Revenue" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="ebitda" name="EBITDA" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Debt Profile Area Chart */}
                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Debt Profile (Cr)</h3>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activeData.debtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-panel)', border: 'var(--glass-border)', borderRadius: '8px' }}
                                />
                                <Area type="monotone" dataKey="lt_debt" name="Long Term" stackId="1" stroke="var(--accent-secondary)" fillOpacity={0.6} fill="var(--accent-secondary)" />
                                <Area type="monotone" dataKey="st_debt" name="Short Term" stackId="1" stroke="var(--accent-primary)" fillOpacity={0.6} fill="var(--accent-primary)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Extracted Entities Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Key Extracted Findings</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '1rem 0', color: 'var(--text-muted)', fontWeight: 500 }}>Metric / Entity</th>
                            <th style={{ padding: '1rem 0', color: 'var(--text-muted)', fontWeight: 500 }}>Extracted Value</th>
                            <th style={{ padding: '1rem 0', color: 'var(--text-muted)', fontWeight: 500 }}>Source Document</th>
                            <th style={{ padding: '1rem 0', color: 'var(--text-muted)', fontWeight: 500 }}>Confidence</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeData.extractedEntities.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem 0', fontWeight: 500, color: 'var(--text-primary)' }}>{row.metric}</td>
                                <td style={{ padding: '1rem 0', color: 'var(--text-primary)' }}>{row.value}</td>
                                <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{row.source}</td>
                                <td style={{ padding: '1rem 0' }}>
                                    <span style={{ background: 'rgba(0, 230, 118, 0.1)', color: 'var(--status-success)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        {row.conf}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}

function KpiCard({ title, value, trend, positive, icon }) {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>{title}</p>
                <div style={{ color: 'rgba(255,255,255,0.2)' }}>{icon}</div>
            </div>
            <div>
                <h3 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700 }}>{value}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: positive ? 'var(--status-success)' : 'var(--status-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    {trend} from previous year
                </p>
            </div>
        </div>
    );
}
