// Platform Extensibility Store - Marketplace, Lite Seats, API Explorer
const STORAGE_KEY = 'sic_platform';

function getStoredData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      marketplaceApps: [],
      installedApps: [],
      seats: { users: [], limits: { full: 0, lite: 0 } },
      apiCollections: []
    };
  } catch {
    return {
      marketplaceApps: [],
      installedApps: [],
      seats: { users: [], limits: { full: 0, lite: 0 } },
      apiCollections: []
    };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const DEFAULT_MARKETPLACE_APPS = [
  { id: 'app_docusign', name: 'DocuSign Widget', category: 'contracts', verified: true, version: '1.0.0' },
  { id: 'app_slack_sync', name: 'Slack Sync', category: 'communication', verified: true, version: '1.1.2' },
  { id: 'app_giphy', name: 'Giphy Integration', category: 'engagement', verified: true, version: '0.9.4' },
  { id: 'app_hubspot_bridge', name: 'HubSpot Bridge', category: 'crm', verified: false, version: '0.3.0' }
];

// App Store / Marketplace
export function getMarketplaceApps(filters = {}) {
  const data = getStoredData();
  const apps = data.marketplaceApps.length ? data.marketplaceApps : DEFAULT_MARKETPLACE_APPS;
  return apps.filter(app => {
    if (filters.verifiedOnly && !app.verified) return false;
    if (filters.category && app.category !== filters.category) return false;
    if (filters.search && !app.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}

export function publishMarketplaceApp(app) {
  const data = getStoredData();
  const record = {
    id: app.id || `app_${Date.now()}`,
    name: app.name,
    category: app.category || 'other',
    verified: !!app.verified,
    version: app.version || '1.0.0',
    description: app.description || '',
    createdAt: new Date().toISOString()
  };
  data.marketplaceApps.unshift(record);
  saveData(data);
  return record;
}

export function installMarketplaceApp(appId) {
  const data = getStoredData();
  const app = getMarketplaceApps().find(a => a.id === appId);
  if (!app) return { success: false, message: 'App not found' };
  const alreadyInstalled = data.installedApps.find(a => a.id === appId);
  if (alreadyInstalled) return { success: true, app: alreadyInstalled, alreadyInstalled: true };
  const installed = { ...app, installedAt: new Date().toISOString(), status: 'enabled' };
  data.installedApps.push(installed);
  saveData(data);
  return { success: true, app: installed };
}

export function uninstallMarketplaceApp(appId) {
  const data = getStoredData();
  data.installedApps = data.installedApps.filter(a => a.id !== appId);
  saveData(data);
  return data.installedApps;
}

export function getInstalledApps() {
  return getStoredData().installedApps;
}

// Lite Seat management
export function setSeatLimits(limits) {
  const data = getStoredData();
  data.seats.limits = {
    full: Math.max(0, Number(limits.full) || 0),
    lite: Math.max(0, Number(limits.lite) || 0)
  };
  saveData(data);
  return data.seats.limits;
}

export function assignSeat(userId, type = 'lite') {
  const normalizedType = type === 'full' ? 'full' : 'lite';
  const data = getStoredData();
  const limits = data.seats.limits;
  const sameTypeCount = data.seats.users.filter(u => u.type === normalizedType).length;

  if (limits[normalizedType] > 0 && sameTypeCount >= limits[normalizedType]) {
    return { success: false, message: `${normalizedType} seat limit reached`, limits, usage: getSeatUsage() };
  }

  const existing = data.seats.users.find(u => u.userId === userId);
  if (existing) {
    existing.type = normalizedType;
    existing.updatedAt = new Date().toISOString();
  } else {
    data.seats.users.push({
      id: `seat_${Date.now()}`,
      userId,
      type: normalizedType,
      permissions: normalizedType === 'lite' ? ['view:dashboards', 'view:reports'] : ['*'],
      createdAt: new Date().toISOString()
    });
  }

  saveData(data);
  return { success: true, seats: data.seats.users, usage: getSeatUsage() };
}

export function revokeSeat(userId) {
  const data = getStoredData();
  data.seats.users = data.seats.users.filter(u => u.userId !== userId);
  saveData(data);
  return data.seats.users;
}

export function getSeatUsage() {
  const data = getStoredData();
  const fullUsed = data.seats.users.filter(u => u.type === 'full').length;
  const liteUsed = data.seats.users.filter(u => u.type === 'lite').length;
  return {
    full: { used: fullUsed, limit: data.seats.limits.full },
    lite: { used: liteUsed, limit: data.seats.limits.lite }
  };
}

export function isLiteSeat(userId) {
  const seat = getStoredData().seats.users.find(u => u.userId === userId);
  return !!seat && seat.type === 'lite';
}

// API Explorer (Swagger-like request runner)
export function getApiCollections() {
  const data = getStoredData();
  if (data.apiCollections.length) return data.apiCollections;
  return [
    {
      id: 'core_crm',
      name: 'CRM Core APIs',
      baseUrl: 'http://localhost:5000/api',
      endpoints: [
        { id: 'get_leads', method: 'GET', path: '/leads', description: 'Fetch lead list' },
        { id: 'create_lead', method: 'POST', path: '/leads', description: 'Create lead' },
        { id: 'get_opps', method: 'GET', path: '/opportunities', description: 'Fetch opportunities' }
      ]
    }
  ];
}

export function saveApiCollection(collection) {
  const data = getStoredData();
  const record = {
    id: collection.id || `api_col_${Date.now()}`,
    name: collection.name || 'Untitled Collection',
    baseUrl: collection.baseUrl || 'http://localhost:5000/api',
    endpoints: collection.endpoints || []
  };
  const existingIndex = data.apiCollections.findIndex(c => c.id === record.id);
  if (existingIndex >= 0) data.apiCollections[existingIndex] = record;
  else data.apiCollections.unshift(record);
  saveData(data);
  return record;
}

export async function runApiExplorerRequest(baseUrl, endpoint, options = {}) {
  const method = (options.method || endpoint.method || 'GET').toUpperCase();
  let resolvedPath = endpoint.path;

  if (options.query && typeof options.query === 'object') {
    const queryString = new URLSearchParams(options.query).toString();
    if (queryString) resolvedPath = `${resolvedPath}${resolvedPath.includes('?') ? '&' : '?'}${queryString}`;
  }

  const url = `${baseUrl}${resolvedPath}`;

  const req = {
    method,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  };

  if (options.body && method !== 'GET') req.body = JSON.stringify(options.body);

  const startedAt = Date.now();
  try {
    const response = await fetch(url, req);
    const text = await response.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = text; }

    return {
      ok: response.ok,
      status: response.status,
      durationMs: Date.now() - startedAt,
      data: parsed
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      durationMs: Date.now() - startedAt,
      error: error?.message || 'Request failed'
    };
  }
}

export function getPlatformData() {
  return getStoredData();
}
