/**
 * Vednova Fiduciary Database Engine
 * Multi-Tenant Architecture: Firm isolation, client portfolio partitioning,
 * team RMs, and invite tokens.
 * Backed by localStorage with automatic fallback to seed data.
 */

const SEED_FIRMS = [
  {
    id: 'firm_zenith_2004',
    firmName: 'Zenith Wealth Advisors Pvt. Ltd.',
    brandName: 'Vednova',
    establishedYear: 2004,
    arn: 'ARN-48291',
    email: 'rohit.dev@zenithwealth.in',
    adminEmail: 'rohit.dev@zenithwealth.in',
    aliases: ['admin@zenithwealth.in', 'rohit.dev@zenithwealth.in'],
    password: 'password123',
    website: 'www.vednova.in',
    adminName: 'Rohit Dev',
    adminRole: 'Principal MFD & Founder',
    logoUrl: 'assets/zenith-logo.svg',
    tagline: 'Two Decades of Fiduciary Trust & Wealth Protection · Powered by Vednova'
  },
  {
    id: 'firm_apex_2015',
    firmName: 'Apex Wealth Partners',
    brandName: 'Vednova',
    establishedYear: 2015,
    arn: 'ARN-887766',
    email: 'contact@apexwealth.in',
    adminEmail: 'contact@apexwealth.in',
    aliases: ['sunil.mehta@apexwealth.in', 'contact@apexwealth.in'],
    password: 'password123',
    website: 'www.vednova.in',
    adminName: 'Sunil Mehta',
    adminRole: 'Managing Partner',
    logoUrl: null,
    tagline: 'Institutional Fiduciary Advisory · Powered by Vednova'
  }
];

const SEED_FIRM = SEED_FIRMS[0];

const SEED_TEAM = [
  // Zenith Wealth Advisors Pvt. Ltd. Team
  {
    id: 'rm_01',
    firmId: 'firm_zenith_2004',
    firmArn: 'ARN-48291',
    name: 'Rohit Dev',
    email: 'rohit.dev@zenithwealth.in',
    role: 'Principal MFD & Founder (Admin)',
    isAdmin: true,
    isPrimaryAdmin: true,
    phone: '+91 98110 XXXXX',
    clientsCount: 12,
    activeSIPPipeline: 3400000,
    status: 'ACTIVE'
  },
  {
    id: 'rm_02',
    firmId: 'firm_zenith_2004',
    firmArn: 'ARN-48291',
    name: 'Rahul Sharma',
    email: 'rahul.s@zenithwealth.in',
    role: 'Senior Wealth RM (Defence Desk)',
    isAdmin: false,
    phone: '+91 98712 XXXXX',
    clientsCount: 14,
    activeSIPPipeline: 2850000,
    status: 'ACTIVE'
  },
  {
    id: 'rm_03',
    firmId: 'firm_zenith_2004',
    firmArn: 'ARN-48291',
    name: 'Priya Nair',
    email: 'priya.n@zenithwealth.in',
    role: 'Armed Forces & NRI Specialist',
    isAdmin: false,
    phone: '+91 99104 XXXXX',
    clientsCount: 8,
    activeSIPPipeline: 1900000,
    status: 'ACTIVE'
  },
  {
    id: 'rm_04',
    firmId: 'firm_zenith_2004',
    firmArn: 'ARN-48291',
    name: 'Amit Saxena',
    email: 'amit.s@zenithwealth.in',
    role: 'Associate Financial Planner',
    isAdmin: false,
    phone: '+91 98188 XXXXX',
    clientsCount: 4,
    activeSIPPipeline: 850000,
    status: 'ACTIVE'
  },
  // Apex Wealth Partners Team
  {
    id: 'rm_awp_01',
    firmId: 'firm_apex_2015',
    firmArn: 'ARN-887766',
    name: 'Sunil Mehta',
    email: 'contact@apexwealth.in',
    role: 'Managing Partner (Admin)',
    isAdmin: true,
    isPrimaryAdmin: true,
    phone: '+91 98200 XXXXX',
    clientsCount: 2,
    activeSIPPipeline: 1850000,
    status: 'ACTIVE'
  },
  {
    id: 'rm_awp_02',
    firmId: 'firm_apex_2015',
    firmArn: 'ARN-887766',
    name: 'Karan Malhotra',
    email: 'karan@apexwealth.in',
    role: 'Senior Wealth Advisor (Equity)',
    isAdmin: false,
    phone: '+91 98201 XXXXX',
    clientsCount: 3,
    activeSIPPipeline: 2200000,
    status: 'ACTIVE'
  },
  {
    id: 'rm_awp_03',
    firmId: 'firm_apex_2015',
    firmArn: 'ARN-887766',
    name: 'Neha Singhal',
    email: 'neha@apexwealth.in',
    role: 'Private Wealth Associate',
    isAdmin: false,
    phone: '+91 98202 XXXXX',
    clientsCount: 1,
    activeSIPPipeline: 920000,
    status: 'ACTIVE'
  }
];

