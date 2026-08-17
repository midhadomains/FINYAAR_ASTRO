import {
  dictionaryCategories,
  getTermCategorySlug,
  terms,
  type DictionaryCategory,
  type Term,
} from "./dictionary";
import { pillars, type ClusterPage, type Pillar } from "./pillars";

export type KeywordStage = "long-tail" | "supporting" | "head-term";
export type KeywordMarket = "India" | "Global";
export type KeywordPriority = "P1" | "P2" | "P3";

export interface PageKeywordTarget {
  url: string;
  pageType: "site" | "dictionary-index" | "dictionary-category" | "dictionary-term" | "pillar" | "cluster";
  primaryKeyword: string;
  searchIntent: string;
  market: KeywordMarket;
  stage: KeywordStage;
  priority: KeywordPriority;
  snippetAnswer: string;
  monthlyVolume: number | null;
  keywordDifficulty: number | null;
  researchStatus: "serp-validated" | "metadata-provided" | "keyword-tool-required";
  researchSource: string;
}

export interface SeoFaq {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

function sentence(value: string): string {
  const clean = value.replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "");
  return clean ? `${clean}.` : "";
}

export function buildSeoTitle(primaryKeyword: string): string {
  const keyword = primaryKeyword.trim();
  const withBrand = `${keyword.charAt(0).toUpperCase()}${keyword.slice(1)} | FinYaar`;
  return withBrand.length <= 60 ? withBrand : keyword.slice(0, 60).trim();
}

export function buildMetaDescription(primaryKeyword: string, benefit: string): string {
  const keyword = `${primaryKeyword.charAt(0).toUpperCase()}${primaryKeyword.slice(1)}`;
  const cleanBenefit = sentence(benefit);
  let result = cleanBenefit.toLowerCase().includes(primaryKeyword.toLowerCase())
    ? cleanBenefit
    : `${keyword}: ${cleanBenefit}`;
  result = result.replace(/\s+/g, " ");
  if (result.length > 160) {
    const sentenceBreak = result.lastIndexOf(". ", 159);
    if (sentenceBreak >= 149) result = result.slice(0, sentenceBreak + 1);
    else {
      const shortened = result.slice(0, 159);
      result = `${shortened.slice(0, shortened.lastIndexOf(" ")).replace(/[,:;.!?]+$/, "")}.`;
    }
  }
  const additions = [
    " Learn the key ideas, examples, risks and practical steps.",
    " Explore clear examples and practical steps.",
    " See examples and practical guidance.",
    " Learn with clear examples.",
    " Read the clear guide.",
    " Learn more.",
    " Explore it.",
    " See it.",
  ];
  const unused = [...additions];
  while (result.length < 150) {
    const index = unused.findIndex((addition) => result.length + addition.length <= 160);
    if (index === -1) break;
    result += unused.splice(index, 1)[0];
  }
  return result;
}

export function buildGenericFaqs(primaryKeyword: string, context: string): SeoFaq[] {
  const label = primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1);
  return [
    {
      question: `What is ${primaryKeyword}?`,
      answer: sentence(context),
    },
    {
      question: `Why is ${primaryKeyword} important?`,
      answer: `${label} matters because it helps you understand the relevant costs, risks, trade-offs and financial decisions before you act.`,
    },
    {
      question: `How should beginners use ${primaryKeyword}?`,
      answer: `Start with the definition, check the assumptions and worked examples, then compare the result with your goal, time horizon and risk tolerance.`,
    },
  ];
}

export function faqSchema(faqs: SeoFaq[], canonicalUrl: URL): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    "@id": `${canonicalUrl.href}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[], baseUrl: URL): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    "@id": `${baseUrl.href}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: new URL(item.href, baseUrl).href,
    })),
  };
}

export function organizationSchema(siteUrl: URL): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": `${new URL("/", siteUrl).href}#organization`,
    name: "FinYaar Finance",
    url: new URL("/", siteUrl).href,
    description: "Practical finance education, dictionary lessons, calculators and professional exam preparation.",
  };
}

