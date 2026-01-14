import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Settings as SettingsIcon,
    Moon,
    Sun,
    Bell,
    Globe,
    Palette,
    Shield,
    User,
    Mail,
    Save,
    Check
} from 'lucide-react'

function Settings() {
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        updates: false
    })
    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="page-title">
                    <span className="gradient-text">Settings</span>
                </h1>
                <p className="page-description">
                    Customize your Sic CRM experience. Configure preferences, notifications, and account settings.
                </p>
            </motion.div>

            <div className="settings-grid">
                {/* Appearance */}
                <motion.section
                    className="settings-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <Palette size={20} />
                        </div>
                        <h2>Appearance</h2>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <Moon size={18} />
                            <div>
                                <h4>Dark Mode</h4>
                                <p>Use dark theme across the application</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <Sun size={18} />
                            <div>
                                <h4>Reduced Motion</h4>
                                <p>Minimize animations for accessibility</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </motion.section>

                {/* Notifications */}
                <motion.section
                    className="settings-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <Bell size={20} />
                        </div>
                        <h2>Notifications</h2>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <Mail size={18} />
                            <div>
                                <h4>Email Notifications</h4>
                                <p>Receive updates via email</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={notifications.email}
                                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <Bell size={18} />
                            <div>
                                <h4>Push Notifications</h4>
                                <p>Get real-time push alerts</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={notifications.push}
                                onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <Globe size={18} />
                            <div>
                                <h4>Product Updates</h4>
                                <p>News about new features and updates</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={notifications.updates}
                                onChange={(e) => setNotifications({ ...notifications, updates: e.target.checked })}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </motion.section>

                {/* Account */}
                <motion.section
                    className="settings-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <User size={20} />
                        </div>
                        <h2>Account</h2>
                    </div>

                    <div className="settings-form">
                        <div className="form-group">
                            <label>Display Name</label>
                            <input type="text" defaultValue="Admin User" className="form-input" />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" defaultValue="admin@siccrm.com" className="form-input" />
                        </div>
                        <div className="form-group">
                            <label>Language</label>
                            <select className="form-input">
                                <option>English (US)</option>
                                <option>Spanish</option>
                                <option>French</option>
                                <option>German</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Timezone</label>
                            <select className="form-input">
                                <option>UTC+5:30 (India)</option>
                                <option>UTC-8 (Pacific)</option>
                                <option>UTC+0 (London)</option>
                                <option>UTC+1 (Paris)</option>
                            </select>
                        </div>
                    </div>
                </motion.section>

                {/* Security */}
                <motion.section
                    className="settings-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <Shield size={20} />
                        </div>
                        <h2>Security</h2>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <Shield size={18} />
                            <div>
                                <h4>Two-Factor Authentication</h4>
                                <p>Add an extra layer of security</p>
                            </div>
                        </div>
                        <button className="settings-btn-outline">Enable</button>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <SettingsIcon size={18} />
                            <div>
                                <h4>Active Sessions</h4>
                                <p>Manage your active login sessions</p>
                            </div>
                        </div>
                        <button className="settings-btn-outline">View</button>
                    </div>
                </motion.section>
            </div>

            {/* Save Button */}
            <motion.div
                className="settings-save"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <button
                    className={`save-btn ${saved ? 'saved' : ''}`}
                    onClick={handleSave}
                >
                    {saved ? (
                        <>
                            <Check size={20} />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Save Changes
                        </>
                    )}
                </button>
            </motion.div>

            <style>{`
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        @media (max-width: 900px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }

        .settings-section {
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 24px;
        }

        .settings-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .settings-section-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .settings-section-header h2 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .settings-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
          margin-bottom: 12px;
        }

        .settings-item:last-child {
          margin-bottom: 0;
        }

        .settings-item-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .settings-item-info > svg {
          color: var(--text-muted);
        }

        .settings-item-info h4 {
          font-size: 0.95rem;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .settings-item-info p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Toggle Switch */
        .toggle {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 26px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-tertiary);
          transition: 0.3s;
          border-radius: 26px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        .toggle input:checked + .toggle-slider {
          background: var(--accent-primary);
        }

        .toggle input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }

        /* Form */
        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .form-input {
          padding: 12px 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .settings-btn-outline {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .settings-btn-outline:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .settings-save {
          display: flex;
          justify-content: flex-end;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: var(--accent-gradient);
          border-radius: var(--radius-md);
          color: white;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }

        .save-btn.saved {
          background: linear-gradient(135deg, #10b981, #34d399);
        }
      `}</style>
        </div>
    )
}

export default Settings
