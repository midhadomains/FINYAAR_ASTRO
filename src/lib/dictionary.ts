import dictionaryMetadata from "../data/finyaar-dictionary-metadata.json";
import katex from "katex";

const lessonModules = import.meta.glob<string>("../data/dictionary-lessons/*-lesson-body.html", {
  eager: true,
  query: "?raw",
  import: "default",
});

export type CategoryKey = "valuation" | "accounting" | "ma" | "markets" | "fpa" | "ai";

export interface Category {
  key: CategoryKey;
  label: string;
  icon: string;
  description: string;
}

export interface FormulaBlock {
  equation: string;
  variables: { symbol: string; meaning: string }[];
}

export interface WorkedExample {
  intro: string;
  steps: { label: string; detail: string; value: string }[];
  result: string;
}

export interface ComparisonTable {
  title: string;
  columns: string[];
  rows: { label: string; values: string[] }[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface QuizBlock {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Term {
  term: string;
  slug: string;
  category: CategoryKey;
  categoryLabel?: string;
  definition: string;
  formula?: FormulaBlock;
  example?: WorkedExample;
  comparison?: ComparisonTable;
  faq?: FaqItem[];
  quiz?: QuizBlock;
  url?: string;
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  relatedSlugs?: string[];
  lessonBody?: string;
  lessonToc?: { id: string; label: string }[];
}

export const categories: Category[] = [
  { key: "valuation", label: "Valuation & Modeling", icon: "insights", description: "DCF, multiples, and the mechanics of pricing a business." },
  { key: "accounting", label: "Accounting & Statements", icon: "description", description: "The three statements and the accrual logic behind them." },
  { key: "ma", label: "M&A & Deals", icon: "account_balance", description: "Deal structure, diligence, and transaction mechanics." },
  { key: "markets", label: "Markets & Trading", icon: "show_chart", description: "Pricing, risk, and how capital markets actually move." },
  { key: "fpa", label: "FP&A & Corporate Finance", icon: "calendar_month", description: "Budgeting, forecasting, and internal planning workflows." },
  { key: "ai", label: "AI & Data", icon: "auto_awesome", description: "How AI is applied responsibly inside finance workflows." },
];

export const categoryMap: Record<CategoryKey, Category> = Object.fromEntries(
  categories.map((c) => [c.key, c])
) as Record<CategoryKey, Category>;

function slugify(term: string): string {
  const base = term.split(" (")[0];
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type RawTerm = Omit<Term, "slug">;

const _unpublishedTerms: RawTerm[] = [
  // Valuation & Modeling
  {
    term: "DCF (Discounted Cash Flow)",
    category: "valuation",
    definition: "A valuation method that estimates a company's worth from the present value of its expected future free cash flows.",
    formula: {
      equation: "EV = Σ [FCFₜ / (1 + r)ᵗ] + PV(Terminal Value)",
      variables: [
        { symbol: "FCFₜ", meaning: "Free cash flow expected in period t" },
        { symbol: "r", meaning: "Discount rate, typically WACC" },
        { symbol: "t", meaning: "Period number in the forecast" },
        { symbol: "Terminal Value", meaning: "Estimated value of the business beyond the forecast period" },
      ],
    },
    example: {
      intro: "Company ABC is expected to generate free cash flow of $100m, $105m, and $110m over the next three years, discounted at a 10% WACC. Terminal value uses a 2% perpetual growth rate.",
      steps: [
        { label: "Year 1", detail: "$100m ÷ 1.10¹", value: "$90.9m" },
        { label: "Year 2", detail: "$105m ÷ 1.10²", value: "$86.8m" },
        { label: "Year 3", detail: "$110m ÷ 1.10³", value: "$82.6m" },
        { label: "Terminal Value", detail: "$110m × 1.02 ÷ (10% − 2%), discounted 3 years", value: "$1,053.7m" },
      ],
      result: "Enterprise Value ≈ $1,314.0m",
    },
    faq: [
      { question: "Why use WACC as the discount rate instead of the cost of equity?", answer: "WACC discounts cash flows available to all capital providers — debt and equity — which matches unlevered free cash flow. Cost of equity is used only when discounting cash flows to equity holders directly." },
      { question: "How sensitive is a DCF to the terminal value assumption?", answer: "Very. Terminal value often represents 60–80% of total enterprise value in a DCF, so small changes in the terminal growth rate or exit multiple can swing the valuation significantly." },
    ],
    quiz: {
      question: "In a typical DCF, what usually represents the largest share of enterprise value?",
      options: ["Year 1 free cash flow", "Terminal value", "Net working capital", "The tax shield"],
      correctIndex: 1,
      explanation: "Terminal value captures all cash flows beyond the explicit forecast window and commonly makes up the majority of total enterprise value.",
    },
  },
  { term: "WACC (Weighted Average Cost of Capital)", category: "valuation", definition: "The blended required return a company must earn across debt and equity to satisfy all of its capital providers.",
    formula: {
      equation: "WACC = (E/V × Re) + (D/V × Rd × (1 − Tc))",
      variables: [
        { symbol: "E", meaning: "Market value of equity" },
        { symbol: "D", meaning: "Market value of debt" },
        { symbol: "V", meaning: "Total capital, E + D" },
        { symbol: "Re", meaning: "Cost of equity" },
        { symbol: "Rd", meaning: "Cost of debt" },
        { symbol: "Tc", meaning: "Corporate tax rate" },
      ],
    },
    example: {
      intro: "A company has $800m of equity and $200m of debt, a 12% cost of equity, a 6% cost of debt, and a 25% tax rate.",
      steps: [
        { label: "Equity contribution", detail: "(800/1,000) × 12%", value: "9.6%" },
        { label: "Debt contribution", detail: "(200/1,000) × 6% × (1 − 25%)", value: "0.9%" },
      ],
      result: "WACC = 9.6% + 0.9% = 10.5%",
    },
    faq: [
      { question: "Why is the after-tax cost of debt used?", answer: "Interest expense is tax-deductible, so debt's effective cost to the company is lower than its stated rate — the (1 − tax rate) term captures that tax shield." },
      { question: "Should WACC use book value or market value weights?", answer: "Market value weights, since they reflect what the capital actually costs today rather than its historical accounting value." },
    ],
    quiz: {
      question: "If a company takes on more debt, up to a reasonable point, what typically happens to WACC?",
      options: ["It always rises", "It typically falls, since debt is cheaper and tax-deductible", "It stays exactly the same", "It becomes undefined"],
      correctIndex: 1,
      explanation: "Debt is usually cheaper than equity and its interest is tax-deductible, so moderate leverage tends to lower the blended WACC — up until the added risk starts pushing both Re and Rd higher.",
    },
  },
  { term: "Terminal Value", category: "valuation", definition: "The estimated value of a business beyond the explicit forecast period in a DCF model." },
  { term: "Comparable Company Analysis (Comps)", category: "valuation", definition: "Valuing a business by benchmarking its multiples against similar publicly traded companies." },
  { term: "Precedent Transactions", category: "valuation", definition: "A valuation method based on the multiples paid in past M&A deals for similar companies." },
  {
    term: "NPV (Net Present Value)", category: "valuation", definition: "The difference between the present value of cash inflows and outflows of a project or investment.",
    formula: {
      equation: "NPV = Σ [CFₜ / (1 + r)ᵗ] − Initial Investment",
      variables: [
        { symbol: "CFₜ", meaning: "Cash flow in period t" },
        { symbol: "r", meaning: "Discount rate" },
        { symbol: "Initial Investment", meaning: "Upfront cash outlay at time zero" },
      ],
    },
    example: {
      intro: "A project costs $1,000 upfront and returns $400 per year for 3 years, discounted at 8%.",
      steps: [
        { label: "Year 1", detail: "$400 ÷ 1.08¹", value: "$370.4" },
        { label: "Year 2", detail: "$400 ÷ 1.08²", value: "$343.0" },
        { label: "Year 3", detail: "$400 ÷ 1.08³", value: "$317.6" },
      ],
      result: "NPV = $1,031.0 − $1,000 = +$31.0 (accept)",
    },
    comparison: {
      title: "NPV vs. IRR",
      columns: ["NPV", "IRR"],
      rows: [
        { label: "Output", values: ["A dollar amount of value created", "A break-even percentage return"] },
        { label: "Multiple valid answers?", values: ["No", "Possible if cash flows change sign more than once"] },
        { label: "Best for", values: ["Comparing projects of different sizes", "Communicating a single rate of return"] },
        { label: "Reinvestment assumption", values: ["Reinvested at the discount rate", "Reinvested at the IRR itself"] },
      ],
    },
    faq: [
      { question: "What does a positive NPV mean?", answer: "The project is expected to generate more value than its cost of capital requires, so undertaking it should increase shareholder value." },
      { question: "How does NPV differ from IRR?", answer: "NPV gives a dollar value of value created; IRR gives the break-even discount rate. NPV is generally preferred when comparing mutually exclusive projects of different sizes." },
    ],
    quiz: {
      question: "A project has an NPV of −$50,000 at the firm's required rate of return. What should the firm do?",
      options: ["Accept it", "Reject it", "It's impossible to say", "Recalculate using IRR only"],
      correctIndex: 1,
      explanation: "A negative NPV means the project destroys value at the required rate of return, so it should be rejected.",
    },
  },
  {
    term: "IRR (Internal Rate of Return)", category: "valuation", definition: "The discount rate that makes an investment's net present value equal to zero.",
    formula: {
      equation: "0 = Σ [CFₜ / (1 + IRR)ᵗ] − Initial Investment",
      variables: [
        { symbol: "CFₜ", meaning: "Cash flow in period t" },
        { symbol: "IRR", meaning: "The rate solved for iteratively" },
        { symbol: "Initial Investment", meaning: "Upfront cash outlay at time zero" },
      ],
    },
    example: {
      intro: "Using the same project as the NPV example — $1,000 upfront, $400 per year for 3 years — the NPV at an 8% discount rate is positive, so the IRR must sit above 8%.",
      steps: [
        { label: "NPV at 8%", detail: "Discount rate used in the NPV example", value: "+$31.0" },
        { label: "Solve iteratively", detail: "Raise the discount rate until NPV hits zero", value: "≈ 9.7%" },
      ],
      result: "IRR ≈ 9.7%",
    },
    faq: [
      { question: "Why can a project have multiple IRRs?", answer: "If cash flows change sign more than once — for example a large cost mid-project — the IRR equation can have multiple valid roots, making the metric unreliable in that case." },
      { question: "What counts as a good IRR?", answer: "It depends on the project's risk and the company's cost of capital — an IRR is generally attractive when it exceeds the WACC or a defined hurdle rate." },
    ],
    quiz: {
      question: "IRR is best described as the discount rate at which...",
      options: ["Net income equals zero", "NPV equals zero", "Revenue equals cost", "Payback period is minimized"],
      correctIndex: 1,
      explanation: "IRR is defined as the discount rate that sets the project's net present value exactly to zero.",
    },
  },
  {
    term: "EBITDA", category: "valuation", definition: "Earnings before interest, taxes, depreciation, and amortization — a common proxy for operating cash flow.",
    formula: {
      equation: "EBITDA = Net Income + Interest + Taxes + Depreciation + Amortization",
      variables: [
        { symbol: "Net Income", meaning: "Bottom-line profit after all expenses" },
        { symbol: "D&A", meaning: "Non-cash depreciation and amortization charges" },
      ],
    },
    example: {
      intro: "A company reports $50m of net income, $10m of interest expense, $15m of taxes, and $25m of combined depreciation and amortization.",
      steps: [
        { label: "Net income", detail: "Starting point", value: "$50m" },
        { label: "Add back Interest + Taxes + D&A", detail: "$10m + $15m + $25m", value: "$50m" },
      ],
      result: "EBITDA = $100m",
    },
    faq: [
      { question: "Is EBITDA the same as cash flow?", answer: "No — EBITDA ignores capital expenditures, working capital changes, and taxes actually paid, all of which affect real cash generation." },
      { question: "Why do analysts favor EV/EBITDA over P/E?", answer: "EV/EBITDA is capital-structure-neutral, which makes it easier to compare companies with different levels of debt or tax treatment." },
    ],
    quiz: {
      question: "Which of the following would NOT be added back to net income to calculate standard EBITDA?",
      options: ["Interest expense", "Taxes", "Revenue", "Depreciation"],
      correctIndex: 2,
      explanation: "Revenue isn't added back at all — EBITDA starts from net income and only adds back interest, taxes, depreciation, and amortization.",
    },
  },
  { term: "Enterprise Value (EV)", category: "valuation", definition: "The total value of a company's operations, combining equity value, net debt, and minority interest." },
  { term: "Equity Value", category: "valuation", definition: "The value attributable to shareholders, equal to enterprise value minus net debt and other claims." },
  { term: "Sensitivity Analysis", category: "valuation", definition: "Testing how a model's output changes as key assumptions, like growth or discount rate, are varied." },
  { term: "Football Field Chart", category: "valuation", definition: "A valuation summary chart showing the range of values produced by multiple methodologies side by side." },
  {
    term: "LBO (Leveraged Buyout)", category: "valuation", definition: "An acquisition financed largely with debt, using the target's own cash flows to repay it over time.",
    formula: {
      equation: "Equity IRR ≈ (Exit Equity Value / Entry Equity Value)^(1/Years) − 1",
      variables: [
        { symbol: "Exit Equity Value", meaning: "Exit enterprise value minus remaining debt at exit" },
        { symbol: "Entry Equity Value", meaning: "The sponsor's initial equity check" },
        { symbol: "Years", meaning: "Holding period" },
      ],
    },
    example: {
      intro: "A sponsor buys a company for $500m at 8x EBITDA ($62.5m), financed with 60% debt / 40% equity — $300m debt, $200m equity.",
      steps: [
        { label: "After 5 years", detail: "Debt paid down to $150m; EBITDA grows to $80m", value: "—" },
        { label: "Exit value", detail: "$80m EBITDA × 8x exit multiple", value: "$640m" },
        { label: "Exit equity", detail: "$640m − $150m remaining debt", value: "$490m" },
      ],
      result: "Equity IRR ≈ (490/200)^(1/5) − 1 ≈ 19.6%",
    },
    faq: [
      { question: "What are the main levers that drive LBO returns?", answer: "Debt paydown, EBITDA growth, and multiple expansion (or avoiding contraction) at exit — roughly in that order of controllability for the sponsor." },
      { question: "Why do LBOs use so much debt?", answer: "Debt amplifies equity returns when the deal performs, and its interest is tax-deductible — both improve the equity IRR relative to an all-equity purchase." },
    ],
    quiz: {
      question: "Which of the following is generally the LEAST controllable lever for improving LBO equity returns?",
      options: ["Debt paydown", "EBITDA growth via operational improvements", "Multiple expansion at exit", "Reducing avoidable costs"],
      correctIndex: 2,
      explanation: "Exit multiples are set by market conditions and buyer appetite at the time of sale — sponsors can't reliably engineer multiple expansion the way they can drive paydown or operational EBITDA growth.",
    },
  },
  { term: "Multiple", category: "valuation", definition: "A ratio, such as EV/EBITDA or P/E, used to compare a company's value to a financial metric." },
  { term: "Three-Statement Model", category: "valuation", definition: "A financial model that dynamically links the income statement, balance sheet, and cash flow statement." },

  // Accounting & Statements
  { term: "Income Statement", category: "accounting", definition: "A financial statement showing revenue, expenses, and profit generated over a period of time." },
  { term: "Balance Sheet", category: "accounting", definition: "A snapshot of a company's assets, liabilities, and equity at a single point in time." },
  { term: "Cash Flow Statement", category: "accounting", definition: "A statement reconciling net income to actual cash generated or used across operating, investing, and financing activities." },
  { term: "Working Capital", category: "accounting", definition: "Current assets minus current liabilities, reflecting a company's short-term operating liquidity." },
  { term: "Depreciation", category: "accounting", definition: "The systematic allocation of a tangible asset's cost over its useful life." },
  { term: "Amortization", category: "accounting", definition: "The systematic write-off of an intangible asset's value, or a loan balance, over time." },
  { term: "Accrual Accounting", category: "accounting", definition: "Recording revenue and expenses when they are earned or incurred, not when cash actually changes hands." },
  { term: "Goodwill", category: "accounting", definition: "The premium paid over a target's fair value of net identifiable assets in an acquisition." },
  { term: "Deferred Revenue", category: "accounting", definition: "Cash collected for goods or services not yet delivered, recorded as a liability until earned." },
  { term: "Gross Margin", category: "accounting", definition: "Revenue minus cost of goods sold, expressed as a percentage of revenue." },
  { term: "Operating Margin", category: "accounting", definition: "Operating income as a percentage of revenue, reflecting a company's core profitability." },
  { term: "Free Cash Flow (FCF)", category: "accounting", definition: "Cash generated by operations after capital expenditures, available to all capital providers." },
  { term: "Retained Earnings", category: "accounting", definition: "Cumulative net income kept in the business rather than distributed to shareholders as dividends." },
  { term: "Contra Account", category: "accounting", definition: "An account that offsets the balance of a related account, such as accumulated depreciation." },
  { term: "10-K", category: "accounting", definition: "A comprehensive annual report that U.S. public companies are required to file with the SEC." },
  { term: "Quick Ratio", category: "accounting", definition: "A liquidity ratio measuring a company's ability to cover current liabilities with its most liquid assets, excluding inventory." },

  // M&A & Deals
  { term: "Synergies", category: "ma", definition: "The added value expected when two combined companies outperform the sum of their standalone parts." },
  { term: "Accretion/Dilution Analysis", category: "ma", definition: "Assessing whether an acquisition increases (accretive) or decreases (dilutive) the acquirer's earnings per share." },
  { term: "Due Diligence", category: "ma", definition: "The investigative process of verifying a target's financial, legal, and operational condition before a deal closes." },
  { term: "Pitchbook", category: "ma", definition: "A presentation bankers use to market ideas, valuation ranges, or deal strategy to a client." },
  { term: "Earnout", category: "ma", definition: "A deal structure where part of the purchase price is contingent on the target hitting future performance targets." },
  { term: "Hostile Takeover", category: "ma", definition: "An acquisition attempt pursued despite opposition from the target company's board." },
  { term: "Poison Pill", category: "ma", definition: "A defensive tactic that dilutes an acquirer's stake to deter a hostile takeover attempt." },
  { term: "Tender Offer", category: "ma", definition: "A public offer to buy shares directly from shareholders, often at a premium to the current market price." },
  { term: "Strategic Buyer", category: "ma", definition: "An acquirer purchasing a company for operational synergies rather than financial returns alone." },
  { term: "Financial Sponsor", category: "ma", definition: "A private equity firm or similar investor that acquires companies primarily for investment return." },
  { term: "Letter of Intent (LOI)", category: "ma", definition: "A preliminary, largely non-binding document outlining the key terms of a proposed transaction." },
  { term: "Data Room", category: "ma", definition: "A secure repository of documents shared with bidders during the due diligence process." },
  { term: "Break-Up Fee", category: "ma", definition: "A penalty a target company pays an acquirer if it walks away from an agreed deal, often for a competing bid." },
  { term: "J-Curve", category: "ma", definition: "The typical pattern of private equity fund returns — dipping before rising — as fees and early investments precede realized gains." },

  // Markets & Trading
  { term: "Market Capitalization", category: "markets", definition: "The total market value of a company's outstanding shares." },
  { term: "Beta", category: "markets", definition: "A measure of a stock's volatility relative to the overall market." },
  { term: "Bid-Ask Spread", category: "markets", definition: "The gap between the highest price a buyer will pay and the lowest price a seller will accept." },
  { term: "Liquidity", category: "markets", definition: "How easily an asset can be bought or sold without materially affecting its price." },
  { term: "Yield Curve", category: "markets", definition: "A plot of bond yields across maturities, commonly read for market expectations on growth and rates." },
  { term: "Basis Point (bps)", category: "markets", definition: "One hundredth of one percent, commonly used to express changes in interest rates or spreads." },
  { term: "Short Selling", category: "markets", definition: "Selling borrowed shares in anticipation of buying them back later at a lower price." },
  { term: "Derivative", category: "markets", definition: "A financial contract whose value is derived from an underlying asset, index, or rate." },
  { term: "Credit Spread", category: "markets", definition: "The yield difference between a corporate bond and a risk-free benchmark, reflecting credit risk." },
  { term: "Alpha", category: "markets", definition: "Investment return in excess of a benchmark, after adjusting for risk." },
  { term: "Underwriting", category: "markets", definition: "The process by which an investment bank prices, guarantees, and distributes new securities to investors." },

  // FP&A & Corporate Finance
  { term: "Budgeting", category: "fpa", definition: "The process of planning expected revenue and expenses for a future period." },
  { term: "Forecasting", category: "fpa", definition: "Projecting future financial performance based on historical trends and current assumptions." },
  { term: "Variance Analysis", category: "fpa", definition: "Comparing actual results to budget or forecast to explain the drivers behind the difference." },
  { term: "Rolling Forecast", category: "fpa", definition: "A forecast that is continuously extended forward as each period closes, rather than fixed to a fiscal year." },
  { term: "KPI (Key Performance Indicator)", category: "fpa", definition: "A measurable metric used to track progress toward a specific business objective." },
  { term: "Capital Expenditure (CapEx)", category: "fpa", definition: "Funds spent to acquire, upgrade, or maintain physical assets." },
  { term: "Operating Expenditure (OpEx)", category: "fpa", definition: "The ongoing costs of running day-to-day business operations." },
  { term: "Break-Even Analysis", category: "fpa", definition: "Determining the sales level at which total revenue equals total costs." },
  { term: "Zero-Based Budgeting", category: "fpa", definition: "A budgeting method that builds each period's budget from zero rather than adjusting the prior period." },
  { term: "Cost of Capital", category: "fpa", definition: "The required return a company must earn on its investments to satisfy investors and lenders." },

  // AI & Data
  { term: "Prompt Engineering", category: "ai", definition: "Designing inputs to an AI model to reliably produce accurate, well-structured outputs." },
  { term: "Audit-First AI", category: "ai", definition: "A workflow discipline that pairs AI-generated outputs with a structured human review step before they're used." },
  { term: "Hallucination", category: "ai", definition: "When an AI model generates plausible-sounding but factually incorrect output." },
  { term: "RAG (Retrieval-Augmented Generation)", category: "ai", definition: "An AI technique that grounds model outputs in retrieved source documents rather than memory alone." },
  { term: "Structured Output", category: "ai", definition: "AI-generated results returned in a predictable format, such as a table or schema, for easier verification." },
  { term: "Model Context", category: "ai", definition: "The information provided to an AI model within a single request to guide the output it produces." },
  { term: "XBRL", category: "ai", definition: "A standardized data format used to tag financial statements so they can be read and compared programmatically." },
];

// Retained as an unpublished editorial backlog; it is intentionally not part of
// the exported dictionary collection or any generated public route.
void _unpublishedTerms;

interface MetadataTerm {
  slug: string;
  term: string;
  category: string;
  url: string;
  definition: string;
  seo_title: string;
  meta_description: string;
  focus_keyword: string;
  faqs: { q: string; a: string }[];
  related: { term: string; slug: string }[];
}

const metadataCategoryMap: Record<string, CategoryKey> = {
  "Investing Basics": "markets",
  "Mutual Funds and SIP": "markets",
  "Derivatives and Risk": "markets",
  "Accounting and Financial Statements": "accounting",
  "Ratios and Valuation": "valuation",
  "Banking Savings and Deposits": "fpa",
  "Loans Credit and Debt": "fpa",
  "Stock Market and Equities": "markets",
};

function decodeEntities(value: string): string {
  return value.replaceAll("&#39;", "'").replaceAll("&#8377;", "₹");
}

function addTableCaptions(html: string): string {
  return html.replace(/(<table\b[^>]*>)([\s\S]*?<\/table>)/gi, (table, openingTag: string, contents: string) => {
    if (/<caption\b/i.test(contents)) return table;

    const columnLabels = Array.from(
      contents.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi),
      ([, heading]) => heading.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
    ).filter(Boolean);
    const caption = columnLabels.length
      ? `Table columns: ${columnLabels.join("; ")}.`
      : "Financial data table.";

    return `${openingTag}<caption class="sr-only">${caption}</caption>${contents}`;
  });
}

function prepareLesson(html: string): Pick<Term, "lessonBody" | "lessonToc"> {
  const start = html.indexOf('<div class="section"');
  const faqStart = html.indexOf('<div class="section collapsed" id="faqs"');
  let generatedSectionIndex = 0;
  const lessonBody = addTableCaptions(html
    .slice(start >= 0 ? start : 0, faqStart >= 0 ? faqStart : html.length)
    .replace(
      /<div class="section( collapsed)?"([^>]*)>(\s*<div class="sec-head"><h2>(.*?)<\/h2>)/g,
      (_, collapsed: string | undefined, attributes: string, headingMarkup: string, heading: string) => {
        generatedSectionIndex += 1;
        const existingId = attributes.match(/\bid="([^"]+)"/)?.[1];
        const existingName = attributes.match(/\bdata-name="([^"]+)"/)?.[1];
        const id = existingId ?? `lesson-section-${generatedSectionIndex}`;
        const label = existingName ?? heading.replace(/<[^>]+>/g, "").trim();
        return `<div class="section${collapsed ?? ""}" id="${id}" data-name="${label}">${headingMarkup}`;
      },
    )
    .replace(/<span data-math="([^"]*)"><\/span>/g, (_, expression: string) =>
      katex.renderToString(expression, { displayMode: true, throwOnError: false }),
    ))
    .trim();
  const lessonToc = Array.from(
    lessonBody.matchAll(/<div class="section(?: collapsed)?" id="([^"]+)" data-name="([^"]+)">/g),
    ([, id, label]) => ({ id, label }),
  );
  return { lessonBody, lessonToc };
}

