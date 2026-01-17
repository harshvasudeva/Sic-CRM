import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Database, Server, Check, AlertTriangle, Save, Loader } from 'lucide-react';

const Setup = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState({
        host: 'localhost',
        port: '5432',
        user: 'postgres',
        password: '',
        database: 'sic_crm_db'
    });

    const [status, setStatus] = useState('idle'); // idle, testing, success, error, saving
    const [message, setMessage] = useState('');
    const [isConfigured, setIsConfigured] = useState(false);

    // Check if already configured on load
    useEffect(() => {
        fetch('http://localhost:5000/api/setup/status')
            .then(res => res.json())
            .then(data => {
                if (data.configured) setIsConfigured(true);
            })
            .catch(err => console.error('Setup status check failed', err));
    }, []);

    const handleChange = (e) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
        setStatus('idle');
        setMessage('');
    };

    const testConnection = async () => {
        setStatus('testing');
        setMessage('Testing connection...');
        try {
            const res = await fetch('http://localhost:5000/api/setup/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await res.json();

            if (res.ok && data.valid) {
                setStatus('success');
                setMessage('Connection Successful! You can now save.');
            } else {
                setStatus('error');
                setMessage(data.message || 'Connection failed');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error: Is the backend running?');
        }
    };

    const saveConfiguration = async () => {
        setStatus('saving');
        try {
            const res = await fetch('http://localhost:5000/api/setup/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setStatus('saved');
                setMessage('Configuration saved! Restarting application...');

                // Give backend a moment to restart if watched by nodemon
                setTimeout(() => {
                    navigate('/');
                    window.location.reload();
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Failed to save configuration');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error during save.');
        }
    };

    return (
        <div className="setup-container">
            <div className="setup-card glass">

                {/* Header */}
                <div className="setup-header">
                    <div className="setup-icon-wrapper">
                        <Settings size={32} className="setup-icon" />
                    </div>
                    <div>
                        <h1 className="setup-title">Initial Setup</h1>
                        <p className="setup-subtitle">Configure your Database Connection</p>
                    </div>
                </div>

                {/* Content */}
                <div className="setup-content">

                    {isConfigured && (
                        <div className="status-badge success">
                            <Check size={16} />
                            <span>Database is currently configured.</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Host</label>
                        <div className="input-wrapper">
                            <Server className="input-icon" size={18} />
                            <input
                                type="text"
                                name="host"
                                value={config.host}
                                onChange={handleChange}
                                placeholder="localhost"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ flex: 2 }}>
                            <label>Database Name</label>
                            <div className="input-wrapper">
                                <Database className="input-icon" size={18} />
                                <input
                                    type="text"
                                    name="database"
                                    value={config.database}
                                    onChange={handleChange}
                                    placeholder="sic_crm_db"
                                />
                            </div>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Port</label>
                            <input
                                type="text"
                                name="port"
                                value={config.port}
                                onChange={handleChange}
                                className="text-center"
                                placeholder="5432"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>User</label>
                        <input
                            type="text"
                            name="user"
                            value={config.user}
                            onChange={handleChange}
                            placeholder="postgres"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={config.password}
                            onChange={handleChange}
                            placeholder="••••••••••••"
                        />
                        <p className="helper-text">Leave empty if no password is set.</p>
                    </div>

                    {/* Status Message */}
                    {message && (
                        <div className={`status-message ${status}`}>
                            {status === 'error' && <AlertTriangle size={18} />}
                            {status === 'success' && <Check size={18} />}
                            {status === 'testing' && <Loader size={18} className="animate-spin" />}
                            <span>{message}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="actions">
                        <button
                            onClick={testConnection}
                            disabled={status === 'testing' || status === 'saving'}
                            className="btn-secondary"
                        >
                            Test Connection
                        </button>

                        <button
                            onClick={saveConfiguration}
                            disabled={status !== 'success'}
                            className="btn-primary"
                        >
                            <Save size={18} />
                            Save & Restart
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .setup-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: var(--bg-primary);
                    position: relative;
                    z-index: 1;
                }
                
                .setup-container::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
                    z-index: -1;
                }

                .setup-card {
                    width: 100%;
                    max-width: 480px;
                    background: var(--bg-card);
                    border-radius: var(--radius-xl);
                    overflow: hidden;
                    box-shadow: var(--shadow-2xl);
                    border: 1px solid var(--border-color);
                    backdrop-filter: blur(20px);
                }

                .setup-header {
                    padding: 30px;
                    background: rgba(0, 0, 0, 0.2);
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .setup-icon-wrapper {
                    width: 56px;
                    height: 56px;
                    background: var(--accent-gradient);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: var(--shadow-glow);
                }

                .setup-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0;
                    background: var(--accent-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .setup-subtitle {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    margin-top: 4px;
                }

                .setup-content {
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-row {
                    display: flex;
                    gap: 16px;
                }

                label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .input-wrapper {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    pointer-events: none;
                    transition: color 0.2s;
                }

                input {
                    width: 100%;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    transition: all 0.2s;
                    font-family: inherit;
                }

                .input-wrapper input {
                    padding-left: 42px;
                }

                input:focus {
                    outline: none;
                    border-color: var(--accent-primary);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
                    background: var(--bg-secondary);
                }

                input:focus + .input-icon,
                .input-wrapper:focus-within .input-icon {
                    color: var(--accent-primary);
                }

                .helper-text {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    border-radius: var(--radius-md);
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .status-badge.success {
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    color: var(--success);
                }

                .status-message {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px;
                    border-radius: var(--radius-md);
                    font-size: 0.9rem;
                    animation: slideIn 0.3s ease;
                }

                .status-message.error {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--error);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }

                .status-message.success {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--success);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .status-message.testing {
                    background: rgba(59, 130, 246, 0.1);
                    color: var(--info);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                }

                .actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 10px;
                }

                button {
                    flex: 1;
                    padding: 12px;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .btn-secondary {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                }

                .btn-secondary:hover:not(:disabled) {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    border-color: var(--text-muted);
                }

                .btn-primary {
                    background: var(--accent-gradient);
                    border: none;
                    color: white;
                    box-shadow: var(--shadow-lg);
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-glow);
                }

                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                }

                .text-center { text-align: center; }
                .animate-spin { animation: spin 1s linear infinite; }
                
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Setup;
