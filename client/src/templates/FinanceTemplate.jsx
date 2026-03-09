import React from 'react';

const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const FinanceTemplate = ({ data }) => {
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Your Name';
    const skills = (data.skillsRaw || '').split(',').map(s => s.trim()).filter(Boolean);

    return (
        <div className="preview-container template-finance">
            {/* Header */}
            <div className="finance-header">
                {data.image && <img src={data.image} alt="Profile" className="finance-avatar" />}
                <div>
                    <h1 className="finance-name">{fullName}</h1>
                    <p className="finance-designation">{data.designation || 'Professional Title'}</p>
                </div>
            </div>
            <div className="finance-contact-bar">
                {data.email && <span>{data.email}</span>}
                {data.phone && <span>{data.phone}</span>}
                {data.address && <span>{data.address}</span>}
            </div>

            <div className="finance-body">
                {/* Summary */}
                {data.summary && (
                    <div className="finance-section">
                        <h2 className="finance-section-title">Professional Summary</h2>
                        <p className="finance-text">{data.summary}</p>
                    </div>
                )}

                {/* Experience first for Finance */}
                {data.experiences?.length > 0 && (
                    <div className="finance-section">
                        <h2 className="finance-section-title">Professional Experience</h2>
                        {data.experiences.map((exp) => (
                            <div key={exp.id} className="finance-entry">
                                <div className="finance-entry-header">
                                    <div>
                                        <strong>{exp.title}</strong>
                                        <p className="finance-company">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                                    </div>
                                    <span className="finance-date">{formatDate(exp.startDate)} – {formatDate(exp.endDate)}</span>
                                </div>
                                {exp.description && (
                                    <ul className="finance-bullets">
                                        {exp.description.split('\n').filter(Boolean).map((line, i) => (
                                            <li key={i}>{line}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Education */}
                {data.educations?.length > 0 && (
                    <div className="finance-section">
                        <h2 className="finance-section-title">Education</h2>
                        {data.educations.map((edu) => (
                            <div key={edu.id} className="finance-entry">
                                <div className="finance-entry-header">
                                    <div>
                                        <strong>{edu.degree}</strong>
                                        <p className="finance-company">{edu.school}{edu.city ? `, ${edu.city}` : ''}</p>
                                    </div>
                                    <span className="finance-date">{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
                                </div>
                                {edu.description && <p className="finance-text">{edu.description}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <div className="finance-section">
                        <h2 className="finance-section-title">Core Competencies</h2>
                        <p className="finance-text">{skills.join(' • ')}</p>
                    </div>
                )}

                {/* Achievements */}
                {data.achievements?.length > 0 && (
                    <div className="finance-section">
                        <h2 className="finance-section-title">Awards & Certifications</h2>
                        {data.achievements.map((ach) => (
                            <div key={ach.id} className="finance-entry">
                                <strong>{ach.title}</strong>
                                {ach.description && <span className="finance-text"> — {ach.description}</span>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Projects */}
                {data.projects?.length > 0 && (
                    <div className="finance-section">
                        <h2 className="finance-section-title">Key Projects</h2>
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="finance-entry">
                                <strong>{proj.title}</strong>
                                {proj.description && <p className="finance-text">{proj.description}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinanceTemplate;