const lessonsBySlug = new Map(
  Object.entries(lessonModules).map(([path, html]) => {
    const filename = path.split("/").at(-1) ?? "";
    const slug = filename.replace(/-lesson-body\.html$/, "");
    return [slug, prepareLesson(html)] as const;
  }),
);

const metadataSourceTerms = dictionaryMetadata.terms as MetadataTerm[];
const duplicateMetadataSlugs = metadataSourceTerms
  .map(({ slug }) => slug)
  .filter((slug, index, slugs) => slugs.indexOf(slug) !== index);
const metadataSlugs = new Set(metadataSourceTerms.map(({ slug }) => slug));
const lessonsWithoutMetadata = [...lessonsBySlug.keys()].filter((slug) => !metadataSlugs.has(slug));
const metadataWithoutLessons = metadataSourceTerms
  .map(({ slug }) => slug)
  .filter((slug) => !lessonsBySlug.has(slug));

if (duplicateMetadataSlugs.length || lessonsWithoutMetadata.length || metadataWithoutLessons.length) {
  throw new Error([
    duplicateMetadataSlugs.length ? `Duplicate dictionary metadata slugs: ${duplicateMetadataSlugs.join(", ")}` : "",
    lessonsWithoutMetadata.length ? `Lesson fragments missing metadata: ${lessonsWithoutMetadata.join(", ")}` : "",
    metadataWithoutLessons.length ? `Dictionary metadata missing lesson fragments: ${metadataWithoutLessons.join(", ")}` : "",
  ].filter(Boolean).join("\n"));
}

