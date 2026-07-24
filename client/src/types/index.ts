export interface Experience {
    id: number;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface Education {
    id: number;
    school: string;
    degree: string;
    city: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface Project {
    id: number;
    title: string;
    link: string;
    description: string;
}

export interface Achievement {
    id: number;
    title: string;
    description: string;
}

export interface FormData {
    firstName: string;
    lastName: string;
    designation: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
    image: string | null;
    skillsRaw: string;
    experiences: Experience[];
    educations: Education[];
    projects: Project[];
    achievements: Achievement[];
}

export interface TemplateConfig {
    id: string;
    name: string;
    component: React.ComponentType<{ data: FormData }>;
    industry: string;
}

export interface OpenSections {
    [key: string]: boolean;
}

export interface ValidationErrors {
    [section: string]: {
        [field: string]: string;
    };
}

export interface TouchedSections {
    [section: string]: boolean;
}

export interface ATSData {
    score: number;
    tips: string[];
}

export interface LoadingState {
    [key: string]: boolean;
}

export interface ProviderConfig {
    provider: string;
    label: string;
    apiKey: string;
    model: string;
    baseUrl: string;
}

export interface AIProvider {
    name: string;
    storageKey?: string;
    modelKey: string;
    baseUrlKey?: string;
    defaultModel: string;
    defaultBaseUrl?: string;
}

export interface AIPromptParams {
    name?: string;
    role: string;
    experience: string;
    skills: string;
    industry: string;
}

export interface TailorParams {
    currentSummary: string;
    jobDescription: string;
}

export interface PowerUpParams {
    bulletText: string;
    role: string;
    industry: string;
}

export interface SkillsParams {
    role: string;
    rawSkills: string;
    industry: string;
}

export interface CoverLetterParams {
    name: string;
    role: string;
    experience: string;
    skills: string;
    jobDescription: string;
    industry: string;
}

export interface ATSParams {
    role: string;
    summary: string;
    skills: string;
    experience: string;
    jobDescription: string;
}

export type WritingStyle = 'professional' | 'casual' | 'academic';

export const WRITING_STYLES: Record<WritingStyle, { label: string; description: string; icon: string }> = {
    professional: { label: 'Professional', description: 'Formal corporate tone with industry-standard language', icon: '💼' },
    casual: { label: 'Casual', description: 'Approachable and conversational while remaining polished', icon: '😊' },
    academic: { label: 'Academic', description: 'Research-oriented with scholarly language and formal structure', icon: '🎓' }
};

export interface ResumeMeta {
    id: string;
    name: string;
    templateId: string;
    createdAt: string;
    updatedAt: string;
}

export interface StoredResume {
    meta: ResumeMeta;
    formData: FormData;
}

export interface StoredDraft {
    formData: FormData;
    savedAt: string;
}

export interface ExportedResume {
    version: string;
    exportedAt: string;
    resume: FormData;
}

export interface SavedJD {
    id: string;
    title: string;
    company: string;
    content: string;
    url: string;
    createdAt: string;
    updatedAt: string;
}

export interface TemplateCustomization {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: 'small' | 'medium' | 'large';
    spacing: 'compact' | 'normal' | 'spacious';
}

export const DEFAULT_CUSTOMIZATION: TemplateCustomization = {
    primaryColor: '',
    secondaryColor: '',
    fontFamily: '',
    fontSize: 'medium',
    spacing: 'normal'
};

export const FONT_OPTIONS = [
    { value: '', label: 'Template Default' },
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Georgia, "Times New Roman", serif', label: 'Georgia' },
    { value: '"Segoe UI", Tahoma, sans-serif', label: 'Segoe UI' },
    { value: '"Open Sans", sans-serif', label: 'Open Sans' },
    { value: '"Playfair Display", serif', label: 'Playfair Display' },
    { value: '"Roboto", sans-serif', label: 'Roboto' },
    { value: '"Merriweather", serif', label: 'Merriweather' },
    { value: '"Montserrat", sans-serif', label: 'Montserrat' },
    { value: '"Lora", serif', label: 'Lora' },
    { value: '"Fira Code", monospace', label: 'Fira Code (Monospace)' },
    { value: '"Nunito", sans-serif', label: 'Nunito' },
    { value: '"Poppins", sans-serif', label: 'Poppins' },
];

export const COLOR_PRESETS = [
    { name: 'Ocean Blue', primary: '#3b82f6', secondary: '#06b6d4' },
    { name: 'Emerald', primary: '#10b981', secondary: '#34d399' },
    { name: 'Royal Purple', primary: '#7c3aed', secondary: '#c026d3' },
    { name: 'Crimson', primary: '#dc2626', secondary: '#f43f5e' },
    { name: 'Amber', primary: '#f59e0b', secondary: '#d97706' },
    { name: 'Teal', primary: '#0d9488', secondary: '#14b8a6' },
    { name: 'Indigo', primary: '#6366f1', secondary: '#818cf8' },
    { name: 'Rose', primary: '#e11d48', secondary: '#fb7185' },
    { name: 'Gold', primary: '#b8860b', secondary: '#d4af37' },
    { name: 'Slate', primary: '#1e293b', secondary: '#475569' },
    { name: 'Forest', primary: '#166534', secondary: '#22c55e' },
    { name: 'Navy', primary: '#1e3a5f', secondary: '#4a7db5' },
];
