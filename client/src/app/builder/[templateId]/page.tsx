import ResumeBuilder from '../../../components/ResumeBuilder';
import { Metadata } from 'next';

interface BuilderPageParams {
    params: Promise<{ templateId: string }>;
}

export async function generateMetadata({ params }: BuilderPageParams): Promise<Metadata> {
    const resolvedParams = await params;
    const templateNames: Record<string, string> = {
        tech: 'Tech / IT',
        finance: 'Finance',
        healthcare: 'Healthcare',
        creative: 'Creative / Design',
        general: 'General',
        legal: 'Legal / Consulting',
        education: 'Education'
    };
    const name = templateNames[resolvedParams.templateId] || 'Resume';

    return {
        title: `${name} Resume Builder | ResumeForge AI`,
        description: `Build a professional ${name} resume with AI-powered assistance.`,
    };
}

export default function BuilderPage() {
    return <ResumeBuilder />;
}