export function websiteSchema(siteUrl: URL): Record<string, unknown> {
  const homeUrl = new URL("/", siteUrl);
  return {
    "@type": "WebSite",
    "@id": `${homeUrl.href}#website`,
    name: "FinYaar Finance",
    url: homeUrl.href,
    publisher: { "@id": `${homeUrl.href}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: new URL("/dictionary/?q={search_term_string}", homeUrl).href,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function courseSchema(name: string, description: string, url: URL, courseCode: string): Record<string, unknown> {
  return {
    "@type": "Course",
    "@id": `${url.href}#course`,
    name,
    description,
    url: url.href,
    courseCode,
    educationalLevel: "Professional certification exam preparation",
    provider: { "@id": `${new URL("/", url).href}#organization` },
  };
}

const indiaPillars = new Set([
  "personal-finance",
  "banking-savings-deposits",
  "loans-credit-debt",
  "investing-basics",
  "stock-market-equities",
  "mutual-funds-sip-etfs",
  "taxation-india",
  "insurance",
  "retirement-planning",
]);

const earlyWinOverrides: Record<string, string> = {
  "accounting-financial-statements/ebitda": "how is EBITDA calculated with example",
  "mutual-funds-sip-etfs/sip-systematic-investment-plan": "how SIP works for beginners in India",
  "mutual-funds-sip-etfs/sip-vs-lump-sum-for-beginners-in-india": "SIP vs lump sum for beginners in India",
  "mutual-funds-sip-etfs/etf": "ETF vs index fund for beginners in India",
  "investing-basics/compound-interest": "compound interest formula with example in rupees",
  "banking-savings-deposits/fixed-deposit": "fixed deposit maturity calculation with example",
  "loans-credit-debt/emi": "how EMI is calculated with example in India",
  "loans-credit-debt/credit-score-cibil": "how to improve CIBIL score in India",
  "stock-market-equities/ipo": "how to apply for IPO in India for beginners",
  "ratios-valuation-analysis/p-e-ratio": "how to calculate P/E ratio with example",
  "derivatives-risk/beta": "beta in finance explained with example",
  "cfa/cfa-level-i-topics": "CFA Level 1 topic weights and study plan",
  "cfa/cfa-formula-guide": "CFA Level 1 quantitative methods formulas",
  "cfa/cfa-study-tips": "how to study for CFA Level 1 for beginners",
  "frm/frm-part-i-topics": "FRM Part 1 topics and study plan",
  "frm/frm-formula-guide": "FRM Part 1 VaR formulas explained",
  "frm/frm-study-tips": "how to study for FRM Part 1",
};

function cleanTitle(value: string): string {
  return value.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
}

function defaultClusterKeyword(pillar: Pillar, cluster: ClusterPage): string {
  const title = cleanTitle(cluster.title).toLowerCase();
  const india = indiaPillars.has(pillar.slug) ? " in India" : "";
  if (cluster.kind === "calculator") return `${title}${india}`;
  if (cluster.kind === "comparison") return `${title} for beginners${india}`;
  if (cluster.kind === "how-to") return `${title} step by step guide${india}`;
  if (cluster.kind === "exam-guide") return `${title} syllabus formulas and study guide`;
  return `${title} meaning and example${india}`;
}

function clusterIntent(kind: ClusterPage["kind"]): string {
  if (kind === "calculator") return "Transactional tool";
  if (kind === "comparison") return "Commercial investigation";
  if (kind === "how-to") return "Practical informational";
  if (kind === "exam-guide") return "Exam preparation";
  return "Informational explainer";
}

function clusterSnippet(cluster: ClusterPage): string {
  if (cluster.kind === "calculator") return `${cluster.title} estimates the result from the assumptions you enter and helps you compare realistic planning scenarios.`;
  if (cluster.kind === "comparison") return `${cluster.title} compares the choices side by side so beginners can judge costs, risks, flexibility, and suitability for their goal.`;
  if (cluster.kind === "how-to") return `${cluster.title} starts with the goal, the figures you need, and a step-by-step process for reaching a practical decision.`;
  if (cluster.kind === "exam-guide") return `${cluster.title} organises the syllabus, formulas, practice priorities, and revision steps needed for efficient exam preparation.`;
  return `${cluster.title} explains what the concept means, how it works, and how to apply it through a practical example.`;
}

export function getClusterSeo(pillar: Pillar, cluster: ClusterPage): PageKeywordTarget {
  const key = `${pillar.slug}/${cluster.slug}`;
  const primaryKeyword = earlyWinOverrides[key] ?? defaultClusterKeyword(pillar, cluster);
  const validated = key in earlyWinOverrides;
  return {
    url: `/${pillar.slug}/${cluster.slug}/`,
    pageType: "cluster",
    primaryKeyword,
    searchIntent: clusterIntent(cluster.kind),
    market: indiaPillars.has(pillar.slug) ? "India" : "Global",
    stage: "long-tail",
    priority: validated ? "P1" : "P2",
    snippetAnswer: clusterSnippet(cluster),
    monthlyVolume: null,
    keywordDifficulty: null,
    researchStatus: validated ? "serp-validated" : "keyword-tool-required",
    researchSource: validated
      ? "Search-result pattern review; validate volume and KD in Keyword Planner, Ahrefs, or Semrush"
      : "Taxonomy-derived seed; validate in Keyword Planner, Ahrefs, or Semrush before publishing",
  };
}

export function getPillarSeo(pillar: Pillar): PageKeywordTarget {
  const primaryKeyword = pillar.title.replace(/^Exam Prep:\s*/, "").toLowerCase() + (indiaPillars.has(pillar.slug) ? " India guide" : " study guide");
  return {
    url: `/${pillar.slug}/`,
    pageType: "pillar",
    primaryKeyword,
    searchIntent: pillar.searchIntent,
    market: indiaPillars.has(pillar.slug) ? "India" : "Global",
    stage: "head-term",
    priority: pillar.slug === "cfa" || pillar.slug === "frm" ? "P2" : "P3",
    snippetAnswer: pillar.description,
    monthlyVolume: null,
    keywordDifficulty: null,
    researchStatus: "keyword-tool-required",
    researchSource: "Pillar seed; validate in Keyword Planner, Ahrefs, or Semrush after long-tail coverage",
  };
}

export function getTermSeo(term: Term): PageKeywordTarget {
  const primaryKeyword = term.focusKeyword ?? cleanTitle(term.term).toLowerCase();
  const india = Boolean(term.categoryLabel && ["Banking Savings and Deposits", "Loans Credit and Debt", "Mutual Funds and SIP", "Stock Market and Equities"].includes(term.categoryLabel));
  return {
    url: `/dictionary/${term.slug}/`,
    pageType: "dictionary-term",
    primaryKeyword,
    searchIntent: "Definition informational",
    market: india ? "India" : "Global",
    stage: "head-term",
    priority: term.lessonBody ? "P2" : "P3",
    snippetAnswer: `${term.term} is ${term.definition.replace(/^[A-Z]/, (letter) => letter.toLowerCase())}`,
    monthlyVolume: null,
    keywordDifficulty: null,
    researchStatus: term.focusKeyword ? "metadata-provided" : "keyword-tool-required",
    researchSource: term.focusKeyword
      ? "Provided per-term metadata; validate volume and KD in the selected keyword tool"
      : "Definition seed; validate in Keyword Planner, Ahrefs, or Semrush",
  };
}

export function getCategorySeo(category: DictionaryCategory): PageKeywordTarget {
  return {
    url: `/dictionary/category/${category.slug}/`,
    pageType: "dictionary-category",
    primaryKeyword: `${category.label.toLowerCase()} glossary`,
    searchIntent: "Informational navigation",
    market: "Global",
    stage: "supporting",
    priority: category.hasLessonContent ? "P2" : "P3",
    snippetAnswer: category.description,
    monthlyVolume: null,
    keywordDifficulty: null,
    researchStatus: "keyword-tool-required",
    researchSource: "Category seed; validate in Keyword Planner, Ahrefs, or Semrush",
  };
}

const siteTargets: PageKeywordTarget[] = [
  ["/", "site", "finance courses and dictionary India", "Mixed informational", "India", "head-term", "P3", "FinYaar provides practical finance learning, dictionary lessons, calculators, and exam preparation."],
  ["/topics/", "site", "finance topics for beginners", "Informational navigation", "Global", "supporting", "P2", "Explore finance from money basics through investing, markets, accounting, risk, and professional exams."],
  ["/dictionary/", "dictionary-index", "finance dictionary", "Definition navigation", "Global", "head-term", "P2", "The FinYaar Finance Dictionary provides plain-English definitions, examples, FAQs, and related lessons."],
  ["/courses/", "site", "finance certification courses", "Commercial investigation", "Global", "head-term", "P3", "Compare practical finance certification courses and learning paths."],
  ["/vault/", "site", "AI Finance Vault", "Commercial investigation", "Global", "supporting", "P3", "Explore audit-first AI prompts, review checklists, and workflow templates for finance professionals."],
  ["/blog/", "site", "finance learning articles", "Informational navigation", "Global", "supporting", "P3", "Read practical finance, markets, modelling, and career articles."],
  ["/about/", "site", "about FinYaar Finance", "Navigational", "Global", "supporting", "P3", "Learn about FinYaar Finance, its practical teaching approach, editorial standards, and finance education mission."],
  ["/contact/", "site", "contact FinYaar Finance", "Navigational", "Global", "supporting", "P3", "Contact the FinYaar Finance team."],
].map(([url, pageType, primaryKeyword, searchIntent, market, stage, priority, snippetAnswer]) => ({
  url,
  pageType,
  primaryKeyword,
  searchIntent,
  market,
  stage,
  priority,
  snippetAnswer,
  monthlyVolume: null,
  keywordDifficulty: null,
  researchStatus: "keyword-tool-required",
  researchSource: "Site-level seed; validate in Keyword Planner, Ahrefs, or Semrush",
} as PageKeywordTarget));

export const keywordMap: PageKeywordTarget[] = [
  ...siteTargets,
  ...pillars.map(getPillarSeo),
  ...pillars.flatMap((pillar) => pillar.clusters.map((cluster) => getClusterSeo(pillar, cluster))),
  ...dictionaryCategories.map(getCategorySeo),
  ...terms.map(getTermSeo),
];

const duplicateUrls = keywordMap.filter((entry, index) => keywordMap.findIndex((candidate) => candidate.url === entry.url) !== index);
const duplicateKeywords = keywordMap.filter((entry, index) =>
  keywordMap.findIndex((candidate) => candidate.primaryKeyword.toLowerCase() === entry.primaryKeyword.toLowerCase()) !== index,
);
const emptyTargets = keywordMap.filter((entry) => !entry.primaryKeyword.trim() || !entry.searchIntent.trim() || !entry.snippetAnswer.trim());

if (duplicateUrls.length || duplicateKeywords.length || emptyTargets.length) {
  throw new Error([
    duplicateUrls.length ? `Duplicate keyword-map URLs: ${duplicateUrls.map(({ url }) => url).join(", ")}` : "",
    duplicateKeywords.length ? `Duplicate primary keywords: ${duplicateKeywords.map(({ primaryKeyword }) => primaryKeyword).join(", ")}` : "",
    emptyTargets.length ? `Incomplete keyword targets: ${emptyTargets.map(({ url }) => url).join(", ")}` : "",
  ].filter(Boolean).join("\n"));
}

export function getKeywordTargetByUrl(url: string): PageKeywordTarget | undefined {
  return keywordMap.find((entry) => entry.url === url);
}

export function getTermCategoryKeyword(term: Term): string {
  return keywordMap.find((entry) => entry.url === `/dictionary/category/${getTermCategorySlug(term)}/`)?.primaryKeyword ?? "finance glossary";
}