function fromMetadata(item: MetadataTerm): Term {
  return {
    term: item.term,
    slug: item.slug,
    category: metadataCategoryMap[item.category] ?? "markets",
    categoryLabel: item.category,
    url: item.url,
    definition: decodeEntities(item.definition),
    seoTitle: decodeEntities(item.seo_title),
    metaDescription: decodeEntities(item.meta_description),
    focusKeyword: item.focus_keyword,
    faq: item.faqs.map(({ q, a }) => ({ question: decodeEntities(q), answer: decodeEntities(a) })),
    relatedSlugs: item.related.map(({ slug }) => slug),
    ...lessonsBySlug.get(item.slug),
  };
}

const metadataTerms = metadataSourceTerms.map(fromMetadata);

// Only publish entries that have a complete, validated long-form lesson body.
// Short definition-only records in `_unpublishedTerms` remain excluded from every public
// dictionary index, category, related-term list, sitemap, and generated route.
export const terms: Term[] = metadataTerms.filter((term) => Boolean(term.lessonBody));

export interface DictionaryCategory {
  slug: string;
  label: string;
  icon: string;
  description: string;
  termCount: number;
  hasLessonContent: boolean;
}

export function getTermCategoryLabel(term: Term): string {
  return term.categoryLabel ?? categoryMap[term.category].label;
}

