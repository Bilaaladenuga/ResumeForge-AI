import { GoogleGenerativeAI } from '@google/generative-ai';

export const AI_PROVIDERS = {
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

export const getActiveProvider = () => {
    if (typeof localStorage === 'undefined') return 'gemini';
    return localStorage.getItem('ai_provider') || 'gemini';
};

export const getProviderConfig = () => {
    if (typeof localStorage === 'undefined') {
        return {
            provider: 'gemini',
            label: AI_PROVIDERS.gemini.name,
            apiKey: '',
            model: AI_PROVIDERS.gemini.defaultModel,
            baseUrl: AI_PROVIDERS.gemini.defaultBaseUrl
        };
    }

    const provider = getActiveProvider();
    const defaults = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;

    return {
        provider,
        label: defaults.name,
        apiKey: defaults.storageKey ? localStorage.getItem(defaults.storageKey) || '' : '',
        model: localStorage.getItem(defaults.modelKey) || defaults.defaultModel,
        baseUrl: defaults.baseUrlKey ? localStorage.getItem(defaults.baseUrlKey) || defaults.defaultBaseUrl : defaults.defaultBaseUrl
    };
};

const assertConfigured = ({ provider, label, apiKey, baseUrl }) => {
    if (provider !== 'ollama' && !apiKey) {
        throw new Error(`No API key configured for ${label}`);
    }

    if ((provider === 'openai' || provider === 'openrouter' || provider === 'ollama') && !baseUrl) {
        throw new Error(`No base URL configured for ${label}`);
    }
};

const parseOpenAIResponse = async (response, providerLabel) => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.error?.message || `${providerLabel} request failed with status ${response.status}`);
    }

    return data?.choices?.[0]?.message?.content?.trim() || '';
};

const callGemini = async (prompt, config) => {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ model: config.model });
    const result = await model.generateContent(prompt);
    return result.response.text();
};

const callOpenAICompatible = async (prompt, config) => {
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

const callOpenRouter = async (prompt, config) => {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
            'HTTP-Referer': window.location.origin,
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

const callOllama = async (prompt, config) => {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: config.model,
            prompt,
            stream: false
        })
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.error || `Ollama request failed with status ${response.status}`);
    }

    return data?.response?.trim() || '';
};

const generateWithProvider = async (prompt) => {
    const config = getProviderConfig();
    assertConfigured(config);

    if (config.provider === 'openai') return callOpenAICompatible(prompt, config);
    if (config.provider === 'openrouter') return callOpenRouter(prompt, config);
    if (config.provider === 'ollama') return callOllama(prompt, config);
    return callGemini(prompt, config);
};

const getPrimarySkill = (skills = '') => {
    return skills.split(',').map(skill => skill.trim()).filter(Boolean)[0] || 'cross-functional collaboration';
};

export const generateFallbackSummary = ({ name, role, experience, skills, industry }) => {
    const displayName = name || 'This candidate';
    const targetRole = role || `${industry || 'professional'} candidate`;
    const primarySkill = getPrimarySkill(skills);
    const experienceText = experience
        ? ` with experience including ${experience.split('. ')[0].toLowerCase()}`
        : '';

    return `${displayName} is a results-driven ${targetRole}${experienceText}. Skilled in ${primarySkill}, clear communication, and practical problem solving, they bring a focused approach to delivering measurable value. They are prepared to contribute to ${industry || 'business'} teams by combining technical strengths, adaptability, and a strong attention to detail.`;
};

export const generateFallbackBullet = ({ bulletText, role, industry }) => {
    const action = bulletText.trim().replace(/[.]+$/, '');
    const context = role || `${industry || 'professional'} role`;

    return `Improved ${action.toLowerCase()} in a ${context}, strengthening team efficiency, delivery quality, and measurable business impact.`;
};

export const generateSummary = async ({ name, role, experience, skills, industry }) => {
    const prompt = `You are a professional resume writer specializing in the ${industry || 'general'} industry.
Write a compelling, ATS-optimized professional summary (3-4 sentences) for:
- Name: ${name}
- Target Role: ${role}
- Experience: ${experience}
- Key Skills: ${skills}

Rules:
- Write in third person or first person professionally
- Include relevant industry keywords
- Be concise and impactful
- Do NOT include any markdown formatting
- Return ONLY the summary text`;

    return generateWithProvider(prompt);
};

export const tailorSummary = async ({ currentSummary, jobDescription }) => {
    const prompt = `You are an expert resume tailor. Rewrite this professional summary to better match the job description below.

Current Summary:
${currentSummary}

Job Description:
${jobDescription}

Rules:
- Incorporate relevant keywords from the job description
- Maintain professional tone
- Keep to 3-4 sentences
- Do NOT include any markdown formatting
- Return ONLY the rewritten summary`;

    return generateWithProvider(prompt);
};

export const powerUpBullet = async ({ bulletText, role, industry }) => {
    const prompt = `You are a resume optimization expert for the ${industry || 'general'} industry.
Transform this simple task description into a powerful, quantified achievement bullet point:

Original: "${bulletText}"
Role context: ${role}

Rules:
- Start with a strong action verb
- Include quantified results where possible (%, $, numbers)
- Keep to 1-2 lines maximum
- Make it ATS-friendly
- Do NOT include any markdown formatting or bullet characters
- Return ONLY the improved bullet point text`;

    return generateWithProvider(prompt);
};

export const generateSkills = async ({ role, rawSkills, industry }) => {
    const prompt = `You are a resume expert for the ${industry || 'general'} industry.
Given this role and raw skills, organize and enhance them into professional skill categories:

Role: ${role}
Raw Skills: ${rawSkills}

Rules:
- Return a comma-separated list of refined, ATS-friendly skill names
- Include up to 12 of the most impactful and relevant skills
- Do NOT include any markdown formatting
- Return ONLY the comma-separated skills`;

    return generateWithProvider(prompt);
};

export const generateCoverLetter = async ({ name, role, experience, skills, jobDescription, industry }) => {
    const prompt = `You are a professional career coach and resume writer for the ${industry || 'general'} industry.
Write a personalized, high-impact cover letter for:
- Name: ${name}
- Target Role: ${role}
- Experience Highlight: ${experience}
- Key Skills: ${skills}
- Job Description: ${jobDescription}

Rules:
- Professional and enthusiastic tone
- 300-400 words
- Directly address how the experience matches the job description
- Use standard business letter format
- Do NOT include markdown formatting
- Return ONLY the cover letter text`;

    return generateWithProvider(prompt);
};

export const analyzeATSCompatibility = async ({ role, summary, skills, experience, jobDescription }) => {
    const prompt = `You are an ATS (Applicant Tracking System) algorithm expert. 
Analyze the compatibility between this resume and the job description.

Resume Data:
- Role: ${role}
- Summary: ${summary}
- Skills: ${skills}
- Experience: ${experience}

Job Description:
${jobDescription}

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

export const checkApiKey = () => {
    if (typeof localStorage === 'undefined') return false;

    const config = getProviderConfig();
    return config.provider === 'ollama' || !!config.apiKey;
};
