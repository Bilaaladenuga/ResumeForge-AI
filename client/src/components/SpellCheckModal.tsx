'use client';
import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, AlertTriangle, AlertCircle, CheckCircle, ChevronDown, ChevronUp,
    Sparkles, BookOpen, Pen, MessageSquare, Search
} from 'lucide-react';
import { checkResumeText, SpellCheckIssue } from '../services/spellcheckService';

const SEVERITY_COLORS: Record<string, string> = {
    high: 'var(--danger)',
    medium: 'var(--warning)',
    low: 'var(--text-dim)',
};

const SEVERITY_BG: Record<string, string> = {
    high: 'rgba(239, 68, 68, 0.08)',
    medium: 'rgba(245, 158, 11, 0.08)',
    low: 'rgba(107, 114, 128, 0.08)',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
    'spelling': <BookOpen size={14} />,
    'grammar': <MessageSquare size={14} />,
    'weak-language': <Pen size={14} />,
    'passive-voice': <Pen size={14} />,
    'buzzword': <Sparkles size={14} />,
};

const TYPE_LABELS: Record<string, string> = {
    'spelling': 'Spelling',
    'grammar': 'Grammar',
    'weak-language': 'Weak Language',
    'passive-voice': 'Passive Voice',
    'buzzword': 'Cliché / Buzzword',
};

const SECTION_LABELS: Record<string, string> = {
    'summary': 'Professional Summary',
    'experience_0': 'Experience Bullet 1',
    'experience_1': 'Experience Bullet 2',
    'experience_2': 'Experience Bullet 3',
    'experience_3': 'Experience Bullet 4',
    'experience_4': 'Experience Bullet 5',
    'experience_5': 'Experience Bullet 6',
    'experience_6': 'Experience Bullet 7',
    'experience_7': 'Experience Bullet 8',
    'experience_8': 'Experience Bullet 9',
    'experience_9': 'Experience Bullet 10',
    'experience': 'Experience',
    'projects': 'Projects',
    'education': 'Education',
    'achievements': 'Achievements',
};

function getSectionLabel(section: string): string {
    if (SECTION_LABELS[section]) return SECTION_LABELS[section];
    if (section.startsWith('experience_')) {
        const idx = parseInt(section.split('_')[1], 10);
        return `Experience Bullet ${idx + 1}`;
    }
    if (section.startsWith('project_')) {
        const idx = parseInt(section.split('_')[1], 10);
        return `Project ${idx + 1}`;
    }
    if (section.startsWith('education_')) {
        const idx = parseInt(section.split('_')[1], 10);
        return `Education ${idx + 1}`;
    }
    if (section.startsWith('achievement_')) {
        const idx = parseInt(section.split('_')[1], 10);
        return `Achievement ${idx + 1}`;
    }
    return section;
}

interface SpellCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: any;
}

