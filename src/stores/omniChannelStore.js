// Omni-Channel Communication Store
const STORAGE_KEY = 'sic_omnichannel';

function getStoredData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { whatsappChats: [], videoMessages: [], smsDrips: [], slackChannels: [], notifications: [], qrCodes: [], liveChatSessions: [], noReplyThreads: [] }; }
  catch { return { whatsappChats: [], videoMessages: [], smsDrips: [], slackChannels: [], notifications: [], qrCodes: [], liveChatSessions: [], noReplyThreads: [] }; }
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

// WhatsApp Integration
export async function sendWhatsApp(contactId, message, template = null) {
  try {
    const res = await fetch('http://localhost:5000/api/channels/whatsapp/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId, message, template })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const data = getStoredData();
    data.whatsappChats.push({ id: Date.now().toString(), contactId, message, template, status: 'queued', sentAt: new Date().toISOString() });
    saveData(data);
    return { success: true, queued: true };
  }
}

export async function getWhatsAppChats(contactId) {
  try {
    const res = await fetch(`http://localhost:5000/api/channels/whatsapp/chats/${contactId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch { return getStoredData().whatsappChats.filter(c => c.contactId === contactId); }
}

// Video Async Messages (Loom-style)
export async function sendVideoMessage(contactId, videoUrl, emailSubject) {
  try {
    const res = await fetch('http://localhost:5000/api/channels/video/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId, videoUrl, emailSubject })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const data = getStoredData();
    data.videoMessages.push({ id: Date.now().toString(), contactId, videoUrl, emailSubject, views: 0, watchTime: 0, sentAt: new Date().toISOString() });
    saveData(data);
    return { success: true, queued: true };
  }
}

export function getVideoAnalytics(videoId) {
  const data = getStoredData();
  return data.videoMessages.find(v => v.id === videoId) || { views: 0, watchTime: 0 };
}

// SMS Drip Sequences
export function createSmsDrip(sequence) {
  const data = getStoredData();
  const drip = {
    id: Date.now().toString(),
    ...sequence,
    steps: sequence.steps.map((s, i) => ({ ...s, stepNumber: i + 1, status: 'pending' })),
    status: 'active',
    createdAt: new Date().toISOString()
  };
  data.smsDrips.push(drip);
  saveData(data);
  return drip;
}

export function getSmsDrips() { return getStoredData().smsDrips; }

export function pauseDrip(dripId) {
  const data = getStoredData();
  const drip = data.smsDrips.find(d => d.id === dripId);
  if (drip) drip.status = drip.status === 'paused' ? 'active' : 'paused';
  saveData(data);
  return data.smsDrips;
}

// Slack Connect Channels
export async function createSlackChannel(dealId, clientEmail) {
  try {
    const res = await fetch('http://localhost:5000/api/channels/slack/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealId, clientEmail })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const data = getStoredData();
    data.slackChannels.push({ id: Date.now().toString(), dealId, clientEmail, status: 'pending', createdAt: new Date().toISOString() });
    saveData(data);
    return { success: true, pending: true };
  }
}

// In-App Notification Center
export function getNotificationCenter() { return getStoredData().notifications; }

export function addNotification(notification) {
  const data = getStoredData();
  data.notifications.unshift({ id: Date.now().toString(), ...notification, read: false, createdAt: new Date().toISOString() });
  if (data.notifications.length > 100) data.notifications = data.notifications.slice(0, 100);
  saveData(data);
  return data.notifications;
}

export function markNotificationRead(notifId) {
  const data = getStoredData();
  const notif = data.notifications.find(n => n.id === notifId);
  if (notif) notif.read = true;
  saveData(data);
  return data.notifications;
}

export function markAllNotificationsRead() {
  const data = getStoredData();
  data.notifications.forEach(n => n.read = true);
  saveData(data);
  return data.notifications;
}

// QR Code Generator
export function generateQRCode(repId, type = 'whatsapp') {
  const data = getStoredData();
  const qr = { id: Date.now().toString(), repId, type, scans: 0, createdAt: new Date().toISOString() };
  data.qrCodes.push(qr);
  saveData(data);
  return qr;
}

// Live Chat Handoff
export async function initiateLiveChatHandoff(sessionId, visitorInfo) {
  try {
    const res = await fetch('http://localhost:5000/api/channels/live-chat/handoff', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, visitorInfo })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const data = getStoredData();
    data.liveChatSessions.push({ id: sessionId, ...visitorInfo, status: 'waiting_handoff', createdAt: new Date().toISOString() });
    saveData(data);
    return { success: true, waiting: true };
  }
}

// No-Reply Detector
export async function detectNoReplies() {
  try {
    const res = await fetch('http://localhost:5000/api/channels/no-reply-detect');
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return getStoredData().noReplyThreads;
  }
}

export function flagNoReply(threadId, contactName, daysSinceReply) {
  const data = getStoredData();
  data.noReplyThreads.push({ id: Date.now().toString(), threadId, contactName, daysSinceReply, flaggedAt: new Date().toISOString() });
  saveData(data);
  return data.noReplyThreads;
}

// LinkedIn Voice DM Wrapper
export async function sendLinkedInVoiceDM(contactId, audioUrl) {
  try {
    const res = await fetch('http://localhost:5000/api/channels/linkedin/voice-dm', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId, audioUrl })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return { success: false, message: 'Connect LinkedIn integration to send voice DMs' };
  }
}

// Mention Anywhere
export function mentionContact(contactId, channel, message) {
  const data = getStoredData();
  data.notifications.unshift({ id: Date.now().toString(), type: 'mention', contactId, channel, message, read: false, createdAt: new Date().toISOString() });
  saveData(data);
  return { success: true };
}

export function getOmniChannelData() { return getStoredData(); }
