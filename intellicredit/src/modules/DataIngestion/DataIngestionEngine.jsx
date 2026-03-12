import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UploadCloud, FileType2, CheckCircle2, Loader2,
    Database, ShieldCheck, AlertCircle, Plus, X, Zap, ChevronRight, Bot, User
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

// Auto-generate smart schema fields per document type
function getAutoSchema(docType) {
    const t = docType.toLowerCase();
    if (t.includes('bank')) return [
        { id: 1, key: 'totalDeposits', type: 'Number', desc: 'Total deposits / credits for the period' },
        { id: 2, key: 'totalWithdrawals', type: 'Number', desc: 'Total withdrawals / debits for the period' },
        { id: 3, key: 'closingBalance', type: 'Number', desc: 'Closing account balance' },
    ];
    if (t.includes('gst') || t.includes('gstr')) return [
        { id: 1, key: 'totalTaxableValue', type: 'Number', desc: 'Total taxable turnover declared' },
        { id: 2, key: 'itcClaimed', type: 'Number', desc: 'Input Tax Credit claimed in GSTR-3B' },
        { id: 3, key: 'taxLiability', type: 'Number', desc: 'Net GST liability after ITC' },
    ];
    if (t.includes('p&l') || t.includes('profit')) return [
        { id: 1, key: 'revenue', type: 'Number', desc: 'Total revenue from operations' },
        { id: 2, key: 'ebitda', type: 'Number', desc: 'EBITDA (Earnings before interest, tax, depreciation)' },
        { id: 3, key: 'netProfit', type: 'Number', desc: 'Profit after tax (PAT)' },
    ];
    if (t.includes('alm') || t.includes('asset-liability')) return [
        { id: 1, key: 'totalAssets', type: 'Number', desc: 'Total assets' },
        { id: 2, key: 'totalLiabilities', type: 'Number', desc: 'Total liabilities' },
        { id: 3, key: 'liquidityGap', type: 'Number', desc: 'Net liquidity gap in near-term buckets' },
    ];
    if (t.includes('shareholding')) return [
        { id: 1, key: 'promoterHolding', type: 'Number', desc: 'Promoter shareholding percentage' },
        { id: 2, key: 'publicHolding', type: 'Number', desc: 'Public / institutional holding percentage' },
        { id: 3, key: 'pledgedShares', type: 'Number', desc: 'Percentage of promoter shares pledged' },
    ];
    // Default / annual report
    return [
        { id: 1, key: 'revenue', type: 'Number', desc: 'Total revenue / turnover' },
        { id: 2, key: 'ebitda', type: 'Number', desc: 'EBITDA margin' },
        { id: 3, key: 'totalDebt', type: 'Number', desc: 'Total debt / borrowings' },
    ];
}

const DOC_TYPES = [
    'Bank Statement',
    'Audited Financials (Annual Report)',
    'Profit & Loss Statement',
    'Balance Sheet',
    'Cash Flow Statement',
    'GST Return (GSTR-3B / GSTR-1)',
    'Income Tax Return (ITR)',
    'Shareholding Pattern',
    'Borrowing Profile / Debt Schedule',
    'Asset-Liability Management (ALM) Report',
    'Portfolio Cuts / Performance Data',
];

const STEPS = ['upload', 'classifying', 'review', 'schema', 'extracting', 'done', 'error'];

