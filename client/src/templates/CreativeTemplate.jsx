import React from 'react';

const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const CreativeTemplate = ({ data }) => {
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Your Name';
    const skills = (data.skillsRaw || '').split(',').map(s => s.trim()).filter(Boolean);

    return (
        <div className="preview-container template-creative">
            {/* Bold Header */}
            <div className="creative-header">
                <div className="creative-header-bg"></div>
                <div className="creative-header-content">
                    {data.image && <img src={data.image} alt="Profile" className="creative-avatar" />}
                    <div>
                        <h1 className="creative-name">{fullName}</h1>
                        <p className="creative-designation">{data.designation || 'Creative Professional'}</p>
                        <div className="creative-contact">
                            {data.email && <span>{data.email}</span>}
                            {data.phone && <span>{data.phone}</span>}
                            {data.address && <span>{data.address}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="creative-body">
                {/* Summary */}
                {data.summary && (
                    <div className="creative-section">
                        <h2 className="creative-section-title">About Me</h2>
                        <p className="creative-text">{data.summary}</p>
                    </div>
                )}

                {/* Skills as visual tags */}
                {skills.length > 0 && (
                    <div className="creative-section">
                        <h2 className="creative-section-title">Expertise</h2>
                        <div className="creative-skills">
                            {skills.map((skill, i) => (
                                <span key={i} className="creative-skill-tag">{skill}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects / Portfolio */}
                {data.projects?.length > 0 && (
                    <div className="creative-section">
                        <h2 className="creative-section-title">Portfolio</h2>
                        <div className="creative-projects-grid">
                            {data.projects.map((proj) => (
                                <div key={proj.id} className="creative-project-card">
                                    <h4>{proj.title}</h4>
                                    {proj.description && <p>{proj.description}</p>}
                                    {proj.link && <a href={proj.link} className="creative-link">View →</a>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Experience */}
                {data.experiences?.length > 0 && (
                    <div className="creative-section">
                        <h2 className="creative-section-title">Experience</h2>
                        {data.experiences.map((exp) => (
                            <div key={exp.id} className="creative-entry">
                                <div className="creative-entry-dot"></div>
                                <div className="creative-entry-content">
                                    <div className="creative-entry-header">
                                        <strong>{exp.title}</strong>
                                        <span className="creative-date">{formatDate(exp.startDate)} — {formatDate(exp.endDate)}</span>
                                    </div>
                                    <p className="creative-company">{exp.company}</p>
                                    {exp.description && (
                                        <ul className="creative-bullets">
                                            {exp.description.split('\n').filter(Boolean).map((line, i) => (
                                                <li key={i}>{line}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Education */}
                {data.educations?.length > 0 && (
                    <div className="creative-section">
                        <h2 className="creative-section-title">Education</h2>
                        {data.educations.map((edu) => (
                            <div key={edu.id} className="creative-entry">
                                <div className="creative-entry-dot"></div>
                                <div className="creative-entry-content">
                                    <strong>{edu.degree}</strong>
                                    <p className="creative-company">{edu.school}{edu.city ? `, ${edu.city}` : ''}</p>
                                    <span className="creative-date">{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Achievements */}
                {data.achievements?.length > 0 && (
                    <div className="creative-section">
                        <h2 className="creative-section-title">Awards</h2>
                        {data.achievements.map((ach) => (
                            <div key={ach.id} style={{ marginBottom: '0.5rem' }}>
                                <strong>{ach.title}</strong>
                                {ach.description && <span> — {ach.description}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreativeTemplate;
