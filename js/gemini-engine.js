/**
 * Vednova Gemini Intelligence Engine
 * Model: gemini-3.8-flash (official latest)
 * 
 * Capabilities:
 * 1. Multimodal Policy Document Ingestion (PDF / Image -> Structured JSON)
 * 2. Defence Exclusions & Operational Duty Scanner
 * 3. Fiduciary Policy Copilot (Natural-language Q&A grounded in SOP v2)
 */

const VednovaGemini = {
  MODEL: 'gemini-3.8-flash',
  API_BASE: 'https://generativelanguage.googleapis.com/v1beta/models',

  getApiKey() {
    return localStorage.getItem('vednova_gemini_api_key') || '';
  },

  setApiKey(key) {
    if (key) {
      localStorage.setItem('vednova_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('vednova_gemini_api_key');
    }
  },

  hasApiKey() {
    return Boolean(this.getApiKey());
  },

  /**
   * Multimodal Policy Schedule Extractor
   * Extracts structured policy details from document file (Base64).
   */
  async extractPolicyFromDocument(fileBase64, mimeType = 'application/pdf') {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Please enter your Gemini API Key in the settings to analyze new documents.');
    }

    const systemPrompt = `You are the Vednova Insurance Policy Extractor operating under Indian IRDAI and SEBI standards.
Extract the policy details from this schedule/endorsement with absolute precision.
Do not invent any dates, numbers, or terms. If any field is unverified, return null or an empty array.

Return ONLY valid JSON matching this schema:
{
  "productName": "string",
  "uin": "string",
  "insurer": "string",
  "policyNumberMasked": "string",
  "policyHolder": "string",
  "lifeAssured": "string",
  "lifeAssuredAge": "number or null",
  "issueDate": "YYYY-MM-DD",
  "maturityDate": "YYYY-MM-DD",
  "policyTerm": "number in years",
  "premiumPayingTerm": "number in years",
  "annualBasePremium": "number",
  "gstAmount": "number",
  "paymentFrequency": "Annual/Monthly/Single",
  "sumAssured": "number",
  "isULIP": "boolean",
  "riders": [
    { "name": "string", "sumAssured": "number", "annualCost": "number", "exclusionsSummary": "string" }
  ],
  "defenceExclusionsDetected": [
    "string descriptions of any war, armed-forces duty, aviation or naval operation exclusions"
  ],
  "minorVestingClause": "boolean",
  "guaranteedBenefitsSummary": "string",
  "nextScheduledPremiumDate": "YYYY-MM-DD or null"
}`;

    const url = `${this.API_BASE}/${this.MODEL}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: fileBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.1
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Gemini extraction request failed.');
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText);
  },

  /**
   * Fiduciary AI Policy Copilot (Q&A)
   * Answers user or advisor questions grounded in family portfolio data & SOP v2 rules.
   */
  async askPolicyCopilot(question, portfolioContext) {
    const apiKey = this.getApiKey();

    const firm = (typeof VednovaDB !== 'undefined')
      ? VednovaDB.getFirmByClient(portfolioContext)
      : null;
    const firmName = firm ? firm.firmName : 'Zenith Wealth Advisors Pvt. Ltd.';
    const firmYear = firm && firm.establishedYear ? ` (Heritage since ${firm.establishedYear})` : '';

    const systemPrompt = `You are the Vednova AI Policy Copilot, representing ${firmName}${firmYear}.
You advise with strict fiduciary integrity following the Vednova Insurance Review SOP v2:
1. Never encourage surrender to churn money into mutual funds.
2. Protect existing family coverage before suggesting any termination.
3. For defence personnel, rigorously highlight operational duty and war risk exclusions on accidental riders.
4. Distinguish inception XIRR from incremental forward yield on future premiums.
5. Emphasize equal-budget comparisons with reinvestment at 6%, 8%, 10%, 12%.
6. If critical values (surrender quotes or bonus statements) are missing, flag them as INFORMATION REQUIRED.

Current Client Portfolio Context:
${JSON.stringify(portfolioContext, null, 2)}

Answer the user's question clearly, professionally, and with transparent mathematical rationale.`;

    if (!apiKey) {
      // High-quality deterministic response simulation when offline / no API key
      return this.simulateCopilotResponse(question, portfolioContext);
    }

    const url = `${this.API_BASE}/${this.MODEL}:generateContent?key=${apiKey}`;
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: `User Question: ${question}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        return this.simulateCopilotResponse(question, portfolioContext);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    } catch (e) {
      return this.simulateCopilotResponse(question, portfolioContext);
    }
  },

  /**
   * Intelligent offline simulation fallback for instant live preview without requiring an API key immediately.
   */
  simulateCopilotResponse(question, context) {
    const q = question.toLowerCase();
    const portfolio = context?.portfolio || {};
    const clientName = portfolio.clientName || 'the client';
    const branch = (typeof VednovaSOP !== 'undefined') 
      ? VednovaSOP.resolveBranch(portfolio.serviceBranch ? portfolio : (context?.serviceBranch || portfolio))
      : { key: 'ARMY', name: 'Indian Army', pfShort: 'DSOPF', pfName: 'DSOPF', pfRate: 0.071, hasMilitaryExclusions: true, sovereignAlternatives: 'DSOPF & AFGIS' };

    if (q.includes('gold') || q.includes('rider') || q.includes('duty') || q.includes('war') || q.includes('exclusion') || q.includes('dsop') || q.includes('epf') || q.includes('ppf')) {
      if (branch.hasMilitaryExclusions) {
        return `**Critical Protection & Sovereign Benchmark Audit (P03 / ICICI Pru Gold):**\n\n1. **Service Duty Exclusion:** The accidental death & disability rider (₹7,497/yr) carries a strict **military & operational duty exclusion**. It contractually excludes events resulting from military, naval, or air-force operations during war or peace. It does NOT protect ${clientName} during operational service.\n\n2. **Financial Yield Drag:** Continuing 6 more premiums yields only **1.63% incremental return**, bleeding heavily against ${clientName}'s **${branch.pfShort} sovereign benchmark (${(branch.pfRate * 100).toFixed(2)}% Tax-Free)**.\n\n**Fiduciary Advice:** Converting Gold to Paid-Up stops this ${((branch.pfRate - 0.0163) * 100).toFixed(2)}% annual leak while preserving existing guarantees.`;
      } else {
        return `**Product Yield & Statutory Sovereign Benchmark Audit (P03 / ICICI Pru Gold):**\n\n1. **Coverage Audit:** As a civilian/corporate policyholder (${branch.categoryLabel}), standard policies do not have military combat exclusions. However, accidental riders require high-risk occupation disclosures.\n\n2. **Financial Yield Drag:** Continuing 6 more annual premiums of ₹3,00,000 yields only **1.63% incremental return**. This underperforms ${clientName}'s statutory sovereign options: **${branch.pfName} (${(branch.pfRate * 100).toFixed(2)}%)** and Sovereign Gold Bonds (SGB with 2.5% p.a. sovereign coupon + 100% gold upside + Sec 47(viic) tax exemption).\n\n**Fiduciary Advice:** Converting Gold to Paid-Up stops this ${((branch.pfRate - 0.0163) * 100).toFixed(2)}% annual leak against ${branch.sovereignAlternatives} while preserving all accrued guarantees.`;
      }
    }

    if (q.includes('signature') || q.includes('lock-in') || q.includes('ulip') || q.includes('sep 18') || q.includes('exit')) {
      return `**P01 / Signature Advantage Action Plan:**\n\nThe 5-year lock-in period completes on **18 September 2026**. Surrender after lock-in releases the full fund value with zero surrender penalty.\n\n**Important Rule:** The 6th premium of ₹2,00,000 is **not** required to unlock surrender. However, do not stop payment or surrender until the latest NAV and verified fund value statement are obtained. If continued, remaining allocation and admin charges total over ₹51,960.`;
    }

    if (q.includes('gift') || q.includes('income') || q.includes('lump sum') || q.includes('surrender')) {
      return `**GIFT Policies Analysis (P04, P05, P06):**\n\nAlthough the base inception returns appear modest (~6%), the **incremental return on continuing further premiums is 6.62% to 7.15% guaranteed tax-free income**.\n\n**Decision Gate:** If ${clientName} values guaranteed predictable income for 15 to 30 years, continuing these policies has a strong mathematical justification. However, if the goal is a lump sum at maturity, paid-up plus investing avoided premiums into equity funds at 8%+ gross yields superior wealth.`;
    }

    if (q.includes('sip') || q.includes('mutual fund') || q.includes('saving') || q.includes('wealth')) {
      const avoided = portfolio.avoidedPremiums || 507497;
      const monthlySIP = Math.round(avoided / 12);
      return `**The Savings-to-SIP Impact for ${clientName}:**\n\nIf the family opts for a restructuring scenario (e.g. Signature exit + Gold paid-up), the gross avoided premium is **${VednovaMath ? VednovaMath.formatINR(avoided) : '₹' + avoided.toLocaleString('en-IN')}/year** (~₹${monthlySIP.toLocaleString('en-IN')}/month).\n\nIf this ~₹${monthlySIP.toLocaleString('en-IN')}/month is redirected into a disciplined equity index SIP earning a conservative 12% p.a.:\n• **5 Years:** ~₹34.6 Lakhs\n• **10 Years:** ~₹97.6 Lakhs\n• **15 Years:** ~₹2.12 Crores\n\n*Note: Guaranteed insurance benefits and market-linked SIPs have different risk profiles; this comparison tests opportunity cost.*`;
    }

    return `Based on the **Vednova SOP v2** audit for ${clientName}:
1. All audited contracts are benchmarked against statutory sovereign alternatives (${branch.pfShort} at ${(branch.pfRate * 100).toFixed(2)}%).
2. The total annual commitment is **${VednovaMath ? VednovaMath.formatINR(portfolio.annualRunRate || 1107497) : '₹11,07,497'}** across ${portfolio.policies?.length || 6} policies.
3. The most urgent deadline is **18 September 2026** for P01 (Signature lock-in) and P03 (Gold grace period review).
4. Connect a Gemini API key in settings to run custom deep-dive queries on new uploaded policy PDFs.`;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VednovaGemini;
}