export default function DataIngestionEngine() {
    const { setGlobalAIState, setCurrentBorrower } = useAppContext();

    const [autoMode, setAutoMode] = useState(false);
    const [step, setStep] = useState('upload');
    const [fileName, setFileName] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const [fileObj, setFileObj] = useState(null);
    const [classification, setClassification] = useState({ predictedType: '', confidence: 0, briefReason: '' });
    const [approvedType, setApprovedType] = useState('');
    const [schemaFields, setSchemaFields] = useState([
        { id: 1, key: 'netCashFlow', type: 'Number', desc: 'Net cash inflow / outflow for the period' },
    ]);
    const [extractedKPIs, setExtractedKPIs] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    const reset = () => {
        setStep('upload'); setFileName(''); setStatusMsg(''); setFileObj(null);
        setClassification({ predictedType: '', confidence: 0, briefReason: '' });
        setApprovedType(''); setExtractedKPIs(null); setErrorMsg('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleError = (msg) => { setErrorMsg(msg); setStep('error'); };

    // ── Step 1: Upload → Classify ─────────────────────────────────────────────
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileObj(file);
        setFileName(file.name);
        setStep('classifying');
        setStatusMsg('AI is identifying document type…');

        const form = new FormData();
        form.append('document', file);
        try {
            const res = await fetch('http://localhost:5000/api/classify-document', { method: 'POST', body: form });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Classification failed');
            const cls = data.classification;
            setClassification(cls);
            setApprovedType(cls.predictedType);

            if (autoMode) {
                // Auto mode: skip HITL & schema — use smart defaults straight to extraction
                const autoSchema = getAutoSchema(cls.predictedType);
                setSchemaFields(autoSchema);
                setStep('review');          // briefly flash review step
                await new Promise(r => setTimeout(r, 800));
                setStep('schema');          // briefly flash schema step
                await new Promise(r => setTimeout(r, 600));
                await runExtraction(file, cls.predictedType, autoSchema);
            } else {
                setStep('review');
            }
        } catch (err) {
            handleError(`Classification failed: ${err.message}`);
        }
    };

    // ── Step 2: Approve classification → Schema ─────────────────────────────
    const handleApprove = () => setStep('schema');

    // ── Core extraction (shared by manual and auto mode) ────────────────────
    const runExtraction = async (file, docType, fields) => {
        setStep('extracting');
        setStatusMsg(`Extracting data from ${docType}…`);
        const form = new FormData();
        form.append('document', file);
        form.append('documentType', docType);
        form.append('dynamicSchema', JSON.stringify(
            fields.map(f => ({ key: f.key, type: f.type, instruction: f.desc }))
        ));
        try {
            const res = await fetch('http://localhost:5000/api/analyze-document', { method: 'POST', body: form });
            if (res.status === 422) { const d = await res.json(); throw new Error(d.message || 'No readable content in document.'); }
            if (!res.ok) throw new Error(`Server error (${res.status})`);
            const data = await res.json();
            if (data.globalState) {
                setGlobalAIState(data.globalState);
                setExtractedKPIs(data.globalState.documentIntelligence?.kpis || {});
                setCurrentBorrower(prev => ({
                    ...prev,
                    name: data.globalState.companyName || prev.name,
                    industry: data.globalState.industry || prev.industry,
                }));
            }
            setStep('done');
        } catch (err) { handleError(err.message); }
    };

    // ── Manual mode: Schema → Extract button ──────────────────────────────
    const handleExtract = () => runExtraction(fileObj, approvedType, schemaFields);

    // ── Schema helpers ────────────────────────────────────────────────────────
    const addField = () => setSchemaFields(f => [...f, { id: Date.now(), key: '', type: 'String', desc: '' }]);
    const removeField = (id) => setSchemaFields(f => f.filter(x => x.id !== id));
    const updateField = (id, k, v) => setSchemaFields(f => f.map(x => x.id === id ? { ...x, [k]: v } : x));

    const pipelineStatus = (label) => {
        const order = { upload: 0, classifying: 1, review: 2, schema: 3, extracting: 4, done: 5, error: 5 };
        const cur = order[step] ?? 0;
        const steps = {
            'Intake': 0,
            'Classification': 1,
            'Schema Config': 2,
            'AI Extraction': 3,
        };
        const idx = steps[label] ?? 0;
        if (cur > idx) return 'done';
        if (cur === idx && !['upload', 'review', 'schema'].includes(step)) return 'active';
        if (step === 'review' && label === 'Classification') return 'done';
        if (step === 'schema' && label === 'Schema Config') return 'active';
        if (step === 'extracting' && label === 'AI Extraction') return 'active';
        return cur > idx ? 'done' : 'pending';
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Data Ingestion Engine</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        {autoMode
                            ? '⚡ Auto Mode — upload and extraction happens automatically'
                            : '👤 Manual Mode — AI classifies, you review & configure schema'}
                    </p>
                </div>
                {/* Auto / Manual toggle */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 30, padding: '0.25rem', border: '1px solid rgba(255,255,255,0.1)', gap: '0.25rem' }}>
                    <button onClick={() => setAutoMode(false)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: 24, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
                            background: !autoMode ? 'rgba(0,229,255,0.15)' : 'transparent',
                            color: !autoMode ? 'var(--accent-primary)' : 'var(--text-muted)'
                        }}>
                        <User size={14} /> Manual (HITL)
                    </button>
                    <button onClick={() => setAutoMode(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: 24, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
                            background: autoMode ? 'rgba(0,230,118,0.15)' : 'transparent',
                            color: autoMode ? 'var(--status-success)' : 'var(--text-muted)'
                        }}>
                        <Bot size={14} /> Auto Mode
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>

                {/* ── Left Panel ─────────────────────────────────────────── */}
                <div className="glass-panel" style={{
                    flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem',
                    border: step === 'done' ? '2px solid rgba(0,230,118,0.3)'
                        : ['classifying', 'extracting'].includes(step) ? '2px solid rgba(0,229,255,0.3)'
                            : step === 'error' ? '2px solid rgba(255,82,82,0.3)'
                                : '2px dashed rgba(255,255,255,0.1)',
                    transition: 'border-color 0.4s', cursor: step === 'upload' ? 'pointer' : 'default',
                    alignItems: 'center', justifyContent: 'center'
                }} onClick={step === 'upload' ? () => fileInputRef.current?.click() : undefined}>

                    <input type="file" ref={fileInputRef} style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg" />

                    <AnimatePresence mode="wait">

                        {/* UPLOAD */}
                        {step === 'upload' && (
                            <motion.div key="upload"
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
                                    style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(0,229,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <UploadCloud size={44} color="var(--accent-primary)" />
                                </motion.div>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Drop or Click to Upload</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: 360, marginBottom: '1.5rem' }}>
                                    ALM, Shareholding Pattern, Borrowing Profile, Annual Reports, Portfolio Cuts — PDF, Excel, CSV, Image
                                </p>
                                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}>
                                    <FileType2 size={18} /> Browse Files
                                </button>
                            </motion.div>
                        )}

                        {/* CLASSIFYING */}
                        {step === 'classifying' && (
                            <motion.div key="classifying"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                                    style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,229,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={40} color="var(--accent-primary)" />
                                </motion.div>
                                <h3>Analysing Document…</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{fileName}</p>
                            </motion.div>
                        )}

                        {/* REVIEW — HITL */}
                        {step === 'review' && (
                            <motion.div key="review"
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{ width: '100%', maxWidth: 520 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(0,229,255,0.1)', borderRadius: 10, color: 'var(--accent-primary)' }}>
                                        <AlertCircle size={28} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Human-in-the-Loop Review</h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verify AI classification before extraction begins</p>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
                                    <Row label="File" value={fileName} />
                                    <Row label="Predicted Type" value={classification.predictedType} highlight />
                                    <Row label="Confidence" value={`${classification.confidence}%`} />
                                    <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                                        <span style={{ color: 'var(--accent-secondary)' }}>AI Reasoning: </span>{classification.briefReason}
                                    </p>
                                </div>

                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Override document type if needed:</p>
                                <select className="chart-select" style={{ width: '100%', marginBottom: '1.25rem' }}
                                    value={approvedType} onChange={e => setApprovedType(e.target.value)}>
                                    {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button onClick={reset} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <button className="btn-primary" onClick={handleApprove} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <ShieldCheck size={16} /> Approve & Configure Schema <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* SCHEMA BUILDER */}
                        {step === 'schema' && (
                            <motion.div key="schema"
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{ width: '100%', maxWidth: 560 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(139,92,246,0.12)', borderRadius: 10, color: 'var(--accent-secondary)' }}>
                                        <Database size={26} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Dynamic Schema Builder</h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            Define custom fields to extract from this <strong style={{ color: 'var(--text-primary)' }}>{approvedType}</strong>
                                        </p>
                                    </div>
                                </div>

                                <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem', paddingRight: '0.25rem' }}>
                                    {schemaFields.map(field => (
                                        <div key={field.id} style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 8, alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input type="text" placeholder="JSON key (e.g. netProfit)"
                                                        style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', padding: '0.4rem 0.65rem', borderRadius: 5, fontSize: '0.8rem' }}
                                                        value={field.key} onChange={e => updateField(field.id, 'key', e.target.value)} />
                                                    <select style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', padding: '0.4rem', borderRadius: 5, fontSize: '0.8rem' }}
                                                        value={field.type} onChange={e => updateField(field.id, 'type', e.target.value)}>
                                                        {['String', 'Number', 'Boolean', 'Array'].map(t => <option key={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                                <input type="text" placeholder="Extraction instruction (e.g. Find net profit after tax)"
                                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', padding: '0.4rem 0.65rem', borderRadius: 5, fontSize: '0.8rem' }}
                                                    value={field.desc} onChange={e => updateField(field.id, 'desc', e.target.value)} />
                                            </div>
                                            <button onClick={() => removeField(field.id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', padding: '0.2rem', marginTop: '0.2rem' }}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}

                                    <button onClick={addField} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--border-color)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                        <Plus size={15} /> Add Custom Field
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button onClick={() => setStep('review')} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        ← Back
                                    </button>
                                    <button className="btn-primary" onClick={handleExtract} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Zap size={16} /> Start AI Extraction
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* EXTRACTING */}
                        {step === 'extracting' && (
                            <motion.div key="extracting"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                                    style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Database size={40} color="var(--accent-secondary)" />
                                </motion.div>
                                <h3>Extracting Intelligence…</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{statusMsg}</p>
                            </motion.div>
                        )}

                        {/* DONE */}
                        {step === 'done' && (
                            <motion.div key="done"
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem', width: '100%' }}>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                                    style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,230,118,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle2 size={44} color="var(--status-success)" />
                                </motion.div>
                                <h3 style={{ color: 'var(--status-success)' }}>Extraction Complete</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Processed as: <strong style={{ color: 'var(--text-primary)' }}>{approvedType}</strong>
                                </p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All modules have been updated with the extracted data.</p>
                                <button className="btn-secondary" onClick={reset} style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                    Upload Another Document
                                </button>
                            </motion.div>
                        )}

                        {/* ERROR */}
                        {step === 'error' && (
                            <motion.div key="error"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,82,82,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UploadCloud size={44} color="var(--status-danger)" />
                                </div>
                                <h3 style={{ color: 'var(--status-danger)' }}>Upload Failed</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 340 }}>{errorMsg}</p>
                                <button className="btn-primary" onClick={reset}>Try Again</button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* ── Right Panel — Pipeline + KPIs ──────────────────────── */}
                <div className="glass-panel" style={{ width: 320, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Database size={16} color="var(--accent-secondary)" /> AI Processing Pipeline
                    </h3>

                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 15, top: 20, bottom: 0, width: 2, background: 'rgba(255,255,255,0.05)' }} />
                        {[
                            { label: 'Intake', icon: <UploadCloud size={14} />, key: 'Intake' },
                            { label: 'Classification', icon: <ShieldCheck size={14} />, key: 'Classification' },
                            { label: 'Schema Config', icon: <Database size={14} />, key: 'Schema Config' },
                            { label: 'AI Extraction', icon: <FileType2 size={14} />, key: 'AI Extraction' },
                        ].map(({ label, icon, key }, i, arr) => (
                            <PipelineStep key={key} icon={icon} title={label}
                                status={pipelineStatus(key)} isLast={i === arr.length - 1} />
                        ))}
                    </div>

                    {/* Extracted KPIs */}
                    <AnimatePresence>
                        {step === 'done' && extractedKPIs && (
                            <motion.div key="kpis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Extracted KPIs</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    {[
                                        { label: 'Revenue', value: extractedKPIs.totalRevenue },
                                        { label: 'EBITDA', value: extractedKPIs.ebitdaMargin },
                                        { label: 'Total Debt', value: extractedKPIs.totalDebt },
                                        { label: 'Working Cap', value: extractedKPIs.workingCap },
                                    ].filter(k => k.value).map(kpi => (
                                        <div key={kpi.label} style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.1)', padding: '0.55rem 0.7rem', borderRadius: 8 }}>
                                            <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</p>
                                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{kpi.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Row({ label, value, highlight }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{label}</span>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: highlight ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}

function PipelineStep({ icon, title, status, isLast }) {
    const color = status === 'active' ? 'var(--accent-primary)'
        : status === 'done' ? 'var(--status-success)'
            : 'rgba(255,255,255,0.18)';
    return (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: isLast ? 0 : '1.75rem', position: 'relative', zIndex: 1 }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                background: status === 'active' ? 'rgba(0,229,255,0.1)' : status === 'done' ? 'rgba(0,230,118,0.08)' : 'var(--bg-surface)',
                border: `2px solid ${color}`
            }}>
                {status === 'active'
                    ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}><Loader2 size={14} /></motion.div>
                    : icon}
            </div>
            <div style={{ paddingTop: 5 }}>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '0.88rem', color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{title}</p>
                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {status === 'active' ? 'Processing…' : status === 'done' ? '✓ Complete' : 'Waiting…'}
                </p>
            </div>
        </div>
    );
}
