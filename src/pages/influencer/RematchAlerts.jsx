import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Eye, Star, Users, MapPin, TrendingUp, Settings, Clock, ChevronDown, Zap, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getCreatorsWithScores } from '../../stores/influencerStore';

const ALERTS_KEY = 'sic-rematch-alerts';
const PREFS_KEY = 'sic-rematch-prefs';

function generateAlerts(creators, brandProfile) {
  const now = Date.now();
  return creators
    .map(c => {
      let matchScore = 0;
      if (c.niche === brandProfile.niche) matchScore += 30;
      if (c.city === brandProfile.preferredCity) matchScore += 15;
      const engScore = Math.min((c.creatorScore?.engagement || 0) * 0.5, 25);
      matchScore += engScore;
      const reliScore = Math.min((c.creatorScore?.reliability || 0) * 0.3, 20);
      matchScore += reliScore;
      if (c.lastQuotedRate && c.lastQuotedRate <= brandProfile.maxBudget) matchScore += 10;
      return {
        ...c,
        alertMatchScore: Math.min(Math.round(matchScore), 100),
        improvementVsPrevious: Math.round(Math.random() * 25 + 5),
        alertDate: new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        alertId: `alert-${c.id}-${now}`,
      };
    })
    .filter(c => c.alertMatchScore >= 40)
    .sort((a, b) => b.alertMatchScore - a.alertMatchScore)
    .slice(0, 8);
}

