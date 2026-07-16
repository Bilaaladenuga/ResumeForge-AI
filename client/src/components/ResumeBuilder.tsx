'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Settings, Download, ArrowLeft, ShieldCheck, AlertCircle, Save, Upload, Trash2, Linkedin, TrendingUp, Files, ChevronDown, Plus, Edit3, Copy, Check, BookOpen } from 'lucide-react';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';
import AIPanel from './AIPanel';
import SettingsModal from './SettingsModal';
import LinkedInImportModal from './LinkedInImportModal';
import PDFExportButton from './PDFExport';
import ResumeScoreModal from './ResumeScoreModal';
import ResumeManager from './ResumeManager';
import SpellCheckModal from './SpellCheckModal';
import { getTemplate } from '../templates';
import { checkApiKey } from '../services/ai';
import {
    saveDraft, loadDraft, clearDraft, exportResumeAsJSON, importResumeFromJSON,
    getResumeById, saveResume, getResumeIndex, getActiveResumeId,
    setActiveResumeId, createResume, renameResume, duplicateResume
} from '../services/storage';
import { validateSection, validateAllSections, hasErrors } from '../services/validation';
import { FormData, ValidationErrors, TouchedSections, OpenSections, ResumeMeta } from '../types';

const DEFAULT_FORM_DATA: FormData = {
    firstName: '',
    lastName: '',
    designation: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    image: null,
    skillsRaw: '',
    experiences: [],
    educations: [],
    projects: [],
    achievements: []
};

interface Params extends Record<string, string | string[] | undefined> {
    templateId: string;
}

