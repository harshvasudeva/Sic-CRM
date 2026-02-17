// Relationship Intelligence Store
const STORAGE_KEY = 'sic_relationships';

function getStoredData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { networkMap: {}, gifts: [], keepInTouch: [], jobChanges: [], trustScores: {}, meetingMemories: {}, gatekeepers: {}, timezones: {}, culturalCalendar: [], thankYouNotes: [] }; }
  catch { return { networkMap: {}, gifts: [], keepInTouch: [], jobChanges: [], trustScores: {}, meetingMemories: {}, gatekeepers: {}, timezones: {}, culturalCalendar: [], thankYouNotes: [] }; }
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

// Network Overlap
export async function findNetworkOverlap(contactId) {
  try {
    const res = await fetch(`http://localhost:5000/api/relationships/network/${contactId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return { connections: [], message: 'Connect email/LinkedIn to discover network overlaps' };
  }
}

export function addNetworkConnection(contactA, contactB, relationship) {
  const data = getStoredData();
  const key = `${contactA}_${contactB}`;
  data.networkMap[key] = { contactA, contactB, relationship, addedAt: new Date().toISOString() };
  saveData(data);
  return data.networkMap;
}

// Gift Recommender
export async function getGiftSuggestions(contactId) {
  try {
    const res = await fetch(`http://localhost:5000/api/relationships/gifts/${contactId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return {
      upcoming: [],
      suggestions: [
        { type: 'generic', item: 'Premium Coffee Set', occasion: 'Thank You', priceRange: '$30-50' },
        { type: 'generic', item: 'Branded Notebook', occasion: 'Meeting', priceRange: '$20-30' },
        { type: 'generic', item: 'Gift Card', occasion: 'Birthday', priceRange: '$50-100' }
      ]
    };
  }
}

export function logGift(contactId, gift) {
  const data = getStoredData();
  data.gifts.push({ id: Date.now().toString(), contactId, ...gift, sentAt: new Date().toISOString() });
  saveData(data);
  return data.gifts;
}

// Keep in Touch Timer
export function getKeepInTouchList() {
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  const contacts = crmData.contacts || [];
  const activities = crmData.activities || [];
  return contacts.map(c => {
    const lastActivity = activities.filter(a => a.contactId === c.id).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const daysSince = lastActivity ? Math.floor((Date.now() - new Date(lastActivity.date)) / (1000 * 60 * 60 * 24)) : 999;
    return { ...c, lastContactDate: lastActivity?.date, daysSinceContact: daysSince, needsAttention: daysSince > 90 };
  }).sort((a, b) => b.daysSinceContact - a.daysSinceContact);
}

export function setKeepInTouchInterval(contactId, intervalDays) {
  const data = getStoredData();
  data.keepInTouch.push({ contactId, intervalDays, setAt: new Date().toISOString() });
  saveData(data);
  return data.keepInTouch;
}

