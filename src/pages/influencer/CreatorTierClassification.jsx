import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Users, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, BarChart3, Star, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getCreatorsWithScores, getCreatorTier, getCreatorTierLabel, getCreatorTierColor } from '../../stores/influencerStore';

const tierDefs = [
  { key: 'nano', label: 'Nano', range: '<10K', min: 0, max: 10000, color: '#6b7280', icon: Users },
  { key: 'micro', label: 'Micro', range: '10K-100K', min: 10000, max: 100000, color: '#3b82f6', icon: Users },
  { key: 'mid', label: 'Mid', range: '100K-500K', min: 100000, max: 500000, color: '#8b5cf6', icon: Users },
  { key: 'macro', label: 'Macro', range: '500K-1M', min: 500000, max: 1000000, color: '#f59e0b', icon: Users },
  { key: 'mega', label: 'Mega', range: '1M+', min: 1000000, max: Infinity, color: '#ef4444', icon: Star },
];

function classifyTier(followers) {
  for (const t of tierDefs) {
    if (followers >= t.min && followers < t.max) return t.key;
  }
  return 'mega';
}

function getTierDef(key) {
  return tierDefs.find(t => t.key === key) || tierDefs[0];
}

const trendData = [
  { month: 'Sep', nano: 1, micro: 2, mid: 1, macro: 1, mega: 1 },
  { month: 'Oct', nano: 1, micro: 2, mid: 2, macro: 1, mega: 1 },
  { month: 'Nov', nano: 1, micro: 2, mid: 2, macro: 1, mega: 1 },
  { month: 'Dec', nano: 1, micro: 2, mid: 2, macro: 2, mega: 1 },
  { month: 'Jan', nano: 1, micro: 2, mid: 3, macro: 2, mega: 1 },
  { month: 'Feb', nano: 1, micro: 2, mid: 3, macro: 2, mega: 1 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ color: '#fff', fontSize: 12, margin: '0 0 4px 0', fontWeight: 600 }}>{label || payload[0]?.name}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#94a3b8', fontSize: 11, margin: '2px 0' }}>
          {p.name || p.dataKey}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function CreatorTierClassification() {
  const [creators, setCreators] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [tierStats, setTierStats] = useState({});
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const data = getCreatorsWithScores();
    setCreators(data);

    const stats = {};
    for (const td of tierDefs) {
      const members = data.filter(c => classifyTier(c.followers) === td.key);
      const avgEng = members.length > 0
        ? Math.round(members.reduce((s, c) => s + (c.creatorScore?.engagement || 0), 0) / members.length)
        : 0;
      const avgCost = members.length > 0
        ? Math.round(members.reduce((s, c) => s + (c.lastQuotedRate || 0), 0) / members.length)
        : 0;
      const avgScore = members.length > 0
        ? Math.round(members.reduce((s, c) => s + (c.creatorScore?.total || 0), 0) / members.length)
        : 0;
      stats[td.key] = { count: members.length, members, avgEng, avgCost, avgScore };
    }
    setTierStats(stats);

    const pie = tierDefs.map(td => ({
      name: td.label,
      value: stats[td.key]?.count || 0,
      color: td.color,
    })).filter(p => p.value > 0);
    setPieData(pie);
  }, []);

  const reclassAlerts = creators.filter(c => {
    const tier = classifyTier(c.followers);
    const storeTier = c.creatorTier;
    return tier !== storeTier;
  });

  const selectedMembers = selectedTier ? (tierStats[selectedTier]?.members || []) : [];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Layers size={24} color="#8b5cf6" />
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Creator Tier Classification</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0' }}>
          Auto-classify and visualize creators by follower tier.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {tierDefs.map((td, i) => {
          const stat = tierStats[td.key] || { count: 0, avgEng: 0, avgCost: 0 };
          const isSelected = selectedTier === td.key;
          return (
            <motion.div
              key={td.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTier(isSelected ? null : td.key)}
              style={{
                background: isSelected ? `${td.color}15` : 'rgba(255,255,255,0.05)',
                border: `2px solid ${isSelected ? td.color : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, padding: 16, cursor: 'pointer', textAlign: 'center',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, margin: '0 auto 10px',
                background: td.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <td.icon size={18} color={td.color} />
              </div>
              <h3 style={{ color: td.color, fontSize: 15, fontWeight: 700, margin: '0 0 2px 0' }}>{td.label}</h3>
              <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 8px 0' }}>{td.range}</p>
              <span style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{stat.count}</span>
              <p style={{ color: '#64748b', fontSize: 10, margin: '2px 0 0 0' }}>creators</p>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 20,
          }}
        >
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 12px 0' }}>Tier Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                stroke="none"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            {pieData.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                {p.name}: {p.value}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 20,
          }}
        >
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 12px 0' }}>Tier Comparison</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
            <div style={{ color: '#64748b', fontSize: 10, fontWeight: 600 }}>Tier</div>
            <div style={{ color: '#64748b', fontSize: 10, fontWeight: 600, textAlign: 'center' }}>Avg Eng</div>
            <div style={{ color: '#64748b', fontSize: 10, fontWeight: 600, textAlign: 'center' }}>Avg Cost</div>
            <div style={{ color: '#64748b', fontSize: 10, fontWeight: 600, textAlign: 'center' }}>Avg Score</div>
          </div>
          {tierDefs.map(td => {
            const stat = tierStats[td.key] || { avgEng: 0, avgCost: 0, avgScore: 0 };
            return (
              <div key={td.key} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6,
                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: td.color }} />
                  <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500 }}>{td.label}</span>
                </div>
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>{stat.avgEng}%</div>
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>{stat.avgCost > 0 ? `${(stat.avgCost / 1000).toFixed(0)}K` : '-'}</div>
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>{stat.avgScore}</div>
              </div>
            );
          })}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: 20, marginBottom: 24,
        }}
      >
        <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 12px 0' }}>Tier Trend Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {tierDefs.map(td => (
              <Line key={td.key} type="monotone" dataKey={td.key} stroke={td.color} strokeWidth={2} dot={{ r: 3, fill: td.color }} name={td.label} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {reclassAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: 12, padding: 20, marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertCircle size={16} color="#f59e0b" />
            <h3 style={{ color: '#f59e0b', fontSize: 14, fontWeight: 600, margin: 0 }}>Reclassification Alerts</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reclassAlerts.map(c => {
              const currentTier = classifyTier(c.followers);
              const prevTier = c.creatorTier;
              const moving = tierDefs.findIndex(t => t.key === currentTier) > tierDefs.findIndex(t => t.key === prevTier);
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                    <span style={{ color: '#64748b', fontSize: 11 }}>({(c.followers / 1000).toFixed(0)}K)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: getTierDef(prevTier).color, fontSize: 11, fontWeight: 600 }}>{getTierDef(prevTier).label}</span>
                    {moving ? <ArrowUpRight size={14} color="#10b981" /> : <ArrowDownRight size={14} color="#ef4444" />}
                    <span style={{ color: getTierDef(currentTier).color, fontSize: 11, fontWeight: 600 }}>{getTierDef(currentTier).label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedTier && selectedMembers.length > 0 && (
          <motion.div
            key={selectedTier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 16px 0' }}>
              <span style={{ color: getTierDef(selectedTier).color }}>{getTierDef(selectedTier).label}</span> Creators ({selectedMembers.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {selectedMembers.map((c, i) => {
                const td = getTierDef(selectedTier);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${td.color}30`,
                      borderLeft: `3px solid ${td.color}`,
                      borderRadius: 10, padding: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${td.color}, ${td.color}88)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 13,
                      }}>{c.name.charAt(0)}</div>
                      <div>
                        <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{c.name}</h4>
                        <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>{c.handle}</p>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11, color: '#94a3b8' }}>
                      <div><Users size={10} style={{ verticalAlign: -1, marginRight: 4 }} />{(c.followers / 1000).toFixed(0)}K followers</div>
                      <div><BarChart3 size={10} style={{ verticalAlign: -1, marginRight: 4 }} />Score: {c.creatorScore?.total || 0}</div>
                      <div><DollarSign size={10} style={{ verticalAlign: -1, marginRight: 4 }} />Rate: {c.lastQuotedRate ? `${(c.lastQuotedRate / 1000).toFixed(0)}K` : 'N/A'}</div>
                      <div><TrendingUp size={10} style={{ verticalAlign: -1, marginRight: 4 }} />Eng: {c.creatorScore?.engagement || 0}%</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
