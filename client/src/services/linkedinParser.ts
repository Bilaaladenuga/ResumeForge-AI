import { FormData } from '../types';
import { getProviderConfig, generateWithProvider } from './ai';

/* ============================================
   LinkedIn Profile Parser
   Extracts structured resume data from pasted
   LinkedIn profile text using regex + AI
   ============================================ */

interface ParsedLinkedInData {
    firstName: string;
    lastName: string;
    headline: string;
    location: string;
    about: string;
    experiences: Array<{
        title: string;
        company: string;
        location: string;
        startDate: string;
        endDate: string;
        description: string;
    }>;
    educations: Array<{
        school: string;
        degree: string;
        startDate: string;
        endDate: string;
    }>;
    skills: string[];
}

/**
 * Split text into sections based on common LinkedIn section headers
 */
function splitIntoSections(raw: string): Map<string, string> {
    const sections = new Map<string, string>();

    // Match section headers — they appear as standalone lines with common titles
    const sectionHeaders = [
        'About',
        'Experience',
        'Education',
        'Skills',
        'Licenses & Certifications',
        'Certifications',
        'Projects',
        'Publications',
        'Honors & Awards',
        'Awards',
        'Languages',
        'Volunteering',
        'Recommendations',
        'Courses'
    ];

    // Build regex pattern to split on section headers
    const pattern = new RegExp(
        `(?:^|\\n)\\s*(${sectionHeaders.join('|')})\\s*(?=\\n|$)`,
        'gi'
    );

    let lastIndex = 0;
    let lastHeader = 'header'; // pre-section content (name, headline, etc.)

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(raw)) !== null) {
        const start = match.index;
        if (lastIndex > 0 || start > 0) {
            const content = raw.slice(lastIndex, start).trim();
            if (content) {
                sections.set(lastHeader, content);
            }
        }
        lastHeader = match[1].toLowerCase();
        lastIndex = match.index + match[0].length;
    }

    // Capture remaining content after last section header
    if (lastIndex < raw.length) {
        const content = raw.slice(lastIndex).trim();
        if (content) {
            sections.set(lastHeader, content);
        }
    } else if (sections.size === 0) {
        // No section headers found — put everything in header
        sections.set('header', raw.trim());
    }

    return sections;
}

/**
 * Extract name from the header portion (usually first meaningful line)
 */
function extractName(headerText: string): { firstName: string; lastName: string } {
    const lines = headerText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 2 && !l.startsWith('http') && !l.includes('@'));

    // First substantial line is usually the name
    for (const line of lines) {
        // Name is typically 2-4 words, no special chars
        const cleaned = line.replace(/[^\w\s.'-]/g, '').trim();
        const parts = cleaned.split(/\s+/);
        if (parts.length >= 2 && parts.length <= 4) {
            // Check it looks like a real name (not a headline with "at")
            if (!/ at | • | \| /.test(line)) {
                return {
                    firstName: parts[0],
                    lastName: parts.slice(1).join(' ')
                };
            }
        }
    }

    return { firstName: '', lastName: '' };
}

/**
 * Extract headline (role + company) from header
 */
function extractHeadline(headerText: string): string {
    const lines = headerText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 5);

    // Skip first line (name), find the next substantial line
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Headline often contains "at" or "·" or "||"
        if (/ at |·|\|/.test(line) || line.length < 80) {
            return line.replace(/^[•·\-\s]+/, '').trim();
        }
    }

    return '';
}

/**
 * Extract location from header
 */
function extractLocation(headerText: string): string {
    const lines = headerText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

    // Look for common location patterns after the headline
    let foundHeadline = false;
    for (const line of lines) {
        if (/ at |·/.test(line)) {
            foundHeadline = true;
            continue;
        }
        if (foundHeadline && /^[A-Z]/.test(line) && line.length < 60) {
            // Check it's not a button or connection count
            if (!/connections|contact|message|follow/i.test(line)) {
                return line;
            }
        }
    }

    return '';
}

