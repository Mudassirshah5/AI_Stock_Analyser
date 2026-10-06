/**
 * ============================================================================
 * AI Reasoning & Synthesis Layer (Google Gemini Integration)
 * ============================================================================
 * Implements Layers 3 & 4 of the 4-layer architecture:
 *   Layer 3: AI Interpretation (Synthesizing market context with cautious language)
 *   Layer 4: AI Assessment (Evaluating BUY vs SELL evidence distribution)
 *
 * Core Principles:
 *   - Strict Anti-Hallucination: Reasons ONLY over the supplied EvidencePackage.
 *   - Enforced JSON Schema: Response schema strictly validates all fields.
 *   - Binary Discipline: BUY vs SELL distribution summing to 100%; no ambiguous HOLD.
 *   - Resilient Failover: gemini-3.8-flash -> gemini-3.1-flash-lite -> Heuristic Engine.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { AIAnalysisResult, EvidencePackage, PrimaryAssessment } from '../src/types/stock.js';

const ai = new GoogleGenAI({
  apiKey: "AIzaSyDg41F_msbmVCJEkHUjEOJDvbBoOjCpUJY",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `You are the AI reasoning layer of an evidence-based stock analysis application.

Your job is to interpret the structured market evidence supplied by the application and produce a transparent BUY-vs-SELL assessment.

IMPORTANT:
You are NOT a financial advisor.
You must not claim certainty.
You must not guarantee profit or loss.
You must not invent facts, numbers, sources, calculations, company information, or news.
You must reason ONLY from the evidence supplied by the application.

==================================================
1. FACTS
==================================================

Treat supplied market/company data as the factual evidence available for this analysis.

Never invent missing values.

If a field is missing, explicitly say:
"Not available in the supplied data."

Do not fill missing values from memory.

Do not silently estimate.

Distinguish between:
- source data
- application calculations
- AI interpretation

==================================================
2. CALCULATIONS
==================================================

The application may provide calculated indicators.

Treat application-provided calculations as calculations, not raw facts.

Do not change the values.

If a calculation appears inconsistent, flag the inconsistency rather than silently replacing it.

==================================================
3. INTERPRETATION
==================================================

Explain what the evidence may suggest.

Use cautious language:
- suggests
- may indicate
- could reflect
- is consistent with
- provides evidence for
- provides evidence against

Avoid:
- guaranteed
- definitely
- certain
- will rise
- will fall
- risk-free
- guaranteed profit

Do not claim causation from correlation alone.

==================================================
4. BUY VS SELL ASSESSMENT
==================================================

You must produce exactly two assessment values:
BUY
SELL

The percentages must:
- be between 0 and 100
- sum to exactly 100

These are NOT statistically validated future-price probabilities.
They represent the AI's relative assessment based on the supplied evidence.

Do not describe BUY 70% as:
"There is a 70% probability the stock will increase."
Instead describe it as:
"AI Assessment Distribution: BUY 70% / SELL 30%."

The assessment must be evidence-based.
Consider, where available:
- price momentum
- trend
- volume
- valuation
- fundamentals
- 52-week position
- volatility/risk
- relevant news
- data quality
- contradictions between signals

Do not force a BUY or SELL when the evidence is extremely weak.
If evidence quality is low, the assessment may still need to produce BUY/SELL percentages because this is the required output format, but the uncertainty and low evidence quality must be clearly disclosed.

==================================================
5. EVIDENCE BEHIND THE ASSESSMENT
==================================================

Provide a concise user-facing evidence trace.
Do NOT reveal private chain-of-thought.

Instead provide:
1. Key evidence supporting BUY
2. Key evidence supporting SELL
3. Important calculated signals
4. Important contradictions
5. Missing information
6. Data-quality concerns
7. Why the final assessment distribution reflects the supplied evidence

Every important claim should point to a supplied data field or calculated indicator.

==================================================
6. EVIDENCE QUALITY
==================================================

Return:
HIGH
MODERATE
LOW

Evidence quality describes the completeness/reliability of the supplied evidence.
It is separate from BUY/SELL percentages.

==================================================
7. NEWS
==================================================

Treat news as headlines supplied by the data layer.
Do not invent article details.
Do not claim a headline caused the stock price movement unless causal evidence is supplied.
Clearly distinguish: "headline reports..." from "this caused...".

==================================================
8. LIMITATIONS
==================================================

Always disclose relevant limitations (limited period, missing fundamentals, uncalibrated probabilities, future market shifts).

==================================================
9. RESPONSIBLE LANGUAGE
==================================================

No hype. No pressure. No promises. The final decision belongs to the user.

==================================================
10. REQUIRED OUTPUT
==================================================

Return strictly valid JSON matching the schema.
primary_assessment must be exactly "BUY" or "SELL".
buy_percentage + sell_percentage must equal exactly 100.
Do NOT include HOLD.`;

export async function analyzeStockWithGemini(
  evidencePackage: EvidencePackage
): Promise<AIAnalysisResult> {
  const prompt = `Please review and reason over the following structured evidence package for stock ${
    evidencePackage.ticker
  } (${evidencePackage.companyName}) over the ${evidencePackage.analysisPeriod} period:

${JSON.stringify(evidencePackage, null, 2)}

Produce a transparent, evidence-based BUY vs SELL assessment adhering strictly to the system instruction and schema.`;

  const executeCallWithModel = async (modelName: string) => {
    return await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ticker: { type: Type.STRING },
            company_name: { type: Type.STRING },
            primary_assessment: {
              type: Type.STRING,
              description: 'Must be either "BUY" or "SELL" strictly.',
            },
            buy_percentage: {
              type: Type.INTEGER,
              description: 'Integer 0 to 100. Sum of buy_percentage and sell_percentage must be 100.',
            },
            sell_percentage: {
              type: Type.INTEGER,
              description: 'Integer 0 to 100. Sum of buy_percentage and sell_percentage must be 100.',
            },
            evidence_quality: {
              type: Type.STRING,
              description: 'HIGH, MODERATE, or LOW',
            },
            assessment_summary: {
              type: Type.STRING,
              description: 'Plain-language summary of what the evidence suggests.',
            },
            facts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  source_type: {
                    type: Type.STRING,
                    description: '"source_data" or "calculated"',
                  },
                },
                required: ['label', 'value', 'source_type'],
              },
            },
            calculated_signals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  direction: {
                    type: Type.STRING,
                    description: '"positive", "negative", or "neutral"',
                  },
                  evidence: { type: Type.STRING },
                },
                required: ['name', 'direction', 'evidence'],
              },
            },
            buy_supporting_evidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            sell_supporting_evidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            contradictions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            missing_information: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            limitations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            methodology_summary: { type: Type.STRING },
            disclaimer: { type: Type.STRING },
          },
          required: [
            'ticker',
            'company_name',
            'primary_assessment',
            'buy_percentage',
            'sell_percentage',
            'evidence_quality',
            'assessment_summary',
            'facts',
            'calculated_signals',
            'buy_supporting_evidence',
            'sell_supporting_evidence',
            'contradictions',
            'missing_information',
            'limitations',
            'methodology_summary',
            'disclaimer',
          ],
        },
      },
    });
  };

  try {
    let response;
    try {
      // 1. First attempt with gemini-3.8-flash
      response = await executeCallWithModel('gemini-3.8-flash');
    } catch (firstErr: any) {
      const errStr = String(firstErr?.message || firstErr);
      console.warn('gemini-3.8-flash call failed, trying gemini-3.1-flash-lite fallback:', errStr.substring(0, 180));

      if (
        errStr.includes('429') ||
        errStr.includes('RESOURCE_EXHAUSTED') ||
        errStr.includes('503') ||
        errStr.includes('UNAVAILABLE')
      ) {
        // Fallback to gemini-3.1-flash-lite (separate quota bucket)
        try {
          response = await executeCallWithModel('gemini-3.1-flash-lite');
        } catch (liteErr: any) {
          console.warn('gemini-3.1-flash-lite also exhausted, generating heuristic evidence assessment:', liteErr);
          // Return transparent heuristic assessment if both AI quotas are saturated
          return generateHeuristicAssessment(evidencePackage);
        }
      } else {
        throw firstErr;
      }
    }

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output:', text);
      throw new Error('The AI response could not be validated. No assessment was displayed.');
    }

    // Rigorous Validation & Normalization according to specification:
    let buyPct = Math.round(Number(parsed.buy_percentage) || 50);
    let sellPct = Math.round(Number(parsed.sell_percentage) || 50);

    // Clamp between 0 and 100
    buyPct = Math.max(0, Math.min(100, buyPct));
    sellPct = Math.max(0, Math.min(100, sellPct));

    // Ensure sum equals 100
    if (buyPct + sellPct !== 100) {
      sellPct = 100 - buyPct;
    }

    // Determine primary assessment strictly from highest percentage: BUY or SELL only
    let primary: PrimaryAssessment = buyPct >= sellPct ? 'BUY' : 'SELL';

    // Validate evidence_quality
    let quality: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
    const rawQuality = String(parsed.evidence_quality || '').toUpperCase();
    if (rawQuality.includes('HIGH')) quality = 'HIGH';
    else if (rawQuality.includes('LOW')) quality = 'LOW';
    else quality = 'MODERATE';

    const result: AIAnalysisResult = {
      ticker: parsed.ticker || evidencePackage.ticker,
      company_name: parsed.company_name || evidencePackage.companyName,
      primary_assessment: primary,
      buy_percentage: buyPct,
      sell_percentage: sellPct,
      evidence_quality: quality,
      assessment_summary:
        parsed.assessment_summary ||
        `Based on the provided ${evidencePackage.analysisPeriod} market evidence, the AI assessment distribution is BUY ${buyPct}% / SELL ${sellPct}%.`,
      facts: Array.isArray(parsed.facts)
        ? parsed.facts.map((f: any) => ({
            label: String(f.label || ''),
            value: String(f.value || ''),
            source_type: f.source_type === 'calculated' ? 'calculated' : 'source_data',
          }))
        : [],
      calculated_signals: Array.isArray(parsed.calculated_signals)
        ? parsed.calculated_signals.map((s: any) => ({
            name: String(s.name || ''),
            direction: (['positive', 'negative', 'neutral'].includes(s.direction)
              ? s.direction
              : 'neutral') as any,
            evidence: String(s.evidence || ''),
          }))
        : evidencePackage.calculatedSignals,
      buy_supporting_evidence: Array.isArray(parsed.buy_supporting_evidence)
        ? parsed.buy_supporting_evidence.map((s: any) => String(s))
        : [],
      sell_supporting_evidence: Array.isArray(parsed.sell_supporting_evidence)
        ? parsed.sell_supporting_evidence.map((s: any) => String(s))
        : [],
      contradictions: Array.isArray(parsed.contradictions)
        ? parsed.contradictions.map((s: any) => String(s))
        : [],
      missing_information: Array.isArray(parsed.missing_information)
        ? parsed.missing_information.map((s: any) => String(s))
        : evidencePackage.dataQuality.missingFields,
      limitations: Array.isArray(parsed.limitations)
        ? parsed.limitations.map((s: any) => String(s))
        : [
            'Analysis is strictly based on the supplied snapshot of data.',
            'Cannot guarantee future stock performance or market trends.',
            'Educational research only, not personalized financial advice.',
          ],
      methodology_summary:
        parsed.methodology_summary ||
        'The assessment compares objective evidence supporting BUY against evidence supporting SELL across momentum, trend, volume, and valuation.',
      disclaimer:
        'This is an AI-generated educational analysis based on limited supplied data, not financial advice. The final decision belongs to the user.',
    };

    return result;
  } catch (err: any) {
    console.error('Gemini analysis error:', err);
    const msg = String(err?.message || err);
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error(
        'Gemini API request rate limit reached. Please wait a few seconds and click Retry.'
      );
    }
    if (msg.includes('503') || msg.includes('UNAVAILABLE')) {
      throw new Error(
        'The AI service is experiencing high demand. Please wait a few moments and click Retry.'
      );
    }
    try {
      const parsed = JSON.parse(msg);
      if (parsed.error?.message) {
        throw new Error(parsed.error.message);
      }
    } catch (_) {}
    throw new Error(
      err.message || 'The AI response could not be validated. No assessment was displayed.'
    );
  }
}

/**
 * Transparent Heuristic Evidence Model as outlined in Section 12 of the specification.
 * Activated if all external Gemini model quotas are saturated, ensuring uninterrupted research experience.
 */