// Job Change Alerts
export async function checkJobChanges() {
  try {
    const res = await fetch('http://localhost:5000/api/relationships/job-changes');
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch { return getStoredData().jobChanges; }
}

export function logJobChange(contactId, oldCompany, newCompany, newTitle) {
  const data = getStoredData();
  data.jobChanges.push({ id: Date.now().toString(), contactId, oldCompany, newCompany, newTitle, detectedAt: new Date().toISOString(), actionTaken: false });
  saveData(data);
  return data.jobChanges;
}

// Trust Score
export function calculateTrustScore(contactId) {
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  const activities = (crmData.activities || []).filter(a => a.contactId === contactId);
  let score = 50;
  const factors = [];
  const responseCount = activities.filter(a => a.type === 'email_reply' || a.direction === 'inbound').length;
  if (responseCount > 5) { score += 15; factors.push('High response rate'); }
  else if (responseCount > 2) { score += 8; factors.push('Moderate response rate'); }
  const meetingCount = activities.filter(a => a.type === 'meeting').length;
  if (meetingCount > 3) { score += 15; factors.push('Multiple meetings held'); }
  const referral = activities.some(a => a.notes?.toLowerCase().includes('referral'));
  if (referral) { score += 20; factors.push('Has given referrals'); }
  const data = getStoredData();
  data.trustScores[contactId] = { score: Math.min(100, score), factors, calculatedAt: new Date().toISOString() };
  saveData(data);
  return data.trustScores[contactId];
}

// Meeting Memories
export function addMeetingMemory(contactId, memory) {
  const data = getStoredData();
  if (!data.meetingMemories[contactId]) data.meetingMemories[contactId] = [];
  data.meetingMemories[contactId].push({ ...memory, addedAt: new Date().toISOString() });
  saveData(data);
  return data.meetingMemories[contactId];
}

export function getMeetingMemories(contactId) {
  return getStoredData().meetingMemories[contactId] || [];
}

// Gatekeeper Identification
export function identifyGatekeepers(contactId) {
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  const activities = (crmData.activities || []).filter(a => a.contactId === contactId);
  const ccPatterns = {};
  activities.forEach(a => {
    if (a.ccRecipients) {
      a.ccRecipients.forEach(cc => {
        ccPatterns[cc] = (ccPatterns[cc] || 0) + 1;
      });
    }
  });
  return Object.entries(ccPatterns).filter(([, count]) => count >= 2).map(([email, count]) => ({ email, frequency: count, likelyRole: 'Decision Maker / Gatekeeper' }));
}

// Timezone Empathy
export function getContactTimezone(contactId) {
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  const contact = (crmData.contacts || []).find(c => c.id === contactId);
  if (!contact) return null;
  const timezone = contact.timezone || contact.tz;
  if (!timezone) return { timezone: 'Unknown', suggestion: 'Add timezone to contact' };
  try {
    const now = new Date();
    const theirTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const hour = theirTime.getHours();
    const isBusinessHours = hour >= 9 && hour <= 17;
    const isLateEvening = hour >= 21 || hour < 7;
    return {
      timezone, localTime: theirTime.toLocaleTimeString(), isBusinessHours,
      suggestion: isLateEvening ? `It's ${theirTime.toLocaleTimeString()} there. Schedule for their 9 AM instead.` : isBusinessHours ? 'Good time to reach out!' : `It's ${theirTime.toLocaleTimeString()} there. Consider waiting for business hours.`
    };
  } catch { return { timezone, suggestion: 'Timezone lookup failed' }; }
}

// Cultural Calendar
export function getCulturalCalendar(region) {
  const holidays = {
    'IN': [
      { name: 'Diwali', month: 10, note: 'Major festival - avoid cold calls' },
      { name: 'Holi', month: 3, note: 'Festival of colors - light engagement day' },
      { name: 'Republic Day', month: 1, day: 26, note: 'National holiday' },
      { name: 'Independence Day', month: 8, day: 15, note: 'National holiday' }
    ],
    'US': [
      { name: 'Thanksgiving', month: 11, note: 'Major holiday - no cold calls' },
      { name: 'Independence Day', month: 7, day: 4, note: 'National holiday' },
      { name: 'Christmas', month: 12, day: 25, note: 'Holiday season - light outreach' },
      { name: 'Memorial Day', month: 5, note: 'Long weekend - avoid scheduling' }
    ],
    'UK': [
      { name: 'Christmas', month: 12, day: 25, note: 'Major holiday' },
      { name: 'Boxing Day', month: 12, day: 26, note: 'Holiday' },
      { name: 'Bank Holiday', month: 8, note: 'Long weekend' }
    ],
    'JP': [
      { name: 'Golden Week', month: 5, note: 'Week-long holiday - avoid scheduling' },
      { name: 'Obon', month: 8, note: 'Summer holiday period' }
    ]
  };
  const currentMonth = new Date().getMonth() + 1;
  const regionHolidays = holidays[region] || [];
  return {
    region,
    upcoming: regionHolidays.filter(h => h.month >= currentMonth && h.month <= currentMonth + 2),
    all: regionHolidays
  };
}

// Thank You Note Drafting
export async function generateThankYouNote(dealId) {
  try {
    const res = await fetch(`http://localhost:5000/api/relationships/thank-you/${dealId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
    const deal = (crmData.opportunities || []).find(d => d.id === dealId);
    const contactName = deal?.contactName || 'there';
    const dealName = deal?.name || 'the deal';
    return {
      subject: `Thank you for choosing us!`,
      body: `Dear ${contactName},\n\nI wanted to personally thank you for your trust in our partnership regarding ${dealName}. It's been a pleasure working with you throughout this journey.\n\nI'm committed to ensuring you get the most value from our solution. Please don't hesitate to reach out if you need anything.\n\nLooking forward to a long and successful partnership.\n\nWarm regards`
    };
  }
}

export function getRelationshipData() { return getStoredData(); }