export default function RematchAlerts() {
  const [creators, setCreators] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [prefs, setPrefs] = useState({
    frequency: 'Daily',
    minScore: 50,
  });
  const [brandProfile] = useState({
    name: 'Sic Agency',
    industry: 'Marketing',
    niche: 'Lifestyle',
    preferredCity: 'Mumbai',
    maxBudget: 150000,
    targetAudience: 'Millennials',
  });
  const [pastAlerts] = useState([
    { id: 'past-1', creatorName: 'Neha Shah', score: 78, date: '2026-02-10', action: 'Accepted' },
    { id: 'past-2', creatorName: 'Ravi Patel', score: 62, date: '2026-02-08', action: 'Dismissed' },
    { id: 'past-3', creatorName: 'Simran Kaur', score: 85, date: '2026-02-05', action: 'Watchlist' },
    { id: 'past-4', creatorName: 'Vishal Kumar', score: 55, date: '2026-01-28', action: 'Dismissed' },
  ]);

  useEffect(() => {
    const data = getCreatorsWithScores();
    setCreators(data);
    const generated = generateAlerts(data, brandProfile);
    setAlerts(generated);
  }, []);

  const activeAlerts = alerts.filter(
    a => !dismissed.includes(a.alertId) && !accepted.includes(a.alertId) && a.alertMatchScore >= prefs.minScore
  );

  const handleAccept = (alertId) => {
    setAccepted(prev => [...prev, alertId]);
  };

  const handleDismiss = (alertId) => {
    setDismissed(prev => [...prev, alertId]);
  };

  const handleWatchlist = (alertId) => {
    setWatchlist(prev => prev.includes(alertId) ? prev.filter(w => w !== alertId) : [...prev, alertId]);
  };

  const chartData = activeAlerts.slice(0, 6).map(a => ({
    name: a.name.split(' ')[0],
    score: a.alertMatchScore,
    color: a.alertMatchScore >= 70 ? '#10b981' : a.alertMatchScore >= 50 ? '#f59e0b' : '#6b7280',
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
        <p style={{ color: '#fff', fontSize: 12, margin: 0 }}>{payload[0].payload.name}</p>
        <p style={{ color: '#94a3b8', fontSize: 11, margin: '2px 0 0 0' }}>Match: {payload[0].value}%</p>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={24} color="#f59e0b" />
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Rematch Alerts</h1>
            {activeAlerts.length > 0 && (
              <span style={{
                background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: 9999,
                fontSize: 11, fontWeight: 700,
              }}>{activeAlerts.length} new</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowHistory(!showHistory)}
              style={{
                padding: '8px 14px', background: showHistory ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${showHistory ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 8, color: showHistory ? '#a78bfa' : '#94a3b8', fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Clock size={12} /> History
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowSettings(!showSettings)}
              style={{
                padding: '8px 14px', background: showSettings ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${showSettings ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 8, color: showSettings ? '#a78bfa' : '#94a3b8', fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Settings size={12} /> Preferences
            </motion.button>
          </div>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0' }}>
          Get notified when better-fit creators become available for your brand.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))',
          border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: 18, marginBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 4px 0' }}>Brand Profile: {brandProfile.name}</h3>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8' }}>
            <span>Industry: {brandProfile.industry}</span>
            <span>Niche: {brandProfile.niche}</span>
            <span>City: {brandProfile.preferredCity}</span>
            <span>Budget: {(brandProfile.maxBudget / 1000).toFixed(0)}K</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={14} color="#f59e0b" />
          <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>Monitoring active</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 24 }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: 20,
            }}>
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 16px 0' }}>Alert Preferences</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 6 }}>Alert Frequency</label>
                  <select
                    value={prefs.frequency}
                    onChange={e => setPrefs(p => ({ ...p, frequency: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#fff', fontSize: 12, outline: 'none',
                    }}
                  >
                    <option value="Real-time">Real-time</option>
                    <option value="Daily">Daily Digest</option>
                    <option value="Weekly">Weekly Summary</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 6 }}>
                    Minimum Match Score: <span style={{ color: '#fff', fontWeight: 600 }}>{prefs.minScore}%</span>
                  </label>
                  <input
                    type="range" min={20} max={90} value={prefs.minScore}
                    onChange={e => setPrefs(p => ({ ...p, minScore: parseInt(e.target.value) }))}
                    style={{ width: '100%', accentColor: '#6366f1' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 24 }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: 20,
            }}>
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 12px 0' }}>Past Alerts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pastAlerts.map(a => {
                  const actionColors = { Accepted: '#10b981', Dismissed: '#ef4444', Watchlist: '#f59e0b' };
                  return (
                    <div key={a.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{a.creatorName}</span>
                        <span style={{ color: '#64748b', fontSize: 11 }}>{a.date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#94a3b8', fontSize: 11 }}>Score: {a.score}%</span>
                        <span style={{
                          padding: '2px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 600,
                          background: actionColors[a.action] + '18', color: actionColors[a.action],
                        }}>{a.action}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 20, marginBottom: 24,
          }}
        >
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 12px 0' }}>New Match Scores</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        <AnimatePresence>
          {activeAlerts.map((alert, i) => (
            <motion.div
              key={alert.alertId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 18, position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, right: 0,
                background: alert.alertMatchScore >= 70 ? '#10b981' : alert.alertMatchScore >= 50 ? '#f59e0b' : '#6b7280',
                color: '#fff', padding: '4px 12px', borderRadius: '0 12px 0 12px',
                fontSize: 12, fontWeight: 700,
              }}>
                {alert.alertMatchScore}% fit
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#f59e0b,#f97316)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 15,
                }}>{alert.name.charAt(0)}</div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{alert.name}</h4>
                  <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>{alert.handle}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10, fontSize: 11, color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={10} color="#f59e0b" /> {alert.niche}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {alert.city}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={10} /> {(alert.followers / 1000).toFixed(0)}K</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><BarChart3 size={10} /> Score: {alert.creatorScore?.total || 0}</span>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
                padding: '6px 10px', background: 'rgba(16,185,129,0.08)', borderRadius: 6,
              }}>
                <TrendingUp size={12} color="#10b981" />
                <span style={{ color: '#10b981', fontSize: 11, fontWeight: 600 }}>
                  +{alert.improvementVsPrevious}% improvement vs previous best match
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleAccept(alert.alertId)}
                  style={{
                    flex: 1, padding: '8px 0', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: 8, cursor: 'pointer', color: '#10b981', fontSize: 11, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Check size={12} /> Accept
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleDismiss(alert.alertId)}
                  style={{
                    flex: 1, padding: '8px 0', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, cursor: 'pointer', color: '#ef4444', fontSize: 11, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <X size={12} /> Dismiss
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleWatchlist(alert.alertId)}
                  style={{
                    flex: 1, padding: '8px 0',
                    background: watchlist.includes(alert.alertId) ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${watchlist.includes(alert.alertId) ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8, cursor: 'pointer',
                    color: watchlist.includes(alert.alertId) ? '#f59e0b' : '#94a3b8',
                    fontSize: 11, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Eye size={12} /> {watchlist.includes(alert.alertId) ? 'Watching' : 'Watchlist'}
                </motion.button>
              </div>

              <p style={{ color: '#64748b', fontSize: 10, margin: '8px 0 0 0', textAlign: 'right' }}>
                Alert: {alert.alertDate}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {activeAlerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            textAlign: 'center', padding: 48, background: 'rgba(255,255,255,0.03)',
            borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Bell size={40} color="#334155" />
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 12 }}>No new match alerts. All caught up!</p>
        </motion.div>
      )}
    </div>
  );
}