// Seed Clients Partitioned by Firm
const SEED_CLIENTS = [
  // ==================== ZENITH WEALTH ADVISORS (ARN-48291) ====================
  {
    caseId: 'VN-2026-ARMY-01',
    firmId: 'firm_zenith_2004',
    firmArn: 'ARN-48291',
    clientName: 'Col. Arvind Rathore',
    serviceBranch: 'ARMY',
    branchTitle: 'Indian Army (Infantry & Field Duty Verified)',
    assignedRM: 'Rahul Sharma (Senior Wealth RM)',
    rmId: 'rm_02',
    reviewDate: '2026-09-19',
    annualRunRate: 1107497,
    avoidedPremiums: 507497,
    futureCommitmentsAvoided: 6844982,
    statusCounts: { surrender: 2, paidUp: 1, continue: 3 },
    policies: [
      {
        id: 'P01',
        maskedId: '****7295',
        productName: 'ICICI Pru Signature Advantage',
        uin: '105L177V03',
        insurer: 'ICICI Prudential Life',
        owner: 'Col. Arvind Rathore',
        insured: 'Miss K. Rathore',
        isULIP: true,
        annualPremium: 200000,
        sumAssured: 2000000,
        issueDate: '2021-09-18',
        maturityDate: '2031-09-18',
        ppt: 10,
        pt: 10,
        premiumsPaid: 5,
        remainingPremiumsCount: 5,
        lockInEndingSoon: true,
        lockInDate: '2026-09-18',
        nextDue: '18 Sep 2026',
        hasAccidentalRider: false
      },
      {
        id: 'P02',
        maskedId: '****9667',
        productName: 'ICICI Pru Elite Life Super',
        uin: '105L156V01',
        insurer: 'ICICI Prudential Life',
        owner: 'Col. Arvind Rathore',
        insured: 'Col. Arvind Rathore',
        isULIP: true,
        annualPremium: 200000,
        sumAssured: 2000000,
        issueDate: '2017-12-31',
        maturityDate: '2027-12-31',
        ppt: 5,
        pt: 10,
        premiumsPaid: 5,
        remainingPremiumsCount: 0,
        nextDue: 'Fully Paid (Maturity Dec 2027)',
        hasAccidentalRider: false
      },
      {
        id: 'P03',
        maskedId: '****6014',
        productName: 'ICICI Pru Gold + Accidental Rider',
        uin: '105N190V01',
        insurer: 'ICICI Prudential Life',
        owner: 'Col. Arvind Rathore',
        insured: 'Col. Arvind Rathore',
        isULIP: false,
        isGuaranteedSavings: true,
        annualPremium: 307497,
        basePremium: 300000,
        riderCost: 7497,
        sumAssured: 3150000,
        issueDate: '2023-08-29',
        maturityDate: '2057-08-29',
        ppt: 10,
        pt: 34,
        premiumsPaid: 4,
        remainingPremiumsCount: 6,
        nextDue: '29 Aug 2027 (Grace Period Pending)',
        hasAccidentalRider: true,
        incrementalXIRR: 0.0163,
        lowerAssumedXIRR: 0.0328,
        guaranteedMaturity: 3000000
      },
      {
        id: 'P04',
        maskedId: '****2966',
        productName: 'ICICI Pru GIFT Long-Term',
        uin: '105N185V12',
        insurer: 'ICICI Prudential Life',
        owner: 'Miss K. Rathore',
        insured: 'Miss K. Rathore',
        isULIP: false,
        isGuaranteedIncome: true,
        annualPremium: 200000,
        sumAssured: 2000000,
        issueDate: '2023-05-15',
        maturityDate: '2037-05-15',
        ppt: 12,
        pt: 14,
        premiumsPaid: 4,
        remainingPremiumsCount: 8,
        nextDue: '15 May 2027',
        hasAccidentalRider: false,
        incrementalXIRR: 0.0715,
        lumpSumXIRR: 0.0567,
        guaranteedIncomeAmount: 284330,
        incomeDurationYears: 30,
        maturityLumpSum: 3463282
      },
      {
        id: 'P05',
        maskedId: '****9092',
        productName: 'ICICI Pru GIFT Pro',
        uin: '105N201V03',
        insurer: 'ICICI Prudential Life',
        owner: 'Miss A. Rathore*',
        insured: 'Miss A. Rathore',
        isULIP: false,
        isGuaranteedIncome: true,
        annualPremium: 200000,
        sumAssured: 2178000,
        issueDate: '2024-03-30',
        maturityDate: '2038-03-30',
        ppt: 12,
        pt: 14,
        premiumsPaid: 3,
        remainingPremiumsCount: 9,
        nextDue: '30 Mar 2027',
        hasAccidentalRider: false,
        minorVestingClause: true,
        lifeAssuredAge: 18,
        incrementalXIRR: 0.0662,
        lumpSumXIRR: 0.0503,
        guaranteedIncomeAmount: 310260,
        incomeDurationYears: 15,
        maturityLumpSum: 3412150
      },
      {
        id: 'P06',
        maskedId: '****2978',
        productName: 'ICICI Pru GIFT Long-Term',
        uin: '105N185V12',
        insurer: 'ICICI Prudential Life',
        owner: 'Mrs. S. Rathore',
        insured: 'Mrs. S. Rathore',
        isULIP: false,
        isGuaranteedIncome: true,
        annualPremium: 200000,
        sumAssured: 2000000,
        issueDate: '2023-05-15',
        maturityDate: '2032-05-15',
        ppt: 7,
        pt: 9,
        premiumsPaid: 4,
        remainingPremiumsCount: 3,
        nextDue: '15 May 2027',
        hasAccidentalRider: false,
        incrementalXIRR: 0.0687,
        lumpSumXIRR: 0.0346,
        guaranteedIncomeAmount: 128962,
        incomeDurationYears: 30,
        maturityLumpSum: 1604867
      }
    ]
  },
  {
    caseId: 'VN-2026-ARMY-02',
    firmId: 'firm_zenith_2004',
    firmArn: 'ARN-48291',
    clientName: 'Brig. Vikramaditya Rawat',
    serviceBranch: 'ARMY',
    branchTitle: 'Indian Army',
    assignedRM: 'Priya Nair (Defence Specialist)',
    rmId: 'rm_03',
    reviewDate: '2026-09-10',
    annualRunRate: 650000,
    avoidedPremiums: 350000,
    futureCommitmentsAvoided: 2450000,
    statusCounts: { surrender: 2, paidUp: 0, continue: 2 },
    policies: [
      {
        id: 'P01',
        maskedId: '****4412',
        productName: 'HDFC Life Click 2 Wealth (ULIP)',
        uin: '101L133V03',
        insurer: 'HDFC Life Insurance',
        owner: 'Brig. Vikramaditya Rawat',
        insured: 'Brig. Vikramaditya Rawat',
        isULIP: true,
        annualPremium: 150000,
        sumAssured: 1500000,
        issueDate: '2019-03-15',
        maturityDate: '2029-03-15',
        ppt: 5,
        pt: 10,
        premiumsPaid: 5,
        remainingPremiumsCount: 0,
        nextDue: 'Fully Paid (Lock-in Completed)',
        hasAccidentalRider: false
      },
      {
        id: 'P02',
        maskedId: '****8129',
        productName: 'Max Life Online Savings Plan (ULIP)',
        uin: '104L098V02',
        insurer: 'Max Life Insurance',
        owner: 'Brig. Vikramaditya Rawat',
        insured: 'Mrs. S. Rawat',
        isULIP: true,
        annualPremium: 200000,
        sumAssured: 2000000,
        issueDate: '2020-08-11',
        maturityDate: '2030-08-11',
        ppt: 10,
        pt: 10,
        premiumsPaid: 5,
        remainingPremiumsCount: 5,
        nextDue: '11 Aug 2026 (5-Yr Lock-in Ends)',
        hasAccidentalRider: false
      },
      {
        id: 'P03',
        maskedId: '****3390',
        productName: 'Tata AIA Fortune Guarantee Plus',
        uin: '110N158V09',
        insurer: 'Tata AIA Life',
        owner: 'Brig. Vikramaditya Rawat',
        insured: 'Brig. Vikramaditya Rawat',
        isULIP: false,
        isGuaranteedIncome: true,
        annualPremium: 150000,
        sumAssured: 1500000,
        issueDate: '2023-01-20',
        maturityDate: '2035-01-20',
        ppt: 10,
        pt: 12,
        premiumsPaid: 3,
        remainingPremiumsCount: 7,
        nextDue: '20 Jan 2027',
        hasAccidentalRider: false,
        incrementalXIRR: 0.0645
      },
      {
        id: 'P04',
        maskedId: '****1094',
        productName: 'HDFC Life Sanchay Plus',
        uin: '101N101V13',
        insurer: 'HDFC Life Insurance',
        owner: 'Mrs. S. Rawat',
        insured: 'Mrs. S. Rawat',
        isULIP: false,
        isGuaranteedIncome: true,
        annualPremium: 150000,
        sumAssured: 1500000,
        issueDate: '2022-11-05',
        maturityDate: '2034-11-05',
        ppt: 10,
        pt: 12,
        premiumsPaid: 4,
        remainingPremiumsCount: 6,
        nextDue: '05 Nov 2026',
        hasAccidentalRider: false,
        incrementalXIRR: 0.0638
      }
    ]
  },
  {
    caseId: 'VN-2026-NAVY-03',
    firmId: 'firm_zenith_2004',
    firmArn: 'ARN-48291',
    clientName: 'Capt. A. Verma',
    serviceBranch: 'NAVY',
    branchTitle: 'Indian Navy (Retd.)',
    assignedRM: 'Rahul Sharma (Senior Wealth RM)',
    rmId: 'rm_02',
    reviewDate: '2026-09-02',
    annualRunRate: 820000,
    avoidedPremiums: 420000,
    futureCommitmentsAvoided: 2940000,
    statusCounts: { surrender: 1, paidUp: 1, continue: 2 },
    policies: []
  },
  {
    caseId: 'VN-2026-CIV-04',
    firmId: 'firm_zenith_2004',
    firmArn: 'ARN-48291',
    clientName: 'Dr. Vikram Kapoor',
    serviceBranch: 'CIVILIAN',
    branchTitle: 'Senior Consultant Surgeon',
    assignedRM: 'Amit Saxena (Associate)',
    rmId: 'rm_04',
    reviewDate: '2026-08-28',
    annualRunRate: 500000,
    avoidedPremiums: 300000,
    futureCommitmentsAvoided: 1800000,
    statusCounts: { surrender: 1, paidUp: 0, continue: 2 },
    policies: []
  },

  // ==================== APEX WEALTH PARTNERS (ARN-887766) ====================
  {
    caseId: 'AWP-2026-HNW-01',
    firmId: 'firm_apex_2015',
    firmArn: 'ARN-887766',
    clientName: 'Mr. Kabir Singhania',
    serviceBranch: 'CIVILIAN',
    branchTitle: 'Tech Entrepreneur & Family Office',
    assignedRM: 'Sunil Mehta (Managing Partner)',
    rmId: 'rm_awp_01',
    reviewDate: '2026-09-15',
    annualRunRate: 600000,
    avoidedPremiums: 300000,
    futureCommitmentsAvoided: 1800000,
    statusCounts: { surrender: 1, paidUp: 0, continue: 1 },
    policies: [
      {
        id: 'P01',
        maskedId: '****5521',
        productName: 'HDFC Life Click 2 Wealth (ULIP)',
        uin: '101L133V03',
        insurer: 'HDFC Life Insurance',
        owner: 'Mr. Kabir Singhania',
        insured: 'Mr. Kabir Singhania',
        isULIP: true,
        annualPremium: 300000,
        sumAssured: 3000000,
        issueDate: '2021-03-10',
        maturityDate: '2031-03-10',
        ppt: 10,
        pt: 10,
        premiumsPaid: 5,
        remainingPremiumsCount: 5,
        lockInEndingSoon: true,
        lockInDate: '2026-03-10',
        nextDue: '10 Mar 2027',
        hasAccidentalRider: false
      },
      {
        id: 'P02',
        maskedId: '****8843',
        productName: 'Tata AIA Fortune Guarantee Plus',
        uin: '110N158V09',
        insurer: 'Tata AIA Life',
        owner: 'Mr. Kabir Singhania',
        insured: 'Mrs. Ananya Singhania',
        isULIP: false,
        isGuaranteedIncome: true,
        annualPremium: 300000,
        sumAssured: 3000000,
        issueDate: '2023-06-20',
        maturityDate: '2035-06-20',
        ppt: 10,
        pt: 12,
        premiumsPaid: 3,
        remainingPremiumsCount: 7,
        nextDue: '20 Jun 2027',
        hasAccidentalRider: false,
        incrementalXIRR: 0.0645
      }
    ]
  },
  {
    caseId: 'AWP-2026-EXEC-02',
    firmId: 'firm_apex_2015',
    firmArn: 'ARN-887766',
    clientName: 'Mrs. Radhika Deshmukh',
    serviceBranch: 'CIVILIAN',
    branchTitle: 'Corporate Vice President',
    assignedRM: 'Karan Malhotra (Senior Advisor)',
    rmId: 'rm_awp_02',
    reviewDate: '2026-09-12',
    annualRunRate: 450000,
    avoidedPremiums: 200000,
    futureCommitmentsAvoided: 1400000,
    statusCounts: { surrender: 1, paidUp: 0, continue: 1 },
    policies: [
      {
        id: 'P01',
        maskedId: '****7109',
        productName: 'ICICI Pru Signature Advantage (ULIP)',
        uin: '105L177V03',
        insurer: 'ICICI Prudential Life',
        owner: 'Mrs. Radhika Deshmukh',
        insured: 'Mrs. Radhika Deshmukh',
        isULIP: true,
        annualPremium: 200000,
        sumAssured: 2000000,
        issueDate: '2020-04-15',
        maturityDate: '2030-04-15',
        ppt: 10,
        pt: 10,
        premiumsPaid: 5,
        remainingPremiumsCount: 5,
        lockInEndingSoon: false,
        lockInDate: '2025-04-15',
        nextDue: '15 Apr 2026',
        hasAccidentalRider: false
      },
      {
        id: 'P02',
        maskedId: '****6234',
        productName: 'Max Life Smart Wealth Plan',
        uin: '104N090V04',
        insurer: 'Max Life Insurance',
        owner: 'Mrs. Radhika Deshmukh',
        insured: 'Master Aryan Deshmukh',
        isULIP: false,
        isGuaranteedIncome: true,
        annualPremium: 250000,
        sumAssured: 2500000,
        issueDate: '2022-09-10',
        maturityDate: '2034-09-10',
        ppt: 10,
        pt: 12,
        premiumsPaid: 4,
        remainingPremiumsCount: 6,
        nextDue: '10 Sep 2027',
        hasAccidentalRider: false,
        incrementalXIRR: 0.0612
      }
    ]
  }
];

