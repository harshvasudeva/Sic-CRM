// AI Agent Store - Agentic CRM features
const STORAGE_KEY = 'sic_agents';
const AGENT_CONFIG_KEY = 'sic_agent_config';

function getStoredData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { tasks: [], alerts: [], suggestions: [] }; }
  catch { return { tasks: [], alerts: [], suggestions: [] }; }
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function getAgentConfig() {
  try { return JSON.parse(localStorage.getItem(AGENT_CONFIG_KEY)) || { nudgeEnabled: true, stalledDays: 7, churnThreshold: 15, autoAssign: true, pipelineCleanupDays: 90 }; }
  catch { return { nudgeEnabled: true, stalledDays: 7, churnThreshold: 15, autoAssign: true, pipelineCleanupDays: 90 }; }
}
export function updateAgentConfig(config) { localStorage.setItem(AGENT_CONFIG_KEY, JSON.stringify({ ...getAgentConfig(), ...config })); }
export { getAgentConfig };

// Nudge Agent - Monitors stalled deals
export async function runNudgeAgent() {
  try {
    const res = await fetch('http://localhost:5000/api/agents/nudge', { method: 'POST' });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const config = getAgentConfig();
    const data = getStoredData();
    // Simulate finding stalled deals from localStorage CRM data
    const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
    const deals = crmData.opportunities || [];
    const stalledDeals = deals.filter(d => {
      if (d.stage === 'won' || d.stage === 'lost') return false;
      const lastActivity = new Date(d.updatedAt || d.createdAt);
      const daysSince = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
      return daysSince >= config.stalledDays;
    });
    const nudges = stalledDeals.map(d => ({
      id: `nudge_${d.id}_${Date.now()}`,
      type: 'nudge',
      dealId: d.id,
      dealName: d.name || d.title,
      contactName: d.contactName,
      draftEmail: `Hi ${d.contactName || 'there'},\n\nJust wanted to check in on our conversation about ${d.name || 'the opportunity'}. Is there anything I can help clarify?\n\nBest regards`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }));
    data.tasks.push(...nudges);
    saveData(data);
    return { nudges, count: nudges.length };
  }
}

// Meeting Prep Agent
export async function generateMeetingPrep(contactId, meetingTime) {
  try {
    const res = await fetch('http://localhost:5000/api/agents/meeting-prep', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId, meetingTime })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return {
      contactId, meetingTime,
      cheatSheet: {
        recentEmails: ['(Load recent emails from integration)'],
        linkedinActivity: '(Connect LinkedIn to see recent posts)',
        pendingTickets: [],
        dealHistory: '(Loading from CRM data...)',
        talkingPoints: ['Follow up on previous discussion', 'Present new proposal', 'Address concerns']
      }
    };
  }
}

// Lookalike Prospecting Agent
export async function findLookalikeCompanies(companyId) {
  try {
    const res = await fetch(`http://localhost:5000/api/agents/lookalike/${companyId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return { similar: [], message: 'Connect enrichment API to find similar companies' };
  }
}

// Churn Prevention Agent
export async function runChurnDetection() {
  try {
    const res = await fetch('http://localhost:5000/api/agents/churn-detection', { method: 'POST' });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const config = getAgentConfig();
    return { atRisk: [], threshold: config.churnThreshold, message: 'Connect usage tracking to enable churn detection' };
  }
}

// Competitor Watchdog
export async function checkCompetitorMentions(dealId) {
  try {
    const res = await fetch(`http://localhost:5000/api/agents/competitor-watch/${dealId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return { mentions: [], killSheets: {} };
  }
}

// Scheduling Agent
export async function findMeetingSlot(participants) {
  try {
    const res = await fetch('http://localhost:5000/api/agents/schedule', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participants })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return { suggestedSlots: [], message: 'Connect calendar integration to find available slots' };
  }
}

// Out of Office Handler
export async function setOutOfOffice(userId, startDate, endDate, backupUserId) {
  try {
    const res = await fetch('http://localhost:5000/api/agents/ooo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, startDate, endDate, backupUserId })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const data = getStoredData();
    data.tasks.push({ id: `ooo_${Date.now()}`, type: 'ooo', userId, startDate, endDate, backupUserId, status: 'active' });
    saveData(data);
    return { success: true };
  }
}

// Post-Call Cleanup Agent
export async function generatePostCallTasks(meetingId, notes) {
  try {
    const res = await fetch('http://localhost:5000/api/agents/post-call', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId, notes })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    // Parse promises from notes
    const promises = [];
    const promisePatterns = notes.match(/(?:will send|promised|agreed to|need to)\s+(.+?)(?:\.|,|$)/gi) || [];
    promisePatterns.forEach(p => promises.push({ text: p.trim(), status: 'pending' }));
    return { tasks: promises, autoGenerated: true };
  }
}

// Pipeline Sanitation Agent
export async function runPipelineSanitation() {
  try {
    const res = await fetch('http://localhost:5000/api/agents/pipeline-sanitize', { method: 'POST' });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const config = getAgentConfig();
    const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
    const deals = crmData.opportunities || [];
    const stale = deals.filter(d => {
      if (d.stage === 'won' || d.stage === 'lost') return false;
      const created = new Date(d.createdAt);
      const daysSince = (Date.now() - created) / (1000 * 60 * 60 * 24);
      return daysSince >= config.pipelineCleanupDays;
    });
    return { staleDeals: stale.map(d => ({ ...d, suggestion: 'Move to Lost or update with new activity' })), count: stale.length };
  }
}

// Review Miner Agent
export async function scanForReviews() {
  try {
    const res = await fetch('http://localhost:5000/api/agents/review-miner');
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return { reviews: [], message: 'Connect G2/Capterra to scan for client reviews' };
  }
}

export function getAgentTasks() { return getStoredData().tasks; }
export function getAgentAlerts() { return getStoredData().alerts; }
export function dismissAgentTask(taskId) {
  const data = getStoredData();
  data.tasks = data.tasks.filter(t => t.id !== taskId);
  saveData(data);
}
