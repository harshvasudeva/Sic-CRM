// Story Mode & Consumer UX Store
const STORAGE_KEY = 'sic_story_mode';

function getStoredData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { stories: [], briefings: [], triageQueue: [], relationshipWeb: { nodes: [], edges: [] }, emptyStates: {}, microLearning: {} }; }
  catch { return { stories: [], briefings: [], triageQueue: [], relationshipWeb: { nodes: [], edges: [] }, emptyStates: {}, microLearning: {} }; }
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

// Story Mode for Updates (Instagram-style)
export function addStory(story) {
  const data = getStoredData();
  data.stories.push({
    id: Date.now().toString(),
    ...story,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    views: [],
    createdAt: new Date().toISOString()
  });
  saveData(data);
  return data.stories;
}

export function getActiveStories() {
  const data = getStoredData();
  const now = new Date();
  return data.stories.filter(s => new Date(s.expiresAt) > now);
}

export function viewStory(storyId, userId) {
  const data = getStoredData();
  const story = data.stories.find(s => s.id === storyId);
  if (story && !story.views.includes(userId)) story.views.push(userId);
  saveData(data);
}

export function deleteExpiredStories() {
  const data = getStoredData();
  const now = new Date();
  data.stories = data.stories.filter(s => new Date(s.expiresAt) > now);
  saveData(data);
}

