import React from 'react';
import { getTemplate } from '../templates';

const ResumePreview = ({ formData, templateId }) => {
    const template = getTemplate(templateId);
    const TemplateComponent = template.component;

    return (
        <div id="resume-preview">
            <TemplateComponent data={formData} />
        </div>
    );
};

export default ResumePreview;
