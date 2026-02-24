import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Eye, ShoppingCart, MessageCircle, Video, Download, Plus, Users, DollarSign, BarChart3, Star, ChevronRight, Edit3, Check, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getCreatorsWithScores } from '../../stores/influencerStore';

const goalTemplates = [
  {
    id: 'awareness',
    name: 'Awareness',
    icon: Eye,
    color: '#3b82f6',
    description: 'Maximize brand visibility and reach new audiences',
    recommendedTier: ['macro', 'mega'],
    budgetRange: '3L - 10L',
    idealFormat: ['Reels', 'YouTube Videos', 'Stories'],
    kpis: ['Reach', 'Impressions', 'Brand Mentions', 'Share of Voice'],
    creatorCount: '2-5 macro/mega creators',
    duration: '4-6 weeks',
  },
  {
    id: 'conversions',
    name: 'Conversions',
    icon: ShoppingCart,
    color: '#10b981',
    description: 'Drive direct sales and measurable revenue',
    recommendedTier: ['micro', 'macro'],
    budgetRange: '1L - 5L',
    idealFormat: ['Product Reviews', 'How-to Reels', 'Swipe-up Stories'],
    kpis: ['Click-through Rate', 'Conversion Rate', 'Revenue Generated', 'ROAS'],
    creatorCount: '5-10 micro creators + 2 macro',
    duration: '2-4 weeks',
  },
  {
    id: 'engagement',
    name: 'Engagement',
    icon: MessageCircle,
    color: '#8b5cf6',
    description: 'Build community and foster meaningful interactions',
    recommendedTier: ['micro', 'nano'],
    budgetRange: '50K - 2L',
    idealFormat: ['Polls', 'Q&A Stories', 'Comment-driving Reels', 'Lives'],
    kpis: ['Engagement Rate', 'Comments', 'Saves', 'DMs Generated'],
    creatorCount: '8-15 micro/nano creators',
    duration: '3-4 weeks',
  },
  {
    id: 'ugc',
    name: 'UGC',
    icon: Video,
    color: '#f59e0b',
    description: 'Generate authentic user-generated content for brand use',
    recommendedTier: ['nano', 'micro'],
    budgetRange: '30K - 1.5L',
    idealFormat: ['Testimonials', 'Unboxing', 'Day-in-life', 'Before/After'],
    kpis: ['Content Pieces', 'Authenticity Score', 'Repurpose Rate', 'Cost per Asset'],
    creatorCount: '10-20 nano/micro creators',
    duration: '2-3 weeks',
  },
  {
    id: 'downloads',
    name: 'App Downloads',
    icon: Download,
    color: '#ef4444',
    description: 'Drive app installs with compelling demo content',
    recommendedTier: ['micro', 'macro'],
    budgetRange: '2L - 8L',
    idealFormat: ['App Demo Reels', 'Feature Walkthrough', 'Challenge Videos'],
    kpis: ['Install Rate', 'Cost per Install', 'Day-1 Retention', 'App Store Ranking'],
    creatorCount: '5-8 mixed tier creators',
    duration: '3-5 weeks',
  },
];

const tierColors = { nano: '#6b7280', micro: '#3b82f6', macro: '#8b5cf6', mega: '#f59e0b' };

function getMatchedCreators(goal, allCreators) {
  return allCreators
    .filter(c => goal.recommendedTier.includes(c.creatorTier))
    .sort((a, b) => (b.creatorScore?.total || 0) - (a.creatorScore?.total || 0))
    .slice(0, 6);
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ color: '#fff', fontSize: 12, margin: 0 }}>{payload[0].payload.name}</p>
      <p style={{ color: '#94a3b8', fontSize: 11, margin: '2px 0 0 0' }}>Score: {payload[0].value}</p>
    </div>
  );
};