export function getTermCategorySlug(term: Term): string {
  return slugify(getTermCategoryLabel(term));
}

function getCategoryIcon(label: string, fallback: string): string {
  const normalized = label.toLowerCase();
  if (normalized.includes("banking") || normalized.includes("deposit")) return "account_balance";
  if (normalized.includes("mutual") || normalized.includes("sip")) return "donut_large";
  if (normalized.includes("loan") || normalized.includes("credit")) return "credit_score";
  if (normalized.includes("accounting") || normalized.includes("statement")) return "receipt_long";
  if (normalized.includes("ratio") || normalized.includes("valuation")) return "calculate";
  if (normalized.includes("stock") || normalized.includes("market")) return "candlestick_chart";
  if (normalized.includes("derivative") || normalized.includes("risk")) return "shield";
  if (normalized.includes("investing")) return "trending_up";
  if (normalized.includes("economic") || normalized.includes("macro")) return "public";
  return fallback;
}

const categoryStore = new Map<string, DictionaryCategory>();
for (const term of terms) {
  const label = getTermCategoryLabel(term);
  const slug = getTermCategorySlug(term);
  const existing = categoryStore.get(slug);
  if (existing) {
    existing.termCount += 1;
    existing.hasLessonContent ||= Boolean(term.lessonBody);
  } else {
    const fallback = categoryMap[term.category];
    categoryStore.set(slug, {
      slug,
      label,
      icon: getCategoryIcon(label, fallback.icon),
      description: term.categoryLabel
        ? `Plain-English definitions, lessons, and related concepts for ${label}.`
        : fallback.description,
      termCount: 1,
      hasLessonContent: Boolean(term.lessonBody),
    });
  }
}

