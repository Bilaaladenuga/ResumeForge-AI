import React from 'react';
import { FormData } from '../types';
import { getTemplate } from '../templates';

interface ResumePreviewProps {
    formData: FormData;
    templateId: string;
}

const ResumePreview = ({ formData, templateId }: ResumePreviewProps) => {
    const template = getTemplate(templateId);
    const TemplateComponent = template.component;

    return (
        <div id="resume-preview">
            <TemplateComponent data={formData} />
        </div>
    );
};

export default ResumePreview;
