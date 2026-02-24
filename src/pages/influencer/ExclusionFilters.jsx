import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, X, AlertTriangle, CheckCircle, Ban, Save, Trash2, Users, Building2, Eye, EyeOff } from 'lucide-react';
import { getCreators } from '../../stores/influencerStore';

const RULES_KEY = 'sic-exclusion-rules';

function getSavedRules() {
  const saved = localStorage.getItem(RULES_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveRules(rules) {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

function getConflictSeverity(matchCount, totalBrands) {
  if (matchCount >= 3) return { level: 'High', color: '#ef4444', icon: AlertTriangle };
  if (matchCount >= 2) return { level: 'Medium', color: '#f59e0b', icon: AlertTriangle };
  return { level: 'Low', color: '#3b82f6', icon: Shield };
}

export default function ExclusionFilters() {
  const [creators, setCreators] = useState([]);
  const [competitorInput, setCompetitorInput] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [exclusions, setExclusions] = useState({});
  const [savedRules, setSavedRules] = useState([]);
  const [ruleName, setRuleName] = useState('');
  const [showCleanOnly, setShowCleanOnly] = useState(false);

  useEffect(() => {
    setCreators(getCreators());
    setSavedRules(getSavedRules());
  }, []);

  const addCompetitor = () => {
    const brand = competitorInput.trim();
    if (!brand || competitors.includes(brand)) return;
    setCompetitors(prev => [...prev, brand]);
    setCompetitorInput('');
  };

  const removeCompetitor = (brand) => {
    setCompetitors(prev => prev.filter(b => b !== brand));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addCompetitor();
  };

  const getConflictingCreators = () => {
    if (competitors.length === 0) return [];
    return creators.map(c => {
      const brands = c.brandsWorkedWith || [];
      const matches = brands.filter(b =>
        competitors.some(comp => b.toLowerCase().includes(comp.toLowerCase()))
      );
      return {
        ...c,
        conflictBrands: matches,
        hasConflict: matches.length > 0,
        severity: getConflictSeverity(matches.length, competitors.length),
      };
    });
  };

  const conflictData = getConflictingCreators();
  const conflicting = conflictData.filter(c => c.hasConflict);
  const clean = conflictData.filter(c => !c.hasConflict);

  const toggleExclusion = (id) => {
    setExclusions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const saveRule = () => {
    if (!ruleName.trim() || competitors.length === 0) return;
    const rule = {
      id: `rule-${Date.now()}`,
      name: ruleName.trim(),
      competitors: [...competitors],
      excludedCreators: Object.entries(exclusions).filter(([, v]) => v).map(([k]) => k),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [...savedRules, rule];
    setSavedRules(updated);
    saveRules(updated);
    setRuleName('');
  };

  const deleteRule = (id) => {
    const updated = savedRules.filter(r => r.id !== id);
    setSavedRules(updated);
    saveRules(updated);
  };

  const loadRule = (rule) => {
    setCompetitors(rule.competitors);
    const exc = {};
    rule.excludedCreators.forEach(id => { exc[id] = true; });
    setExclusions(exc);
  };

  const displayList = showCleanOnly ? clean : conflictData;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Shield size={24} color="#ef4444" />
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Exclusion Filters</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0' }}>
          Exclude creators who have previously worked with competitor brands.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 20,
          }}
        >
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 16px 0' }}>
            <Building2 size={14} style={{ marginRight: 8, verticalAlign: -2 }} />
            Competitor Brands
          </h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              value={competitorInput}
              onChange={e => setCompetitorInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter competitor brand name"
              style={{
                flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
                color: '#fff', fontSize: 13, outline: 'none',
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={addCompetitor}
              style={{
                padding: '10px 16px', background: '#ef4444', border: 'none',
                borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Plus size={14} /> Add
            </motion.button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <AnimatePresence>
              {competitors.map(brand => (
                <motion.span
                  key={brand}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 9999,
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                    color: '#ef4444', fontSize: 12, fontWeight: 500,
                  }}
                >
                  {brand}
                  <button
                    onClick={() => removeCompetitor(brand)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    <X size={12} color="#ef4444" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            {competitors.length === 0 && (
              <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>No competitors added yet.</p>
            )}
          </div>

          {competitors.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ color: '#94a3b8' }}>Conflicts: <span style={{ color: '#fff', fontWeight: 600 }}>{conflicting.length}</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ color: '#94a3b8' }}>Clean: <span style={{ color: '#fff', fontWeight: 600 }}>{clean.length}</span></span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 20,
          }}
        >
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 16px 0' }}>
            <Save size={14} style={{ marginRight: 8, verticalAlign: -2 }} />
            Saved Exclusion Rules
          </h3>

          {competitors.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                value={ruleName}
                onChange={e => setRuleName(e.target.value)}
                placeholder="Rule name (e.g., Q1 Campaign)"
                style={{
                  flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6,
                  color: '#fff', fontSize: 12, outline: 'none',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={saveRule}
                style={{
                  padding: '8px 14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 6, color: '#10b981', fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Save size={12} /> Save
              </motion.button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {savedRules.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>No saved rules yet. Add competitors and save a rule.</p>
            ) : savedRules.map(rule => (
              <div key={rule.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
              }}>
                <div>
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, margin: 0 }}>{rule.name}</p>
                  <p style={{ color: '#64748b', fontSize: 10, margin: '2px 0 0 0' }}>
                    {rule.competitors.length} brands | {rule.excludedCreators.length} excluded | {rule.createdAt}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => loadRule(rule)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    <Eye size={14} color="#3b82f6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => deleteRule(rule.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {competitors.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>
              {showCleanOnly ? 'Clean List' : 'All Creators'}
              <span style={{ color: '#64748b', fontSize: 13, fontWeight: 400, marginLeft: 8 }}>({displayList.length})</span>
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowCleanOnly(!showCleanOnly)}
              style={{
                padding: '8px 16px',
                background: showCleanOnly ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${showCleanOnly ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 8, color: showCleanOnly ? '#10b981' : '#94a3b8',
                fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {showCleanOnly ? <EyeOff size={12} /> : <CheckCircle size={12} />}
              {showCleanOnly ? 'Show All' : 'Show Clean Only'}
            </motion.button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {displayList.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: c.hasConflict
                    ? exclusions[c.id] ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.05)'
                    : 'rgba(16,185,129,0.04)',
                  border: `1px solid ${c.hasConflict
                    ? exclusions[c.id] ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)'
                    : 'rgba(16,185,129,0.15)'}`,
                  borderRadius: 12, padding: 16, position: 'relative',
                  opacity: exclusions[c.id] ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {exclusions[c.id] && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239,68,68,0.03) 10px, rgba(239,68,68,0.03) 20px)',
                    borderRadius: 12, pointerEvents: 'none',
                  }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: c.hasConflict ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#10b981,#059669)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 13,
                    }}>{c.name.charAt(0)}</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{c.name}</h4>
                      <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>{c.niche} | {c.city}</p>
                    </div>
                  </div>

                  {c.hasConflict && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 600,
                        background: c.severity.color + '18', color: c.severity.color,
                      }}>{c.severity.level}</span>
                    </div>
                  )}
                </div>

                {c.hasConflict && (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ color: '#94a3b8', fontSize: 11, margin: '0 0 6px 0' }}>Worked with:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {c.conflictBrands.map(b => (
                        <span key={b} style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: 10,
                          background: 'rgba(239,68,68,0.1)', color: '#f87171',
                        }}>{b}</span>
                      ))}
                    </div>
                  </div>
                )}

                {!c.hasConflict && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <CheckCircle size={12} color="#10b981" />
                    <span style={{ color: '#10b981', fontSize: 11, fontWeight: 500 }}>No competitor conflicts</span>
                  </div>
                )}

                {c.hasConflict && (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => toggleExclusion(c.id)}
                    style={{
                      width: '100%', padding: '8px 0',
                      background: exclusions[c.id] ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${exclusions[c.id] ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      borderRadius: 8, cursor: 'pointer',
                      color: exclusions[c.id] ? '#10b981' : '#ef4444',
                      fontSize: 11, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    {exclusions[c.id] ? <><CheckCircle size={12} /> Include</> : <><Ban size={12} /> Exclude</>}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {competitors.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: 48, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Shield size={40} color="#334155" />
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 12 }}>Add competitor brands to see which creators have conflicts.</p>
        </motion.div>
      )}
    </div>
  );
}
