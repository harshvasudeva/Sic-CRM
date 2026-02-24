import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Flame, Filter, Star, Users, MapPin, BarChart3, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getCreatorsWithScores } from '../../stores/influencerStore';

const trendingTopics = [
  { id: 't1', name: 'AI & Tech Reviews', growth: 42, momentum: 'rising', niches: ['Tech'], platforms: ['YouTube', 'Instagram'], relevance: 95 },
  { id: 't2', name: 'Sustainable Living', growth: 28, momentum: 'rising', niches: ['Lifestyle', 'Travel'], platforms: ['Instagram'], relevance: 82 },
  { id: 't3', name: 'Home Workout Routines', growth: 15, momentum: 'stable', niches: ['Fitness'], platforms: ['Instagram', 'YouTube'], relevance: 78 },
  { id: 't4', name: 'Street Food Reels', growth: 35, momentum: 'rising', niches: ['Food'], platforms: ['Instagram'], relevance: 90 },
  { id: 't5', name: 'Budget Travel India', growth: 22, momentum: 'rising', niches: ['Travel'], platforms: ['YouTube', 'Instagram'], relevance: 85 },
  { id: 't6', name: 'Stand-up Clips & Skits', growth: 18, momentum: 'stable', niches: ['Comedy'], platforms: ['Instagram', 'YouTube'], relevance: 76 },
  { id: 't7', name: 'Quick Recipe Shorts', growth: 31, momentum: 'rising', niches: ['Food', 'Lifestyle'], platforms: ['YouTube', 'Instagram'], relevance: 88 },
  { id: 't8', name: 'Skincare Routines', growth: -5, momentum: 'declining', niches: ['Lifestyle', 'Beauty'], platforms: ['Instagram'], relevance: 65 },
  { id: 't9', name: 'Crypto & Finance Tips', growth: 8, momentum: 'stable', niches: ['Tech', 'Finance'], platforms: ['YouTube'], relevance: 60 },
  { id: 't10', name: 'Fitness Transformation', growth: 25, momentum: 'rising', niches: ['Fitness'], platforms: ['Instagram', 'YouTube'], relevance: 83 },
];

function getMatchScore(creator, trend) {
  let score = 0;
  if (trend.niches.includes(creator.niche)) score += 50;
  if (trend.platforms.includes(creator.platform)) score += 25;
  score += Math.min((creator.creatorScore?.engagement || 0) * 0.2, 15);
  score += trend.relevance * 0.1;
  return Math.min(Math.round(score), 100);
}

const MomentumIcon = ({ momentum }) => {
  if (momentum === 'rising') return <TrendingUp size={14} color="#10b981" />;
  if (momentum === 'declining') return <TrendingDown size={14} color="#ef4444" />;
  return <Minus size={14} color="#f59e0b" />;
};

const momentumColors = { rising: '#10b981', stable: '#f59e0b', declining: '#ef4444' };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ color: '#fff', fontSize: 12, margin: 0, fontWeight: 600 }}>{payload[0].payload.name}</p>
      <p style={{ color: '#94a3b8', fontSize: 11, margin: '4px 0 0 0' }}>Growth: {payload[0].value}%</p>
    </div>
  );
};

