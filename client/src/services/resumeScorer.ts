import { FormData } from '../types';

/* ============================================
   Resume Scorer
   Scores resumes based on best practices
   using pure algorithmic analysis (no AI)
   ============================================ */

export interface ScoreCategory {
    label: string;
    score: number;
    maxScore: number;
    tips: string[];
    icon: string;
}

export interface ResumeScore {
    total: number;
    maxTotal: number;
    categories: ScoreCategory[];
    overallLabel: string;
    overallColor: string;
}

/**
 * Check if a string contains numbers (potential quantified achievement)
 */
function hasNumbers(text: string): boolean {
    return /[0-9]/.test(text);
}

/**
 * Check if a string is a valid email format
 */
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Get all bullet point text from experiences
 */
function getAllBullets(formData: FormData): string[] {
    const bullets: string[] = [];
    formData.experiences.forEach(exp => {
        if (exp.description) {
            exp.description.split('\n').filter(Boolean).forEach(b => bullets.push(b));
        }
    });
    return bullets;
}

/**
 * Common strong action verbs for resumes
 */
const ACTION_VERBS = [
    'led', 'managed', 'developed', 'implemented', 'created', 'designed',
    'optimized', 'improved', 'delivered', 'achieved', 'launched', 'built',
    'spearheaded', 'established', 'generated', 'increased', 'reduced',
    'transformed', 'negotiated', 'coordinated', 'mentored', 'trained',
    'architected', 'engineered', 'produced', 'executed', 'facilitated',
    'streamlined', 'accelerated', 'expanded', 'pioneered', 'directed',
    'oversaw', 'drove', 'orchestrated', 'championed', 'revamped'
];

/**
 * Score personal information section
 */
function scorePersonalInfo(formData: FormData): ScoreCategory {
    let score = 0;
    const tips: string[] = [];

    // Name (5 pts)
    if (formData.firstName?.trim() && formData.lastName?.trim()) {
        score += 5;
    } else {
        tips.push('Add your full name (first and last)');
    }

    // Email (5 pts)
    if (formData.email?.trim() && isValidEmail(formData.email)) {
        score += 5;
    } else if (formData.email?.trim()) {
        tips.push('Your email address appears to be invalid — check the format');
    } else {
        tips.push('Add an email address so recruiters can contact you');
    }

    // Phone (2 pts)
    if (formData.phone?.trim()) {
        score += 2;
    } else {
        tips.push('Add a phone number for recruiter calls');
    }

    // Designation (3 pts)
    if (formData.designation?.trim()) {
        score += 3;
    } else {
        tips.push('Add a professional title/designation so recruiters know your role immediately');
    }

    return {
        label: 'Personal Info',
        score,
        maxScore: 15,
        tips,
        icon: '👤'
    };
}

/**
 * Score professional summary
 */
function scoreSummary(formData: FormData): ScoreCategory {
    let score = 0;
    const tips: string[] = [];
    const summary = formData.summary?.trim() || '';

    if (summary.length > 0) {
        score += 5; // Has summary

        if (summary.length > 50) {
            score += 5; // Decent length
        }

        if (summary.length > 100) {
            score += 5; // Substantial
        } else {
            tips.push('Your summary is quite short — aim for 2-4 sentences covering your key strengths');
        }
    } else {
        tips.push('Add a professional summary — it\'s the first thing recruiters read');
        tips.push('A strong summary highlights your role, key skills, and career impact');
    }

    return {
        label: 'Summary',
        score,
        maxScore: 15,
        tips,
        icon: '📝'
    };
}

/**
 * Score work experience section
 */
function scoreExperience(formData: FormData): ScoreCategory {
    let score = 0;
    const tips: string[] = [];
    const exps = formData.experiences || [];

    if (exps.length > 0) {
        score += 5; // Has entries

        // Check if entries have titles, companies, dates
        let hasDescriptions = 0;
        let hasDates = 0;
        let hasCompanies = 0;
        let quantifiedCount = 0;
        let actionVerbCount = 0;

        exps.forEach(exp => {
            if (exp.title?.trim()) {
                hasCompanies++; // Title present
            }
            if (exp.company?.trim()) {
                hasCompanies++;
            }
            if (exp.startDate || exp.endDate) {
                hasDates++;
            }
            if (exp.description?.trim()) {
                hasDescriptions++;
                const bullets = exp.description.split('\n').filter(Boolean);
                bullets.forEach(bullet => {
                    if (hasNumbers(bullet)) quantifiedCount++;
                    const firstWord = bullet.trim().toLowerCase().split(/\s+/)[0];
                    if (ACTION_VERBS.includes(firstWord)) actionVerbCount++;
                });
            }
        });

        // Descriptions (5 pts)
        if (hasDescriptions >= exps.length) {
            score += 5;
        } else if (hasDescriptions > 0) {
            score += 3;
            tips.push('Add descriptions to all experience entries — bullet points sell your impact');
        } else {
            tips.push('Every experience entry needs description bullets describing your achievements');
        }

        // Dates (5 pts)
        if (hasDates >= exps.length) {
            score += 5;
        } else if (hasDates > 0) {
            score += 3;
            tips.push('Add start/end dates to all experience entries');
        } else {
            tips.push('Add dates to your experience entries so recruiters see your timeline');
        }

        // Companies (5 pts)
        if (hasCompanies >= exps.length * 1.5) {
            score += 5;
        } else {
            tips.push('Include both job title and company name for each position');
        }

        // Quantified achievements (5 pts)
        if (quantifiedCount >= 3) {
            score += 5;
        } else if (quantifiedCount > 0) {
            score += 3;
            tips.push('Add numbers to your bullet points — metrics make achievements concrete (e.g., "Increased sales by 20%")');
        } else {
            tips.push('Quantify your achievements! Use numbers, percentages, and dollar amounts to show impact');
        }

        // Action verbs (bonus - already counted in quantified)
        if (actionVerbCount < exps.length && hasDescriptions > 0) {
            tips.push('Start bullet points with strong action verbs like "Led", "Developed", or "Optimized"');
        }

    } else {
        tips.push('Add your work experience — this is the most important section for recruiters');
        tips.push('List your most recent roles with title, company, dates, and achievements');
    }

    return {
        label: 'Experience',
        score,
        maxScore: 25,
        tips,
        icon: '💼'
    };
}

