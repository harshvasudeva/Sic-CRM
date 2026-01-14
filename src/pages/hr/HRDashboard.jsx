import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  DollarSign,
  Award,
  FileText,
  Bell,
  TrendingUp,
  Briefcase,
  Building2,
  GraduationCap,
  Receipt,
  UserCheck,
  UserX,
  CalendarDays,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { getHRStats, getEmployees, getLeaves, getAnnouncements } from '../../stores/hrStore'
import MiniChart from '../../components/MiniChart'

function HRDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentLeaves, setRecentLeaves] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    setStats(getHRStats())
    setRecentLeaves(getLeaves({ status: 'pending' }).slice(0, 5))
    setAnnouncements(getAnnouncements().filter(a => a.pinned || new Date(a.expiresAt) > new Date()).slice(0, 3))
    setEmployees(getEmployees())
  }, [])

  if (!stats) return <div>Loading...</div>

  const statCards = [
    { icon: Users, label: 'Total Employees', value: stats.totalEmployees, color: 'blue', link: '/hr/employees' },
    { icon: UserCheck, label: 'Active', value: stats.activeEmployees, color: 'green', link: '/hr/employees' },
    { icon: UserX, label: 'On Leave', value: stats.onLeave, color: 'orange', link: '/hr/leaves' },
    { icon: UserPlus, label: 'New Hires', value: stats.newHires, color: 'purple', subtext: 'This month' },
    { icon: Building2, label: 'Departments', value: stats.departments, color: 'indigo', link: '/hr/departments' },
    { icon: CalendarDays, label: 'Pending Leaves', value: stats.pendingLeaves, color: 'red', link: '/hr/leaves' },
    { icon: Clock, label: 'Avg Tenure', value: `${stats.averageTenure}y`, color: 'teal' },
    { icon: Calendar, label: 'Today Present', value: stats.todayAttendance, color: 'cyan', link: '/hr/attendance' },
  ]

  const quickActions = [
    { icon: UserPlus, label: 'Add Employee', path: '/hr/employees/new', color: '#6366f1' },
    { icon: Calendar, label: 'View Attendance', path: '/hr/attendance', color: '#10b981' },
    { icon: FileText, label: 'Leave Requests', path: '/hr/leaves', color: '#f59e0b' },
    { icon: DollarSign, label: 'Run Payroll', path: '/hr/payroll', color: '#3b82f6' },
    { icon: GraduationCap, label: 'Trainings', path: '/hr/trainings', color: '#8b5cf6' },
    { icon: Award, label: 'Performance', path: '/hr/performance', color: '#ec4899' },
    { icon: Receipt, label: 'Expenses', path: '/hr/expenses', color: '#14b8a6' },
    { icon: Bell, label: 'Announcements', path: '/hr/announcements', color: '#ef4444' },
  ]

  return (
    <div className="page hr-dashboard">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="page-title">
            <span className="gradient-text">HR</span> Dashboard
          </h1>
          <p className="page-description">
            Manage your workforce, track attendance, and handle HR operations.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="hr-stats-grid">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            className={`hr-stat-card ${stat.link ? 'clickable' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => stat.link && navigate(stat.link)}
          >
            <div className={`hr-stat-icon ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div className="hr-stat-content">
              <div className="hr-stat-value">{stat.value}</div>
              <div className="hr-stat-label">{stat.label}</div>
              {stat.subtext && <div className="hr-stat-subtext">{stat.subtext}</div>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        className="section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              className="quick-action-card"
              onClick={() => navigate(action.path)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="qa-icon" style={{ background: action.color }}>
                <action.icon size={20} />
              </div>
              <span>{action.label}</span>
              <ChevronRight size={16} className="qa-arrow" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="hr-grid-2">
        {/* Pending Leave Requests */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <h3><FileText size={18} /> Pending Leave Requests</h3>
            <button className="link-btn" onClick={() => navigate('/hr/leaves')}>View All</button>
          </div>
          <div className="leave-list">
            {recentLeaves.length === 0 ? (
              <p className="empty-text">No pending requests</p>
            ) : (
              recentLeaves.map(leave => {
                const emp = employees.find(e => e.id === leave.employeeId)
                return (
                  <div key={leave.id} className="leave-item">
                    <div className="leave-employee">
                      <strong>{emp?.firstName} {emp?.lastName}</strong>
                      <span>{leave.type} leave</span>
                    </div>
                    <div className="leave-dates">
                      {leave.startDate} → {leave.endDate}
                    </div>
                    <div className="leave-days">{leave.days} days</div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Announcements */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="card-header">
            <h3><Bell size={18} /> Announcements</h3>
            <button className="link-btn" onClick={() => navigate('/hr/announcements')}>View All</button>
          </div>
          <div className="announcement-list">
            {announcements.map(ann => (
              <div key={ann.id} className={`announcement-item ${ann.priority}`}>
                {ann.pinned && <span className="pinned-badge">📌</span>}
                <h4>{ann.title}</h4>
                <p>{ann.content.substring(0, 100)}...</p>
                <span className="ann-date">{ann.createdAt}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Department Distribution */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="card-header">
          <h3><Building2 size={18} /> Department Distribution</h3>
        </div>
        <div className="dept-distribution">
          {Object.entries(stats.departmentDistribution).map(([dept, count]) => (
            <div key={dept} className="dept-bar">
              <div className="dept-info">
                <span className="dept-name">{dept}</span>
                <span className="dept-count">{count} employees</span>
              </div>
              <div className="dept-progress">
                <motion.div
                  className="dept-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / stats.totalEmployees) * 100}%` }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <style>{`
        .hr-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        @media (max-width: 1200px) {
          .hr-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
          .hr-stats-grid { grid-template-columns: 1fr; }
        }

        .hr-stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
        }

        .hr-stat-card.clickable {
          cursor: pointer;
        }

        .hr-stat-card.clickable:hover {
          border-color: var(--accent-primary);
          transform: translateY(-2px);
        }

        .hr-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .hr-stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
        .hr-stat-icon.green { background: linear-gradient(135deg, #10b981, #34d399); }
        .hr-stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
        .hr-stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #a855f7); }
        .hr-stat-icon.indigo { background: linear-gradient(135deg, #6366f1, #818cf8); }
        .hr-stat-icon.red { background: linear-gradient(135deg, #ef4444, #f87171); }
        .hr-stat-icon.teal { background: linear-gradient(135deg, #14b8a6, #2dd4bf); }
        .hr-stat-icon.cyan { background: linear-gradient(135deg, #06b6d4, #22d3ee); }

        .hr-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .hr-stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .hr-stat-subtext {
          font-size: 0.75rem;
          color: var(--text-muted);
          opacity: 0.7;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        @media (max-width: 900px) {
          .quick-actions-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .quick-action-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          text-align: left;
          transition: all 0.2s;
        }

        .quick-action-card:hover {
          border-color: var(--accent-primary);
        }

        .qa-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .quick-action-card span {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .qa-arrow {
          color: var(--text-muted);
        }

        .hr-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }

        @media (max-width: 900px) {
          .hr-grid-2 { grid-template-columns: 1fr; }
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .card-header h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
        }

        .link-btn {
          font-size: 0.85rem;
          color: var(--accent-primary);
        }

        .leave-list, .announcement-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .leave-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
        }

        .leave-employee {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .leave-employee span {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .leave-dates {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .leave-days {
          padding: 4px 10px;
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning);
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .empty-text {
          color: var(--text-muted);
          text-align: center;
          padding: 20px;
        }

        .announcement-item {
          padding: 14px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--border-color);
        }

        .announcement-item.high { border-left-color: var(--error); }
        .announcement-item.medium { border-left-color: var(--warning); }
        .announcement-item.low { border-left-color: var(--info); }

        .announcement-item h4 {
          font-size: 0.95rem;
          margin-bottom: 6px;
        }

        .announcement-item p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .ann-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .pinned-badge {
          float: right;
        }

        .dept-distribution {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dept-bar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dept-info {
          display: flex;
          justify-content: space-between;
        }

        .dept-name {
          font-weight: 500;
        }

        .dept-count {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .dept-progress {
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }

        .dept-fill {
          height: 100%;
          background: var(--accent-gradient);
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}

export default HRDashboard
