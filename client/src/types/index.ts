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

export interface StoredDraft {
    formData: FormData;
    savedAt: string;
}

export interface ExportedResume {
    version: string;
    exportedAt: string;
    resume: FormData;
}
