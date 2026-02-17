// Voice CRM Store - Invisible CRM features
const STORAGE_KEY = 'sic_voice_crm';

function getStoredData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { recordings: [], parsedContacts: [], clipboardNotes: [] }; }
  catch { return { recordings: [], parsedContacts: [], clipboardNotes: [] }; }
}

function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function getOrCreateSidecarState() {
  const data = getStoredData();
  if (!data.sidecarSessions) data.sidecarSessions = [];
  if (!data.sidecarEdits) data.sidecarEdits = [];
  return data;
}

// Voice-to-Field: Parse voice text into CRM fields using AI
export async function parseVoiceInput(transcript) {
  try {
    const res = await fetch('http://localhost:5000/api/ai/parse-voice', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    // Local NLP fallback - extract names, companies, amounts
    const fields = {};
    const nameMatch = transcript.match(/(?:met with|talked to|called|spoke with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch) fields.contactName = nameMatch[1];
    const companyMatch = transcript.match(/(?:from|at|with)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/i);
    if (companyMatch) fields.company = companyMatch[1];
    const amountMatch = transcript.match(/\$[\d,]+(?:\.\d{2})?|\d+k|\d+\s*(?:thousand|million|lakh|crore)/gi);
    if (amountMatch) fields.dealValue = amountMatch[0];
    const stageMatch = transcript.match(/(?:interested in|wants|considering|worried about|concerned about)\s+(.+?)(?:\.|,|$)/i);
    if (stageMatch) fields.notes = stageMatch[0];
    const planMatch = transcript.match(/(?:pro plan|basic plan|enterprise|starter|premium)/i);
    if (planMatch) fields.plan = planMatch[0];
    fields.rawTranscript = transcript;
    fields.parsedAt = new Date().toISOString();
    const data = getStoredData();
    data.recordings.push({ id: Date.now().toString(), ...fields });
    saveData(data);
    return { success: true, fields };
  }
}

// Screenshot-to-Contact: Parse screenshot/image for contact info
export async function parseScreenshotToContact(imageData) {
  try {
    const res = await fetch('http://localhost:5000/api/ai/parse-screenshot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    // Fallback: extract text patterns from OCR-like input
    const contact = { source: 'screenshot', parsedAt: new Date().toISOString() };
    if (typeof imageData === 'string') {
      const emailMatch = imageData.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) contact.email = emailMatch[0];
      const phoneMatch = imageData.match(/[\+]?[\d\s\-\(\)]{10,}/);
      if (phoneMatch) contact.phone = phoneMatch[0].trim();
      const urlMatch = imageData.match(/(?:linkedin\.com\/in\/|twitter\.com\/|github\.com\/)[\w-]+/);
      if (urlMatch) contact.socialUrl = urlMatch[0];
    }
    const data = getStoredData();
    data.parsedContacts.push({ id: Date.now().toString(), ...contact });
    saveData(data);
    return { success: true, contact };
  }
}

// Browser Sidecar Extension: edit CRM context without leaving Gmail/LinkedIn
export function openSidecarSession(context) {
  const data = getOrCreateSidecarState();
  const session = {
    id: `sidecar_${Date.now()}`,
    source: context.source || 'web',
    url: context.url || '',
    title: context.title || '',
    contactHint: context.contactHint || '',
    companyHint: context.companyHint || '',
    selectedText: context.selectedText || '',
    openedAt: new Date().toISOString(),
    status: 'active'
  };
  data.sidecarSessions.unshift(session);
  if (data.sidecarSessions.length > 50) data.sidecarSessions = data.sidecarSessions.slice(0, 50);
  saveData(data);
  return session;
}

export function applySidecarEdit(sessionId, entityType, entityId, field, value) {
  const data = getOrCreateSidecarState();
  const edit = {
    id: `sidecar_edit_${Date.now()}`,
    sessionId,
    entityType,
    entityId,
    field,
    value,
    editedAt: new Date().toISOString(),
    status: 'queued'
  };
  data.sidecarEdits.unshift(edit);
  if (data.sidecarEdits.length > 200) data.sidecarEdits = data.sidecarEdits.slice(0, 200);
  saveData(data);
  return edit;
}

export function getSidecarContext(url) {
  const data = getOrCreateSidecarState();
  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  const contacts = crmData.contacts || [];
  const opportunities = crmData.opportunities || [];
  const domain = (url || '').match(/https?:\/\/(?:www\.)?([^\/]+)/i)?.[1]?.toLowerCase() || '';
  const matchingContacts = contacts.filter(c => {
    const emailDomain = c.email?.split('@')[1]?.toLowerCase();
    const websiteDomain = c.website?.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]?.toLowerCase();
    return emailDomain === domain || websiteDomain === domain;
  });
  const linkedDeals = opportunities.filter(d => matchingContacts.some(c => c.id === d.contactId));
  return {
    domain,
    contacts: matchingContacts,
    deals: linkedDeals,
    lastSession: data.sidecarSessions.find(s => s.url === url) || null
  };
}

// Contextual Copy Helper
export function addClipboardNote(text, source) {
  const data = getStoredData();
  data.clipboardNotes.push({ id: Date.now().toString(), text, source, addedAt: new Date().toISOString() });
  saveData(data);
  return data.clipboardNotes;
}

// Email Signature Monitor
export async function detectSignatureChange(contactId, newSignature) {
  try {
    const res = await fetch(`http://localhost:5000/api/contacts/${contactId}/signature-check`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature: newSignature })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return { changed: false, fields: {} };
  }
}

