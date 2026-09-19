/**
 * Vednova Insurance Review SOP v2 - Enhanced Decision Engine
 * 
 * Key Upgrades:
 * 1. Definitive Actionable Verdicts: SURRENDER / PAID-UP / CONTINUE (No ambiguity).
 * 2. ULIP Exit Rule: 0 exit fee / post lock-in -> ALWAYS SURRENDER (FMC & mortality drag).
 * 3. Bonus Rate Fallback: Uses 4% statutory lower illustration when current bonus is unstated.
 * 4. Defence Branch-Specific Exclusion Engine (Army, Navy, Air Force, Coast Guard/Paramilitary).
 * 5. Defence Provident Fund (DSOP / AFPP / GPF) 7.10% Sovereign Tax-Free Benchmark.
 * 6. Payout Frequency Economics: Annual vs. Monthly vs. Maturity Commutation.
 */

const VednovaSOP = {
  STATUS: {
    CONTINUE: 'CONTINUE',
    PAID_UP: 'PAID-UP',
    SURRENDER: 'SURRENDER'
  },

  DEFENCE_BRANCHES: {
    ARMY: {
      key: 'ARMY',
      name: 'Indian Army',
      category: 'OFFICER',
      categoryLabel: 'Army Officer',
      pfShort: 'DSOPF',
      pfName: 'DSOPF (Defence Services Officers Provident Fund)',
      pfRate: 0.071,
      isDefence: true,
      hasMilitaryExclusions: true,
      sovereignAlternatives: 'DSOPF (7.10% Tax-Free) & AFGIS',
      benchmarkSentence: 'your service-connected <strong>7.10% Tax-Free DSOPF</strong>, and audited for operational military combat/field duty exclusions',
      exclusionKeywords: ['warlike', 'field duty', 'counter-insurgency', 'armed forces duties during war or peace'],
      exclusionAdvice: 'Rider excludes armed-forces operational duties, combat, and field duties. Not valid for operational army service.'
    },
    NAVY: {
      key: 'NAVY',
      name: 'Indian Navy',
      category: 'OFFICER',
      categoryLabel: 'Naval Officer',
      pfShort: 'DSOPF / AFPPF',
      pfName: 'DSOPF (Navy) / AFPPF',
      pfRate: 0.071,
      isDefence: true,
      hasMilitaryExclusions: true,
      sovereignAlternatives: 'DSOPF (7.10% Tax-Free) & NGIF',
      benchmarkSentence: 'your service-connected <strong>7.10% Tax-Free DSOPF / AFPPF</strong>, and audited for naval operations & sea duty exclusions',
      exclusionKeywords: ['naval operations', 'sea duty', 'diving', 'submarine', 'armed forces duties during war or peace'],
      exclusionAdvice: 'Rider excludes naval operations, sea hazards, and military service during war or peace. Not valid for naval operational duty.'
    },
    AIR_FORCE: {
      key: 'AIR_FORCE',
      name: 'Indian Air Force',
      category: 'OFFICER',
      categoryLabel: 'Air Force Officer',
      pfShort: 'DSOPF / AFPPF',
      pfName: 'DSOPF (Air Force) / AFPPF',
      pfRate: 0.071,
      isDefence: true,
      hasMilitaryExclusions: true,
      sovereignAlternatives: 'DSOPF (7.10% Tax-Free) & AFGIS',
      benchmarkSentence: 'your service-connected <strong>7.10% Tax-Free DSOPF / AFPPF</strong>, and audited for non-scheduled flight & aviation exclusions',
      exclusionKeywords: ['aviation', 'military aircraft', 'flying duties', 'armed forces duties during war or peace'],
      exclusionAdvice: 'Rider excludes non-scheduled aviation, flying duties, and air-force operations. Excludes operational IAF service.'
    },
    PARAMILITARY: {
      key: 'PARAMILITARY',
      name: 'Govt Employee & Paramilitary',
      category: 'GOVT',
      categoryLabel: 'Government Employee / CAPF',
      pfShort: 'GPF',
      pfName: 'GPF (General Provident Fund)',
      pfRate: 0.071,
      isDefence: false,
      hasMilitaryExclusions: true,
      sovereignAlternatives: 'GPF (7.10% Sovereign Tax-Free) & CGEGIS',
      benchmarkSentence: 'your statutory <strong>7.10% Tax-Free GPF (General Provident Fund)</strong>, and audited under central civil service rules',
      exclusionKeywords: ['border security', 'maritime patrol', 'police action', 'armed conflict'],
      exclusionAdvice: 'Rider excludes tactical deployment and paramilitary operational duties.'
    },
    CIVILIAN_SALARIED: {
      key: 'CIVILIAN_SALARIED',
      name: 'Corporate & Salaried Professional',
      category: 'CIVILIAN',
      categoryLabel: 'Salaried Professional',
      pfShort: 'EPF / VPF',
      pfName: 'EPF / VPF (Employees\' Provident Fund)',
      pfRate: 0.0825,
      isDefence: false,
      hasMilitaryExclusions: false,
      sovereignAlternatives: 'EPF (8.25% Sovereign Backed) & PPF (7.10%)',
      benchmarkSentence: 'your statutory <strong>8.25% Sovereign EPF/VPF</strong>, with zero armed forces operational duty exclusions',
      exclusionKeywords: ['hazardous occupation'],
      exclusionAdvice: 'Standard civilian policy. No armed forces exclusions apply.'
    },
    CIVILIAN: {
      key: 'CIVILIAN',
      name: 'Civilian / Entrepreneur / Professional',
      category: 'CIVILIAN',
      categoryLabel: 'Civilian / Entrepreneur',
      pfShort: 'PPF & SGB',
      pfName: 'PPF (Public Provident Fund) & SGB',
      pfRate: 0.071,
      isDefence: false,
      hasMilitaryExclusions: false,
      sovereignAlternatives: 'PPF (7.10% Tax-Free EEE) & Sovereign Gold Bonds (SGB)',
      benchmarkSentence: 'statutory <strong>7.10% Tax-Free PPF & Sovereign Gold Bonds (SGB)</strong>, with zero armed forces operational exclusions',
      exclusionKeywords: ['hazardous occupation'],
      exclusionAdvice: 'Standard civilian policy. No armed forces exclusions apply.'
    }
  },

  resolveBranch(input) {
    if (!input) return this.DEFENCE_BRANCHES.ARMY;
    if (typeof input === 'string') {
      const key = input.toUpperCase().trim();
      if (this.DEFENCE_BRANCHES[key]) return this.DEFENCE_BRANCHES[key];
      if (key.includes('ARMY')) return this.DEFENCE_BRANCHES.ARMY;
      if (key.includes('NAVY')) return this.DEFENCE_BRANCHES.NAVY;
      if (key.includes('AIR')) return this.DEFENCE_BRANCHES.AIR_FORCE;
      if (key.includes('PARA') || key.includes('GOVT') || key.includes('CAPF')) return this.DEFENCE_BRANCHES.PARAMILITARY;
      if (key.includes('SALAR') || key.includes('CORP') || key.includes('EPF')) return this.DEFENCE_BRANCHES.CIVILIAN_SALARIED;
      return this.DEFENCE_BRANCHES.CIVILIAN;
    }
    const branchKey = (input.serviceBranch || '').toUpperCase().trim();
    const branchTitle = (input.branchTitle || '').toLowerCase();

    if (branchKey === 'CIVILIAN' || branchKey === 'CIVILIAN_SALARIED') {
      if (branchKey === 'CIVILIAN_SALARIED' || 
          branchTitle.includes('corporate') || 
          branchTitle.includes('vp') || 
          branchTitle.includes('president') || 
          branchTitle.includes('salaried') || 
          branchTitle.includes('executive') || 
          branchTitle.includes('manager') || 
          branchTitle.includes('director')) {
        return this.DEFENCE_BRANCHES.CIVILIAN_SALARIED;
      }
      return this.DEFENCE_BRANCHES.CIVILIAN;
    }

    if (this.DEFENCE_BRANCHES[branchKey]) {
      return this.DEFENCE_BRANCHES[branchKey];
    }
    return this.DEFENCE_BRANCHES.ARMY;
  },

  /**
   * Evaluates a policy to provide a CLEAR, DEFINITIVE OUTCOME.
   */
  evaluatePolicy(policy, branchKey = 'NAVY') {
    const branch = this.resolveBranch(branchKey);
    const findings = [];
    let verdict = this.STATUS.CONTINUE;
    let verdictHeadline = '';
    let verdictRationale = '';
    let actionSteps = [];

    // Check Defence Rider Exclusions ONLY for branches with military exclusions
    if (branch.hasMilitaryExclusions && policy.hasAccidentalRider) {
      findings.push({
        type: 'DEFENCE_EXCLUSION',
        badge: `${branch.name.toUpperCase()} EXCLUSION`,
        title: 'Operational Service Excluded in Rider',
        message: branch.exclusionAdvice
      });
    }

    // RULE 1: ULIP Exit Rule (Post Lock-in / 0 Exit Fee)
    if (policy.isULIP) {
      if (policy.lockInEndingSoon || policy.premiumsPaid >= 5) {
        verdict = this.STATUS.SURRENDER;
        verdictHeadline = 'SURRENDER AT LOCK-IN (0 EXIT CHARGE)';
        verdictRationale = `Statutory 5-year lock-in ${policy.lockInEndingSoon ? 'ends on ' + policy.nextDue : 'is complete'}. Exit penalty is exactly ZERO. ULIP fund management charges (1.35%), monthly admin charges (₹350-₹366/mo), and mortality deductions drag down performance. Stopping now avoids ${policy.remainingPremiumsCount > 0 ? policy.remainingPremiumsCount + ' future premiums' : 'ongoing fee drag'}.`;
        actionSteps = [
          'Do NOT pay any further premium (the 6th premium is NOT contractually required to surrender).',
          'Request latest NAV and unit statement from insurer on lock-in date.',
          'Submit surrender instruction immediately post lock-in.'
        ];
      } else {
        verdict = this.STATUS.CONTINUE;
        verdictHeadline = 'HOLD TILL 5-YEAR LOCK-IN';
        verdictRationale = 'Surrendering before 5 years forces funds into a Discontinuance Policy Fund yielding only 4% with deductions. Pay or hold until the 5-year lock-in completes, then exit immediately with zero penalty.';
        actionSteps = ['Hold policy until lock-in anniversary; do not trigger premature surrender penalty.'];
      }
    }
    // RULE 2: Traditional Savings / Endowment (Gold type)
    else if (policy.isGuaranteedSavings) {
      const incXIRR = policy.incrementalXIRR || 0.0163;
      const lowerAssumedXIRR = policy.lowerAssumedXIRR || 0.0328; // 4% illustration rate

      if (incXIRR < 0.04) {
        verdict = this.STATUS.PAID_UP;
        verdictHeadline = 'CONVERT TO PAID-UP IMMEDIATELY';
        verdictRationale = `Paying further base premiums commits ₹${(policy.annualPremium * (policy.ppt - policy.premiumsPaid) / 1e5).toFixed(1)}L more to earn an incremental return of only ${(incXIRR * 100).toFixed(2)}% (or ~${(lowerAssumedXIRR * 100).toFixed(2)}% at 4% illustration). This is massively inferior to ${branch.isDefence ? 'your service-connected 7.10% tax-free ' + branch.pfName : 'accessible sovereign alternatives like ' + branch.pfName + ' at ' + (branch.pfRate * 100).toFixed(2) + '%'}. Converting to Paid-Up retains all accumulated guarantees without pouring more money into a sub-optimal vehicle.`;
        actionSteps = [
          'Instruct bank to cancel NACH / auto-debit before next premium.',
          'Submit written request to insurer to convert policy to Paid-Up status.',
          'Verify replacement pure term cover if death benefit was required.'
        ];
      } else {
        verdict = this.STATUS.CONTINUE;
        verdictHeadline = 'CONTINUE PAYMENTS';
        verdictRationale = `Incremental yield on future premiums is sound (${(incXIRR * 100).toFixed(2)}%).`;
        actionSteps = ['Pay scheduled premiums on due date.'];
      }
    }
    // RULE 3: Guaranteed Income / GIFT type
    else if (policy.isGuaranteedIncome) {
      const incXIRR = policy.incrementalXIRR || 0.068;

      if (incXIRR >= 0.065) {
        verdict = this.STATUS.CONTINUE;
        verdictHeadline = 'CONTINUE FOR GUARANTEED INCOME STREAM';
        verdictRationale = `Additional premiums generate an incremental return of ${(incXIRR * 100).toFixed(2)}% p.a. guaranteed tax-free income over ${policy.incomeDurationYears || 30} years. This matches or beats long-term fixed income instruments. Strongly recommended if family values predictable, guaranteed cash flow.`;
        actionSteps = [
          'Maintain annual premium schedule to unlock full 30-year annuity.',
          policy.minorVestingClause ? 'Ensure vesting documents are submitted to insurer upon life assured reaching age 18.' : 'Ensure bank account mandate is active for ECS auto-credit of annuity.'
        ];
      } else {
        verdict = this.STATUS.PAID_UP;
        verdictHeadline = 'CONVERT TO PAID-UP';
        verdictRationale = `Incremental return of ${(incXIRR * 100).toFixed(2)}% does not beat available alternatives.`;
        actionSteps = ['Stop future premiums and freeze policy at reduced paid-up value.'];
      }
    }

    return {
      policyId: policy.id,
      productName: policy.productName,
      verdict,
      verdictHeadline,
      verdictRationale,
      actionSteps,
      findings,
      branch
    };
  },

  /**
   * Generates Payout Frequency Comparison (Annual vs Monthly vs Maturity Commutation)
   */
  comparePayoutFrequencies(policy) {
    const annualIncome = policy.guaranteedIncomeAmount || 284330;
    const monthlyEquivalent = (annualIncome / 12) * 0.98; // monthly discounting
    const maturityLumpSum = policy.maturityLumpSum || 3463282;

    return {
      annual: {
        frequency: 'Annual Income',
        payout: annualIncome,
        durationYears: policy.incomeDurationYears || 30,
        incrementalXIRR: policy.incrementalXIRR || 0.0715,
        verdict: 'Highest Yield (Recommended)'
      },
      monthly: {
        frequency: 'Monthly Regular Income',
        payout: Math.round(monthlyEquivalent),
        durationYears: policy.incomeDurationYears || 30,
        incrementalXIRR: (policy.incrementalXIRR || 0.0715) - 0.002,
        verdict: 'Ideal for Household Monthly Expenses'
      },
      commutedLumpSum: {
        frequency: 'One-Time Maturity Commutation',
        payout: maturityLumpSum,
        durationYears: 0,
        incrementalXIRR: policy.lumpSumXIRR || 0.0567,
        verdict: 'Sub-Optimal (Yield drops to ~5.6%)'
      }
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VednovaSOP;
}