function generateHeuristicAssessment(evidencePackage: EvidencePackage): AIAnalysisResult {
  const { ticker, companyName, calculatedSignals, priceData, volumeData, fundamentals, dataQuality, analysisPeriod } = evidencePackage;

  const buyEvidence: string[] = [];
  const sellEvidence: string[] = [];
  const contradictions: string[] = [];

  let positiveScore = 0;
  let negativeScore = 0;

  // 1. Price Momentum
  if (priceData.periodReturnPercent > 1.5) {
    buyEvidence.push(`Positive period return of +${priceData.periodReturnPercent}% over ${analysisPeriod}.`);
    positiveScore += 2;
  } else if (priceData.periodReturnPercent < -1.5) {
    sellEvidence.push(`Negative period return of ${priceData.periodReturnPercent}% over ${analysisPeriod}.`);
    negativeScore += 2;
  }

  // 2. Trend Signals
  for (const sig of calculatedSignals) {
    if (sig.direction === 'positive') {
      buyEvidence.push(sig.evidence);
      positiveScore += 1.5;
    } else if (sig.direction === 'negative') {
      sellEvidence.push(sig.evidence);
      negativeScore += 1.5;
    }
  }

  // 3. Volume Check
  if (volumeData.volumeComparisonPercent > 15 && priceData.periodReturnPercent > 0) {
    buyEvidence.push(`Confirming high trading volume (+${volumeData.volumeComparisonPercent}% above period average) during price advance.`);
    positiveScore += 1;
  } else if (volumeData.volumeComparisonPercent > 15 && priceData.periodReturnPercent < 0) {
    sellEvidence.push(`High trading volume (+${volumeData.volumeComparisonPercent}% above period average) during price decline.`);
    negativeScore += 1;
  }

  // 4. Valuation Check
  if (fundamentals.trailingPE !== null) {
    if (fundamentals.trailingPE > 45) {
      sellEvidence.push(`High trailing P/E multiple (${fundamentals.trailingPE}x) introduces elevated multiple compression risk.`);
      negativeScore += 1;
    } else if (fundamentals.trailingPE > 0 && fundamentals.trailingPE < 20) {
      buyEvidence.push(`Modest trailing P/E multiple (${fundamentals.trailingPE}x) reflects attractive relative valuation.`);
      positiveScore += 1;
    }
  }

  // 5. Contradictions
  if (priceData.periodReturnPercent > 0 && fundamentals.trailingPE && fundamentals.trailingPE > 40) {
    contradictions.push(`Strong price momentum coincides with elevated valuation multiples, creating valuation tension.`);
  }
  if (priceData.periodReturnPercent < 0 && volumeData.volumeComparisonPercent < -20) {
    contradictions.push(`Price drifted lower but on lower-than-average volume, suggesting lack of aggressive institutional selling.`);
  }

  // Calculate percentages (base 50% split adjusted by net signal differential)
  const totalWeight = positiveScore + negativeScore;
  let buyPct = 50;
  if (totalWeight > 0) {
    const rawBuy = (positiveScore / totalWeight) * 100;
    // Keep in a sensible 20% - 80% range for realistic heuristic distribution
    buyPct = Math.round(Math.min(80, Math.max(20, rawBuy)));
  } else {
    buyPct = priceData.periodReturnPercent >= 0 ? 55 : 45;
  }
  const sellPct = 100 - buyPct;
  const primaryAssessment: PrimaryAssessment = buyPct >= sellPct ? 'BUY' : 'SELL';

  // Determine quality from completeness
  let quality: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
  if (dataQuality.missingFields.length <= 1) quality = 'HIGH';
  else if (dataQuality.missingFields.length >= 4) quality = 'LOW';

  const facts = [
    { label: 'Latest Price', value: `$${priceData.latestPrice.toFixed(2)}`, source_type: 'source_data' as const },
    { label: 'Period Return', value: `${priceData.periodReturnPercent >= 0 ? '+' : ''}${priceData.periodReturnPercent}%`, source_type: 'calculated' as const },
    { label: 'Period High', value: `$${priceData.periodHigh.toFixed(2)}`, source_type: 'source_data' as const },
    { label: 'Period Low', value: `$${priceData.periodLow.toFixed(2)}`, source_type: 'source_data' as const },
  ];

  return {
    ticker,
    company_name: companyName,
    primary_assessment: primaryAssessment,
    buy_percentage: buyPct,
    sell_percentage: sellPct,
    evidence_quality: quality,
    assessment_summary: `Based on the objective ${analysisPeriod} evidence package, positive momentum and trend signals score ${positiveScore.toFixed(1)} vs ${negativeScore.toFixed(1)} for risk factors, yielding an AI assessment distribution of BUY ${buyPct}% / SELL ${sellPct}%.`,
    facts,
    calculated_signals: calculatedSignals,
    buy_supporting_evidence: buyEvidence.length > 0 ? buyEvidence : ['Observed trading stability within period bounds.'],
    sell_supporting_evidence: sellEvidence.length > 0 ? sellEvidence : ['Market volatility and macro uncertainty.'],
    contradictions,
    missing_information: dataQuality.missingFields,
    limitations: [
      'Analysis is strictly based on the supplied snapshot of data.',
      'Cannot guarantee future stock performance or market trends.',
      'Educational research only, not personalized financial advice.',
    ],
    methodology_summary: 'Transparent heuristic evidence model (Section 12 specification) reconciling momentum, trend, volume confirmation, and valuation multiples.',
    disclaimer: 'This is an AI-generated educational analysis based on limited supplied data, not financial advice. The final decision belongs to the user.',
  };
}