const ResumeBuilder = () => {
    const params = useParams<Params>();
    const templateId = params?.templateId || 'general';
    const router = useRouter();
    const searchParams = useSearchParams();
    const template = getTemplate(templateId);

    const [showSettings, setShowSettings] = useState(false);
    const [showResumeManager, setShowResumeManager] = useState(false);
    const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
    const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
    const [currentResumeName, setCurrentResumeName] = useState<string>('');
    const [openSections, setOpenSections] = useState<OpenSections>({
        about: true,
        experience: false,
        education: false,
        projects: false,
        skills: false,
        achievements: false
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<TouchedSections>({});
    const [savedStatus, setSavedStatus] = useState<string>(''); // '', 'saving', 'saved', 'error'
    const [importError, setImportError] = useState('');
    const [showLinkedInModal, setShowLinkedInModal] = useState(false);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [showSpellCheck, setShowSpellCheck] = useState(false);
    const [showResumeDropdown, setShowResumeDropdown] = useState(false);
    const [resumeList, setResumeList] = useState<ResumeMeta[]>([]);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const hasApiKey = checkApiKey();

    // Load resume on mount — prefer resume ID from URL, then active resume, then draft
    useEffect(() => {
        const resumeIdFromUrl = searchParams?.get('resume');

        if (resumeIdFromUrl) {
            const stored = getResumeById(resumeIdFromUrl);
            if (stored) {
                setFormData(prev => ({ ...DEFAULT_FORM_DATA, ...stored.formData }));
                setCurrentResumeId(stored.meta.id);
                setCurrentResumeName(stored.meta.name);
                setActiveResumeId(stored.meta.id);
                return;
            }
        }

        const activeId = getActiveResumeId();
        if (activeId) {
            const stored = getResumeById(activeId);
            if (stored && stored.meta.templateId === templateId) {
                setFormData(prev => ({ ...DEFAULT_FORM_DATA, ...stored.formData }));
                setCurrentResumeId(stored.meta.id);
                setCurrentResumeName(stored.meta.name);
                return;
            }
        }

        // Fall back to legacy draft
        const saved = loadDraft(templateId);
        if (saved) {
            setFormData(prev => ({ ...DEFAULT_FORM_DATA, ...saved }));
        }
    }, [templateId, searchParams]);

    // Refresh resume dropdown list
    const refreshResumeList = useCallback(() => {
        setResumeList(getResumeIndex().filter(r => r.templateId === templateId));
    }, [templateId]);

    useEffect(() => {
        refreshResumeList();
    }, [refreshResumeList, formData]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowResumeDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Auto-save draft with debounce
    useEffect(() => {
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }

        // Skip save on initial empty state
        const hasData = Object.values(formData).some(v =>
            Array.isArray(v) ? v.length > 0 : (v && typeof v === 'string' ? v.trim() : v)
        );
        if (!hasData) return;

        setSavedStatus('saving');
        saveTimerRef.current = setTimeout(() => {
            let success = false;
            if (currentResumeId) {
                // Update existing resume
                const stored = getResumeById(currentResumeId);
                if (stored) {
                    success = saveResume(stored.meta, formData);
                }
            } else {
                // Fall back to legacy draft
                success = saveDraft(templateId, formData);
            }
            setSavedStatus(success ? 'saved' : 'error');
            setTimeout(() => setSavedStatus(''), 2000);
        }, 1000);

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, [formData, templateId, currentResumeId]);

    const handleValidateAll = useCallback(() => {
        const allErrors = validateAllSections(formData);
        setErrors(allErrors);
        const touchedSections: TouchedSections = {};
        Object.keys(allErrors).forEach(s => { touchedSections[s] = true; });
        setTouched(prev => ({ ...prev, ...touchedSections }));

        if (hasErrors(allErrors)) {
            const sectionsToOpen: OpenSections = {};
            Object.keys(allErrors).forEach(s => { sectionsToOpen[s] = true; });
            setOpenSections(prev => ({ ...prev, ...sectionsToOpen }));
        }

        return !hasErrors(allErrors);
    }, [formData]);

    const handleSectionTouch = useCallback((section: string) => {
        if (!touched[section]) {
            const sectionErrors = validateSection(section, formData);
            setErrors(prev => ({
                ...prev,
                [section]: sectionErrors
            }));
            setTouched(prev => ({
                ...prev,
                [section]: true
            }));
        }
    }, [formData, touched]);

    const handleExportJSON = () => {
        exportResumeAsJSON(formData);
    };

    const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImportError('');
        importResumeFromJSON(file)
            .then(data => {
                setFormData(prev => ({ ...DEFAULT_FORM_DATA, ...data }));
                if (fileInputRef.current) fileInputRef.current.value = '';
            })
            .catch((err: Error) => {
                setImportError(err.message);
                if (fileInputRef.current) fileInputRef.current.value = '';
            });
    };

    const handleLinkedInImport = useCallback((imported: Partial<FormData>) => {
        setFormData(prev => {
            const merged = { ...DEFAULT_FORM_DATA, ...prev };
            (Object.keys(imported) as (keyof FormData)[]).forEach(key => {
                const val = imported[key];
                if (val !== null && val !== undefined && val !== '') {
                    if (Array.isArray(val) && val.length > 0) {
                        (merged as any)[key] = val;
                    } else if (!Array.isArray(val)) {
                        (merged as any)[key] = val;
                    }
                }
            });
            return merged;
        });
    }, []);

    const handleClearDraft = () => {
        // Just reset form state — don't save empty data to localStorage
        // Auto-save won't fire since hasData check returns false for empty form
        if (!currentResumeId) {
            clearDraft(templateId);
        }
        setFormData(DEFAULT_FORM_DATA);
        setErrors({});
        setTouched({});
        setSavedStatus('');
    };

    const handleSwitchResume = (resume: ResumeMeta) => {
        setShowResumeDropdown(false);
        setActiveResumeId(resume.id);
        router.push(`/builder/${resume.templateId}?resume=${resume.id}`);
    };

    const handleCreateNewInBuilder = () => {
        setShowResumeDropdown(false);
        const resume = createResume(`${template.name} Resume`, templateId);
        setActiveResumeId(resume.meta.id);
        router.push(`/builder/${templateId}?resume=${resume.meta.id}`);
    };

    const handleRenameStart = () => {
        if (!currentResumeId) return;
        setIsRenaming(true);
        setRenameValue(currentResumeName);
    };

    const handleRenameConfirm = () => {
        if (currentResumeId && renameValue.trim()) {
            renameResume(currentResumeId, renameValue.trim());
            setCurrentResumeName(renameValue.trim());
        }
        setIsRenaming(false);
    };

    const handleDuplicateCurrent = () => {
        if (!currentResumeId) return;
        const dup = duplicateResume(currentResumeId);
        if (dup) {
            setActiveResumeId(dup.meta.id);
            router.push(`/builder/${dup.meta.templateId}?resume=${dup.meta.id}`);
        }
    };

    return (
        <div className="builder">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-inner">
                        <div className="navbar-brand" onClick={() => router.push('/')}>
                            <Sparkles color="var(--secondary)" size={24} />
                            <span className="navbar-brand-text gradient-text">ResumeForge</span>
                        </div>

                        <div className="navbar-actions">
                            {/* Resume selector dropdown */}
                            <div ref={dropdownRef} style={{ position: 'relative' }}>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => { refreshResumeList(); setShowResumeDropdown(!showResumeDropdown); }}
                                    title="Switch resume"
                                    style={{
                                        maxWidth: '200px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Files size={14} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                                        {currentResumeName || `${template.name} Draft`}
                                    </span>
                                    <ChevronDown size={12} />
                                </button>

                                {showResumeDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        marginTop: '4px',
                                        minWidth: '280px',
                                        background: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                        zIndex: 100,
                                        overflow: 'hidden'
                                    }}>
                                        {/* Current resume header */}
                                        {currentResumeId && (
                                            <div style={{
                                                padding: '0.5rem 0.75rem',
                                                borderBottom: '1px solid var(--border)',
                                                background: 'rgba(245, 158, 11, 0.05)'
                                            }}>
                                                {isRenaming ? (
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <input
                                                            type="text"
                                                            value={renameValue}
                                                            onChange={e => setRenameValue(e.target.value)}
                                                            onKeyDown={e => { if (e.key === 'Enter') handleRenameConfirm(); if (e.key === 'Escape') setIsRenaming(false); }}
                                                            onBlur={handleRenameConfirm}
                                                            autoFocus
                                                            style={{
                                                                flex: 1,
                                                                padding: '0.25rem 0.5rem',
                                                                background: 'var(--bg)',
                                                                border: '1px solid var(--secondary)',
                                                                borderRadius: '4px',
                                                                color: 'var(--text)',
                                                                fontSize: '0.8rem',
                                                                outline: 'none'
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '2px' }}>Current Resume</div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{currentResumeName}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '2px' }}>
                                                            <button className="btn btn-ghost btn-sm" onClick={handleRenameStart} title="Rename" style={{ padding: '0.25rem' }}>
                                                                <Edit3 size={12} />
                                                            </button>
                                                            <button className="btn btn-ghost btn-sm" onClick={handleDuplicateCurrent} title="Duplicate" style={{ padding: '0.25rem' }}>
                                                                <Copy size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Resume list */}
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {resumeList.length === 0 ? (
                                                <div style={{ padding: '1rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                                                    No saved resumes yet
                                                </div>
                                            ) : (
                                                resumeList.map(r => (
                                                    <div
                                                        key={r.id}
                                                        style={{
                                                            padding: '0.5rem 0.75rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            background: r.id === currentResumeId ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                                                            borderBottom: '1px solid var(--border)',
                                                            transition: 'background 0.1s'
                                                        }}
                                                        onClick={() => handleSwitchResume(r)}
                                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = r.id === currentResumeId ? 'rgba(245, 158, 11, 0.08)' : 'transparent'; }}
                                                    >
                                                        <Files size={12} color="var(--text-dim)" />
                                                        <span style={{ fontSize: '0.8rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {r.name}
                                                        </span>
                                                        {r.id === currentResumeId && (
                                                            <Check size={10} color="var(--secondary)" />
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div style={{
                                            padding: '0.5rem 0.75rem',
                                            borderTop: '1px solid var(--border)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px'
                                        }}>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={handleCreateNewInBuilder}
                                                style={{ justifyContent: 'flex-start', width: '100%' }}
                                            >
                                                <Plus size={12} /> New Resume
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => { setShowResumeDropdown(false); setShowResumeManager(true); }}
                                                style={{ justifyContent: 'flex-start', width: '100%' }}
                                            >
                                                <Files size={12} /> Manage All Resumes
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Save status indicator */}
                            {savedStatus && (
                                <span style={{
                                    fontSize: '0.65rem',
                                    color: savedStatus === 'saved' ? 'var(--success)' :
                                           savedStatus === 'saving' ? 'var(--text-muted)' :
                                           savedStatus === 'error' ? 'var(--danger)' : 'var(--text-dim)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '0.25rem 0.5rem',
                                    background: savedStatus === 'saved' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                    borderRadius: '4px'
                                }}>
                                    <Save size={10} />
                                    {savedStatus === 'saving' ? 'Saving...' :
                                     savedStatus === 'saved' ? 'Saved' :
                                     'Save failed'}
                                </span>
                            )}

                            <div className={`status-badge ${hasApiKey ? 'online' : 'offline'}`}>
                                {hasApiKey ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                                <span>AI {hasApiKey ? 'Ready' : 'Offline'}</span>
                            </div>

                            <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(true)}>
                                <Settings size={14} /> {hasApiKey ? 'Settings' : 'Configure AI'}
                            </button>

                            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/templates')}>
                                <ArrowLeft size={14} /> Templates
                            </button>

                            {/* LinkedIn Import */}
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setShowLinkedInModal(true)}
                                title="Import from LinkedIn profile"
                                style={{ color: '#0a66c2' }}
                            >
                                <Linkedin size={14} /> LinkedIn
                            </button>

                            {/* Import JSON */}
                            <div style={{ position: 'relative' }}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportJSON}
                                    style={{ display: 'none' }}
                                    id="json-import-input"
                                />
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Import resume from JSON file"
                                >
                                    <Upload size={14} /> Import
                                </button>
                            </div>

                            {/* Export JSON */}
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={handleExportJSON}
                                title="Export resume as JSON file"
                            >
                                <Save size={14} /> Save
                            </button>

                            {/* Clear draft */}
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={handleClearDraft}
                                title="Clear resume data and reset form"
                                style={{ color: 'var(--danger)' }}
                            >
                                <Trash2 size={14} />
                            </button>

                            {/* Spell & Grammar Check */}
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setShowSpellCheck(true)}
                                title="Check spelling and grammar"
                            >
                                <BookOpen size={14} /> Check
                            </button>

                            {/* Score Resume */}
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setShowScoreModal(true)}
                                title="Score your resume quality"
                            >
                                <TrendingUp size={14} /> Score
                            </button>

                            {/* Validate */}
                            <button
                                className={`btn btn-sm ${hasErrors(errors) && Object.keys(touched).length > 0 ? 'btn-danger' : 'btn-secondary'}`}
                                onClick={handleValidateAll}
                                title="Validate all form fields"
                            >
                                <ShieldCheck size={14} /> Validate
                            </button>

                            <PDFExportButton formData={formData} templateName={template.name} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Import error */}
            {importError && (
                <div style={{
                    maxWidth: '1600px',
                    margin: '5rem auto 0',
                    padding: '0 2rem',
                    width: '100%'
                }}>
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.75rem 1rem',
                        fontSize: '0.8rem',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertCircle size={14} color="var(--danger)" />
                        {importError}
                        <button
                            onClick={() => setImportError('')}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Builder Content */}
            <div className="builder-content">
                {/* Left: Form + AI */}
                <div className="builder-left no-print">
                    <ResumeForm
                        formData={formData}
                        setFormData={setFormData}
                        openSections={openSections}
                        setOpenSections={setOpenSections}
                        errors={errors}
                        touched={touched}
                        onSectionTouch={handleSectionTouch}
                    />
                    <AIPanel
                        formData={formData}
                        setFormData={setFormData}
                        industry={template.industry}
                        onOpenSettings={() => setShowSettings(true)}
                    />
                </div>

                {/* Right: Preview */}
                <div className="builder-right">
                    <ResumePreview formData={formData} templateId={templateId} />
                </div>
            </div>

            {/* Settings Modal */}
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

            {/* LinkedIn Import Modal */}
            <LinkedInImportModal
                isOpen={showLinkedInModal}
                onClose={() => setShowLinkedInModal(false)}
                onImport={handleLinkedInImport}
            />

            {/* Resume Score Modal */}
            <ResumeScoreModal
                isOpen={showScoreModal}
                onClose={() => setShowScoreModal(false)}
                formData={formData}
            />

            {/* Spell & Grammar Check Modal */}
            <SpellCheckModal
                isOpen={showSpellCheck}
                onClose={() => setShowSpellCheck(false)}
                formData={formData}
            />

            {/* Resume Manager Modal */}
            <ResumeManager
                isOpen={showResumeManager}
                onClose={() => setShowResumeManager(false)}
            />
        </div>
    );
};

export default ResumeBuilder;
