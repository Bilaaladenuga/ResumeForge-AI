import TechTemplate from './TechTemplate';
import FinanceTemplate from './FinanceTemplate';
import HealthcareTemplate from './HealthcareTemplate';
import CreativeTemplate from './CreativeTemplate';
import GeneralTemplate from './GeneralTemplate';

const templates = {
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
    }
};

export const getTemplate = (id) => templates[id] || templates.general;
export const getAllTemplates = () => Object.values(templates);
export default templates;
