import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Code, DollarSign, Heart, Palette, FileText, ArrowLeft } from 'lucide-react';

const templates = [
    {
        id: 'tech',
        name: 'Tech / IT',
        icon: <Code size={24} />,
        description: 'Optimized for software engineers, DevOps, data scientists, and IT professionals. Skills-first layout with project highlights.',
        color: '#06b6d4',
        bgGradient: 'linear-gradient(135deg, #0e1628, #0d2f3f)',
        badge: 'Popular'
    },
    {
        id: 'finance',
        name: 'Finance',
        icon: <DollarSign size={24} />,
        description: 'Conservative and professional layout for banking, accounting, and financial services. Experience-focused design.',
        color: '#f59e0b',
        bgGradient: 'linear-gradient(135deg, #1a1507, #2d2000)',
        badge: null
    },
    {
        id: 'healthcare',
        name: 'Healthcare',
        icon: <Heart size={24} />,
        description: 'Clean clinical layout for doctors, nurses, and medical professionals. Includes certifications and license sections.',
        color: '#10b981',
        bgGradient: 'linear-gradient(135deg, #071a13, #0a2e1f)',
        badge: null
    },
    {
        id: 'creative',
        name: 'Creative / Design',
        icon: <Palette size={24} />,
        description: 'Bold and expressive layout for designers, artists, and creative professionals. Color-rich with portfolio emphasis.',
        color: '#a855f7',
        bgGradient: 'linear-gradient(135deg, #1a0e2e, #250d3d)',
        badge: 'New'
    },
    {
        id: 'general',
        name: 'General',
        icon: <FileText size={24} />,
        description: 'Classic ATS-friendly layout that works for any industry. Balanced sections with a clean, professional look.',
        color: '#64748b',
        bgGradient: 'linear-gradient(135deg, #111827, #1e293b)',
        badge: 'ATS-Friendly'
    }
];

const TemplateSelector = () => {
    const navigate = useNavigate();

    const handleSelect = (templateId) => {
        navigate(`/builder/${templateId}`);
    };

    return (
        <div className="template-selector">
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-inner">
                        <div className="navbar-brand" onClick={() => navigate('/')}>
                            <Sparkles color="var(--secondary)" size={28} />
                            <span className="navbar-brand-text gradient-text">ResumeForge</span>
                        </div>
                        <button className="btn btn-ghost" onClick={() => navigate('/')}>
                            <ArrowLeft size={16} /> Back
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container">
                <motion.div
                    className="template-selector-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="section-label">Choose Your Template</p>
                    <h1 className="gradient-text">Select Your Industry</h1>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                        Each template is tailored with industry-specific section ordering, color schemes, and AI prompt optimization.
                    </p>
                </motion.div>

                <div className="template-grid">
                    {templates.map((tmpl, index) => (
                        <motion.div
                            key={tmpl.id}
                            className="glass-card template-card"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            onClick={() => handleSelect(tmpl.id)}
                            id={`template-card-${tmpl.id}`}
                        >
                            <div
                                className="template-card-preview"
                                style={{ background: tmpl.bgGradient }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: tmpl.color
                                }}>
                                    {React.cloneElement(tmpl.icon, { size: 48 })}
                                </div>
                                {tmpl.badge && (
                                    <span
                                        className="template-card-badge"
                                        style={{
                                            background: `${tmpl.color}20`,
                                            color: tmpl.color,
                                            border: `1px solid ${tmpl.color}40`
                                        }}
                                    >
                                        {tmpl.badge}
                                    </span>
                                )}
                            </div>
                            <div className="template-card-info">
                                <h3>{tmpl.name}</h3>
                                <p>{tmpl.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplateSelector;
