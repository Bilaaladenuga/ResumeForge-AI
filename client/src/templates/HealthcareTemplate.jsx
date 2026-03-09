import React from 'react';

const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const HealthcareTemplate = ({ data }) => {
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Your Name';
    const skills = (data.skillsRaw || '').split(',').map(s => s.trim()).filter(Boolean);

    return (
        <div className="preview-container template-healthcare">
            <div className="hc-layout">
                {/* Sidebar */}
                <div className="hc-sidebar">
                    {data.image && <img src={data.image} alt="Profile" className="hc-avatar" />}
                    <h1 className="hc-name">{fullName}</h1>
                    <p className="hc-designation">{data.designation || 'Professional Title'}</p>

                    <div className="hc-sidebar-section">
                        <h3 className="hc-sidebar-title">Contact</h3>
                        {data.email && <p className="hc-sidebar-text">{data.email}</p>}
                        {data.phone && <p className="hc-sidebar-text">{data.phone}</p>}
                        {data.address && <p className="hc-sidebar-text">{data.address}</p>}
                    </div>

                    {skills.length > 0 && (
                        <div className="hc-sidebar-section">
                            <h3 className="hc-sidebar-title">Skills</h3>
                            <ul className="hc-skills-list">
                                {skills.map((skill, i) => (
                                    <li key={i}>{skill}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {data.achievements?.length > 0 && (
                        <div className="hc-sidebar-section">
                            <h3 className="hc-sidebar-title">Certifications</h3>
                            {data.achievements.map((ach) => (
                                <div key={ach.id} className="hc-cert-item">
                                    <strong>{ach.title}</strong>
                                    {ach.description && <p className="hc-sidebar-text">{ach.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="hc-main">
                    {data.summary && (
                        <div className="hc-section">
                            <h2 className="hc-section-title">Professional Summary</h2>
                            <p className="hc-text">{data.summary}</p>
                        </div>
                    )}

                    {data.experiences?.length > 0 && (
                        <div className="hc-section">
                            <h2 className="hc-section-title">Clinical Experience</h2>
                            {data.experiences.map((exp) => (
                                <div key={exp.id} className="hc-entry">
                                    <div className="hc-entry-header">
                                        <strong>{exp.title}</strong>
                                        <span className="hc-date">{formatDate(exp.startDate)} — {formatDate(exp.endDate)}</span>
                                    </div>
                                    <p className="hc-company">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                                    {exp.description && (
                                        <ul className="hc-bullets">
                                            {exp.description.split('\n').filter(Boolean).map((line, i) => (
                                                <li key={i}>{line}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.educations?.length > 0 && (
                        <div className="hc-section">
                            <h2 className="hc-section-title">Education</h2>
                            {data.educations.map((edu) => (
                                <div key={edu.id} className="hc-entry">
                                    <div className="hc-entry-header">
                                        <strong>{edu.degree}</strong>
                                        <span className="hc-date">{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
                                    </div>
                                    <p className="hc-company">{edu.school}{edu.city ? ` · ${edu.city}` : ''}</p>
                                    {edu.description && <p className="hc-text">{edu.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.projects?.length > 0 && (
                        <div className="hc-section">
                            <h2 className="hc-section-title">Research & Projects</h2>
                            {data.projects.map((proj) => (
                                <div key={proj.id} className="hc-entry">
                                    <strong>{proj.title}</strong>
                                    {proj.description && <p className="hc-text">{proj.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HealthcareTemplate;
