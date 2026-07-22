'use client';
import React, { useMemo } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { scoreResume, ResumeScore } from '../services/resumeScorer';
import { FormData } from '../types';

interface ResumeScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: FormData;
}

const ResumeScoreModal: React.FC<ResumeScoreModalProps> = ({ isOpen, onClose, formData }) => {
    const score = useMemo(() => scoreResume(formData), [formData]);
    const pct = score.maxTotal > 0 ? Math.round((score.total / score.maxTotal) * 100) : 0;

    if (!isOpen) return null;

    const totalTips = score.categories.reduce((sum, cat) => sum + cat.tips.length, 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="glass-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '560px',
                    width: '100%',
                    padding: '2rem',
                    maxHeight: '85vh',
                    overflowY: 'auto'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: 'rgba(6, 182, 212, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--accent)'
                        }}>
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.1rem' }}>
                                Resume Score
                            </h2>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: 0 }}>
                                Algorithmic analysis based on best practices
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-icon-sm" style={{ color: 'var(--text-dim)' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Big Score Circle */}
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '1.5rem 0 1rem'
                }}>
                    <div style={{
                        position: 'relative',
                        width: '120px', height: '120px',
                        borderRadius: '50%',
                        background: `conic-gradient(${score.overallColor} ${pct}%, rgba(255,255,255,0.05) 0)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '0.75rem'
                    }}>
                        <div style={{
                            position: 'absolute', width: '104px', height: '104px',
                            borderRadius: '50%', background: 'var(--bg-deep)'
                        }} />
                        <span style={{
                            position: 'relative', zIndex: 1,
                            fontSize: '2rem', fontWeight: 900,
                            color: score.overallColor
                        }}>
                            {score.total}
                        </span>
                    </div>
                    <div style={{
                        fontSize: '0.8rem', color: score.overallColor,
                        fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '1.5px'
                    }}>
                        {score.overallLabel}
                    </div>
                </div>

                {totalTips > 0 && (
                    <div style={{
                        background: 'rgba(245, 158, 11, 0.06)',
                        border: '1px solid rgba(245, 158, 11, 0.12)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                            {totalTips} Improvement Suggestion{totalTips !== 1 ? 's' : ''}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {score.categories.map((cat) =>
                                cat.tips.map((tip, i) => (
                                    <div key={`${cat.label}-${i}`} style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        paddingLeft: '1rem',
                                        position: 'relative',
                                        lineHeight: 1.5
                                    }}>
                                        <span style={{
                                            position: 'absolute', left: 0, top: '0.15rem',
                                            fontSize: '0.65rem'
                                        }}>
                                            {cat.icon}
                                        </span>
                                        {tip}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Category Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {score.categories.map((cat) => {
                        const catPct = cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
                        return (
                            <div key={cat.label} style={{
                                padding: '0.6rem 0.75rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: 'var(--radius-sm)'
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    marginBottom: '0.3rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '0.85rem' }}>{cat.icon}</span>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)'
                                        }}>
                                            {cat.label}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: '0.72rem', fontWeight: 700,
                                        color: catPct >= 80 ? 'var(--success)' :
                                               catPct >= 50 ? 'var(--secondary)' : 'var(--danger)'
                                    }}>
                                        {cat.score}/{cat.maxScore}
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div style={{
                                    height: '4px',
                                    background: 'rgba(255,255,255,0.06)',
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${catPct}%`,
                                        background: catPct >= 80 ? 'var(--success)' :
                                                     catPct >= 50 ? 'var(--secondary)' : 'var(--danger)',
                                        borderRadius: '2px',
                                        transition: 'width 0.6s ease'
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Actions */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={onClose}
                        style={{ width: '100%' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeScoreModal;
