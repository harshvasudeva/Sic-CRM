// Ecosystem Store - Breaking down silos between Sales, Support, Marketing
const STORAGE_KEY = 'sic_ecosystem';

function getStoredData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { supportFlags: [], marketingHeatmap: {}, unifiedInbox: [], bounties: [], vocFeed: [], accountHealth: {}, referrals: [], inventoryBlocks: [], roiTracking: {} }; }
  catch { return { supportFlags: [], marketingHeatmap: {}, unifiedInbox: [], bounties: [], vocFeed: [], accountHealth: {}, referrals: [], inventoryBlocks: [], roiTracking: {} }; }
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

// Support-Driven Sales Flags
export async function getSupportSalesFlags() {
  try {
    const res = await fetch('http://localhost:5000/api/ecosystem/support-flags');
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch { return getStoredData().supportFlags; }
}

export function createSupportFlag(flag) {
  const data = getStoredData();
  data.supportFlags.push({ id: Date.now().toString(), ...flag, createdAt: new Date().toISOString(), status: 'active' });
  saveData(data);
  return data.supportFlags;
}

// Marketing Heatmap for Sales
export async function getContactEngagement(contactId) {
  try {
    const res = await fetch(`http://localhost:5000/api/ecosystem/engagement/${contactId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return { pageViews: [], blogPosts: [], downloads: [], lastVisit: null, engagementScore: 0 };
  }
}

// Unified Inbox
export async function getUnifiedInbox(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const res = await fetch(`http://localhost:5000/api/ecosystem/unified-inbox?${params}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return getStoredData().unifiedInbox;
  }
}

export function addInboxMessage(message) {
  const data = getStoredData();
  data.unifiedInbox.push({ id: Date.now().toString(), ...message, timestamp: new Date().toISOString() });
  saveData(data);
  return data.unifiedInbox;
}

// Cross-Department Bounties
export async function getBounties() {
  try {
    const res = await fetch('http://localhost:5000/api/ecosystem/bounties');
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch { return getStoredData().bounties; }
}

export function createBounty(bounty) {
  const data = getStoredData();
  data.bounties.push({ id: Date.now().toString(), ...bounty, status: 'open', createdAt: new Date().toISOString(), claims: [] });
  saveData(data);
  return data.bounties;
}

export function claimBounty(bountyId, claimerId, department) {
  const data = getStoredData();
  const bounty = data.bounties.find(b => b.id === bountyId);
  if (bounty) {
    bounty.claims.push({ claimerId, department, claimedAt: new Date().toISOString() });
    bounty.status = 'claimed';
    saveData(data);
  }
  return data.bounties;
}

// Voice of Customer Feed
export async function getVocFeed() {
  try {
    const res = await fetch('http://localhost:5000/api/ecosystem/voc-feed');
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch { return getStoredData().vocFeed; }
}

export function pinCustomerQuote(quote) {
  const data = getStoredData();
  data.vocFeed.push({ id: Date.now().toString(), ...quote, pinnedAt: new Date().toISOString(), pinnedBy: 'current_user' });
  saveData(data);
  return data.vocFeed;
}

// Shared Account Health Score (0-100)
export async function getAccountHealth(accountId) {
  try {
    const res = await fetch(`http://localhost:5000/api/ecosystem/account-health/${accountId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return { score: 0, breakdown: { paymentHistory: 0, usage: 0, ticketVolume: 0, nps: 0 }, lastUpdated: null };
  }
}

export function updateAccountHealth(accountId, metrics) {
  const data = getStoredData();
  const score = Math.round((metrics.paymentHistory + metrics.usage + metrics.ticketVolume + metrics.nps) / 4);
  data.accountHealth[accountId] = { score, breakdown: metrics, lastUpdated: new Date().toISOString() };
  saveData(data);
  return data.accountHealth[accountId];
}

// Referral Pass Button
export function createReferral(ticketId, contactInfo) {
  const data = getStoredData();
  data.referrals.push({ id: Date.now().toString(), ticketId, ...contactInfo, status: 'new_lead', createdAt: new Date().toISOString() });
  saveData(data);
  return data.referrals;
}

// Inventory Block Sync
export function blockInventoryForDeal(dealId, productId, quantity, days = 7) {
  const data = getStoredData();
  data.inventoryBlocks.push({ id: Date.now().toString(), dealId, productId, quantity, expiresAt: new Date(Date.now() + days * 86400000).toISOString(), status: 'active' });
  saveData(data);
  return data.inventoryBlocks;
}

export function releaseInventoryBlock(blockId) {
  const data = getStoredData();
  const block = data.inventoryBlocks.find(b => b.id === blockId);
  if (block) block.status = 'released';
  saveData(data);
  return data.inventoryBlocks;
}

// Full Circle ROI Tracking
export function trackLeadToRevenue(leadSource, leadId, revenue) {
  const data = getStoredData();
  if (!data.roiTracking[leadSource]) data.roiTracking[leadSource] = { leads: 0, revenue: 0, deals: [] };
  data.roiTracking[leadSource].leads++;
  data.roiTracking[leadSource].revenue += revenue;
  data.roiTracking[leadSource].deals.push({ leadId, revenue, closedAt: new Date().toISOString() });
  saveData(data);
  return data.roiTracking;
}

export function getROIBySource() { return getStoredData().roiTracking; }

// Product-Usage Triggers
export async function checkUsageTriggers(accountId) {
  try {
    const res = await fetch(`http://localhost:5000/api/ecosystem/usage-triggers/${accountId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return { triggers: [], message: 'Connect product usage tracking to enable triggers' };
  }
}

export function getEcosystemData() { return getStoredData(); }