export default function GoalTemplates() {
  const [creators, setCreators] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [matchedCreators, setMatchedCreators] = useState([]);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customGoal, setCustomGoal] = useState({ name: '', description: '', recommendedTier: ['micro'], budgetRange: '', idealFormat: '', kpis: '' });

  useEffect(() => {
    setCreators(getCreatorsWithScores());
  }, []);

  useEffect(() => {
    if (selectedGoal) {
      setMatchedCreators(getMatchedCreators(selectedGoal, creators));
    }
  }, [selectedGoal, creators]);

  const comparisonData = goalTemplates.map(g => ({
    name: g.name,
    creators: getMatchedCreators(g, creators).length,
    color: g.color,
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Target size={24} color="#6366f1" />
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Goal Templates</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowCustomBuilder(!showCustomBuilder)}
            style={{
              padding: '8px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, color: '#94a3b8', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Plus size={14} /> Custom Goal
          </motion.button>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0' }}>
          Select a campaign goal to see recommended creator profiles and KPIs.
        </p>
      </motion.div>

      <AnimatePresence>
        {showCustomBuilder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 24 }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: 20,
            }}>
              <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 16px 0' }}>Custom Goal Builder</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Goal Name', key: 'name', placeholder: 'e.g., Brand Loyalty' },
                  { label: 'Budget Range', key: 'budgetRange', placeholder: 'e.g., 2L - 5L' },
                  { label: 'Description', key: 'description', placeholder: 'Brief goal description' },
                  { label: 'Ideal Formats (comma-separated)', key: 'idealFormat', placeholder: 'e.g., Reels, Stories' },
                  { label: 'KPIs (comma-separated)', key: 'kpis', placeholder: 'e.g., Retention Rate, NPS' },
                ].map(field => (
                  <div key={field.key} style={{ gridColumn: field.key === 'kpis' ? '1 / -1' : 'auto' }}>
                    <label style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 4 }}>{field.label}</label>
                    <input
                      value={customGoal[field.key]}
                      onChange={e => setCustomGoal(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#fff', fontSize: 12, outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14, marginBottom: 24 }}>
        {goalTemplates.map((goal, i) => {
          const Icon = goal.icon;
          const isSelected = selectedGoal?.id === goal.id;
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedGoal(goal)}
              style={{
                background: isSelected ? `${goal.color}15` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isSelected ? goal.color + '40' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12,
                padding: 18,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: goal.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              }}>
                <Icon size={20} color={goal.color} />
              </div>
              <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 6px 0' }}>{goal.name}</h3>
              <p style={{ color: '#94a3b8', fontSize: 11, margin: '0 0 12px 0', lineHeight: 1.4 }}>{goal.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {goal.recommendedTier.map(t => (
                  <span key={t} style={{
                    padding: '2px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 600,
                    background: tierColors[t] + '22', color: tierColors[t], textTransform: 'capitalize',
                  }}>{t}</span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedGoal && (
          <motion.div
            key={selectedGoal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 20,
              }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 16px 0' }}>
                  {selectedGoal.name} - Details
                </h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { icon: Users, label: 'Creator Count', value: selectedGoal.creatorCount },
                    { icon: DollarSign, label: 'Budget Range', value: selectedGoal.budgetRange },
                    { icon: BarChart3, label: 'Duration', value: selectedGoal.duration },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <item.icon size={14} color={selectedGoal.color} />
                      <span style={{ color: '#94a3b8', fontSize: 12, minWidth: 100 }}>{item.label}:</span>
                      <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>{item.value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <span style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>Ideal Content Formats:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedGoal.idealFormat.map(f => (
                        <span key={f} style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 11,
                          background: selectedGoal.color + '15', color: selectedGoal.color,
                        }}>{f}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>KPIs to Track:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {selectedGoal.kpis.map(k => (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0', fontSize: 12 }}>
                          <ChevronRight size={10} color={selectedGoal.color} /> {k}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 20,
              }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 16px 0' }}>
                  Matched Creators ({matchedCreators.length})
                </h3>
                {matchedCreators.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: 13 }}>No creators match the recommended tiers for this goal.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {matchedCreators.map(c => (
                      <div key={c.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${selectedGoal.color}, ${selectedGoal.color}88)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 13,
                          }}>{c.name.charAt(0)}</div>
                          <div>
                            <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, margin: 0 }}>{c.name}</p>
                            <p style={{ color: '#64748b', fontSize: 10, margin: 0 }}>{c.niche} | {(c.followers / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 600,
                            background: tierColors[c.creatorTier] + '22', color: tierColors[c.creatorTier], textTransform: 'capitalize',
                          }}>{c.creatorTier}</span>
                          <Star size={12} color="#f59e0b" />
                          <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 600 }}>{c.creatorScore?.total || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: 20,
            }}>
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 12px 0' }}>Goal Comparison - Available Creators</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={comparisonData}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="creators" radius={[4, 4, 0, 0]}>
                    {comparisonData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
