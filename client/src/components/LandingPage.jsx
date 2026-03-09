import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sparkles, Zap, FileText, ArrowRight, Layout, Cpu,
    CheckCircle, Search, BarChart, ShieldCheck, Globe,
    ChevronRight, Award
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

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
                        AI-Powered Career Strategist
                    </div>

                    <h1 className="landing-title">
                        Only <span className="gradient-text-gold">2%</span> of resumes make it past the first round.
                        <br />
                        <span className="gradient-text-cyan">Be in the top 2%</span>
                    </h1>

                    <p className="landing-subtitle">
                        Standard resumes are ignored. Our AI doesn't just "write" your resume —
                        it builds a <strong>competitive advantage</strong>. Optimized for ATS,
                        tailored for humans, and powered by Gemini.
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

                {/* Core Features Grid */}
                <motion.div
                    className="landing-features"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div className="glass-card feature-card" variants={itemVariants}>
                        <div className="feature-card-icon gold">
                            <Zap size={24} />
                        </div>
                        <h3>AI Powered</h3>
                        <p>Gemini AI integration crafts compelling professional narratives that pass ATS scans and highlight your strengths.</p>
                    </motion.div>

                    <motion.div className="glass-card feature-card" variants={itemVariants}>
                        <div className="feature-card-icon cyan">
                            <Layout size={24} />
                        </div>
                        <h3>Industry Templates</h3>
                        <p>Choose from 5 professionally designed templates tailored for IT, Finance, Healthcare, Creative, and General roles.</p>
                    </motion.div>

                    <motion.div className="glass-card feature-card" variants={itemVariants}>
                        <div className="feature-card-icon green">
                            <FileText size={24} />
                        </div>
                        <h3>Instant Export</h3>
                        <p>Live preview updates in real-time. Export your polished resume to PDF with a single click, ready to send.</p>
                    </motion.div>
                </motion.div>
            </div>

            {/* How It Works Section */}
            <section className="section bg-alt">
                <div className="container">
                    <motion.h2
                        className="section-title center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        How it Works
                    </motion.h2>
                    <motion.p
                        className="section-subtitle center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        Three simple steps to your most powerful resume yet.
                    </motion.p>

                    <motion.div
                        className="steps-grid"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <motion.div className="step-card" variants={itemVariants}>
                            <div className="step-num">01</div>
                            <div className="step-icon">
                                <Layout />
                            </div>
                            <h3>Select Template</h3>
                            <p>Choose a template specifically designed for your industry (Tech, Finance, etc.)</p>
                        </motion.div>

                        <motion.div className="step-card" variants={itemVariants}>
                            <div className="step-num">02</div>
                            <div className="step-icon">
                                <Sparkles />
                            </div>
                            <h3>AI Power-Up</h3>
                            <p>Fill in your details and use AI to generate summaries and power-up your experience.</p>
                        </motion.div>

                        <motion.div className="step-card" variants={itemVariants}>
                            <div className="step-num">03</div>
                            <div className="step-icon">
                                <FileText />
                            </div>
                            <h3>Export PDF</h3>
                            <p>Download your professionally formatted, ATS-friendly resume instantly.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* AI Deep Dive Section */}
            <section className="section">
                <div className="container">
                    <motion.h2
                        className="section-title center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        AI-Powered Advantage
                    </motion.h2>
                    <motion.p
                        className="section-subtitle center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        Stop guessing what recruiters want. Let our AI tell you.
                    </motion.p>

                    <motion.div
                        className="features-grid-large"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <motion.div className="glass-card ai-feature" variants={itemVariants}>
                            <div className="ai-feature-icon"><Zap /></div>
                            <h4>AI Summary Generator</h4>
                            <p>Instantly create a powerful professional summary that captures your career essence.</p>
                        </motion.div>
                        <motion.div className="glass-card ai-feature" variants={itemVariants}>
                            <div className="ai-feature-icon"><Search /></div>
                            <h4>Resume Tailor</h4>
                            <p>Paste a job description and watch the AI rewrite your summary to match perfectly.</p>
                        </motion.div>
                        <motion.div className="glass-card ai-feature" variants={itemVariants}>
                            <div className="ai-feature-icon"><BarChart /></div>
                            <h4>Bullet Power-Up</h4>
                            <p>Transform boring tasks into data-driven achievements that wow hiring managers.</p>
                        </motion.div>
                        <motion.div className="glass-card ai-feature" variants={itemVariants}>
                            <div className="ai-feature-icon"><Sparkles /></div>
                            <h4>Skills Enhancer</h4>
                            <p>Discover hidden skills you didn't know you had and present them professionally.</p>
                        </motion.div>
                        <motion.div className="glass-card ai-feature" variants={itemVariants}>
                            <div className="ai-feature-icon"><ShieldCheck /></div>
                            <h4>ATS Validator</h4>
                            <p>Ensures your resume structure is readable by automated screening systems.</p>
                        </motion.div>
                        <motion.div className="glass-card ai-feature" variants={itemVariants}>
                            <div className="ai-feature-icon"><Globe /></div>
                            <h4>Industry Tuning</h4>
                            <p>AI models specifically tuned for Tech, Finance, Healthcare, and Creative fields.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Value Prop Section */}
            <section className="section section-value bg-alt">
                <div className="container">
                    <div className="text-center max-w-800 mx-auto">
                        <h2 className="section-title">Use the best resume maker as your guide!</h2>
                        <p className="section-text text-xl">
                            Getting that dream job can seem like an impossible task. We're here to change that.
                            Give yourself a real advantage with the best online resume maker:
                            <strong> created by experts, improved by data, trusted by millions</strong> of professionals.
                        </p>
                        <ul className="value-list-grid">
                            <li><CheckCircle size={18} color="var(--secondary)" /> <span>Recruiter-tested templates</span></li>
                            <li><CheckCircle size={18} color="var(--secondary)" /> <span>AI-driven power words</span></li>
                            <li><CheckCircle size={18} color="var(--secondary)" /> <span>ATS-optimized structures</span></li>
                            <li><CheckCircle size={18} color="var(--secondary)" /> <span>100% Data Privacy</span></li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Authentic Showcase Section (Pictures at the bottom) */}
            <section className="section section-showcase">
                <div className="container text-center">
                    <h2 className="section-title center">Authentic Experience. Real Results.</h2>
                    <p className="section-subtitle center">Take a look at the powerful interface helping professionals worldwide.</p>

                    <div className="showcase-grid">
                        <motion.div
                            className="showcase-item"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <img src="/assets/builder-screenshot.png" alt="The AI Builder Interface" className="showcase-img" />
                            <div className="showcase-caption">The Advanced AI Builder</div>
                        </motion.div>
                        <motion.div
                            className="showcase-item"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <img src="/assets/templates-screenshot.png" alt="Industry Selector" className="showcase-img" />
                            <div className="showcase-caption">Industry-Specific Templates</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p className="footer-copyright">&copy; 2026 ResumeForge AI. Built by Bilaal — All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
