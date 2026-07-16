import { ProviderConfig, AIProvider, AIPromptParams, TailorParams, PowerUpParams, SkillsParams, CoverLetterParams, ATSParams, WritingStyle } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getStyleInstructions, getFallbackTone } from './prompts';

interface AIProvidersMap {
    [key: string]: AIProvider;
}

export const AI_PROVIDERS: AIProvidersMap = {
    gemini: {
        name: 'Gemini',
        storageKey: 'gemini_api_key',
        modelKey: 'gemini_model',
        defaultModel: 'gemini-2.0-flash'
    },
    openai: {
        name: 'OpenAI-compatible',
        storageKey: 'openai_api_key',
        modelKey: 'openai_model',
        baseUrlKey: 'openai_base_url',
        defaultModel: 'gpt-4o-mini',
        defaultBaseUrl: 'https://api.openai.com/v1'
    },
    openrouter: {
        name: 'OpenRouter',
        storageKey: 'openrouter_api_key',
        modelKey: 'openrouter_model',
        defaultModel: 'openai/gpt-4o-mini',
        defaultBaseUrl: 'https://openrouter.ai/api/v1'
    },
    ollama: {
        name: 'Ollama local',
        modelKey: 'ollama_model',
        baseUrlKey: 'ollama_base_url',
        defaultModel: 'llama3.2',
        defaultBaseUrl: 'http://localhost:11434'
    }
};

export const getActiveProvider = (): string => {
    if (typeof localStorage === 'undefined') return 'gemini';
    return localStorage.getItem('ai_provider') || 'gemini';
};

export const getProviderConfig = (): ProviderConfig => {
    if (typeof localStorage === 'undefined') {
        return {
            provider: 'gemini',
            label: AI_PROVIDERS.gemini.name,
            apiKey: '',
            model: AI_PROVIDERS.gemini.defaultModel,
            baseUrl: AI_PROVIDERS.gemini.defaultBaseUrl || ''
        };
    }

    const provider = getActiveProvider();
    const defaults = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;

    return {
        provider,
        label: defaults.name,
        apiKey: defaults.storageKey ? localStorage.getItem(defaults.storageKey) || '' : '',
        model: localStorage.getItem(defaults.modelKey) || defaults.defaultModel,
        baseUrl: defaults.baseUrlKey ? localStorage.getItem(defaults.baseUrlKey) || defaults.defaultBaseUrl || '' : defaults.defaultBaseUrl || ''
    };
};

const assertConfigured = (config: ProviderConfig): void => {
    if (config.provider !== 'ollama' && !config.apiKey) {
        throw new Error(`No API key configured for ${config.label}`);
    }

    if ((config.provider === 'openai' || config.provider === 'openrouter' || config.provider === 'ollama') && !config.baseUrl) {
        throw new Error(`No base URL configured for ${config.label}`);
    }
};

interface OpenAIResponse {
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
    error?: {
        message?: string;
    };
}

const parseOpenAIResponse = async (response: Response, providerLabel: string): Promise<string> => {
    const data: OpenAIResponse | null = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.error?.message || `${providerLabel} request failed with status ${response.status}`);
    }

    return data?.choices?.[0]?.message?.content?.trim() || '';
};

const callGemini = async (prompt: string, config: ProviderConfig): Promise<string> => {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ model: config.model });
    const result = await model.generateContent(prompt);
    return result.response.text();
};

const callOpenAICompatible = async (prompt: string, config: ProviderConfig): Promise<string> => {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        })
    });

    return parseOpenAIResponse(response, config.label);
};

const callOpenRouter = async (prompt: string, config: ProviderConfig): Promise<string> => {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
            'X-Title': 'ResumeForge AI'
        },
        body: JSON.stringify({
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        })
    });

    return parseOpenAIResponse(response, config.label);
};

interface OllamaResponse {
    response?: string;
    error?: string;
}

const callOllama = async (prompt: string, config: ProviderConfig): Promise<string> => {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: config.model,
            prompt,
            stream: false
        })
    });
    const data: OllamaResponse | null = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.error || `Ollama request failed with status ${response.status}`);
    }

    return data?.response?.trim() || '';
};

export const generateWithProvider = async (prompt: string): Promise<string> => {
    const config = getProviderConfig();
    assertConfigured(config);

    if (config.provider === 'openai') return callOpenAICompatible(prompt, config);
    if (config.provider === 'openrouter') return callOpenRouter(prompt, config);
    if (config.provider === 'ollama') return callOllama(prompt, config);
    return callGemini(prompt, config);
};

