'use client';
import React, { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, TabStopPosition, TabStopType } from 'docx';
import { saveAs } from 'file-saver';
import { FormData } from '../types';
import { FileText, Check } from 'lucide-react';

const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'Present';
    try {
        const date = new Date(dateStr + '-01');
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
        return dateStr || 'Present';
    }
};

function createDocxDocument(data: FormData): Document {
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Your Name';
    const skills = (data.skillsRaw || '').split(',').map(s => s.trim()).filter(Boolean);
    const primaryColor = '1e3a5f';
    const secondaryColor = '3b82f6';

    const children: Paragraph[] = [];

    // ─── Header: Name ───
    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: fullName.toUpperCase(),
                    bold: true,
                    size: 32,
                    color: primaryColor,
                    font: 'Calibri',
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
        })
    );

    // ─── Designation ───
    if (data.designation) {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: data.designation,
                        size: 22,
                        color: secondaryColor,
                        font: 'Calibri',
                        italics: true,
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
            })
        );
    }

    // ─── Contact Info ───
    const contactParts = [data.email, data.phone, data.address].filter(Boolean);
    if (contactParts.length > 0) {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: contactParts.join('  |  '),
                        size: 18,
                        color: '4b5563',
                        font: 'Calibri',
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            })
        );
    }

    // ─── Horizontal Rule ───
    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: '─'.repeat(75),
                    size: 14,
                    color: 'cbd5e1',
                    font: 'Calibri',
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        })
    );

    // ─── Helper to add section heading ───
    const addSection = (title: string) => {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: title.toUpperCase(),
                        bold: true,
                        size: 20,
                        color: primaryColor,
                        font: 'Calibri',
                    }),
                ],
                spacing: { before: 240, after: 80 },
                border: {
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: 'e2e8f0' },
                },
            })
        );
    };

    // ─── Helper to add text paragraph ───
    const addText = (text: string, opts?: { spacing?: number; size?: number; color?: string; italics?: boolean }) => {
        if (!text) return;
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text,
                        size: opts?.size || 20,
                        color: opts?.color || '374151',
                        font: 'Calibri',
                        italics: opts?.italics,
                    }),
                ],
                spacing: { after: opts?.spacing || 80 },
                alignment: AlignmentType.JUSTIFIED,
            })
        );
    };

    // ─── Helper to add a bullet point ───
    const addBullet = (text: string) => {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: '•  ',
                        size: 20,
                        color: '4b5563',
                        font: 'Calibri',
                    }),
                    new TextRun({
                        text,
                        size: 20,
                        color: '374151',
                        font: 'Calibri',
                    }),
                ],
                spacing: { after: 40 },
                indent: { left: 360 },
            })
        );
    };

    // ─── Helper for entry header (title + date side-by-side) ───
    const addEntryHeader = (title: string, subtitle: string, date: string) => {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: title,
                        bold: true,
                        size: 21,
                        color: '111827',
                        font: 'Calibri',
                    }),
                    new TextRun({
                        text: `\t${date}`,
                        size: 18,
                        color: '6b7280',
                        font: 'Calibri',
                    }),
                ],
                spacing: { after: 20, before: 160 },
                tabStops: [
                    { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
                ],
            })
        );
        if (subtitle) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: subtitle,
                            size: 19,
                            color: '6b7280',
                            font: 'Calibri',
                            italics: true,
                        }),
                    ],
                    spacing: { after: 40 },
                })
            );
        }
    };

    // ─── PROFESSIONAL SUMMARY ───
    if (data.summary?.trim()) {
        addSection('Professional Summary');
        addText(data.summary.trim());
    }

    // ─── WORK EXPERIENCE ───
    if (data.experiences?.length > 0) {
        addSection('Work Experience');
        data.experiences.forEach((exp) => {
            const dateRange = `${formatDate(exp.startDate)} – ${formatDate(exp.endDate)}`;
            const location = exp.location ? ` — ${exp.location}` : '';
            addEntryHeader(exp.title, `${exp.company}${location}`, dateRange);
            if (exp.description) {
                exp.description.split('\n').filter(Boolean).forEach((line) => addBullet(line));
            }
        });
    }

    // ─── EDUCATION ───
    if (data.educations?.length > 0) {
        addSection('Education');
        data.educations.forEach((edu) => {
            const dateRange = `${formatDate(edu.startDate)} – ${formatDate(edu.endDate)}`;
            const location = edu.city ? ` — ${edu.city}` : '';
            addEntryHeader(edu.degree, `${edu.school}${location}`, dateRange);
            if (edu.description) addText(edu.description, { spacing: 60 });
        });
    }

    // ─── SKILLS ───
    if (skills.length > 0) {
        addSection('Skills');
        addText(skills.join('  •  '), { color: '374151' });
    }

    // ─── PROJECTS ───
    if (data.projects?.length > 0) {
        addSection('Projects');
        data.projects.forEach((proj) => {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: proj.title,
                            bold: true,
                            size: 21,
                            color: '111827',
                            font: 'Calibri',
                        }),
                        ...(proj.link
                            ? [
                                  new TextRun({
                                      text: `  (${proj.link})`,
                                      size: 18,
                                      color: '3b82f6',
                                      font: 'Calibri',
                                  }),
                              ]
                            : []),
                    ],
                    spacing: { before: 120, after: 40 },
                })
            );
            if (proj.description) addText(proj.description, { spacing: 60 });
        });
    }

    // ─── ACHIEVEMENTS ───
    if (data.achievements?.length > 0) {
        addSection('Achievements');
        data.achievements.forEach((ach) => {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: ach.title,
                            bold: true,
                            size: 20,
                            color: '111827',
                            font: 'Calibri',
                        }),
                        ...(ach.description
                            ? [
                                  new TextRun({
                                      text: ` — ${ach.description}`,
                                      size: 20,
                                      color: '374151',
                                      font: 'Calibri',
                                  }),
                              ]
                            : []),
                    ],
                    spacing: { before: 80, after: 40 },
                })
            );
        });
    }

    return new Document({
        title: `${fullName} - Resume`,
        description: `Professional resume for ${fullName}`,
        styles: {
            default: {
                document: {
                    run: {
                        font: 'Calibri',
                        size: 20,
                        color: '374151',
                    },
                    paragraph: {
                        spacing: { after: 60, line: 276 },
                    },
                },
            },
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 1440,  // 1 inch
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                        },
                    },
                },
                children,
            },
        ],
    });
}

interface DOCXExportButtonProps {
    formData: FormData;
    templateName: string;
}

const DOCXExportButton: React.FC<DOCXExportButtonProps> = ({ formData, templateName }) => {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const doc = createDocxDocument(formData);
            const blob = await Packer.toBlob(doc);
            const fileName = [formData.firstName, formData.lastName, 'Resume', templateName]
                .filter(Boolean)
                .join('_')
                .replace(/[\s/]+/g, '_') + '.docx';
            saveAs(blob, fileName);
            setDone(true);
            setTimeout(() => setDone(false), 2500);
        } catch (err) {
            console.error('DOCX export failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`btn btn-sm ${done ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleExport}
            disabled={loading}
            title="Export as Microsoft Word document"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
            }}
        >
            {loading ? (
                <>
                    <div className="spinner" style={{ width: 12, height: 12 }} />
                    Generating...
                </>
            ) : done ? (
                <>
                    <Check size={14} /> Exported!
                </>
            ) : (
                <>
                    <FileText size={14} /> DOCX
                </>
            )}
        </button>
    );
};

export default DOCXExportButton;
