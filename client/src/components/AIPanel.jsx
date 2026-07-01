import React, { useState } from 'react';
import { Cpu, Sparkles, Target, Wand2, Wrench, FileText, Activity, Copy, Check } from 'lucide-react';
import { generateSummary, tailorSummary, powerUpBullet, generateSkills, checkApiKey, generateCoverLetter, analyzeATSCompatibility } from '../services/ai';

const AIPanel = ({ formData, setFormData, industry, onOpenSettings }) => {
    const [loading, setLoading] = useState({});
    const [error, setError] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [bulletInput, setBulletInput] = useState('');
    const [bulletResult, setBulletResult] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [atsData, setAtsData] = useState(null);
    const [copied, setCopied] = useState(false);

    const hasApiKey = checkApiKey();

    const getAIErrorMessage = (err) => {
        const message = err?.message || '';

        if (message.includes('429') || message.toLowerCase().includes('quota')) {
            return 'Gemini could not generate this because the API key has reached its quota or has no free-tier quota available for this model. Check your Google AI Studio quota/billing or try again later.';
        }

        if (message.toLowerCase().includes('api key') || message.includes('403') || message.includes('401')) {
            return 'Gemini could not generate this. Please check that your API key is valid and has access to the Gemini API.';
        }

        return 'AI generation failed. Please try again in a moment.';
    };

    const handleAIError = (label, err) => {
        console.error(`${label} failed:`, err);
        setError(getAIErrorMessage(err));
    };

    const handleGenerateSummary = async () => {
        if (!hasApiKey) { onOpenSettings(); return; }
        setError('');
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
            handleAIError('Summary generation', err);
        } finally {
            setLoading(prev => ({ ...prev, summary: false }));
        }
    };

    const handleTailor = async () => {
        if (!hasApiKey || !jobDescription.trim()) return;
        setError('');
        setLoading(prev => ({ ...prev, tailor: true }));
        try {
            const result = await tailorSummary({
                currentSummary: formData.summary || '',
                jobDescription
            });
            setFormData(prev => ({ ...prev, summary: result }));
        } catch (err) {
            handleAIError('Tailoring', err);
        } finally {
            setLoading(prev => ({ ...prev, tailor: false }));
        }
    };

    const handlePowerUp = async () => {
        if (!hasApiKey || !bulletInput.trim()) return;
        setError('');
        setLoading(prev => ({ ...prev, powerup: true }));
        try {
            const result = await powerUpBullet({
                bulletText: bulletInput,
                role: formData.designation || '',
                industry
            });
            setBulletResult(result);
        } catch (err) {
            handleAIError('Power-up', err);
        } finally {
            setLoading(prev => ({ ...prev, powerup: false }));
        }
    };

    const handleEnhanceSkills = async () => {
        if (!hasApiKey) { onOpenSettings(); return; }
        setError('');
        setLoading(prev => ({ ...prev, skills: true }));
        try {
            const result = await generateSkills({
                role: formData.designation || '',
                rawSkills: formData.skillsRaw || '',
                industry
            });
            setFormData(prev => ({ ...prev, skillsRaw: result }));
        } catch (err) {
            handleAIError('Skills enhancement', err);
        } finally {
            setLoading(prev => ({ ...prev, skills: false }));
        }
    };

    const handleGenerateCoverLetter = async () => {
        if (!hasApiKey || !jobDescription.trim()) return;
        setError('');
        setLoading(prev => ({ ...prev, coverletter: true }));
        try {
            const result = await generateCoverLetter({
                name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
                role: formData.designation || '',
                experience: (formData.experiences || []).map(e => `${e.title} at ${e.company}`).join(', '),
                skills: formData.skillsRaw || '',
                jobDescription,
                industry
            });
            setCoverLetter(result);
        } catch (err) {
            handleAIError('Cover letter generation', err);
        } finally {
            setLoading(prev => ({ ...prev, coverletter: false }));
        }
    };

    const handleATSCheck = async () => {
        if (!hasApiKey || !jobDescription.trim()) return;
        setError('');
        setLoading(prev => ({ ...prev, ats: true }));
        try {
            const result = await analyzeATSCompatibility({
                role: formData.designation || '',
                summary: formData.summary || '',
                skills: formData.skillsRaw || '',
                experience: (formData.experiences || []).map(e => `${e.title} at ${e.company}: ${e.description}`).join('. '),
                jobDescription
            });

            // Parse the custom format
            const scoreMatch = result.match(/SCORE:\s*(\d+)/);
            const tips = result.split('\n').filter(line => line.includes('TIP')).map(line => line.split(':')[1].trim());

            setAtsData({
                score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
                tips: tips.length ? tips : ["Focus on core keywords", "Quantify achievements", "Align role titles"]
            });
        } catch (err) {
            handleAIError('ATS check', err);
        } finally {
            setLoading(prev => ({ ...prev, ats: false }));
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(coverLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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

            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text)',
                    fontSize: '0.75rem',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    padding: '0.75rem'
                }}>
                    {error}
                </div>
            )}

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

            {/* AI Cover Letter */}
            <div className="ai-feature">
                <h4><FileText size={14} /> AI Cover Letter</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                    Craft a professional cover letter that bridges your resume to this job.
                </p>
                <button
                    className="btn btn-sm btn-secondary"
                    onClick={handleGenerateCoverLetter}
                    disabled={loading.coverletter || !jobDescription.trim()}
                    style={{ width: '100%', marginBottom: coverLetter ? '1rem' : 0 }}
                >
                    {loading.coverletter ? 'Writing...' : 'Generate Cover Letter'}
                </button>
                {coverLetter && (
                    <div className="ai-result-box">
                        <div className="ai-result-header">
                            <span>Cover Letter Result</span>
                            <button className="btn-icon-sm" onClick={copyToClipboard}>
                                {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <div className="ai-result-content pre-wrap">{coverLetter}</div>
                    </div>
                )}
            </div>

            {/* ATS Compatibility Score */}
            <div className="ai-feature">
                <h4><Activity size={14} /> ATS Health Check</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                    Scan your resume against the Job Description to see how you rank.
                </p>
                <button
                    className="btn btn-sm btn-accent"
                    onClick={handleATSCheck}
                    disabled={loading.ats || !jobDescription.trim()}
                    style={{ width: '100%', marginBottom: atsData ? '1rem' : 0 }}
                >
                    {loading.ats ? 'Analyzing...' : 'Run ATS Audit'}
                </button>
                {atsData && (
                    <div className="ats-result">
                        <div className="ats-score-container">
                            <div className="ats-score-circle" style={{ '--score': `${atsData.score}%` }}>
                                <span>{atsData.score}</span>
                            </div>
                            <div className="ats-score-info">
                                <strong>ATS Match Score</strong>
                                <span>{atsData.score > 80 ? 'Excellent Match!' : atsData.score > 50 ? 'Strong Potential' : 'Needs Optimization'}</span>
                            </div>
                        </div>
                        <div className="ats-tips">
                            <span className="tips-label">Optimization Tips:</span>
                            <ul>
                                {atsData.tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIPanel;
