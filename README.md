# Vednova Policy Vault — Fiduciary Insurance Audit Web Application

An AI-powered, evidence-led insurance policy review and family vault platform built for **Vednova** (`vednova.in/policy-vault`), providing fiduciary infrastructure and portfolio co-branding for AMFI Registered Mutual Fund Distributors.

---

## 🌟 Key Features

1. **Genuinely AI-Powered with Google Gemini 3.8 Flash:**
   - **Multimodal Policy Extraction:** Ingests policy schedule PDFs and images to extract UINs, premium terms, riders, and clauses into structured JSON.
   - **Defence Risk Scanner:** Automatically flags operational-duty, war, and aviation exclusions on accidental death and disability riders.
   - **AI Policy Copilot:** Interactive, natural-language Q&A grounded in IRDAI regulations and **Vednova Insurance Review SOP v2**.

2. **Zero-Hallucination Deterministic Math Engine:**
   - **365-Day Exact XIRR:** Irregular cash-flow solver using Newton-Raphson with bisection fallback.
   - **Incremental Yield Calculator:** Discloses the forward return on paying future premiums vs. converting to Paid-up.
   - **Surrender Hurdle ($S$) Solver:** Mathematically proves whether an insurer's surrender quote beats continuation and paid-up options across 6%, 8%, 10%, and 12% equity scenarios.
   - **Savings-to-SIP Bridge:** Translates avoided premiums into long-term compounding equity wealth.

3. **Fiduciary DPDP-Compliant Data Privacy:**
   - Pre-loaded with an anonymized defence case: **`Capt. A. Verma (Indian Navy, Retd.)`**.
   - Preserves 100% of the real mathematical and contractual complexity while protecting client confidentiality.

4. **Master Design PDF Generation:**
   - **Cover Page:** Luxurious midnight-navy background, double gold border, and 3D gold book-and-star emblem (`Brand logo.png`).
   - **Inner Pages:** Clean executive white paper, delicate 4% watermark, transparent vector gold header emblem, and deep navy tables.
   - **Dual Output:** 
     - **Report A:** 1–2 page Executive Recommendation Sheet for WhatsApp / client meetings.
     - **Report B:** Detailed 15–20 page Comprehensive Audit Dossier with full cash-flow ledgers.

---

## 🚀 How to Run Locally

You can open the web application directly in your browser:

1. Navigate to:
   `C:\Users\Rohit Dev\.gemini\antigravity\scratch\vednova-policy-vault\index.html`
2. Double-click `index.html` (or right-click $\rightarrow$ *Open with Google Chrome* or *Microsoft Edge*).

Or run a quick local HTTP server in PowerShell:
```powershell
npx serve "C:\Users\Rohit Dev\.gemini\antigravity\scratch\vednova-policy-vault"
```

---

## 🌐 Deploying to `vednova.in/policy-vault` (Vercel)

1. Copy the `vednova-policy-vault` files into your Next.js website repository under `/public/policy-vault` or as a dedicated route `/app/policy-vault/page.tsx`.
2. Push to your GitHub repository connected to Vercel.
3. Your web app is live at `https://www.vednova.in/policy-vault`!
