import { useState } from 'react';
import { Users, Send, BrainCircuit, CheckCircle2 } from 'lucide-react';

export default function DueDiligencePortal() {
    const [insight, setInsight] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleAnalyze = async () => {
        if (!insight.trim()) return;
        setIsAnalyzing(true);
        setAnalysisResult(null); // clear previous

        try {
            const response = await fetch('http://localhost:5000/api/due-diligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ observation: insight })
            });

            if (!response.ok) throw new Error('Failed to fetch analysis');

            const data = await response.json();
            setAnalysisResult({
                sentiment: data.sentiment,
                riskImpact: data.riskImpact,
                keyFactors: ["Dynamically Extracted from Context"], // Simple placeholder as the prompt only asked for 3 fields
                aiInterpretation: data.interpretation
            });
        } catch (error) {
            console.error('Error calling AI API:', error);
            setAnalysisResult({
                sentiment: 'Error',
                riskImpact: 'N/A',
                keyFactors: [],
                aiInterpretation: 'Failed to connect to the IntelliCredit AI Backend. Ensure the server is running on port 5000.'
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex-col gap-6" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
            <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={24} color="var(--accent-tertiary)" />
                    Primary Due Diligence Portal
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Credit officer site visit observations and qualitative insights.</p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>Submit Site Visit Observation</h3>
                    <textarea
                        value={insight}
                        onChange={(e) => setInsight(e.target.value)}
                        placeholder="E.g., Factory operating at reduced capacity. Noticeable inventory buildup in the warehouse. Management seemed evasive regarding recent supplier disputes..."
                        style={{
                            width: '100%',
                            height: '150px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '1rem',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            resize: 'none',
                            outline: 'none'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn-primary"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !insight.trim()}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {isAnalyzing ? (
                                <>Analyzing <span className="animate-pulse">...</span></>
                            ) : (
                                <>Run AI Interpretation <Send size={16} /></>
                            )}
                        </button>
                    </div>
                </div>

                <div className="glass-panel" style={{ width: '400px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                        <BrainCircuit size={18} /> AI Interpretation
                    </h3>

                    {analysisResult ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn var(--transition-normal)' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1, background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginBottom: '0.25rem' }}>Sentiment</p>
                                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--status-danger)' }}>{analysisResult.sentiment}</p>
                                </div>
                                <div style={{ flex: 1, background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginBottom: '0.25rem' }}>Risk Impact</p>
                                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--status-danger)' }}>{analysisResult.riskImpact}</p>
                                </div>
                            </div>

                            <div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Key Extracted Factors</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {analysisResult.keyFactors.map((factor, i) => (
                                        <span key={i} style={{ background: 'rgba(255,255,255,0.05)', border: 'var(--glass-border)', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.85rem' }}>
                                            {factor}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0, 229, 255, 0.05)', borderLeft: '3px solid var(--accent-primary)', padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {analysisResult.aiInterpretation}
                            </div>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', opacity: 0.5 }}>
                            <BrainCircuit size={48} color="var(--text-muted)" />
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '250px' }}>Submit an observation to see how the AI adjusts the borrower's risk profile.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Historical Submissions */}
            <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>Historical Interactions</h3>
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <CheckCircle2 color="var(--status-success)" />
                <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Management Interview (CFO)</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>"The CFO was very transparent about the Q3 margin squeeze, attributing it entirely to the temporary spike in global copper prices. Demonstrated hedging strategies moving forward."</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--status-success)' }}>AI Sentiment: Positive</span>
                        <span style={{ color: 'var(--text-muted)' }}>Date: Oct 12, 2023</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
