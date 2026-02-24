import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, Target, BarChart3, MapPin, ChevronDown, Star, Plus } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { getCreatorsWithScores } from '../../stores/influencerStore';

function calculateSimilarity(ref, candidate) {
  const factors = {};
  factors.niche = ref.niche === candidate.niche ? 100 : 20;
  const followerRatio = Math.min(ref.followers, candidate.followers) / Math.max(ref.followers, candidate.followers);
  factors.followerRange = Math.round(followerRatio * 100);
  const refEng = ref.creatorScore?.engagement || 0;
  const candEng = candidate.creatorScore?.engagement || 0;
  factors.engagementRate = 100 - Math.min(Math.abs(refEng - candEng), 100);
  factors.city = ref.city === candidate.city ? 100 : 30;
  factors.contentStyle = ref.platform === candidate.platform ? 80 : 40;
  const refBrands = new Set(ref.brandsWorkedWith || []);
  const candBrands = new Set(candidate.brandsWorkedWith || []);
  let overlap = 0;
  for (const b of candBrands) { if (refBrands.has(b)) overlap++; }
  factors.brandOverlap = refBrands.size > 0 ? Math.round((overlap / refBrands.size) * 100) : 50;

  const weights = { niche: 0.3, followerRange: 0.2, engagementRate: 0.2, city: 0.1, contentStyle: 0.1, brandOverlap: 0.1 };
  const total = Math.round(
    factors.niche * weights.niche +
    factors.followerRange * weights.followerRange +
    factors.engagementRate * weights.engagementRate +
    factors.city * weights.city +
    factors.contentStyle * weights.contentStyle +
    factors.brandOverlap * weights.brandOverlap
  );

  return { total, factors };
}

export default function LookalikeDiscovery() {
  const [creators, setCreators] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [results, setResults] = useState([]);
  const [compareId, setCompareId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const data = getCreatorsWithScores();
    setCreators(data);
    if (data.length > 0) setSelectedId(data[0].id);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const ref = creators.find(c => c.id === selectedId);
    if (!ref) return;
    const similar = creators
      .filter(c => c.id !== selectedId)
      .map(c => {
        const sim = calculateSimilarity(ref, c);
        return { ...c, similarity: sim };
      })
      .sort((a, b) => b.similarity.total - a.similarity.total);
    setResults(similar);
    setCompareId(null);
  }, [selectedId, creators]);

  const reference = creators.find(c => c.id === selectedId);
  const compared = compareId ? results.find(r => r.id === compareId) : null;

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const radarData = compared ? [
    { factor: 'Niche', value: compared.similarity.factors.niche },
    { factor: 'Followers', value: compared.similarity.factors.followerRange },
    { factor: 'Engagement', value: compared.similarity.factors.engagementRate },
    { factor: 'City', value: compared.similarity.factors.city },
    { factor: 'Content', value: compared.similarity.factors.contentStyle },
    { factor: 'Brands', value: compared.similarity.factors.brandOverlap },
  ] : [];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Users size={24} color="#3b82f6" />
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Lookalike Discovery</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0' }}>
          Find creators similar to a reference creator based on multiple factors.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <label style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8, display: 'block' }}>Reference Creator</label>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              color: '#fff',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{reference ? `${reference.name} (${reference.handle})` : 'Select a creator'}</span>
            <ChevronDown size={16} color="#94a3b8" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  maxHeight: 220,
                  overflowY: 'auto',
                  zIndex: 50,
                }}
              >
                {creators.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedId(c.id); setDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: c.id === selectedId ? 'rgba(99,102,241,0.2)' : 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{c.name}</span>
                    <span style={{ color: '#64748b', fontSize: 12 }}>{c.niche} | {c.city}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: compared ? '1fr 1fr' : '1fr', gap: 24, marginBottom: 24 }}>
        {compared && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 20px 0', textAlign: 'center' }}>Side-by-Side Comparison</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
              {[reference, compared].map((c, idx) => (
                <div key={c.id} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: idx === 0 ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'linear-gradient(135deg,#8b5cf6,#a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 20, margin: '0 auto 8px'
                  }}>{c.name.charAt(0)}</div>
                  <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 2px 0' }}>{c.name}</p>
                  <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 8px 0' }}>{c.handle}</p>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    <div>{c.niche} | {c.city}</div>
                    <div>{(c.followers / 1000).toFixed(0)}K followers</div>
                    <div>Score: {c.creatorScore?.total || 0}</div>
                  </div>
                </div>
              )).reduce((acc, el, idx) => {
                if (idx === 1) acc.push(
                  <div key="vs" style={{ color: '#6366f1', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>VS</div>
                );
                acc.push(el);
                return acc;
              }, [])}
            </div>
          </motion.div>
        )}

        {compared && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 8px 0', textAlign: 'center' }}>Similarity Breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Similarity" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {results.map((creator, i) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.01, borderColor: 'rgba(139,92,246,0.3)' }}
            onClick={() => setCompareId(creator.id)}
            style={{
              background: compareId === creator.id ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${compareId === creator.id ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12,
              padding: 18,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: creator.similarity.total >= 70 ? '#10b981' : creator.similarity.total >= 50 ? '#f59e0b' : '#ef4444',
              color: '#fff', padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
            }}>
              {creator.similarity.total}%
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 15,
              }}>{creator.name.charAt(0)}</div>
              <div>
                <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{creator.name}</h3>
                <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>{creator.handle}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, fontSize: 11, color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Target size={10} /> {creator.niche}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {creator.city}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={10} /> {(creator.followers / 1000).toFixed(0)}K</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><BarChart3 size={10} /> Eng: {creator.creatorScore?.engagement || 0}%</span>
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {Object.entries(creator.similarity.factors).map(([key, val]) => (
                <div key={key} style={{ flex: 1 }}>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${val}%`, background: val >= 70 ? '#10b981' : val >= 40 ? '#f59e0b' : '#ef4444', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); toggleFav(creator.id); }}
                style={{
                  background: favorites.includes(creator.id) ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                  border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, color: favorites.includes(creator.id) ? '#ef4444' : '#94a3b8', fontSize: 12,
                }}
              >
                <Heart size={12} fill={favorites.includes(creator.id) ? '#ef4444' : 'none'} />
                {favorites.includes(creator.id) ? 'Favorited' : 'Add to favorites'}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {results.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 48 }}>
          <Users size={40} color="#334155" />
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 12 }}>Select a reference creator to find lookalikes.</p>
        </motion.div>
      )}
    </div>
  );
}