export default function TrendAlignedSuggestions() {
  const [creators, setCreators] = useState([]);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [platformFilter, setPlatformFilter] = useState('All');
  const [matchedCreators, setMatchedCreators] = useState([]);

  useEffect(() => {
    setCreators(getCreatorsWithScores());
  }, []);

  useEffect(() => {
    if (!selectedTrend) {
      setMatchedCreators([]);
      return;
    }
    let filtered = creators;
    if (platformFilter !== 'All') {
      filtered = filtered.filter(c => c.platform === platformFilter);
    }
    const matched = filtered
      .map(c => ({ ...c, trendMatch: getMatchScore(c, selectedTrend) }))
      .filter(c => c.trendMatch > 30)
      .sort((a, b) => b.trendMatch - a.trendMatch);
    setMatchedCreators(matched);
  }, [selectedTrend, platformFilter, creators]);

  const hotTopics = trendingTopics.filter(t => t.momentum === 'rising' && t.growth >= 30).slice(0, 3);
  const chartData = trendingTopics.map(t => ({ name: t.name.length > 15 ? t.name.slice(0, 15) + '...' : t.name, growth: t.growth, fullName: t.name }));

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <TrendingUp size={24} color="#10b981" />
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Trend-Aligned Suggestions</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0' }}>
          Discover creators aligned with current trending topics.
        </p>
      </motion.div>

      {hotTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(249,115,22,0.08))',
            border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: 20, marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Flame size={18} color="#ef4444" />
            <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: 0 }}>Hot Right Now</h3>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {hotTopics.map(t => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTrend(t)}
                style={{
                  flex: 1, padding: '14px 16px',
                  background: selectedTrend?.id === t.id ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedTrend?.id === t.id ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{t.name}</span>
                  <span style={{ color: '#10b981', fontSize: 12, fontWeight: 700 }}>+{t.growth}%</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {t.niches.map(n => (
                    <span key={n} style={{ fontSize: 10, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>{n}</span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: 16, marginBottom: 16,
            }}
          >
            <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 12px 0' }}>Trend Growth</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8 }}>
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="growth" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.growth >= 30 ? '#10b981' : entry.growth >= 0 ? '#f59e0b' : '#ef4444'} fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: 16,
            }}
          >
            <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 12px 0' }}>All Trends</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {trendingTopics.map(t => (
                <motion.button
                  key={t.id}
                  whileHover={{ x: 4, background: 'rgba(255,255,255,0.08)' }}
                  onClick={() => setSelectedTrend(t)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    background: selectedTrend?.id === t.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                    border: 'none', width: '100%', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MomentumIcon momentum={t.momentum} />
                    <span style={{ color: selectedTrend?.id === t.id ? '#a78bfa' : '#e2e8f0', fontSize: 12, fontWeight: 500 }}>{t.name}</span>
                  </div>
                  <span style={{ color: momentumColors[t.momentum], fontSize: 11, fontWeight: 600 }}>
                    {t.growth > 0 ? '+' : ''}{t.growth}%
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              {selectedTrend ? (
                <div>
                  <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>
                    Creators for "{selectedTrend.name}"
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <MomentumIcon momentum={selectedTrend.momentum} />
                    <span style={{ color: momentumColors[selectedTrend.momentum], fontSize: 12, textTransform: 'capitalize' }}>
                      {selectedTrend.momentum}
                    </span>
                    <span style={{ color: '#64748b', fontSize: 12 }}>|</span>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{matchedCreators.length} matches</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Select a trend to see matched creators</p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={14} color="#64748b" />
              <select
                value={platformFilter}
                onChange={e => setPlatformFilter(e.target.value)}
                style={{
                  padding: '6px 12px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6,
                  color: '#fff', fontSize: 12, outline: 'none',
                }}
              >
                <option value="All">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {matchedCreators.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}
              >
                {matchedCreators.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12, padding: 16, position: 'relative',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      background: c.trendMatch >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: c.trendMatch >= 70 ? '#10b981' : '#f59e0b',
                      padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Zap size={10} /> {c.trendMatch}%
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#10b981,#059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 14,
                      }}>{c.name.charAt(0)}</div>
                      <div>
                        <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{c.name}</h4>
                        <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>{c.handle}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11, color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={10} color="#f59e0b" /> {c.niche}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {c.city}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={10} /> {(c.followers / 1000).toFixed(0)}K</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><BarChart3 size={10} /> Score: {c.creatorScore?.total || 0}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : selectedTrend ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: 48, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Users size={36} color="#334155" />
                <p style={{ color: '#64748b', fontSize: 13, marginTop: 10 }}>No matching creators found for this trend and filter.</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
