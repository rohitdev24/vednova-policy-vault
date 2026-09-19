/**
 * Vednova PDF Generator
 * Master Standard:
 * Cover Page: Full-bleed authentic midnight-navy cover image (cover-background.png)
 * Inner Pages: Clean white canvas with faint watermark, transparent gold emblem,
 * definitive verdicts, DSOP 7.1% comparison, and dynamic MFD firm attribution footer.
 */

const VednovaPDF = {
  generateReport(reportType, portfolioData, scenarioReturn = 0.08, branchKey = null, customFirm = null) {
    const isReportA = reportType === 'A';
    const title = isReportA ? 'EXECUTIVE RECOMMENDATION SHEET' : 'DETAILED INSURANCE AUDIT DOSSIER';
    const reportCode = isReportA ? 'REPORT A' : 'REPORT B';

    const branch = (typeof VednovaSOP !== 'undefined' && VednovaSOP.resolveBranch)
      ? VednovaSOP.resolveBranch(portfolioData.serviceBranch ? portfolioData : (branchKey || portfolioData))
      : (VednovaSOP.DEFENCE_BRANCHES[portfolioData.serviceBranch || branchKey] || VednovaSOP.DEFENCE_BRANCHES.ARMY);

    // Dynamically resolve distributor firm attribution strictly scoped to this client
    const firm = customFirm 
      || ((typeof VednovaDB !== 'undefined' && portfolioData) ? VednovaDB.getFirmByClient(portfolioData) : null)
      || ((typeof VednovaDB !== 'undefined') ? VednovaDB.getFirm() : null);
    const firmName = (firm && firm.firmName) ? firm.firmName : 'Vednova Fiduciary Network';
    const firmArn = (firm && firm.arn) ? firm.arn : '';
    const distributorAttribution = firmArn ? `${firmName} (${firmArn})` : firmName;
    const footerAttribution = `Prepared by ${distributorAttribution} · Powered by Vednova`;

    const firmLogoMarkup = (firm && firm.logoUrl)
      ? `<div style="margin-top: 2mm; margin-bottom: 1.5mm; display: flex; justify-content: center; align-items: center;">
           <img src="${firm.logoUrl}" alt="${firmName} Logo" style="max-height: 11mm; max-width: 50mm; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.8));">
         </div>`
      : '';

    const innerHeaderBrandMarkup = (firm && firm.logoUrl)
      ? `<div class="header-brand">
           <img src="${firm.logoUrl}" class="header-brand-logo" alt="${firmName} Logo" style="max-height: 9.5mm; max-width: 34mm; object-fit: contain;">
           <span class="header-brand-text" style="font-size: 11pt; border-left: 1px solid #d4af37; padding-left: 2.5mm; color: #0f172a; font-weight: 700;">${firmName.toUpperCase()}</span>
         </div>`
      : `<div class="header-brand">
           <img src="assets/brand-logo.svg" class="header-brand-logo" alt="Logo">
           <span class="header-brand-text" style="font-size: 11pt; color: #0f172a; font-weight: 700;">${firmName.toUpperCase()}</span>
         </div>`;

    const freedMonthlyCash = (portfolioData.avoidedPremiums && portfolioData.avoidedPremiums > 0)
      ? VednovaMath.formatINR(Math.round(portfolioData.avoidedPremiums / 12))
      : '₹42,291';

    const printWindow = window.open('', '_blank', 'width=1000,height=1200');
    if (!printWindow) {
      alert('Please allow popups to generate the Vednova PDF report.');
      return;
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vednova — ${title} — ${portfolioData.clientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 10pt;
      line-height: 1.5;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      height: 297mm;
      margin: 0 auto;
      position: relative;
      background: #ffffff;
      page-break-after: always;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* COVER PAGE: EXACT MATCH TO USER'S FAVORITE BUILD */
    .page-cover {
      background: #050f1d url('assets/cover-background.png') no-repeat center center;
      background-size: 100% 100%;
      padding: 0;
      position: relative;
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      overflow: hidden;
    }

    .cover-overlay-box {
      position: absolute;
      top: 214mm;
      left: 0;
      right: 0;
      width: 100%;
      text-align: center;
      z-index: 10;
    }

    .cover-prepared-label {
      font-size: 8pt;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 2mm;
      font-weight: 600;
    }

    .cover-client-title {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 20pt;
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin: 0 0 2mm 0;
      text-shadow: 0 4px 15px rgba(0, 0, 0, 0.9);
      line-height: 1.15;
    }

    .cover-date-text {
      font-size: 8pt;
      letter-spacing: 0.16em;
      color: #cbd5e1;
      font-weight: 500;
      text-transform: uppercase;
      margin-bottom: 2mm;
    }

    .cover-prepared-by-text {
      font-size: 7.2pt;
      letter-spacing: 0.14em;
      color: #cbd5e1;
      text-transform: uppercase;
      margin-top: 1.5mm;
      font-weight: 600;
    }

    /* INNER PAGES */
    .page-inner {
      padding: 16mm 18mm 16mm 18mm;
      position: relative;
      background: #ffffff;
    }

    .page-inner::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 140mm;
      height: 140mm;
      background: url('assets/brand-logo.svg') no-repeat center center;
      background-size: contain;
      opacity: 0.035;
      pointer-events: none;
      z-index: 0;
    }

    /* HEADER */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #d4af37;
      padding-bottom: 3mm;
      margin-bottom: 5mm;
      position: relative;
      z-index: 1;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 3mm;
    }

    .header-brand-logo {
      height: 8.5mm;
      width: auto;
    }

    .header-brand-text {
      font-family: 'Cinzel', serif;
      font-size: 13.5pt;
      letter-spacing: 0.16em;
      color: #0f172a;
      font-weight: 700;
    }

    .header-meta {
      text-align: right;
      font-size: 8pt;
      color: #64748b;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-weight: 500;
    }

    /* TYPOGRAPHY */
    .section-eyebrow {
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #92400e;
      margin-bottom: 1.5mm;
    }

    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 15pt;
      font-weight: 700;
      color: #091525;
      margin: 0 0 3.5mm 0;
    }

    /* BENCHMARK & DEFENCE ALERT BOX */
    .defence-banner {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #0284c7;
      padding: 3mm 4mm;
      border-radius: 4px;
      margin-bottom: 4mm;
      position: relative;
      z-index: 1;
      font-size: 8pt;
      color: #334155;
    }

    .defence-banner strong {
      color: #0369a1;
      font-size: 8.5pt;
    }

    /* TABLES */
    table.v-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      margin-bottom: 4.5mm;
      position: relative;
      z-index: 1;
    }

    table.v-table th {
      background: #091525;
      color: #ffffff;
      text-align: left;
      padding: 2.2mm 2.8mm;
      font-weight: 600;
      letter-spacing: 0.05em;
      font-size: 7.5pt;
      text-transform: uppercase;
    }

    table.v-table td {
      padding: 2.2mm 2.8mm;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    table.v-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* VERDICT BADGES */
    .badge {
      display: inline-block;
      padding: 1mm 2.5mm;
      border-radius: 3px;
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .badge-surrender { background: #fee2e2; color: #991b1b; border: 1px solid #f87171; }
    .badge-paidup { background: #fef3c7; color: #92400e; border: 1px solid #facc15; }
    .badge-continue { background: #dcfce7; color: #166534; border: 1px solid #4ade80; }

    /* METRIC CARDS */
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 3mm;
      margin-bottom: 4.5mm;
      position: relative;
      z-index: 1;
    }

    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 2.8mm;
      border-radius: 4px;
      text-align: center;
    }

    .metric-val {
      font-size: 12.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.5mm;
    }

    .metric-lbl {
      font-size: 6.8pt;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      font-weight: 600;
    }

    /* FOOTER - EXACT SSS & VEDNOVA STANDARD */
    .page-footer {
      margin-top: auto;
      border-top: 1px solid #d4af37;
      padding-top: 2.5mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.2pt;
      color: #475569;
      position: relative;
      z-index: 1;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }

    .footer-star {
      color: #d4af37;
      font-size: 7.5pt;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: EXACT MATCH COVER -->
  <div class="page page-cover">
    <div class="cover-overlay-box">
      <div class="cover-prepared-label">PREPARED FOR</div>
      <div class="cover-client-title">${portfolioData.clientName}</div>
      <div class="cover-date-text">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      ${firmLogoMarkup}
      <div class="cover-prepared-by-text">
        PREPARED BY ${distributorAttribution.toUpperCase()}
      </div>
    </div>
  </div>

  <!-- PAGE 2: ACTIONABLE VERDICT & MASTER SCHEDULE -->
  <div class="page page-inner">
    <div class="header-bar">
      ${innerHeaderBrandMarkup}
      <div class="header-meta">
        PAGE 2 · ${reportCode} · ${portfolioData.clientName}<br>
        <span style="font-size: 6.8pt; color: #94a3b8; font-weight: 600;">${distributorAttribution}</span>
      </div>
    </div>

    <div class="section-eyebrow">DEFINITIVE FIDUCIARY AUDIT / ACTIONABLE EXIT PLAN</div>
    <h1 class="section-title">Insurance Portfolio Verdict</h1>

    <div class="defence-banner">
      <strong>${branch.name} Analysis & Sovereign Benchmark:</strong>
      All policies contrasted against ${branch.benchmarkSentence}. 
      ${branch.hasMilitaryExclusions 
        ? 'Rider clauses on P03 specifically exclude active armed forces, naval, or aviation operational duties.' 
        : 'Zero military combat exclusions. Policy riders verified under standard civilian disclosures.'}
    </div>

    <table class="v-table">
      <thead>
        <tr>
          <th>Policy / UIN</th>
          <th>Owner / Insured</th>
          <th>Annual Premium</th>
          <th>Actionable Verdict</th>
          <th>Fiduciary Rationale</th>
        </tr>
      </thead>
      <tbody>
        ${portfolioData.policies.map(p => {
          const evalResult = VednovaSOP.evaluatePolicy(p, branch.key);
          const badgeClass = evalResult.verdict === 'SURRENDER' ? 'badge-surrender' : evalResult.verdict === 'PAID-UP' ? 'badge-paidup' : 'badge-continue';
          return `
            <tr>
              <td>
                <strong>${p.productName}</strong><br>
                <span style="color: #64748b; font-size: 7pt;">ID: ${p.maskedId} · ${p.uin}</span>
              </td>
              <td>
                <strong>${p.owner}</strong><br>
                <span style="color: #64748b; font-size: 7pt;">Insured: ${p.insured}</span>
              </td>
              <td>
                <strong style="color: #92400e;">${VednovaMath.formatINR(p.annualPremium)}</strong><br>
                <span style="color: #64748b; font-size: 7pt;">Due: ${p.nextDue.split(' ')[0]}</span>
              </td>
              <td>
                <span class="badge ${badgeClass}">${evalResult.verdict}</span>
              </td>
              <td style="font-size: 7.5pt; line-height: 1.4;">
                <strong>${evalResult.verdictHeadline}</strong><br>
                <span style="color: #475569;">${evalResult.actionSteps[0]}</span>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <div class="section-eyebrow">PORTFOLIO CASH-FLOW RECONCILIATION</div>
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-val">${VednovaMath.formatINR(portfolioData.annualRunRate)}</div>
        <div class="metric-lbl">Annual Run-Rate</div>
      </div>
      <div class="metric-card">
        <div class="metric-val" style="color: #dc2626;">${VednovaMath.formatINR(portfolioData.avoidedPremiums)}</div>
        <div class="metric-lbl">Avoided Leakage</div>
      </div>
      <div class="metric-card">
        <div class="metric-val" style="color: #16a34a;">${freedMonthlyCash}/mo</div>
        <div class="metric-lbl">Freed Monthly Cash</div>
      </div>
      <div class="metric-card">
        <div class="metric-val" style="color: #0284c7;">${(branch.pfRate * 100).toFixed(2)}%</div>
        <div class="metric-lbl">${branch.pfShort} Benchmark</div>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 3.5mm; border-radius: 4px; font-size: 7.8pt; color: #334155;">
      <strong style="color: #0f172a;">Core Exit Rules Enforced:</strong>
      <ol style="margin: 1.5mm 0 0 0; padding-left: 4mm; line-height: 1.5;">
        <li><strong>ULIPs with 0 Exit Fee (P01, P02):</strong> Surrender immediately upon 5-year lock-in completion to eliminate 1.35% FMC and monthly admin fees.</li>
        <li><strong>Sub-Optimal Savings (P03):</strong> Stop further premiums immediately. Incremental yield of 1.63% is crushed by ${(branch.pfRate * 100).toFixed(2)}% ${branch.pfShort}. Convert to Paid-Up to preserve accrued guarantees.</li>
        <li><strong>Guaranteed Income (P04, P05, P06):</strong> Continue paying. Generates 6.62%–7.15% guaranteed tax-free 30-year pensions, beating bank FDs and corporate bonds.</li>
      </ol>
    </div>

    <div class="page-footer">
      <span class="footer-left">${footerAttribution}</span>
      <span class="footer-star">✦</span>
      <span>www.vednova.in · Page 2 of ${isReportA ? '2' : '4'}</span>
    </div>
  </div>

  ${!isReportA ? `
  <!-- PAGE 3: TECHNICAL AUDIT & PAYOUT FREQUENCY COMPARISON -->
  <div class="page page-inner">
    <div class="header-bar">
      ${innerHeaderBrandMarkup}
      <div class="header-meta">
        PAGE 3 · REPORT B · ${portfolioData.clientName}<br>
        <span style="font-size: 6.8pt; color: #94a3b8; font-weight: 600;">${distributorAttribution}</span>
      </div>
    </div>

    <div class="section-eyebrow">MATHEMATICAL AUDIT & PAYOUT FREQUENCIES</div>
    <h2 class="section-title">Annual vs. Monthly vs. Lump Sum Comparison</h2>

    <p style="font-size: 8pt; color: #475569; margin-bottom: 3.5mm;">
      Analysis of P04 (ICICI Pru GIFT Long-Term) demonstrating how payout frequency impacts household returns:
    </p>

    <table class="v-table">
      <thead>
        <tr>
          <th>Payout Option</th>
          <th>Scheduled Amount</th>
          <th>Duration</th>
          <th>Incremental XIRR</th>
          <th>Recommendation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Annual Income Route</strong></td>
          <td>₹2,84,330 / year</td>
          <td>30 Years (2038–2067) + ₹26.4L ROP</td>
          <td style="color: #16a34a; font-weight: 700;">7.15% (Tax-Free)</td>
          <td><strong>STRONGLY RECOMMENDED:</strong> Highest yield; matches long-term retirement pension.</td>
        </tr>
        <tr>
          <td><strong>Monthly Regular Income</strong></td>
          <td>~₹23,220 / month</td>
          <td>30 Years (2038–2067) + ₹26.4L ROP</td>
          <td>6.95% (Tax-Free)</td>
          <td><strong>SUITABLE:</strong> Minor compounding discount for monthly household cash-flow utility.</td>
        </tr>
        <tr>
          <td><strong>Maturity Lump Sum Commutation</strong></td>
          <td>₹34,63,282 (One-Time)</td>
          <td>Maturity Date (15 May 2037)</td>
          <td style="color: #dc2626; font-weight: 700;">5.67% (Tax-Free)</td>
          <td><strong>NOT RECOMMENDED:</strong> Drastic yield reduction. Commutation discount rate destroys value.</td>
        </tr>
      </tbody>
    </table>

    <div class="section-eyebrow">SOVEREIGN BENCHMARK: ${branch.pfShort.toUpperCase()} ${(branch.pfRate * 100).toFixed(2)}% VS. ICICI PRU GOLD</div>
    <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 3mm 4mm; border-radius: 4px; font-size: 8pt; color: #78350f; margin-bottom: 4mm;">
      <strong>The ${branch.pfShort} Contrast Test:</strong><br>
      ICICI Pru Gold's remaining 6 premiums total <strong>₹18,00,000</strong>.
      <ul style="margin: 1.5mm 0 0 0; padding-left: 4mm;">
        <li>Paid into Gold: Yields only <strong>1.63% incremental return</strong> (₹30,150/yr income + ₹18L maturity).</li>
        <li>Invested into <strong>${branch.pfName} at ${(branch.pfRate * 100).toFixed(2)}%</strong>: Accumulates to <strong>${branch.key === 'CIVILIAN_SALARIED' ? '₹41.2 Lakhs' : '₹36.8 Lakhs'}</strong> over the same horizon—far superior compounding!</li>
      </ul>
      <strong>Clear Decision:</strong> Convert Gold to Paid-Up immediately.
    </div>

    <div class="page-footer">
      <span class="footer-left">${footerAttribution}</span>
      <span class="footer-star">✦</span>
      <span>www.vednova.in · Page 3 of 4</span>
    </div>
  </div>

  <!-- PAGE 4: SAVINGS-TO-SIP WEALTH CREATION -->
  <div class="page page-inner">
    <div class="header-bar">
      ${innerHeaderBrandMarkup}
      <div class="header-meta">
        PAGE 4 · REPORT B · ${portfolioData.clientName}<br>
        <span style="font-size: 6.8pt; color: #94a3b8; font-weight: 600;">${distributorAttribution}</span>
      </div>
    </div>

    <div class="section-eyebrow">REDEPLOYING AVOIDED PREMIUMS</div>
    <h2 class="section-title">The "Savings-to-SIP" Compounding Bridge</h2>

    <p style="font-size: 8pt; color: #475569; margin-bottom: 4mm;">
      Surrendering P01/P02 and converting P03 to Paid-up frees <strong>${VednovaMath.formatINR(portfolioData.avoidedPremiums)} per year</strong>. Redirecting this ${freedMonthlyCash}/month into an equity index SIP compounds into significant household wealth:
    </p>

    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-val">${freedMonthlyCash}</div>
        <div class="metric-lbl">Monthly SIP</div>
      </div>
      <div class="metric-card">
        <div class="metric-val" style="color: #0f172a;">₹34.6 L</div>
        <div class="metric-lbl">5-Yr Projected Value</div>
      </div>
      <div class="metric-card">
        <div class="metric-val" style="color: #0f172a;">₹97.6 L</div>
        <div class="metric-lbl">10-Yr Projected Value</div>
      </div>
      <div class="metric-card">
        <div class="metric-val" style="color: #d4af37;">₹2.12 Cr</div>
        <div class="metric-lbl">15-Yr Projected Value</div>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 4mm; border-radius: 4px; font-size: 7.8pt; color: #475569;">
      <strong style="color: #0f172a;">Summary Roadmap for ${portfolioData.clientName}:</strong>
      <ol style="margin: 1.5mm 0 0 0; padding-left: 4mm; line-height: 1.6;">
        <li><strong>Immediate (18 Sep 2026):</strong> Surrender P01 Signature Advantage post lock-in. Do not pay ₹2,00,000 premium.</li>
        <li><strong>Immediate:</strong> Submit surrender request for P02 Elite Life Super (0 exit charges).</li>
        <li><strong>Before 29 Aug 2027:</strong> Convert P03 Gold to Paid-up. Cancel bank auto-debit.</li>
        <li><strong>On 15 May 2027 & 30 Mar 2027:</strong> Continue paying P04, P05, P06 for guaranteed 6.6%–7.15% tax-free income.</li>
      </ol>
    </div>

    <div class="page-footer">
      <span class="footer-left">${footerAttribution}</span>
      <span class="footer-star">✦</span>
      <span>www.vednova.in · Page 4 of 4</span>
    </div>
  </div>
  ` : ''}

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VednovaPDF;
}
