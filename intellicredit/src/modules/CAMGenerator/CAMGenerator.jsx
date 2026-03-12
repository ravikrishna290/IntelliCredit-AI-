import { FileSignature, Download, Printer, Share2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function CAMGenerator() {
    const { currentBorrower, globalAIState } = useAppContext();

    const recommendation = globalAIState?.recommendation || {
        decision: 'REJECT',
        requestedLimit: '₹45.0 Cr',
        suggestedRate: 'N/A',
        covenants: 'Standard financial covenants apply.',
        reasoning: 'The proposal is to reject the requested working capital limit. While the company possesses strong physical collateral, AI-driven analysis reveals severe anomalies indicative of circular trading.'
    };
    const reconciliation = globalAIState?.crossAnalysis?.reconciliation || {
        gstr1: 45.2, bankInflow: 31.8, variance: '₹13.4 Cr',
        aiInsight: 'A detailed gap analysis identified a 29.6% variance between GSTR-1 declared turnover and actual banking inflows. ₹12.5 Cr in transactions mapped directly between related-party shell entities — consistent with circular trading.'
    };
    const research = globalAIState?.researchAgent || {
        sectorOutlook: { desc: 'Major credit rating agencies have downgraded the sector outlook to Negative due to raw material price volatility.' },
        litigation: [{ desc: 'Active IBC Section 9 petition filed by Gamma Materials in the NCLT.' }]
    };
    const riskScoring = globalAIState?.riskScoring || { finalRating: 'C', overallScore: 55, dimensions: [] };
    const explainableAi = globalAIState?.explainableAi || { shapValues: [], auditTrail: [] };
    const docKpis = globalAIState?.documentIntelligence?.kpis || {};

    // ── SWOT derivation from AI state ────────────────────────────────────────
    const swot = deriveSwot(globalAIState, riskScoring, docKpis);

    // ── Actual PDF download using browser print ───────────────────────────────
    const handleExportPDF = () => {
        const camDiv = document.getElementById('cam-printable');
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        printWindow.document.write(`
            <html><head><title>Credit Appraisal Memo - ${currentBorrower.name}</title>
            <style>
                body { font-family: 'Times New Roman', serif; margin: 2cm; color: #1a1a1a; font-size: 12pt; }
                h1 { text-align: center; font-size: 18pt; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                h2 { font-size: 14pt; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 20px; }
                h3 { font-size: 12pt; margin: 12px 0 4px; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11pt; }
                th { background: #f0f0f0; text-align: left; padding: 6px 8px; border: 1px solid #ddd; }
                td { padding: 6px 8px; border: 1px solid #ddd; }
                .approve { color: #15803d; font-weight: bold; }
                .reject  { color: #B91C1C; font-weight: bold; }
                .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
                .swot-box { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
                .swot-box h3 { margin: 0 0 6px; font-size: 11pt; }
                .swot-box ul { margin: 0; padding-left: 18px; }
                .sign-row { display: flex; justify-content: space-between; margin-top: 60px; }
                .sign-box { width: 200px; text-align: center; border-top: 1px solid #000; padding-top: 6px; font-size: 10pt; }
                p { line-height: 1.6; }
                li { margin-bottom: 4px; }
            </style></head><body>
            ${camDiv.innerHTML}
            </body></html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };

    const decisionColor = recommendation.decision?.includes('APPROVE') ? '#15803d' : '#B91C1C';

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileSignature size={24} color="var(--accent-secondary)" />
                        Credit Appraisal Memo Generator
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>Automated CAM — AI-generated, ready to print or export.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => window.print()}>
                        <Printer size={16} /> Print
                    </button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={handleExportPDF}>
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ flex: 1, padding: '3rem', background: '#ffffff', color: '#1a1a1a', overflowY: 'auto' }}>
                <div id="cam-printable" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Times New Roman, serif' }}>

                    {/* Header */}
                    <h1 style={{ textAlign: 'center', fontSize: '1.8rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
                        Credit Appraisal Memo
                    </h1>
                    <p style={{ textAlign: 'center', color: '#666', fontFamily: 'sans-serif', margin: '0 0 2rem' }}>Confidential — Internal Use Only</p>

                    {/* Metadata Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontFamily: 'sans-serif', fontSize: '0.9rem' }}>
                        <tbody>
                            <tr>
                                <th style={thStyle}>Borrower Name</th><td style={tdStyle}><b>{currentBorrower.name}</b></td>
                                <th style={thStyle}>Date</th><td style={tdStyle}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Industry / Sector</th><td style={tdStyle}>{currentBorrower.industry}</td>
                                <th style={thStyle}>AI Analyst</th><td style={tdStyle}>IntelliCredit AI Engine v2.0</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Limit Requested</th><td style={tdStyle}><b>{recommendation.requestedLimit}</b></td>
                                <th style={thStyle}>Recommendation</th>
                                <td style={{ ...tdStyle, fontWeight: 'bold', color: decisionColor }}>{recommendation.decision}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Suggested Rate</th><td style={tdStyle}>{recommendation.suggestedRate || 'N/A'}</td>
                                <th style={thStyle}>AI Rating</th>
                                <td style={{ ...tdStyle, fontWeight: 'bold', color: decisionColor }}>{riskScoring.finalRating} ({riskScoring.overallScore}/100)</td>
                            </tr>
                        </tbody>
                    </table>

                    <Section title="1. Executive Summary">
                        <p style={{ lineHeight: 1.7 }}>{recommendation.reasoning}</p>
                    </Section>

                    <Section title="2. Key Financial KPIs">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    <th style={thStyle}>Metric</th><th style={thStyle}>Value</th><th style={thStyle}>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: 'Total Revenue / Deposits', value: docKpis.totalRevenue, trend: docKpis.revenueTrend },
                                    { label: 'EBITDA Margin', value: docKpis.ebitdaMargin, trend: docKpis.ebitdaTrend },
                                    { label: 'Total Debt', value: docKpis.totalDebt, trend: docKpis.debtTrend },
                                    { label: 'Working Capital Cycle', value: docKpis.workingCap, trend: docKpis.workingCapTrend },
                                ].map((r, i) => r.value ? (
                                    <tr key={i}><td style={tdStyle}>{r.label}</td><td style={tdStyle}>{r.value}</td><td style={tdStyle}>{r.trend || '—'}</td></tr>
                                ) : null)}
                            </tbody>
                        </table>
                    </Section>

                    <Section title="3. GST & Bank Statement Reconciliation">
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            <tbody>
                                <tr><th style={thStyle}>GSTR-1 Declared Revenue</th><td style={tdStyle}>₹{reconciliation.gstr1} Cr</td></tr>
                                <tr><th style={thStyle}>Actual Banking Inflows</th><td style={tdStyle}>₹{reconciliation.bankInflow} Cr</td></tr>
                                <tr><th style={{ ...thStyle, color: '#B91C1C' }}>Unexplained Variance</th><td style={{ ...tdStyle, color: '#B91C1C', fontWeight: 'bold' }}>{reconciliation.variance}</td></tr>
                            </tbody>
                        </table>
                        <p style={{ lineHeight: 1.7 }}><b>AI Insight:</b> {reconciliation.aiInsight}</p>
                    </Section>

                    <Section title="4. Five Cs of Credit Assessment">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead><tr style={{ background: '#f5f5f5' }}>
                                <th style={thStyle}>Dimension</th><th style={thStyle}>Score</th><th style={thStyle}>Assessment</th>
                            </tr></thead>
                            <tbody>
                                {riskScoring.dimensions?.map((d, i) => (
                                    <tr key={i}>
                                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>{d.name}</td>
                                        <td style={tdStyle}>{d.score}/100</td>
                                        <td style={tdStyle}>{d.text}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Section>

                    <Section title="5. SWOT Analysis">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {[
                                { label: 'Strengths ✅', items: swot.strengths, color: '#15803d' },
                                { label: 'Weaknesses ⚠️', items: swot.weaknesses, color: '#B45309' },
                                { label: 'Opportunities 🚀', items: swot.opportunities, color: '#1D4ED8' },
                                { label: 'Threats ❌', items: swot.threats, color: '#B91C1C' },
                            ].map(({ label, items, color }) => (
                                <div key={label} style={{ border: '1px solid #ddd', borderRadius: 4, padding: '0.75rem' }}>
                                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color }}>{label}</h3>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                        {items.map((it, i) => <li key={i}>{it}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="6. Legal & Environmental Risk">
                        <ul style={{ lineHeight: 1.7, paddingLeft: '1.5rem', margin: '0 0 1rem' }}>
                            {research.litigation?.map((lit, i) => <li key={i}>{lit.desc || lit.title}</li>)}
                        </ul>
                        <p style={{ lineHeight: 1.7 }}><b>Sector Outlook ({research.sectorOutlook?.trend}):</b> {research.sectorOutlook?.desc}</p>
                    </Section>

                    <Section title="7. Explainable AI — Decision Drivers">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead><tr style={{ background: '#f5f5f5' }}>
                                <th style={thStyle}>Feature</th><th style={thStyle}>Impact on Score</th>
                            </tr></thead>
                            <tbody>
                                {explainableAi.shapValues?.map((s, i) => (
                                    <tr key={i}>
                                        <td style={tdStyle}>{s.feature}</td>
                                        <td style={{ ...tdStyle, color: s.impact < 0 ? '#B91C1C' : '#15803d', fontWeight: 'bold' }}>
                                            {s.impact > 0 ? '+' : ''}{s.impact}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recommendation.covenants && (
                            <p style={{ marginTop: '1rem', lineHeight: 1.7 }}><b>Recommended Covenants:</b> {recommendation.covenants}</p>
                        )}
                    </Section>

                    {/* Signature */}
                    <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between', fontFamily: 'sans-serif' }}>
                        <div style={{ width: '230px', borderTop: '1px solid #000', paddingTop: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}>Prepared by IntelliCredit AI Engine</div>
                        <div style={{ width: '230px', borderTop: '1px solid #000', paddingTop: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}>Credit Manager Approval</div>
                        <div style={{ width: '230px', borderTop: '1px solid #000', paddingTop: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}>Senior Sanctioning Authority</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Helper styles ─────────────────────────────────────────────────────────────
const thStyle = { textAlign: 'left', padding: '0.5rem 0.75rem', border: '1px solid #ddd', background: '#f5f5f5', fontFamily: 'sans-serif', fontSize: '0.85rem', width: '25%' };
const tdStyle = { padding: '0.5rem 0.75rem', border: '1px solid #ddd', fontFamily: 'sans-serif', fontSize: '0.85rem' };

function Section({ title, children }) {
    return (
        <>
            <h2 style={{ textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '0.25rem', marginTop: '2rem', fontSize: '1rem', letterSpacing: '0.05em' }}>{title}</h2>
            {children}
        </>
    );
}

// ── SWOT deriver — uses AI state to generate context-aware SWOT ───────────────
function deriveSwot(aiState, riskScoring, kpis) {
    const collateralDim = riskScoring?.dimensions?.find(d => d.name === 'Collateral');
    const capacityDim = riskScoring?.dimensions?.find(d => d.name === 'Capacity');
    const charDim = riskScoring?.dimensions?.find(d => d.name === 'Character');

    const strengths = [];
    const weaknesses = [];
    const opportunities = [];
    const threats = [];

    if (collateralDim?.score >= 70) strengths.push(`Strong collateral backing — ${collateralDim.evidence?.[0] || 'adequate asset cover'}`);
    if (kpis.totalRevenue) strengths.push(`Verified revenue / deposit flow: ${kpis.totalRevenue}`);
    if (aiState?.researchAgent?.radarData?.find(r => r.subject === 'Regulatory Compliance')?.A >= 70)
        strengths.push('Strong GST and regulatory compliance history');

    if (capacityDim?.score < 60) weaknesses.push(capacityDim.text || 'Debt servicing capacity under stress');
    if (charDim?.score < 60) weaknesses.push(charDim.text || 'Promoter character concerns noted');
    const variance = aiState?.crossAnalysis?.reconciliation?.variance;
    if (variance) weaknesses.push(`GST vs Bank variance of ${variance} — possible revenue inflation`);
    const litigation = aiState?.researchAgent?.litigation || [];
    if (litigation.length > 0) weaknesses.push(`${litigation.length} active legal dispute(s) pending`);

    const sectorTrend = aiState?.researchAgent?.sectorOutlook?.trend;
    if (sectorTrend === 'Positive') {
        opportunities.push('Favorable sector tailwinds support future revenue growth');
    } else {
        opportunities.push('Opportunity to restructure working capital and reduce cycle time');
    }
    opportunities.push('Potential to leverage GST compliance for CIBIL Commercial score improvement');
    opportunities.push('RBI priority sector lending incentives if classified as MSME');

    threats.push('Circular trading pattern risk if related-party transactions continue unmonitored');
    if (sectorTrend === 'Negative') threats.push(`Sector under negative outlook from major rating agencies (CRISIL/ICRA)`);
    threats.push('Rising input cost pressures and supply-chain disruptions in current macro environment');
    if (litigation.length > 0) threats.push('IBC petition risk could trigger cross-default on existing facilities');

    return {
        strengths: strengths.length ? strengths : ['Positive operating history', 'Established banking relationship'],
        weaknesses: weaknesses.length ? weaknesses : ['Limited financial disclosures available', 'Working capital cycle elevated'],
        opportunities: opportunities,
        threats: threats,
    };
}
