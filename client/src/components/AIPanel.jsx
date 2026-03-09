import React, { useState } from 'react';
import { Cpu, Sparkles, Target, Wand2, Wrench } from 'lucide-react';
import { generateSummary, tailorSummary, powerUpBullet, generateSkills, checkApiKey } from '../services/ai';

const AIPanel = ({ formData, setFormData, industry, onOpenSettings }) => {
    const [loading, setLoading] = useState({});
    const [jobDescription, setJobDescription] = useState('');
    const [bulletInput, setBulletInput] = useState('');
    const [bulletResult, setBulletResult] = useState('');

    const hasApiKey = checkApiKey();

    const handleGenerateSummary = async () => {
        if (!hasApiKey) { onOpenSettings(); return; }
        setLoading(prev => ({ ...prev, summary: true }));
        try {
            const result = await generateSummary({
                name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
                role: formData.designation || '',
                experience: (formData.experiences || []).map(e => `${e.title} at ${e.company}: ${e.description}`).join('. '),
                skills: formData.skillsRaw || '',
                industry
            });
            setFormData(prev => ({ ...prev, summary: result }));
        } catch (err) {
            console.error('Summary generation failed:', err);
        } finally {
            setLoading(prev => ({ ...prev, summary: false }));
        }
    };

    const handleTailor = async () => {
        if (!hasApiKey || !jobDescription.trim()) return;
        setLoading(prev => ({ ...prev, tailor: true }));
        try {
            const result = await tailorSummary({
                currentSummary: formData.summary || '',
                jobDescription
            });
            setFormData(prev => ({ ...prev, summary: result }));
        } catch (err) {
            console.error('Tailoring failed:', err);
        } finally {
            setLoading(prev => ({ ...prev, tailor: false }));
        }
    };

    const handlePowerUp = async () => {
        if (!hasApiKey || !bulletInput.trim()) return;
        setLoading(prev => ({ ...prev, powerup: true }));
        try {
            const result = await powerUpBullet({
                bulletText: bulletInput,
                role: formData.designation || '',
                industry
            });
            setBulletResult(result);
        } catch (err) {
            console.error('Power-up failed:', err);
        } finally {
            setLoading(prev => ({ ...prev, powerup: false }));
        }
    };

    const handleEnhanceSkills = async () => {
        if (!hasApiKey) { onOpenSettings(); return; }
        setLoading(prev => ({ ...prev, skills: true }));
        try {
            const result = await generateSkills({
                role: formData.designation || '',
                rawSkills: formData.skillsRaw || '',
                industry
            });
            setFormData(prev => ({ ...prev, skillsRaw: result }));
        } catch (err) {
            console.error('Skills enhancement failed:', err);
        } finally {
            setLoading(prev => ({ ...prev, skills: false }));
        }
    };

    return (
        <div className="glass-card ai-panel">
            <div className="ai-panel-header">
                <Cpu size={20} color="var(--accent)" />
                <h3 className="gradient-text-accent">AI Assistant</h3>
                {!hasApiKey && (
                    <button className="btn btn-sm btn-accent" onClick={onOpenSettings} style={{ marginLeft: 'auto' }}>
                        Configure
                    </button>
                )}
            </div>

            {/* Summary Generator */}
            <div className="ai-feature">
                <h4><Sparkles size={14} /> AI Summary Generator</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                    Fill in your details above, then let AI craft a professional summary tailored to the {industry || 'general'} industry.
                </p>
                <button
                    className="btn btn-accent btn-sm"
                    onClick={handleGenerateSummary}
                    disabled={loading.summary}
                    style={{ width: '100%' }}
                >
                    {loading.summary ? (
                        <><div className="spinner" style={{ width: 14, height: 14 }}></div> Generating...</>
                    ) : 'Generate Summary'}
                </button>
            </div>

            {/* Resume Tailor */}
            <div className="ai-feature">
                <h4><Target size={14} /> Resume Tailor</h4>
                <textarea
                    className="form-input"
                    placeholder="Paste a job description to tailor your summary..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    style={{ minHeight: '80px', fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <button
                    className="btn btn-sm btn-secondary"
                    onClick={handleTailor}
                    disabled={loading.tailor || !jobDescription.trim() || !formData.summary}
                    style={{ width: '100%' }}
                >
                    {loading.tailor ? 'Tailoring...' : 'Tailor Summary'}
                </button>
            </div>

            {/* Bullet Power-Up */}
            <div className="ai-feature">
                <h4><Wand2 size={14} /> Bullet Power-Up</h4>
                <input
                    className="form-input"
                    placeholder="e.g. Managed a team of engineers"
                    value={bulletInput}
                    onChange={(e) => setBulletInput(e.target.value)}
                    style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}
                />
                <button
                    className="btn btn-sm btn-secondary"
                    onClick={handlePowerUp}
                    disabled={loading.powerup || !bulletInput.trim()}
                    style={{ width: '100%', marginBottom: bulletResult ? '0.75rem' : 0 }}
                >
                    {loading.powerup ? 'Enhancing...' : 'Power Up'}
                </button>
                {bulletResult && (
                    <div style={{
                        background: 'rgba(6, 182, 212, 0.05)',
                        border: '1px solid rgba(6, 182, 212, 0.15)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.75rem',
                        fontSize: '0.8rem',
                        color: 'var(--text)',
                        lineHeight: 1.5
                    }}>
                        <span style={{ color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Result:</span>
                        {bulletResult}
                    </div>
                )}
            </div>

            {/* Enhance Skills */}
            <div className="ai-feature">
                <h4><Wrench size={14} /> Enhance Skills</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                    Let AI refine and organize your skills list for maximum ATS impact.
                </p>
                <button
                    className="btn btn-sm btn-secondary"
                    onClick={handleEnhanceSkills}
                    disabled={loading.skills || !formData.skillsRaw}
                    style={{ width: '100%' }}
                >
                    {loading.skills ? 'Enhancing...' : 'AI Enhance Skills'}
                </button>
            </div>
        </div>
    );
};

export default AIPanel;
