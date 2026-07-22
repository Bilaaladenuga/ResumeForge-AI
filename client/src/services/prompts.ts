import { WritingStyle } from '../types';

/* ============================================
   Writing Style Library
   Defines tone, voice, and instruction modifiers
   for Professional, Casual, and Academic styles
   ============================================ */

interface StyleModifiers {
    tone: string;
    voice: string;
    vocabulary: string;
    sentenceStructure: string;
    format: string;
}

const STYLE_MODIFIERS: Record<WritingStyle, StyleModifiers> = {
    professional: {
        tone: 'Professional, confident, and polished. Use authoritative but approachable language.',
        voice: 'Third person preferred. Use first person sparingly for personal statements.',
        vocabulary: 'Industry-standard terminology. Strong action verbs (led, optimized, delivered, implemented). Avoid slang or overly casual expressions.',
        sentenceStructure: 'Clear and direct. Vary sentence length for rhythm. Use concise, impactful statements.',
        format: 'Use standard business formatting. Bullet points should be parallel in structure.'
    },
    casual: {
        tone: 'Warm, approachable, and engaging. Maintain professionalism while being conversational.',
        voice: 'First person is welcome. Use "I" statements that feel authentic and relatable.',
        vocabulary: 'Natural, everyday professional language. Avoid jargon-heavy or overly stiff corporate speak. Use contractions where appropriate.',
        sentenceStructure: 'Varied and flowing. Mix shorter punchy sentences with more reflective ones. Feel natural when read aloud.',
        format: 'Relaxed formatting. Bullet points can be more narrative and story-driven.'
    },
    academic: {
        tone: 'Formal, scholarly, and precise. Authoritative with careful attention to nuance.',
        voice: 'Third person throughout. Maintain scholarly distance and objectivity.',
        vocabulary: 'Discipline-specific terminology. Precise technical language. Use formal transition words (furthermore, consequently, moreover).',
        sentenceStructure: 'Complex sentences with careful subordination. Prioritize clarity and precision over brevity. Each claim should be supportable.',
        format: 'Traditional academic formatting. Bullet points use complete sentences with periods.'
    }
};

interface FallbackTone {
    openingLine: (name: string, role: string) => string;
    experienceLead: string;
    closingLine: string;
    signOff: string;
    bulletStyle: string;
}

const FALLBACK_TONES: Record<WritingStyle, FallbackTone> = {
    professional: {
        openingLine: (name, role) =>
            `${name} is a results-driven ${role} with a proven track record of delivering measurable impact.`,
        experienceLead: 'Demonstrated expertise in',
        closingLine: 'Prepared to drive strategic value and operational excellence.',
        signOff: 'Best regards',
        bulletStyle: 'achievement-focused, metric-oriented'
    },
    casual: {
        openingLine: (name, role) =>
            `${name} is a passionate ${role} who loves building great things and making a real impact.`,
        experienceLead: 'Hands-on experience with',
        closingLine: 'Excited to bring creativity and energy to a growing team.',
        signOff: 'Cheers',
        bulletStyle: 'story-driven, impact-focused'
    },
    academic: {
        openingLine: (name, role) =>
            `${name} is a scholarly ${role} whose research and practice demonstrate significant contributions to the field.`,
        experienceLead: 'Extensive research and applied experience in',
        closingLine: 'Committed to advancing knowledge and excellence through rigorous scholarship.',
        signOff: 'Sincerely',
        bulletStyle: 'formal, evidence-based'
    }
};

/**
 * Get AI prompt instructions for a given writing style
 */
export function getStyleInstructions(style: WritingStyle): string {
    const mod = STYLE_MODIFIERS[style];
    return [
        `## WRITING STYLE: ${style.toUpperCase()}`,
        `Tone: ${mod.tone}`,
        `Voice: ${mod.voice}`,
        `Vocabulary: ${mod.vocabulary}`,
        `Sentence Structure: ${mod.sentenceStructure}`,
        `Format: ${mod.format}`,
        '',
        'Adhere strictly to the above style throughout your response.'
    ].join('\n');
}

/**
 * Get fallback tone adjustments for template-based generators
 */
export function getFallbackTone(style: WritingStyle): FallbackTone {
    return FALLBACK_TONES[style];
}

/**
 * Get label for the style
 */
export function getStyleLabel(style: WritingStyle): string {
    const labels: Record<WritingStyle, string> = {
        professional: '💼 Professional',
        casual: '😊 Casual',
        academic: '🎓 Academic'
    };
    return labels[style];
}

/**
 * Save/load writing style preference from localStorage
 */
const STYLE_STORAGE_KEY = 'resucraft_writing_style';

export function getSavedStyle(): WritingStyle {
    if (typeof localStorage === 'undefined') return 'professional';
    const saved = localStorage.getItem(STYLE_STORAGE_KEY) as WritingStyle | null;
    return saved || 'professional';
}

export function saveStyle(style: WritingStyle): void {
    localStorage.setItem(STYLE_STORAGE_KEY, style);
}