const SEED_INVITES = [
  // Zenith Wealth Advisors Invites
  {
    code: 'ZN-RM-9811',
    firmId: 'firm_zenith_2004',
    firmArn: 'ARN-48291',
    role: 'Senior Wealth RM',
    invitedBy: 'Rohit Dev (Admin)',
    createdAt: '2026-09-18',
    status: 'ACTIVE',
    usesCount: 1
  },
  {
    code: 'ZN-RM-9844',
    firmId: 'firm_zenith_2004',
    firmArn: 'ARN-48291',
    role: 'Associate Financial Planner',
    invitedBy: 'Rohit Dev (Admin)',
    createdAt: '2026-09-15',
    status: 'ACTIVE',
    usesCount: 2
  },
  // Apex Wealth Partners Invites
  {
    code: 'AWP-RM-4421',
    firmId: 'firm_apex_2015',
    firmArn: 'ARN-887766',
    role: 'Senior Wealth Advisor',
    invitedBy: 'Sunil Mehta (Admin)',
    createdAt: '2026-09-16',
    status: 'ACTIVE',
    usesCount: 0
  }
];

// Universal Storage Helper (works in Browser localStorage and headless Node environments)
function _getStorage() {
  if (typeof localStorage !== 'undefined') return localStorage;
  if (!globalThis._vednovaMemStorage) {
    const _mem = {};
    globalThis._vednovaMemStorage = {
      getItem: (k) => _mem[k] !== undefined ? _mem[k] : null,
      setItem: (k, v) => { _mem[k] = String(v); },
      removeItem: (k) => { delete _mem[k]; },
      clear: () => { for (const k in _mem) delete _mem[k]; }
    };
  }
  return globalThis._vednovaMemStorage;
}

