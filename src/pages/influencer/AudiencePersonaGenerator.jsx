import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, RefreshCw, Download, Edit3, ChevronDown, Check, X, Users, MapPin, Heart, ShoppingBag, Tv, Crosshair } from 'lucide-react';
import { getCreators } from '../../stores/influencerStore';

const personaTemplates = {
  Lifestyle: {
    primary: {
      name: 'Ananya', ageRange: '22-30', gender: 'Female', location: 'Urban Metros',
      interests: ['Fashion', 'Self-care', 'Home Decor', 'Dining Out', 'Wellness'],
      painPoints: ['Keeping up with trends on a budget', 'Finding authentic product reviews', 'Work-life balance'],
      contentPrefs: ['Reels', 'Aesthetic carousels', 'Day-in-my-life vlogs', 'Haul videos'],
      buyingBehavior: 'Impulse buyer influenced by social media. Prefers brands with aesthetic packaging and relatable creator endorsements.',
    },
    secondary: {
      name: 'Vikram', ageRange: '25-35', gender: 'Male', location: 'Tier 1 Cities',
      interests: ['Grooming', 'Travel', 'Tech Gadgets', 'Fitness', 'Coffee Culture'],
      painPoints: ['Finding quality menswear brands', 'Time-efficient routines', 'Premium vs budget choices'],
      contentPrefs: ['Short tips videos', 'Product comparisons', 'Minimalist content'],
      buyingBehavior: 'Research-driven buyer. Reads reviews, compares options, values durability over trends.',
    },
  },
  Tech: {
    primary: {
      name: 'Rahul', ageRange: '20-32', gender: 'Male', location: 'Metro Cities',
      interests: ['Gadgets', 'Gaming', 'AI & ML', 'Startups', 'Coding'],
      painPoints: ['Choosing between similar products', 'Staying updated with rapid tech changes', 'Budget constraints for premium tech'],
      contentPrefs: ['Unboxing videos', 'Detailed comparisons', 'Tech news shorts', 'Tutorial videos'],
      buyingBehavior: 'Spec-focused buyer. Waits for sales, reads spec sheets, values performance over brand name.',
    },
    secondary: {
      name: 'Priya', ageRange: '25-38', gender: 'Female', location: 'Tier 1 & 2 Cities',
      interests: ['Productivity Apps', 'Smart Home', 'Work Setup', 'Photography'],
      painPoints: ['Tech jargon confusion', 'Finding reliable mid-range options', 'Privacy concerns'],
      contentPrefs: ['Simplified explainers', 'Use-case demos', 'Setup tours'],
      buyingBehavior: 'Practical buyer. Needs clear use-cases, prefers tested recommendations from trusted creators.',
    },
  },
  Fitness: {
    primary: {
      name: 'Arjun', ageRange: '20-30', gender: 'Male', location: 'Urban India',
      interests: ['Gym', 'Nutrition', 'Sports', 'Supplements', 'Mental Health'],
      painPoints: ['Conflicting fitness advice', 'Expensive gym memberships', 'Plateau in progress'],
      contentPrefs: ['Workout routines', 'Transformation stories', 'Diet plans', 'Form correction reels'],
      buyingBehavior: 'Goal-driven buyer. Invests in supplements and gear recommended by trusted fitness creators.',
    },
    secondary: {
      name: 'Meera', ageRange: '22-35', gender: 'Female', location: 'Metros & Tier 1',
      interests: ['Yoga', 'Home Workouts', 'Clean Eating', 'Mindfulness', 'Running'],
      painPoints: ['Finding women-focused fitness content', 'Balancing fitness with busy schedule', 'Body positivity'],
      contentPrefs: ['Quick home workout reels', 'Meal prep guides', 'Wellness tips', 'Progress journals'],
      buyingBehavior: 'Community-influenced buyer. Trusts micro-influencer recommendations over celebrity endorsements.',
    },
  },
  Food: {
    primary: {
      name: 'Sneha', ageRange: '22-35', gender: 'Female', location: 'All India',
      interests: ['Recipes', 'Street Food', 'Baking', 'Restaurant Reviews', 'Food Photography'],
      painPoints: ['Quick weeknight meals', 'Healthy alternatives to comfort food', 'Ingredient sourcing'],
      contentPrefs: ['Recipe reels', 'Food tours', 'Kitchen hacks', 'ASMR cooking'],
      buyingBehavior: 'Curiosity-driven buyer. Tries trending ingredients and kitchen gadgets seen on social media.',
    },
    secondary: {
      name: 'Karan', ageRange: '25-40', gender: 'Male', location: 'Tier 1 Cities',
      interests: ['BBQ & Grilling', 'Craft Beverages', 'Fine Dining', 'Food Delivery Apps'],
      painPoints: ['Finding good non-veg spots', 'Delivery quality vs restaurant', 'Health-conscious eating out'],
      contentPrefs: ['Restaurant reviews', 'Food challenges', 'Recipe with beer pairing'],
      buyingBehavior: 'Experience-seeker. Willing to pay premium for recommended restaurants and specialty ingredients.',
    },
  },
  Travel: {
    primary: {
      name: 'Isha', ageRange: '23-35', gender: 'Female', location: 'Urban India',
      interests: ['Solo Travel', 'Photography', 'Culture', 'Budget Trips', 'Hidden Gems'],
      painPoints: ['Safety concerns for solo female travelers', 'Budget planning', 'Visa processes'],
      contentPrefs: ['Travel vlogs', 'Packing guides', 'Itinerary reels', 'Hotel/hostel reviews'],
      buyingBehavior: 'Research-heavy planner. Books based on creator itineraries and honest reviews.',
    },
    secondary: {
      name: 'Dev', ageRange: '28-40', gender: 'Male', location: 'Metros',
      interests: ['Adventure Sports', 'Road Trips', 'Luxury Stays', 'Weekend Getaways'],
      painPoints: ['Limited vacation days', 'Finding offbeat destinations', 'Group travel coordination'],
      contentPrefs: ['Drone shots', 'Adventure highlight reels', 'Travel gear reviews'],
      buyingBehavior: 'Convenience buyer. Prefers booking platforms and packages recommended by travel creators.',
    },
  },
  Comedy: {
    primary: {
      name: 'Aakash', ageRange: '18-28', gender: 'Male', location: 'Pan India',
      interests: ['Memes', 'Stand-up', 'Pop Culture', 'Gaming', 'Cricket'],
      painPoints: ['Content fatigue', 'Finding genuinely funny creators', 'Relatable humor vs forced comedy'],
      contentPrefs: ['Sketch comedy reels', 'Relatable memes', 'Roast videos', 'Trending audio lip-syncs'],
      buyingBehavior: 'Brand-agnostic buyer. Converts through humorous brand integrations that feel natural, not scripted.',
    },
    secondary: {
      name: 'Riya', ageRange: '20-30', gender: 'Female', location: 'Urban India',
      interests: ['Sarcastic Humor', 'Office Memes', 'Relationship Comedy', 'Bollywood Parodies'],
      painPoints: ['Tasteless humor online', 'Finding women-led comedy', 'Burnout from doomscrolling'],
      contentPrefs: ['Relatable situational comedy', 'Story-based reels', 'Podcast clips'],
      buyingBehavior: 'Engagement-driven. Shares funny brand content, increasing organic reach through word-of-mouth.',
    },
  },
};

