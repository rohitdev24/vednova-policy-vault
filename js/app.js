/**
 * Vednova Policy Vault - Shareable Client View Controller
 * Version: 3.2
 * 
 * Primary Demo Client: Col. Arvind Rathore (Indian Army)
 * 
 * Features:
 * - Dynamic loading via URL param: index.html?caseId=VN-2026-ARMY-01
 * - Verified client profile display (Clean banner, pure client view)
 * - Dynamic Savings-to-SIP Policy Selector with real-time recalculation
 * - Gold Policy Deep Dive: SGB vs Gold ETF vs Equity MFs & Lock-in matrix
 * - Grounded Gemini 3.8 Copilot
 * - PDF Export with authentic full-bleed cover & co-branded MFD footer
 */

// Get client data from URL param or default to Indian Army case
const urlParams = new URLSearchParams(window.location.search);
const requestedCaseId = urlParams.get('caseId') || 'VN-2026-ARMY-01';

const initialClient = (typeof VednovaDB !== 'undefined') 
  ? VednovaDB.getClientByCaseId(requestedCaseId)
  : null;

const state = {
  currentPortfolio: initialClient || {
    clientName: 'Col. Arvind Rathore',
    serviceBranch: 'ARMY',
    branchTitle: 'Indian Army (Infantry & Field Duty Verified)',
    caseId: 'VN-2026-ARMY-01',
    reviewDate: '2026-09-19',
    assignedRM: 'Rahul Sharma (Senior Wealth RM)',
    annualRunRate: 1107497,
    avoidedPremiums: 507497,
    futureCommitmentsAvoided: 6844982,
    statusCounts: { surrender: 2, paidUp: 1, continue: 3 },
    policies: []
  },
  activeTab: 'vault',
  activeMemberFilter: 'ALL',
  selectedBranch: initialClient ? initialClient.serviceBranch : 'ARMY',
  scenarioReturn: 0.08,
  selectedPoliciesForSIP: ['P01', 'P02', 'P03'],
  goldIntent: 'DIVERSIFICATION',
  copilotMessages: [
    {
      role: 'assistant',
      text: `**Welcome to your Vednova Policy Vault.**\n\nThis confidential audit has been conducted under strict SOP v2 fiduciary standards for **Col. Arvind Rathore (Indian Army)**.\n\nEvery policy has been audited with an unambiguous verdict:\n1. **P01 / Signature Advantage (ULIP):** **SURRENDER ON 18 SEP 2026** (5-year lock-in completes with 0% exit penalty; stops ₹10 Lakhs future payments and heavy ongoing FMC).\n2. **P02 / Elite Life Super (ULIP):** **SURRENDER NOW** (0% exit fee; release fund value to avoid ongoing fund management charges).\n3. **P03 / ICICI Pru Gold:** **CONVERT TO PAID-UP** (1.63% incremental return vs. your 7.10% DSOP benchmark; accidental rider excludes operational military duties).\n4. **P04, P05, P06 / GIFT Series:** **CONTINUE FOR INCOME** (Delivers 6.62%–7.15% guaranteed tax-free 30-year income stream).\n\nYou can explore your **Savings-to-SIP Bridge** and **Gold vs. SGB Deep Dive** above!`
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof VednovaDB !== 'undefined') {
    const loaded = VednovaDB.getClientByCaseId(requestedCaseId);
    if (loaded) {
      state.currentPortfolio = JSON.parse(JSON.stringify(loaded));
      const bInfo = (typeof VednovaSOP !== 'undefined' && VednovaSOP.resolveBranch)
        ? VednovaSOP.resolveBranch(state.currentPortfolio)
        : { name: 'Defence', pfShort: 'DSOPF', pfRate: 0.071, hasMilitaryExclusions: true };
      state.selectedBranch = bInfo.key;
      state.selectedPoliciesForSIP = state.currentPortfolio.policies
        .filter(p => {
          const evalResult = VednovaSOP.evaluatePolicy(p, state.selectedBranch);
          return evalResult.verdict === 'SURRENDER' || evalResult.verdict === 'PAID-UP';
        })
        .map(p => p.id);

      state.copilotMessages = [
        {
          role: 'assistant',
          text: `**Welcome to your Vednova Policy Vault.**\n\nThis confidential audit has been conducted under strict fiduciary standards for **${state.currentPortfolio.clientName} (${bInfo.name})**.\n\nAll policy contracts have been benchmarked against statutory alternatives: **${bInfo.pfShort} (${(bInfo.pfRate * 100).toFixed(2)}%)**.\n• **Avoided Premium Leakage:** ${VednovaMath ? VednovaMath.formatINR(state.currentPortfolio.avoidedPremiums || 0) : '₹' + (state.currentPortfolio.avoidedPremiums || 0).toLocaleString('en-IN')}/year freed for compounding.\n• **Operational Exclusion Check:** ${bInfo.hasMilitaryExclusions ? 'Military and field duty exclusions audited on accidental riders.' : 'Civilian profile verified with zero armed forces duty exclusions.'}\n\nAsk me about policy verdicts, surrender lock-ins, or the Savings-to-SIP bridge!`
        }
      ];
    }
  }

  initNavigation();
  initScenarioSlider();
  initGoldIntentToggle();
  initSIPPolicySelector();
  initCopilot();
  initUpload();
  renderClientHeader();
  renderPortfolio();
});