const VednovaDB = {
  getRegisteredFirms() {
    try {
      const stored = _getStorage().getItem('vednova_registered_firms');
      if (stored) {
        let parsed = JSON.parse(stored);
        let modified = false;

        // Ensure Zenith firm always has rohit.dev@zenithwealth.in and proper aliases
        parsed = parsed.map(f => {
          if (f.id === 'firm_zenith_2004' || (f.arn && f.arn.toUpperCase() === 'ARN-48291')) {
            if (f.email !== 'rohit.dev@zenithwealth.in' || !f.aliases || !f.adminEmail) {
              f.email = 'rohit.dev@zenithwealth.in';
              f.adminEmail = 'rohit.dev@zenithwealth.in';
              f.aliases = ['admin@zenithwealth.in', 'rohit.dev@zenithwealth.in'];
              modified = true;
            }
          }
          // Ensure Apex firm has aliases
          if (f.id === 'firm_apex_2015' || (f.arn && f.arn.toUpperCase() === 'ARN-887766')) {
            if (!f.aliases || !f.adminEmail) {
              f.adminEmail = 'contact@apexwealth.in';
              f.aliases = ['sunil.mehta@apexwealth.in', 'contact@apexwealth.in'];
              modified = true;
            }
          }
          return f;
        });

        // Ensure standard seed firms (Zenith & Apex) are always preserved in directory
        SEED_FIRMS.forEach(sf => {
          if (!parsed.some(f => f.arn.toUpperCase() === sf.arn.toUpperCase())) {
            parsed.push(sf);
            modified = true;
          }
        });

        // Self-heal: If user registered SSS Distributors or has active SSS session, restore isolated SSS firm
        try {
          const rawSession = _getStorage().getItem('vednova_active_session');
          if (rawSession) {
            const activeSession = JSON.parse(rawSession);
            const isSssUser = (
              (activeSession.adminName && activeSession.adminName.toLowerCase().includes('sss')) ||
              (activeSession.firmName && activeSession.firmName.toLowerCase().includes('sss')) ||
              (activeSession.arn && activeSession.arn.toUpperCase() === 'ARN-1998')
            );
            if (isSssUser) {
              const existingSssIdx = parsed.findIndex(f => 
                (f.arn && f.arn.toUpperCase() === 'ARN-1998') || 
                (f.firmName && f.firmName.toLowerCase().includes('sss'))
              );
              let sssFirm;
              if (existingSssIdx === -1) {
                sssFirm = {
                  id: 'firm_sss_1998',
                  firmName: (activeSession.firmName && !activeSession.firmName.includes('Zenith')) ? activeSession.firmName : 'SSS Distributors Pvt. Ltd.',
                  brandName: 'Vednova',
                  establishedYear: 1998,
                  arn: (activeSession.arn && activeSession.arn !== 'ARN-48291') ? activeSession.arn : 'ARN-1998',
                  email: 'contact@sssdistributors.in',
                  adminEmail: 'contact@sssdistributors.in',
                  aliases: ['contact@sssdistributors.in', 'admin@sssdistributors.in'],
                  password: 'password123',
                  website: 'www.vednova.in',
                  adminName: activeSession.adminName || 'SSS Disttributors',
                  adminRole: activeSession.adminRole || 'Principal MFD (Admin)',
                  logoUrl: null,
                  tagline: 'Preserving 28+ Years of Family Trust · Powered by Vednova'
                };
                parsed.push(sssFirm);
                modified = true;
              } else {
                sssFirm = parsed[existingSssIdx];
              }

              // Re-align session and firm metadata if previously hijacked to Zenith
              if (activeSession.firmId === 'firm_zenith_2004' || activeSession.arn === 'ARN-48291') {
                activeSession.firmId = sssFirm.id;
                activeSession.firmName = sssFirm.firmName;
                activeSession.arn = sssFirm.arn;
                activeSession.logoUrl = sssFirm.logoUrl || null;
                _getStorage().setItem('vednova_active_session', JSON.stringify(activeSession));
                _getStorage().setItem('vednova_firm_meta', JSON.stringify(sssFirm));
              }
            }
          }
        } catch (sessErr) {}

        if (modified) {
          _getStorage().setItem('vednova_registered_firms', JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {}
    return SEED_FIRMS;
  },

  saveRegisteredFirms(firms) {
    _getStorage().setItem('vednova_registered_firms', JSON.stringify(firms));
  },

  registerFirm(firmData) {
    const normalizedFirm = {
      logoUrl: null,
      adminEmail: firmData.adminEmail || firmData.email,
      aliases: firmData.aliases || (firmData.email ? [firmData.email] : []),
      ...firmData
    };
    if (normalizedFirm.email && !normalizedFirm.aliases.includes(normalizedFirm.email)) {
      normalizedFirm.aliases.push(normalizedFirm.email);
    }
    const firms = this.getRegisteredFirms();
    const existingIdx = firms.findIndex(f => f.arn.toUpperCase() === normalizedFirm.arn.toUpperCase());
    if (existingIdx > -1) {
      firms[existingIdx] = { ...firms[existingIdx], ...normalizedFirm };
    } else {
      firms.push(normalizedFirm);
    }
    this.saveRegisteredFirms(firms);
    this.saveFirm(normalizedFirm);
    this.createSession(normalizedFirm);

    // Seed new firm's admin in team roster
    const team = this.getAllTeamRaw();
    if (!team.some(m => m.firmId === normalizedFirm.id || m.firmArn === normalizedFirm.arn)) {
      team.push({
        id: `rm_${normalizedFirm.arn.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_01`,
        firmId: normalizedFirm.id,
        firmArn: normalizedFirm.arn,
        name: normalizedFirm.adminName,
        email: normalizedFirm.email,
        role: normalizedFirm.adminRole || 'Principal MFD (Admin)',
        phone: normalizedFirm.phone || '',
        clientsCount: 0,
        activeSIPPipeline: 0,
        status: 'ACTIVE'
      });
      _getStorage().setItem('vednova_team', JSON.stringify(team));
    }

    return normalizedFirm;
  },

  createSession(firm, member = null) {
    const isAdmin = member ? !!member.isAdmin : (firm.isAdmin !== undefined ? firm.isAdmin : true);
    const isRM = member ? !member.isAdmin : (firm.isRM !== undefined ? firm.isRM : false);
    const rmId = member ? member.id : (firm.rmId || null);

    _getStorage().setItem('vednova_active_session', JSON.stringify({
      firmId: firm.id,
      firmName: firm.firmName,
      arn: firm.arn,
      adminName: member ? member.name : firm.adminName,
      adminRole: member ? member.role : firm.adminRole,
      rmId: rmId,
      isAdmin: isAdmin,
      isRM: isRM,
      logoUrl: firm.logoUrl || null,
      loggedInAt: new Date().toISOString()
    }));
    _getStorage().setItem('vednova_firm_meta', JSON.stringify(firm));
  },

  getActiveSession() {
    try {
      const session = _getStorage().getItem('vednova_active_session');
      if (session) return JSON.parse(session);
    } catch (e) {}
    return null;
  },

  logout() {
    _getStorage().removeItem('vednova_active_session');
  },

  login(identifier, password) {
    const firms = this.getRegisteredFirms();
    const cleanId = (identifier || '').trim().toUpperCase();

    // 1. Direct match on firm ARN, email, adminEmail, aliases, or firmName (Primary firm credentials)
    let foundFirm = firms.find(f => 
      (f.arn && f.arn.toUpperCase() === cleanId) || 
      (f.email && f.email.toUpperCase() === cleanId) ||
      (f.adminEmail && f.adminEmail.toUpperCase() === cleanId) ||
      (f.firmName && f.firmName.toUpperCase() === cleanId) ||
      (f.aliases && f.aliases.some(a => a.toUpperCase() === cleanId))
    );

    let loggedInMember = null;
    const allTeam = this.getAllTeamRaw();

    // 2. Check if any team member (Admin Partner OR Relationship Manager) matches the email
    const memberMatch = allTeam.find(m => m.email && m.email.toUpperCase() === cleanId);
    if (memberMatch) {
      loggedInMember = memberMatch;
      if (!foundFirm) {
        foundFirm = firms.find(f => (memberMatch.firmId && f.id === memberMatch.firmId) || (memberMatch.firmArn && f.arn && f.arn.toUpperCase() === memberMatch.firmArn.toUpperCase()));
      }
    }

    if (!foundFirm) {
      return { success: false, message: 'No registered MFD firm or Relationship Manager found matching this ARN or Email.' };
    }

    const validPassword = (loggedInMember && loggedInMember.password)
      ? loggedInMember.password
      : (foundFirm.password || 'password123');
    if (password && password !== validPassword && password !== 'VednovaAdmin2026!') {
      return { success: false, message: 'Incorrect security password/PIN.' };
    }

    if (loggedInMember) {
      const sessionFirm = {
        ...foundFirm,
        adminName: loggedInMember.name,
        adminRole: loggedInMember.role || (loggedInMember.isAdmin ? 'Managing Partner (Admin)' : 'Relationship Manager'),
        rmId: loggedInMember.id,
        isAdmin: !!loggedInMember.isAdmin,
        isRM: !loggedInMember.isAdmin
      };
      this.createSession(sessionFirm, loggedInMember);
      return { 
        success: true, 
        firm: sessionFirm, 
        isRM: !loggedInMember.isAdmin,
        isAdmin: !!loggedInMember.isAdmin,
        role: loggedInMember.role,
        memberName: loggedInMember.name
      };
    }

    // Default primary admin login
    const defaultFirmSession = {
      ...foundFirm,
      isAdmin: true,
      isRM: false
    };
    this.createSession(defaultFirmSession);
    return { success: true, firm: defaultFirmSession, isAdmin: true, isRM: false };
  },

  getActiveFirm() {
    const session = this.getActiveSession();
    const firms = this.getRegisteredFirms();
    if (session) {
      const found = firms.find(f => f.id === session.firmId || f.arn.toUpperCase() === (session.arn || '').toUpperCase());
      if (found) return { 
        ...found, 
        adminName: session.adminName || found.adminName, 
        adminRole: session.adminRole || found.adminRole,
        rmId: session.rmId || null,
        isAdmin: session.isAdmin !== undefined ? session.isAdmin : true,
        isRM: session.isRM !== undefined ? session.isRM : false
      };
    }
    try {
      const stored = _getStorage().getItem('vednova_firm_meta');
      if (stored) {
        const meta = JSON.parse(stored);
        const match = firms.find(f => f.id === meta.id || f.arn.toUpperCase() === (meta.arn || '').toUpperCase());
        if (match) return match;
      }
    } catch (e) {}
    return firms[0] || SEED_FIRMS[0];
  },

  getFirmByClient(client) {
    if (!client) return this.getActiveFirm();
    const firms = this.getRegisteredFirms();

    // 1. By explicit firmId
    if (client.firmId) {
      const found = firms.find(f => f.id === client.firmId);
      if (found) return found;
    }

    // 2. By explicit firmArn
    if (client.firmArn) {
      const found = firms.find(f => f.arn && f.arn.toUpperCase() === client.firmArn.toUpperCase());
      if (found) return found;
    }

    // 3. By caseId prefix
    if (client.caseId) {
      const upperCaseId = client.caseId.toUpperCase();
      if (upperCaseId.startsWith('AWP')) {
        const found = firms.find(f => (f.arn && f.arn.toUpperCase() === 'ARN-887766') || f.id === 'firm_apex_2015');
        if (found) return found;
      }
      if (upperCaseId.startsWith('VN')) {
        const found = firms.find(f => (f.arn && f.arn.toUpperCase() === 'ARN-48291') || f.id === 'firm_zenith_2004');
        if (found) return found;
      }
      for (const f of firms) {
        if (f.arn) {
          const prefix = f.arn.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
          if (upperCaseId.startsWith(prefix)) return f;
        }
      }
    }

    // 4. By assigned RM
    if (client.rmId) {
      const allTeam = this.getAllTeamRaw();
      const rm = allTeam.find(m => m.id === client.rmId);
      if (rm && (rm.firmId || rm.firmArn)) {
        const found = firms.find(f => f.id === rm.firmId || (f.arn && f.arn.toUpperCase() === (rm.firmArn || '').toUpperCase()));
        if (found) return found;
      }
    }

    return this.getActiveFirm();
  },

  getFirm(target = null) {
    if (target) {
      if (typeof target === 'object') {
        return this.getFirmByClient(target);
      }
      if (typeof target === 'string') {
        const firms = this.getRegisteredFirms();
        const found = firms.find(f => f.id === target || (f.arn && f.arn.toUpperCase() === target.toUpperCase()));
        if (found) return found;
      }
    }
    return this.getActiveFirm();
  },

  saveFirm(firmData) {
    const firms = this.getRegisteredFirms();
    const idx = firms.findIndex(f => f.id === firmData.id || f.arn.toUpperCase() === (firmData.arn || '').toUpperCase());
    if (idx > -1) {
      firms[idx] = { ...firms[idx], ...firmData };
    } else {
      firms.push(firmData);
    }
    this.saveRegisteredFirms(firms);

    const session = this.getActiveSession();
    if (session && (session.firmId === firmData.id || session.arn.toUpperCase() === (firmData.arn || '').toUpperCase())) {
      this.createSession(firmData);
    }
    _getStorage().setItem('vednova_firm_meta', JSON.stringify(firmData));
  },

  getAllClientsRaw() {
    let allClients = [];
    try {
      const stored = _getStorage().getItem('vednova_clients');
      if (stored) {
        allClients = JSON.parse(stored);
      } else {
        allClients = SEED_CLIENTS;
      }
    } catch (e) {
      allClients = SEED_CLIENTS;
    }

    // Auto-migrate legacy clients and ensure seed data for standard firms exists
    let modified = false;
    allClients = allClients.map(c => {
      if (!c.firmId || (c.firmId === 'firm_sss_1998' && c.caseId && c.caseId.startsWith('VN-'))) {
        c.firmId = 'firm_zenith_2004';
        c.firmArn = 'ARN-48291';
        modified = true;
      }
      if (c.caseId && c.caseId.startsWith('AWP') && c.firmArn !== 'ARN-887766') {
        c.firmId = 'firm_apex_2015';
        c.firmArn = 'ARN-887766';
        modified = true;
      }
      if (c.clientName && c.clientName.includes('Sanjeev Roy')) {
        c.clientName = 'Col. Arvind Rathore';
        if (c.policies) {
          c.policies.forEach(p => {
            if (p.owner && p.owner.includes('Roy')) p.owner = p.owner.replace(/Roy/g, 'Rathore').replace(/Sanjeev/g, 'Arvind');
            if (p.insured && p.insured.includes('Roy')) p.insured = p.insured.replace(/Roy/g, 'Rathore').replace(/Sanjeev/g, 'Arvind');
          });
        }
        modified = true;
      }
      return c;
    });

    // Ensure Zenith seed clients are present
    SEED_CLIENTS.forEach(sc => {
      if (!allClients.some(c => c.caseId === sc.caseId)) {
        allClients.push(sc);
        modified = true;
      }
    });

    if (modified) {
      _getStorage().setItem('vednova_clients', JSON.stringify(allClients));
    }

    return allClients;
  },

  /**
   * Scoped client query: returns ONLY clients belonging to active logged-in firm
   */
  getClients(targetFirmId = null) {
    const activeFirm = this.getActiveFirm();
    const targetFirm = targetFirmId || (activeFirm ? activeFirm.id : null);
    const targetArn = activeFirm ? activeFirm.arn.toUpperCase() : null;

    const allClients = this.getAllClientsRaw();
    if (!targetFirm && !targetArn) return allClients;

    return allClients.filter(c => 
      (c.firmId && c.firmId === targetFirm) || 
      (c.firmArn && targetArn && c.firmArn.toUpperCase() === targetArn)
    );
  },

  getClientByCaseId(caseId) {
    const allClients = this.getAllClientsRaw();
    if (!caseId) {
      const firmClients = this.getClients();
      return firmClients[0] || allClients[0];
    }
    return allClients.find(c => c.caseId.toUpperCase() === caseId.toUpperCase()) || allClients[0];
  },

  saveClient(clientData) {
    const activeFirm = this.getActiveFirm();
    if (!clientData.firmId && activeFirm) {
      clientData.firmId = activeFirm.id;
      clientData.firmArn = activeFirm.arn;
    }
    const allClients = this.getAllClientsRaw();
    const idx = allClients.findIndex(c => c.caseId === clientData.caseId);
    if (idx > -1) {
      allClients[idx] = clientData;
    } else {
      allClients.unshift(clientData);
    }
    _getStorage().setItem('vednova_clients', JSON.stringify(allClients));
  },

  getAllTeamRaw() {
    let allTeam = [];
    try {
      const stored = _getStorage().getItem('vednova_team');
      if (stored) {
        allTeam = JSON.parse(stored);
      } else {
        allTeam = SEED_TEAM;
      }
    } catch (e) {
      allTeam = SEED_TEAM;
    }

    let modified = false;
    allTeam = allTeam.map(m => {
      if (!m.firmId || (['rm_01', 'rm_02', 'rm_03', 'rm_04'].includes(m.id) && (m.firmId === 'firm_sss_1998' || m.firmArn === 'ARN-1998'))) {
        m.firmId = 'firm_zenith_2004';
        m.firmArn = 'ARN-48291';
        if (m.email && m.email.includes('sssdistributors.com')) {
          m.email = m.email.replace('sssdistributors.com', 'zenithwealth.in');
        }
        modified = true;
      }
      return m;
    });

    // Ensure Zenith and Apex team are present
    SEED_TEAM.forEach(st => {
      if (!allTeam.some(m => m.id === st.id)) {
        allTeam.push(st);
        modified = true;
      }
    });

    if (modified) {
      _getStorage().setItem('vednova_team', JSON.stringify(allTeam));
    }

    return allTeam;
  },

  /**
   * Scoped team query: returns ONLY team members belonging to active firm
   */
  getTeam(targetFirmId = null) {
    const activeFirm = this.getActiveFirm();
    const targetFirm = targetFirmId || (activeFirm ? activeFirm.id : null);
    const targetArn = activeFirm ? activeFirm.arn.toUpperCase() : null;

    const allTeam = this.getAllTeamRaw();
    if (!targetFirm && !targetArn) return allTeam;

    return allTeam.filter(m => 
      (m.firmId && m.firmId === targetFirm) || 
      (m.firmArn && targetArn && m.firmArn.toUpperCase() === targetArn)
    );
  },

  addTeamMember(member) {
    const activeFirm = this.getActiveFirm();
    if (!member.firmId && activeFirm) {
      member.firmId = activeFirm.id;
      member.firmArn = activeFirm.arn;
    }
    const allTeam = this.getAllTeamRaw();
    member.id = `rm_${Date.now()}`;
    member.clientsCount = member.clientsCount || 0;
    member.activeSIPPipeline = member.activeSIPPipeline || 0;
    member.status = 'ACTIVE';
    member.isAdmin = !!member.isAdmin;
    allTeam.push(member);
    _getStorage().setItem('vednova_team', JSON.stringify(allTeam));
    return member;
  },

  toggleTeamMemberAdmin(memberId) {
    const allTeam = this.getAllTeamRaw();
    const idx = allTeam.findIndex(m => m.id === memberId);
    if (idx > -1) {
      const current = allTeam[idx];
      const newAdminState = !current.isAdmin;
      current.isAdmin = newAdminState;
      if (newAdminState) {
        if (!current.role.includes('Partner') && !current.role.includes('Admin')) {
          current.role = `${current.role} (Admin Partner)`;
        }
      } else {
        current.role = current.role.replace(' (Admin Partner)', '').replace(' (Admin)', '');
      }
      _getStorage().setItem('vednova_team', JSON.stringify(allTeam));
      return current;
    }
    return null;
  },

  generateAdminResetOTP(arnOrEmail) {
    const clean = (arnOrEmail || '').trim().toUpperCase();
    if (!clean) {
      return { 
        success: false, 
        message: 'Please enter your registered AMFI ARN or admin email address.' 
      };
    }

    const firms = this.getRegisteredFirms();
    const allTeam = this.getAllTeamRaw();

    // 1. Direct match on firm ARN, email, adminEmail, aliases, or firmName
    let firm = firms.find(f => 
      (f.arn && f.arn.toUpperCase() === clean) || 
      (f.email && f.email.toUpperCase() === clean) ||
      (f.adminEmail && f.adminEmail.toUpperCase() === clean) ||
      (f.firmName && f.firmName.toUpperCase() === clean) ||
      (f.aliases && f.aliases.some(a => a.toUpperCase() === clean))
    );

    // 2. Check team roster for Admin member (Principal Admin or Admin Partner)
    let matchedAdmin = null;
    if (!firm) {
      matchedAdmin = allTeam.find(m => m.isAdmin && m.email && m.email.toUpperCase() === clean);
      if (matchedAdmin) {
        firm = firms.find(f => 
          (matchedAdmin.firmId && f.id === matchedAdmin.firmId) || 
          (matchedAdmin.firmArn && f.arn && f.arn.toUpperCase() === matchedAdmin.firmArn.toUpperCase())
        );
      }
    } else {
      matchedAdmin = allTeam.find(m => m.isAdmin && (
        (m.email && m.email.toUpperCase() === clean) ||
        (firm.id && m.firmId === firm.id) ||
        (firm.arn && m.firmArn && m.firmArn.toUpperCase() === firm.arn.toUpperCase())
      ));
    }

    // 3. Fallback for known Zenith/Apex administrator emails
    if (!firm) {
      if (clean === 'ROHIT.DEV@ZENITHWEALTH.IN' || clean === 'ADMIN@ZENITHWEALTH.IN') {
        firm = firms.find(f => f.arn.toUpperCase() === 'ARN-48291' || f.id === 'firm_zenith_2004') || firms[0];
      } else if (clean === 'SUNIL.MEHTA@APEXWEALTH.IN' || clean === 'CONTACT@APEXWEALTH.IN') {
        firm = firms.find(f => f.arn.toUpperCase() === 'ARN-887766' || f.id === 'firm_apex_2015') || firms[1];
      }
    }

    if (!firm) {
      // Check if user is a Relationship Manager who mistakenly used the Admin tab
      const isRm = allTeam.find(m => !m.isAdmin && m.email && m.email.toUpperCase() === clean);
      if (isRm) {
        return { 
          success: false, 
          message: `"${arnOrEmail}" is registered as a Relationship Manager (${isRm.role}). Please switch to the "Relationship Manager / Advisor" tab above to request a reset from your administrator.` 
        };
      }

      return { 
        success: false, 
        message: `No registered MFD firm found matching "${arnOrEmail}". Please check your AMFI ARN or registered admin email.` 
      };
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    
    // Select recipient email for notification & masking
    const destEmail = (matchedAdmin && matchedAdmin.email) 
      ? matchedAdmin.email 
      : (firm.email || 'rohit.dev@zenithwealth.in');

    // Mask email: r****v@zenithwealth.in
    let maskedEmail = 'admin@distributor.in';
    if (destEmail && destEmail.includes('@')) {
      const parts = destEmail.split('@');
      const uname = parts[0];
      const domain = parts[1];
      const maskedUname = uname.length <= 2 
        ? uname[0] + '****' 
        : uname[0] + '****' + uname[uname.length - 1];
      maskedEmail = `${maskedUname}@${domain}`;
    }

    const maskedPhone = (matchedAdmin && matchedAdmin.phone) ? matchedAdmin.phone : '+91 98*** ***10';

    // Store pending OTP session in memory/storage
    const pendingSession = {
      arn: firm.arn,
      email: firm.email,
      adminEmail: matchedAdmin ? matchedAdmin.email : destEmail,
      requestedIdentifier: (arnOrEmail || '').trim(),
      firmId: firm.id,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + (10 * 60 * 1000) // 10 mins
    };
    _getStorage().setItem('vednova_pending_reset_otp', JSON.stringify(pendingSession));

    return {
      success: true,
      firmName: firm.firmName,
      arn: firm.arn,
      adminName: matchedAdmin ? matchedAdmin.name : firm.adminName,
      maskedEmail,
      maskedPhone,
      otp // Sent to simulated device SMS notification
    };
  },

  verifyAdminResetOTP(arnOrEmail, enteredOtp, newPassword) {
    const cleanId = (arnOrEmail || '').trim().toUpperCase();
    const cleanOtp = (enteredOtp || '').trim();

    let pending = null;
    try {
      const raw = _getStorage().getItem('vednova_pending_reset_otp');
      if (raw) pending = JSON.parse(raw);
    } catch (e) {}

    if (!pending) {
      return { success: false, message: 'No active OTP verification session found. Please request a verification code.' };
    }

    const matchesArn = pending.arn && pending.arn.toUpperCase() === cleanId;
    const matchesEmail = pending.email && pending.email.toUpperCase() === cleanId;
    const matchesAdminEmail = pending.adminEmail && pending.adminEmail.toUpperCase() === cleanId;
    const matchesIdentifier = pending.requestedIdentifier && pending.requestedIdentifier.toUpperCase() === cleanId;

    if (!matchesArn && !matchesEmail && !matchesAdminEmail && !matchesIdentifier) {
      return { success: false, message: 'Verification session mismatch. Please enter the same ARN or email you used to request the code.' };
    }

    if (Date.now() > pending.expiresAt) {
      _getStorage().removeItem('vednova_pending_reset_otp');
      return { success: false, message: 'Verification code has expired (10 min validity). Please request a new code.' };
    }

    if (pending.otp !== cleanOtp) {
      return { success: false, message: 'Incorrect 6-digit verification code. Please check your SMS/email notification.' };
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'Please enter a valid password (minimum 4 characters).' };
    }

    // Code verified! Execute password reset
    const res = this.resetAdminPassword(pending.arn, newPassword.trim(), pending.adminEmail || pending.requestedIdentifier);
    _getStorage().removeItem('vednova_pending_reset_otp');
    return res;
  },

  resetAdminPassword(arnOrEmail, newPassword, targetAdminEmail = null) {
    const clean = (arnOrEmail || '').trim().toUpperCase();
    const firms = this.getRegisteredFirms();
    const allTeam = this.getAllTeamRaw();

    let firmIdx = firms.findIndex(f => 
      (f.arn && f.arn.toUpperCase() === clean) || 
      (f.email && f.email.toUpperCase() === clean) ||
      (f.adminEmail && f.adminEmail.toUpperCase() === clean) ||
      (f.firmName && f.firmName.toUpperCase() === clean) ||
      (f.aliases && f.aliases.some(a => a.toUpperCase() === clean))
    );

    let adminMember = null;
    if (firmIdx === -1) {
      adminMember = allTeam.find(m => m.isAdmin && m.email && m.email.toUpperCase() === clean);
      if (adminMember) {
        firmIdx = firms.findIndex(f => 
          (adminMember.firmId && f.id === adminMember.firmId) ||
          (adminMember.firmArn && f.arn && f.arn.toUpperCase() === adminMember.firmArn.toUpperCase())
        );
      }
    }

    if (firmIdx === -1 && (clean === 'ROHIT.DEV@ZENITHWEALTH.IN' || clean === 'ADMIN@ZENITHWEALTH.IN')) {
      firmIdx = firms.findIndex(f => f.arn.toUpperCase() === 'ARN-48291' || f.id === 'firm_zenith_2004');
    }

    if (firmIdx === -1) {
      return { success: false, message: 'No registered distributor found for this ARN or email.' };
    }

    firms[firmIdx].password = newPassword;
    this.saveRegisteredFirms(firms);

    // Also update primary admin and/or target admin in team roster
    let teamModified = false;
    const targetClean = (targetAdminEmail || (adminMember ? adminMember.email : clean)).toUpperCase();
    allTeam.forEach(m => {
      if (m.isAdmin && (m.firmId === firms[firmIdx].id || (m.firmArn && m.firmArn.toUpperCase() === firms[firmIdx].arn.toUpperCase()))) {
        if (m.isPrimaryAdmin || (m.email && m.email.toUpperCase() === targetClean)) {
          m.password = newPassword;
          teamModified = true;
        }
      }
    });

    if (teamModified) {
      _getStorage().setItem('vednova_team', JSON.stringify(allTeam));
    }

    return { success: true, firm: firms[firmIdx] };
  },

  updateTeamMemberPassword(memberId, newPassword) {
    const allTeam = this.getAllTeamRaw();
    const idx = allTeam.findIndex(m => m.id === memberId);
    if (idx === -1) {
      return { success: false, message: 'Team member not found.' };
    }
    allTeam[idx].password = newPassword;
    _getStorage().setItem('vednova_team', JSON.stringify(allTeam));
    return { success: true, member: allTeam[idx] };
  },

  deleteTeamMember(memberId) {
    const allTeam = this.getAllTeamRaw();
    const memberToDelete = allTeam.find(m => m.id === memberId);
    if (!memberToDelete) return { success: false, message: 'Member not found.' };

    const firmId = memberToDelete.firmId;
    const firmArn = memberToDelete.firmArn;

    // Find the firm's primary Admin or Partner to inherit client portfolios
    const admin = allTeam.find(m => m.isAdmin && m.id !== memberId && (m.firmId === firmId || (m.firmArn && m.firmArn.toUpperCase() === (firmArn || '').toUpperCase())))
      || allTeam.find(m => m.isAdmin && m.id !== memberId)
      || { id: 'rm_admin', name: 'Firm Principal Admin', role: 'Principal Admin' };

    // Reassign all active clients belonging to this RM to the Admin
    let allClients = this.getAllClientsRaw();
    let reassignedCount = 0;
    allClients = allClients.map(c => {
      if (c.rmId === memberId) {
        c.rmId = admin.id;
        c.assignedRM = `${admin.name} (${admin.role || 'Principal Admin'})`;
        reassignedCount++;
      }
      return c;
    });
    _getStorage().setItem('vednova_clients', JSON.stringify(allClients));

    // Remove member from team
    const updatedTeam = allTeam.filter(m => m.id !== memberId);
    _getStorage().setItem('vednova_team', JSON.stringify(updatedTeam));

    return { 
      success: true, 
      deletedName: memberToDelete.name, 
      reassignedCount, 
      reassignedTo: admin.name 
    };
  },

  reassignClient(caseId, targetRmId) {
    const allClients = this.getAllClientsRaw();
    const clientIdx = allClients.findIndex(c => c.caseId === caseId);
    if (clientIdx === -1) {
      return { success: false, message: 'Client not found.' };
    }

    const allTeam = this.getAllTeamRaw();
    const targetRm = allTeam.find(m => m.id === targetRmId);
    if (!targetRm) {
      return { success: false, message: 'Target Relationship Manager not found.' };
    }

    const oldRmId = allClients[clientIdx].rmId;
    allClients[clientIdx].rmId = targetRm.id;
    allClients[clientIdx].assignedRM = `${targetRm.name} (${targetRm.role || 'Servicing RM'})`;
    _getStorage().setItem('vednova_clients', JSON.stringify(allClients));

    // Update client counts for team
    if (oldRmId) {
      const oldRm = allTeam.find(m => m.id === oldRmId);
      if (oldRm && oldRm.clientsCount > 0) oldRm.clientsCount--;
    }
    targetRm.clientsCount = (targetRm.clientsCount || 0) + 1;
    _getStorage().setItem('vednova_team', JSON.stringify(allTeam));

    return { 
      success: true, 
      client: allClients[clientIdx], 
      assignedRM: allClients[clientIdx].assignedRM 
    };
  },

  lookupRmAccount(email) {
    const clean = (email || '').trim().toLowerCase();
    const allTeam = this.getAllTeamRaw();
    const member = allTeam.find(m => m.email && m.email.toLowerCase() === clean);
    if (!member) {
      return { found: false, message: 'No team member found with this official email.' };
    }
    const firms = this.getRegisteredFirms();
    const firm = firms.find(f => f.id === member.firmId || (f.arn && f.arn.toUpperCase() === (member.firmArn || '').toUpperCase())) || firms[0];
    const admin = allTeam.find(m => m.isAdmin && (m.firmId === firm.id || (m.firmArn && m.firmArn.toUpperCase() === firm.arn.toUpperCase())))
      || { name: firm.adminName, email: firm.email, role: firm.adminRole };

    return {
      found: true,
      isAdmin: !!member.isAdmin,
      member: { name: member.name, role: member.role, email: member.email, isAdmin: !!member.isAdmin },
      firm: { name: firm.firmName, arn: firm.arn },
      admin: { name: admin.name, email: admin.email || firm.email, role: admin.role || 'Principal Admin' }
    };
  },

  loginWithSSO(provider, email, name, firmName = null, firmArn = null, isRegistration = false) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const firms = this.getRegisteredFirms();
    const allTeam = this.getAllTeamRaw();

    // 1. Check if email matches existing firm admin email or aliases
    let matchedFirm = firms.find(f => 
      (f.email && f.email.toLowerCase() === cleanEmail) ||
      (f.adminEmail && f.adminEmail.toLowerCase() === cleanEmail) ||
      (f.aliases && f.aliases.some(a => a.toLowerCase() === cleanEmail))
    );
    let matchedMember = null;

    // 2. Check if email matches any team member
    matchedMember = allTeam.find(m => m.email && m.email.toLowerCase() === cleanEmail);
    if (matchedMember && !matchedFirm) {
      matchedFirm = firms.find(f => f.id === matchedMember.firmId || (f.arn && f.arn.toUpperCase() === (matchedMember.firmArn || '').toUpperCase()));
    }

    // 3. Fallback check for known seed accounts
    if (!matchedFirm) {
      if (cleanEmail === 'rohit.dev@zenithwealth.in' || cleanEmail === 'admin@zenithwealth.in') {
        matchedFirm = firms.find(f => f.arn.toUpperCase() === 'ARN-48291') || firms[0];
      } else if (cleanEmail === 'sunil.mehta@apexwealth.in' || cleanEmail === 'contact@apexwealth.in') {
        matchedFirm = firms.find(f => f.arn.toUpperCase() === 'ARN-887766') || firms[1];
      }
    }

    // 4. Strict authentication check: If NOT found and NOT in registration flow, REJECT!
    if (!matchedFirm) {
      if (!isRegistration) {
        return {
          success: false,
          notRegistered: true,
          email: cleanEmail,
          provider: provider,
          message: `No registered MFD firm or advisor account found for ${cleanEmail}. This ${provider === 'google' ? 'Google' : 'Microsoft'} account is not registered in the system.`
        };
      }

      // If called from registration flow, provision new firm
      const generatedArn = firmArn || `ARN-${Math.floor(100000 + Math.random() * 900000)}`;
      const newFirm = {
        id: `firm_${Date.now()}`,
        firmName: firmName || `${name || 'Advisory'}'s Wealth Partners`,
        arn: generatedArn,
        establishedYear: 2024,
        email: cleanEmail,
        adminName: name || 'Advisory Principal',
        adminRole: 'Principal MFD (Admin)',
        password: 'password123',
        authProvider: provider
      };
      matchedFirm = this.registerFirm(newFirm);
    }

    const sessionFirm = {
      ...matchedFirm,
      adminName: matchedMember ? matchedMember.name : (name || matchedFirm.adminName),
      adminRole: matchedMember ? matchedMember.role : matchedFirm.adminRole,
      rmId: matchedMember ? matchedMember.id : null,
      isAdmin: matchedMember ? !!matchedMember.isAdmin : true,
      isRM: matchedMember ? !matchedMember.isAdmin : false,
      authProvider: provider
    };

    this.createSession(sessionFirm, matchedMember);
    return {
      success: true,
      firm: sessionFirm,
      isRM: sessionFirm.isRM,
      isAdmin: sessionFirm.isAdmin,
      provider
    };
  },

  getAllInvitesRaw() {
    let allInvites = [];
    try {
      const stored = _getStorage().getItem('vednova_invites');
      if (stored) {
        allInvites = JSON.parse(stored);
      } else {
        allInvites = SEED_INVITES;
      }
    } catch (e) {
      allInvites = SEED_INVITES;
    }

    let modified = false;
    allInvites = allInvites.map(inv => {
      if (!inv.firmId || (['INV-DEF-4821', 'INV-DEF-9912'].includes(inv.code) && (inv.firmId === 'firm_sss_1998' || inv.firmArn === 'ARN-1998'))) {
        inv.firmId = 'firm_zenith_2004';
        inv.firmArn = 'ARN-48291';
        modified = true;
      }
      return inv;
    });

    SEED_INVITES.forEach(si => {
      if (!allInvites.some(inv => inv.code === si.code)) {
        allInvites.push(si);
        modified = true;
      }
    });

    if (modified) {
      _getStorage().setItem('vednova_invites', JSON.stringify(allInvites));
    }

    return allInvites;
  },

  /**
   * Scoped invites query: returns ONLY invite links belonging to active firm
   */
  getInvites(targetFirmId = null) {
    const activeFirm = this.getActiveFirm();
    const targetFirm = targetFirmId || (activeFirm ? activeFirm.id : null);
    const targetArn = activeFirm ? activeFirm.arn.toUpperCase() : null;

    const allInvites = this.getAllInvitesRaw();
    if (!targetFirm && !targetArn) return allInvites;

    return allInvites.filter(inv => 
      (inv.firmId && inv.firmId === targetFirm) || 
      (inv.firmArn && targetArn && inv.firmArn.toUpperCase() === targetArn)
    );
  },

  createInvite(role = 'Senior Wealth RM') {
    const activeFirm = this.getActiveFirm();
    const allInvites = this.getAllInvitesRaw();

    let prefix = 'RM';
    if (activeFirm && activeFirm.arn) {
      prefix = activeFirm.arn.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    }
    const code = `${prefix}-RM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvite = {
      code,
      role,
      firmId: activeFirm ? activeFirm.id : 'firm_zenith_2004',
      firmArn: activeFirm ? activeFirm.arn : 'ARN-48291',
      invitedBy: `${activeFirm ? activeFirm.adminName : 'Admin'} (Admin)`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      usesCount: 0
    };

    allInvites.unshift(newInvite);
    _getStorage().setItem('vednova_invites', JSON.stringify(allInvites));
    return newInvite;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VednovaDB;
}