/**
 * Score education section
 */
function scoreEducation(formData: FormData): ScoreCategory {
    let score = 0;
    const tips: string[] = [];
    const edus = formData.educations || [];

    if (edus.length > 0) {
        score += 5; // Has entries

        let hasDegrees = 0;
        edus.forEach(edu => {
            if (edu.degree?.trim()) hasDegrees++;
        });

        if (hasDegrees >= edus.length) {
            score += 5;
        } else {
            tips.push('Add degree information for each education entry');
        }
    } else {
        tips.push('Add your education background — even if not degree-specific');
    }

    return {
        label: 'Education',
        score,
        maxScore: 10,
        tips,
        icon: '🎓'
    };
}

/**
 * Score skills section
 */
function scoreSkills(formData: FormData): ScoreCategory {
    let score = 0;
    const tips: string[] = [];
    const skills = (formData.skillsRaw || '').split(',').map(s => s.trim()).filter(Boolean);
    const count = skills.length;

    if (count > 0) {
        score += 5; // Has skills

        if (count >= 5) {
            score += 5; // Well-populated
        } else {
            tips.push('Add at least 5 skills to give recruiters a clear picture of your expertise');
        }

        if (count >= 10) {
            score += 5; // Extensive
        } else if (count >= 5) {
            score += 3;
            tips.push('Consider adding more skills — 10+ gives the best ATS coverage');
        }
    } else {
        tips.push('Skills are critical for ATS screening — add your technical and soft skills');
        tips.push('Separate skills with commas for best results');
    }

    return {
        label: 'Skills',
        score,
        maxScore: 15,
        tips,
        icon: '🔧'
    };
}

/**
 * Score projects and achievements
 */
function scoreProjectsAchievements(formData: FormData): ScoreCategory {
    let score = 0;
    const tips: string[] = [];
    const projects = formData.projects || [];
    const achievements = formData.achievements || [];

    if (projects.length > 0) {
        score += 5;
    } else {
        tips.push('Adding projects showcases real-world application of your skills');
    }

    if (achievements.length > 0) {
        score += 5;
    } else {
        tips.push('Achievements help you stand out — add awards, recognitions, or key milestones');
    }

    return {
        label: 'Projects & Awards',
        score,
        maxScore: 10,
        tips,
        icon: '🏆'
    };
}

/**
 * Score overall quality (bonus criteria)
 */
function scoreOverall(formData: FormData): ScoreCategory {
    let score = 0;
    const tips: string[] = [];
    const exps = formData.experiences || [];

    // Contact info complete (5 pts)
    if (formData.email?.trim() && formData.phone?.trim()) {
        score += 5;
    } else {
        tips.push('Complete your contact section with both email and phone for best results');
    }

    // Multiple experience entries (5 pts)
    if (exps.length >= 2) {
        score += 5;
    } else if (exps.length === 1) {
        score += 2;
        tips.push('Consider adding more experience entries — 2+ roles shows career progression');
    }

    return {
        label: 'Overall Quality',
        score,
        maxScore: 10,
        tips,
        icon: '⭐'
    };
}

/**
 * Get overall label and color based on total score
 */
function getOverallRating(total: number, maxTotal: number): { label: string; color: string } {
    const pct = (total / maxTotal) * 100;
    if (pct >= 90) return { label: 'Excellent', color: '#10b981' };
    if (pct >= 75) return { label: 'Great', color: '#06b6d4' };
    if (pct >= 55) return { label: 'Good', color: '#f59e0b' };
    if (pct >= 35) return { label: 'Fair', color: '#f97316' };
    return { label: 'Needs Work', color: '#ef4444' };
}

/**
 * Score the complete resume — main entry point
 */
export function scoreResume(formData: FormData): ResumeScore {
    const categories: ScoreCategory[] = [
        scorePersonalInfo(formData),
        scoreSummary(formData),
        scoreExperience(formData),
        scoreEducation(formData),
        scoreSkills(formData),
        scoreProjectsAchievements(formData),
        scoreOverall(formData)
    ];

    const total = categories.reduce((sum, cat) => sum + cat.score, 0);
    const maxTotal = categories.reduce((sum, cat) => sum + cat.maxScore, 0);
    const { label, color } = getOverallRating(total, maxTotal);

    return {
        total,
        maxTotal,
        categories,
        overallLabel: label,
        overallColor: color
    };
}
