import React, { useMemo } from 'react';
import { FormData, TemplateCustomization } from '../types';
import { getTemplate } from '../templates';

interface ResumePreviewProps {
    formData: FormData;
    templateId: string;
    customization?: TemplateCustomization;
}

function generateCustomCSS(templateId: string, custom: TemplateCustomization): string {
    const { primaryColor, secondaryColor, fontFamily, fontSize, spacing } = custom;
    const hasColors = primaryColor || secondaryColor;
    const hasFont = fontFamily;

    // Scale factors
    const fontScale = fontSize === 'small' ? 0.88 : fontSize === 'large' ? 1.12 : 1;
    const spacingScale = spacing === 'compact' ? 0.75 : spacing === 'spacious' ? 1.25 : 1;

    const rules: string[] = [];
    const sel = (s: string) => `[data-tc-customized] .template-${templateId} ${s}`;

    if (hasColors) {
        const P = primaryColor;
        const S = secondaryColor;

        // Build color overrides list, filtering out empty colors
        const colorRules: Array<{ sel: string; prop: string; color: string }> = [];
        const addRule = (sel: string, prop: string, colorVal: string | null | undefined) => {
            if (colorVal) colorRules.push({ sel, prop, color: colorVal });
        };

        // General
        addRule('.general-header', 'border-bottom-color', P);
        addRule('.general-avatar', 'border-color', P);
        addRule('.general-designation', 'color', P);

        // Tech
        addRule('.tech-avatar', 'border-color', P);
        addRule('.tech-designation', 'color', P);
        addRule('.tech-section-title', 'border-bottom-color', P);
        addRule('.tech-link', 'color', P);
        addRule('.tech-bullets li::before', 'color', P);
        addRule('.tech-skill-badge', 'border-color', P ? `${P}44` : null);
        addRule('.tech-skill-badge', 'background', P ? `${P}15` : null);
        addRule('.tech-skill-badge', 'color', P);

        // Finance
        addRule('.finance-avatar', 'border-color', P);
        addRule('.finance-contact-bar', 'border-top-color', P);
        addRule('.finance-section-title', 'border-bottom-color', P);

        // Healthcare
        addRule('.hc-section-title', 'color', P);
        addRule('.hc-section-title', 'border-bottom-color', P);
        addRule('.hc-bullets li::before', 'color', S || P);
        addRule('.hc-sidebar', 'background', P);
        addRule('.hc-designation', 'color', S || (P ? `${P}aa` : null));
        addRule('.hc-sidebar-title', 'color', S || (P ? `${P}aa` : null));

        // Creative
        addRule('.creative-section-title', 'color', P);
        addRule('.creative-section-title', 'border-left-color', S || P);
        addRule('.creative-link', 'color', P);
        addRule('.creative-skill-tag', 'color', P);
        addRule('.creative-skill-tag', 'border-color', P ? `${P}44` : null);
        addRule('.creative-skill-tag', 'background', P ? `${P}15` : null);
        addRule('.creative-entry-dot', 'background', `linear-gradient(135deg, ${P}, ${S || P})`);
        addRule('.creative-header-bg', 'background', `linear-gradient(135deg, ${P}, ${S || P})`);
        addRule('.creative-bullets li::before', 'color', S || P);
        addRule('.creative-project-card', 'background', P ? `${P}08` : null);
        addRule('.creative-project-card', 'border-color', P ? `${P}22` : null);

        // Legal
        addRule('.legal-avatar', 'border-color', P);
        addRule('.legal-designation', 'color', P);
        addRule('.legal-section-title', 'color', P);
        addRule('.legal-section-title', 'border-bottom-color', P);
        addRule('.legal-bullets li::before', 'color', P);
        addRule('.legal-skill-item::before', 'color', P);
        addRule('.legal-header-bar', 'background', `linear-gradient(90deg, ${P}, ${S || P}, ${P})`);

        // Education
        addRule('.edu-section-title', 'color', P || '#5c2a2a');
        addRule('.edu-section-title', 'border-bottom-color', S || P || '#c9a84c');
        addRule('.edu-designation', 'color', S || P || '#f0d78c');
        addRule('.edu-bullets li::before', 'color', S || P || '#c9a84c');
        addRule('.edu-skill-chip', 'color', P || '#5c2a2a');
        addRule('.edu-skill-chip', 'border-color', S || P ? `${S || P}66` : null);
        addRule('.edu-header', 'background', `linear-gradient(135deg, ${P || '#3d1a1a'}, ${S || P || '#5c2a2a'})`);

        for (const o of colorRules) {
            if (o.prop === 'background' && o.color.includes('gradient')) {
                rules.push(`${sel(o.sel)} { ${o.prop}: ${o.color}; }`);
            } else {
                rules.push(`${sel(o.sel)} { ${o.prop}: ${o.color}; }`);
            }
        }
    }

    // Font family
    if (hasFont) {
        rules.push(`${sel('')} { font-family: ${fontFamily} !important; }`);
    }

    // Font size scaling
    if (fontScale !== 1) {
        const sizeTargets = [
            '.general-name', '.tech-name', '.finance-name', '.hc-name', '.creative-name', '.legal-name', '.edu-name',
            '.general-designation', '.tech-designation', '.finance-designation', '.hc-designation', '.creative-designation', '.legal-designation', '.edu-designation',
            '.general-section-title', '.tech-section-title', '.finance-section-title', '.hc-section-title', '.creative-section-title', '.legal-section-title', '.edu-section-title',
            '.general-text', '.tech-text', '.finance-text', '.hc-text', '.creative-text', '.legal-text', '.edu-text',
            '.general-entry-header strong', '.tech-entry-header strong', '.finance-entry-header strong', '.hc-entry-header strong', '.creative-entry-header strong', '.legal-entry-header strong', '.edu-entry-header strong',
            '.general-bullets li', '.tech-bullets li', '.finance-bullets li', '.hc-bullets li', '.creative-bullets li', '.legal-bullets li', '.edu-bullets li',
            '.general-company', '.tech-company', '.finance-company', '.hc-company', '.creative-company', '.legal-company',
            '.general-date', '.tech-date', '.finance-date', '.hc-date', '.creative-date', '.legal-date', '.edu-date',
            '.general-contact span', '.tech-contact span', '.finance-contact span', '.hc-sidebar-text', '.creative-contact span', '.legal-contact span', '.edu-contact span',
            '.tech-skill-badge', '.hc-skills-list li', '.creative-skill-tag', '.legal-skill-item', '.edu-skill-chip',
            '.creative-project-card p', '.creative-project-card h4',
            '.hc-sidebar-title',
        ].join(',\n');
        rules.push(`${sel(sizeTargets)} { font-size: calc(1em * ${fontScale}); }`);
        // Scale heading sizes differently
        const headingTargets = [
            '.general-name', '.tech-name', '.finance-name', '.hc-name', '.creative-name', '.legal-name', '.edu-name',
        ].join(',\n');
        rules.push(`${sel(headingTargets)} { font-size: calc(1em * ${Math.min(fontScale * 1.1, 1.3)}); }`);
    }

    // Spacing scaling
    if (spacingScale !== 1) {
        const spacingTargets = [
            '.general-section', '.tech-section', '.finance-section', '.hc-section', '.creative-section', '.legal-section', '.edu-section',
            '.general-entry', '.tech-entry', '.finance-entry', '.hc-entry', '.creative-entry', '.legal-entry', '.edu-entry',
            '.general-body', '.tech-body', '.finance-body', '.hc-section', '.creative-body', '.legal-body', '.edu-body',
            '.general-header', '.tech-header', '.finance-header', '.hc-sidebar', '.creative-header', '.legal-header', '.edu-header',
        ].join(',\n');
        const spacingMargins = [
            '.general-section', '.tech-section', '.finance-section', '.hc-section', '.creative-section', '.legal-section', '.edu-section',
            '.general-entry', '.tech-entry', '.finance-entry', '.hc-entry', '.creative-entry', '.legal-entry', '.edu-entry',
        ].join(',\n');
        rules.push(`${sel(spacingMargins)} { margin-bottom: calc(1em * ${spacingScale}); }`);

        // Scale specific spacing elements
        const paddingTargets = [
            '.general-body', '.tech-body', '.finance-body', '.creative-body', '.legal-body', '.edu-body',
        ].join(',\n');
        rules.push(`${sel(paddingTargets)} { padding: calc(1.5rem * ${spacingScale}) calc(2rem * ${spacingScale}); }`);
        rules.push(`${sel('.hc-main')} { padding: calc(2rem * ${spacingScale}); }`);
        rules.push(`${sel('.hc-sidebar')} { padding: calc(2rem * ${spacingScale}) calc(1.5rem * ${spacingScale}); }`);
    }

    return rules.join('\n');
}

