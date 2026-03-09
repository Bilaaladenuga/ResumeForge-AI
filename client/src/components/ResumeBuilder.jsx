import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Settings, Download, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';
import AIPanel from './AIPanel';
import SettingsModal from './SettingsModal';
import { getTemplate } from '../templates';
import { checkApiKey } from '../services/ai';

const ResumeBuilder = () => {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const template = getTemplate(templateId);

    const [showSettings, setShowSettings] = useState(false);
    const [formData, setFormData] = useState({
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
    });

    const [openSections, setOpenSections] = useState({
        about: true,
        experience: false,
        education: false,
        projects: false,
        skills: false,
        achievements: false
    });

    const hasApiKey = checkApiKey();

    const handleExport = () => {
        window.print();
    };

    return (
        <div className="builder">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-inner">
                        <div className="navbar-brand" onClick={() => navigate('/')}>
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

                            <div className={`status-badge ${hasApiKey ? 'online' : 'offline'}`}>
                                {hasApiKey ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                                <span>AI {hasApiKey ? 'Ready' : 'Offline'}</span>
                            </div>

                            <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(true)}>
                                <Settings size={14} /> {hasApiKey ? 'Settings' : 'Configure AI'}
                            </button>

                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/templates')}>
                                <ArrowLeft size={14} /> Templates
                            </button>

                            <button className="btn btn-primary btn-sm no-print" onClick={handleExport}>
                                <Download size={14} /> Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Builder Content */}
            <div className="builder-content">
                {/* Left: Form + AI */}
                <div className="builder-left no-print">
                    <ResumeForm
                        formData={formData}
                        setFormData={setFormData}
                        openSections={openSections}
                        setOpenSections={setOpenSections}
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
        </div>
    );
};

export default ResumeBuilder;
