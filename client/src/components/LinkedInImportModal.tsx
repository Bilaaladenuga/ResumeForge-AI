'use client';
import React, { useState, useCallback } from 'react';
import { Linkedin, X, Loader2, CheckCircle, AlertTriangle, Sparkles, Eye, Upload } from 'lucide-react';
import { parseLinkedInProfile, linkedInToFormData, parseWithAI } from '../services/linkedinParser';
import { FormData } from '../types';

interface LinkedInImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: Partial<FormData>) => void;
}

const LinkedInImportModal: React.FC<LinkedInImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [rawText, setRawText] = useState('');
    const [step, setStep] = useState<'paste' | 'preview' | 'processing' | 'done'>('paste');
    const [parsedData, setParsedData] = useState<Partial<FormData> | null>(null);
    const [error, setError] = useState('');
    const [useAI, setUseAI] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);

    const handleParse = useCallback(async () => {
        if (!rawText.trim()) {
            setError('Please paste your LinkedIn profile text first.');
            return;
        }

        setStep('processing');
        setError('');

        try {
            let result: Partial<FormData>;

            if (useAI) {
                setStep('processing');
                result = await parseWithAI(rawText);
            } else {
                const parsed = parseLinkedInProfile(rawText);
                result = linkedInToFormData(parsed);
            }

            setParsedData(result);
            setStep('preview');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse LinkedIn profile. Please try again or use a different format.');
            setStep('paste');
        }
    }, [rawText, useAI]);

    const handleConfirmImport = useCallback(() => {
        if (parsedData) {
            onImport(parsedData);
            // Reset and close
            setRawText('');
            setParsedData(null);
            setStep('paste');
            setError('');
            onClose();
        }
    }, [parsedData, onImport, onClose]);

    const handleClose = useCallback(() => {
        setRawText('');
        setParsedData(null);
        setStep('paste');
        setError('');
        onClose();
    }, [onClose]);

    if (!isOpen) return null;

    const getFieldCount = (data: Partial<FormData>): number => {
        let count = 0;
        if (data.firstName) count++;
        if (data.lastName) count++;
        if (data.designation) count++;
        if (data.email) count++;
        if (data.address) count++;
        if (data.summary && data.summary.length > 20) count++;
        if (data.skillsRaw) count++;
        if (data.experiences && data.experiences.length > 0) count += data.experiences.length;
        if (data.educations && data.educations.length > 0) count += data.educations.length;
        return count;
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div
                className="glass-card linkedin-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '620px', width: '100%' }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: 'rgba(10, 102, 194, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#0a66c2'
                        }}>
                            <Linkedin size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.1rem' }}>
                                Import from LinkedIn
                            </h2>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>
                                Auto-fill your resume from your LinkedIn profile
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="btn-icon-sm" style={{ color: 'var(--text-dim)' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Instructions (collapsible) */}
                {showInstructions && (
                    <div style={{
                        background: 'rgba(10, 102, 194, 0.05)',
                        border: '1px solid rgba(10, 102, 194, 0.15)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        marginBottom: '1.25rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.6,
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowInstructions(false)}
                            style={{
                                position: 'absolute', top: '0.5rem', right: '0.5rem',
                                background: 'none', border: 'none', color: 'var(--text-dim)',
                                cursor: 'pointer', padding: '2px'
                            }}
                        >
                            <X size={12} />
                        </button>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={14} color="var(--secondary)" /> How to import:
                        </div>
                        <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                            <li>Go to your <strong>LinkedIn profile page</strong></li>
                            <li>Click anywhere and press <strong>Ctrl+A</strong> / <strong>Cmd+A</strong> to select all</li>
                            <li>Press <strong>Ctrl+C</strong> / <strong>Cmd+C</strong> to copy</li>
                            <li>Paste below and click <strong>Parse Profile</strong></li>
                        </ol>
                    </div>
                )}

                {/* AI Toggle */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '1rem', padding: '0.5rem 0.75rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Sparkles size={14} color={useAI ? 'var(--secondary)' : 'var(--text-dim)'} />
                        Use AI for better parsing
                        {useAI && <span style={{ color: 'var(--secondary)', fontWeight: 600, fontSize: '0.7rem' }}>(requires AI key)</span>}
                    </div>
                    <button
                        onClick={() => setUseAI(!useAI)}
                        style={{
                            width: '36px', height: '20px', borderRadius: '10px', border: 'none',
                            background: useAI ? 'var(--secondary)' : 'rgba(255,255,255,0.1)',
                            cursor: 'pointer', position: 'relative', transition: 'var(--transition)',
                            padding: 0
                        }}
                    >
                        <span style={{
                            width: '16px', height: '16px', borderRadius: '50%',
                            background: '#fff', display: 'block',
                            position: 'absolute', top: '2px',
                            left: useAI ? '18px' : '2px',
                            transition: 'var(--transition)'
                        }} />
                    </button>
                </div>

                {/* Paste area */}
                {step === 'paste' && (
                    <>
                        <div style={{ position: 'relative' }}>
                            <textarea
                                className="form-input linkedin-textarea"
                                placeholder="Paste your LinkedIn profile text here...&#10;&#10;Tip: Go to LinkedIn, Ctrl+A, Ctrl+C, then paste here"
                                value={rawText}
                                onChange={(e) => { setRawText(e.target.value); setError(''); }}
                                style={{
                                    minHeight: '220px',
                                    fontSize: '0.78rem',
                                    fontFamily: 'monospace',
                                    lineHeight: 1.6,
                                    resize: 'vertical'
                                }}
                            />
                            {rawText.length > 0 && (
                                <span style={{
                                    position: 'absolute', bottom: '0.75rem', right: '0.75rem',
                                    fontSize: '0.6rem', color: 'var(--text-dim)',
                                    background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px'
                                }}>
                                    {rawText.length} chars
                                </span>
                            )}
                        </div>

                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '0.5rem 0.75rem', marginTop: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--danger)'
                            }}>
                                <AlertTriangle size={14} />
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                            <button
                                className="btn btn-accent btn-sm"
                                onClick={handleParse}
                                disabled={!rawText.trim()}
                                style={{ flex: 1 }}
                            >
                                <Upload size={14} /> Parse Profile
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={handleClose}>
                                Cancel
                            </button>
                        </div>
                    </>
                )}

                {/* Processing */}
                {step === 'processing' && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', padding: '3rem 2rem', gap: '1rem'
                    }}>
                        <Loader2 size={32} className="spin-animation" style={{ color: 'var(--secondary)' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {useAI ? 'Analyzing with AI...' : 'Parsing profile data...'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                            Extracting your experience, education, skills, and more
                        </div>
                    </div>
                )}

                {/* Preview */}
                {step === 'preview' && parsedData && (
                    <div>
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(16, 185, 129, 0.05)',
                            border: '1px solid rgba(16, 185, 129, 0.15)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <CheckCircle size={18} color="var(--success)" />
                            <div>
                                <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                                    {getFieldCount(parsedData)} fields extracted
                                </strong>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>
                                    {useAI ? 'AI-enhanced' : 'Regex-based'} parsing — review the data below
                                </span>
                            </div>
                        </div>

                        {/* Preview details */}
                        <div className="linkedin-preview">
                            {parsedData.firstName && (
                                <div className="linkedin-preview-item">
                                    <span className="linkedin-preview-label">Name</span>
                                    <span className="linkedin-preview-value">
                                        {parsedData.firstName} {parsedData.lastName}
                                    </span>
                                </div>
                            )}
                            {parsedData.designation && (
                                <div className="linkedin-preview-item">
                                    <span className="linkedin-preview-label">Role</span>
                                    <span className="linkedin-preview-value">{parsedData.designation}</span>
                                </div>
                            )}
                            {parsedData.address && (
                                <div className="linkedin-preview-item">
                                    <span className="linkedin-preview-label">Location</span>
                                    <span className="linkedin-preview-value">{parsedData.address}</span>
                                </div>
                            )}
                            {parsedData.summary && (
                                <div className="linkedin-preview-item">
                                    <span className="linkedin-preview-label">Summary</span>
                                    <span className="linkedin-preview-value linkedin-preview-text">
                                        {parsedData.summary.length > 120
                                            ? parsedData.summary.substring(0, 120) + '...'
                                            : parsedData.summary}
                                    </span>
                                </div>
                            )}
                            {parsedData.experiences && parsedData.experiences.length > 0 && (
                                <div className="linkedin-preview-item">
                                    <span className="linkedin-preview-label">Experience</span>
                                    <span className="linkedin-preview-value">
                                        {parsedData.experiences.length} position{parsedData.experiences.length > 1 ? 's' : ''}
                                        <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginLeft: '0.5rem' }}>
                                            {parsedData.experiences.map(e => e.title).filter(Boolean).join(', ')}
                                        </span>
                                    </span>
                                </div>
                            )}
                            {parsedData.educations && parsedData.educations.length > 0 && (
                                <div className="linkedin-preview-item">
                                    <span className="linkedin-preview-label">Education</span>
                                    <span className="linkedin-preview-value">
                                        {parsedData.educations.length} entr{parsedData.educations.length > 1 ? 'ies' : 'y'}
                                        <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginLeft: '0.5rem' }}>
                                            {parsedData.educations.map(e => e.school).filter(Boolean).join(', ')}
                                        </span>
                                    </span>
                                </div>
                            )}
                            {parsedData.skillsRaw && (
                                <div className="linkedin-preview-item">
                                    <span className="linkedin-preview-label">Skills</span>
                                    <span className="linkedin-preview-value">
                                        {parsedData.skillsRaw.split(',').length} skills
                                    </span>
                                </div>
                            )}
                        </div>

                        <div style={{
                            marginTop: '1rem', fontSize: '0.72rem', color: 'var(--text-dim)',
                            background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem 0.75rem',
                            borderRadius: 'var(--radius-sm)', lineHeight: 1.5
                        }}>
                            <Eye size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            The data above will be imported into the form. You can edit any field after import.
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleConfirmImport}
                                style={{ flex: 1 }}
                            >
                                <Upload size={14} /> Import to Resume
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setStep('paste')}>
                                Back to Edit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinkedInImportModal;
