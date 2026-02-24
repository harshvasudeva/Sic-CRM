import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronDown, ChevronUp, Award, TrendingUp, Users, DollarSign, Palette, BarChart3, HelpCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getCreatorsWithScores } from '../../stores/influencerStore';

const industries = ['Beauty', 'Tech', 'Fitness', 'Food', 'Travel', 'Comedy', 'Finance', 'Education', 'Fashion', 'Gaming'];
const audiences = ['Gen Z (18-24)', 'Millennials (25-34)', 'Young Adults (18-30)', 'Parents (30-45)', 'Professionals (25-45)'];
const budgetRanges = ['< 50K', '50K - 1L', '1L - 3L', '3L - 5L', '5L+'];
const tones = ['Casual & Fun', 'Professional', 'Inspirational', 'Educational', 'Edgy & Bold'];

function computeFitScore(brand, creator) {
  const breakdown = {};

  // Audience Match (25%) - niche alignment with target audience
  const nicheAudienceMap = {
    'Beauty': ['Gen Z (18-24)', 'Millennials (25-34)', 'Young Adults (18-30)'],
    'Tech': ['Millennials (25-34)', 'Professionals (25-45)', 'Young Adults (18-30)'],
    'Fitness': ['Gen Z (18-24)', 'Millennials (25-34)', 'Young Adults (18-30)'],
    'Food': ['Millennials (25-34)', 'Parents (30-45)', 'Young Adults (18-30)'],
    'Travel': ['Gen Z (18-24)', 'Millennials (25-34)', 'Young Adults (18-30)'],
    'Comedy': ['Gen Z (18-24)', 'Young Adults (18-30)', 'Millennials (25-34)'],
  };
  const relevantAudiences = nicheAudienceMap[creator.niche] || [];
  const audienceMatch = relevantAudiences.includes(brand.audience) ? 85 + Math.random() * 15 : 25 + Math.random() * 25;
  breakdown.audienceMatch = {
    score: Math.round(audienceMatch),
    explanation: relevantAudiences.includes(brand.audience)
      ? `${creator.niche} creators align well with ${brand.audience} audience.`
      : `${creator.niche} content typically targets a different demographic than ${brand.audience}.`,
  };

  // Niche Relevance (25%)
  const nicheIndustryMap = {
    'Beauty': ['Lifestyle', 'Fashion', 'Beauty'],
    'Tech': ['Tech', 'Gaming', 'Education'],
    'Fitness': ['Fitness', 'Lifestyle'],
    'Food': ['Food', 'Lifestyle', 'Travel'],
    'Travel': ['Travel', 'Lifestyle'],
    'Comedy': ['Comedy', 'Lifestyle'],
    'Fashion': ['Lifestyle', 'Fashion', 'Beauty'],
  };
  const relevantNiches = nicheIndustryMap[brand.industry] || [];
  const nicheScore = relevantNiches.includes(creator.niche) ? 80 + Math.random() * 20 : 20 + Math.random() * 30;
  breakdown.nicheRelevance = {
    score: Math.round(nicheScore),
    explanation: relevantNiches.includes(creator.niche)
      ? `${creator.niche} is highly relevant to the ${brand.industry} industry.`
      : `${creator.niche} has limited direct relevance to ${brand.industry}, but cross-niche campaigns can work.`,
  };

  // Budget Fit (20%)
  const budgetMap = { '< 50K': 50000, '50K - 1L': 100000, '1L - 3L': 300000, '3L - 5L': 500000, '5L+': 1000000 };
  const brandBudget = budgetMap[brand.budget] || 100000;
  const creatorRate = creator.lastQuotedRate || 50000;
  const budgetRatio = brandBudget / creatorRate;
  const budgetScore = budgetRatio >= 1 ? Math.min(90 + Math.random() * 10, 100) : Math.max(budgetRatio * 80, 10);
  breakdown.budgetFit = {
    score: Math.round(budgetScore),
    explanation: budgetRatio >= 1
      ? `Budget of ${brand.budget} comfortably covers the creator's rate.`
      : `Creator's rate may exceed the ${brand.budget} budget. Negotiation recommended.`,
  };

  // Content Style Match (15%)
  const toneCreatorMap = {
    'Casual & Fun': ['Comedy', 'Lifestyle', 'Food'],
    'Professional': ['Tech', 'Finance', 'Education'],
    'Inspirational': ['Fitness', 'Travel', 'Lifestyle'],
    'Educational': ['Tech', 'Education', 'Finance'],
    'Edgy & Bold': ['Comedy', 'Fashion'],
  };
  const toneFitNiches = toneCreatorMap[brand.tone] || [];
  const styleScore = toneFitNiches.includes(creator.niche) ? 75 + Math.random() * 25 : 30 + Math.random() * 25;
  breakdown.contentStyle = {
    score: Math.round(styleScore),
    explanation: toneFitNiches.includes(creator.niche)
      ? `${creator.name}'s content style aligns with the "${brand.tone}" brand tone.`
      : `The "${brand.tone}" tone may require some creative direction for ${creator.name}.`,
  };

  // Past Performance (15%)
  const deals = creator.dealHistory || [];
  const completed = deals.filter(d => d.status === 'Completed').length;
  const perfScore = deals.length === 0 ? 50 : Math.min((completed / deals.length) * 100, 100);
  breakdown.pastPerformance = {
    score: Math.round(perfScore),
    explanation: deals.length === 0
      ? 'No past deal data available. Score is neutral.'
      : `${completed} of ${deals.length} past deals completed successfully.`,
  };

  const total = Math.round(
    breakdown.audienceMatch.score * 0.25 +
    breakdown.nicheRelevance.score * 0.25 +
    breakdown.budgetFit.score * 0.20 +
    breakdown.contentStyle.score * 0.15 +
    breakdown.pastPerformance.score * 0.15
  );

  let recommendation = 'Weak Fit';
  let recColor = '#ef4444';
  let RecIcon = XCircle;
  if (total >= 75) { recommendation = 'Strong Fit'; recColor = '#10b981'; RecIcon = CheckCircle; }
  else if (total >= 50) { recommendation = 'Moderate Fit'; recColor = '#f59e0b'; RecIcon = AlertTriangle; }

  return { total, breakdown, recommendation, recColor, RecIcon };
}