const defaultPersona = {
  primary: {
    name: 'Alex', ageRange: '20-35', gender: 'Unisex', location: 'Urban India',
    interests: ['Social Media', 'Shopping', 'Entertainment', 'Health'],
    painPoints: ['Information overload', 'Trust in recommendations', 'Value for money'],
    contentPrefs: ['Short-form video', 'Stories', 'Carousels'],
    buyingBehavior: 'Influenced by social proof and authentic creator recommendations.',
  },
  secondary: {
    name: 'Sam', ageRange: '25-40', gender: 'Unisex', location: 'Pan India',
    interests: ['News', 'Technology', 'Finance', 'Lifestyle'],
    painPoints: ['Decision fatigue', 'Trustworthy reviews', 'Time management'],
    contentPrefs: ['Long-form content', 'Podcasts', 'Tutorials'],
    buyingBehavior: 'Methodical buyer. Needs multiple touchpoints before conversion.',
  },
};

export default function AudiencePersonaGenerator() {
  const [creators, setCreators] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [activeVariant, setActiveVariant] = useState('primary');
  const [personas, setPersonas] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const data = getCreators();
    setCreators(data);
    if (data.length > 0) setSelectedId(data[0].id);
  }, []);

  const generatePersonas = () => {
    const creator = creators.find(c => c.id === selectedId);
    if (!creator) return;
    const templates = personaTemplates[creator.niche] || defaultPersona;
    setPersonas({
      primary: { ...templates.primary },
      secondary: { ...templates.secondary },
    });
    setActiveVariant('primary');
  };

  const persona = personas ? personas[activeVariant] : null;

  const startEdit = (field) => {
    setEditing(field);
    const val = persona[field];
    setEditValue(Array.isArray(val) ? val.join(', ') : val);
  };

  const saveEdit = () => {
    if (!editing || !personas) return;
    const updated = { ...personas };
    const val = ['interests', 'painPoints', 'contentPrefs'].includes(editing)
      ? editValue.split(',').map(s => s.trim()).filter(Boolean)
      : editValue;
    updated[activeVariant] = { ...updated[activeVariant], [editing]: val };
    setPersonas(updated);
    setEditing(null);
    setEditValue('');
  };

  const fieldIcons = {
    name: UserCircle, ageRange: Users, gender: Users, location: MapPin,
    interests: Heart, painPoints: Crosshair, contentPrefs: Tv, buyingBehavior: ShoppingBag,
  };
  const fieldLabels = {
    name: 'Persona Name', ageRange: 'Age Range', gender: 'Gender', location: 'Location',
    interests: 'Interests', painPoints: 'Pain Points', contentPrefs: 'Content Preferences', buyingBehavior: 'Buying Behavior',
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <UserCircle size={24} color="#8b5cf6" />
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Audience Persona Generator</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px 0' }}>
          Auto-generate target audience personas based on creator profiles.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: 20, marginBottom: 24,
          display: 'flex', gap: 12, alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: 1 }}>
          <label style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6, display: 'block' }}>Select Creator</label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none',
            }}
          >
            {creators.map(c => (
              <option key={c.id} value={c.id}>{c.name} - {c.niche} ({c.platform})</option>
            ))}
          </select>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={generatePersonas}
          style={{
            padding: '10px 24px', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
            border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <RefreshCw size={14} /> Generate
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {personas && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {['primary', 'secondary'].map(v => (
                <motion.button
                  key={v}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveVariant(v)}
                  style={{
                    padding: '10px 24px',
                    background: activeVariant === v ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${activeVariant === v ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10, color: activeVariant === v ? '#a78bfa' : '#94a3b8',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >
                  {v} Persona
                </motion.button>
              ))}
            </div>

            {persona && (
              <motion.div
                key={activeVariant}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16, padding: 28, position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: activeVariant === 'primary'
                      ? 'linear-gradient(135deg,#8b5cf6,#6366f1)'
                      : 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <UserCircle size={40} color="#fff" />
                  </div>
                  <div>
                    <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>{persona.name}</h2>
                    <p style={{ color: '#94a3b8', fontSize: 13, margin: '4px 0 0 0' }}>
                      {persona.gender} | {persona.ageRange} | {persona.location}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {['interests', 'painPoints', 'contentPrefs', 'buyingBehavior'].map(field => {
                    const Icon = fieldIcons[field];
                    const val = persona[field];
                    const isArray = Array.isArray(val);
                    return (
                      <motion.div
                        key={field}
                        whileHover={{ borderColor: 'rgba(139,92,246,0.2)' }}
                        style={{
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 12, padding: 16, position: 'relative',
                          gridColumn: field === 'buyingBehavior' ? '1 / -1' : 'auto',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon size={14} color="#8b5cf6" />
                            <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              {fieldLabels[field]}
                            </span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => startEdit(field)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                          >
                            <Edit3 size={12} color="#64748b" />
                          </motion.button>
                        </div>

                        {editing === field ? (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              style={{
                                flex: 1, padding: '8px 12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: 6, color: '#fff', fontSize: 12, outline: 'none',
                              }}
                              placeholder={isArray ? 'Comma separated values' : ''}
                              autoFocus
                            />
                            <button onClick={saveEdit} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Check size={14} color="#10b981" /></button>
                            <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} color="#ef4444" /></button>
                          </div>
                        ) : isArray ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {val.map((item, i) => (
                              <span key={i} style={{
                                padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 500,
                                background: 'rgba(139,92,246,0.12)', color: '#a78bfa',
                              }}>{item}</span>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#e2e8f0', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{val}</p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(persona, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = `persona-${persona.name.toLowerCase()}.json`; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{
                      padding: '8px 20px', background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                      color: '#94a3b8', fontSize: 12, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Download size={12} /> Export Persona
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
