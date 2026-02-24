import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Sparkles, Star, MapPin, Users, Film, ChevronRight, Zap, Tag } from 'lucide-react';
import { getCreatorsWithScores } from '../../stores/influencerStore';

const suggestedQueries = [
  'Find me a fitness creator in Mumbai with 50k followers who does reels',
  'Tech reviewer in Bangalore with over 500k subscribers on YouTube',
  'Comedy creator in Pune with high engagement rate',
  'Food blogger in Chennai who has worked with Swiggy',
  'Travel creator in Delhi under 100k followers for micro campaign',
  'Lifestyle influencer in Hyderabad who does Stories and Reels',
];

function parseQuery(query) {
  const q = query.toLowerCase();
  const filters = [];
  const niches = ['fitness', 'tech', 'comedy', 'food', 'travel', 'lifestyle', 'beauty', 'fashion', 'gaming', 'education'];
  const cities = ['mumbai', 'bangalore', 'delhi', 'chennai', 'hyderabad', 'pune', 'kolkata', 'jaipur'];
  const platforms = ['instagram', 'youtube', 'twitter', 'linkedin'];
  const contentTypes = ['reels', 'stories', 'shorts', 'videos', 'static', 'carousel', 'posts'];

  for (const n of niches) {
    if (q.includes(n)) filters.push({ type: 'niche', value: n.charAt(0).toUpperCase() + n.slice(1), key: `niche-${n}` });
  }
  for (const c of cities) {
    if (q.includes(c)) filters.push({ type: 'city', value: c.charAt(0).toUpperCase() + c.slice(1), key: `city-${c}` });
  }
  for (const p of platforms) {
    if (q.includes(p)) filters.push({ type: 'platform', value: p.charAt(0).toUpperCase() + p.slice(1), key: `platform-${p}` });
  }
  for (const ct of contentTypes) {
    if (q.includes(ct)) filters.push({ type: 'content', value: ct.charAt(0).toUpperCase() + ct.slice(1), key: `content-${ct}` });
  }

  const followerMatch = q.match(/(\d+)\s*k/i);
  if (followerMatch) {
    const num = parseInt(followerMatch[1]) * 1000;
    if (q.includes('over') || q.includes('above') || q.includes('more than') || q.includes('with over')) {
      filters.push({ type: 'followers', value: `>${(num / 1000)}K`, min: num, key: `followers-min-${num}` });
    } else if (q.includes('under') || q.includes('below') || q.includes('less than')) {
      filters.push({ type: 'followers', value: `<${(num / 1000)}K`, max: num, key: `followers-max-${num}` });
    } else {
      filters.push({ type: 'followers', value: `~${(num / 1000)}K`, target: num, key: `followers-target-${num}` });
    }
  }

  return filters;
}

function scoreCreator(creator, filters) {
  let score = 50;
  const reasons = [];
  for (const f of filters) {
    if (f.type === 'niche' && creator.niche.toLowerCase() === f.value.toLowerCase()) {
      score += 20;
      reasons.push(`Niche: ${f.value}`);
    }
    if (f.type === 'city' && creator.city.toLowerCase() === f.value.toLowerCase()) {
      score += 15;
      reasons.push(`City: ${f.value}`);
    }
    if (f.type === 'platform' && creator.platform.toLowerCase() === f.value.toLowerCase()) {
      score += 10;
      reasons.push(`Platform: ${f.value}`);
    }
    if (f.type === 'followers') {
      if (f.min && creator.followers >= f.min) { score += 10; reasons.push(`Followers > ${f.min / 1000}K`); }
      if (f.max && creator.followers <= f.max) { score += 10; reasons.push(`Followers < ${f.max / 1000}K`); }
      if (f.target) {
        const diff = Math.abs(creator.followers - f.target) / f.target;
        if (diff < 0.5) { score += 10; reasons.push(`Followers ~${f.target / 1000}K`); }
      }
    }
  }
  score += Math.min(creator.creatorScore?.total || 0, 30) * 0.3;
  return { score: Math.min(Math.round(score), 100), reasons };
}

const chipColors = {
  niche: '#8b5cf6',
  city: '#3b82f6',
  platform: '#10b981',
  content: '#f59e0b',
  followers: '#ef4444',
};

