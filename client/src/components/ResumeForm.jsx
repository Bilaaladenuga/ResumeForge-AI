import React from 'react';
import {
    User, Briefcase, GraduationCap, FolderKanban, Award, Wrench,
    ChevronDown, ChevronUp, Plus, X, Image
} from 'lucide-react';

const sectionConfig = [
    { id: 'about', title: 'About', icon: <User size={16} />, defaultOpen: true },
    { id: 'experience', title: 'Experience', icon: <Briefcase size={16} />, defaultOpen: false },
    { id: 'education', title: 'Education', icon: <GraduationCap size={16} />, defaultOpen: false },
    { id: 'projects', title: 'Projects', icon: <FolderKanban size={16} />, defaultOpen: false },
    { id: 'skills', title: 'Skills', icon: <Wrench size={16} />, defaultOpen: false },
    { id: 'achievements', title: 'Achievements', icon: <Award size={16} />, defaultOpen: false },
];

const ResumeForm = ({ formData, setFormData, openSections, setOpenSections }) => {

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('image', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Repeater helpers
    const addRepeaterItem = (field, template) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), { ...template, id: Date.now() }]
        }));
    };

    const removeRepeaterItem = (field, id) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(item => item.id !== id)
        }));
    };

    const updateRepeaterItem = (field, id, key, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map(item =>
                item.id === id ? { ...item, [key]: value } : item
            )
        }));
    };

    const renderSection = (section) => {
        const isOpen = openSections[section.id];

        return (
            <div key={section.id} className={`form-section ${isOpen ? 'open' : ''}`}>
                <div className="form-section-header" onClick={() => toggleSection(section.id)}>
                    <div className="form-section-title">
                        {section.icon}
                        {section.title}
                    </div>
                    {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </div>

                {isOpen && (
                    <div className="form-section-content">
                        {section.id === 'about' && renderAboutSection()}
                        {section.id === 'experience' && renderExperienceSection()}
                        {section.id === 'education' && renderEducationSection()}
                        {section.id === 'projects' && renderProjectsSection()}
                        {section.id === 'skills' && renderSkillsSection()}
                        {section.id === 'achievements' && renderAchievementsSection()}
                    </div>
                )}
            </div>
        );
    };

    const renderAboutSection = () => (
        <>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                        className="form-input"
                        placeholder="e.g. John"
                        value={formData.firstName || ''}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                        className="form-input"
                        placeholder="e.g. Doe"
                        value={formData.lastName || ''}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                    />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Designation / Role</label>
                    <input
                        className="form-input"
                        placeholder="e.g. Senior Software Engineer"
                        value={formData.designation || ''}
                        onChange={(e) => handleChange('designation', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Profile Photo</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="form-input"
                            style={{ paddingLeft: '2.5rem' }}
                        />
                        <Image size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    </div>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        className="form-input"
                        type="email"
                        placeholder="e.g. john@example.com"
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                        className="form-input"
                        placeholder="e.g. +1 (555) 123-4567"
                        value={formData.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                    />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Address</label>
                <input
                    className="form-input"
                    placeholder="e.g. San Francisco, CA"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Professional Summary</label>
                <textarea
                    className="form-input"
                    placeholder="A brief overview of your professional background..."
                    value={formData.summary || ''}
                    onChange={(e) => handleChange('summary', e.target.value)}
                    style={{ minHeight: '100px' }}
                />
            </div>
        </>
    );

    const renderExperienceSection = () => (
        <>
            {(formData.experiences || []).map((exp) => (
                <div key={exp.id} className="repeater-item">
                    <button className="repeater-remove-btn" onClick={() => removeRepeaterItem('experiences', exp.id)}>
                        <X size={12} />
                    </button>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Job Title</label>
                            <input className="form-input" placeholder="e.g. Software Engineer" value={exp.title || ''} onChange={(e) => updateRepeaterItem('experiences', exp.id, 'title', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Company</label>
                            <input className="form-input" placeholder="e.g. Google" value={exp.company || ''} onChange={(e) => updateRepeaterItem('experiences', exp.id, 'company', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-row" style={{ marginTop: '0.75rem' }}>
                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input className="form-input" placeholder="e.g. Mountain View, CA" value={exp.location || ''} onChange={(e) => updateRepeaterItem('experiences', exp.id, 'location', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input className="form-input" type="month" value={exp.startDate || ''} onChange={(e) => updateRepeaterItem('experiences', exp.id, 'startDate', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input className="form-input" type="month" value={exp.endDate || ''} onChange={(e) => updateRepeaterItem('experiences', exp.id, 'endDate', e.target.value)} placeholder="Present" />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                        <label className="form-label">Description (one bullet per line)</label>
                        <textarea className="form-input" placeholder="Managed a team of 5 engineers..." value={exp.description || ''} onChange={(e) => updateRepeaterItem('experiences', exp.id, 'description', e.target.value)} style={{ minHeight: '80px' }} />
                    </div>
                </div>
            ))}
            <button className="repeater-add-btn" onClick={() => addRepeaterItem('experiences', { title: '', company: '', location: '', startDate: '', endDate: '', description: '' })}>
                <Plus size={14} /> Add Experience
            </button>
        </>
    );

    const renderEducationSection = () => (
        <>
            {(formData.educations || []).map((edu) => (
                <div key={edu.id} className="repeater-item">
                    <button className="repeater-remove-btn" onClick={() => removeRepeaterItem('educations', edu.id)}>
                        <X size={12} />
                    </button>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">School</label>
                            <input className="form-input" placeholder="e.g. MIT" value={edu.school || ''} onChange={(e) => updateRepeaterItem('educations', edu.id, 'school', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Degree</label>
                            <input className="form-input" placeholder="e.g. B.Sc. Computer Science" value={edu.degree || ''} onChange={(e) => updateRepeaterItem('educations', edu.id, 'degree', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-row" style={{ marginTop: '0.75rem' }}>
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input className="form-input" placeholder="e.g. Cambridge, MA" value={edu.city || ''} onChange={(e) => updateRepeaterItem('educations', edu.id, 'city', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input className="form-input" type="month" value={edu.startDate || ''} onChange={(e) => updateRepeaterItem('educations', edu.id, 'startDate', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input className="form-input" type="month" value={edu.endDate || ''} onChange={(e) => updateRepeaterItem('educations', edu.id, 'endDate', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                        <label className="form-label">Description</label>
                        <textarea className="form-input" placeholder="Relevant coursework, honors..." value={edu.description || ''} onChange={(e) => updateRepeaterItem('educations', edu.id, 'description', e.target.value)} />
                    </div>
                </div>
            ))}
            <button className="repeater-add-btn" onClick={() => addRepeaterItem('educations', { school: '', degree: '', city: '', startDate: '', endDate: '', description: '' })}>
                <Plus size={14} /> Add Education
            </button>
        </>
    );

    const renderProjectsSection = () => (
        <>
            {(formData.projects || []).map((proj) => (
                <div key={proj.id} className="repeater-item">
                    <button className="repeater-remove-btn" onClick={() => removeRepeaterItem('projects', proj.id)}>
                        <X size={12} />
                    </button>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Project Name</label>
                            <input className="form-input" placeholder="e.g. E-Commerce Platform" value={proj.title || ''} onChange={(e) => updateRepeaterItem('projects', proj.id, 'title', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Link</label>
                            <input className="form-input" placeholder="e.g. https://github.com/..." value={proj.link || ''} onChange={(e) => updateRepeaterItem('projects', proj.id, 'link', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                        <label className="form-label">Description</label>
                        <textarea className="form-input" placeholder="What did you build? What technologies?" value={proj.description || ''} onChange={(e) => updateRepeaterItem('projects', proj.id, 'description', e.target.value)} />
                    </div>
                </div>
            ))}
            <button className="repeater-add-btn" onClick={() => addRepeaterItem('projects', { title: '', link: '', description: '' })}>
                <Plus size={14} /> Add Project
            </button>
        </>
    );

    const renderSkillsSection = () => (
        <>
            <div className="form-group">
                <label className="form-label">Skills (comma separated)</label>
                <textarea
                    className="form-input"
                    placeholder="e.g. JavaScript, React, Node.js, Python, AWS..."
                    value={formData.skillsRaw || ''}
                    onChange={(e) => handleChange('skillsRaw', e.target.value)}
                    style={{ minHeight: '60px' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    Separate each skill with a comma. AI can enhance these for you.
                </span>
            </div>
        </>
    );

    const renderAchievementsSection = () => (
        <>
            {(formData.achievements || []).map((ach) => (
                <div key={ach.id} className="repeater-item">
                    <button className="repeater-remove-btn" onClick={() => removeRepeaterItem('achievements', ach.id)}>
                        <X size={12} />
                    </button>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input className="form-input" placeholder="e.g. Employee of the Year" value={ach.title || ''} onChange={(e) => updateRepeaterItem('achievements', ach.id, 'title', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <input className="form-input" placeholder="Brief description..." value={ach.description || ''} onChange={(e) => updateRepeaterItem('achievements', ach.id, 'description', e.target.value)} />
                        </div>
                    </div>
                </div>
            ))}
            <button className="repeater-add-btn" onClick={() => addRepeaterItem('achievements', { title: '', description: '' })}>
                <Plus size={14} /> Add Achievement
            </button>
        </>
    );

    return (
        <div>
            {sectionConfig.map(renderSection)}
        </div>
    );
};

export default ResumeForm;
