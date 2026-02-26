/**
 * EntityCard - Hoverable mini-card for cross-module link previews.
 * @param {string} entityType - customer|vendor|product|employee|lead|invoice
 * @param {string} entityId
 * @param {Object} data - Entity data object with type-specific fields
 * @param {Function} onClick - Navigation callback
 */
import { useMemo } from 'react'
import { User, Truck, Package, Briefcase, Target, FileText, DollarSign, Mail, MapPin, Hash } from 'lucide-react'
import { formatCurrency } from '../stores/settingsStore'

const TYPE_CONFIG = {
  customer: { icon: User, color: '#3b82f6', bg: '#3b82f620' },
  vendor: { icon: Truck, color: '#f59e0b', bg: '#f59e0b20' },
  product: { icon: Package, color: '#10b981', bg: '#10b98120' },
  employee: { icon: Briefcase, color: '#8b5cf6', bg: '#8b5cf620' },
  lead: { icon: Target, color: '#ec4899', bg: '#ec489920' },
  invoice: { icon: FileText, color: '#6366f1', bg: '#6366f120' },
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
      {Icon && <Icon size={11} />}
      <span>{label}:</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value ?? '—'}</span>
    </div>
  )
}

export default function EntityCard({ entityType, entityId, data = {}, onClick }) {
  const cfg = TYPE_CONFIG[entityType] || TYPE_CONFIG.customer
  const Icon = cfg.icon

  const stats = useMemo(() => {
    switch (entityType) {
      case 'customer': return [
        { icon: Mail, label: 'Email', value: data.email },
        { icon: DollarSign, label: 'Revenue', value: data.totalRevenue != null ? formatCurrency(data.totalRevenue) : undefined },
        { label: 'Deals', value: data.activeDeals },
      ]
      case 'vendor': return [
        { icon: Mail, label: 'Email', value: data.email },
        { label: 'Rating', value: data.rating ? `${data.rating}/5` : undefined },
        { label: 'Orders', value: data.orderCount },
      ]
      case 'product': return [
        { icon: Hash, label: 'SKU', value: data.sku },
        { icon: Package, label: 'Stock', value: data.stockLevel },
        { icon: DollarSign, label: 'Price', value: data.salesPrice != null ? formatCurrency(data.salesPrice) : undefined },
      ]
      case 'employee': return [
        { icon: Briefcase, label: 'Dept', value: data.department },
        { label: 'Position', value: data.position },
        { label: 'Status', value: data.status },
      ]
      case 'lead': return [
        { label: 'Company', value: data.company },
        { label: 'Score', value: data.score },
        { label: 'Source', value: data.source },
      ]
      case 'invoice': return [
        { icon: DollarSign, label: 'Amount', value: data.totalAmount != null ? formatCurrency(data.totalAmount) : undefined },
        { label: 'Status', value: data.status },
        { label: 'Due', value: data.dueDate ? new Date(data.dueDate).toLocaleDateString() : undefined },
      ]
      default: return []
    }
  }, [entityType, data])

  const s = {
    card: {
      background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8,
      padding: 12, minWidth: 220, maxWidth: 280, cursor: onClick ? 'pointer' : 'default',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'transform 0.15s',
    },
    header: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
    iconWrap: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: cfg.bg, color: cfg.color, flexShrink: 0 },
    name: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    type: { fontSize: 10, color: cfg.color, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 },
    stats: { display: 'flex', flexDirection: 'column', gap: 3 },
  }

  return (
    <div style={s.card} onClick={onClick} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <div style={s.header}>
        <div style={s.iconWrap}><Icon size={15} /></div>
        <div style={{ minWidth: 0 }}>
          <div style={s.name}>{data.name || data.title || entityId}</div>
          <div style={s.type}>{entityType}</div>
        </div>
      </div>
      <div style={s.stats}>
        {stats.filter(st => st.value != null).map((st, i) => <Stat key={i} {...st} />)}
      </div>
    </div>
  )
}