export const dictionaryCategories = [...categoryStore.values()].sort((a, b) => a.label.localeCompare(b.label));

export function getDictionaryCategoryBySlug(slug: string): DictionaryCategory | undefined {
  return categoryStore.get(slug);
}

export function getTermsByDictionaryCategory(slug: string): Term[] {
  return terms
    .filter((term) => getTermCategorySlug(term) === slug)
    .sort((a, b) => a.term.localeCompare(b.term));
}

export function getTermBySlug(slug: string): Term | undefined {
  return terms.find((t) => t.slug === slug);
}

export function getRelatedTerms(term: Term, count = 4): Term[] {
  const explicit = (term.relatedSlugs ?? [])
    .map((slug) => getTermBySlug(slug))
    .filter((related): related is Term => Boolean(related));
  const selected = new Set([term.slug, ...explicit.map(({ slug }) => slug)]);
  const sameCategory = terms.filter((candidate) => !selected.has(candidate.slug) && candidate.category === term.category);
  const others = terms.filter((candidate) => !selected.has(candidate.slug) && candidate.category !== term.category);
  return [...explicit, ...sameCategory, ...others].slice(0, count);
}

export function getAvailableLetters(): Set<string> {
  const set = new Set<string>();
  for (const t of terms) {
    set.add(/[0-9]/.test(t.term[0]) ? "#" : t.term[0].toUpperCase());
  }
  return set;
}
