import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, ChevronLeft, ChevronRight, Star, TrendingUp, BarChart3, Target, MapPin, Award, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { getCreatorsWithScores, getCampaigns } from '../../stores/influencerStore';

const similarBrands = [
  {
    id: 'brand-1',
    name: 'GlowUp Cosmetics',
    industry: 'Beauty',
    size: 'Mid-market',
    campaigns: 12,
    avgBudget: 300000,
    preferredNiches: ['Lifestyle', 'Beauty', 'Fashion'],
    preferredCities: ['Mumbai', 'Delhi', 'Bangalore'],
    successRate: 85,
    topCreatorNiches: ['Lifestyle', 'Fitness'],
  },
  {
    id: 'brand-2',
    name: 'FreshBite Foods',
    industry: 'Food & Beverage',
    size: 'Enterprise',
    campaigns: 24,
    avgBudget: 500000,
    preferredNiches: ['Food', 'Lifestyle', 'Comedy'],
    preferredCities: ['Chennai', 'Mumbai', 'Pune'],
    successRate: 78,
    topCreatorNiches: ['Food', 'Comedy'],
  },
  {
    id: 'brand-3',
    name: 'TechNova',
    industry: 'Tech',
    size: 'Startup',
    campaigns: 8,
    avgBudget: 200000,
    preferredNiches: ['Tech', 'Lifestyle'],
    preferredCities: ['Bangalore', 'Hyderabad'],
    successRate: 92,
    topCreatorNiches: ['Tech'],
  },
  {
    id: 'brand-4',
    name: 'WanderLux Travel',
    industry: 'Travel',
    size: 'Mid-market',
    campaigns: 15,
    avgBudget: 400000,
    preferredNiches: ['Travel', 'Lifestyle', 'Food'],
    preferredCities: ['Delhi', 'Mumbai'],
    successRate: 72,
    topCreatorNiches: ['Travel', 'Lifestyle'],
  },
];

const successMetrics = [
  { brand: 'GlowUp', engagement: 4.2, roi: 320, reach: 2.1, costPerEng: 12 },
  { brand: 'FreshBite', engagement: 3.8, roi: 280, reach: 3.5, costPerEng: 18 },
  { brand: 'TechNova', engagement: 5.1, roi: 410, reach: 1.8, costPerEng: 8 },
  { brand: 'WanderLux', engagement: 3.2, roi: 240, reach: 2.8, costPerEng: 22 },
];

function calculateOverlap(brand, currentProfile) {
  let overlap = 0;
  const sharedNiches = brand.preferredNiches.filter(n => currentProfile.niches.includes(n));
  overlap += (sharedNiches.length / Math.max(brand.preferredNiches.length, currentProfile.niches.length)) * 40;
  const sharedCities = brand.preferredCities.filter(c => currentProfile.cities.includes(c));
  overlap += (sharedCities.length / Math.max(brand.preferredCities.length, currentProfile.cities.length)) * 30;
  if (brand.industry === currentProfile.industry) overlap += 20;
  const budgetDiff = Math.abs(brand.avgBudget - currentProfile.avgBudget) / Math.max(brand.avgBudget, currentProfile.avgBudget);
  overlap += (1 - budgetDiff) * 10;
  return Math.min(Math.round(overlap), 100);
}

function getTopCreators(brand, allCreators) {
  return allCreators
    .filter(c => brand.topCreatorNiches.includes(c.niche))
    .sort((a, b) => (b.creatorScore?.total || 0) - (a.creatorScore?.total || 0))
    .slice(0, 4);
}

