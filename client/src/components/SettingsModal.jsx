import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Key, ExternalLink } from 'lucide-react';
import { AI_PROVIDERS } from '../services/ai';

const getStored = (key, fallback = '') => {
    if (typeof localStorage === 'undefined') return fallback;
    return localStorage.getItem(key) || fallback;
};

const SettingsModal = ({ isOpen, onClose }) => {
    const [provider, setProvider] = useState(getStored('ai_provider', 'gemini'));
    const [geminiKey, setGeminiKey] = useState(getStored('gemini_api_key'));
    const [geminiModel, setGeminiModel] = useState(getStored('gemini_model', AI_PROVIDERS.gemini.defaultModel));
    const [openaiKey, setOpenaiKey] = useState(getStored('openai_api_key'));
    const [openaiBaseUrl, setOpenaiBaseUrl] = useState(getStored('openai_base_url', AI_PROVIDERS.openai.defaultBaseUrl));
    const [openaiModel, setOpenaiModel] = useState(getStored('openai_model', AI_PROVIDERS.openai.defaultModel));
    const [openrouterKey, setOpenrouterKey] = useState(getStored('openrouter_api_key'));
    const [openrouterModel, setOpenrouterModel] = useState(getStored('openrouter_model', AI_PROVIDERS.openrouter.defaultModel));
    const [ollamaBaseUrl, setOllamaBaseUrl] = useState(getStored('ollama_base_url', AI_PROVIDERS.ollama.defaultBaseUrl));
    const [ollamaModel, setOllamaModel] = useState(getStored('ollama_model', AI_PROVIDERS.ollama.defaultModel));
    const [saved, setSaved] = useState(false);

    if (!isOpen) return null;

    const saveValue = (key, value) => {
        if (value.trim()) {
            localStorage.setItem(key, value.trim());
        } else {
            localStorage.removeItem(key);
        }
    };

    const handleSave = () => {
        localStorage.setItem('ai_provider', provider);
        saveValue('gemini_api_key', geminiKey);
        saveValue('gemini_model', geminiModel);
        saveValue('openai_api_key', openaiKey);
        saveValue('openai_base_url', openaiBaseUrl);
        saveValue('openai_model', openaiModel);
        saveValue('openrouter_api_key', openrouterKey);
        saveValue('openrouter_model', openrouterModel);
        saveValue('ollama_base_url', ollamaBaseUrl);
        saveValue('ollama_model', ollamaModel);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1200);
    };

    const handleClearProvider = () => {
        const active = AI_PROVIDERS[provider];
        if (active.storageKey) localStorage.removeItem(active.storageKey);
        if (active.baseUrlKey) localStorage.removeItem(active.baseUrlKey);
        if (active.modelKey) localStorage.removeItem(active.modelKey);

        if (provider === 'gemini') setGeminiKey('');
        if (provider === 'openai') setOpenaiKey('');
        if (provider === 'openrouter') setOpenrouterKey('');
    };

    const renderProviderFields = () => {
        if (provider === 'openai') {
            return (
                <>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">API Key</label>
                        <input type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="Enter API key..." className="form-input" />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Base URL</label>
                        <input value={openaiBaseUrl} onChange={(e) => setOpenaiBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1" className="form-input" />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Model</label>
                        <input value={openaiModel} onChange={(e) => setOpenaiModel(e.target.value)} placeholder="gpt-4o-mini" className="form-input" />
                    </div>
                </>
            );
        }

        if (provider === 'openrouter') {
            return (
                <>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">OpenRouter API Key</label>
                        <input type="password" value={openrouterKey} onChange={(e) => setOpenrouterKey(e.target.value)} placeholder="Enter OpenRouter key..." className="form-input" />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Model</label>
                        <input value={openrouterModel} onChange={(e) => setOpenrouterModel(e.target.value)} placeholder="openai/gpt-4o-mini" className="form-input" />
                    </div>
                    <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '0.75rem', marginBottom: '1rem', fontWeight: '600' }}>
                        Browse OpenRouter models <ExternalLink size={12} />
                    </a>
                </>
            );
        }

        if (provider === 'ollama') {
            return (
                <>
                    <p style={{ marginBottom: '1rem' }}>Local AI: experimental / requires capable device.</p>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Ollama Base URL</label>
                        <input value={ollamaBaseUrl} onChange={(e) => setOllamaBaseUrl(e.target.value)} placeholder="http://localhost:11434" className="form-input" />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Model</label>
                        <input value={ollamaModel} onChange={(e) => setOllamaModel(e.target.value)} placeholder="llama3.2" className="form-input" />
                    </div>
                </>
            );
        }

        return (
            <>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Gemini API Key</label>
                    <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="Enter Gemini key..." className="form-input" id="gemini-api-key-input" />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Model</label>
                    <input value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} placeholder="gemini-2.0-flash" className="form-input" />
                </div>
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '0.75rem', marginBottom: '1rem', fontWeight: '600' }}>
                    Get a Gemini API key from Google AI Studio <ExternalLink size={12} />
                </a>
            </>
        );
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div className="glass-card modal-card" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Key size={20} /> AI Configuration
                        </h2>
                        <p style={{ marginBottom: 0 }}>Choose how ResumeForge should power AI writing tools.</p>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ flexShrink: 0 }}>
                        <X size={18} />
                    </button>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Provider</label>
                    <select value={provider} onChange={(e) => setProvider(e.target.value)} className="form-input">
                        <option value="gemini">Gemini</option>
                        <option value="openai">OpenAI-compatible</option>
                        <option value="openrouter">OpenRouter</option>
                        <option value="ollama">Ollama local</option>
                    </select>
                </div>

                {renderProviderFields()}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }}>
                        {saved ? 'SAVED' : 'SAVE SETTINGS'}
                    </button>
                    <button onClick={handleClearProvider} className="btn btn-danger">
                        CLEAR
                    </button>
                </div>

                <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginTop: '1rem', lineHeight: 1.5 }}>
                    Keys are stored locally in this browser. OpenAI-compatible and OpenRouter keys are used directly from the client.
                </p>
            </motion.div>
        </div>
    );
};

export default SettingsModal;