const ResumePreview = ({ formData, templateId, customization }: ResumePreviewProps) => {
    const template = getTemplate(templateId);
    const TemplateComponent = template.component;

    const customCSS = useMemo(() => {
        if (!customization) return '';
        const hasCustom = customization.primaryColor || customization.fontFamily ||
            customization.fontSize !== 'medium' || customization.spacing !== 'normal';
        if (!hasCustom) return '';
        return generateCustomCSS(templateId, customization);
    }, [customization, templateId]);

    const hasActiveCustom = !!(customization && (customization.primaryColor || customization.fontFamily ||
        customization.fontSize !== 'medium' || customization.spacing !== 'normal'));

    return (
        <div
            id="resume-preview"
            data-tc-customized={hasActiveCustom ? '' : undefined}
            style={hasActiveCustom ? {
                '--tc-font-scale': customization?.fontSize === 'small' ? '0.88' :
                    customization?.fontSize === 'large' ? '1.12' : '1',
                '--tc-spacing-scale': customization?.spacing === 'compact' ? '0.75' :
                    customization?.spacing === 'spacious' ? '1.25' : '1',
            } as React.CSSProperties : undefined}
        >
            {customCSS && <style>{customCSS}</style>}
            <TemplateComponent data={formData} />
        </div>
    );
};

export default ResumePreview;
