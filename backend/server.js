require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const pdf = require('pdf-parse');

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Model fallback chain
const MODEL_CHAIN = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'groq:llama-3.3-70b-versatile',
  'groq:mixtral-8x7b-32768'
];
let activeModelIndex = 0;
let model = genAI.getGenerativeModel({ model: MODEL_CHAIN[0] });

console.log(`🤖 Active engine: ${MODEL_CHAIN[activeModelIndex]}`);

function switchToNextModel() {
  if (activeModelIndex < MODEL_CHAIN.length - 1) {
    activeModelIndex++;
    const nextModel = MODEL_CHAIN[activeModelIndex];
    if (!nextModel.startsWith('groq:')) {
      model = genAI.getGenerativeModel({ model: nextModel });
    }
    console.warn(`⚠️  Fallback engaged: ${nextModel}`);
    return true;
  }
  return false;
}

/**
 * Groq-specific generation. Strips/Extracts text from multi-part Gemini-style requests.
 */
async function generateGroq(genArgs) {
  const modelName = MODEL_CHAIN[activeModelIndex].replace('groq:', '');
  let prompt = '';
  
  if (typeof genArgs === 'string') {
    prompt = genArgs;
  } else if (genArgs.contents) {
    // Extract text from Gemini parts
    const parts = genArgs.contents[0].parts;
    for (const p of parts) {
      if (p.text) prompt += p.text + '\n';
      // If there's inlineData, we treat it as an unreadable binary for Groq unless we parsed it earlier
      if (p.inlineData) prompt += `[File Content provided to AI Engine]\n`;
    }
  }

  console.log(`⚡ Groq Call [${modelName}]`);
  const response = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: modelName,
    response_format: genArgs.generationConfig?.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined,
  });

  const text = response.choices[0].message.content;
  return {
    response: {
      text: () => text
    }
  };
}

// Smart wrapper: handles 429 (rate limit) by switching model, and retries
async function generateWithRetry(genArgs, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const currentModel = MODEL_CHAIN[activeModelIndex];
      if (currentModel.startsWith('groq:')) {
        return await generateGroq(genArgs);
      }
      return await model.generateContent(genArgs);
    } catch (err) {
      const is429 = err.message?.includes('429');
      const is404 = err.message?.includes('404') || err.message?.includes('not found');
      const is503 = err.message?.includes('503');
      const isQuota = err.message?.includes('quota') || err.message?.includes('limit');
      
      if ((is429 || is404 || is503 || isQuota) && attempt < maxRetries) {
        if (switchToNextModel()) {
          console.warn(`[${attempt}] Fallback to ${MODEL_CHAIN[activeModelIndex]} due to ${err.message?.slice(0, 50)}`);
          continue;
        }
        const waitSecs = attempt * 10;
        console.warn(`[FAIL] No fallbacks left. Waiting ${waitSecs}s...`);
        await new Promise(r => setTimeout(r, waitSecs * 1000));
      } else {
        throw err;
      }
    }
  }
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });


// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build Gemini content parts for a file.
 * - PDFs / images → inline base64 (Gemini reads natively, 100% accurate)
 * - CSV / XLS / XLSX → convert to readable text then pass as text part
 */
function buildFileParts(file) {
  const ext = file.originalname.split('.').pop().toLowerCase();
  const isSpreadsheet = ['csv', 'xls', 'xlsx'].includes(ext) ||
    ['text/csv', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.mimetype);

  if (isSpreadsheet) {
    // Parse spreadsheet → markdown table text for Gemini
    const text = spreadsheetToText(file);
    return [{ text: `[FILE: ${file.originalname}]\n${text}` }];
  }

  // PDF / images → inline data (Gemini Vision reads natively)
  const mimeType = file.mimetype === 'application/octet-stream' ? 'application/pdf' : file.mimetype;
  return [
    { inlineData: { mimeType, data: file.buffer.toString('base64') } },
    { text: `[Filename: ${file.originalname}]` }
  ];
}

/**
 * Convert Excel/CSV buffer to a plain-text table Gemini can read accurately.
 */
