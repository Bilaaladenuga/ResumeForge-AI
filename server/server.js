const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper for AI generation using dynamic key
async function generateAIWithUserKey(apiKey, prompt, fallback) {
    try {
        if (!apiKey) {
            console.warn('User API Key missing, using fallback content.');
            return fallback;
        }

        const openai = new OpenAI({ apiKey });

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a professional resume writer and career coach. Your task is to generate compelling, professional content for resumes and portfolios." },
                { role: "user", content: prompt }
            ],
            max_tokens: 500,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('AI Generation Error:', error.message);
        if (error.status === 401) return "Error: Invalid OpenAI API Key. Please check your settings.";
        return fallback;
    }
}

// Endpoints
app.post('/api/generate/summary', async (req, res) => {
    const { name, role, experience, skills } = req.body;
    const apiKey = req.headers['x-api-key'];

    const prompt = `Write a professional resume summary for ${name}, who is a ${role} with ${experience} of experience. Key skills: ${skills.join(', ')}. Keep it concise (3-4 sentences) and impactful.`;
    const fallback = `${name} is a dedicated ${role} with experience in ${skills.join(', ')}. Committed to delivering high-quality results and continuous professional growth.`;

    const content = await generateAIWithUserKey(apiKey, prompt, fallback);
    res.json({ content });
});

app.post('/api/generate/skills', async (req, res) => {
    const { role, rawSkills } = req.body;
    const apiKey = req.headers['x-api-key'];

    const prompt = `Categorize and professionalize these skills for a ${role} resume: ${rawSkills}. Provide the output as a clean list with categories.`;
    const fallback = `Technical Skills: ${rawSkills}. Communication, Problem Solving, Teamwork.`;

    const content = await generateAIWithUserKey(apiKey, prompt, fallback);
    res.json({ content });
});

app.post('/api/generate/bio', async (req, res) => {
    const { name, role, passions } = req.body;
    const apiKey = req.headers['x-api-key'];

    const prompt = `Write an engaging portfolio bio for ${name}, a ${role} who is passionate about ${passions}. Make it professional yet personable.`;
    const fallback = `Hi, I'm ${name}, a ${role} passionate about ${passions}. I love creating impactful solutions and connecting with like-minded professionals.`;

    const content = await generateAIWithUserKey(apiKey, prompt, fallback);
    res.json({ content });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', mode: 'production' });
});

app.listen(port, () => {
    console.log(`Production server running on http://localhost:${port}`);
});