// Auto-Association AI
export async function suggestDealAssociations(deal) {
  try {
    const res = await fetch('http://localhost:5000/api/ai/suggest-associations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deal)
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return { suggestions: [] };
  }
}

// Meeting Sentiment Logger
export async function logMeetingSentiment(meetingId, sentimentData) {
  try {
    const res = await fetch(`http://localhost:5000/api/meetings/${meetingId}/sentiment`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sentimentData)
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const data = getStoredData();
    if (!data.sentiments) data.sentiments = [];
    data.sentiments.push({ meetingId, ...sentimentData, loggedAt: new Date().toISOString() });
    saveData(data);
    return { success: true };
  }
}

// WhatsApp Structure Mapping
export async function syncWhatsAppChat(chatData) {
  try {
    const res = await fetch('http://localhost:5000/api/integrations/whatsapp/sync', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatData)
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return { summary: 'Chat sync pending - will retry when online', bullets: [] };
  }
}

// Visiting Card Scanner 2.0
export async function scanVisitingCard(imageData) {
  try {
    const res = await fetch('http://localhost:5000/api/ai/scan-card', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return parseScreenshotToContact(imageData);
  }
}

// Calendar Parsing Bot
export async function parseCalendarEvent(eventText) {
  try {
    const res = await fetch('http://localhost:5000/api/ai/parse-calendar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: eventText })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const datePatterns = eventText.match(/(?:next|this)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi);
    const timePatterns = eventText.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi);
    return { suggestedDate: datePatterns?.[0], suggestedTime: timePatterns?.[0], raw: eventText };
  }
}

export function autoScheduleFollowUpFromCalendar(eventText, contactId = null) {
  const parsed = {
    date: eventText.match(/(?:next|this)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)?.[0] || null,
    time: eventText.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)/i)?.[0] || null,
    reason: eventText.match(/(?:follow\s*up|check\s*in|review|demo|meeting)/i)?.[0] || 'follow up'
  };

  const crmData = JSON.parse(localStorage.getItem('sic_crm') || '{}');
  if (!crmData.activities) crmData.activities = [];

  const activity = {
    id: `activity_${Date.now()}`,
    type: 'follow_up',
    contactId,
    title: `Auto-scheduled ${parsed.reason}`,
    notes: `Created from calendar context: ${eventText}`,
    dateHint: parsed.date,
    timeHint: parsed.time,
    createdAt: new Date().toISOString(),
    source: 'calendar_bot'
  };

  crmData.activities.unshift(activity);
  localStorage.setItem('sic_crm', JSON.stringify(crmData));

  return { success: true, activity, parsed };
}

export function getVoiceCrmData() { return getStoredData(); }
export function clearVoiceCrmData() { localStorage.removeItem(STORAGE_KEY); }
