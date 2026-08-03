export type ClusterKind = "explainer" | "how-to" | "comparison" | "calculator" | "exam-guide";

export interface ClusterPage {
  title: string;
  slug: string;
  kind: ClusterKind;
  summary: string;
  dictionarySlug?: string;
}

export interface Pillar {
  title: string;
  slug: string;
  icon: string;
  searchIntent: string;
  description: string;
  clusters: ClusterPage[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cluster(
  title: string,
  kind: ClusterKind = "explainer",
  dictionarySlug?: string,
  summary = `Understand ${title.toLowerCase()}, how it works, and the practical decisions it affects.`,
): ClusterPage {
  return { title, slug: slugify(title), kind, summary, dictionarySlug };
}

export const pillars: Pillar[] = [
  {
    title: "Personal Finance & Money Basics",
    slug: "personal-finance",
    icon: "savings",
    searchIntent: "Beginner informational",
    description: "Build strong money habits through practical guidance on cash flow, saving, investing, and financial goals.",
    clusters: [
      cluster("Budgeting", "how-to", "budgeting"),
      cluster("Emergency Fund", "how-to"),
      cluster("Saving vs Investing", "comparison"),
      cluster("Financial Goals", "how-to"),
      cluster("Net Worth Calculator", "calculator"),
    ],
  },
  {
    title: "Banking, Savings & Deposits",
    slug: "banking-savings-deposits",
    icon: "account_balance",
    searchIntent: "Informational + India-specific",
    description: "Understand Indian banking products, deposit choices, payment rails, safety, returns, and taxation.",
    clusters: [
      cluster("Fixed Deposit", "explainer", "fixed-deposit"),
      cluster("Recurring Deposit"),
      cluster("Savings Account"),
      cluster("NEFT, IMPS and UPI", "comparison"),
      cluster("FD Maturity Calculator", "calculator", "fixed-deposit"),
    ],
  },
  {
    title: "Loans, Credit & Debt",
    slug: "loans-credit-debt",
    icon: "credit_score",
    searchIntent: "High-intent, affiliate-friendly",
    description: "Make clearer borrowing decisions by understanding loan costs, credit health, repayment, and debt reduction.",
    clusters: [
      cluster("EMI", "explainer", "emi"),
      cluster("Credit Score (CIBIL)", "how-to", "credit-score-cibil"),
      cluster("Home Loan"),
      cluster("Personal Loan"),
      cluster("Debt Payoff", "how-to"),
      cluster("EMI Calculator", "calculator", "emi"),
    ],
  },
  {
    title: "Investing Basics",
    slug: "investing-basics",
    icon: "trending_up",
    searchIntent: "Beginner informational",
    description: "Learn the core ideas behind long-term investing, portfolio construction, risk, and compounding.",
    clusters: [
      cluster("Compound Interest", "explainer", "compound-interest"),
      cluster("Risk vs Return"),
      cluster("Asset Allocation", "how-to"),
      cluster("Diversification", "how-to"),
      cluster("Investment Growth Calculator", "calculator", "compound-interest"),
    ],
  },
  {
    title: "Stock Market & Equities",
    slug: "stock-market-equities",
    icon: "candlestick_chart",
    searchIntent: "Informational + India",
    description: "Learn how shares, Indian indices, public offerings, company size, and shareholder returns work.",
    clusters: [
      cluster("Equity Share"),
      cluster("IPO", "explainer", "ipo"),
      cluster("Sensex and Nifty", "comparison"),
      cluster("Market Capitalization", "explainer", "market-capitalization"),
      cluster("Dividends"),
    ],
  },
  {
    title: "Mutual Funds, SIP & ETFs",
    slug: "mutual-funds-sip-etfs",
    icon: "donut_large",
    searchIntent: "Informational + affiliate",
    description: "Compare pooled investment products, costs, purchase methods, and passive investing choices.",
    clusters: [
      cluster("Mutual Fund", "explainer", "mutual-fund"),
      cluster("SIP (Systematic Investment Plan)", "how-to", "sip-systematic-investment-plan"),
      cluster("SIP vs Lump Sum for Beginners in India", "comparison", undefined, "Compare SIP and lump-sum mutual fund investing by timing risk, cash flow, market conditions, and suitability for Indian beginners."),
      cluster("NAV (Net Asset Value)"),
      cluster("Expense Ratio"),
      cluster("Index Fund", "explainer", "index-fund"),
      cluster("ETF", "comparison", "etf"),
    ],
  },
  {
    title: "Fixed Income & Bonds",
    slug: "fixed-income-bonds",
    icon: "request_quote",
    searchIntent: "Intermediate",
    description: "Understand bond cash flows, interest-rate sensitivity, issuer risk, and fixed-income return measures.",
    clusters: [
      cluster("Bond"),
      cluster("Yield to Maturity"),
      cluster("Coupon Rate"),
      cluster("Bond Duration"),
      cluster("Credit Rating"),
      cluster("Bond Yield Calculator", "calculator"),
    ],
  },
  {
    title: "Derivatives & Risk",
    slug: "derivatives-risk",
    icon: "shield",
    searchIntent: "Intermediate/advanced",
    description: "Explore derivative contracts, market hedging, volatility, and quantitative measures of financial risk.",
    clusters: [
      cluster("Futures"),
      cluster("Options"),
      cluster("Hedging"),
      cluster("Beta", "explainer", "beta"),
      cluster("Value at Risk (VaR)"),
    ],
  },
  {
    title: "Accounting & Financial Statements",
    slug: "accounting-financial-statements",
    icon: "receipt_long",
    searchIntent: "Informational",
    description: "Read financial statements and understand how business activity flows through reported earnings and cash.",
    clusters: [
      cluster("Balance Sheet", "explainer", "balance-sheet"),
      cluster("Income Statement", "explainer", "income-statement"),
      cluster("Cash Flow Statement", "explainer", "cash-flow-statement"),
      cluster("EBITDA", "explainer", "ebitda"),
      cluster("Depreciation", "explainer", "depreciation"),
    ],
  },
  {
    title: "Ratios, Valuation & Analysis",
    slug: "ratios-valuation-analysis",
    icon: "calculate",
    searchIntent: "Informational",
    description: "Use financial ratios and valuation frameworks to analyse business quality and estimate value.",
    clusters: [
      cluster("P/E Ratio", "explainer", "pe-ratio"),
      cluster("EPS"),
      cluster("ROE"),
      cluster("DCF", "how-to", "dcf"),
      cluster("Book Value"),
      cluster("Valuation Comparison", "comparison"),
    ],
  },
  {
    title: "Economics & Macro",
    slug: "economics-macro",
    icon: "public",
    searchIntent: "Informational",
    description: "Connect economic growth, inflation, interest rates, government finances, and business cycles to markets.",
    clusters: [
      cluster("GDP"),
      cluster("Inflation"),
      cluster("Repo Rate"),
      cluster("Fiscal Deficit"),
      cluster("Business Cycles"),
    ],
  },
  {
    title: "Taxation (India)",
    slug: "taxation-india",
    icon: "percent",
    searchIntent: "High-intent, seasonal",
    description: "Navigate common Indian tax concepts that affect salary, saving, investing, and capital gains.",
    clusters: [
      cluster("Capital Gains Tax"),
      cluster("Section 80C"),
      cluster("TDS"),
      cluster("Old vs New Tax Regime", "comparison"),
      cluster("Income Tax Calculator", "calculator"),
    ],
  },
  {
    title: "Insurance",
    slug: "insurance",
    icon: "health_and_safety",
    searchIntent: "High-intent, affiliate",
    description: "Compare protection products, policy structures, regulators, and the costs that matter before buying insurance.",
    clusters: [
      cluster("Term vs Endowment Insurance", "comparison"),
      cluster("ULIP"),
      cluster("Health Insurance", "how-to"),
      cluster("IRDAI Basics"),
      cluster("Life Cover Calculator", "calculator"),
    ],
  },
  {
    title: "Retirement & Planning",
    slug: "retirement-planning",
    icon: "elderly",
    searchIntent: "High-intent, India",
    description: "Plan long-term goals using Indian retirement accounts, contribution strategies, and corpus estimates.",
    clusters: [
      cluster("EPF"),
      cluster("PPF"),
      cluster("NPS"),
      cluster("Retirement Corpus", "how-to"),
      cluster("Goal Planning", "how-to"),
      cluster("Retirement Calculator", "calculator"),
    ],
  },
  {
    title: "Forex, Commodities & Global Markets",
    slug: "forex-commodities-global-markets",
    icon: "currency_exchange",
    searchIntent: "Informational",
    description: "Follow exchange rates, commodities, global benchmarks, and the forces connecting international markets.",
    clusters: [
      cluster("Exchange Rates"),
      cluster("Gold Investing"),
      cluster("Crude Oil"),
      cluster("Global Indices"),
      cluster("Currency Converter", "calculator"),
    ],
  },
  {
    title: "Crypto, Fintech & Digital Assets",
    slug: "crypto-fintech-digital-assets",
    icon: "token",
    searchIntent: "Informational, trending",
    description: "Understand digital assets and the financial technology reshaping payments, ownership, and investing.",
    clusters: [
      cluster("Bitcoin"),
      cluster("Blockchain"),
      cluster("Stablecoins"),
      cluster("Crypto Tax in India"),
      cluster("Digital Asset Risk", "how-to"),
    ],
  },
  {
    title: "Corporate Finance",
    slug: "corporate-finance",
    icon: "corporate_fare",
    searchIntent: "Intermediate",
    description: "Learn how companies fund operations, allocate capital, manage liquidity, and evaluate investments.",
    clusters: [
      cluster("Working Capital", "explainer", "working-capital"),
      cluster("Capital Structure"),
      cluster("WACC", "explainer", "wacc"),
      cluster("Capital Budgeting", "how-to"),
      cluster("Cost of Capital", "explainer", "cost-of-capital"),
    ],
  },
  {
    title: "Exam Prep: CFA",
    slug: "cfa",
    icon: "school",
    searchIntent: "High-value, flagship",
    description: "Organise CFA preparation around level-specific topics, core formulas, practice, and exam strategy.",
    clusters: [
      cluster("CFA Level I Topics", "exam-guide"),
      cluster("CFA Level II Topics", "exam-guide"),
      cluster("CFA Level III Topics", "exam-guide"),
      cluster("CFA Formula Guide", "exam-guide"),
      cluster("CFA Study Tips", "how-to"),
    ],
  },
  {
    title: "Exam Prep: FRM",
    slug: "frm",
    icon: "verified",
    searchIntent: "High-value, flagship",
    description: "Prepare for FRM Part I and II with structured topic maps, formula reviews, and risk-focused practice.",
    clusters: [
      cluster("FRM Part I Topics", "exam-guide"),
      cluster("FRM Part II Topics", "exam-guide"),
      cluster("FRM Formula Guide", "exam-guide"),
      cluster("FRM Study Tips", "how-to"),
    ],
  },
  {
    title: "Exam Prep: Other",
    slug: "finance-exam-prep",
    icon: "menu_book",
    searchIntent: "Long-tail",
    description: "Build practical finance credentials through NISM, FMVA, and financial-modelling learning paths.",
    clusters: [
      cluster("NISM Exam Guide", "exam-guide"),
      cluster("FMVA Guide", "exam-guide"),
      cluster("Financial Modelling Basics", "exam-guide"),
      cluster("Finance Certification Comparison", "comparison"),
    ],
  },
];

export const pillarMap = new Map(pillars.map((pillar) => [pillar.slug, pillar]));

export function getPillarBySlug(slug: string): Pillar | undefined {
  return pillarMap.get(slug);
}

const labelToPillar: Record<string, string> = {
  "Investing Basics": "investing-basics",
  "Banking Savings and Deposits": "banking-savings-deposits",
  "Mutual Funds and SIP": "mutual-funds-sip-etfs",
  "Loans Credit and Debt": "loans-credit-debt",
  "Accounting and Financial Statements": "accounting-financial-statements",
  "Ratios and Valuation": "ratios-valuation-analysis",
  "Stock Market and Equities": "stock-market-equities",
  "Derivatives and Risk": "derivatives-risk",
  "Economics & Macro": "economics-macro",
};

const legacyCategoryToPillar: Record<string, string> = {
  valuation: "ratios-valuation-analysis",
  accounting: "accounting-financial-statements",
  ma: "corporate-finance",
  markets: "stock-market-equities",
  fpa: "corporate-finance",
  ai: "crypto-fintech-digital-assets",
};

export function getPillarSlugForTerm(term: { category: string; categoryLabel?: string }): string {
  return (term.categoryLabel && labelToPillar[term.categoryLabel]) || legacyCategoryToPillar[term.category] || "personal-finance";
}

export function getCluster(pillarSlug: string, clusterSlug: string): { pillar: Pillar; cluster: ClusterPage } | undefined {
  const pillar = getPillarBySlug(pillarSlug);
  const clusterPage = pillar?.clusters.find((item) => item.slug === clusterSlug);
  return pillar && clusterPage ? { pillar, cluster: clusterPage } : undefined;
}