const SpellCheckModal: React.FC<SpellCheckModalProps> = ({ isOpen, onClose, formData }) => {
    const result = useMemo(() => checkResumeText(formData), [formData]);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [filterType, setFilterType] = useState<string>('all');

    const toggleSection = useCallback((section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    }, []);

    // Auto-expand sections with issues
    React.useEffect(() => {
        if (isOpen) {
            const autoExpand: Record<string, boolean> = {};
            result.issues.forEach(issue => {
                const key = issue.section.startsWith('experience') ? 'experience' :
                            issue.section.startsWith('project') ? 'projects' :
                            issue.section.startsWith('education') ? 'education' :
                            issue.section.startsWith('achievement') ? 'achievements' : issue.section;
                autoExpand[key] = true;
            });
            setExpandedSections(autoExpand);
            setFilterType('all');
        }
    }, [isOpen, result]);

    // Group issues by section
    const grouped = useMemo(() => {
        const groups: Record<string, SpellCheckIssue[]> = {};
        const filtered = filterType === 'all'
            ? result.issues
            : result.issues.filter(i => i.type === filterType);

        filtered.forEach(issue => {
            const key = issue.section.startsWith('experience') ? 'experience' :
                        issue.section.startsWith('project') ? 'projects' :
                        issue.section.startsWith('education') ? 'education' :
                        issue.section.startsWith('achievement') ? 'achievements' : issue.section;
            if (!groups[key]) groups[key] = [];
            groups[key].push(issue);
        });
        return groups;
    }, [result, filterType]);

    const severityLabel = (score: number): { label: string; color: string } => {
        if (score >= 90) return { label: 'Excellent', color: 'var(--success)' };
        if (score >= 75) return { label: 'Good', color: 'var(--secondary)' };
        if (score >= 60) return { label: 'Needs Work', color: 'var(--warning)' };
        return { label: 'Needs Review', color: 'var(--danger)' };
    };

    const sv = severityLabel(result.score);

    // Build score ring conic gradient
    const scoreCircleBg = `conic-gradient(${sv.color} ${result.score}%, var(--border) ${result.score}%)`;

    const typeOptions = [
        { value: 'all', label: `All Issues (${result.total})` },
        { value: 'spelling', label: `Spelling (${result.byType.spelling || 0})` },
        { value: 'grammar', label: `Grammar (${result.byType.grammar || 0})` },
        { value: 'weak-language', label: `Weak Language (${result.byType['weak-language'] || 0})` },
        { value: 'passive-voice', label: `Passive Voice (${result.byType['passive-voice'] || 0})` },
        { value: 'buzzword', label: `Clichés (${result.byType.buzzword || 0})` },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    <motion.div
                        className="modal glass-card"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            maxWidth: '750px',
                            width: '90%',
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 0,
                            overflow: 'hidden'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.5rem 2rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Search size={18} color="var(--secondary)" />
                                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Spell & Grammar Check</h2>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={onClose}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Score + summary */}
                        <div style={{
                            padding: '1.25rem 2rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            flexShrink: 0,
                            flexWrap: 'wrap'
                        }}>
                            {/* Score circle */}
                            <div style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: '50%',
                                background: scoreCircleBg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                position: 'relative'
                            }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'var(--surface)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column'
                                }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                                        {result.score}
                                    </span>
                                    <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        /100
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: sv.color,
                                    marginBottom: '4px'
                                }}>
                                    {sv.label}
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {Object.entries(result.byType).map(([type, count]) => (
                                        <span key={type} style={{
                                            fontSize: '0.65rem',
                                            color: 'var(--text-dim)',
                                            background: 'var(--bg)',
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {TYPE_ICONS[type]}
                                            {count} {TYPE_LABELS[type]}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* All clear check */}
                            {result.total === 0 && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: 'var(--success)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>
                                    <CheckCircle size={18} /> No issues found!
                                </div>
                            )}
                        </div>

                        {/* Filter bar */}
                        {result.total > 0 && (
                            <div style={{
                                padding: '0.75rem 2rem',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                                flexShrink: 0
                            }}>
                                {typeOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        className={`btn btn-sm ${filterType === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => setFilterType(opt.value)}
                                        style={{ fontSize: '0.7rem' }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Issues list */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1rem 2rem'
                        }}>
                            {result.total === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem 0',
                                    color: 'var(--text-dim)'
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem'
                                    }}>
                                        <CheckCircle size={28} color="var(--success)" />
                                    </div>
                                    <p style={{ fontWeight: 600, color: 'var(--text)' }}>Your resume looks great!</p>
                                    <p style={{ fontSize: '0.8rem' }}>No spelling, grammar, or style issues were found.</p>
                                </div>
                            ) : (
                                Object.entries(grouped).map(([section, issues]) => (
                                    <div key={section} style={{ marginBottom: '0.5rem' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.5rem 0.75rem',
                                                background: 'var(--bg)',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                marginBottom: expandedSections[section] ? '0.25rem' : 0
                                            }}
                                            onClick={() => toggleSection(section)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
                                                    {getSectionLabel(section)}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    color: 'var(--text-dim)',
                                                    background: 'var(--surface)',
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '8px'
                                                }}>
                                                    {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                                                </span>
                                            </div>
                                            {expandedSections[section] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </div>

                                        <AnimatePresence>
                                            {expandedSections[section] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div style={{ paddingLeft: '0.5rem' }}>
                                                        {issues.map((issue, idx) => (
                                                            <div
                                                                key={idx}
                                                                style={{
                                                                    padding: '0.6rem 0.75rem',
                                                                    margin: '0.25rem 0',
                                                                    borderRadius: 'var(--radius-sm)',
                                                                    background: SEVERITY_BG[issue.severity] || 'var(--bg)',
                                                                    border: `1px solid ${SEVERITY_COLORS[issue.severity]}22`,
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                                    <div style={{
                                                                        color: SEVERITY_COLORS[issue.severity],
                                                                        flexShrink: 0,
                                                                        marginTop: '2px'
                                                                    }}>
                                                                        {issue.severity === 'high' ? <AlertCircle size={13} /> :
                                                                         issue.severity === 'medium' ? <AlertTriangle size={13} /> :
                                                                         <AlertCircle size={13} />}
                                                                    </div>
                                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '6px',
                                                                            marginBottom: '4px',
                                                                            flexWrap: 'wrap'
                                                                        }}>
                                                                            <span style={{
                                                                                fontSize: '0.6rem',
                                                                                textTransform: 'uppercase',
                                                                                letterSpacing: '0.5px',
                                                                                color: SEVERITY_COLORS[issue.severity],
                                                                                fontWeight: 600,
                                                                                background: `${SEVERITY_COLORS[issue.severity]}15`,
                                                                                padding: '0.1rem 0.35rem',
                                                                                borderRadius: '4px'
                                                                            }}>
                                                                                {issue.type === 'spelling' ? 'Spelling' :
                                                                                 issue.type === 'grammar' ? 'Grammar' :
                                                                                 issue.type === 'weak-language' ? 'Style' :
                                                                                 issue.type === 'passive-voice' ? 'Voice' :
                                                                                 issue.type === 'buzzword' ? 'Cliché' : issue.type}
                                                                            </span>
                                                                            <span style={{
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: 600,
                                                                                color: 'var(--text)',
                                                                                fontStyle: 'italic',
                                                                                background: 'rgba(0,0,0,0.15)',
                                                                                padding: '0.1rem 0.35rem',
                                                                                borderRadius: '4px',
                                                                                wordBreak: 'break-all'
                                                                            }}>
                                                                                {issue.text.length > 50 ? issue.text.substring(0, 50) + '...' : issue.text}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{
                                                                            fontSize: '0.75rem',
                                                                            color: 'var(--text-muted)',
                                                                            lineHeight: 1.4
                                                                        }}>
                                                                            <strong>Suggestion:</strong> {issue.suggestion}
                                                                        </div>
                                                                        {issue.context && (
                                                                            <div style={{
                                                                                marginTop: '4px',
                                                                                fontSize: '0.65rem',
                                                                                color: 'var(--text-dim)',
                                                                                background: 'rgba(0,0,0,0.1)',
                                                                                padding: '0.3rem 0.5rem',
                                                                                borderRadius: '4px',
                                                                                fontStyle: 'italic',
                                                                                lineHeight: 1.3,
                                                                                wordBreak: 'break-word'
                                                                            }}>
                                                                                &ldquo;...{issue.context.trim()}...&rdquo;
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '0.75rem 2rem',
                            borderTop: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0,
                            fontSize: '0.7rem',
                            color: 'var(--text-dim)'
                        }}>
                            <span>Checks run locally — no data sent to any server</span>
                            <button className="btn btn-ghost btn-sm" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SpellCheckModal;
