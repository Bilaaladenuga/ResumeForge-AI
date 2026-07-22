import { FormData, ValidationErrors } from '../types';

interface ValidationRule {
    required: boolean;
    label: string;
    minLength?: number;
    maxLength?: number;
    maxSizeMB?: number;
    validate: (value: any) => string | null;
}

export const VALIDATION_RULES: Record<string, ValidationRule> = {
    firstName: {
        required: true,
        label: 'First Name',
        minLength: 1,
        maxLength: 100,
        validate: (value: string) => {
            if (!value || !value.trim()) return 'First name is required';
            if (value.trim().length < 1) return 'First name is required';
            if (value.trim().length > 100) return 'First name is too long';
            return null;
        }
    },
    lastName: {
        required: true,
        label: 'Last Name',
        minLength: 1,
        maxLength: 100,
        validate: (value: string) => {
            if (!value || !value.trim()) return 'Last name is required';
            if (value.trim().length > 100) return 'Last name is too long';
            return null;
        }
    },
    email: {
        required: true,
        label: 'Email',
        validate: (value: string) => {
            if (!value || !value.trim()) return 'Email is required';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
            return null;
        }
    },
    phone: {
        required: false,
        label: 'Phone',
        validate: (value: string) => {
            if (!value || !value.trim()) return null;
            const phoneRegex = /^[\d\s\-\(\)\+\.]{7,20}$/;
            if (!phoneRegex.test(value.trim())) return 'Please enter a valid phone number';
            return null;
        }
    },
    designation: {
        required: true,
        label: 'Designation / Role',
        validate: (value: string) => {
            if (!value || !value.trim()) return 'Designation is required';
            return null;
        }
    },
    summary: {
        required: false,
        label: 'Professional Summary',
        maxLength: 1500,
        validate: (value: string) => {
            if (value && value.length > 1500) return 'Summary must be under 1500 characters';
            return null;
        }
    },
    image: {
        required: false,
        label: 'Profile Photo',
        maxSizeMB: 5,
        validate: (file: File | null) => {
            if (!file) return null;
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) return 'Image must be under 5MB';
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) return 'Only JPEG, PNG, WebP, and GIF images are allowed';
            return null;
        }
    }
};

interface EntryError {
    index: number;
    [key: string]: any;
}

export const validateSection = (section: string, formData: FormData): Record<string, any> => {
    const errors: Record<string, any> = {};

    switch (section) {
        case 'about': {
            const fields = ['firstName', 'lastName', 'email', 'phone', 'designation', 'summary'];
            fields.forEach(field => {
                const rule = VALIDATION_RULES[field];
                if (!rule) return;
                const error = rule.validate((formData as any)[field]);
                if (error) errors[field] = error;
            });
            break;
        }
        case 'experience': {
            const experiences = formData.experiences || [];
            if (experiences.length === 0) {
                errors.experiences = 'Add at least one experience entry';
            } else {
                const entryErrors: EntryError[] = [];
                experiences.forEach((exp, idx) => {
                    const entry: EntryError = { index: idx };
                    if (!exp.title?.trim()) entry.title = 'Job title is required';
                    if (!exp.company?.trim()) entry.company = 'Company is required';
                    if (Object.keys(entry).length > 1) {
                        entryErrors.push(entry);
                    }
                });
                if (entryErrors.length > 0) errors.experienceEntries = entryErrors;
            }
            break;
        }
        case 'education': {
            const educations = formData.educations || [];
            if (educations.length > 0) {
                const entryErrors: EntryError[] = [];
                educations.forEach((edu, idx) => {
                    const entry: EntryError = { index: idx };
                    if (!edu.school?.trim()) entry.school = 'School is required';
                    if (!edu.degree?.trim()) entry.degree = 'Degree is required';
                    if (Object.keys(entry).length > 1) {
                        entryErrors.push(entry);
                    }
                });
                if (entryErrors.length > 0) errors.educationEntries = entryErrors;
            }
            break;
        }
        case 'projects': {
            const projects = formData.projects || [];
            if (projects.length > 0) {
                projects.forEach((proj) => {
                    if (proj.link?.trim()) {
                        const urlRegex = /^https?:\/\/.+\..+/;
                        if (!urlRegex.test(proj.link.trim())) {
                            if (!errors.projects) errors.projects = {} as Record<string, string>;
                            errors.projects[proj.id] = 'Please enter a valid URL (https://...)';
                        }
                    }
                });
            }
            break;
        }
    }

    return errors;
};

export const validateAllSections = (formData: FormData): ValidationErrors => {
    const sections = ['about', 'experience', 'education'];
    const allErrors: ValidationErrors = {};
    sections.forEach(section => {
        const errors = validateSection(section, formData);
        if (Object.keys(errors).length > 0) {
            allErrors[section] = errors;
        }
    });
    return allErrors;
};

export const hasErrors = (errors: ValidationErrors | Record<string, any>): boolean => {
    return Object.keys(errors).length > 0;
};

export const getFieldError = (errors: ValidationErrors, section: string, field: string): string | null => {
    return errors?.[section]?.[field] || null;
};
