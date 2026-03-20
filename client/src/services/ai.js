import { GoogleGenerativeAI } from '@google/generative-ai';

const getModel = () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) throw new Error('No API key configured');
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

export const generateSummary = async ({ name, role, experience, skills, industry }) => {
    const model = getModel();
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

    const result = await model.generateContent(prompt);
    return result.response.text();
};

export const tailorSummary = async ({ currentSummary, jobDescription }) => {
    const model = getModel();
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

    const result = await model.generateContent(prompt);
    return result.response.text();
};

export const powerUpBullet = async ({ bulletText, role, industry }) => {
    const model = getModel();
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

    const result = await model.generateContent(prompt);
    return result.response.text();
};

export const generateSkills = async ({ role, rawSkills, industry }) => {
    const model = getModel();
    const prompt = `You are a resume expert for the ${industry || 'general'} industry.
Given this role and raw skills, organize and enhance them into professional skill categories:

Role: ${role}
Raw Skills: ${rawSkills}

Rules:
- Return a comma-separated list of refined, ATS-friendly skill names
- Include up to 12 of the most impactful and relevant skills
- Do NOT include any markdown formatting
- Return ONLY the comma-separated skills`;

    const result = await model.generateContent(prompt);
    return result.response.text();
};

export const generateCoverLetter = async ({ name, role, experience, skills, jobDescription, industry }) => {
    const model = getModel();
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

    const result = await model.generateContent(prompt);
    return result.response.text();
};

export const analyzeATSCompatibility = async ({ role, summary, skills, experience, jobDescription }) => {
    const model = getModel();
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

    const result = await model.generateContent(prompt);
    return result.response.text();
};

export const checkApiKey = () => {
    return !!localStorage.getItem('gemini_api_key');
};
