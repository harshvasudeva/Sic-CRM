// No-Code Automation & Module Store
const STORAGE_KEY = 'sic_automations';
const MODULES_KEY = 'sic_modules';

function getStoredData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { workflows: [], triggers: [], logs: [] }; }
  catch { return { workflows: [], triggers: [], logs: [] }; }
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function getModuleData() {
  try { return JSON.parse(localStorage.getItem(MODULES_KEY)) || { enabledModules: ['sales', 'crm', 'accounting', 'inventory', 'hr', 'purchase'], customCards: [], formulas: [], customButtons: [], pageLayouts: {} }; }
  catch { return { enabledModules: ['sales', 'crm', 'accounting', 'inventory', 'hr', 'purchase'], customCards: [], formulas: [], customButtons: [], pageLayouts: {} }; }
}
function saveModuleData(data) { localStorage.setItem(MODULES_KEY, JSON.stringify(data)); }

// Automation Workflow Builder
export function createWorkflow(workflow) {
  const data = getStoredData();
  const wf = {
    id: Date.now().toString(),
    ...workflow,
    steps: workflow.steps.map((s, i) => ({ ...s, order: i + 1 })),
    status: 'active',
    runCount: 0,
    createdAt: new Date().toISOString()
  };
  data.workflows.push(wf);
  saveData(data);
  return wf;
}

export function getWorkflows() { return getStoredData().workflows; }

export function updateWorkflow(workflowId, updates) {
  const data = getStoredData();
  const wf = data.workflows.find(w => w.id === workflowId);
  if (wf) Object.assign(wf, updates);
  saveData(data);
  return data.workflows;
}

export function deleteWorkflow(workflowId) {
  const data = getStoredData();
  data.workflows = data.workflows.filter(w => w.id !== workflowId);
  saveData(data);
  return data.workflows;
}

export function toggleWorkflow(workflowId) {
  const data = getStoredData();
  const wf = data.workflows.find(w => w.id === workflowId);
  if (wf) wf.status = wf.status === 'active' ? 'paused' : 'active';
  saveData(data);
  return data.workflows;
}

// Simulate running a workflow
export function simulateWorkflow(workflowId) {
  const data = getStoredData();
  const wf = data.workflows.find(w => w.id === workflowId);
  if (!wf) return { success: false, message: 'Workflow not found' };
  wf.runCount++;
  wf.lastRunAt = new Date().toISOString();
  data.logs.push({ workflowId, workflowName: wf.name, runAt: new Date().toISOString(), steps: wf.steps.length, status: 'completed' });
  saveData(data);
  return { success: true, workflow: wf };
}

export function getWorkflowLogs() { return getStoredData().logs; }

// Module Management (Pay Per Module)
export function getEnabledModules() { return getModuleData().enabledModules; }

export function toggleModule(moduleName) {
  const data = getModuleData();
  if (data.enabledModules.includes(moduleName)) {
    data.enabledModules = data.enabledModules.filter(m => m !== moduleName);
  } else {
    data.enabledModules.push(moduleName);
  }
  saveModuleData(data);
  return data.enabledModules;
}

// Custom Cards (mini React widgets)
export function getCustomCards() { return getModuleData().customCards; }

export function addCustomCard(card) {
  const data = getModuleData();
  data.customCards.push({ id: Date.now().toString(), ...card, createdAt: new Date().toISOString() });
  saveModuleData(data);
  return data.customCards;
}

export function removeCustomCard(cardId) {
  const data = getModuleData();
  data.customCards = data.customCards.filter(c => c.id !== cardId);
  saveModuleData(data);
  return data.customCards;
}

// Formula Fields
export function getFormulaFields() { return getModuleData().formulas; }

export function addFormulaField(formula) {
  const data = getModuleData();
  data.formulas.push({ id: Date.now().toString(), ...formula, createdAt: new Date().toISOString() });
  saveModuleData(data);
  return data.formulas;
}

export function evaluateFormula(formula, record) {
  try {
    // Safe evaluation of simple math formulas
    const expression = formula.replace(/\{(\w+)\}/g, (_, field) => {
      const val = record[field];
      return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    // Only allow math operations
    if (/^[\d\s+\-*/().]+$/.test(expression)) {
      return new Function(`return ${expression}`)();
    }
    return 'Invalid formula';
  } catch { return 'Error'; }
}

export function removeFormulaField(formulaId) {
  const data = getModuleData();
  data.formulas = data.formulas.filter(f => f.id !== formulaId);
  saveModuleData(data);
  return data.formulas;
}

// Custom Buttons
export function getCustomButtons() { return getModuleData().customButtons; }

export function addCustomButton(button) {
  const data = getModuleData();
  data.customButtons.push({ id: Date.now().toString(), ...button, createdAt: new Date().toISOString() });
  saveModuleData(data);
  return data.customButtons;
}

export function removeCustomButton(buttonId) {
  const data = getModuleData();
  data.customButtons = data.customButtons.filter(b => b.id !== buttonId);
  saveModuleData(data);
  return data.customButtons;
}

// Page Layouts (Drag and Drop)
export function getPageLayout(pageId) {
  return getModuleData().pageLayouts[pageId] || null;
}

export function savePageLayout(pageId, layout) {
  const data = getModuleData();
  data.pageLayouts[pageId] = { ...layout, updatedAt: new Date().toISOString() };
  saveModuleData(data);
  return data.pageLayouts[pageId];
}

// Field Logic (conditional fields)
export function evaluateFieldLogic(rules, values) {
  return rules.filter(rule => {
    const fieldValue = values[rule.field];
    switch (rule.operator) {
      case 'equals': return fieldValue === rule.value;
      case 'not_equals': return fieldValue !== rule.value;
      case 'contains': return String(fieldValue).includes(rule.value);
      case 'greater_than': return Number(fieldValue) > Number(rule.value);
      case 'less_than': return Number(fieldValue) < Number(rule.value);
      default: return false;
    }
  }).map(rule => rule.showField);
}

export function getAutomationData() { return getStoredData(); }
export function getModuleConfig() { return getModuleData(); }
