import { TemplateConfig } from '../types';
import TechTemplate from './TechTemplate';
import FinanceTemplate from './FinanceTemplate';
import HealthcareTemplate from './HealthcareTemplate';
import CreativeTemplate from './CreativeTemplate';
import GeneralTemplate from './GeneralTemplate';
import LegalTemplate from './LegalTemplate';
import EducationTemplate from './EducationTemplate';

const templates: Record<string, TemplateConfig> = {
    tech: {
        id: 'tech',
        name: 'Tech / IT',
        component: TechTemplate,
        industry: 'technology'
    },
    finance: {
        id: 'finance',
        name: 'Finance',
        component: FinanceTemplate,
        industry: 'finance'
    },
    healthcare: {
        id: 'healthcare',
        name: 'Healthcare',
        component: HealthcareTemplate,
        industry: 'healthcare'
    },
    creative: {
        id: 'creative',
        name: 'Creative / Design',
        component: CreativeTemplate,
        industry: 'creative design'
    },
    general: {
        id: 'general',
        name: 'General',
        component: GeneralTemplate,
        industry: 'general'
    },
    legal: {
        id: 'legal',
        name: 'Legal / Consulting',
        component: LegalTemplate,
        industry: 'legal'
    },
    education: {
        id: 'education',
        name: 'Education',
        component: EducationTemplate,
        industry: 'education'
    }
};

export const getTemplate = (id: string): TemplateConfig => templates[id] || templates.general;
export const getAllTemplates = (): TemplateConfig[] => Object.values(templates);
export default templates;
