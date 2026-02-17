// Predictive Analytics Store
const STORAGE_KEY = 'sic_predictive';

function getStoredData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { winScores: {}, nextActions: [], forecasts: {}, icpMatches: {}, velocityAlerts: [], topicClusters: {}, coachingTips: [], territories: {}, attributionModels: {}, whatIfScenarios: [] }; }
  catch { return { winScores: {}, nextActions: [], forecasts: {}, icpMatches: {}, velocityAlerts: [], topicClusters: {}, coachingTips: [], territories: {}, attributionModels: {}, whatIfScenarios: [] }; }
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

// Win Probability Score
export async function calculateWinProbability(dealId) {
  try {
    const res = await fetch(`http://localhost:5000/api/predictive/win-probability/${dealId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    // Rule-based fallback
    const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
    const deal = (crmData.opportunities || []).find(d => d.id === dealId);
    if (!deal) return { probability: 0, factors: [] };
    let score = 50;
    const factors = [];
    if (deal.contactName) { score += 10; factors.push({ factor: 'Has contact person', impact: '+10%' }); }
    if (deal.value > 10000) { score -= 5; factors.push({ factor: 'High value deal - longer cycle', impact: '-5%' }); }
    if (deal.stage === 'proposal') { score += 15; factors.push({ factor: 'At proposal stage', impact: '+15%' }); }
    if (deal.stage === 'negotiation') { score += 25; factors.push({ factor: 'In negotiation', impact: '+25%' }); }
    const data = getStoredData();
    data.winScores[dealId] = { probability: Math.min(95, Math.max(5, score)), factors, calculatedAt: new Date().toISOString() };
    saveData(data);
    return data.winScores[dealId];
  }
}

// Next Best Action
export async function getNextBestActions(userId) {
  try {
    const res = await fetch(`http://localhost:5000/api/predictive/next-actions/${userId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
    const actions = [];
    const opportunities = crmData.opportunities || [];
    const leads = crmData.leads || [];
    // Generate contextual actions
    leads.filter(l => l.status === 'new').slice(0, 3).forEach(l => {
      actions.push({ type: 'call', priority: 'high', target: l.name || l.company, reason: 'New lead - respond within 24 hours', entity: 'lead', entityId: l.id });
    });
    opportunities.filter(o => o.stage === 'proposal').slice(0, 2).forEach(o => {
      actions.push({ type: 'follow_up', priority: 'medium', target: o.name || o.company, reason: 'Proposal sent - follow up to close', entity: 'opportunity', entityId: o.id });
    });
    return actions;
  }
}

// Forecast Confidence
export async function getForecastConfidence(period) {
  try {
    const res = await fetch(`http://localhost:5000/api/predictive/forecast/${period}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
    const deals = crmData.opportunities || [];
    const repForecast = deals.filter(d => d.stage !== 'lost').reduce((sum, d) => sum + (d.value || 0), 0);
    const aiAdjusted = Math.round(repForecast * 0.65);
    return {
      repForecast, aiAdjusted,
      optimismGap: repForecast - aiAdjusted,
      confidence: 'medium',
      period
    };
  }
}

// ICP Match Grading
export function gradeICPMatch(lead) {
  const criteria = { hasCompanySize: !!lead.companySize, hasBudget: !!lead.budget, hasTimeline: !!lead.timeline, hasAuthority: !!lead.decisionMaker, matchesIndustry: true };
  const score = Object.values(criteria).filter(Boolean).length;
  const grades = { 5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'F', 0: 'F' };
  return { grade: grades[score] || 'F', score, maxScore: 5, criteria };
}

// Activity Velocity
export function checkActivityVelocity(dealId) {
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  const activities = (crmData.activities || []).filter(a => a.dealId === dealId || a.opportunityId === dealId);
  const deal = (crmData.opportunities || []).find(d => d.id === dealId);
  if (!deal) return { onTrack: false, message: 'Deal not found' };
  const daysSinceCreation = (Date.now() - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24);
  const expectedActivities = Math.ceil(daysSinceCreation / 2) * 5; // 5 activities per 2 days benchmark
  const actualActivities = activities.length;
  return {
    actual: actualActivities, expected: expectedActivities,
    onTrack: actualActivities >= expectedActivities * 0.7,
    message: actualActivities < expectedActivities * 0.5 ? 'Activity significantly below benchmark - deal at risk' : actualActivities < expectedActivities * 0.7 ? 'Activity slightly below benchmark' : 'On track'
  };
}

// Topic Cluster Analysis
export function analyzeTopicClusters() {
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  const lostDeals = (crmData.opportunities || []).filter(d => d.stage === 'lost');
  const clusters = {};
  lostDeals.forEach(d => {
    const reason = (d.lossReason || d.notes || '').toLowerCase();
    if (reason.includes('price') || reason.includes('cost') || reason.includes('expensive') || reason.includes('budget')) {
      clusters['Price'] = (clusters['Price'] || 0) + 1;
    }
    if (reason.includes('competitor') || reason.includes('alternative')) {
      clusters['Competitor'] = (clusters['Competitor'] || 0) + 1;
    }
    if (reason.includes('timing') || reason.includes('later') || reason.includes('not now')) {
      clusters['Timing'] = (clusters['Timing'] || 0) + 1;
    }
    if (reason.includes('feature') || reason.includes('missing') || reason.includes('need')) {
      clusters['Features'] = (clusters['Features'] || 0) + 1;
    }
  });
  const total = Object.values(clusters).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(clusters).map(([topic, count]) => ({ topic, count, percentage: Math.round((count / total) * 100) })).sort((a, b) => b.count - a.count);
}

// Rep Performance Coaching
export function getCoachingInsights(repId) {
  return {
    repId,
    talkRatio: { rep: 75, benchmark: 40, tip: 'Try asking more open-ended questions to let the prospect speak more' },
    avgCallDuration: { value: 12, benchmark: 18, tip: 'Your calls are shorter than average. Spend more time on discovery.' },
    followUpSpeed: { value: 48, benchmark: 24, unit: 'hours', tip: 'Respond within 24 hours to maintain momentum' },
    proposalToClose: { value: 35, benchmark: 25, unit: 'days', tip: 'Consider adding urgency tactics to shorten close time' }
  };
}

// Territory White Space
export function analyzeTerritory() {
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  const contacts = crmData.contacts || [];
  const deals = crmData.opportunities || [];
  const regions = {};
  contacts.forEach(c => {
    const region = c.state || c.region || c.city || 'Unknown';
    if (!regions[region]) regions[region] = { contacts: 0, deals: 0, revenue: 0 };
    regions[region].contacts++;
  });
  deals.forEach(d => {
    const region = d.region || 'Unknown';
    if (!regions[region]) regions[region] = { contacts: 0, deals: 0, revenue: 0 };
    regions[region].deals++;
    regions[region].revenue += d.value || 0;
  });
  return Object.entries(regions).map(([region, data]) => ({ region, ...data, isWhiteSpace: data.deals === 0 && data.contacts > 0 }));
}

// Attribution Model
export function calculateAttribution(model = 'u-shaped') {
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  const deals = (crmData.opportunities || []).filter(d => d.stage === 'won');
  const sources = {};
  deals.forEach(d => {
    const source = d.source || d.leadSource || 'Direct';
    if (!sources[source]) sources[source] = { leads: 0, revenue: 0 };
    sources[source].leads++;
    sources[source].revenue += d.value || 0;
  });
  return { model, sources: Object.entries(sources).map(([source, data]) => ({ source, ...data })) };
}

// What-If Simulator
export function runWhatIfSimulation(params) {
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  const deals = crmData.opportunities || [];
  const currentRevenue = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + (d.value || 0), 0);
  const pipeline = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').reduce((sum, d) => sum + (d.value || 0), 0);
  const currentCloseRate = deals.length > 0 ? deals.filter(d => d.stage === 'won').length / deals.length : 0.3;
  const newCloseRate = currentCloseRate + (params.closeRateChange || 0) / 100;
  const projectedRevenue = currentRevenue + (pipeline * newCloseRate);
  const avgDealSize = currentRevenue / (deals.filter(d => d.stage === 'won').length || 1);
  const newAvgDeal = avgDealSize * (1 + (params.avgDealSizeChange || 0) / 100);
  return {
    current: { revenue: currentRevenue, closeRate: currentCloseRate, avgDealSize, pipeline },
    projected: { revenue: projectedRevenue, closeRate: newCloseRate, avgDealSize: newAvgDeal },
    impact: { revenueChange: projectedRevenue - currentRevenue, percentChange: ((projectedRevenue - currentRevenue) / (currentRevenue || 1)) * 100 }
  };
}

export function getPredictiveData() { return getStoredData(); }