/**
 * Extract month names for date parsing
 */
const MONTHS = [
    'jan(?:uary)?', 'feb(?:ruary)?', 'mar(?:ch)?', 'apr(?:il)?',
    'may', 'jun(?:e)?', 'jul(?:y)?', 'aug(?:ust)?',
    'sep(?:tember)?', 'oct(?:ober)?', 'nov(?:ember)?', 'dec(?:ember)?'
];
const MONTH_PATTERN = `(${MONTHS.join('|')})`;

/**
 * Parse LinkedIn dates (e.g., "Jan 2020 - Present", "Jun 2016 - Dec 2019")
 */
function parseLinkedInDate(dateStr: string): string {
    if (!dateStr) return '';

    const cleaned = dateStr.trim();
    if (/present|current|now/i.test(cleaned)) return '';

    // Already in YYYY-MM format
    if (/^\d{4}-\d{2}$/.test(cleaned)) return cleaned;

    // Try "Mon YYYY" format
    const monthRegex = new RegExp(MONTH_PATTERN + '\\s+(\\d{4})', 'i');
    const match = cleaned.match(monthRegex);
    if (match) {
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthStr = match[1].toLowerCase().substring(0, 3);
        const monthIndex = monthNames.indexOf(monthStr);
        if (monthIndex >= 0) {
            return `${match[2]}-${String(monthIndex + 1).padStart(2, '0')}`;
        }
    }

    // Try YYYY only
    const yearMatch = cleaned.match(/(\d{4})/);
    if (yearMatch) return `${yearMatch[1]}-01`;

    return cleaned;
}

/**
 * Extract experience entries from the Experience section
 */
function extractExperiences(sectionText: string): ParsedLinkedInData['experiences'] {
    const experiences: ParsedLinkedInData['experiences'] = [];
    if (!sectionText) return experiences;

    const lines = sectionText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentExp: {
        title: string;
        company: string;
        location: string;
        startDate: string;
        endDate: string;
        description: string;
        descLines: string[];
    } | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Date range pattern: "Jan 2020 - Present · 4 yrs" or "Jan 2020 - Dec 2022"
        const dateRegex = new RegExp(
            `${MONTH_PATTERN}\\s+\\d{4}\\s*[–-]\\s*(?:${MONTH_PATTERN}\\s+\\d{4}|Present|Current|Now)`,
            'i'
        );

        if (dateRegex.test(line) && currentExp) {
            // Extract dates
            const dateParts = line.match(/(\w+\s+\d{4})\s*[–-]\s*(\w+\s+\d{4}|Present|Current|Now)/i);
            if (dateParts) {
                currentExp.startDate = parseLinkedInDate(dateParts[1]);
                currentExp.endDate = parseLinkedInDate(dateParts[2]);
            }
            continue;
        }

        // Check if line looks like a company name (usually after title, before dates)
        if (currentExp && !currentExp.company && /^[A-Z][\w\s&.]+$/.test(line) && line.length < 60) {
            // Only if it's not clearly a bullet point or date
            if (!line.startsWith('•') && !line.startsWith('-') && !dateRegex.test(line)) {
                currentExp.company = line;
                continue;
            }
        }

        // Location line after dates
        if (currentExp) {
            const locationMatch = line.match(/^([A-Z][\w\s,.-]+)$/);
            if (locationMatch && !currentExp.company && line.length < 60) {
                // Check against known location patterns
                if (/^[A-Z][a-z]+/.test(line) && !line.includes('•') && !line.includes('·')) {
                    currentExp.location = line;
                    continue;
}
            }
        }

        // Bullet points for descriptions
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('→')) {
            if (currentExp) {
                currentExp.descLines.push(line.replace(/^[•\-\s→]+/, '').trim());
            }
            continue;
        }

        // Title lines typically don't start with company-like words when company is not known
        // This is a heuristic: if we see a line that's relatively short and caps-heavy,
        // and we don't have a current experience, start a new one
        if (!currentExp || (currentExp.title && currentExp.company && i < lines.length - 1)) {
            // Check if this looks like a new entry title
            if (line.length < 100 && !line.includes('•') && !line.startsWith('http')) {
                // Save previous entry
                if (currentExp && (currentExp.title || currentExp.company)) {
                    currentExp.description = currentExp.descLines.join('\n');
                    experiences.push(currentExp);
                }
                currentExp = {
                    title: line,
                    company: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                    descLines: []
                };
                continue;
            }
        }

        // Fallback: if we have an active entry, add to description
        if (currentExp && line.length > 3) {
            currentExp.descLines.push(line);
        }
    }

    // Push the last entry
    if (currentExp && (currentExp.title || currentExp.company)) {
        currentExp.description = currentExp.descLines.join('\n');
        experiences.push(currentExp);
    }

    return experiences;
}

