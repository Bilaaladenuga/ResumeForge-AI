import React, { useRef, useState, useCallback } from 'react';
import {
    User, Briefcase, GraduationCap, FolderKanban, Award, Wrench,
    ChevronDown, ChevronUp, Plus, X, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import { FormData, OpenSections, ValidationErrors, TouchedSections } from '../types';

interface SectionConfig {
    id: string;
    title: string;
    icon: React.ReactElement;
    defaultOpen: boolean;
}

const sectionConfig: SectionConfig[] = [
    { id: 'about', title: 'About', icon: <User size={16} />, defaultOpen: true },
    { id: 'experience', title: 'Experience', icon: <Briefcase size={16} />, defaultOpen: false },
    { id: 'education', title: 'Education', icon: <GraduationCap size={16} />, defaultOpen: false },
    { id: 'projects', title: 'Projects', icon: <FolderKanban size={16} />, defaultOpen: false },
    { id: 'skills', title: 'Skills', icon: <Wrench size={16} />, defaultOpen: false },
    { id: 'achievements', title: 'Achievements', icon: <Award size={16} />, defaultOpen: false },
];

interface FormInputProps {
    label: string;
    error: string | null;
    touched: boolean | undefined;
    inputId?: string;
    children: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({ label, error, touched, inputId, children }) => {
    const showError = touched && error;
    return (
        <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }} htmlFor={inputId}>
                {label}
                {showError && <AlertCircle size={10} color="var(--danger)" />}
            </label>
            {children}
            {showError && (
                <span style={{
                    fontSize: '0.65rem',
                    color: 'var(--danger)',
                    marginTop: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                }}>
                    <AlertCircle size={10} /> {error}
                </span>
            )}
        </div>
    );
};

interface ResumeFormProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    openSections: OpenSections;
    setOpenSections: React.Dispatch<React.SetStateAction<OpenSections>>;
    errors?: ValidationErrors;
    touched?: TouchedSections;
    onSectionTouch?: (section: string) => void;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ formData, setFormData, openSections, setOpenSections, errors = {}, touched = {}, onSectionTouch }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageError, setImageError] = useState('');

    const toggleSection = useCallback((sectionId: string) => {
        setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
        if (onSectionTouch) onSectionTouch(sectionId);
    }, [setOpenSections, onSectionTouch]);

    const handleChange = useCallback((field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, [setFormData]);

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setImageError('Image must be under 5MB');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setImageError('Only JPEG, PNG, WebP, and GIF images are allowed');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setImageError('');
        const reader = new FileReader();
        reader.onloadend = () => {
            handleChange('image', reader.result as string);
        };
        reader.readAsDataURL(file);
    }, [handleChange]);

    // Repeater helpers
    const addRepeaterItem = useCallback((field: string, template: Record<string, any>) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field as keyof FormData] as any[] || []), { ...template, id: Date.now() }]
        }));
    }, [setFormData]);

    const removeRepeaterItem = useCallback((field: string, id: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field as keyof FormData] as any[]).filter((item: any) => item.id !== id)
        }));
    }, [setFormData]);

    const updateRepeaterItem = useCallback((field: string, id: number, key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field as keyof FormData] as any[]).map((item: any) =>
                item.id === id ? { ...item, [key]: value } : item
            )
        }));
    }, [setFormData]);

    const renderSection = (section: SectionConfig) => {
        const isOpen = openSections[section.id];
        const hasSectionError = touched[section.id] && errors[section.id] && Object.keys(errors[section.id]).length > 0;

        return (
            <div key={section.id} className={`form-section ${isOpen ? 'open' : ''}`}>
                <div
                    className="form-section-header"
                    onClick={() => toggleSection(section.id)}
                    style={hasSectionError ? { borderLeft: '2px solid var(--danger)' } : {}}
                >
                    <div className="form-section-title">
                        {section.icon}
                        {section.title}
                        {hasSectionError && <AlertCircle size={12} color="var(--danger)" />}
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

    const renderAboutSection = () => {
        const isTouched = touched.about;
        const secErrors = errors.about || {};
        return (
            <>
                <div className="form-row">
                    <FormInput label="First Name" error={secErrors.firstName} touched={isTouched} inputId="firstName">
                        <input
                            id="firstName"
                            name="firstName"
                            className={`form-input${secErrors.firstName && isTouched ? ' input-error' : ''}`}
                            placeholder="e.g. John"
                            value={formData.firstName || ''}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                        />
                    </FormInput>
                    <FormInput label="Last Name" error={secErrors.lastName} touched={isTouched} inputId="lastName">
                        <input
                            id="lastName"
                            name="lastName"
                            className={`form-input${secErrors.lastName && isTouched ? ' input-error' : ''}`}
                            placeholder="e.g. Doe"
                            value={formData.lastName || ''}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                        />
                    </FormInput>
                </div>
                <div className="form-row">
                    <FormInput label="Designation / Role" error={secErrors.designation} touched={isTouched} inputId="designation">
                        <input
                            id="designation"
                            name="designation"
                            className={`form-input${secErrors.designation && isTouched ? ' input-error' : ''}`}
                            placeholder="e.g. Senior Software Engineer"
                            value={formData.designation || ''}
                            onChange={(e) => handleChange('designation', e.target.value)}
                        />
                    </FormInput>
                    <div className="form-group">
                        <label className="form-label" htmlFor="profilePhoto">Profile Photo</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                ref={fileInputRef}
                                id="profilePhoto"
                                name="profilePhoto"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleImageUpload}
                                className="form-input"
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <ImageIcon size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        </div>
                        {imageError && (
                            <span style={{
                                fontSize: '0.65rem',
                                color: 'var(--danger)',
                                marginTop: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                            }}>
                                <AlertCircle size={10} /> {imageError}
                            </span>
                        )}
                    </div>
                </div>
                <div className="form-row">
                    <FormInput label="Email" error={secErrors.email} touched={isTouched} inputId="email">
                        <input
                            id="email"
                            name="email"
                            className={`form-input${secErrors.email && isTouched ? ' input-error' : ''}`}
                            type="email"
                            placeholder="e.g. john@example.com"
                            value={formData.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                    </FormInput>
                    <FormInput label="Phone" error={secErrors.phone} touched={isTouched} inputId="phone">
                        <input
                            id="phone"
                            name="phone"
                            className={`form-input${secErrors.phone && isTouched ? ' input-error' : ''}`}
                            placeholder="e.g. +1 (555) 123-4567"
                            value={formData.phone || ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                    </FormInput>
                </div>
                <FormInput label="Address" error={null} touched={false} inputId="address">
                    <input
                        id="address"
                        name="address"
                        className="form-input"
                        placeholder="e.g. San Francisco, CA"
                        value={formData.address || ''}
                        onChange={(e) => handleChange('address', e.target.value)}
                    />
                </FormInput>
                <FormInput label="Professional Summary" error={secErrors.summary} touched={isTouched} inputId="summary">
                    <textarea
                        id="summary"
                        name="summary"
                        className={`form-input${secErrors.summary && isTouched ? ' input-error' : ''}`}
                        placeholder="A brief overview of your professional background..."
                        value={formData.summary || ''}
                        onChange={(e) => handleChange('summary', e.target.value)}
                        style={{ minHeight: '100px' }}
                    />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.2rem', textAlign: 'right', display: 'block' }}>
                        {(formData.summary || '').length}/1500
                    </span>
                </FormInput>
            </>
        );
    };

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
                <label className="form-label" htmlFor="skillsRaw">Skills (comma separated)</label>
                <textarea
                    id="skillsRaw"
                    name="skillsRaw"
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