function initNavigation() {
  const tabs = ['vault', 'scenarios', 'calendar', 'sip-bridge'];
  tabs.forEach(tab => {
    const btn = document.getElementById(`tab-btn-${tab}`);
    if (btn) {
      btn.addEventListener('click', () => {
        state.activeTab = tab;
        tabs.forEach(t => {
          const b = document.getElementById(`tab-btn-${t}`);
          const panel = document.getElementById(`panel-${t}`);
          if (b) {
            if (t === tab) {
              b.classList.add('bg-gold-500', 'text-ink-950', 'font-semibold');
              b.classList.remove('text-slate-400', 'hover:text-slate-200');
            } else {
              b.classList.remove('bg-gold-500', 'text-ink-950', 'font-semibold');
              b.classList.add('text-slate-400', 'hover:text-slate-200');
            }
          }
          if (panel) panel.classList.toggle('hidden', t !== tab);
        });
      });
    }
  });
}

function renderClientHeader() {
  const p = state.currentPortfolio;
  const branchInfo = (typeof VednovaSOP !== 'undefined' && VednovaSOP.resolveBranch)
    ? VednovaSOP.resolveBranch(p)
    : (VednovaSOP.DEFENCE_BRANCHES[state.selectedBranch] || VednovaSOP.DEFENCE_BRANCHES.ARMY);
  state.selectedBranch = branchInfo.key;

  const caseIdEl = document.getElementById('client-case-id-badge');
  if (caseIdEl) caseIdEl.textContent = `CASE ${p.caseId}`;

  const nameEl = document.getElementById('client-display-name');
  if (nameEl) nameEl.textContent = p.clientName;

  const branchTitleEl = document.getElementById('client-branch-title-text');
  if (branchTitleEl) {
    branchTitleEl.textContent = p.branchTitle || `${branchInfo.name} (Verified Service Rules)`;
  }

  const verifiedBadge = document.getElementById('client-branch-verified-badge');
  if (verifiedBadge) {
    const branchIcons = {
      ARMY: '⚔️',
      NAVY: '⚓',
      AIR_FORCE: '✈️',
      PARAMILITARY: '🛡️',
      CIVILIAN_SALARIED: '💼',
      CIVILIAN: '👔'
    };
    const icon = branchIcons[branchInfo.key] || '👔';
    verifiedBadge.innerHTML = `<span>${icon}</span><span id="client-branch-title-text">${p.branchTitle || branchInfo.name}</span>`;
  }

  const rmEl = document.getElementById('client-rm-display');
  if (rmEl) rmEl.textContent = `Serviced by RM: ${p.assignedRM || 'Rahul Sharma, Zenith Wealth'}`;

  // Resolve distributor firm for this client
  const firm = (typeof VednovaDB !== 'undefined') 
    ? VednovaDB.getFirmByClient(p)
    : null;
  const firmName = firm ? firm.firmName : 'Zenith Wealth Advisors Pvt. Ltd.';
  const firmYear = firm && firm.establishedYear ? `(Est. ${firm.establishedYear})` : '';
  const firmArn = firm && firm.arn ? firm.arn : '';

  // Header meta firm tag
  const firmDisplayEl = document.getElementById('client-firm-display');
  if (firmDisplayEl) {
    firmDisplayEl.textContent = `Distributor: ${firmName}${firmArn ? ' (' + firmArn + ')' : ''}`;
  }

  // Client banner fiduciary statement
  const bannerFirmEl = document.getElementById('client-banner-firm-name');
  if (bannerFirmEl) {
    bannerFirmEl.textContent = firmName;
  }

  // Client banner segment benchmark statement
  const bannerStatementEl = document.getElementById('client-benchmark-banner-statement');
  if (bannerStatementEl) {
    bannerStatementEl.innerHTML = `benchmarked against ${branchInfo.benchmarkSentence}.`;
  }

  // Tab 2: Sovereign Comparison Card dynamic update
  const sovereignHeading = document.getElementById('sovereign-comparison-heading');
  if (sovereignHeading) {
    sovereignHeading.textContent = `Why ICICI Pru Gold Loses to ${branchInfo.pfShort}`;
  }
  const dsopLabel = document.getElementById('dsop-benchmark-label');
  if (dsopLabel) {
    dsopLabel.textContent = `${branchInfo.pfShort} (${branchInfo.categoryLabel})`;
  }
  const dsopRate = document.getElementById('dsop-benchmark-rate');
  if (dsopRate) {
    dsopRate.textContent = `${(branchInfo.pfRate * 100).toFixed(2)}% Sovereign`;
  }
  const dsopSub = document.getElementById('dsop-benchmark-sub');
  if (dsopSub) {
    dsopSub.textContent = branchInfo.key === 'CIVILIAN_SALARIED' ? 'EPFO Backed & Tax-Free Growth' : 'Tax-Free & Zero Deductions';
  }
  const sovereignConclusion = document.getElementById('sovereign-comparison-conclusion');
  if (sovereignConclusion) {
    const leakDiff = ((branchInfo.pfRate - 0.0163) * 100).toFixed(2);
    sovereignConclusion.innerHTML = `Converting Gold to Paid-Up retains all current guarantees while stopping a <strong>${leakDiff}% annual leak</strong> against ${branchInfo.sovereignAlternatives}.`;
  }

  // Copilot presets dynamic update
  const copilotSovereign = document.getElementById('copilot-preset-sovereign');
  if (copilotSovereign) {
    copilotSovereign.setAttribute('data-prompt', `How does ICICI Pru Gold compare to my ${(branchInfo.pfRate * 100).toFixed(1)}% ${branchInfo.pfShort} benchmark?`);
    copilotSovereign.textContent = `🛡️ ICICI Gold vs. ${(branchInfo.pfRate * 100).toFixed(1)}% ${branchInfo.pfShort}`;
  }
  const copilotExclusions = document.getElementById('copilot-preset-exclusions');
  if (copilotExclusions) {
    if (branchInfo.hasMilitaryExclusions) {
      copilotExclusions.setAttribute('data-prompt', `What are the specific operational exclusions on P03 for ${branchInfo.name}?`);
      copilotExclusions.textContent = `⚔️ ${branchInfo.name} Duty Exclusions`;
    } else {
      copilotExclusions.setAttribute('data-prompt', `Are there any operational or accidental rider exclusions on my policies for ${p.clientName}?`);
      copilotExclusions.textContent = `🛡️ Policy Rider & Coverage Audit`;
    }
  }

  // Dynamic Footer Attribution for active firm
  const footerFirmName = document.getElementById('footer-firm-name');
  if (footerFirmName) {
    footerFirmName.textContent = firmName;
  }
  const footerFirmYear = document.getElementById('footer-firm-year');
  if (footerFirmYear) {
    footerFirmYear.textContent = firmYear ? ` ${firmYear}` : '';
  }
  const footerLogo = document.getElementById('footer-firm-logo');
  if (footerLogo && firm && firm.logoUrl) {
    footerLogo.src = firm.logoUrl;
    footerLogo.alt = `${firmName} Logo`;
    footerLogo.classList.remove('opacity-70');
  } else if (footerLogo) {
    footerLogo.src = 'assets/brand-logo.svg';
    footerLogo.alt = 'Vednova Logo';
    footerLogo.classList.add('opacity-70');
  }

  const policyCountEl = document.getElementById('client-policy-count-text');
  if (policyCountEl) policyCountEl.textContent = `${p.policies.length} Policies Audited`;

  // Render member filter buttons
  const memberContainer = document.getElementById('member-filters-container');
  if (memberContainer) {
    const members = new Set();
    p.policies.forEach(pol => {
      if (pol.owner) members.add(pol.owner.replace('*', '').trim());
    });

    let buttonsHtml = `
      <span class="text-xs text-slate-500 uppercase tracking-wider font-mono mr-1">Filter:</span>
      <button data-member="ALL" class="member-filter-btn px-3 py-1.5 rounded-lg text-xs font-medium ${state.activeMemberFilter === 'ALL' ? 'bg-navy-700 text-gold-400 border border-gold-500/50' : 'bg-navy-900 text-slate-300 border border-slate-800'} transition">
        All (${p.policies.length} Policies)
      </button>
    `;

    members.forEach(mem => {
      const count = p.policies.filter(pol => pol.owner.includes(mem) || pol.insured.includes(mem)).length;
      const isActive = state.activeMemberFilter === mem;
      buttonsHtml += `
        <button data-member="${mem}" class="member-filter-btn px-3 py-1.5 rounded-lg text-xs font-medium ${isActive ? 'bg-navy-700 text-gold-400 border border-gold-500/50' : 'bg-navy-900 text-slate-300 border border-slate-800'} transition">
          ${mem} (${count})
        </button>
      `;
    });

    memberContainer.innerHTML = buttonsHtml;

    memberContainer.querySelectorAll('.member-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeMemberFilter = btn.dataset.member;
        renderClientHeader();
        renderPolicyCards();
      });
    });
  }
}

