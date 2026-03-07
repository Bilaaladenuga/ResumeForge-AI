import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, FileText, User, Briefcase, Award, Download,
    ChevronRight, ChevronLeft, Settings, ShieldCheck, AlertCircle, X,
    Terminal, Cpu, Zap, Activity, Grid, Layers, Code, Github, ArrowRight
} from 'lucide-react';
import api from './services/api';
import './index.css';

const SkeletonLine = ({ width }) => (
    <div className="skeleton" style={{ height: '12px', width, marginBottom: '10px' }}></div>
);

const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <Sparkles color="var(--secondary)" size={48} />
                    <h1 className="gradient-text" style={{ fontSize: '4rem', fontWeight: '900', letterSpacing: '-2px' }}>Resume Forge</h1>
                </div>
                <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
                    Forge world-class professional profiles with artificial intelligence.
                    From high-impact summaries to technical portfolio command centers.
                </p>

                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                    <button onClick={onGetStarted} className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', background: 'var(--secondary)', color: 'var(--primary)' }}>
                        GET STARTED <ArrowRight size={20} />
                    </button>
                    <button className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem' }}>
                        VIEW REPOSITORY <Github size={20} />
                    </button>
                </div>
            </motion.div>

            <div style={{ marginTop: '8rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4rem', maxWidth: '1200px', width: '100%' }}>
                <div className="premium-card" style={{ textAlign: 'left' }}>
                    <div style={{ color: 'var(--secondary)', marginBottom: '1rem' }}><Zap size={32} /></div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>AI Powered</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>GPT-4 integration to craft compelling professional narratives that pass ATS scans.</p>
                </div>
                <div className="premium-card" style={{ textAlign: 'left' }}>
                    <div style={{ color: 'var(--secondary)', marginBottom: '1rem' }}><Layers size={32} /></div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Dual Interface</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Switch between a professional Resume Forge and a technical Developer Studio.</p>
                </div>
                <div className="premium-card" style={{ textAlign: 'left' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}><ShieldCheck size={32} /></div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Zero Persistence</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your API keys are stored locally. We never store your sensitive tokens on our servers.</p>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const [view, setView] = useState('landing'); // 'landing' or 'app'
    const [mode, setMode] = useState('resume'); // 'resume' or 'dev'
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const [generatedContent, setGeneratedContent] = useState({
        summary: '',
        skills: '',
        bio: ''
    });

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        experience: '',
        rawSkills: '',
        passions: ''
    });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const saveApiKey = () => {
        localStorage.setItem('openai_api_key', apiKey);
        setShowSettings(false);
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const generateAI = async () => {
        if (!apiKey) {
            setShowSettings(true);
            return;
        }

        setIsLoading(true);
        try {
            const [summaryRes, skillsRes, bioRes] = await Promise.all([
                api.generateSummary({
                    name: formData.name,
                    role: formData.role,
                    experience: formData.experience,
                    skills: formData.rawSkills.split(',')
                }),
                api.generateSkills({
                    role: formData.role,
                    rawSkills: formData.rawSkills
                }),
                api.generateBio({
                    name: formData.name,
                    role: formData.role,
                    passions: formData.passions
                })
            ]);

            setGeneratedContent({
                summary: summaryRes.data.content,
                skills: skillsRes.data.content,
                bio: bioRes.data.content
            });
            setStep(4);
        } catch (error) {
            console.error("Generation failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (view === 'landing') {
        return <LandingPage onGetStarted={() => setView('app')} />;
    }

    return (
        <div className="app-container" data-theme={mode}>
            <div className="cursor-glow" style={{
                left: mousePos.x,
                top: mousePos.y,
                background: mode === 'dev' ? 'radial-gradient(circle, rgba(0,243,255,0.15) 0%, transparent 70%)' : undefined
            }}></div>

            <header style={{ padding: '2rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => setView('landing')}>
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                        {mode === 'resume' ? <Sparkles color="var(--secondary)" size={38} /> : <Zap color="var(--neon-cyan)" size={38} />}
                    </motion.div>
                    <h1 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1.5px' }}>
                        {mode === 'resume' ? 'Resume Forge' : 'RE-FORGE // DEV'}
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: apiKey ? 'rgba(100,255,218,0.1)' : 'rgba(255,77,77,0.1)',
                        padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem',
                        color: apiKey ? 'var(--accent)' : '#ff4d4d',
                        border: `1px solid ${apiKey ? 'var(--accent)' : '#ff4d4d'}`,
                        fontWeight: '700'
                    }}>
                        {apiKey ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                        AI {apiKey ? 'READY' : 'OFFLINE'}
                    </div>
                    <button onClick={() => setShowSettings(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}>
                        <Settings size={16} /> {apiKey ? 'SETTINGS' : 'CONFIGURE API'}
                    </button>
                </div>
            </header>

            <main style={{ flex: 1, padding: '1rem 4rem 4rem', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
                <AnimatePresence mode="wait">
                    {mode === 'resume' ? (
                        <motion.div
                            key="resume-mode"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '5rem' }}
                        >
                            <section className="animate-fade-in">
                                <div className="premium-card shimmer-border">
                                    <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: step === i ? 'var(--secondary)' : step > i ? 'var(--secondary)' : 'var(--primary-light)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: step >= i ? 'var(--primary)' : 'var(--text-muted)',
                                                fontWeight: '800', fontSize: '0.9rem'
                                            }}>
                                                {i}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ minHeight: '400px' }}>
                                        {step === 1 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                                <h2 style={{ color: 'var(--secondary)' }}>IDENTITY</h2>
                                                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Professional Name" className="premium-input" />
                                                <input name="role" value={formData.role} onChange={handleInputChange} placeholder="Target Designation" className="premium-input" />
                                            </div>
                                        )}
                                        {step === 2 && <textarea name="experience" value={formData.experience} onChange={handleInputChange} placeholder="Experience highlights..." className="premium-input" style={{ minHeight: '200px' }} />}
                                        {step === 3 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                                <input name="rawSkills" value={formData.rawSkills} onChange={handleInputChange} placeholder="Technical Skills" className="premium-input" />
                                                <input name="passions" value={formData.passions} onChange={handleInputChange} placeholder="Passions" className="premium-input" />
                                            </div>
                                        )}
                                        {step === 4 && (
                                            <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
                                                {isLoading ? <Sparkles size={80} color="var(--secondary)" className="animate-pulse" /> : <button className="btn-primary" onClick={() => window.print()}>READY FOR DOWNLOAD</button>}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <button onClick={prevStep} className="btn-primary">BACK</button>
                                        {step < 3 ? <button onClick={nextStep} className="btn-primary">NEXT</button> : step === 3 && <button onClick={generateAI} className="btn-primary">FORGE</button>}
                                    </div>
                                </div>
                            </section>
                            <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                <div className="premium-card preview-sheet" style={{ background: '#fff', color: '#000', padding: '4rem', minHeight: '850px' }}>
                                    <h1 style={{ fontSize: '3rem', margin: 0, fontWeight: '900' }}>{formData.name || 'ANONYMOUS'}</h1>
                                    <h2 style={{ fontSize: '1.4rem', color: '#444' }}>{formData.role || 'PROFESSIONAL OPERATIVE'}</h2>
                                    <p style={{ marginTop: '3rem' }}>{generatedContent.summary || 'Summary placeholder...'}</p>
                                    <p style={{ marginTop: '2rem' }}>{generatedContent.skills || 'Skills placeholder...'}</p>
                                </div>
                            </section>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dev-mode"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}
                        >
                            <section>
                                <div className="terminal-window">
                                    <div className="terminal-header">
                                        <div className="dot red"></div>
                                        <div className="dot yellow"></div>
                                        <div className="dot green"></div>
                                        <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: '#555' }}>forge@studio:~/command</span>
                                    </div>
                                    <div className="code-line">>&nbsp;Initializing Forge Protocol...</div>
                                    <div className="code-line">>&nbsp;Dev Studio active: <span style={{ color: 'var(--neon-cyan)' }}>READY</span></div>
                                    <div className="code-line" style={{ marginTop: '20px' }}>The Dev Studio is your technical portfolio command center. Use it to fine-tune your technical asset presentation and neural logic maps.</div>
                                    <div className="code-line">>&nbsp;<span className="typing-cursor"></span></div>
                                </div>

                                <div className="premium-card" style={{ marginTop: '2rem', borderColor: 'rgba(157,0,255,0.2)' }}>
                                    <h2 style={{ color: 'var(--neon-purple)', fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Cpu size={18} /> NEURAL FEED</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', borderLeft: '2px solid var(--neon-cyan)' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#555' }}>NEURAL LOAD</div>
                                            <div style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>12.8%</div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="premium-card" style={{ height: '100%', borderColor: 'rgba(0,243,255,0.2)' }}>
                                    <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Terminal size={20} /> STUDIO COMMANDS</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {['DEEP CORE SCAN', 'TECHNICAL SYNC', 'PORTFOLIO BOOT'].map(cmd => (
                                            <button key={cmd} className="btn-primary" style={{ textAlign: 'left', borderColor: 'rgba(0,243,255,0.1)', color: 'var(--neon-cyan)', fontSize: '0.8rem' }}>
                                                {cmd}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <div className="mode-switcher">
                <button
                    className={`mode-btn ${mode === 'resume' ? 'active' : ''}`}
                    onClick={() => setMode('resume')}
                >
                    Resume Forge
                </button>
                <button
                    className={`mode-btn ${mode === 'dev' ? 'active' : ''}`}
                    onClick={() => setMode('dev')}
                >
                    Dev Studio
                </button>
            </div>

            {showSettings && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(2,12,27,0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card" style={{ maxWidth: '500px', width: '90%', borderColor: 'var(--secondary)' }}>
                        <h2 style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>SECURITY</h2>
                        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="OPENAI ACCESS TOKEN" className="premium-input" />
                        <button onClick={saveApiKey} className="btn-primary" style={{ width: '100%', marginTop: '2rem', background: 'var(--secondary)', color: 'var(--primary)' }}>AUTHORIZE</button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default App;
