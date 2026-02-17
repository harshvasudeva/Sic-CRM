// Industry Template Store - Vertical-specific features
const STORAGE_KEY = 'sic_industry';

function getStoredData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { selectedIndustry: null, rateCards: [], portfolios: [], complianceRules: {}, royaltyDeals: [] }; }
  catch { return { selectedIndustry: null, rateCards: [], portfolios: [], complianceRules: {}, royaltyDeals: [] }; }
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

const INDUSTRY_TEMPLATES = {
  agency: {
    name: 'Agency',
    icon: 'Palette',
    dealLabel: 'Project',
    contactLabel: 'Client',
    pipelineMode: 'project',
    fields: [
      { name: 'projectType', label: 'Project Type', type: 'select', options: ['Branding', 'Web Dev', 'Marketing', 'Design', 'Consulting'] },
      { name: 'retainerType', label: 'Retainer Type', type: 'select', options: ['Monthly', 'Project-based', 'Hourly'] },
      { name: 'deliverables', label: 'Deliverables', type: 'textarea' },
      { name: 'clientBudget', label: 'Client Budget', type: 'currency' }
    ],
    stages: ['Discovery', 'Proposal', 'In Progress', 'Review', 'Delivered', 'Invoiced']
  },
  saas: {
    name: 'SaaS',
    icon: 'Cloud',
    dealLabel: 'Deal',
    contactLabel: 'Lead',
    pipelineMode: 'recurring',
    fields: [
      { name: 'mrr', label: 'MRR', type: 'currency' },
      { name: 'arr', label: 'ARR', type: 'currency' },
      { name: 'plan', label: 'Plan', type: 'select', options: ['Starter', 'Professional', 'Enterprise', 'Custom'] },
      { name: 'seats', label: 'Seats', type: 'number' },
      { name: 'churnRisk', label: 'Churn Risk', type: 'select', options: ['Low', 'Medium', 'High'] }
    ],
    stages: ['Lead', 'Qualified', 'Demo', 'Trial', 'Negotiation', 'Closed Won', 'Closed Lost']
  },
  realEstate: {
    name: 'Real Estate',
    icon: 'Building',
    dealLabel: 'Listing',
    contactLabel: 'Tenant/Buyer',
    pipelineMode: 'project',
    fields: [
      { name: 'propertyType', label: 'Property Type', type: 'select', options: ['Residential', 'Commercial', 'Industrial', 'Land'] },
      { name: 'sqft', label: 'Square Footage', type: 'number' },
      { name: 'askingPrice', label: 'Asking Price', type: 'currency' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'listingDate', label: 'Listing Date', type: 'date' }
    ],
    stages: ['Listed', 'Showing', 'Offer Received', 'Under Contract', 'Closed', 'Expired']
  },
  influencer: {
    name: 'Influencer Marketing',
    icon: 'Megaphone',
    dealLabel: 'Campaign',
    contactLabel: 'Creator',
    pipelineMode: 'project',
    fields: [
      { name: 'engagementRate', label: 'Engagement Rate', type: 'percentage' },
      { name: 'platformMix', label: 'Platform Mix', type: 'multiselect', options: ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn'] },
      { name: 'audienceGeo', label: 'Audience Geography', type: 'text' },
      { name: 'followers', label: 'Followers', type: 'number' },
      { name: 'niche', label: 'Niche', type: 'select', options: ['Fashion', 'Tech', 'Food', 'Travel', 'Fitness', 'Beauty', 'Gaming', 'Education'] }
    ],
    stages: ['Scouting', 'Outreach', 'Negotiation', 'Content Creation', 'Review', 'Published', 'Reporting']
  },
  ecommerce: {
    name: 'E-Commerce',
    icon: 'ShoppingBag',
    dealLabel: 'Order',
    contactLabel: 'Customer',
    pipelineMode: 'recurring',
    fields: [
      { name: 'aov', label: 'Avg Order Value', type: 'currency' },
      { name: 'ltv', label: 'Customer LTV', type: 'currency' },
      { name: 'channel', label: 'Channel', type: 'select', options: ['Website', 'Amazon', 'Shopify', 'Instagram Shop', 'Retail'] },
      { name: 'returnRate', label: 'Return Rate', type: 'percentage' }
    ],
    stages: ['Browsing', 'Cart', 'Checkout', 'Paid', 'Shipped', 'Delivered', 'Returned']
  }
};

export function getIndustryTemplates() { return INDUSTRY_TEMPLATES; }

export function getSelectedIndustry() { return getStoredData().selectedIndustry; }

export function setIndustryTemplate(industryKey) {
  const data = getStoredData();
  data.selectedIndustry = industryKey;
  saveData(data);
  return INDUSTRY_TEMPLATES[industryKey];
}

export function getActiveTemplate() {
  const data = getStoredData();
  return data.selectedIndustry ? INDUSTRY_TEMPLATES[data.selectedIndustry] : null;
}

// Rate Card Management
export function getRateCards() { return getStoredData().rateCards; }

export function addRateCard(card) {
  const data = getStoredData();
  data.rateCards.push({ id: Date.now().toString(), ...card, createdAt: new Date().toISOString() });
  saveData(data);
  return data.rateCards;
}

export function updateRateCard(cardId, updates) {
  const data = getStoredData();
  const card = data.rateCards.find(c => c.id === cardId);
  if (card) Object.assign(card, updates, { updatedAt: new Date().toISOString() });
  saveData(data);
  return data.rateCards;
}

export function deleteRateCard(cardId) {
  const data = getStoredData();
  data.rateCards = data.rateCards.filter(c => c.id !== cardId);
  saveData(data);
  return data.rateCards;
}

// Portfolio Showcase
export function getPortfolios() { return getStoredData().portfolios; }

export function addPortfolio(portfolio) {
  const data = getStoredData();
  data.portfolios.push({ id: Date.now().toString(), ...portfolio, views: 0, createdAt: new Date().toISOString() });
  saveData(data);
  return data.portfolios;
}

export function trackPortfolioView(portfolioId) {
  const data = getStoredData();
  const portfolio = data.portfolios.find(p => p.id === portfolioId);
  if (portfolio) portfolio.views++;
  saveData(data);
}

// Compliance RuleSets
export function getComplianceRules(industry) {
  const rules = {
    pharma: { auditLogging: 'strict', fieldEncryption: true, signatureRequired: true, retentionYears: 7, disclosureChecklist: false },
    influencer: { auditLogging: 'standard', fieldEncryption: false, signatureRequired: false, retentionYears: 3, ftcDisclosure: true, disclosureChecklist: ['#ad or #sponsored required', 'Material connection disclosed', 'Testimonial guidelines met', 'Contest/sweepstakes rules posted'] },
    finance: { auditLogging: 'strict', fieldEncryption: true, signatureRequired: true, retentionYears: 10, kyc: true },
    healthcare: { auditLogging: 'strict', fieldEncryption: true, signatureRequired: true, retentionYears: 6, hipaaCompliant: true }
  };
  return rules[industry] || { auditLogging: 'standard', fieldEncryption: false, signatureRequired: false, retentionYears: 3 };
}

// Royalty Calculator
export function calculateRoyalty(dealValue, royaltyType, rate) {
  switch (royaltyType) {
    case 'percentage_revenue': return { amount: dealValue * (rate / 100), type: royaltyType, rate };
    case 'percentage_adspend': return { amount: dealValue * (rate / 100), type: royaltyType, rate };
    case 'flat_fee': return { amount: rate, type: royaltyType, rate };
    case 'tiered': {
      let amount = 0;
      if (dealValue <= 10000) amount = dealValue * 0.1;
      else if (dealValue <= 50000) amount = 1000 + (dealValue - 10000) * 0.07;
      else amount = 1000 + 2800 + (dealValue - 50000) * 0.05;
      return { amount: Math.round(amount * 100) / 100, type: royaltyType, tiers: '10% up to 10k, 7% 10k-50k, 5% above 50k' };
    }
    default: return { amount: 0, type: 'unknown', rate: 0 };
  }
}

// Multi-Currency with Live Rates
export async function getLiveExchangeRate(from, to) {
  try {
    const res = await fetch(`http://localhost:5000/api/currency/rate?from=${from}&to=${to}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const fallbackRates = { 'USD_INR': 83.5, 'USD_EUR': 0.92, 'USD_GBP': 0.79, 'EUR_USD': 1.09, 'GBP_USD': 1.27, 'INR_USD': 0.012 };
    const key = `${from}_${to}`;
    return { rate: fallbackRates[key] || 1, source: 'fallback', from, to };
  }
}

// Whitelabeled Client Portal
export function getClientPortalConfig() {
  try { return JSON.parse(localStorage.getItem('sic_client_portal')) || { enabled: false, branding: {}, permissions: {} }; }
  catch { return { enabled: false, branding: {}, permissions: {} }; }
}

export function updateClientPortalConfig(config) {
  const current = getClientPortalConfig();
  localStorage.setItem('sic_client_portal', JSON.stringify({ ...current, ...config }));
}

export function getIndustryData() { return getStoredData(); }