function initScenarioSlider() {
  const slider = document.getElementById('return-slider');
  const label = document.getElementById('return-slider-val');
  if (slider && label) {
    slider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      state.scenarioReturn = val / 100;
      label.textContent = `${val}% p.a.`;
      updateScenarioCalculations();
    });
  }
}

function initGoldIntentToggle() {
  const btnDiv = document.getElementById('gold-intent-div');
  const btnInv = document.getElementById('gold-intent-inv');

  if (btnDiv && btnInv) {
    btnDiv.addEventListener('click', () => setGoldIntent('DIVERSIFICATION'));
    btnInv.addEventListener('click', () => setGoldIntent('INVESTMENT'));
  }
}

function setGoldIntent(intent) {
  state.goldIntent = intent;
  const btnDiv = document.getElementById('gold-intent-div');
  const btnInv = document.getElementById('gold-intent-inv');

  if (intent === 'DIVERSIFICATION') {
    if (btnDiv) btnDiv.className = 'px-4 py-2 rounded-lg text-xs font-semibold bg-gold-500 text-ink-950 transition shadow';
    if (btnInv) btnInv.className = 'px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition';
  } else {
    if (btnDiv) btnDiv.className = 'px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition';
    if (btnInv) btnInv.className = 'px-4 py-2 rounded-lg text-xs font-semibold bg-gold-500 text-ink-950 transition shadow';
  }

  renderGoldComparison();
}

function initSIPPolicySelector() {
  const btnRec = document.getElementById('sip-btn-select-rec');
  const btnAll = document.getElementById('sip-btn-select-all');
  const btnClr = document.getElementById('sip-btn-clear');

  if (btnRec) btnRec.addEventListener('click', () => setSIPSelectionPreset('RECOMMENDED'));
  if (btnAll) btnAll.addEventListener('click', () => setSIPSelectionPreset('ALL'));
  if (btnClr) btnClr.addEventListener('click', () => setSIPSelectionPreset('NONE'));
}

function setSIPSelectionPreset(preset) {
  if (preset === 'RECOMMENDED') {
    state.selectedPoliciesForSIP = state.currentPortfolio.policies
      .filter(p => {
        const evalResult = VednovaSOP.evaluatePolicy(p, state.selectedBranch);
        return evalResult.verdict === 'SURRENDER' || evalResult.verdict === 'PAID-UP';
      })
      .map(p => p.id);
  } else if (preset === 'ALL') {
    state.selectedPoliciesForSIP = state.currentPortfolio.policies.map(p => p.id);
  } else {
    state.selectedPoliciesForSIP = [];
  }
  renderSIPBridge();
}

