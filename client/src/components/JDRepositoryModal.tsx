'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { X, Briefcase, Search, Trash2, ExternalLink, Clock, Calendar, BookmarkPlus, Building } from 'lucide-react';
import { SavedJD } from '../types';
import { getJDIndex, deleteJD } from '../services/storage';

interface JDRepositoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (jd: SavedJD) => void;
}

const JDRepositoryModal: React.FC<JDRepositoryModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [jdList, setJdList] = useState<SavedJD[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setJdList(getJDIndex().sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ));
            setSearchQuery('');
            setConfirmDelete(null);
        }
    }, [isOpen]);

    const handleDelete = useCallback((id: string) => {
        deleteJD(id);
        setJdList(prev => prev.filter(j => j.id !== id));
        setConfirmDelete(null);
    }, []);

    const handleSelect = useCallback((jd: SavedJD) => {
        onSelect(jd);
        onClose();
    }, [onSelect, onClose]);

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const filtered = searchQuery.trim()
        ? jdList.filter(j =>
            j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.company.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : jdList;

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="glass-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '640px',
                    width: '100%',
                    padding: '0',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem 1.5rem 1rem',
                    borderBottom: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--secondary)'
                            }}>
                                <Briefcase size={20} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.1rem' }}>
                                    Saved Job Descriptions
                                </h2>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: 0 }}>
                                    {jdList.length} saved — click to load into the AI panel
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn-icon-sm" style={{ color: 'var(--text-dim)' }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{
                            position: 'absolute', left: '0.75rem', top: '50%',
                            transform: 'translateY(-50%)', color: 'var(--text-dim)'
                        }} />
                        <input
                            className="form-input"
                            placeholder="Search by job title or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '2.2rem', fontSize: '0.8rem' }}
                        />
                    </div>
                </div>

                {/* List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0.75rem 1.5rem 1.5rem'
                }}>
                    {filtered.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '3rem 1rem',
                            color: 'var(--text-dim)', fontSize: '0.85rem'
                        }}>
                            {searchQuery ? (
                                <>
                                    <Search size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                                    <p>No job descriptions match "{searchQuery}"</p>
                                </>
                            ) : (
                                <>
                                    <BookmarkPlus size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                                    <p>No saved job descriptions yet</p>
                                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-dim)' }}>
                                        Paste a job description in the AI panel and click "Save JD"
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {filtered.map((jd) => (
                                <div
                                    key={jd.id}
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        position: 'relative'
                                    }}
                                    onClick={() => handleSelect(jd)}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'var(--secondary)';
                                        e.currentTarget.style.background = 'rgba(245, 158, 11, 0.04)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>
                                                    {jd.title}
                                                </span>
                                                {jd.company && (
                                                    <span style={{
                                                        fontSize: '0.65rem', color: 'var(--secondary)',
                                                        background: 'rgba(245, 158, 11, 0.1)',
                                                        padding: '1px 6px', borderRadius: '4px',
                                                        display: 'flex', alignItems: 'center', gap: '3px'
                                                    }}>
                                                        <Building size={10} /> {jd.company}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Preview of JD content */}
                                            <p style={{
                                                fontSize: '0.75rem', color: 'var(--text-dim)',
                                                lineHeight: 1.4, marginBottom: '0.5rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {jd.content}
                                            </p>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Clock size={10} /> {jd.content.length} chars
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Calendar size={10} /> Saved {formatDate(jd.updatedAt)}
                                                </span>
                                                {jd.url && (
                                                    <a
                                                        href={jd.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '3px',
                                                            color: 'var(--accent)', textDecoration: 'none'
                                                        }}
                                                    >
                                                        <ExternalLink size={10} /> Link
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete button */}
                                        <div style={{ flexShrink: 0, marginLeft: '0.75rem' }}>
                                            {confirmDelete === jd.id ? (
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(jd.id); }}
                                                        style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem' }}
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                                                        style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="btn-icon-sm"
                                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(jd.id); }}
                                                    title="Delete this job description"
                                                    style={{ color: 'var(--text-dim)' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '0.75rem 1.5rem',
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex', justifyContent: 'flex-end', gap: '0.5rem'
                }}>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JDRepositoryModal;