export default function NaturalLanguageSearch() {
  const [query, setQuery] = useState('');
  const [parsedFilters, setParsedFilters] = useState([]);
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchTime, setSearchTime] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('sic-nl-search-history');
    if (saved) setSearchHistory(JSON.parse(saved));
  }, []);

  const executeSearch = (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setIsSearching(true);
    setShowSuggestions(false);

    const startTime = performance.now();
    const filters = parseQuery(q);
    setParsedFilters(filters);

    const creators = getCreatorsWithScores();
    const scored = creators.map(c => {
      const { score, reasons } = scoreCreator(c, filters);
      return { ...c, matchScore: score, matchReasons: reasons };
    }).filter(c => c.matchScore > 40).sort((a, b) => b.matchScore - a.matchScore);

    const elapsed = performance.now() - startTime;
    setResults(scored);
    setSearchTime(elapsed.toFixed(1));
    setIsSearching(false);

    const newHistory = [q, ...searchHistory.filter(h => h !== q)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('sic-nl-search-history', JSON.stringify(newHistory));
  };

  const removeFilter = (key) => {
    setParsedFilters(prev => prev.filter(f => f.key !== key));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') executeSearch();
  };

  const getTierBadge = (tier) => {
    const colors = { nano: '#6b7280', micro: '#3b82f6', macro: '#8b5cf6', mega: '#f59e0b' };
    const labels = { nano: 'Nano', micro: 'Micro', macro: 'Macro', mega: 'Mega' };
    return (
      <span style={{ background: colors[tier] + '22', color: colors[tier], padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>
        {labels[tier]}
      </span>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Sparkles size={24} color="#8b5cf6" />
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Natural Language Search</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0' }}>
          Search for creators using plain English. Our AI parses your query into smart filters.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Find me a fitness creator in Mumbai with 50k followers who does reels"
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
                color: '#fff',
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setParsedFilters([]); setResults([]); setSearchTime(null); setShowSuggestions(true); }}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={16} color="#94a3b8" />
              </button>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => executeSearch()}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
            }}
          >
            <Zap size={16} />
            Search
          </motion.button>
        </div>

        <AnimatePresence>
          {parsedFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}
            >
              <span style={{ color: '#94a3b8', fontSize: 12, alignSelf: 'center', marginRight: 4 }}>Parsed:</span>
              {parsedFilters.map(f => (
                <motion.span
                  key={f.key}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 9999,
                    background: (chipColors[f.type] || '#6b7280') + '22',
                    border: `1px solid ${chipColors[f.type] || '#6b7280'}44`,
                    color: chipColors[f.type] || '#6b7280',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  <Tag size={10} />
                  {f.type}: {f.value}
                  <button
                    onClick={() => removeFilter(f.key)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    <X size={12} color={chipColors[f.type] || '#6b7280'} />
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {searchTime !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}
        >
          <span style={{ color: '#94a3b8', fontSize: 13 }}>
            Found <span style={{ color: '#fff', fontWeight: 600 }}>{results.length}</span> creator{results.length !== 1 ? 's' : ''} in {searchTime}ms
          </span>
        </motion.div>
      )}

      {showSuggestions && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={16} color="#f59e0b" />
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>Suggested Queries</h3>
            </div>
            {suggestedQueries.map((sq, i) => (
              <motion.button
                key={i}
                whileHover={{ x: 4, background: 'rgba(255,255,255,0.08)' }}
                onClick={() => { setQuery(sq); executeSearch(sq); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  color: '#94a3b8',
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <ChevronRight size={14} color="#6366f1" />
                {sq}
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Clock size={16} color="#3b82f6" />
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>Recent Searches</h3>
            </div>
            {searchHistory.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>No recent searches yet.</p>
            ) : (
              searchHistory.map((sh, i) => (
                <motion.button
                  key={i}
                  whileHover={{ x: 4, background: 'rgba(255,255,255,0.08)' }}
                  onClick={() => { setQuery(sh); executeSearch(sh); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    color: '#94a3b8',
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Clock size={12} color="#64748b" />
                  {sh}
                </motion.button>
              ))
            )}
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}
          >
            {results.map((creator, i) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: 20,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: creator.matchScore >= 80 ? '#10b981' : creator.matchScore >= 60 ? '#f59e0b' : '#6b7280',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '0 12px 0 12px',
                  fontSize: 12,
                  fontWeight: 700,
                }}>
                  {creator.matchScore}% match
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: '#fff',
                    fontSize: 16,
                  }}>
                    {creator.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: 0 }}>{creator.name}</h3>
                    <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>{creator.handle}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {getTierBadge(creator.creatorTier)}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: 11 }}>
                    <MapPin size={10} /> {creator.city}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: 11 }}>
                    <Users size={10} /> {(creator.followers / 1000).toFixed(0)}K
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: 11 }}>
                    <Film size={10} /> {creator.niche}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Star size={12} color="#f59e0b" />
                  <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>Score: {creator.creatorScore?.total || 0}/100</span>
                </div>

                {creator.matchReasons.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 4 }}>
                    <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 6px 0' }}>Match reasons:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {creator.matchReasons.map((r, ri) => (
                        <span key={ri} style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '2px 8px', borderRadius: 6, fontSize: 10 }}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {searchTime !== null && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: 48,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Search size={40} color="#334155" style={{ marginBottom: 12 }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>No creators match your search. Try a different query.</p>
        </motion.div>
      )}
    </div>
  );
}