function spreadsheetToText(file) {
  try {
    const ext = file.originalname.split('.').pop().toLowerCase();
    let wb;
    if (ext === 'csv' || file.mimetype === 'text/csv') {
      wb = XLSX.read(file.buffer.toString('utf-8'), { type: 'string' });
    } else {
      wb = XLSX.read(file.buffer, { type: 'buffer' });
    }
    let result = '';
    wb.SheetNames.forEach(name => {
      const ws = wb.Sheets[name];
      result += `\n### Sheet: ${name}\n`;
      result += XLSX.utils.sheet_to_csv(ws);
    });
    return result;
  } catch (e) {
    console.warn('[xlsx] parse failed:', e.message);
    return file.buffer.toString('utf-8');
  }
}

/**
 * Compute definitive numerical stats from a spreadsheet (ground truth for KPIs).
 */
function computeSpreadsheetStats(file) {
  try {
    const ext = file.originalname.split('.').pop().toLowerCase();
    let wb;
    if (ext === 'csv' || file.mimetype === 'text/csv') {
      wb = XLSX.read(file.buffer.toString('utf-8'), { type: 'string' });
    } else {
      wb = XLSX.read(file.buffer, { type: 'buffer' });
    }
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

    let totalDeposits = 0, totalWithdrawals = 0, closingBalance = 0, openingBalance = 0;
    const depositCol = rows[0] ? Object.keys(rows[0]).find(k => /deposit|credit|inflow|inward/i.test(k)) : null;
    const withdrawCol = rows[0] ? Object.keys(rows[0]).find(k => /withdraw|debit|outflow|outward/i.test(k)) : null;
    const balanceCol = rows[0] ? Object.keys(rows[0]).find(k => /balance/i.test(k)) : null;

    rows.forEach((row, idx) => {
      const dep = depositCol ? parseFloat(String(row[depositCol]).replace(/[^0-9.]/g, '')) || 0 : 0;
      const wit = withdrawCol ? parseFloat(String(row[withdrawCol]).replace(/[^0-9.]/g, '')) || 0 : 0;
      const bal = balanceCol ? parseFloat(String(row[balanceCol]).replace(/[^0-9.]/g, '')) || 0 : 0;
      totalDeposits += dep;
      totalWithdrawals += wit;
      if (idx === 0 && bal) openingBalance = bal;
      if (bal) closingBalance = bal;
    });

    const toCr = v => v > 0 ? `₹${(v / 10000000).toFixed(2)} Cr` : null;
    return {
      totalDeposits: toCr(totalDeposits),
      totalWithdrawals: toCr(totalWithdrawals),
      netCashFlow: toCr(Math.abs(totalDeposits - totalWithdrawals)),
      openingBalance: toCr(openingBalance),
      closingBalance: toCr(closingBalance),
    };
  } catch (e) {
    console.warn('[xlsx] stats failed:', e.message);
    return null;
  }
}

// ── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Endpoint 1: Auto-classify a document using Gemini Vision
app.post('/api/classify-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No document uploaded' });
    console.log(`Classifying: ${req.file.originalname} (${req.file.size} bytes)`);

    const fileParts = buildFileParts(req.file);

    const prompt = `You are a Document Classification AI for a financial institution.
Examine this document carefully and classify it.

Choose the MOST accurate category:
- "Bank Statement"
- "Audited Financials (Annual Report)"
- "GST Return (GSTR-3B / GSTR-1)"
- "Income Tax Return (ITR)"
- "Shareholding Pattern"
- "Borrowing Profile / Debt Schedule"
- "Asset-Liability Management (ALM) Report"
- "Portfolio Cuts / Performance Data"
- "Cash Flow Statement"
- "Balance Sheet"
- "Profit & Loss Statement"

If the document is blank, corrupted or has no financial content, set predictedType to "Undeterminable - Empty Content".

Return ONLY this JSON:
{
  "predictedType": "...",
  "confidence": 0-100,
  "briefReason": "One sentence about key identifying features found"
}`;

    const result = await generateWithRetry({
      contents: [{ role: 'user', parts: [...fileParts, { text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const classification = JSON.parse(result.response.text().trim());
    res.json({ success: true, fileName: req.file.originalname, classification });

  } catch (error) {
    console.error('Classify error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 2: Full extraction — Gemini reads the document natively, no pdf-parse
app.post('/api/analyze-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No document uploaded' });

    const documentType = req.body.documentType || 'Financial Document';
    console.log(`Extracting: ${req.file.originalname} as ${documentType}`);

    // Block blank/invalid classifications immediately
    if (documentType.toLowerCase().includes('undeterminable')) {
      return res.status(422).json({
        error: 'EMPTY_DOCUMENT',
        message: `"${req.file.originalname}" appears to be blank or unreadable. Please upload a document with actual financial content.`
      });
    }

    // Build file parts (PDF as base64 inline, CSV as text)
    const fileParts = buildFileParts(req.file);

    // Compute deterministic stats from spreadsheets (ground truth)
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const isSpreadsheet = ['csv', 'xls', 'xlsx'].includes(ext);
    let realStats = null;
    if (isSpreadsheet) {
      realStats = computeSpreadsheetStats(req.file);
      if (realStats) console.log('[Stats]', realStats);
    }

    // Ground truth block for Gemini
    const groundTruth = realStats ? `
══════════════════════════════════════════════════
GROUND TRUTH — COMPUTED DIRECTLY FROM FILE DATA
(These numbers are mathematically exact. Use them AS-IS in the KPI fields.)
${Object.entries(realStats).filter(([, v]) => v).map(([k, v]) => `• ${k}: ${v}`).join('\n')}
══════════════════════════════════════════════════
For a Bank Statement: map totalDeposits → totalRevenue KPI.
For other doc types: map figures to the most appropriate KPI field.
Only extrapolate for fields that cannot be derived from the above.
` : `Extract all figures EXCLUSIVELY from the document provided. 
Do NOT invent numbers. If a figure is not in the document, use null or "N/A".
Only for fields that genuinely cannot be extracted (e.g., radar scores) may you estimate.`;

    // Dynamic schema
    let dynamicSchemaInstruction = '';
    try {
      const userSchema = JSON.parse(req.body.dynamicSchema || '[]');
      if (userSchema.length > 0) {
        dynamicSchemaInstruction = `\nUSER-DEFINED CUSTOM EXTRACTION (include as "customExtraction" key):
${JSON.stringify(userSchema, null, 2)}`;
      }
    } catch (e) { /* ignore */ }

    const prompt = `You are an elite Credit Risk AI platform. Analyze this ${documentType} document.
Filename: "${req.file.originalname}"

${groundTruth}
${dynamicSchemaInstruction}

CRITICAL RULES:
1. Extract all data DIRECTLY from the document. Never fabricate numbers that appear in the document.
2. For the dashboard sections (risk scoring, research, recommendation), you may generate intelligent contextual analysis consistent with what the document reveals.
3. Return ONLY valid JSON. No markdown, no explanation.

JSON structure to return:
{
  "companyName": "Extract from document, or 'Unknown Entity' if not found",
  "industry": "Extracted or inferred from document content",
  "summary": "One sentence describing what this document contains",
  "documentIntelligence": {
    "revenueData": [
      {"year":"FY21","revenue":number,"ebitda":number},
      {"year":"FY22","revenue":number,"ebitda":number},
      {"year":"FY23","revenue":number,"ebitda":number},
      {"year":"FY24","revenue":number,"ebitda":number}
    ],
    "debtData": [
      {"month":"Apr","st_debt":number,"lt_debt":number},
      {"month":"Jul","st_debt":number,"lt_debt":number},
      {"month":"Oct","st_debt":number,"lt_debt":number},
      {"month":"Jan","st_debt":number,"lt_debt":number},
      {"month":"Mar","st_debt":number,"lt_debt":number}
    ],
    "kpis": {
      "totalRevenue":"₹___ Cr","revenueTrend":"+__%","revenuePositive":true,
      "ebitdaMargin":"__%","ebitdaTrend":"+__%","ebitdaPositive":true,
      "totalDebt":"₹___ Cr","debtTrend":"__%","debtPositive":false,
      "workingCap":"__ Days","workingCapTrend":"__ Days","workingCapPositive":false
    },
    "extractedEntities": [
      {"metric":"String","value":"String","source":"String","conf":"String"}
    ]
  },
  "crossAnalysis": {
    "riskLevel":"Elevated/Low/Critical",
    "anomalies":[
      {"id":1,"type":"critical","title":"String","desc":"String","source":"String"}
    ],
    "reconciliation":{"gstr1":number,"bankInflow":number,"variance":"₹__ Cr","aiInsight":"String"}
  },
  "researchAgent": {
    "radarData":[
      {"subject":"Financial Stability","A":number,"fullMark":100},
      {"subject":"Market Sentiment","A":number,"fullMark":100},
      {"subject":"Promoter Reputation","A":number,"fullMark":100},
      {"subject":"Regulatory Compliance","A":number,"fullMark":100},
      {"subject":"Litigation Risk","A":number,"fullMark":100},
      {"subject":"Sector Outlook","A":number,"fullMark":100}
    ],
    "sentimentData":[
      {"month":"Oct","score":number},{"month":"Nov","score":number},
      {"month":"Dec","score":number},{"month":"Jan","score":number},
      {"month":"Feb","score":number},{"month":"Mar","score":number}
    ],
    "litigation":[
      {"title":"String","desc":"String"}
    ],
    "sectorOutlook":{"trend":"Positive/Negative/Neutral","desc":"Detailed paragraph about the industry"}
  },
  "riskScoring": {
    "finalRating":"A/B/C/D","interpretation":"String","overallScore":number,
    "dimensions":[
      {"name":"Character","score":number,"color":"var(--status-danger)","text":"String","evidence":["String","String"]},
      {"name":"Capacity","score":number,"color":"var(--status-warning)","text":"String","evidence":["String","String"]},
      {"name":"Capital","score":number,"color":"var(--status-success)","text":"String","evidence":["String","String"]},
      {"name":"Collateral","score":number,"color":"var(--status-warning)","text":"String","evidence":["String","String"]},
      {"name":"Conditions","score":number,"color":"var(--status-success)","text":"String","evidence":["String","String"]}
    ]
  },
  "recommendation": {
    "decision":"APPROVE/REJECT/CONDITIONALLY APPROVE",
    "reasoning":"Paragraph explaining the decision",
    "confidence":number,
    "requestedLimit":"₹__ Cr",
    "suggestedRate":"String",
    "covenants":"String",
    "decisionDrivers":[
      {"impact":"+ or - ___ pts","color":"var(--status-success)","desc":"String"}
    ]
  },
  "explainableAi": {
    "shapValues":[
      {"feature":"String","impact":number}
    ],
    "auditTrail":[
      {"dataPoint":"String","value":"String","color":"var(--status-warning)","source":"String","rule":"String"}
    ]
  }
}`;

    const result = await generateWithRetry({
      contents: [{ role: 'user', parts: [...fileParts, { text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const fullPayload = JSON.parse(result.response.text().trim());

    // Override KPIs with ground truth if available (belt-and-suspenders)
    if (realStats && fullPayload.documentIntelligence?.kpis) {
      const k = fullPayload.documentIntelligence.kpis;
      if (realStats.totalDeposits) k.totalRevenue = realStats.totalDeposits;
      if (realStats.closingBalance) k.totalDebt = realStats.closingBalance;
    }

    res.json({ success: true, fileName: req.file.originalname, globalState: fullPayload });

  } catch (error) {
    console.error('Analyze error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 3: Due Diligence
app.post('/api/due-diligence', async (req, res) => {
  try {
    const { observation } = req.body;
    const prompt = `You are a Chief Credit Risk Officer. A credit manager made this site visit observation:
"${observation}"

Return ONLY this JSON:
{
  "sentiment": "Positive, Neutral, or Negative",
  "riskImpact": number from -10 to +10,
  "interpretation": "One sentence explanation"
}`;
    const result = await generateWithRetry(prompt);
    const cleanJson = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(cleanJson));
  } catch (error) {
    console.error('Due diligence error:', error.message);
    res.status(500).json({ error: 'Failed to assess due diligence input' });
  }
});

// Endpoint 4: Secondary Research Agent — India-context intelligence
app.post('/api/research-company', async (req, res) => {
  try {
    const { companyName, industry, financialSummary } = req.body;
    if (!companyName) return res.status(400).json({ error: 'companyName required' });

    console.log(`[Research] Running secondary research for: ${companyName}`);

    const prompt = `You are an Indian credit intelligence analyst with access to MCA21, CIBIL Commercial, e-Courts portal, GSTN, SEBI filings, and financial news aggregators.

Perform a comprehensive secondary research report for:
Company: "${companyName}"
Industry: "${industry || 'Unknown'}"
Financial Context: "${financialSummary || 'Not provided'}"

Generate a highly realistic, India-specific intelligence report. Include:
1. MCA21 status (CIN, ROC filing compliance, DIN status of directors)
2. CIBIL Commercial score signals and SFMS/CERSAI mentions
3. GSTR-2A vs GSTR-3B discrepancy analysis (ITC mismatch, missing suppliers)  
4. e-Courts litigation findings (NCLT, DRT, High Court, consumer court)
5. News sentiment from ET, Business Standard, Moneycontrol (last 12 months)
6. SEBI/RBI regulatory flags if applicable
7. Sector outlook citing CRISIL/ICRA/India Ratings

Return ONLY this JSON:
{
  "mcaStatus": {
    "cinStatus": "Active/Struck Off/Under Liquidation",
    "lastFilingDate": "DD-Mon-YYYY",
    "directorFlags": ["String description of any DIN defaults or defaults"],
    "chargesRegistered": "₹XX Cr (description)"
  },
  "cibildSignal": {
    "estimatedScore": "XXX-XXX range",
    "dpd": "Days Past Due description",
    "existingFacilities": "Description of known credit facilities",
    "flags": ["String flag if any"]
  },
  "gstIntelligence": {
    "gstr2aVs3bGap": "₹XX Cr ITC mismatch description",
    "missingSuppliers": number,
    "reversalRisk": "High/Medium/Low",
    "circularTradingFlag": true or false
  },
  "radarData": [
    {"subject":"Financial Stability","A":number,"fullMark":100},
    {"subject":"Market Sentiment","A":number,"fullMark":100},
    {"subject":"Promoter Reputation","A":number,"fullMark":100},
    {"subject":"Regulatory Compliance","A":number,"fullMark":100},
    {"subject":"Litigation Risk","A":number,"fullMark":100},
    {"subject":"Sector Outlook","A":number,"fullMark":100}
  ],
  "sentimentData": [
    {"month":"Oct","score":number},{"month":"Nov","score":number},
    {"month":"Dec","score":number},{"month":"Jan","score":number},
    {"month":"Feb","score":number},{"month":"Mar","score":number}
  ],
  "litigation": [
    {"title":"Court/Tribunal name","desc":"Detailed case description with petition number, amount, and current status"}
  ],
  "sectorOutlook": {
    "trend": "Positive/Negative/Neutral",
    "desc": "Detailed para citing CRISIL/ICRA, RBI policy, global macro, India-specific sector headwinds/tailwinds"
  },
  "newsSummary": [
    {"headline": "News headline", "sentiment": "Positive/Negative/Neutral", "source": "ET/BS/Moneycontrol", "date": "MMM YYYY"}
  ]
}`;

    const result = await generateWithRetry({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const research = JSON.parse(result.response.text().trim());
    res.json({ success: true, research });

  } catch (error) {
    console.error('[Research] error:', error.message);
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ IntelliCredit Backend running on port ${PORT}`);
  console.log(`🔑 Gemini key: ...${process.env.GEMINI_API_KEY?.slice(-4)}`);
});
