import React from 'react';
import { FormData } from '../types';

const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const LegalTemplate = ({ data }: { data: FormData }) => {
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Your Name';
    const skills = (data.skillsRaw || '').split(',').map(s => s.trim()).filter(Boolean);

    return (
        <div className="preview-container template-legal">
            {/* Header with classic law firm feel */}
            <div className="legal-header">
                {data.image && <img src={data.image} alt="Profile" className="legal-avatar" />}
                <h1 className="legal-name">{fullName}</h1>
                <p className="legal-designation">{data.designation || 'Legal Professional'}</p>
                <div className="legal-contact">
                    {data.email && <span>{data.email}</span>}
                    {data.phone && <span>{data.phone}</span>}
                    {data.address && <span>{data.address}</span>}
                </div>
                <div className="legal-header-bar"></div>
            </div>

            <div className="legal-body">
                {/* Summary */}
                {data.summary && (
                    <div className="legal-section">
                        <h2 className="legal-section-title">Professional Summary</h2>
                        <p className="legal-text">{data.summary}</p>
                    </div>
                )}

                {/* Experience (emphasized for legal) */}
                {data.experiences?.length > 0 && (
                    <div className="legal-section">
                        <h2 className="legal-section-title">Professional Experience</h2>
                        {data.experiences.map((exp) => (
                            <div key={exp.id} className="legal-entry">
                                <div className="legal-entry-header">
                                    <div>
                                        <strong>{exp.title}</strong>
                                        <p className="legal-company">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                                    </div>
                                    <span className="legal-date">{formatDate(exp.startDate)} – {formatDate(exp.endDate)}</span>
                                </div>
                                {exp.description && (
                                    <ul className="legal-bullets">
                                        {exp.description.split('\n').filter(Boolean).map((line, i) => (
                                            <li key={i}>{line}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Education (prominent for legal) */}
                {data.educations?.length > 0 && (
                    <div className="legal-section">
                        <h2 className="legal-section-title">Education</h2>
                        {data.educations.map((edu) => (
                            <div key={edu.id} className="legal-entry">
                                <div className="legal-entry-header">
                                    <strong>{edu.degree}</strong>
                                    <span className="legal-date">{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
                                </div>
                                <p className="legal-company">{edu.school}{edu.city ? `, ${edu.city}` : ''}</p>
                                {edu.description && <p className="legal-text">{edu.description}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Skills as core competencies */}
                {skills.length > 0 && (
                    <div className="legal-section">
                        <h2 className="legal-section-title">Areas of Expertise</h2>
                        <div className="legal-skills-grid">
                            {skills.map((skill, i) => (
                                <span key={i} className="legal-skill-item">{skill}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Achievements (bar admissions, certifications) */}
                {data.achievements?.length > 0 && (
                    <div className="legal-section">
                        <h2 className="legal-section-title">Bar Admissions & Certifications</h2>
                        {data.achievements.map((ach) => (
                            <div key={ach.id} className="legal-entry">
                                <strong>{ach.title}</strong>
                                {ach.description && <p className="legal-text" style={{ marginTop: '0.15rem' }}>{ach.description}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Projects (publications, cases) */}
                {data.projects?.length > 0 && (
                    <div className="legal-section">
                        <h2 className="legal-section-title">Publications & Key Matters</h2>
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="legal-entry">
                                <strong>{proj.title}</strong>
                                {proj.description && <p className="legal-text">{proj.description}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LegalTemplate;
