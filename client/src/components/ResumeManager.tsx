'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, X, Plus, Trash2, Copy, Edit3, FileText,
    AlertCircle, Check, ArrowRight, Search
} from 'lucide-react';
import {
    getResumeIndex, getResumeById, createResume, deleteResume,
    duplicateResume, renameResume, setActiveResumeId, getActiveResumeId
} from '../services/storage';
import { ResumeMeta, StoredResume } from '../types';

const TEMPLATE_NAMES: Record<string, string> = {
    tech: 'Tech / IT',
    finance: 'Finance',
    healthcare: 'Healthcare',
    creative: 'Creative / Design',
    general: 'General',
    legal: 'Legal / Consulting',
    education: 'Education'
};

const TEMPLATE_IDS = ['general', 'tech', 'finance', 'healthcare', 'creative', 'legal', 'education'];

interface ResumeManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

const ResumeManager: React.FC<ResumeManagerProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const [resumes, setResumes] = useState<ResumeMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newTemplate, setNewTemplate] = useState('general');
    const [renameId, setRenameId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    const loadResumes = useCallback(() => {
        setLoading(true);
        const index = getResumeIndex();
        setResumes(index);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadResumes();
            setShowCreate(false);
            setRenameId(null);
            setDeleteConfirm(null);
            setSearchQuery('');
            setError('');
        }
    }, [isOpen, loadResumes]);

    const handleCreate = () => {
        if (!newName.trim()) {
            setError('Please enter a resume name.');
            return;
        }
        try {
            const resume = createResume(newName.trim(), newTemplate);
            setActiveResumeId(resume.meta.id);
            loadResumes();
            setShowCreate(false);
            setNewName('');
            setNewTemplate('general');
            setError('');
            onClose();
            router.push(`/builder/${newTemplate}?resume=${resume.meta.id}`);
        } catch {
            setError('Failed to create resume. Storage may be full.');
        }
    };

    const handleOpen = (resume: ResumeMeta) => {
        setActiveResumeId(resume.id);
        onClose();
        router.push(`/builder/${resume.templateId}?resume=${resume.id}`);
    };

    const handleDelete = (id: string) => {
        deleteResume(id);
        loadResumes();
        setDeleteConfirm(null);
    };

    const handleDuplicate = (id: string) => {
        const dup = duplicateResume(id);
        if (dup) {
            loadResumes();
        }
    };

    const handleRenameStart = (resume: ResumeMeta) => {
        setRenameId(resume.id);
        setRenameValue(resume.name);
    };

    const handleRenameConfirm = () => {
        if (renameId && renameValue.trim()) {
            renameResume(renameId, renameValue.trim());
            loadResumes();
        }
        setRenameId(null);
        setRenameValue('');
    };

    const filteredResumes = resumes.filter(r => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return r.name.toLowerCase().includes(q) ||
            (TEMPLATE_NAMES[r.templateId] || r.templateId).toLowerCase().includes(q);
    });

    const formatDate = (dateStr: string): string => {
        try {
            const d = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - d.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    const activeResumeId = getActiveResumeId();

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
                            maxWidth: '800px',
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
                                <FileText size={20} color="var(--secondary)" />
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>My Resumes</h2>
                                <span style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--text-dim)',
                                    background: 'var(--surface)',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '10px'
                                }}>
                                    {resumes.length}
                                </span>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={onClose}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Search + Create bar */}
                        <div style={{
                            padding: '1rem 2rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <div style={{
                                flex: 1,
                                position: 'relative'
                            }}>
                                <Search size={14} style={{
                                    position: 'absolute',
                                    left: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-dim)',
                                    pointerEvents: 'none'
                                }} />
                                <input
                                    type="text"
                                    placeholder="Search resumes..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem 0.5rem 2rem',
                                        background: 'var(--bg)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text)',
                                        fontSize: '0.8rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => { setShowCreate(true); setError(''); }}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                <Plus size={14} /> New Resume
                            </button>
                        </div>

                        {/* Create form */}
                        <AnimatePresence>
                            {showCreate && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ overflow: 'hidden', flexShrink: 0 }}
                                >
                                    <div style={{
                                        padding: '1rem 2rem',
                                        borderBottom: '1px solid var(--border)',
                                        background: 'rgba(245, 158, 11, 0.03)',
                                    }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                            <div style={{ flex: '2', minWidth: '200px' }}>
                                                <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.25rem', display: 'block' }}>
                                                    Resume Name
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. My Software Engineering Resume"
                                                    value={newName}
                                                    onChange={e => setNewName(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem 0.75rem',
                                                        background: 'var(--bg)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        color: 'var(--text)',
                                                        fontSize: '0.8rem',
                                                        outline: 'none'
                                                    }}
                                                    autoFocus
                                                />
                                            </div>
                                            <div style={{ flex: '1', minWidth: '140px' }}>
                                                <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.25rem', display: 'block' }}>
                                                    Template
                                                </label>
                                                <select
                                                    value={newTemplate}
                                                    onChange={e => setNewTemplate(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem 0.75rem',
                                                        background: 'var(--bg)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        color: 'var(--text)',
                                                        fontSize: '0.8rem',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {TEMPLATE_IDS.map(tid => (
                                                        <option key={tid} value={tid}>{TEMPLATE_NAMES[tid] || tid}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', paddingBottom: '1px' }}>
                                                <button className="btn btn-primary btn-sm" onClick={handleCreate}>
                                                    <Check size={14} /> Create
                                                </button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                        {error && (
                                            <div style={{
                                                marginTop: '0.5rem',
                                                fontSize: '0.75rem',
                                                color: 'var(--danger)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <AlertCircle size={12} /> {error}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Resume list */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1rem 2rem'
                        }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-dim)' }}>
                                    Loading...
                                </div>
                            ) : filteredResumes.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                    <FileText size={40} style={{ color: 'var(--text-dim)', opacity: 0.3, marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--text-dim)', margin: 0 }}>
                                        {searchQuery ? 'No resumes match your search.' : 'You haven\'t created any resumes yet.'}
                                    </p>
                                    {!searchQuery && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => { setShowCreate(true); setError(''); }}
                                            style={{ marginTop: '1rem' }}
                                        >
                                            <Plus size={14} /> Create Your First Resume
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {filteredResumes.map(resume => (
                                        <div
                                            key={resume.id}
                                            className="glass-card"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.75rem 1rem',
                                                cursor: 'pointer',
                                                border: resume.id === activeResumeId ? '1px solid var(--secondary)' : '1px solid transparent',
                                                transition: 'all 0.15s ease'
                                            }}
                                            onClick={() => handleOpen(resume)}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--secondary)';
                                                (e.currentTarget as HTMLElement).style.background = 'rgba(245, 158, 11, 0.03)';
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLElement).style.borderColor = resume.id === activeResumeId ? 'var(--secondary)' : 'transparent';
                                                (e.currentTarget as HTMLElement).style.background = '';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    background: 'var(--surface)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    fontSize: '1rem'
                                                }}>
                                                    <FileText size={16} color="var(--secondary)" />
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    {renameId === resume.id ? (
                                                        <input
                                                            type="text"
                                                            value={renameValue}
                                                            onChange={e => setRenameValue(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') handleRenameConfirm();
                                                                if (e.key === 'Escape') setRenameId(null);
                                                            }}
                                                            onBlur={handleRenameConfirm}
                                                            onClick={e => e.stopPropagation()}
                                                            style={{
                                                                padding: '0.25rem 0.5rem',
                                                                background: 'var(--bg)',
                                                                border: '1px solid var(--secondary)',
                                                                borderRadius: '4px',
                                                                color: 'var(--text)',
                                                                fontSize: '0.85rem',
                                                                width: '100%',
                                                                outline: 'none'
                                                            }}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>
                                                            {resume.name}
                                                            {resume.id === activeResumeId && (
                                                                <span style={{
                                                                    marginLeft: '0.5rem',
                                                                    fontSize: '0.6rem',
                                                                    color: 'var(--secondary)',
                                                                    background: 'rgba(245, 158, 11, 0.1)',
                                                                    padding: '0.1rem 0.4rem',
                                                                    borderRadius: '8px',
                                                                    fontWeight: 500
                                                                }}>
                                                                    Active
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                                                        {TEMPLATE_NAMES[resume.templateId] || resume.templateId} template
                                                        <span style={{ margin: '0 6px' }}>·</span>
                                                        {formatDate(resume.updatedAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    title="Open resume"
                                                    onClick={() => handleOpen(resume)}
                                                    style={{ padding: '0.35rem' }}
                                                >
                                                    <ArrowRight size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    title="Rename"
                                                    onClick={() => handleRenameStart(resume)}
                                                    style={{ padding: '0.35rem' }}
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    title="Duplicate"
                                                    onClick={() => handleDuplicate(resume.id)}
                                                    style={{ padding: '0.35rem' }}
                                                >
                                                    <Copy size={14} />
                                                </button>
                                                {deleteConfirm === resume.id ? (
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{
                                                                background: 'var(--danger)',
                                                                color: '#fff',
                                                                border: 'none',
                                                                fontSize: '0.7rem',
                                                                padding: '0.25rem 0.5rem'
                                                            }}
                                                            onClick={() => handleDelete(resume.id)}
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => setDeleteConfirm(null)}
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        title="Delete"
                                                        onClick={() => setDeleteConfirm(resume.id)}
                                                        style={{ padding: '0.35rem', color: 'var(--danger)' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                            <span>{filteredResumes.length} of {resumes.length} resumes</span>
                            <span>Resumes are saved locally in this browser</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ResumeManager;
