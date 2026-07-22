import React from 'react';
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import { FormData } from '../types';

// Register a clean sans font
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
    ]
});

const colors = {
    primary: '#111827',
    secondary: '#3b82f6',
    muted: '#6b7280',
    border: '#e5e7eb',
    background: '#ffffff',
    text: '#374151'
};

const styles = StyleSheet.create({
    page: {
        padding: '40px 48px',
        fontFamily: 'Inter',
        fontSize: 10,
        color: colors.text,
        backgroundColor: colors.background
    },
    header: {
        borderBottom: `3px solid ${colors.secondary}`,
        paddingBottom: 12,
        marginBottom: 20
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14
    },
    headerText: {
        flex: 1
    },
    name: {
        fontSize: 26,
        fontWeight: 700,
        color: colors.primary,
        marginBottom: 2
    },
    designation: {
        fontSize: 12,
        fontWeight: 600,
        color: colors.secondary,
        marginBottom: 6
    },
    contactRow: {
        flexDirection: 'row',
        gap: 16,
        fontSize: 9,
        color: colors.muted,
        flexWrap: 'wrap'
    },
    section: {
        marginBottom: 14
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 700,
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: 3,
        marginBottom: 8
    },
    summaryText: {
        fontSize: 9.5,
        lineHeight: 1.6,
        color: colors.text
    },
    entry: {
        marginBottom: 10
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 2
    },
    entryTitle: {
        fontSize: 10,
        fontWeight: 600,
        color: colors.primary
    },
    entryDate: {
        fontSize: 8.5,
        color: colors.muted,
        whiteSpace: 'nowrap'
    },
    entryCompany: {
        fontSize: 9,
        color: colors.muted,
        marginBottom: 3
    },
    bulletList: {
        marginTop: 2
    },
    bullet: {
        fontSize: 9,
        lineHeight: 1.5,
        color: colors.text,
        paddingLeft: 10,
        marginBottom: 1.5
    },
    skillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 2
    },
    skillBadge: {
        fontSize: 8.5,
        color: colors.secondary,
        backgroundColor: '#f0f9ff',
        padding: '2px 6px',
        borderRadius: 3
    },
    inlineItem: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 2,
        gap: 4
    },
    inlineLabel: {
        fontSize: 9,
        fontWeight: 600,
        color: colors.primary,
        minWidth: 50
    },
    inlineValue: {
        fontSize: 9,
        color: colors.text,
        flex: 1
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 8
    }
});

const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'Present';
    try {
        const date = new Date(dateStr + '-01');
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
        return dateStr || 'Present';
    }
};

const PDFDocument: React.FC<{ data: FormData }> = ({ data }) => {
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Your Name';
    const skills = (data.skillsRaw || '').split(',').map(s => s.trim()).filter(Boolean);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={styles.name}>{fullName}</Text>
                        <Text style={styles.designation}>{data.designation || 'Professional Title'}</Text>
                    </View>
                    <View style={styles.contactRow}>
                        {data.email && <Text>{data.email}</Text>}
                        {data.phone && <Text>{data.phone}</Text>}
                        {data.address && <Text>{data.address}</Text>}
                    </View>
                </View>

                {/* Summary */}
                {data.summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text style={styles.summaryText}>{data.summary}</Text>
                    </View>
                )}

                {/* Experience */}
                {data.experiences && data.experiences.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Work Experience</Text>
                        {data.experiences.map((exp) => (
                            <View key={exp.id} style={styles.entry}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{exp.title}</Text>
                                    <Text style={styles.entryDate}>
                                        {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
                                    </Text>
                                </View>
                                {(exp.company || exp.location) && (
                                    <Text style={styles.entryCompany}>
                                        {[exp.company, exp.location].filter(Boolean).join(' — ')}
                                    </Text>
                                )}
                                {exp.description && (
                                    <View style={styles.bulletList}>
                                        {exp.description.split('\n').filter(Boolean).map((line, i) => (
                                            <Text key={i} style={styles.bullet}>• {line}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Education */}
                {data.educations && data.educations.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {data.educations.map((edu) => (
                            <View key={edu.id} style={styles.entry}>
                                <View style={styles.entryHeader}>
                                    <Text style={styles.entryTitle}>{edu.degree}</Text>
                                    <Text style={styles.entryDate}>
                                        {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                                    </Text>
                                </View>
                                <Text style={styles.entryCompany}>
                                    {[edu.school, edu.city].filter(Boolean).join(' — ')}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <Text style={styles.summaryText}>{skills.join(' · ')}</Text>
                    </View>
                )}

                {/* Projects */}
                {data.projects && data.projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {data.projects.map((proj) => (
                            <View key={proj.id} style={styles.entry}>
                                <View style={styles.inlineItem}>
                                    <Text style={styles.entryTitle}>{proj.title}</Text>
                                </View>
                                {proj.description && (
                                    <Text style={styles.summaryText}>{proj.description}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Achievements */}
                {data.achievements && data.achievements.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Achievements</Text>
                        {data.achievements.map((ach) => (
                            <View key={ach.id} style={styles.entry}>
                                <View style={styles.inlineItem}>
                                    <Text style={styles.entryTitle}>{ach.title}</Text>
                                </View>
                                {ach.description && (
                                    <Text style={styles.summaryText}>{ach.description}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Footer */}
                <Text style={{ fontSize: 7, color: colors.muted, textAlign: 'center', marginTop: 20 }}>
                    Generated with ResuCraft
                </Text>
            </Page>
        </Document>
    );
};

interface PDFExportButtonProps {
    formData: FormData;
    templateName: string;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({ formData, templateName }) => {
    const fileName = [formData.firstName, formData.lastName, 'Resume', templateName]
        .filter(Boolean)
        .join('_')
        .replace(/[\s/]+/g, '_') + '.pdf';

    return (
        <PDFDownloadLink
            document={<PDFDocument data={formData} />}
            fileName={fileName}
            style={{ textDecoration: 'none' }}
        >
            {({ loading }) => (
                <div
                    className={loading ? 'btn btn-primary btn-sm' : 'btn btn-accent btn-sm'}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0.4rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    } as React.CSSProperties}
                >
                    {loading ? 'Generating PDF...' : 'Export PDF'}
                </div>
            )}
        </PDFDownloadLink>
    );
};

export default PDFExportButton;
