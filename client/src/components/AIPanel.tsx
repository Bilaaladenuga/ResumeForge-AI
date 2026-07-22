import React, { useState } from 'react';
import { Cpu, Sparkles, Target, Wand2, Wrench, FileText, Activity, Copy, Check } from 'lucide-react';
import { FormData, ATSData, LoadingState, WritingStyle, WRITING_STYLES } from '../types';
import { getSavedStyle, saveStyle } from '../services/prompts';
import {
    generateSummary,
    tailorSummary,
    powerUpBullet,
    generateSkills,
    checkApiKey,
    generateCoverLetter,
    analyzeATSCompatibility,
    rewriteSummaryStyle,
    rewriteExperienceBullets,
    rewriteSkillsStyle,
    generateFallbackSummary,
    generateFallbackBullet,
    generateFallbackCoverLetter,
    generateFallbackSkills,
    generateFallbackATS,
    generateFallbackRewriteSummary,
    generateFallbackRewriteBullets,
    getProviderConfig
} from '../services/ai';

interface AIPanelProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    industry: string;
    onOpenSettings: () => void;
}

const AIPanel = ({ formData, setFormData, industry, onOpenSettings }: AIPanelProps) => {
    const [loading, setLoading] = useState<LoadingState>({});
    const [error, setError] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [bulletInput, setBulletInput] = useState('');
    const [bulletResult, setBulletResult] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [atsData, setAtsData] = useState<ATSData | null>(null);
    const [copied, setCopied] = useState(false);

    const [writingStyle, setWritingStyle] = useState<WritingStyle>(getSavedStyle());
    const hasApiKey = checkApiKey();
    const providerConfig = getProviderConfig();

    const getAIErrorMessage = (err: unknown): string => {
        const message = (err as Error)?.message || '';

        if (message.includes('429') || message.toLowerCase().includes('quota')) {
            return `${providerConfig.label} could not generate this because the provider quota or rate limit was reached. ResuCraft used a built-in fallback where available.`;
        }

        if (message.toLowerCase().includes('api key') || message.includes('403') || message.includes('401')) {
            return `${providerConfig.label} could not generate this. Please check that the provider settings are valid. ResuCraft used a built-in fallback where available.`;
        }

        return 'AI generation failed. ResuCraft used a built-in fallback where available.';
    };

    const handleAIError = (label: string, err: unknown) => {
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
            }, writingStyle);
            setFormData(prev => ({ ...prev, summary: result }));
        } catch (err) {
            handleAIError('Summary generation', err);
            setFormData(prev => ({
                ...prev,
                summary: generateFallbackSummary({
                    name: `${prev.firstName || ''} ${prev.lastName || ''}`.trim(),
                    role: prev.designation || '',
                    experience: (prev.experiences || []).map(e => `${e.title} at ${e.company}: ${e.description}`).join('. '),
                    skills: prev.skillsRaw || '',
                    industry
                }, writingStyle)
            }));
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
            }, writingStyle);
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
            }, writingStyle);
            setBulletResult(result);
        } catch (err) {
            handleAIError('Power-up', err);
            setBulletResult(generateFallbackBullet({
                bulletText: bulletInput,
                role: formData.designation || '',
                industry
            }, writingStyle));
        } finally {
            setLoading(prev => ({ ...prev, powerup: false }));
        }
    };

    const handleEnhanceSkills = async () => {
        setError('');
        setLoading(prev => ({ ...prev, skills: true }));
        try {
            if (hasApiKey) {
                const result = await generateSkills({
                    role: formData.designation || '',
                    rawSkills: formData.skillsRaw || '',
                    industry
                }, writingStyle);
                setFormData(prev => ({ ...prev, skillsRaw: result }));
            } else {
                const fallback = generateFallbackSkills({
                    role: formData.designation || '',
                    rawSkills: formData.skillsRaw || '',
                    industry
                });
                setFormData(prev => ({ ...prev, skillsRaw: fallback }));
            }
        } catch (err) {
            handleAIError('Skills enhancement', err);
            const fallback = generateFallbackSkills({
                role: formData.designation || '',
                rawSkills: formData.skillsRaw || '',
                industry
            });
            if (fallback) setFormData(prev => ({ ...prev, skillsRaw: fallback }));
        } finally {
            setLoading(prev => ({ ...prev, skills: false }));
        }
    };

    const handleGenerateCoverLetter = async () => {
        if (!jobDescription.trim()) return;
        setError('');
        setLoading(prev => ({ ...prev, coverletter: true }));
        try {
            if (hasApiKey) {
                const result = await generateCoverLetter({
                    name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
                    role: formData.designation || '',
                    experience: (formData.experiences || []).map(e => `${e.title} at ${e.company}`).join(', '),
                    skills: formData.skillsRaw || '',
                    jobDescription,
                    industry
                }, writingStyle);
                setCoverLetter(result);
            } else {
                setCoverLetter(generateFallbackCoverLetter({
                    name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Applicant',
                    role: formData.designation || '',
                    experience: (formData.experiences || []).map(e => `${e.title} at ${e.company}`).join(', '),
                    skills: formData.skillsRaw || '',
                    jobDescription,
                    industry
                }, writingStyle));
            }
        } catch (err) {
            handleAIError('Cover letter generation', err);
            setCoverLetter(generateFallbackCoverLetter({
                name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Applicant',
                role: formData.designation || '',
                experience: (formData.experiences || []).map(e => `${e.title} at ${e.company}`).join(', '),
                skills: formData.skillsRaw || '',
                jobDescription,
                industry
            }, writingStyle));
        } finally {
            setLoading(prev => ({ ...prev, coverletter: false }));
        }
    };

    const handleATSCheck = async () => {
        if (!jobDescription.trim()) return;
        setError('');
        setLoading(prev => ({ ...prev, ats: true }));

        const parseATSResult = (result: string) => {
            const scoreMatch = result.match(/SCORE:\s*(\d+)/);
            const tips = result.split('\n').filter(line => line.includes('TIP')).map(line => line.split(':').slice(1).join(':').trim());
            setAtsData({
                score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
                tips: tips.length ? tips : ["Focus on core keywords", "Quantify achievements", "Align role titles"]
            });
        };

        try {
            if (hasApiKey) {
                const result = await analyzeATSCompatibility({
                    role: formData.designation || '',
                    summary: formData.summary || '',
                    skills: formData.skillsRaw || '',
                    experience: (formData.experiences || []).map(e => `${e.title} at ${e.company}: ${e.description}`).join('. '),
                    jobDescription
                }, writingStyle);
                parseATSResult(result);
            } else {
                const fallback = generateFallbackATS({
                    role: formData.designation || '',
                    summary: formData.summary || '',
                    skills: formData.skillsRaw || '',
                    experience: (formData.experiences || []).map(e => `${e.title} at ${e.company}: ${e.description}`).join('. '),
                    jobDescription
                });
                parseATSResult(fallback);
                setError('AI not configured. Showing keyword-based analysis instead.');
            }
        } catch (err) {
            handleAIError('ATS check', err);
            const fallback = generateFallbackATS({
                role: formData.designation || '',
                summary: formData.summary || '',
                skills: formData.skillsRaw || '',
                experience: (formData.experiences || []).map(e => `${e.title} at ${e.company}: ${e.description}`).join('. '),
                jobDescription
            });
            parseATSResult(fallback);
        } finally {
            setLoading(prev => ({ ...prev, ats: false }));
        }
    };

    /* ---------- Rewrite in Style handlers ---------- */

    const handleRewriteSummary = async () => {
        if (!formData.summary) return;
        setError('');
        setLoading(prev => ({ ...prev, rewriteSummary: true }));
        try {
            if (hasApiKey) {
                const result = await rewriteSummaryStyle(formData.summary, industry, writingStyle);
                setFormData(prev => ({ ...prev, summary: result }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    summary: generateFallbackRewriteSummary(prev.summary, writingStyle)
                }));
            }
        } catch (err) {
            handleAIError('Style rewrite', err);
            setFormData(prev => ({
                ...prev,
                summary: generateFallbackRewriteSummary(prev.summary, writingStyle)
            }));
        } finally {
            setLoading(prev => ({ ...prev, rewriteSummary: false }));
        }
    };

    const handleRewriteExperience = async () => {
        if (!formData.experiences || formData.experiences.length === 0) return;
        setError('');
        setLoading(prev => ({ ...prev, rewriteExp: true }));
        try {
            if (hasApiKey) {
                const result = await rewriteExperienceBullets(
                    formData.experiences,
                    formData.designation || '',
                    industry,
                    writingStyle
                );
                // Parse result: split by double newlines (between entries),
                // each block's lines = bullets for that entry
                const blocks = result
                    .split(/\n\s*\n/)
                    .map(b => b.split('\n').filter((l: string) => l.trim().length > 0))
                    .filter((b: string[]) => b.length > 0);

                setFormData(prev => ({
                    ...prev,
                    experiences: prev.experiences.map((exp, idx) => {
                        const newBullets = blocks[idx] || [];
                        return {
                            ...exp,
                            description: newBullets.join('\n')
                        };
                    })
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    experiences: prev.experiences.map(exp => ({
                        ...exp,
                        description: generateFallbackRewriteBullets(exp.description, writingStyle)
                    }))
                }));
            }
        } catch (err) {
            handleAIError('Experience rewrite', err);
            setFormData(prev => ({
                ...prev,
                experiences: prev.experiences.map(exp => ({
                    ...exp,
                    description: generateFallbackRewriteBullets(exp.description, writingStyle)
                }))
            }));
        } finally {
            setLoading(prev => ({ ...prev, rewriteExp: false }));
        }
    };

    const handleRewriteSkills = async () => {
        if (!formData.skillsRaw) return;
        if (!hasApiKey) {
            setError('AI key required — skills refinement needs a configured AI provider.');
            return;
        }
        setError('');
        setLoading(prev => ({ ...prev, rewriteSkills: true }));
        try {
            const result = await rewriteSkillsStyle(
                formData.skillsRaw,
                formData.designation || '',
                industry,
                writingStyle
            );
            setFormData(prev => ({ ...prev, skillsRaw: result }));
        } catch (err) {
            handleAIError('Skills rewrite', err);
        } finally {
            setLoading(prev => ({ ...prev, rewriteSkills: false }));
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(coverLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const RewriteRow = ({ icon, label, isEmpty, loadingKey, onRewrite }: {
        icon: string; label: string; isEmpty: boolean; loadingKey: string; onRewrite: () => void;
    }) => (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.5rem 0.6rem', marginBottom: '0.4rem',
            background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)'
        }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {icon} {label} {isEmpty && <span style={{ color: 'var(--danger)', fontSize: '0.65rem' }}>(empty)</span>}
            </span>
            <button
                className="btn btn-ghost btn-sm"
                onClick={onRewrite}
                disabled={!!loading[loadingKey] || isEmpty}
                style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem' }}
            >
                {loading[loadingKey] ? 'Rewriting...' : 'Rewrite'}
            </button>
        </div>
    );

    return (
        <div className="glass-card ai-panel">
            <div className="ai-panel-header">
                <Cpu size={20} color="var(--accent)" />
                <h3 className="gradient-text-accent">AI Assistant</h3>
                {/* Writing Style Selector */}
                <div style={{
                    display: 'flex', gap: '3px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px',
                    marginLeft: 'auto'
                }}>
                    {(Object.keys(WRITING_STYLES) as WritingStyle[]).map(s => (
                        <button
                            key={s}
                            onClick={() => { setWritingStyle(s); saveStyle(s); }}
                            style={{
                                padding: '3px 8px',
                                fontSize: '0.6rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                background: writingStyle === s ? 'var(--secondary)' : 'transparent',
                                color: writingStyle === s ? '#000' : 'var(--text-dim)',
                                transition: 'var(--transition)',
                                whiteSpace: 'nowrap'
                            }}
                            title={WRITING_STYLES[s].description}
                        >
                            {WRITING_STYLES[s].icon}{' '}{WRITING_STYLES[s].label}
                        </button>
                    ))}
                </div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {providerConfig.label}
                </span>
                {!hasApiKey && (
                    <button className="btn btn-sm btn-accent" onClick={onOpenSettings}>
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

            {/* ✏️ Rewrite in Style */}
            <div className="ai-feature">
                <h4><Sparkles size={14} /> Rewrite in Style</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                    Rewrite sections to match the selected <strong>{WRITING_STYLES[writingStyle].label}</strong> style ({WRITING_STYLES[writingStyle].icon}).
                </p>

                <RewriteRow
                    icon="📝"
                    label="Summary"
                    isEmpty={!formData.summary}
                    loadingKey="rewriteSummary"
                    onRewrite={handleRewriteSummary}
                />
                <RewriteRow
                    icon="💼"
                    label="Experience Bullets"
                    isEmpty={!formData.experiences || formData.experiences.length === 0}
                    loadingKey="rewriteExp"
                    onRewrite={handleRewriteExperience}
                />
                <RewriteRow
                    icon="🔧"
                    label="Skills"
                    isEmpty={!formData.skillsRaw}
                    loadingKey="rewriteSkills"
                    onRewrite={handleRewriteSkills}
                />
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
                            <div className="ats-score-circle" style={{ '--score': `${atsData.score}%` } as React.CSSProperties}>
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