window.toggleSIPPolicy = function(policyId) {
  const idx = state.selectedPoliciesForSIP.indexOf(policyId);
  if (idx > -1) {
    state.selectedPoliciesForSIP.splice(idx, 1);
  } else {
    state.selectedPoliciesForSIP.push(policyId);
  }
  renderSIPBridge();
};

function renderPortfolio() {
  renderMetrics();
  renderPolicyCards();
  renderCalendar();
  renderSIPBridge();
  renderPayoutFrequencies();
  renderGoldComparison();
  updateScenarioCalculations();
}

function renderMetrics() {
  let annualRunRate = 0;
  let avoidedPremiums = 0;
  let futureCommitmentsAvoided = 0;

  let counts = { surrender: 0, paidUp: 0, continue: 0 };

  state.currentPortfolio.policies.forEach(p => {
    annualRunRate += p.annualPremium;
    const evaluation = VednovaSOP.evaluatePolicy(p, state.selectedBranch);

    if (evaluation.verdict === 'SURRENDER') {
      counts.surrender++;
      avoidedPremiums += p.annualPremium;
      futureCommitmentsAvoided += (p.annualPremium * (p.remainingPremiumsCount || 0));
    } else if (evaluation.verdict === 'PAID-UP') {
      counts.paidUp++;
      avoidedPremiums += p.annualPremium;
      futureCommitmentsAvoided += (p.annualPremium * (p.remainingPremiumsCount || 0));
    } else {
      counts.continue++;
    }
  });

  const runRateEl = document.getElementById('metric-run-rate');
  const avoidedEl = document.getElementById('metric-avoided');
  const futureEl = document.getElementById('metric-future');
  const statusEl = document.getElementById('metric-status-counts');

  if (runRateEl) runRateEl.textContent = VednovaMath.formatINR(annualRunRate);
  if (avoidedEl) avoidedEl.textContent = VednovaMath.formatINR(avoidedPremiums);
  if (futureEl) futureEl.textContent = VednovaMath.formatINR(futureCommitmentsAvoided);
  if (statusEl) statusEl.textContent = `${counts.surrender} Exit | ${counts.paidUp} Paid-Up | ${counts.continue} Keep`;
}