/**
 * Extract education entries
 */
function extractEducation(sectionText: string): ParsedLinkedInData['educations'] {
    const educations: ParsedLinkedInData['educations'] = [];
    if (!sectionText) return educations;

    const lines = sectionText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentEdu: {
        school: string;
        degree: string;
        startDate: string;
        endDate: string;
    } | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Date pattern for education: "2015 - 2019" or "Sep 2015 - Jun 2019"
        const yearRangeRegex = /(\d{4})\s*[–-]\s*(\d{4})/;
        const dateMatch = line.match(yearRangeRegex);

        if (dateMatch) {
            if (currentEdu) {
                currentEdu.startDate = `${dateMatch[1]}-01`;
                currentEdu.endDate = `${dateMatch[2]}-01`;
            }
            continue;
        }

        // If line looks like a school name (proper case, not a bullet)
        if (line.length < 80 && !line.startsWith('•') && !line.startsWith('-')) {
            if (/^(?:University|College|School|Institute|Academy|The\s)/i.test(line) ||
                /(?:University|College|School|Institute|Academy)$/i.test(line)) {
                if (currentEdu) {
                    educations.push(currentEdu);
                }
                currentEdu = { school: line, degree: '', startDate: '', endDate: '' };
                continue;
            }
        }

        // Degree information
        if (currentEdu && /^(?:Bachelor|Master|PhD|Doctor|Associate|B\.|M\.|A\.|BSc|BA|MA|MSc|MBA|JD|MD)/i.test(line)) {
            currentEdu.degree = line;
            continue;
        }

        // If we have a school and see another school-like line, save and start new
        if (currentEdu && line.length < 50 && /^[A-Z]/.test(line)) {
            if (currentEdu) {
                educations.push(currentEdu);
            }
            currentEdu = { school: line, degree: '', startDate: '', endDate: '' };
        }
    }

    if (currentEdu) {
        educations.push(currentEdu);
    }

    return educations;
}

/**
 * Extract skills from Skills section
 */
function extractSkills(sectionText: string): string[] {
    if (!sectionText) return [];

    // Try comma-separated first
    const lines = sectionText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Check if first line contains commas (comma-separated list)
    if (lines.length > 0 && lines[0].includes(',')) {
        return lines[0]
            .split(',')
            .map(s => s.trim().replace(/^[•\-\s]+/, ''))
            .filter(s => s.length > 0 && s.length < 50);
    }

    // Otherwise each line is a skill
    const skills: string[] = [];
    for (const line of lines) {
        const skill = line.replace(/^[•\-\s·]+/, '').trim();
        if (skill && skill.length < 50 && !/^\d+$/.test(skill)) {
            // Filter out non-skill lines
            if (!/^(?:see all|show more|endorse|top skill)/i.test(skill)) {
                skills.push(skill);
            }
        }
    }

    return skills;
}

/**
 * Extract summary/About text
 */
function extractAbout(sectionText: string): string {
    if (!sectionText) return '';

    // Remove common LinkedIn UI text
    return sectionText
        .replace(/^see more\s*/gmi, '')
        .replace(/^show more\s*/gmi, '')
        .replace(/^see less\s*/gmi, '')
        .replace(/^\s*•\s*$/gm, '')
        .trim();
}

