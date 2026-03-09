import React from 'react';

const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const TechTemplate = ({ data }) => {
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Your Name';
    const skills = (data.skillsRaw || '').split(',').map(s => s.trim()).filter(Boolean);

    return (
        <div className="preview-container template-tech">
            {/* Header */}
            <div className="tech-header">
                <div className="tech-header-content">
                    {data.image && <img src={data.image} alt="Profile" className="tech-avatar" />}
                    <div>
                        <h1 className="tech-name">{fullName}</h1>
                        <p className="tech-designation">{data.designation || 'Professional Title'}</p>
                        <div className="tech-contact">
                            {data.email && <span>{data.email}</span>}
                            {data.phone && <span>{data.phone}</span>}
                            {data.address && <span>{data.address}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="tech-body">
                {/* Skills First (Tech prioritizes skills) */}
                {skills.length > 0 && (
                    <div className="tech-section">
                        <h2 className="tech-section-title">Technical Skills</h2>
                        <div className="tech-skills-grid">
                            {skills.map((skill, i) => (
                                <span key={i} className="tech-skill-badge">{skill}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary */}
                {data.summary && (
                    <div className="tech-section">
                        <h2 className="tech-section-title">Summary</h2>
                        <p className="tech-text">{data.summary}</p>
                    </div>
                )}

                {/* Projects (Tech prioritizes projects) */}
                {data.projects?.length > 0 && (
                    <div className="tech-section">
                        <h2 className="tech-section-title">Projects</h2>
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="tech-entry">
                                <div className="tech-entry-header">
                                    <strong>{proj.title}</strong>
                                    {proj.link && <a href={proj.link} className="tech-link">{proj.link}</a>}
                                </div>
                                {proj.description && <p className="tech-text">{proj.description}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Experience */}
                {data.experiences?.length > 0 && (
                    <div className="tech-section">
                        <h2 className="tech-section-title">Experience</h2>
                        {data.experiences.map((exp) => (
                            <div key={exp.id} className="tech-entry">
                                <div className="tech-entry-header">
                                    <strong>{exp.title}</strong>
                                    <span className="tech-date">{formatDate(exp.startDate)} — {formatDate(exp.endDate)}</span>
                                </div>
                                <p className="tech-company">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                                {exp.description && (
                                    <ul className="tech-bullets">
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
                    <div className="tech-section">
                        <h2 className="tech-section-title">Education</h2>
                        {data.educations.map((edu) => (
                            <div key={edu.id} className="tech-entry">
                                <div className="tech-entry-header">
                                    <strong>{edu.degree}</strong>
                                    <span className="tech-date">{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
                                </div>
                                <p className="tech-company">{edu.school}{edu.city ? ` · ${edu.city}` : ''}</p>
                                {edu.description && <p className="tech-text">{edu.description}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Achievements */}
                {data.achievements?.length > 0 && (
                    <div className="tech-section">
                        <h2 className="tech-section-title">Achievements</h2>
                        {data.achievements.map((ach) => (
                            <div key={ach.id} className="tech-entry">
                                <strong>{ach.title}</strong>
                                {ach.description && <p className="tech-text">{ach.description}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechTemplate;