function renderPolicyCards() {
  const container = document.getElementById('policy-cards-grid');
  if (!container) return;

  const branch = state.selectedBranch;
  const branchData = VednovaSOP.DEFENCE_BRANCHES[branch] || VednovaSOP.DEFENCE_BRANCHES.ARMY;

  const filtered = state.currentPortfolio.policies.filter(p => {
    if (state.activeMemberFilter === 'ALL') return true;
    return (p.owner && p.owner.toLowerCase().includes(state.activeMemberFilter.toLowerCase())) ||
           (p.insured && p.insured.toLowerCase().includes(state.activeMemberFilter.toLowerCase()));
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-500">No policies found matching filter.</div>`;
    return;
  }

  container.innerHTML = filtered.map(policy => {
    const evalResult = VednovaSOP.evaluatePolicy(policy, branch);
    const hasExclusion = evalResult.findings.some(f => f.type === 'DEFENCE_EXCLUSION');

    const badgeColor = evalResult.verdict === 'SURRENDER' 
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
      : evalResult.verdict === 'PAID-UP'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

    return `
      <div class="bg-panel-800/90 border border-slate-800 rounded-xl p-6 hover:border-gold-500/40 transition flex flex-col justify-between relative overflow-hidden shadow-lg backdrop-blur-sm">
        
        ${hasExclusion ? `
          <div class="bg-rose-950/40 border border-rose-500/40 text-rose-200 text-[11px] p-2.5 rounded-lg mb-4 flex items-center gap-2 font-medium">
            <span>⚠️</span>
            <span><strong>${branchData.name} Risk:</strong> Accidental rider excludes active combat and operational duties!</span>
          </div>
        ` : ''}

        <div>
          <!-- Top Row -->
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-mono px-2.5 py-1 rounded bg-navy-950 border border-slate-800 text-slate-300 font-bold">
              ${policy.id} · ${policy.maskedId}
            </span>
            <span class="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded border ${badgeColor}">
              ${evalResult.verdict}
            </span>
          </div>

          <h3 class="text-xl font-serif text-white mb-1 font-medium">${policy.productName}</h3>
          <p class="text-xs text-slate-400 font-mono mb-4">UIN: ${policy.uin} | ${policy.insurer}</p>

          <!-- Core Numbers -->
          <div class="grid grid-cols-2 gap-3 mb-4 text-xs bg-navy-950/70 p-3 rounded-lg border border-slate-800/80">
            <div>
              <span class="text-slate-500 block uppercase text-[10px] tracking-wider">Owner / Insured</span>
              <strong class="text-slate-200 font-medium">${policy.owner}</strong><br>
              <span class="text-slate-400 text-[11px]">Ins: ${policy.insured}</span>
            </div>
            <div>
              <span class="text-slate-500 block uppercase text-[10px] tracking-wider">Annual Premium</span>
              <strong class="text-gold-300 text-sm font-semibold">${VednovaMath.formatINR(policy.annualPremium)}</strong>
              <span class="text-slate-400 block text-[10px] mt-0.5">Due: ${policy.nextDue || 'Annually'}</span>
            </div>
          </div>

          <!-- Definitive Verdict Banner -->
          <div class="p-3.5 rounded-lg bg-navy-900 border border-slate-700/80 mb-4">
            <span class="text-[10px] font-mono text-gold-400 uppercase tracking-wider block font-semibold mb-1">
              ACTIONABLE VERDICT:
            </span>
            <strong class="text-xs text-white block mb-1.5">${evalResult.verdictHeadline}</strong>
            <p class="text-[11.5px] text-slate-300 leading-relaxed">${evalResult.verdictRationale}</p>
          </div>

          <!-- Action Steps -->
          <div class="mb-4 text-xs">
            <span class="text-slate-400 text-[10px] uppercase tracking-wider font-semibold block mb-1.5">Execution Steps:</span>
            <ul class="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
              ${evalResult.actionSteps.map(st => `<li>${st}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs">
          <span class="text-slate-400 font-mono text-[10px]">Benchmark: ${branchData.pfName.split(' ')[0]} 7.1%</span>
          <button onclick="askCopilotAboutPolicy('${policy.id}')" class="text-gold-400 hover:text-gold-300 font-medium flex items-center gap-1 text-xs">
            <span>Deep Audit</span> →
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderPayoutFrequencies() {
  const container = document.getElementById('payout-frequency-table');
  if (!container) return;

  const p4 = state.currentPortfolio.policies.find(p => p.id === 'P04') || state.currentPortfolio.policies[0];
  if (!p4) return;

  const comparison = VednovaSOP.comparePayoutFrequencies(p4);

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 rounded-xl bg-navy-950 border border-emerald-500/40">
        <span class="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-bold block mb-1">RECOMMENDED ROUTE</span>
        <h4 class="text-base font-serif text-white font-medium mb-2">${comparison.annual.frequency}</h4>
        <div class="text-2xl font-serif text-gold-300 font-bold mb-1">${VednovaMath.formatINR(comparison.annual.payout)}/yr</div>
        <p class="text-xs text-slate-400 mb-2">Paid annually for ${comparison.annual.durationYears} consecutive years.</p>
        <div class="text-xs font-mono text-emerald-400 font-bold">Incremental XIRR: ${(comparison.annual.incrementalXIRR * 100).toFixed(2)}% Tax-Free</div>
      </div>

      <div class="p-4 rounded-xl bg-navy-950 border border-slate-800">
        <span class="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold block mb-1">MONTHLY REGULAR</span>
        <h4 class="text-base font-serif text-white font-medium mb-2">${comparison.monthly.frequency}</h4>
        <div class="text-2xl font-serif text-slate-200 font-bold mb-1">~${VednovaMath.formatINR(comparison.monthly.payout)}/mo</div>
        <p class="text-xs text-slate-400 mb-2">Equivalent monthly cash-flow for household utility expenses.</p>
        <div class="text-xs font-mono text-slate-300 font-bold">Incremental XIRR: ${(comparison.monthly.incrementalXIRR * 100).toFixed(2)}% Tax-Free</div>
      </div>

      <div class="p-4 rounded-xl bg-navy-950 border border-rose-500/30">
        <span class="text-[10px] font-mono uppercase text-rose-400 tracking-wider font-bold block mb-1">MATURITY LUMP SUM</span>
        <h4 class="text-base font-serif text-white font-medium mb-2">${comparison.commutedLumpSum.frequency}</h4>
        <div class="text-2xl font-serif text-rose-300 font-bold mb-1">${VednovaMath.formatINR(comparison.commutedLumpSum.payout)}</div>
        <p class="text-xs text-slate-400 mb-2">Single one-time discounted lump sum at policy maturity.</p>
        <div class="text-xs font-mono text-rose-400 font-bold">Yield Drops to: ${(comparison.commutedLumpSum.incrementalXIRR * 100).toFixed(2)}% (Inferior)</div>
      </div>
    </div>
  `;
}

function renderGoldComparison() {
  const container = document.getElementById('gold-comparison-results-container');
  if (!container) return;

  const goldData = VednovaMath.compareGoldOptions({
    annualInvestment: 300000,
    tenureYears: 10,
    goldAppreciationRate: 0.08
  });

  if (state.goldIntent === 'DIVERSIFICATION') {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="p-5 rounded-xl bg-navy-950 border border-emerald-500/40 relative overflow-hidden">
          <div class="absolute top-0 right-0 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-3 py-1 font-bold rounded-bl uppercase">
            BEST FOR GOLD DIVERSIFICATION
          </div>
          <span class="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-bold block mb-1">SOVEREIGN INSTRUMENT</span>
          <h4 class="text-lg font-serif text-white font-medium mb-1">Sovereign Gold Bonds (SGB)</h4>
          <p class="text-xs text-slate-400 mb-3">Issued by RBI on behalf of Government of India.</p>

          <div class="space-y-2 text-xs mb-4">
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Guaranteed Coupon:</span>
              <strong class="text-emerald-400 font-mono">2.50% p.a. Cash Payout</strong>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Gold Capital Gain:</span>
              <strong class="text-slate-200 font-mono">100% Market Appreciation</strong>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Section 47(viic) Tax:</span>
              <strong class="text-emerald-400 font-bold font-mono">100% TAX-FREE</strong>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Product Lock-in:</span>
              <strong class="text-slate-200 font-mono">8 Years (Liquid on NSE/BSE)</strong>
            </div>
          </div>

          <div class="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs">
            <div class="text-[10px] text-slate-400 uppercase">10-Yr Projected Value (₹3L/yr):</div>
            <div class="text-xl font-serif text-gold-300 font-bold">${VednovaMath.formatINR(goldData.sgb.terminalWealth, true)}</div>
            <span class="text-[11px] text-emerald-300 font-medium">Effective CAGR: ~10.5% Tax-Free</span>
          </div>
        </div>

        <div class="p-5 rounded-xl bg-navy-950 border border-slate-800">
          <span class="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold block mb-1">EXCHANGE TRADED</span>
          <h4 class="text-lg font-serif text-white font-medium mb-1">Gold ETFs / Gold FoFs</h4>
          <p class="text-xs text-slate-400 mb-3">Pure physical 99.5% gold bullion backing via AMCs.</p>

          <div class="space-y-2 text-xs mb-4">
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Underlying Purity:</span>
              <strong class="text-slate-200 font-mono">99.5% 24 Karat Gold</strong>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Expense Ratio:</span>
              <strong class="text-slate-200 font-mono">~0.30% to 0.40% p.a.</strong>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Product Lock-in:</span>
              <strong class="text-emerald-400 font-bold font-mono">ZERO LOCK-IN (T+1 Liquid)</strong>
            </div>
          </div>

          <div class="p-3 bg-navy-900 border border-slate-800 rounded-lg text-xs">
            <div class="text-[10px] text-slate-400 uppercase">10-Yr Projected Value (₹3L/yr):</div>
            <div class="text-xl font-serif text-slate-200 font-bold">${VednovaMath.formatINR(goldData.goldETF.terminalWealth, true)}</div>
            <span class="text-[11px] text-slate-400 font-medium">Net CAGR: ~7.70% (Full Liquidity)</span>
          </div>
        </div>

        <div class="p-5 rounded-xl bg-navy-950 border border-rose-500/40">
          <span class="text-[10px] font-mono uppercase text-rose-400 tracking-wider font-bold block mb-1">TRADITIONAL INSURANCE</span>
          <h4 class="text-lg font-serif text-white font-medium mb-1">ICICI Pru Gold (P03)</h4>
          <p class="text-xs text-slate-400 mb-3">Fixed endowment policy themed around gold branding.</p>

          <div class="space-y-2 text-xs mb-4">
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Actual Gold Exposure:</span>
              <strong class="text-rose-400 font-mono font-bold">0% (Zero Physical Gold)</strong>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Contractual Floor Yield:</span>
              <strong class="text-rose-300 font-mono">1.50% p.a. (Sub-par)</strong>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Product Lock-in:</span>
              <strong class="text-rose-400 font-bold font-mono">34 YEARS (Rigid Lock-in)</strong>
            </div>
          </div>

          <div class="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-xs">
            <div class="text-[10px] text-slate-400 uppercase">Fiduciary Recommendation:</div>
            <div class="text-base font-bold text-amber-300 mt-1">CONVERT TO PAID-UP</div>
            <span class="text-[11px] text-slate-300 font-medium">Stops ₹18 Lakhs future leak; redeploy into SGB/Gold ETF.</span>
          </div>
        </div>
      </div>
    `;
  } else {
    const equityProjection = VednovaMath.projectSIP(300000, 0.12);
    const eq10Yr = equityProjection.projections.find(p => p.years === 10) || { futureValue: 5860000 };

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-6 rounded-xl bg-navy-950 border border-emerald-500/40">
          <span class="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-bold block mb-1">FIDUCIARY INVESTMENT VEHICLE</span>
          <h4 class="text-xl font-serif text-white font-medium mb-1">Diversified Equity Mutual Funds (12% CAGR)</h4>
          <p class="text-xs text-slate-400 mb-4">Invest ₹3,00,000/year (₹25,000/month) in broad Nifty 50 / Flexicap funds.</p>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="p-3 bg-navy-900 border border-slate-800 rounded-lg">
              <span class="text-[10px] text-slate-400 uppercase block">10-Yr Invested:</span>
              <strong class="text-white text-base font-mono">₹30,00,000</strong>
            </div>
            <div class="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-lg">
              <span class="text-[10px] text-emerald-300 uppercase block">10-Yr Wealth Created:</span>
              <strong class="text-gold-300 text-xl font-serif font-bold">~${VednovaMath.formatINR(eq10Yr.futureValue, true)}</strong>
            </div>
          </div>

          <div class="space-y-2 text-xs mb-4 text-slate-300">
            <div class="flex items-center gap-2">
              <span class="text-emerald-400">✓</span>
              <span><strong>Zero Lock-in:</strong> Redeem or pause SIP at any time without insurer penalties.</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-400">✓</span>
              <span><strong>Superior Compounding:</strong> Generates ~₹28.6 Lakhs in pure capital appreciation.</span>
            </div>
          </div>
        </div>

        <div class="p-6 rounded-xl bg-navy-950 border border-rose-500/40">
          <span class="text-[10px] font-mono uppercase text-rose-400 tracking-wider font-bold block mb-1">TRADITIONAL POLICY OPPORTUNITY COST</span>
          <h4 class="text-xl font-serif text-white font-medium mb-1">ICICI Pru Gold Policy (1.50% - 3.28% Yield)</h4>
          <p class="text-xs text-slate-400 mb-4">Paying ₹3,00,000/year for 10 years into traditional endowment.</p>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="p-3 bg-navy-900 border border-slate-800 rounded-lg">
              <span class="text-[10px] text-slate-400 uppercase block">10-Yr Invested:</span>
              <strong class="text-white text-base font-mono">₹30,00,000</strong>
            </div>
            <div class="p-3 bg-rose-950/50 border border-rose-500/40 rounded-lg">
              <span class="text-[10px] text-rose-300 uppercase block">10-Yr Guaranteed Value:</span>
              <strong class="text-rose-300 text-xl font-serif font-bold">₹30,00,000 (0 Real Gain)</strong>
            </div>
          </div>

          <div class="p-3 bg-navy-900 border border-slate-800 rounded-lg text-xs space-y-2 text-slate-300">
            <div class="text-rose-300 font-bold">Opportunity Cost: ~₹28.6 Lakhs Lost!</div>
            <p class="text-[11.5px] leading-relaxed text-slate-400">
              Converting to Paid-Up retains all accrued guarantees while stopping a 34-year liquidity freeze.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

function renderCalendar() {
  const calendarList = document.getElementById('calendar-schedule-list');
  if (!calendarList) return;

  const items = [
    { date: '18 Sep 2026', policy: 'P01 / Signature Advantage', verdict: 'SURRENDER', amount: '₹2,00,000 Avoided', urgency: '5-Yr Lock-in Ends (0 Exit Penalty)', color: 'border-rose-500/50 bg-rose-950/20 text-rose-300' },
    { date: '29 Aug 2027', policy: 'P03 / ICICI Pru Gold', verdict: 'CONVERT TO PAID-UP', amount: '₹3,07,497 Avoided', urgency: 'Cancel auto-debit; yield is 1.63%', color: 'border-amber-500/50 bg-amber-950/20 text-amber-300' },
    { date: '30 Sep 2026', policy: 'P02 / Elite Life Super', verdict: 'SURRENDER', amount: 'Fund Value Released', urgency: 'Stop ongoing FMC & mortality charges', color: 'border-rose-500/50 bg-rose-950/20 text-rose-300' },
    { date: '30 Mar 2027', policy: 'P05 / GIFT Pro', verdict: 'CONTINUE', amount: '₹2,00,000 Scheduled', urgency: 'Submit 18-Yr Vesting Documents', color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' },
    { date: '15 May 2027', policy: 'P04 + P06 / GIFT Long-Term', verdict: 'CONTINUE', amount: '₹4,00,000 Scheduled', urgency: 'Lock-in 7.15% & 6.87% Guaranteed 30-Yr Income', color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' }
  ];

  calendarList.innerHTML = items.map(it => `
    <div class="flex items-center justify-between p-4 rounded-xl border ${it.color} backdrop-blur-sm">
      <div class="flex items-center gap-4">
        <div class="text-sm font-mono font-bold w-28">${it.date}</div>
        <div>
          <div class="flex items-center gap-2">
            <strong class="text-white text-sm">${it.policy}</strong>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 uppercase tracking-wider">${it.verdict}</span>
          </div>
          <span class="text-xs opacity-80">${it.urgency}</span>
        </div>
      </div>
      <div class="text-right font-mono font-bold text-sm">
        ${it.amount}
      </div>
    </div>
  `).join('');
}

function renderSIPBridge() {
  const selectorContainer = document.getElementById('sip-policy-selector-list');
  if (selectorContainer) {
    selectorContainer.innerHTML = state.currentPortfolio.policies.map(p => {
      const isSelected = state.selectedPoliciesForSIP.includes(p.id);
      const evalResult = VednovaSOP.evaluatePolicy(p, state.selectedBranch);
      
      const badgeColor = evalResult.verdict === 'SURRENDER' 
        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
        : evalResult.verdict === 'PAID-UP'
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

      return `
        <div class="flex items-center justify-between p-3 rounded-lg border ${isSelected ? 'border-gold-500/60 bg-gold-500/10' : 'border-slate-800 bg-navy-950/60'} transition cursor-pointer hover:border-slate-700" onclick="toggleSIPPolicy('${p.id}')">
          <div class="flex items-center gap-3">
            <input type="checkbox" ${isSelected ? 'checked' : ''} class="w-4 h-4 accent-gold-500 cursor-pointer pointer-events-none">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold text-white">${p.id}</span>
                <span class="text-xs text-slate-200 font-medium">${p.productName}</span>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}">${evalResult.verdict}</span>
              </div>
              <span class="text-[11px] text-slate-400 font-mono">Owner: ${p.owner} | Term: ${p.pt}y (PPT: ${p.ppt}y)</span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs font-mono font-bold text-gold-300">${VednovaMath.formatINR(p.annualPremium)}/yr</div>
            <span class="text-[10px] text-slate-500">${isSelected ? 'Redirecting to SIP' : 'Continuing in Policy'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  let dynamicAvoided = 0;
  state.currentPortfolio.policies.forEach(p => {
    if (state.selectedPoliciesForSIP.includes(p.id)) {
      dynamicAvoided += p.annualPremium;
    }
  });

  const projection = VednovaMath.projectSIP(dynamicAvoided, 0.12);

  const avoidedEl = document.getElementById('sip-annual-avoided');
  const monthlyEl = document.getElementById('sip-monthly-amount');
  const selectedCountEl = document.getElementById('sip-selected-count-badge');

  if (avoidedEl) avoidedEl.textContent = VednovaMath.formatINR(dynamicAvoided);
  if (monthlyEl) monthlyEl.textContent = VednovaMath.formatINR(projection.monthlySIP);
  if (selectedCountEl) selectedCountEl.textContent = `${state.selectedPoliciesForSIP.length} Policies Selected`;

  const container = document.getElementById('sip-cards-container');
  if (container) {
    container.innerHTML = projection.projections.map(p => `
      <div class="bg-navy-950/70 border border-slate-800 p-5 rounded-xl text-center hover:border-gold-500/40 transition">
        <span class="text-xs uppercase tracking-widest text-slate-400 block mb-2">${p.years} Years Horizon</span>
        <div class="text-2xl font-serif font-bold text-gold-300 mb-1">${VednovaMath.formatINR(p.futureValue, true)}</div>
        <p class="text-xs text-slate-400">Total Invested: ${VednovaMath.formatINR(p.totalInvested, true)}</p>
        <p class="text-xs text-emerald-400 font-semibold mt-1">+${VednovaMath.formatINR(p.estimatedGain, true)} Wealth Gain</p>
      </div>
    `).join('');
  }
}

function updateScenarioCalculations() {
  const r = state.scenarioReturn;
  const p4Hurdle = VednovaMath.calculateSurrenderHurdle({
    guaranteedTerminalWealth: 3463282,
    paidUpTerminalWealth: 1154427,
    remainingPremiums: Array(8).fill({ date: '2027-05-15', amount: 200000 }),
    maturityDate: '2037-05-15',
    hurdleRate: r
  });

  const p5Hurdle = VednovaMath.calculateSurrenderHurdle({
    guaranteedTerminalWealth: 3412150,
    paidUpTerminalWealth: 853038,
    remainingPremiums: Array(9).fill({ date: '2027-03-30', amount: 200000 }),
    maturityDate: '2038-03-30',
    hurdleRate: r
  });

  const p4Val = document.getElementById('hurdle-p04-val');
  const p5Val = document.getElementById('hurdle-p05-val');
  if (p4Val) p4Val.textContent = VednovaMath.formatINR(p4Hurdle.netSurrenderRequired);
  if (p5Val) p5Val.textContent = VednovaMath.formatINR(p5Hurdle.netSurrenderRequired);
}

function initCopilot() {
  const form = document.getElementById('copilot-form');
  const input = document.getElementById('copilot-input');
  const msgList = document.getElementById('copilot-messages');

  if (form && input) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      state.copilotMessages.push({ role: 'user', text: query });
      renderCopilotMessages();
      input.value = '';

      const typingIdx = state.copilotMessages.length;
      state.copilotMessages.push({ role: 'assistant', text: 'Analyzing with Gemini 3.8 Flash...', isTyping: true });
      renderCopilotMessages();

      try {
        const reply = await VednovaGemini.askPolicyCopilot(query, {
          portfolio: state.currentPortfolio,
          serviceBranch: state.selectedBranch
        });
        state.copilotMessages[typingIdx] = { role: 'assistant', text: reply };
      } catch (err) {
        state.copilotMessages[typingIdx] = { role: 'assistant', text: `Error: ${err.message}` };
      }
      renderCopilotMessages();
    });
  }

  document.querySelectorAll('.copilot-preset').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.prompt;
      form.dispatchEvent(new Event('submit'));
    });
  });
}

function renderCopilotMessages() {
  const list = document.getElementById('copilot-messages');
  if (!list) return;

  list.innerHTML = state.copilotMessages.map(m => `
    <div class="flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} mb-3">
      <span class="text-[10px] text-slate-500 mb-1 px-1 font-mono uppercase">${m.role === 'user' ? 'You' : 'Vednova Intelligence'}</span>
      <div class="max-w-[88%] text-xs p-3.5 rounded-xl ${m.role === 'user' ? 'bg-gold-500 text-ink-950 font-semibold' : 'bg-navy-950 border border-slate-800 text-slate-200'} leading-relaxed whitespace-pre-line">
        ${m.text}
      </div>
    </div>
  `).join('');

  list.scrollTop = list.scrollHeight;
}

window.askCopilotAboutPolicy = function(policyId) {
  const p = state.currentPortfolio.policies.find(x => x.id === policyId);
  if (!p) return;
  const input = document.getElementById('copilot-input');
  if (input) {
    input.value = `State the definitive verdict and financial rationale for ${p.id} (${p.productName}) under our ${state.selectedBranch} rules.`;
    document.getElementById('copilot-form').dispatchEvent(new Event('submit'));
  }
};

function initUpload() {
  const dropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('policy-file-input');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      dropzone.innerHTML = `<div class="text-gold-400 animate-pulse text-xs font-semibold">Gemini 3.8 Flash reading policy document...</div>`;

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];
        try {
          const extracted = await VednovaGemini.extractPolicyFromDocument(base64Data, file.type);
          alert(`Gemini successfully parsed: ${extracted.productName}`);
          state.currentPortfolio.policies.push({
            id: `P0${state.currentPortfolio.policies.length + 1}`,
            maskedId: extracted.policyNumberMasked || '****' + Math.floor(1000 + Math.random() * 9000),
            productName: extracted.productName || 'Uploaded Policy',
            uin: extracted.uin || 'UNVERIFIED',
            insurer: extracted.insurer || 'Insurer',
            owner: extracted.policyHolder || state.currentPortfolio.clientName,
            insured: extracted.lifeAssured || state.currentPortfolio.clientName,
            isULIP: Boolean(extracted.isULIP),
            annualPremium: Number(extracted.annualBasePremium || 100000),
            sumAssured: Number(extracted.sumAssured || 1000000),
            issueDate: extracted.issueDate || '2024-01-01',
            ppt: extracted.premiumPayingTerm || 10,
            pt: extracted.policyTerm || 10,
            nextDue: extracted.nextScheduledPremiumDate || 'Next Anniversary',
            hasAccidentalRider: (extracted.riders && extracted.riders.length > 0)
          });
          if (typeof VednovaDB !== 'undefined') {
            VednovaDB.saveClient(state.currentPortfolio);
          }
          renderClientHeader();
          renderPortfolio();
        } catch (err) {
          alert(`Gemini Extraction: ${err.message}`);
        }
        dropzone.innerHTML = `<div class="text-xs text-slate-300 font-medium">Add Policy PDF (Gemini 3.8 OCR)</div>`;
      };
      reader.readAsDataURL(file);
    });
  }
}

window.triggerPDFExport = function(type) {
  const firm = (typeof VednovaDB !== 'undefined') 
    ? VednovaDB.getFirmByClient(state.currentPortfolio) 
    : null;
  VednovaPDF.generateReport(type, state.currentPortfolio, state.scenarioReturn, state.selectedBranch, firm);
};

window.openApiKeyModal = function() {
  const currentKey = VednovaGemini.getApiKey();
  const key = prompt('Enter your Google Gemini API Key:\n(Leave empty to remove)', currentKey);
  if (key !== null) {
    VednovaGemini.setApiKey(key);
    alert(key ? 'Gemini API Key saved in browser!' : 'API Key removed.');
  }
};