/**
 * Main parser: takes raw LinkedIn profile text and returns structured data
 */
export function parseLinkedInProfile(rawText: string): ParsedLinkedInData {
    if (!rawText || rawText.trim().length < 10) {
        throw new Error('Please paste your LinkedIn profile text (at least 10 characters).');
    }

    const sections = splitIntoSections(rawText);

    const headerText = sections.get('header') || rawText;
    const aboutText = sections.get('about') || '';
    const experienceText = sections.get('experience') || '';
    const educationText = sections.get('education') || '';
    const skillsText = sections.get('skills') || '';

    const { firstName, lastName } = extractName(headerText);
    const headline = extractHeadline(headerText);

    // Derive designation from headline
    const designation = headline.split(' at ')[0]?.trim() || headline;

    const experiences = extractExperiences(experienceText);
    const educations = extractEducation(educationText);
    const skills = extractSkills(skillsText);

    return {
        firstName,
        lastName,
        headline,
        location: extractLocation(headerText),
        about: extractAbout(aboutText),
        experiences,
        educations,
        skills
    };
}

/**
 * Map parsed LinkedIn data to FormData
 */
export function linkedInToFormData(parsed: ParsedLinkedInData): Partial<FormData> {
    return {
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        designation: parsed.headline ? parsed.headline.split(' at ')[0]?.trim() || parsed.headline : '',
        email: '',
        phone: '',
        address: parsed.location || '',
        summary: parsed.about || '',
        image: null,
        skillsRaw: parsed.skills.join(', '),
        experiences: parsed.experiences.map((exp, idx) => ({
            id: idx + 1,
            title: exp.title || '',
            company: exp.company || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            description: exp.description || ''
        })),
        educations: parsed.educations.map((edu, idx) => ({
            id: idx + 1,
            school: edu.school || '',
            degree: edu.degree || '',
            city: '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
            description: ''
        })),
        projects: [],
        achievements: []
    };
}

/**
 * Parse using AI as fallback for better quality extraction.
 * Sends the raw text to the configured LLM for structured extraction.
 */
export async function parseWithAI(rawText: string): Promise<Partial<FormData>> {
    const config = getProviderConfig();
    const provider = config.provider;

    // Build prompt for AI
    const prompt = `You are a LinkedIn profile data extractor. Parse the following LinkedIn profile text and return ONLY a JSON object with these exact fields:

{
  "firstName": "string",
  "lastName": "string",
  "headline": "string (the full headline including company)",
  "location": "string",
  "about": "string (the About section content)",
  "experiences": [
    { "title": "string", "company": "string", "location": "string", "startDate": "YYYY-MM format", "endDate": "YYYY-MM or empty if Present", "description": "string" }
  ],
  "educations": [
    { "school": "string", "degree": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM" }
  ],
  "skills": ["skill1", "skill2", ...]
}

Rules:
- Extract dates as YYYY-MM format
- Use empty string for missing fields
- For present/current positions, set endDate to empty string
- Combine multiple description bullets into a single string separated by newlines
- Return ONLY valid JSON, no markdown, no explanation

TEXT TO PARSE:
${rawText}`;

    try {
        // Use the same AI calling pattern as the existing service
        const response = await callAIForParsing(prompt);
        const cleaned = response.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();
        const parsed = JSON.parse(cleaned) as ParsedLinkedInData;

        return linkedInToFormData(parsed);
    } catch (err) {
        console.error('AI parsing failed, falling back to regex:', err);
        // Fallback to regex parsing
        const regexParsed = parseLinkedInProfile(rawText);
        return linkedInToFormData(regexParsed);
    }
}

/**
 * Call the configured AI provider for parsing
 */
async function callAIForParsing(prompt: string): Promise<string> {
    return generateWithProvider(prompt);
}