export default function CollaborativeFiltering() {
  const [creators, setCreators] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);

  const currentProfile = {
    name: 'Sic Agency',
    industry: 'Marketing',
    niches: ['Lifestyle', 'Tech', 'Food'],
    cities: ['Mumbai', 'Bangalore', 'Delhi'],
    avgBudget: 350000,
  };

  useEffect(() => {
    setCreators(getCreatorsWithScores());
    setCampaigns(getCampaigns());
  }, []);

  const brandsWithOverlap = similarBrands.map(b => ({
    ...b,
    overlap: calculateOverlap(b, currentProfile),
    topCreators: getTopCreators(b, creators),
  })).sort((a, b) => b.overlap - a.overlap);

  const allSuggested = [...new Map(
    brandsWithOverlap.flatMap(b => b.topCreators).map(c => [c.id, c])
  ).values()].sort((a, b) => (b.creatorScore?.total || 0) - (a.creatorScore?.total || 0));

  const carouselPage = allSuggested.slice(carouselIndex, carouselIndex + 3);

  const radarData = selectedBrand ? [
    { factor: 'Niche Match', value: calculateOverlap({ ...selectedBrand, preferredNiches: selectedBrand.preferredNiches }, { ...currentProfile, niches: currentProfile.niches, industry: '', avgBudget: 0, cities: [] }) },
    { factor: 'Budget Fit', value: Math.round((1 - Math.abs(selectedBrand.avgBudget - currentProfile.avgBudget) / Math.max(selectedBrand.avgBudget, currentProfile.avgBudget)) * 100) },
    { factor: 'City Match', value: Math.round((selectedBrand.preferredCities.filter(c => currentProfile.cities.includes(c)).length / selectedBrand.preferredCities.length) * 100) },
    { factor: 'Success Rate', value: selectedBrand.successRate },
    { factor: 'Campaign Vol', value: Math.min(Math.round(selectedBrand.campaigns / 24 * 100), 100) },
  ] : [];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
        <p style={{ color: '#fff', fontSize: 12, margin: 0 }}>{payload[0].payload.brand || payload[0].payload.factor}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#94a3b8', fontSize: 11, margin: '2px 0 0 0' }}>
            {p.name}: {p.value}{p.name === 'roi' ? '%' : p.name === 'engagement' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Building2 size={24} color="#6366f1" />
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Collaborative Filtering</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0' }}>
          "Brands like yours also worked with..." -- discover creators through similar brand partnerships.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))',
          border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: 18, marginBottom: 24,
        }}
      >
        <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 8px 0' }}>Your Brand Profile</h3>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8', flexWrap: 'wrap' }}>
          <span><Building2 size={10} style={{ verticalAlign: -1, marginRight: 4 }} />{currentProfile.name}</span>
          <span><Target size={10} style={{ verticalAlign: -1, marginRight: 4 }} />Niches: {currentProfile.niches.join(', ')}</span>
          <span><MapPin size={10} style={{ verticalAlign: -1, marginRight: 4 }} />Cities: {currentProfile.cities.join(', ')}</span>
          <span>Avg Budget: {(currentProfile.avgBudget / 1000).toFixed(0)}K</span>
        </div>
      </motion.div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 14px 0' }}>Suggested For You</h3>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: 14, overflow: 'hidden' }} ref={carouselRef}>
            <AnimatePresence mode="wait">
              {carouselPage.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    flex: '1 0 30%', minWidth: 280,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: 18,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 16,
                    }}>{c.name.charAt(0)}</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{c.name}</h4>
                      <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>{c.handle}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11, color: '#94a3b8' }}>
                    <span><Star size={10} color="#f59e0b" style={{ verticalAlign: -1 }} /> {c.niche}</span>
                    <span><Users size={10} style={{ verticalAlign: -1 }} /> {(c.followers / 1000).toFixed(0)}K</span>
                    <span><Award size={10} style={{ verticalAlign: -1 }} /> Score: {c.creatorScore?.total || 0}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 3))}
              disabled={carouselIndex === 0}
              style={{
                width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)', cursor: carouselIndex === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: carouselIndex === 0 ? 0.4 : 1,
              }}
            >
              <ChevronLeft size={16} color="#fff" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setCarouselIndex(Math.min(allSuggested.length - 3, carouselIndex + 3))}
              disabled={carouselIndex + 3 >= allSuggested.length}
              style={{
                width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)', cursor: carouselIndex + 3 >= allSuggested.length ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: carouselIndex + 3 >= allSuggested.length ? 0.4 : 1,
              }}
            >
              <ChevronRight size={16} color="#fff" />
            </motion.button>
          </div>
        </div>
      </div>

      <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 14px 0' }}>Similar Brands</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
        {brandsWithOverlap.map((brand, i) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.01, borderColor: 'rgba(99,102,241,0.3)' }}
            onClick={() => setSelectedBrand(selectedBrand?.id === brand.id ? null : brand)}
            style={{
              background: selectedBrand?.id === brand.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${selectedBrand?.id === brand.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12, padding: 18, cursor: 'pointer', position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute', top: 12, right: 12,
              display: 'flex', alignItems: 'center', gap: 4,
              background: brand.overlap >= 70 ? 'rgba(16,185,129,0.15)' : brand.overlap >= 40 ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)',
              color: brand.overlap >= 70 ? '#10b981' : brand.overlap >= 40 ? '#f59e0b' : '#6b7280',
              padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700,
            }}>
              <Percent size={10} /> {brand.overlap}%
            </div>

            <h4 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 4px 0' }}>{brand.name}</h4>
            <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 12px 0' }}>{brand.industry} | {brand.size}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>
              <div><BarChart3 size={10} style={{ verticalAlign: -1, marginRight: 4 }} />{brand.campaigns} campaigns</div>
              <div><TrendingUp size={10} style={{ verticalAlign: -1, marginRight: 4 }} />{brand.successRate}% success</div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
              <p style={{ color: '#64748b', fontSize: 10, margin: '0 0 6px 0' }}>Top creators used:</p>
              <div style={{ display: 'flex', gap: 4 }}>
                {brand.topCreators.slice(0, 3).map(c => (
                  <span key={c.id} style={{
                    padding: '3px 8px', borderRadius: 6, fontSize: 10,
                    background: 'rgba(99,102,241,0.1)', color: '#a78bfa',
                  }}>{c.name.split(' ')[0]}</span>
                ))}
                {brand.topCreators.length > 3 && (
                  <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                    +{brand.topCreators.length - 3}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedBrand && (
          <motion.div
            key={selectedBrand.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 20,
              }}>
                <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 12px 0' }}>
                  {selectedBrand.name} - Profile Overlap
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Overlap" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 20,
              }}>
                <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 12px 0' }}>
                  {selectedBrand.name}'s Top Creators
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedBrand.topCreators.map(c => (
                    <div key={c.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 12,
                        }}>{c.name.charAt(0)}</div>
                        <div>
                          <p style={{ color: '#fff', fontSize: 12, fontWeight: 500, margin: 0 }}>{c.name}</p>
                          <p style={{ color: '#64748b', fontSize: 10, margin: 0 }}>{c.niche} | {(c.followers / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} color="#f59e0b" />
                        <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 600 }}>{c.creatorScore?.total || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: 20,
        }}
      >
        <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 12px 0' }}>Success Metrics from Similar Brands</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={successMetrics}>
            <XAxis dataKey="brand" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="engagement" name="Engagement %" fill="#3b82f6" fillOpacity={0.6} radius={[4, 4, 0, 0]} />
            <Bar dataKey="roi" name="ROI %" fill="#10b981" fillOpacity={0.6} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
