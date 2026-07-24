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
