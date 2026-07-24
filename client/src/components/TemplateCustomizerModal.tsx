import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, PaintBucket, Type, Check, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { TemplateCustomization, COLOR_PRESETS, FONT_OPTIONS, DEFAULT_CUSTOMIZATION } from '../types';
import { saveCustomization, clearCustomization } from '../services/storage';

interface TemplateCustomizerModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateId: string;
    current: TemplateCustomization;
    onApply: (customization: TemplateCustomization) => void;
}

const FONT_SIZES = [
    { value: 'small' as const, label: 'Small', icon: 'Minimize2' },
    { value: 'medium' as const, label: 'Medium', icon: 'Type' },
    { value: 'large' as const, label: 'Large', icon: 'Maximize2' },
];

const SPACING_OPTIONS = [
    { value: 'compact' as const, label: 'Compact', desc: 'Tighter layout' },
    { value: 'normal' as const, label: 'Normal', desc: 'Balanced spacing' },
    { value: 'spacious' as const, label: 'Spacious', desc: 'More breathing room' },
];

const TemplateCustomizerModal = ({ isOpen, onClose, templateId, current, onApply }: TemplateCustomizerModalProps) => {
    const [primaryColor, setPrimaryColor] = useState(current.primaryColor || '');
    const [secondaryColor, setSecondaryColor] = useState(current.secondaryColor || '');
    const [fontFamily, setFontFamily] = useState(current.fontFamily || '');
    const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(current.fontSize || 'medium');
    const [spacing, setSpacing] = useState<'compact' | 'normal' | 'spacious'>(current.spacing || 'normal');
    const [saved, setSaved] = useState(false);

    if (!isOpen) return null;

    const hasCustomizations = primaryColor || secondaryColor || fontFamily || fontSize !== 'medium' || spacing !== 'normal';

    const buildCustomization = (): TemplateCustomization => ({
        primaryColor,
        secondaryColor,
        fontFamily,
        fontSize,
        spacing,
    });

    const handleApply = () => {
        const custom = buildCustomization();
        saveCustomization(templateId, custom);
        onApply(custom);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1000);
    };

    const handleReset = () => {
        setPrimaryColor('');
        setSecondaryColor('');
        setFontFamily('');
        setFontSize('medium');
        setSpacing('normal');
        clearCustomization(templateId);
        onApply({ ...DEFAULT_CUSTOMIZATION });
    };

    const handlePreset = (preset: typeof COLOR_PRESETS[number]) => {
        setPrimaryColor(preset.primary);
        setSecondaryColor(preset.secondary);
    };

    const activeFontLabel = FONT_OPTIONS.find(f => f.value === fontFamily)?.label || 'Template Default';

    return (
        <div className="modal-overlay" onClick={(e) => (e.target as HTMLElement) === e.currentTarget && onClose()}>
            <motion.div
                className="glass-card modal-card"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                style={{ maxWidth: '520px' }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                            <PaintBucket size={18} /> Template Customizer
                        </h2>
                        <p style={{ marginBottom: 0, fontSize: '0.75rem' }}>
                            Personalize the look and feel of your resume template.
                        </p>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ flexShrink: 0 }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Color Presets */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
                        <PaintBucket size={13} /> Color Themes
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                        {COLOR_PRESETS.map((preset) => {
                            const isActive = primaryColor === preset.primary;
                            return (
                                <button
                                    key={preset.name}
                                    onClick={() => handlePreset(preset)}
                                    title={preset.name}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        borderRadius: '8px',
                                        border: isActive ? '2px solid var(--text)' : '2px solid var(--border)',
                                        background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
                                        cursor: 'pointer',
                                        position: 'relative',
                                        padding: 0,
                                        transition: 'transform 0.15s, border-color 0.15s',
                                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                    }}
                                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
                                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                                >
                                    {isActive && (
                                        <Check size={12} color="white" style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                                        }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {COLOR_PRESETS.map(p => (
                            <span key={p.name} style={{ minWidth: 'calc(100% / 6)', textAlign: 'center', fontSize: '0.55rem' }}>
                                {p.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Custom Colors */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Primary Accent</label>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={primaryColor || '#3b82f6'}
                                onChange={e => setPrimaryColor(e.target.value)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border)',
                                    padding: 0,
                                    cursor: 'pointer',
                                    background: 'none'
                                }}
                            />
                            <input
                                type="text"
                                value={primaryColor}
                                onChange={e => setPrimaryColor(e.target.value)}
                                placeholder="#hex"
                                className="form-input"
                                style={{ flex: 1, fontSize: '0.72rem', padding: '0.3rem 0.5rem', fontFamily: 'monospace' }}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Secondary Accent</label>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={secondaryColor || '#06b6d4'}
                                onChange={e => setSecondaryColor(e.target.value)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border)',
                                    padding: 0,
                                    cursor: 'pointer',
                                    background: 'none'
                                }}
                            />
                            <input
                                type="text"
                                value={secondaryColor}
                                onChange={e => setSecondaryColor(e.target.value)}
                                placeholder="#hex"
                                className="form-input"
                                style={{ flex: 1, fontSize: '0.72rem', padding: '0.3rem 0.5rem', fontFamily: 'monospace' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Font Family */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Type size={13} /> Font Family
                    </label>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={fontFamily}
                            onChange={e => setFontFamily(e.target.value)}
                            className="form-input"
                            style={{ fontSize: '0.78rem' }}
                        >
                            {FONT_OPTIONS.map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                    </div>
                    {fontFamily && (
                        <div style={{
                            marginTop: '6px',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            fontFamily: fontFamily || undefined,
                            fontSize: '0.78rem',
                            color: 'var(--text-dim)',
                            lineHeight: 1.5
                        }}>
                            The quick brown fox jumps over the lazy dog. <strong>ABCDEFGHIJKLMNOPQRSTUVWXYZ</strong> <em>abcdefghijklmnopqrstuvwxyz</em>
                        </div>
                    )}
                </div>

                {/* Font Size */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Type size={13} /> Font Size
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {FONT_SIZES.map(opt => {
                            const isActive = fontSize === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setFontSize(opt.value)}
                                    className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                                    style={{
                                        flex: 1,
                                        fontSize: '0.72rem',
                                        padding: '0.4rem 0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    {opt.value === 'small' ? <Minimize2 size={12} /> : opt.value === 'large' ? <Maximize2 size={12} /> : <Type size={12} />}
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Spacing */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Maximize2 size={13} /> Spacing
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {SPACING_OPTIONS.map(opt => {
                            const isActive = spacing === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setSpacing(opt.value)}
                                    className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                                    style={{
                                        flex: 1,
                                        fontSize: '0.7rem',
                                        padding: '0.4rem 0.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '1px',
                                        lineHeight: 1.3
                                    }}
                                >
                                    <span>{opt.label}</span>
                                    <span style={{ fontSize: '0.58rem', color: 'var(--text-dim)', fontWeight: 400 }}>{opt.desc}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleApply} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {saved ? (
                            <><Check size={14} /> APPLIED!</>
                        ) : (
                            <><PaintBucket size={14} /> APPLY CUSTOMIZATION</>
                        )}
                    </button>
                    <button
                        onClick={handleReset}
                        className="btn btn-ghost"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            opacity: hasCustomizations ? 1 : 0.3,
                            cursor: hasCustomizations ? 'pointer' : 'not-allowed'
                        }}
                        disabled={!hasCustomizations}
                    >
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TemplateCustomizerModal;