export default function FitScoreExplainer() {
  const [creators, setCreators] = useState([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState('');
  const [brand, setBrand] = useState({ industry: 'Beauty', audience: 'Gen Z (18-24)', budget: '1L - 3L', tone: 'Casual & Fun' });
  const [fitResult, setFitResult] = useState(null);
  const [expandedFactors, setExpandedFactors] = useState({});

  useEffect(() => {
    const data = getCreatorsWithScores();
    setCreators(data);
    if (data.length > 0) setSelectedCreatorId(data[0].id);
  }, []);

  const calculateFit = () => {
    const creator = creators.find(c => c.id === selectedCreatorId);
    if (!creator) return;
    setFitResult(computeFitScore(brand, creator));
  };

  const toggleExpand = (key) => {
    setExpandedFactors(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCreator = creators.find(c => c.id === selectedCreatorId);
  const gaugeData = fitResult ? [
    { name: 'Score', value: fitResult.total },
    { name: 'Remaining', value: 100 - fitResult.total },
  ] : [];
  const gaugeColor = fitResult ? (fitResult.total >= 75 ? '#10b981' : fitResult.total >= 50 ? '#f59e0b' : '#ef4444') : '#6b7280';

  const factorIcons = {
    audienceMatch: Users,
    nicheRelevance: Target,
    budgetFit: DollarSign,
    contentStyle: Palette,
    pastPerformance: BarChart3,
  };
  const factorLabels = {
    audienceMatch: 'Audience Match',
    nicheRelevance: 'Niche Relevance',
    budgetFit: 'Budget Fit',
    contentStyle: 'Content Style Match',
    pastPerformance: 'Past Performance',
  };

  const selectStyle = {
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    color: '#fff',
    fontSize: 13,
    outline: 'none',
    flex: 1,
    minWidth: 0,
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Award size={24} color="#f59e0b" />
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Fit Score Explainer</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0' }}>
          Detailed brand-creator fit score breakdown with actionable insights.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }}
        >
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 16px 0' }}>Brand Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4, display: 'block' }}>Industry</label>
              <select value={brand.industry} onChange={e => setBrand(p => ({ ...p, industry: e.target.value }))} style={selectStyle}>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4, display: 'block' }}>Target Audience</label>
              <select value={brand.audience} onChange={e => setBrand(p => ({ ...p, audience: e.target.value }))} style={selectStyle}>
                {audiences.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4, display: 'block' }}>Budget</label>
              <select value={brand.budget} onChange={e => setBrand(p => ({ ...p, budget: e.target.value }))} style={selectStyle}>
                {budgetRanges.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4, display: 'block' }}>Brand Tone</label>
              <select value={brand.tone} onChange={e => setBrand(p => ({ ...p, tone: e.target.value }))} style={selectStyle}>
                {tones.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }}
        >
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 16px 0' }}>Select Creator</h3>
          <select
            value={selectedCreatorId}
            onChange={e => setSelectedCreatorId(e.target.value)}
            style={{ ...selectStyle, width: '100%', marginBottom: 16 }}
          >
            {creators.map(c => <option key={c.id} value={c.id}>{c.name} - {c.niche} ({c.city})</option>)}
          </select>
          {selectedCreator && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: '#94a3b8' }}>
              <div>Platform: <span style={{ color: '#fff' }}>{selectedCreator.platform}</span></div>
              <div>Followers: <span style={{ color: '#fff' }}>{(selectedCreator.followers / 1000).toFixed(0)}K</span></div>
              <div>Niche: <span style={{ color: '#fff' }}>{selectedCreator.niche}</span></div>
              <div>Rate: <span style={{ color: '#fff' }}>{selectedCreator.lastQuotedRate?.toLocaleString()}</span></div>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={calculateFit}
            style={{
              marginTop: 16, width: '100%', padding: '12px',
              background: 'linear-gradient(135deg,#f59e0b,#f97316)',
              border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Calculate Fit Score
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {fitResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, marginBottom: 24 }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 20, textAlign: 'center',
              }}>
                <h3 style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, margin: '0 0 4px 0' }}>Overall Fit Score</h3>
                <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gaugeData} dataKey="value" startAngle={220} endAngle={-40}
                        innerRadius={60} outerRadius={80} paddingAngle={0} stroke="none"
                      >
                        <Cell fill={gaugeColor} />
                        <Cell fill="rgba(255,255,255,0.06)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <span style={{ color: gaugeColor, fontSize: 36, fontWeight: 800 }}>{fitResult.total}</span>
                    <span style={{ color: '#64748b', fontSize: 12, display: 'block' }}>/100</span>
                  </div>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8,
                  padding: '6px 16px', borderRadius: 9999,
                  background: fitResult.recColor + '15', color: fitResult.recColor, fontSize: 14, fontWeight: 600,
                }}>
                  <fitResult.RecIcon size={16} />
                  {fitResult.recommendation}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(fitResult.breakdown).map(([key, val]) => {
                  const Icon = factorIcons[key] || Target;
                  const barColor = val.score >= 75 ? '#10b981' : val.score >= 50 ? '#f59e0b' : '#ef4444';
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 10, padding: '14px 16px',
                      }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                        onClick={() => toggleExpand(key)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Icon size={16} color={barColor} />
                          <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{factorLabels[key]}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ color: barColor, fontSize: 13, fontWeight: 700 }}>{val.score}</span>
                          {expandedFactors[key] ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
                        </div>
                      </div>
                      <div style={{
                        height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 10, overflow: 'hidden',
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${val.score}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{ height: '100%', background: barColor, borderRadius: 2 }}
                        />
                      </div>
                      <AnimatePresence>
                        {expandedFactors[key] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{
                              marginTop: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)',
                              borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 8,
                            }}>
                              <HelpCircle size={14} color="#64748b" style={{ marginTop: 1, flexShrink: 0 }} />
                              <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, lineHeight: 1.5 }}>{val.explanation}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