// Morning Briefing
export async function generateMorningBriefing(userId) {
  try {
    const res = await fetch(`http://localhost:5000/api/briefing/${userId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
    const today = new Date().toDateString();
    const leads = (crmData.leads || []).filter(l => l.status === 'new').slice(0, 5);
    const followUps = (crmData.activities || []).filter(a => a.date && new Date(a.date).toDateString() === today);
    const hotDeals = (crmData.opportunities || []).filter(d => d.stage === 'negotiation' || d.stage === 'proposal').slice(0, 3);
    return {
      greeting: `Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}!`,
      date: today,
      summary: {
        newLeads: leads.length,
        followUpsToday: followUps.length,
        hotDeals: hotDeals.length,
        totalPipeline: hotDeals.reduce((sum, d) => sum + (d.value || 0), 0)
      },
      callsToMake: leads.map(l => ({ name: l.name || l.company, reason: `New ${l.source || 'inbound'} lead`, priority: 'high' })),
      dealsToProgress: hotDeals.map(d => ({ name: d.name, stage: d.stage, value: d.value, action: 'Follow up' })),
      audioScript: `You have ${leads.length} new leads and ${followUps.length} follow-ups today. Your hottest deals total ${hotDeals.reduce((sum, d) => sum + (d.value || 0), 0)} in pipeline value. Top priority: ${leads[0]?.name || 'Check your pipeline'}.`
    };
  }
}

// Mobile Lead Triage (Tinder-style swiping)
export function getTriageQueue() {
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  return (crmData.leads || []).filter(l => l.status === 'new' || !l.triaged).map(l => ({
    id: l.id, name: l.name || l.company, source: l.source, value: l.value,
    company: l.company, email: l.email, phone: l.phone,
    summary: `${l.source || 'Unknown source'} lead${l.value ? ` - $${l.value}` : ''}`
  }));
}

export function triageLead(leadId, action) {
  // action: 'qualify', 'disqualify', 'call_later'
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  const lead = (crmData.leads || []).find(l => l.id === leadId);
  if (lead) {
    lead.triaged = true;
    switch (action) {
      case 'qualify': lead.status = 'qualified'; break;
      case 'disqualify': lead.status = 'disqualified'; break;
      case 'call_later': lead.status = 'follow_up'; break;
    }
    localStorage.setItem('sic_crm', JSON.stringify(crmData));
  }
  return { success: true, leadId, action };
}

// Relationship Web (Visual Node Graph)
export function buildRelationshipWeb() {
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  const contacts = crmData.contacts || [];
  const deals = crmData.opportunities || [];
  const nodes = [];
  const edges = [];
  contacts.forEach(c => {
    nodes.push({ id: `contact_${c.id}`, label: c.name || c.email, type: 'contact', data: c });
  });
  deals.forEach(d => {
    nodes.push({ id: `deal_${d.id}`, label: d.name || d.title, type: 'deal', data: d });
    if (d.contactId) edges.push({ source: `contact_${d.contactId}`, target: `deal_${d.id}`, label: 'owns' });
  });
  // Group by company
  const companies = {};
  contacts.forEach(c => {
    if (c.company) {
      if (!companies[c.company]) {
        companies[c.company] = [];
        nodes.push({ id: `company_${c.company}`, label: c.company, type: 'company' });
      }
      companies[c.company].push(c.id);
      edges.push({ source: `company_${c.company}`, target: `contact_${c.id}`, label: 'employs' });
    }
  });
  return { nodes, edges };
}

// Kanban Physics settings
export function getKanbanPhysics() {
  try { return JSON.parse(localStorage.getItem('sic_kanban_physics')) || { enabled: true, confetti: true, haptic: true, inertia: true }; }
  catch { return { enabled: true, confetti: true, haptic: true, inertia: true }; }
}

export function updateKanbanPhysics(settings) {
  localStorage.setItem('sic_kanban_physics', JSON.stringify({ ...getKanbanPhysics(), ...settings }));
}

// Custom Empty States
export function getEmptyStateConfig(section) {
  const defaults = {
    pipeline: { title: 'Clean Slate!', message: 'Your pipeline is empty. Time to prospect!', tip: 'Try importing leads from CSV or connecting your email.', illustration: 'rocket' },
    leads: { title: 'No leads yet', message: 'Start by importing contacts or connecting integrations.', tip: 'Use the Lead Capture form on your website.', illustration: 'magnet' },
    deals: { title: 'No active deals', message: 'Convert some leads into deals to get started.', tip: 'Qualify your best leads and create opportunities.', illustration: 'handshake' },
    contacts: { title: 'Your address book is empty', message: 'Add contacts manually or import from CSV.', tip: 'Try scanning a business card!', illustration: 'contacts' }
  };
  return defaults[section] || { title: 'No Data', message: 'Nothing here yet.', illustration: 'empty' };
}

// Micro-Learning Tooltips
export function getMicroLearning(term) {
  const glossary = {
    'MRR': { title: 'Monthly Recurring Revenue', description: 'The predictable revenue a business expects every month from subscriptions.', tip: 'Increase MRR by upselling existing customers or reducing churn.' },
    'ARR': { title: 'Annual Recurring Revenue', description: 'MRR x 12. The yearly value of your recurring revenue.', tip: 'ARR is the primary metric VCs look at for SaaS companies.' },
    'CAC': { title: 'Customer Acquisition Cost', description: 'Total sales & marketing spend divided by new customers acquired.', tip: 'A healthy CAC:LTV ratio is 1:3 or better.' },
    'LTV': { title: 'Lifetime Value', description: 'The total revenue expected from a customer over their lifetime.', tip: 'Improve LTV by increasing retention and expanding accounts.' },
    'NPS': { title: 'Net Promoter Score', description: 'Customer satisfaction metric (-100 to 100). Promoters minus Detractors.', tip: 'NPS above 50 is excellent. Above 70 is world-class.' },
    'SQL': { title: 'Sales Qualified Lead', description: 'A lead that has been vetted and is ready for direct sales engagement.', tip: 'SQLs convert 5-10x better than raw leads.' },
    'MQL': { title: 'Marketing Qualified Lead', description: 'A lead that marketing has identified as more likely to become a customer.', tip: 'MQLs should be scored and passed to sales when ready.' },
    'BANT': { title: 'Budget, Authority, Need, Timeline', description: 'A sales qualification framework to assess lead quality.', tip: 'Use BANT to quickly qualify or disqualify prospects.' },
    'Churn': { title: 'Customer Churn Rate', description: 'Percentage of customers who cancel or don\'t renew in a given period.', tip: 'Reducing churn by 5% can increase profits by 25-95%.' },
    'Pipeline': { title: 'Sales Pipeline', description: 'Visual representation of where prospects are in the sales process.', tip: 'A healthy pipeline should be 3-5x your target.' }
  };
  return glossary[term] || null;
}

export function getStoryModeData() { return getStoredData(); }
