import React from 'react';

const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const GeneralTemplate = ({ data }) => {
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Your Name';
    const skills = (data.skillsRaw || '').split(',').map(s => s.trim()).filter(Boolean);

    return (
        <div className="preview-container template-general">
            {/* Header */}
            <div className="general-header">
                <div className="general-header-top">
                    {data.image && <img src={data.image} alt="Profile" className="general-avatar" />}
                    <div>
                        <h1 className="general-name">{fullName}</h1>
                        <p className="general-designation">{data.designation || 'Professional Title'}</p>
                    </div>
                </div>
                <div className="general-contact">
                    {data.email && <span>{data.email}</span>}
                    {data.phone && <span>{data.phone}</span>}
                    {data.address && <span>{data.address}</span>}
                </div>
            </div>

            <div className="general-body">
                {/* Summary */}
                {data.summary && (
                    <div className="general-section">
                        <h2 className="general-section-title">Professional Summary</h2>
                        <p className="general-text">{data.summary}</p>
                    </div>
                )}

                {/* Experience */}
                {data.experiences?.length > 0 && (
                    <div className="general-section">
                        <h2 className="general-section-title">Work Experience</h2>
                        {data.experiences.map((exp) => (
                            <div key={exp.id} className="general-entry">
                                <div className="general-entry-header">
                                    <div>
                                        <strong>{exp.title}</strong>
                                        <p className="general-company">{exp.company}{exp.location ? ` — ${exp.location}` : ''}</p>
                                    </div>
                                    <span className="general-date">{formatDate(exp.startDate)} – {formatDate(exp.endDate)}</span>
                                </div>
                                {exp.description && (
                                    <ul className="general-bullets">
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
                    <div className="general-section">
                        <h2 className="general-section-title">Education</h2>
                        {data.educations.map((edu) => (
                            <div key={edu.id} className="general-entry">
                                <div className="general-entry-header">
                                    <div>
                                        <strong>{edu.degree}</strong>
                                        <p className="general-company">{edu.school}{edu.city ? ` — ${edu.city}` : ''}</p>
                                    </div>
                                    <span className="general-date">{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
                                </div>
                                {edu.description && <p className="general-text">{edu.description}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <div className="general-section">
                        <h2 className="general-section-title">Skills</h2>
                        <p className="general-text">{skills.join(' · ')}</p>
                    </div>
                )}

                {/* Projects */}
                {data.projects?.length > 0 && (
                    <div className="general-section">
                        <h2 className="general-section-title">Projects</h2>
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="general-entry">
                                <strong>{proj.title}</strong>
                                {proj.description && <p className="general-text">{proj.description}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Achievements */}
                {data.achievements?.length > 0 && (
                    <div className="general-section">
                        <h2 className="general-section-title">Achievements</h2>
                        {data.achievements.map((ach) => (
                            <div key={ach.id} className="general-entry">
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

export default GeneralTemplate;
