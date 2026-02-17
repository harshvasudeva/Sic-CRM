// Security & Privacy Store
const STORAGE_KEY = 'sic_security';

function getStoredData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { gdprRequests: [], auditTimeline: [], piiMaskingEnabled: false, sessions: [], exportLimits: {}, vendorRiskFlags: [], breakGlassLog: [], dataResidency: {}, twoFaPolicies: {} }; }
  catch { return { gdprRequests: [], auditTimeline: [], piiMaskingEnabled: false, sessions: [], exportLimits: {}, vendorRiskFlags: [], breakGlassLog: [], dataResidency: {}, twoFaPolicies: {} }; }
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

// GDPR Right to be Forgotten
export async function requestDataDeletion(contactId, reason) {
  try {
    const res = await fetch('http://localhost:5000/api/security/gdpr/forget', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId, reason })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const data = getStoredData();
    const request = { id: Date.now().toString(), contactId, reason, status: 'pending', requestedAt: new Date().toISOString(), certificate: null };
    data.gdprRequests.push(request);
    saveData(data);
    return { success: true, request };
  }
}

export function getGDPRRequests() { return getStoredData().gdprRequests; }

// Data Residency Toggles
export function setDataResidency(clientId, region) {
  const data = getStoredData();
  data.dataResidency[clientId] = { region, setAt: new Date().toISOString() };
  saveData(data);
  return data.dataResidency;
}

export function getDataResidency() { return getStoredData().dataResidency; }

// Audit Time Machine
export async function getAuditTimeline(entityType, entityId) {
  try {
    const res = await fetch(`http://localhost:5000/api/security/audit-timeline/${entityType}/${entityId}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch { return []; }
}

export async function rollbackToVersion(entityType, entityId, versionId) {
  try {
    const res = await fetch('http://localhost:5000/api/security/audit-timeline/rollback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, entityId, versionId })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch { return { success: false, message: 'Rollback requires server connection' }; }
}

// PII Masking (Presentation Mode)
export function togglePIIMasking(enabled) {
  const data = getStoredData();
  data.piiMaskingEnabled = enabled;
  saveData(data);
  return enabled;
}

export function isPIIMaskingEnabled() { return getStoredData().piiMaskingEnabled; }

export function maskPII(text, type = 'phone') {
  if (!getStoredData().piiMaskingEnabled) return text;
  if (!text) return text;
  switch (type) {
    case 'phone': return text.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
    case 'email': return text.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    case 'ssn': return '***-**-' + text.slice(-4);
    case 'card': return '**** **** **** ' + text.slice(-4);
    default: return '****';
  }
}

// 2FA Enforcement Policies
export function set2FAPolicy(role, required) {
  const data = getStoredData();
  data.twoFaPolicies[role] = { required, updatedAt: new Date().toISOString() };
  saveData(data);
  return data.twoFaPolicies;
}

export function get2FAPolicies() { return getStoredData().twoFaPolicies; }

// Break Glass Access
export function logBreakGlassAccess(adminId, targetUserId, reason) {
  const data = getStoredData();
  data.breakGlassLog.push({ id: Date.now().toString(), adminId, targetUserId, reason, accessedAt: new Date().toISOString() });
  saveData(data);
  return data.breakGlassLog;
}

export function getBreakGlassLog() { return getStoredData().breakGlassLog; }

// Session Management
export function getActiveSessions() { return getStoredData().sessions; }

export function addSession(session) {
  const data = getStoredData();
  data.sessions.push({ id: Date.now().toString(), ...session, startedAt: new Date().toISOString(), active: true });
  saveData(data);
  return data.sessions;
}

export function killSession(sessionId) {
  const data = getStoredData();
  data.sessions = data.sessions.filter(s => s.id !== sessionId);
  saveData(data);
  return data.sessions;
}

export function killAllOtherSessions(currentSessionId) {
  const data = getStoredData();
  data.sessions = data.sessions.filter(s => s.id === currentSessionId);
  saveData(data);
  return data.sessions;
}

// Role-Based Export Limits
export function setExportLimit(role, dailyLimit) {
  const data = getStoredData();
  data.exportLimits[role] = { dailyLimit, updatedAt: new Date().toISOString() };
  saveData(data);
  return data.exportLimits;
}

export function getExportLimits() { return getStoredData().exportLimits; }

export function checkExportAllowed(role) {
  const limits = getStoredData().exportLimits;
  if (!limits[role]) return { allowed: true, remaining: Infinity };
  const today = new Date().toDateString();
  const key = `export_count_${role}_${today}`;
  const count = parseInt(localStorage.getItem(key) || '0');
  return { allowed: count < limits[role].dailyLimit, remaining: Math.max(0, limits[role].dailyLimit - count) };
}

export function incrementExportCount(role) {
  const today = new Date().toDateString();
  const key = `export_count_${role}_${today}`;
  const count = parseInt(localStorage.getItem(key) || '0');
  localStorage.setItem(key, (count + 1).toString());
}

// Vendor Risk Flagging
export function checkVendorRisk(email) {
  const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'mail.com', 'protonmail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (freeProviders.includes(domain)) return { risk: 'high', reason: 'Free email provider used for corporate deal', domain };
  return { risk: 'low', reason: 'Corporate email domain', domain };
}

// Sensitive Field Encryption (simulated)
export function encryptField(value) {
  return btoa(value); // In production, use proper encryption
}

export function decryptField(encrypted) {
  try { return atob(encrypted); } catch { return '****'; }
}

export function getSecurityData() { return getStoredData(); }
