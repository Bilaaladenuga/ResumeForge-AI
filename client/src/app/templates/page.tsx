import TemplateSelector from '../../components/TemplateSelector';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Resume Templates | ResumeForge AI',
    description: 'Choose from 5 professionally designed resume templates tailored for Tech, Finance, Healthcare, Creative, and General industries.',
};

export default function TemplatesPage() {
    return <TemplateSelector />;
}
