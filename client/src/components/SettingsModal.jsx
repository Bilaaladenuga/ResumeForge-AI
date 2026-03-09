import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Key, ExternalLink } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [saved, setSaved] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        localStorage.setItem('gemini_api_key', apiKey);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1200);
    };

    const handleClear = () => {
        localStorage.removeItem('gemini_api_key');
        setApiKey('');
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div
                className="glass-card modal-card"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Key size={20} /> AI Configuration
                        </h2>
                        <p style={{ marginBottom: 0 }}>Enter your Google Gemini API key to enable AI-powered features.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-icon"
                        style={{ flexShrink: 0 }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Gemini API Key</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key..."
                        className="form-input"
                        id="gemini-api-key-input"
                    />
                </div>

                <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--accent)',
                        fontSize: '0.75rem',
                        marginBottom: '1.5rem',
                        fontWeight: '600'
                    }}
                >
                    Get a free API key from Google AI Studio <ExternalLink size={12} />
                </a>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }} disabled={!apiKey.trim()}>
                        {saved ? '✓ SAVED!' : 'SAVE KEY'}
                    </button>
                    {apiKey && (
                        <button onClick={handleClear} className="btn btn-danger">
                            CLEAR
                        </button>
                    )}
                </div>

                <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginTop: '1rem', lineHeight: 1.5 }}>
                    Your API key is stored locally in your browser and never sent to any server except Google's API.
                </p>
            </motion.div>
        </div>
    );
};

export default SettingsModal;