const getPrimarySkill = (skills: string = ''): string => {
    return skills.split(',').map(skill => skill.trim()).filter(Boolean)[0] || 'cross-functional collaboration';
};

export const generateFallbackSummary = ({ name, role, experience, skills, industry }: AIPromptParams, style: WritingStyle = 'professional'): string => {
    const displayName = name || 'This candidate';
    const targetRole = role || `${industry || 'professional'} candidate`;
    const primarySkill = getPrimarySkill(skills);
    const experienceText = experience
        ? ` with experience including ${experience.split('. ')[0].toLowerCase()}`
        : '';
    const tone = getFallbackTone(style);

    if (style === 'casual') {
        return `${displayName} is a passionate ${targetRole} who loves diving into ${primarySkill} and delivering results${experienceText}. Known for clear communication and a collaborative approach, they thrive in dynamic environments and are excited to bring their energy to a ${industry || 'forward-thinking'} team.`;
    }
    if (style === 'academic') {
        return `${displayName} is a dedicated ${targetRole} whose professional practice demonstrates rigorous application of ${primarySkill} and advanced methodologies${experienceText}. Their scholarly approach to problem-solving and commitment to excellence make them a valuable contributor to ${industry || 'research-driven'} organizations.`;
    }
    // Professional (default)
    return `${displayName} is a results-driven ${targetRole}${experienceText}. Skilled in ${primarySkill}, clear communication, and practical problem solving, they bring a focused approach to delivering measurable value. They are prepared to contribute to ${industry || 'business'} teams by combining technical strengths, adaptability, and a strong attention to detail.`;
};

export const generateFallbackBullet = ({ bulletText, role, industry }: PowerUpParams, style: WritingStyle = 'professional'): string => {
    const action = bulletText.trim().replace(/[.]+$/, '');
    const context = role || `${industry || 'professional'} role`;

    if (style === 'casual') {
        return `Transformed ${action.toLowerCase()} in a ${context}, making things run smoother and delivering real results for the team.`;
    }
    if (style === 'academic') {
        return `Advanced ${action.toLowerCase()} within a ${context}, employing systematic methodologies to enhance operational outcomes and scholarly practice.`;
    }
    // Professional (default)
    return `Improved ${action.toLowerCase()} in a ${context}, strengthening team efficiency, delivery quality, and measurable business impact.`;
};

