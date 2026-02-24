import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, Trash2, User, Clock } from 'lucide-react'
import { getProfileComments, addProfileComment, deleteProfileComment } from '../../stores/teamStore'
import { getCreators } from '../../stores/influencerStore'

const s = {
  page: { padding: '24px', maxWidth: 900, margin: '0 auto' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 20 },
  select: { padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.9rem', marginBottom: 20, minWidth: 250 },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 },
  commentBubble: { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px 12px 12px 4px', padding: '12px 16px', marginBottom: 12, maxWidth: '80%' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 },
  inputRow: { display: 'flex', gap: 8, marginTop: 16 },
  input: { flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.9rem' },
  sendBtn: { padding: '10px 16px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function CreatorProfileComments() {
  const [creators, setCreators] = useState([])
  const [selectedCreator, setSelectedCreator] = useState('')
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    const c = getCreators()
    setCreators(c)
    if (c.length > 0) setSelectedCreator(c[0].id)
  }, [])

  useEffect(() => {
    if (selectedCreator) setComments(getProfileComments(selectedCreator))
  }, [selectedCreator])

  const handleSend = () => {
    if (!newComment.trim()) return
    addProfileComment({ creatorId: selectedCreator, userId: 'usr-001', userName: 'You', text: newComment })
    setComments(getProfileComments(selectedCreator))
    setNewComment('')
  }

  const handleDelete = (id) => {
    deleteProfileComment(id)
    setComments(getProfileComments(selectedCreator))
  }

  const creator = creators.find(c => c.id === selectedCreator)
  const allComments = getProfileComments()

  return (
    <div style={s.page}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={s.title}><MessageSquare size={22} style={{ color: '#6366f1', marginRight: 8, verticalAlign: 'middle' }} />Creator Profile Comments</h1>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[{ label: 'Total Comments', value: allComments.length }, { label: 'Creators Commented', value: [...new Set(allComments.map(c => c.creatorId))].length }, { label: 'Team Contributors', value: [...new Set(allComments.map(c => c.userId))].length }].map((stat, i) => (
          <motion.div key={i} style={s.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <select style={s.select} value={selectedCreator} onChange={e => setSelectedCreator(e.target.value)}>
        {creators.map(c => <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>)}
      </select>

      {creator && (
        <motion.div style={{ ...s.card, marginBottom: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={s.avatar}>{creator.name.split(' ').map(n => n[0]).join('')}</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600 }}>{creator.name}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{creator.handle} | {creator.platform}</div>
            </div>
            <div style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 12, background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '0.75rem' }}>
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </div>
          </div>
        </motion.div>
      )}

      <div style={s.card}>
        <div style={{ marginBottom: 16, maxHeight: 400, overflow: 'auto' }}>
          {comments.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: 32 }}>No comments yet. Start the conversation!</div>}
          {comments.map((comment, i) => (
            <motion.div key={comment.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div style={{ ...s.avatar, background: comment.userId === 'usr-001' ? '#6366f1' : '#8b5cf6' }}>
                {comment.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.commentBubble}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: 600 }}>{comment.userName}</span>
                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{timeAgo(comment.createdAt)}</span>
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{comment.text}</div>
                </div>
                {comment.userId === 'usr-001' && (
                  <button onClick={() => handleDelete(comment.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div style={s.inputRow}>
          <input style={s.input} placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
          <button style={s.sendBtn} onClick={handleSend}><Send size={16} /> Send</button>
        </div>
      </div>
    </div>
  )
}
