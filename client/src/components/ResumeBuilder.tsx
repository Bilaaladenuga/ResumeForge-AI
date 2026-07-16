'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, Settings, Download, ArrowLeft, ShieldCheck, AlertCircle, Save, Upload, Trash2, Linkedin } from 'lucide-react';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';
import AIPanel from './AIPanel';
import SettingsModal from './SettingsModal';
import LinkedInImportModal from './LinkedInImportModal';
import { getTemplate } from '../templates';
import { checkApiKey } from '../services/ai';
import { saveDraft, loadDraft, clearDraft, exportResumeAsJSON, importResumeFromJSON } from '../services/storage';
import { validateSection, validateAllSections, hasErrors } from '../services/validation';
import { FormData, ValidationErrors, TouchedSections, OpenSections } from '../types';

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
    const template = getTemplate(templateId);

    const [showSettings, setShowSettings] = useState(false);
    const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const hasApiKey = checkApiKey();

    // Load draft on mount
    useEffect(() => {
        const saved = loadDraft(templateId);
        if (saved) {
            setFormData(prev => ({ ...DEFAULT_FORM_DATA, ...saved }));
        }
    }, [templateId]);

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
            const success = saveDraft(templateId, formData);
            setSavedStatus(success ? 'saved' : 'error');
            setTimeout(() => setSavedStatus(''), 2000);
        }, 1000);

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, [formData, templateId]);

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

    const handleExport = () => {
        window.print();
    };

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
            // Start with defaults, overlay existing draft
            const merged = { ...DEFAULT_FORM_DATA, ...prev };
            // Only apply non-empty LinkedIn fields (don't overwrite existing data with nulls)
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
        clearDraft(templateId);
        setFormData(DEFAULT_FORM_DATA);
        setErrors({});
        setTouched({});
        setSavedStatus('');
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
                            <span style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-dim)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontWeight: 600
                            }}>
                                Template: {template.name}
                            </span>

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
                                title="Clear saved draft and reset form"
                                style={{ color: 'var(--danger)' }}
                            >
                                <Trash2 size={14} />
                            </button>

                            {/* Validate */}
                            <button
                                className={`btn btn-sm ${hasErrors(errors) && Object.keys(touched).length > 0 ? 'btn-danger' : 'btn-secondary'}`}
                                onClick={handleValidateAll}
                                title="Validate all form fields"
                            >
                                <ShieldCheck size={14} /> Validate
                            </button>

                            <button className="btn btn-primary btn-sm no-print" onClick={handleExport}>
                                <Download size={14} /> Export PDF
                            </button>
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
        </div>
    );
};

export default ResumeBuilder;
