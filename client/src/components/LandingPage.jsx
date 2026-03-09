import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, FileText, ArrowRight, Layout, Cpu } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing">
            <div className="landing-bg" />

            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-inner">
                        <div className="navbar-brand">
                            <Sparkles color="var(--secondary)" size={28} />
                            <span className="navbar-brand-text gradient-text">ResumeForge</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <div className="landing-hero">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                    <div className="landing-badge">
                        <Cpu size={14} />
                        AI-Powered Resume Builder
                    </div>

                    <h1 className="landing-title">
                        Only <span className="gradient-text">2%</span> of resumes make it past the first round.{' '}
                        <span className="gradient-text">Be in the top 2%</span>
                    </h1>

                    <p className="landing-subtitle">
                        Use professional, industry-tested resume templates powered by AI.
                        Craft compelling narratives that pass ATS scans and impress recruiters —
                        done within minutes.
                    </p>

                    <div className="landing-cta">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => navigate('/templates')}
                            id="cta-create-resume"
                        >
                            Create My Resume <ArrowRight size={20} />
                        </button>
                    </div>
                </motion.div>

                {/* Feature Cards */}
                <motion.div
                    className="landing-features"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                >
                    <div className="glass-card feature-card">
                        <div className="feature-card-icon gold">
                            <Zap size={24} />
                        </div>
                        <h3>AI Powered</h3>
                        <p>Gemini AI integration crafts compelling professional narratives that pass ATS scans and highlight your strengths.</p>
                    </div>

                    <div className="glass-card feature-card">
                        <div className="feature-card-icon cyan">
                            <Layout size={24} />
                        </div>
                        <h3>Industry Templates</h3>
                        <p>Choose from 5 professionally designed templates tailored for IT, Finance, Healthcare, Creative, and General roles.</p>
                    </div>

                    <div className="glass-card feature-card">
                        <div className="feature-card-icon green">
                            <FileText size={24} />
                        </div>
                        <h3>Instant Export</h3>
                        <p>Live preview updates in real-time. Export your polished resume to PDF with a single click, ready to send.</p>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} ResumeForge AI. Built by Bilaal — All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