export const generateFallbackCoverLetter = ({ name, role, experience, skills, jobDescription, industry }: CoverLetterParams, style: WritingStyle = 'professional'): string => {
    const displayName = name || 'Applicant';
    const targetRole = role || `${industry || 'professional'} position`;
    const skillList = skills || 'relevant skills';
    const tone = getFallbackTone(style);

    const body = experience
        ? `In my previous roles, ${experience.split(',').slice(0, 2).join(' and ')}, I have developed expertise in ${skillList} while consistently exceeding expectations.`
        : `I bring a strong foundation in ${skillList} and a passion for driving meaningful outcomes in the ${industry || 'professional'} space.`;

    const interest = jobDescription
        ? 'the focus areas outlined in the job description closely match my professional experience and career aspirations.'
        : 'it represents a compelling opportunity to apply my skills in a challenging environment.';

    if (style === 'casual') {
        return `Hey there,

I'm really excited to apply for the ${targetRole} role! With my background in ${industry || 'the industry'} and a genuine love for what I do, I think I'd be a great fit for your team.

${body}

What caught my eye about this opportunity is that ${interest}

I'd love to chat more about how I can contribute to your team's success. Thanks for considering my application!

${tone.signOff},
${displayName}`;
    }
    if (style === 'academic') {
        return `Dear Search Committee,

I submit my application for the ${targetRole} position with great interest. My academic and professional background in ${industry || 'the field'} has prepared me to contribute meaningfully to your organization's mission.

${body}

I am particularly drawn to this opportunity because ${interest}

I welcome the opportunity to discuss how my research and professional experience align with your needs. Thank you for your time and consideration.

${tone.signOff},
${displayName}`;
    }
    // Professional (default)
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${targetRole} position. With my background in ${industry || 'the industry'} and proven track record of delivering results, I am confident that my experience aligns well with your team's needs.

${body}

I am particularly drawn to this opportunity because ${interest}

I would welcome the chance to discuss how my background and skills could contribute to your team's success. Thank you for your consideration.

${tone.signOff},
${displayName}`;
};

export const generateFallbackSkills = ({ role, rawSkills, industry }: SkillsParams): string => {
    const existing = rawSkills.split(',').map(s => s.trim()).filter(Boolean);
    if (existing.length === 0) {
        // Suggest common skills based on industry
        const industrySkills: Record<string, string[]> = {
            technology: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Git', 'TypeScript', 'SQL', 'Docker', 'REST APIs'],
            finance: ['Financial Analysis', 'Excel', 'Risk Management', 'Financial Modeling', 'Bloomberg', 'SQL', 'Data Analysis', 'Reporting', 'Compliance', 'Forecasting'],
            healthcare: ['Patient Care', 'EMR Systems', 'Clinical Research', 'HIPAA', 'Treatment Planning', 'Medical Documentation', 'Team Collaboration', 'Diagnostics'],
            'creative design': ['Adobe Creative Suite', 'UI/UX Design', 'Figma', 'Typography', 'Brand Strategy', 'Motion Design', 'Prototyping', 'Design Systems'],
            legal: ['Legal Research', 'Contract Review', 'Litigation Support', 'Document Drafting', 'Case Management', 'Regulatory Compliance', 'Client Counseling'],
            education: ['Curriculum Development', 'Classroom Management', 'Assessment Design', 'Educational Technology', 'Student Advising', 'Program Evaluation', 'Differentiated Instruction']
        };

        const suggestions = industrySkills[industry?.toLowerCase()] || industrySkills.technology;
        return suggestions.join(', ');
    }

    // Organize and categorize existing skills
    return existing.slice(0, 12).join(', ');
};

export const generateFallbackATS = ({ role, summary, skills, experience, jobDescription }: ATSParams): string => {
    // Simple keyword-matching ATS analysis (no AI needed)
    const resumeText = [summary, skills, experience].filter(Boolean).join(' ').toLowerCase();
    const jdWords = (jobDescription || '').toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !['this', 'that', 'with', 'from', 'have', 'been', 'will', 'your', 'about', 'which', 'their', 'they', 'would', 'could', 'should', 'there'].includes(w));

    const uniqueJdWords = [...new Set(jdWords)];
    const matchedWords = uniqueJdWords.filter(w => resumeText.includes(w));
    const score = uniqueJdWords.length > 0
        ? Math.min(Math.round((matchedWords.length / uniqueJdWords.length) * 100), 100)
        : 50;

    const tips: string[] = [];
    if (score < 60) {
        tips.push('Add more keywords from the job description to your resume: ' + uniqueJdWords.slice(0, 5).join(', ') + '...');
        tips.push('Quantify your achievements with specific metrics and results');
        tips.push('Ensure your role title matches or closely relates to the target position');
    } else if (score < 80) {
        tips.push('Great keyword match! Try to weave in remaining terms: ' + uniqueJdWords.filter(w => !matchedWords.includes(w)).slice(0, 3).join(', '));
        tips.push('Strengthen your bullet points with measurable outcomes');
        tips.push('Add a professional summary that mirrors the job description\'s language');
    } else {
        tips.push('Excellent alignment! Your resume is well-optimized for this role');
        tips.push('Consider adding a few niche terms to reach a perfect score');
        tips.push('Ensure your contact info and formatting are ATS-friendly');
    }

    return `SCORE: ${score}\nTIP1: ${tips[0]}\nTIP2: ${tips[1]}\nTIP3: ${tips[2]}`;
};

export const generateSummary = async ({ name, role, experience, skills, industry }: AIPromptParams, style: WritingStyle = 'professional'): Promise<string> => {
    const styleInstr = getStyleInstructions(style);
    const prompt = `You are a professional resume writer specializing in the ${industry || 'general'} industry.
Write a compelling, ATS-optimized professional summary (3-4 sentences) for:
- Name: ${name}
- Target Role: ${role}
- Experience: ${experience}
- Key Skills: ${skills}

${styleInstr}

Rules:
- Include relevant industry keywords
- Be concise and impactful
- Do NOT include any markdown formatting
- Return ONLY the summary text`;

    return generateWithProvider(prompt);
};

export const tailorSummary = async ({ currentSummary, jobDescription }: TailorParams, style: WritingStyle = 'professional'): Promise<string> => {
    const styleInstr = getStyleInstructions(style);
    const prompt = `You are an expert resume tailor. Rewrite this professional summary to better match the job description below.

Current Summary:
${currentSummary}

Job Description:
${jobDescription}

${styleInstr}

Rules:
- Incorporate relevant keywords from the job description
- Keep to 3-4 sentences
- Do NOT include any markdown formatting
- Return ONLY the rewritten summary`;

    return generateWithProvider(prompt);
};

export const powerUpBullet = async ({ bulletText, role, industry }: PowerUpParams, style: WritingStyle = 'professional'): Promise<string> => {
    const styleInstr = getStyleInstructions(style);
    const prompt = `You are a resume optimization expert for the ${industry || 'general'} industry.
Transform this simple task description into a powerful, quantified achievement bullet point:

Original: "${bulletText}"
Role context: ${role}

${styleInstr}

Rules:
- Start with a strong action verb
- Include quantified results where possible (%, $, numbers)
- Keep to 1-2 lines maximum
- Make it ATS-friendly
- Do NOT include any markdown formatting or bullet characters
- Return ONLY the improved bullet point text`;

    return generateWithProvider(prompt);
};

export const generateSkills = async ({ role, rawSkills, industry }: SkillsParams, style: WritingStyle = 'professional'): Promise<string> => {
    const styleInstr = getStyleInstructions(style);
    const prompt = `You are a resume expert for the ${industry || 'general'} industry.
Given this role and raw skills, organize and enhance them into professional skill categories:

Role: ${role}
Raw Skills: ${rawSkills}

${styleInstr}

Rules:
- Return a comma-separated list of refined, ATS-friendly skill names
- Include up to 12 of the most impactful and relevant skills
- Do NOT include any markdown formatting
- Return ONLY the comma-separated skills`;

    return generateWithProvider(prompt);
};

export const generateCoverLetter = async ({ name, role, experience, skills, jobDescription, industry }: CoverLetterParams, style: WritingStyle = 'professional'): Promise<string> => {
    const styleInstr = getStyleInstructions(style);
    const prompt = `You are a professional career coach and resume writer for the ${industry || 'general'} industry.
Write a personalized, high-impact cover letter for:
- Name: ${name}
- Target Role: ${role}
- Experience Highlight: ${experience}
- Key Skills: ${skills}
- Job Description: ${jobDescription}

${styleInstr}

Rules:
- 300-400 words
- Directly address how the experience matches the job description
- Use standard business letter format
- Do NOT include markdown formatting
- Return ONLY the cover letter text`;

    return generateWithProvider(prompt);
};

export const analyzeATSCompatibility = async ({ role, summary, skills, experience, jobDescription }: ATSParams, style: WritingStyle = 'professional'): Promise<string> => {
    const styleInstr = getStyleInstructions(style);
    const prompt = `You are an ATS (Applicant Tracking System) algorithm expert. 
Analyze the compatibility between this resume and the job description.

Resume Data:
- Role: ${role}
- Summary: ${summary}
- Skills: ${skills}
- Experience: ${experience}

Job Description:
${jobDescription}

${styleInstr}

Rules:
- Provide a score from 0-100 based on keyword match, role alignment, and experience.
- Provide 3 specific improvement tips to increase the score.
- Return the response in this exact format:
  SCORE: [number]
  TIP1: [tip]
  TIP2: [tip]
  TIP3: [tip]`;

    return generateWithProvider(prompt);
};

/* ============================================
   Section-by-Section Rewrite in Writing Style
   ============================================ */

/**
 * Rewrite the professional summary in the selected writing style
 */
export const rewriteSummaryStyle = async (
    currentSummary: string,
    industry: string,
    style: WritingStyle
): Promise<string> => {
    const styleInstr = getStyleInstructions(style);
    const prompt = `You are a professional resume writer. Rewrite the following professional summary to match the specified writing style.

Current Summary:
${currentSummary}

Industry: ${industry || 'general'}

${styleInstr}

Rules:
- Preserve the core content and achievements
- Rewrite the tone, vocabulary, and structure to match the writing style
- Keep to 3-4 sentences
- Do NOT include any markdown formatting
- Return ONLY the rewritten summary text`;

    return generateWithProvider(prompt);
};

/**
 * Rewrite all experience bullet points in the selected writing style
 */
export const rewriteExperienceBullets = async (
    experiences: Array<{ title: string; company: string; description: string }>,
    role: string,
    industry: string,
    style: WritingStyle
): Promise<string> => {
    const styleInstr = getStyleInstructions(style);
    const experienceText = experiences.map(e =>
        `Role: ${e.title} at ${e.company}\nBullets:\n${e.description || '(no description)'}`
    ).join('\n\n---\n\n');

    const prompt = `You are a professional resume writer. Rewrite ALL the experience bullet points to match the specified style.

EXPERIENCES TO REWRITE (listed in order):
${experienceText}

Role context: ${role || 'professional'}
Industry: ${industry || 'general'}

${styleInstr}

RULES:
- Rewrite EVERY bullet point — keep the same information and achievements
- Use strong action verbs to start each bullet
- Add quantified results where implied
- Keep bullets to 1-2 lines each
- Return ONLY the bullet text, no labels, no roles, no headers
- Preserve the EXACT SAME ORDER and GROUPING: first entry's bullets, then a blank line, then next entry's bullets, then a blank line, etc.
- Do NOT include any markdown formatting
- Each bullet on its own line`;

    return generateWithProvider(prompt);
};

/**
 * Rewrite skills list in the selected writing style
 */
export const rewriteSkillsStyle = async (
    rawSkills: string,
    role: string,
    industry: string,
    style: WritingStyle
): Promise<string> => {
    const styleInstr = getStyleInstructions(style);
    const prompt = `You are a resume expert. Refine and rewrite the following skills list to match the specified writing style.

Current Skills:
${rawSkills}

Role: ${role || 'professional'}
Industry: ${industry || 'general'}

${styleInstr}

Rules:
- Return a comma-separated list of ATS-friendly skill names
- Include up to 12 of the most relevant skills
- Remove duplicates and generic filler skills
- Add any missing critical skills for this role
- Do NOT include any markdown formatting
- Return ONLY the comma-separated skills`;

    return generateWithProvider(prompt);
};

/* --- Fallbacks (no AI needed) --- */

/**
 * Template-based style rewrite for summary (no AI)
 */
export const generateFallbackRewriteSummary = (currentSummary: string, style: WritingStyle = 'professional'): string => {
    if (!currentSummary.trim()) return currentSummary;
    const tone = getFallbackTone(style);

    if (style === 'casual') {
        // Make it more conversational
        return currentSummary
            .replace(/results-driven/g, 'passionate')
            .replace(/demonstrated/g, 'hands-on')
            .replace(/delivered measurable impact/g, 'made a real difference');
    }
    if (style === 'academic') {
        // Make it more formal
        return currentSummary
            .replace(/results-driven/g, 'accomplished')
            .replace(/skill in/g, 'proficiency in')
            .replace(/proven track record/g, 'established record of scholarship');
    }
    // Professional - return as-is
    return currentSummary;
};

/**
 * Template-based style rewrite for experience bullets (no AI)
 */
export const generateFallbackRewriteBullets = (experienceDesc: string, style: WritingStyle = 'professional'): string => {
    if (!experienceDesc.trim()) return experienceDesc;
    const tone = getFallbackTone(style);

    const lines = experienceDesc.split('\n').filter(Boolean);
    const rewritten = lines.map(line => {
        const trimmed = line.replace(/^[•\-\s]+/, '').trim();
        if (!trimmed) return line;

        const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase() || '';
        const rest = trimmed.substring(firstWord.length).trim();

        if (style === 'casual') {
            const casualVerbs: Record<string, string> = {
                'implemented': 'Built and rolled out',
                'developed': 'Created',
                'managed': 'Ran',
                'led': 'Headed up',
                'optimized': 'Made better',
                'improved': 'Leveled up',
                'delivered': 'Shipped',
                'achieved': 'Hitt'
            };
            const verb = casualVerbs[firstWord] || trimmed.split(/\s+/).slice(0, 2).join(' ');
            return `${verb} ${rest}`;
        }

        if (style === 'academic') {
            const academicVerbs: Record<string, string> = {
                'implemented': 'Implemented and systematically evaluated',
                'developed': 'Developed and validated',
                'managed': 'Directed and coordinated',
                'led': 'Principal lead for',
                'optimized': 'Optimized through systematic analysis',
                'increased': 'Significantly increased',
                'reduced': 'Substantially reduced',
                'created': 'Conceptualized and created'
            };
            const verb = academicVerbs[firstWord] || trimmed.split(/\s+/).slice(0, 2).join(' ');
            return `${verb} ${rest}`;
        }

        // Professional — keep original, just clean up
        return trimmed.replace(/^[a-z]/, c => c.toUpperCase());
    });

    return rewritten.join('\n');
};

export const checkApiKey = (): boolean => {
    if (typeof localStorage === 'undefined') return false;

    const config = getProviderConfig();
    return config.provider === 'ollama' || !!config.apiKey;
};
