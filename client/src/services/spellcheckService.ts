import { FormData } from '../types';

export type IssueType = 'spelling' | 'grammar' | 'weak-language' | 'passive-voice' | 'buzzword' | 'style';

export interface SpellCheckIssue {
    type: IssueType;
    section: string;
    field: string;
    text: string;
    suggestion: string;
    context: string;
    startIndex: number;
    endIndex: number;
    severity: 'high' | 'medium' | 'low';
}

export interface SpellCheckResult {
    issues: SpellCheckIssue[];
    total: number;
    byType: Record<string, number>;
    bySection: Record<string, number>;
    score: number;
}

// ─── Dictionary of common English words (resume-relevant) ───
const DICTIONARY = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
    'as', 'is', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'must', 'are', 'am',
    'it', 'its', 'it\'s', 'itself', 'this', 'that', 'these', 'those', 'we', 'our', 'us', 'they',
    'them', 'their', 'theirs', 'themselves', 'he', 'him', 'his', 'she', 'her', 'hers', 'herself',
    'you', 'your', 'yours', 'yourself', 'i', 'me', 'my', 'mine', 'myself', 'who', 'whom', 'whose',
    'which', 'what', 'when', 'where', 'why', 'how', 'not', 'no', 'nor', 'never', 'none', 'nothing',
    'all', 'each', 'every', 'both', 'few', 'many', 'most', 'much', 'some', 'any', 'either', 'neither',
    'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'before', 'behind',
    'below', 'beneath', 'beside', 'between', 'beyond', 'during', 'except', 'inside', 'into',
    'near', 'off', 'onto', 'outside', 'over', 'through', 'throughout', 'toward', 'towards',
    'under', 'underneath', 'until', 'upon', 'within', 'without',
    'first', 'second', 'third', 'last', 'next', 'previous', 'final', 'initial', 'primary', 'secondary',
    'good', 'better', 'best', 'bad', 'worse', 'worst', 'more', 'less', 'most', 'least',
    'new', 'old', 'big', 'small', 'large', 'great', 'high', 'low', 'long', 'short', 'tall', 'wide',
    'deep', 'fast', 'slow', 'hard', 'soft', 'easy', 'difficult', 'simple', 'complex',
    'early', 'late', 'soon', 'ago', 'now', 'today', 'tomorrow', 'yesterday', 'always', 'never',
    'often', 'sometimes', 'rarely', 'usually', 'frequently', 'occasionally', 'regularly',
    'here', 'there', 'everywhere', 'somewhere', 'anywhere', 'nowhere',
    'very', 'too', 'quite', 'rather', 'pretty', 'almost', 'nearly', 'just', 'only', 'even',
    'also', 'too', 'as', 'well', 'yet', 'so', 'thus', 'hence', 'then', 'than', 'therefore',
    'however', 'nevertheless', 'nonetheless', 'still', 'though', 'although', 'even', 'while',
    'if', 'unless', 'since', 'because', 'so', 'therefore', 'thus', 'hence', 'accordingly',
    'but', 'yet', 'however', 'although', 'though', 'while', 'whereas', 'despite', 'spite',
    'like', 'unlike', 'similar', 'different', 'same', 'other', 'another', 'such', 'certain',
    'able', 'unable', 'possible', 'impossible', 'necessary', 'important', 'significant', 'vital',
    'successful', 'successful', 'success', 'succeed', 'failure', 'fail', 'achieve', 'achievement',
    'result', 'outcome', 'goal', 'objective', 'target', 'purpose', 'mission', 'vision',
    'quality', 'quantity', 'amount', 'number', 'total', 'average', 'median', 'maximum', 'minimum',
    'part', 'portion', 'section', 'segment', 'piece', 'component', 'element', 'factor', 'aspect',
    'system', 'process', 'method', 'approach', 'strategy', 'technique', 'procedure', 'practice',
    'plan', 'project', 'program', 'initiative', 'campaign', 'effort', 'operation', 'activity',
    'team', 'group', 'department', 'division', 'organization', 'company', 'firm', 'agency',
    'manager', 'director', 'supervisor', 'lead', 'leadership', 'management', 'administration',
    'develop', 'development', 'developer', 'build', 'builder', 'design', 'designer', 'create',
    'creator', 'creation', 'implement', 'implementation', 'launch', 'establish', 'found',
    'improve', 'improvement', 'enhance', 'enhancement', 'optimize', 'optimization', 'increase',
    'reduce', 'reduction', 'expand', 'expansion', 'grow', 'growth', 'scale', 'streamline',
    'deliver', 'delivery', 'provide', 'support', 'maintain', 'maintenance', 'manage', 'managed',
    'lead', 'led', 'guide', 'guide', 'direct', 'coordinate', 'cooperate', 'collaborate',
    'communicate', 'communication', 'present', 'presentation', 'report', 'reporting', 'analyze',
    'analysis', 'analytics', 'research', 'evaluate', 'evaluation', 'assess', 'assessment',
    'review', 'audit', 'inspect', 'test', 'testing', 'validate', 'validation', 'verify',
    'verification', 'monitor', 'track', 'measure', 'measurement', 'calculate', 'computation',
    'program', 'programming', 'software', 'hardware', 'system', 'network', 'database', 'server',
    'application', 'platform', 'infrastructure', 'architecture', 'framework', 'library', 'module',
    'code', 'coding', 'script', 'scripting', 'algorithm', 'data', 'information', 'technology',
    'digital', 'technical', 'technology', 'innovation', 'automation', 'artificial', 'intelligence',
    'machine', 'learning', 'cloud', 'computing', 'security', 'cybersecurity', 'privacy',
    'user', 'customer', 'client', 'stakeholder', 'partner', 'vendor', 'supplier',
    'revenue', 'profit', 'cost', 'budget', 'expense', 'saving', 'efficiency', 'productivity',
    'performance', 'quality', 'reliability', 'availability', 'stability', 'security',
    'strategy', 'planning', 'execution', 'operation', 'logistics', 'supply', 'chain',
    'market', 'marketing', 'sales', 'business', 'commerce', 'trade', 'industry', 'sector',
    'finance', 'financial', 'accounting', 'account', 'audit', 'tax', 'compliance', 'regulation',
    'legal', 'law', 'policy', 'procedure', 'standard', 'requirement', 'specification',
    'education', 'training', 'learning', 'teaching', 'instruction', 'curriculum', 'course',
    'degree', 'certification', 'diploma', 'bachelor', 'master', 'doctorate', 'phd',
    'experience', 'expertise', 'skill', 'ability', 'capability', 'competency', 'knowledge',
    'professional', 'profession', 'career', 'job', 'position', 'role', 'title', 'function',
    'responsibility', 'duty', 'task', 'assignment', 'project', 'initiative', 'program',
    'deadline', 'timeline', 'schedule', 'milestone', 'priority', 'workload', 'resource',
    'office', 'remote', 'hybrid', 'location', 'headquarters', 'branch', 'subsidiary',
    'volunteer', 'volunteering', 'internship', 'intern', 'apprentice', 'apprenticeship',
    'fellowship', 'scholarship', 'grant', 'award', 'honor', 'recognition', 'achievement',
    'accomplishment', 'milestone', 'breakthrough', 'innovation', 'patent', 'publication',
    'certification', 'license', 'credential', 'qualification', 'proficiency', 'fluency',
    'native', 'bilingual', 'multilingual', 'language', 'english', 'spanish', 'french', 'german',
    'chinese', 'japanese', 'korean', 'arabic', 'portuguese', 'russian', 'italian', 'dutch',
    'technology', 'software', 'hardware', 'database', 'network', 'server', 'cloud', 'api',
    'frontend', 'backend', 'fullstack', 'mobile', 'web', 'desktop', 'embedded', 'devops',
    'agile', 'scrum', 'kanban', 'waterfall', 'lean', 'sprint', 'backlog', 'standup',
    'jira', 'confluence', 'git', 'github', 'gitlab', 'docker', 'kubernetes', 'jenkins',
    'aws', 'azure', 'gcp', 'terraform', 'ansible', 'puppet', 'chef', 'monitoring',
    'javascript', 'typescript', 'python', 'java', 'cplusplus', 'csharp', 'ruby', 'php',
    'swift', 'kotlin', 'go', 'rust', 'scala', 'perl', 'shell', 'sql', 'nosql',
    'react', 'angular', 'vue', 'svelte', 'nextjs', 'nodejs', 'express', 'django', 'flask',
    'spring', 'rails', 'laravel', 'symfony', 'fastapi', 'graphql', 'rest', 'soap', 'grpc',
    'mongo', 'postgres', 'mysql', 'oracle', 'redis', 'elasticsearch', 'kafka', 'rabbitmq',
    'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'materialui', 'chakra', 'shadcn',
    'figma', 'sketch', 'photoshop', 'illustrator', 'aftereffects', 'premiere', 'blender',
    'excel', 'word', 'powerpoint', 'outlook', 'teams', 'slack', 'zoom', 'notion', 'asana',
    'trello', 'basecamp', 'monday', 'clickup', 'airtable', 'salesforce', 'hubspot', 'zendesk',
    'sap', 'oracle', 'workday', 'servicenow', 'snowflake', 'databricks', 'tableau', 'powerbi',
    'analytics', 'looker', 'mixpanel', 'amplitude', 'segment', 'stripe', 'paypal', 'square',
    'wordpress', 'shopify', 'magento', 'drupal', 'joomla', 'webflow', 'wix', 'squarespace',
    'seo', 'sem', 'ppc', 'crm', 'erp', 'hr', 'saas', 'paas', 'iaas', 'api', 'sdk', 'cli',
    'ui', 'ux', 'seo', 'a11y', 'i18n', 'l10n',
]);

// ─── Resume-specific weak language patterns ───
const WEAK_LANGUAGE_PATTERNS: { pattern: RegExp; suggestion: string }[] = [
    { pattern: /\b(?:responsible\s+for)\b/gi, suggestion: 'Use a strong action verb like "Managed", "Led", "Directed", "Owned"' },
    { pattern: /\b(?:duties\s+(?:included|involve|involved))\b/gi, suggestion: 'Use active voice: "Managed", "Developed", "Implemented" instead' },
    { pattern: /\b(?:tasks?\s+(?:included|involve|involved))\b/gi, suggestion: 'Lead with the accomplishment, not a list of tasks' },
    { pattern: /\b(?:helped\s+(?:to\s+)?(?:with|in|build|develop|create))\b/gi, suggestion: 'Use "Spearheaded", "Facilitated", "Contributed to" instead of "helped"' },
    { pattern: /\b(?:worked\s+on)\b/gi, suggestion: 'Use a specific action verb like "Developed", "Built", "Engineered"' },
    { pattern: /\b(?:was\s+(?:a|an|the|part\s+of|involved\s+in))\b/gi, suggestion: 'Use active voice. Start with a strong action verb.' },
    { pattern: /\b(?:was\s+responsible\s+for)\b/gi, suggestion: 'Replace with "Managed", "Directed", "Oversaw"' },
    { pattern: /\b(?:in\s+charge\s+of)\b/gi, suggestion: 'Use "Managed", "Led", "Directed"' },
    { pattern: /\b(?:worked\s+as\s+a)\b/gi, suggestion: 'Remove redundancy. State your role directly.' },
    { pattern: /\b(?:my\s+(?:role|responsibilities|duties)\s+(?:included|involved|was|were))\b/gi, suggestion: 'Lead with accomplishments, not role descriptions' },
];

// ─── Common grammar mistakes ───
const GRAMMAR_PATTERNS: { pattern: RegExp; suggestion: string }[] = [
    { pattern: /\byour\s+(?:[a-z]+\s+){0,3}(?:welcome|right|wrong|fault|turn)\b/i, suggestion: '"You\'re" (you are) may be correct here. Check context.' },
    { pattern: /\b([Tt])here\s+[a-z]+ing\b/i, suggestion: 'Check: Did you mean "Their" (possessive) or "They\'re" (they are)?' },
    { pattern: /\b[Ii]ts\s+(?:a\s+|an\s+)?(?:good|great|nice|better|best|new|important|significant)\b/i, suggestion: '"It\'s" (it is) needs an apostrophe for this context' },
    { pattern: /\b[Aa]ffect\s+(?:the|a|an|our|their|this|that|its|my|your)\b/i, suggestion: '"Effect" (noun) may be correct instead of "Affect" (verb)' },
    { pattern: /\b[Tt]hen\s+(?:he|she|it|they|we|the|a|an|i|you)\b/i, suggestion: '"Than" (comparison) may be correct instead of "Then" (time)' },
    { pattern: /\b[Aa]lot\b/i, suggestion: '"A lot" is two words' },
    { pattern: /\b[Cc]ould\s+of\b/i, suggestion: '"Could have" or "Could\'ve" instead of "Could of"' },
    { pattern: /\b[Ss]hould\s+of\b/i, suggestion: '"Should have" or "Should\'ve" instead of "Should of"' },
    { pattern: /\b[Ww]ould\s+of\b/i, suggestion: '"Would have" or "Would\'ve" instead of "Would of"' },
    { pattern: /\b[Mm]ight\s+of\b/i, suggestion: '"Might have" instead of "Might of"' },
    { pattern: /\b[Mm]ust\s+of\b/i, suggestion: '"Must have" instead of "Must of"' },
    { pattern: /\byoure\b/i, suggestion: '"You\'re" (you are) or "Your" (possessive)' },
    { pattern: /\bthier\b/i, suggestion: '"Their" (possessive)' },
    { pattern: /\bthats\b/i, suggestion: '"That\'s" (that is) with apostrophe' },
    { pattern: /\bdont\b/i, suggestion: '"Don\'t" with apostrophe' },
    { pattern: /\bdoesnt\b/i, suggestion: '"Doesn\'t" with apostrophe' },
    { pattern: /\bwont\b/i, suggestion: '"Won\'t" with apostrophe' },
    { pattern: /\bcouldnt\b/i, suggestion: '"Couldn\'t" with apostrophe' },
    { pattern: /\bwouldnt\b/i, suggestion: '"Wouldn\'t" with apostrophe' },
    { pattern: /\bshouldnt\b/i, suggestion: '"Shouldn\'t" with apostrophe' },
    { pattern: /\bhavent\b/i, suggestion: '"Haven\'t" with apostrophe' },
    { pattern: /\bhasnt\b/i, suggestion: '"Hasn\'t" with apostrophe' },
    { pattern: /\bwasnt\b/i, suggestion: '"Wasn\'t" with apostrophe' },
    { pattern: /\bwerent\b/i, suggestion: '"Weren\'t" with apostrophe' },
    { pattern: /\bim\b/i, suggestion: '"I\'m" (I am) with apostrophe' },
    { pattern: /\bhes\b/i, suggestion: '"He\'s" (he is) with apostrophe' },
    { pattern: /\bshes\b/i, suggestion: '"She\'s" (she is) with apostrophe' },
    { pattern: /\bits\s+(?:not|been|going|being|done|over|under)\b/i, suggestion: '"It\'s" (it is) with apostrophe' },
    { pattern: /\blets\b/i, suggestion: '"Let\'s" (let us) with apostrophe if used as contraction' },
];

// ─── Overused buzzwords in resumes ───
const BUZZWORDS: { word: string; suggestion: string }[] = [
    { word: 'synergy', suggestion: '"Collaboration", "Integration", "Alignment"' },
    { word: 'synergize', suggestion: '"Collaborate", "Integrate", "Align"' },
    { word: 'leverage', suggestion: '"Use", "Apply", "Utilize", "Harness"' },
    { word: 'utilize', suggestion: '"Use" (simpler, more direct)' },
    { word: 'utilization', suggestion: '"Use" or "Usage"' },
    { word: 'paradigm', suggestion: '"Model", "Framework", "Approach"' },
    { word: 'game-changer', suggestion: 'Show the impact with data instead of claiming it' },
    { word: 'rockstar', suggestion: '"Top performer", "Expert", "Senior"' },
    { word: 'ninja', suggestion: '"Expert", "Specialist", "Professional"' },
    { word: 'guru', suggestion: '"Expert", "Specialist", "Authority"' },
    { word: 'think outside the box', suggestion: 'Describe your creative approach specifically' },
    { word: 'deep dive', suggestion: '"Thoroughly analyzed", "Comprehensively reviewed"' },
    { word: 'drill down', suggestion: '"Detailed analysis", "In-depth review"' },
    { word: 'circle back', suggestion: '"Follow up", "Revisit", "Review"' },
    { word: 'touch base', suggestion: '"Connect", "Coordinate", "Align"' },
    { word: 'best of breed', suggestion: '"Industry-leading", "Top-tier", "Best-in-class"' },
    { word: 'bleeding edge', suggestion: '"Cutting-edge", "Innovative", "Advanced"' },
    { word: 'low-hanging fruit', suggestion: '"Quick wins", "High-impact opportunities"' },
    { word: 'take it offline', suggestion: '"Discuss separately", "Address later"' },
    { word: 'ping', suggestion: '"Contact", "Message", "Notify"' },
    { word: 'bandwidth', suggestion: '"Capacity", "Availability", "Resources"' },
    { word: 'boil the ocean', suggestion: 'Remove this cliché entirely' },
    { word: 'move the needle', suggestion: 'Show the actual impact or metric' },
    { word: 'on the same page', suggestion: '"Aligned", "In agreement"' },
];

// ─── Common misspellings (word -> correction) ───
const COMMON_MISSPELLINGS: Record<string, string> = {
    'acheive': 'achieve',
    'acheived': 'achieved',
    'acheivement': 'achievement',
    'acheivements': 'achievements',
    'accomodate': 'accommodate',
    'accomodated': 'accommodated',
    'accomodation': 'accommodation',
    'accomodations': 'accommodations',
    'acommodate': 'accommodate',
    'adress': 'address',
    'adressed': 'addressed',
    'alot': 'a lot',
    'apparant': 'apparent',
    'apparantly': 'apparently',
    'appartment': 'apartment',
    'aquire': 'acquire',
    'aquired': 'acquired',
    'asign': 'assign',
    'asigned': 'assigned',
    'asignment': 'assignment',
    'assistent': 'assistant',
    'becuase': 'because',
    'begining': 'beginning',
    'beleive': 'believe',
    'benifit': 'benefit',
    'benifits': 'benefits',
    'calender': 'calendar',
    'cancelled': 'canceled',
    'carrer': 'career',
    'catagory': 'category',
    'collaborate': 'collaborate',
    'comittee': 'committee',
    'commitee': 'committee',
    'commited': 'committed',
    'committment': 'commitment',
    'comunicate': 'communicate',
    'comunity': 'community',
    'competant': 'competent',
    'competance': 'competence',
    'concious': 'conscious',
    'consistant': 'consistent',
    'consistantly': 'consistently',
    'consious': 'conscious',
    'definately': 'definitely',
    'definitly': 'definitely',
    'delagate': 'delegate',
    'delagated': 'delegated',
    'dependant': 'dependent',
    'desicion': 'decision',
    'desision': 'decision',
    'determin': 'determine',
    'determing': 'determining',
    'develope': 'develop',
    'developement': 'development',
    'devide': 'divide',
    'disapear': 'disappear',
    'disipline': 'discipline',
    'dissapoint': 'disappoint',
    'dissapear': 'disappear',
    'effecient': 'efficient',
    'effeciently': 'efficiently',
    'embarass': 'embarrass',
    'enviroment': 'environment',
    'enviromental': 'environmental',
    'esential': 'essential',
    'esentially': 'essentially',
    'exellent': 'excellent',
    'excellant': 'excellent',
    'existance': 'existence',
    'expence': 'expense',
    'experiance': 'experience',
    'experianced': 'experienced',
    'experienc': 'experience',
    'expertise': 'expertise',
    'faciliate': 'facilitate',
    'facillitate': 'facilitate',
    'familiarise': 'familiarize',
    'finalise': 'finalize',
    'finalised': 'finalized',
    'flexability': 'flexibility',
    'forcast': 'forecast',
    'forcasting': 'forecasting',
    'forsee': 'foresee',
    'forthcoming': 'forthcoming',
    'fufill': 'fulfill',
    'fulfil': 'fulfill',
    'goverment': 'government',
    'govermental': 'governmental',
    'gurantee': 'guarantee',
    'harrass': 'harass',
    'harrasment': 'harassment',
    'honory': 'honorary',
    'hypothosis': 'hypothesis',
    'illistrate': 'illustrate',
    'immitate': 'imitate',
    'implemention': 'implementation',
    'independant': 'independent',
    'independance': 'independence',
    'infastructure': 'infrastructure',
    'initiave': 'initiative',
    'inititive': 'initiative',
    'inoculate': 'inoculate',
    'instal': 'install',
    'instalment': 'installment',
    'integrat': 'integrate',
    'integraton': 'integration',
    'intelectual': 'intellectual',
    'inteligence': 'intelligence',
    'intrest': 'interest',
    'intrested': 'interested',
    'introducted': 'introduced',
    'intuative': 'intuitive',
    'irregardless': 'regardless',
    'jepardy': 'jeopardy',
    'knowlege': 'knowledge',
    'knowlegeable': 'knowledgeable',
    'lason': 'liaison',
    'libary': 'library',
    'licence': 'license',
    'liesure': 'leisure',
    'maintainance': 'maintenance',
    'maintenence': 'maintenance',
    'manageable': 'manageable',
    'managment': 'management',
    'manuever': 'maneuver',
    'manuevered': 'maneuvered',
    'milage': 'mileage',
    'millenium': 'millennium',
    'miniscule': 'minuscule',
    'mischievous': 'mischievous',
    'mispell': 'misspell',
    'misunderstanding': 'misunderstanding',
    'momentous': 'momentous',
    'moniter': 'monitor',
    'monitered': 'monitored',
    'monitering': 'monitoring',
    'motivation': 'motivation',
    'neccessary': 'necessary',
    'necesary': 'necessary',
    'negotiate': 'negotiate',
    'noticable': 'noticeable',
    'noticably': 'noticeably',
    'occassion': 'occasion',
    'occasional': 'occasional',
    'occassionally': 'occasionally',
    'occured': 'occurred',
    'occurance': 'occurrence',
    'ocurrence': 'occurrence',
    'officer': 'officer',
    'operational': 'operational',
    'oppertunity': 'opportunity',
    'oppotunity': 'opportunity',
    'opprotunity': 'opportunity',
    'orginization': 'organization',
    'orginize': 'organize',
    'original': 'original',
    'outstanding': 'outstanding',
    'paralel': 'parallel',
    'parrallel': 'parallel',
    'particular': 'particular',
    'particullary': 'particularly',
    'pavillion': 'pavilion',
    'percieve': 'perceive',
    'permenant': 'permanent',
    'permenantly': 'permanently',
    'personal': 'personal',
    'personel': 'personnel',
    'persuade': 'persuade',
    'phenomenon': 'phenomenon',
    'pioneer': 'pioneer',
    'polemic': 'polemic',
    'politican': 'politician',
    'portray': 'portray',
    'posession': 'possession',
    'practically': 'practically',
    'practise': 'practice',
    'preceeding': 'preceding',
    'prefered': 'preferred',
    'preferrence': 'preference',
    'preliminary': 'preliminary',
    'prescription': 'prescription',
    'prestiguous': 'prestigious',
    'prevalent': 'prevalent',
    'primative': 'primitive',
    'principal': 'principal',
    'principle': 'principle',
    'priveledge': 'privilege',
    'privelege': 'privilege',
    'privledge': 'privilege',
    'proactive': 'proactive',
    'probablly': 'probably',
    'procedures': 'procedures',
    'proffesion': 'profession',
    'proffesional': 'professional',
    'programing': 'programming',
    'progresse': 'progress',
    'prominant': 'prominent',
    'pronoce': 'pronounce',
    'pronounciation': 'pronunciation',
    'proposal': 'proposal',
    'prospect': 'prospect',
    'protaganist': 'protagonist',
    'protest': 'protest',
    'proved': 'proved',
    'province': 'province',
    'publically': 'publicly',
    'pursuade': 'persuade',
    'pursuit': 'pursuit',
    'qualifed': 'qualified',
    'quanity': 'quantity',
    'quarantee': 'guarantee',
    'quesion': 'question',
    'realise': 'realize',
    'reccommend': 'recommend',
    'receed': 'recede',
    'receive': 'receive',
    'recevied': 'received',
    'recognise': 'recognize',
    'recomend': 'recommend',
    'recomended': 'recommended',
    'reconize': 'recognize',
    'recruit': 'recruit',
    'referal': 'referral',
    'refered': 'referred',
    'reffer': 'refer',
    'refrence': 'reference',
    'relavent': 'relevant',
    'relevent': 'relevant',
    'religious': 'religious',
    'reluctant': 'reluctant',
    'remembrence': 'remembrance',
    'reminescent': 'reminiscent',
    'repitition': 'repetition',
    'representive': 'representative',
    'requir': 'require',
    'requirment': 'requirement',
    'resistence': 'resistance',
    'responsability': 'responsibility',
    'responsibile': 'responsible',
    'restaraunt': 'restaurant',
    'restuarant': 'restaurant',
    'resume': 'resume',
    'rehersal': 'rehearsal',
    'rhythm': 'rhythm',
    'sargent': 'sergeant',
    'scence': 'science',
    'seige': 'siege',
    'seperate': 'separate',
    'seperated': 'separated',
    'seperately': 'separately',
    'seperation': 'separation',
    'sergent': 'sergeant',
    'sophmore': 'sophomore',
    'speach': 'speech',
    'sponser': 'sponsor',
    'spontanous': 'spontaneous',
    'sponsered': 'sponsored',
    'starring': 'starring',
    'statment': 'statement',
    'stragedy': 'strategy',
    'stregnth': 'strength',
    'strenght': 'strength',
    'strentgh': 'strength',
    'stricly': 'strictly',
    'struggel': 'struggle',
    'stubborness': 'stubbornness',
    'subsiquent': 'subsequent',
    'subsidary': 'subsidiary',
    'substancial': 'substantial',
    'substantiate': 'substantiate',
    'suburb': 'suburb',
    'succeed': 'succeed',
    'succesful': 'successful',
    'successful': 'successful',
    'succesfully': 'successfully',
    'sucess': 'success',
    'sucessful': 'successful',
    'sucessfully': 'successfully',
    'sufficient': 'sufficient',
    'supercede': 'supersede',
    'superintendant': 'superintendent',
    'supose': 'suppose',
    'supposably': 'supposedly',
    'suppossed': 'supposed',
    'surelly': 'surely',
    'suround': 'surround',
    'surounded': 'surrounded',
    'surounding': 'surrounding',
    'surounds': 'surrounds',
    'surveillance': 'surveillance',
    'survival': 'survival',
    'susceptable': 'susceptible',
    'suspention': 'suspension',
    'swiming': 'swimming',
    'symetry': 'symmetry',
    'sypmathy': 'sympathy',
    'sytem': 'system',
    'tabel': 'table',
    'tailer': 'tailor',
    'targetted': 'targeted',
    'targetting': 'targeting',
    'techology': 'technology',
    'temperary': 'temporary',
    'temperarily': 'temporarily',
    'tendancy': 'tendency',
    'theatre': 'theater',
    'theif': 'thief',
    'theories': 'theories',
    'therapist': 'therapist',
    'therefor': 'therefore',
    'thier': 'their',
    'thourough': 'thorough',
    'thouroughly': 'thoroughly',
    'throughly': 'thoroughly',
    'timetable': 'schedule',
    'tolarence': 'tolerance',
    'tommorow': 'tomorrow',
    'tommorrow': 'tomorrow',
    'tounge': 'tongue',
    'tradgedy': 'tragedy',
    'truely': 'truly',
    'ubiquitous': 'ubiquitous',
    'unbeleivable': 'unbelievable',
    'unforetunately': 'unfortunately',
    'unfortunatly': 'unfortunately',
    'unisure': 'unsure',
    'unkown': 'unknown',
    'unneccesary': 'unnecessary',
    'unprecendented': 'unprecedented',
    'unrelentless': 'unrelenting',
    'unvaluable': 'invaluable',
    'update': 'update',
    'upgrade': 'upgrade',
    'ure': 'your/you\'re',
    'usefull': 'useful',
    'useless': 'useless',
    'usualy': 'usually',
    'utilise': 'utilize',
    'utillity': 'utility',
    'vacantion': 'vacation',
    'vacume': 'vacuum',
    'vegetarian': 'vegetarian',
    'vehical': 'vehicle',
    'vengence': 'vengeance',
    'verfication': 'verification',
    'verison': 'version',
    'versitile': 'versatile',
    'veteran': 'veteran',
    'vietnam': 'Vietnam',
    'vigorous': 'vigorous',
    'violate': 'violate',
    'violent': 'violent',
    'virtuous': 'virtuous',
    'visability': 'visibility',
    'visable': 'visible',
    'volcano': 'volcano',
    'volumne': 'volume',
    'volunter': 'volunteer',
    'volunteer': 'volunteer',
    'walfare': 'welfare',
    'warriror': 'warrior',
    'weild': 'wield',
    'welcomm': 'welcome',
    'wierd': 'weird',
    'willingess': 'willingness',
    'wintery': 'wintry',
    'withold': 'withhold',
    'writen': 'written',
    'writting': 'writing',
    'youseff': 'yourselves',
};

// ─── Passive voice helpers ───
const PASSIVE_INDICATORS = [
    /was\s+(?:assigned|informed|told|asked|given|sent|invited|selected|chosen|notified)/gi,
    /were\s+(?:assigned|informed|told|asked|given|sent|invited|selected|chosen|notified)/gi,
    /was\s+(?:considered|regarded|viewed|seen|thought|believed|expected|required)/gi,
    /was\s+(?:designed|developed|created|built|implemented|launched|established|founded)/gi,
    /was\s+(?:managed|led|directed|supervised|handled|coordinated|organized)/gi,
    /was\s+(?:responsible\s+for|charged\s+with|tasked\s+with|entrusted\s+with)/gi,
    /has\s+been\s+\w+(?:ed|en|t)\b/gi,
    /have\s+been\s+\w+(?:ed|en|t)\b/gi,
    /had\s+been\s+\w+(?:ed|en|t)\b/gi,
    /were\s+(?:able\s+to\s+)?\w+(?:ed|en|t)\s+by\b/gi,
    /\b(?:is|are)\s+\w+(?:ed|en|t)\s+by\b/gi,
];

// ─── Main check function ───

function checkSpelling(word: string): string | null {
    // Skip numbers, acronyms (all caps), very short words, URLs
    if (word.length <= 1) return null;
    if (/^\d+$/.test(word)) return null;
    if (/^[A-Z]{2,}$/.test(word)) return null;
    if (word.startsWith('http') || word.includes('.')) return null;
    if (word.includes('/') || word.includes('\\')) return null;

    const clean = word.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
    if (!clean || clean.length <= 1) return null;

    // Skip possessives and contractions that are in the dictionary
    if (DICTIONARY.has(clean)) return null;

    // Check common misspellings
    if (COMMON_MISSPELLINGS[clean]) {
        return COMMON_MISSPELLINGS[clean];
    }

    // Check if word with common suffix/prefix adjustments
    const adjustments = [
        clean, clean + 's', clean + 'ed', clean + 'ing', clean + 'er',
        clean + 'ly', clean + 'tion', clean + 'ment', clean + 'ness',
        clean.replace(/s$/, ''), clean.replace(/ed$/, ''), clean.replace(/ing$/, ''),
        clean.replace(/ly$/, ''), clean.replace(/tion$/, ''), clean.replace(/ment$/, ''),
        clean.replace(/ness$/, ''), clean.replace(/er$/, ''),
    ];

    for (const adj of adjustments) {
        if (DICTIONARY.has(adj)) return null;
    }

    // Don't flag proper nouns (capitalized in middle of text) or names
    if (/^[A-Z]/.test(clean)) return null;

    return null; // Don't flag unknown words as spelling errors — too many false positives
}

function findBuzzwords(text: string): SpellCheckIssue[] {
    const issues: SpellCheckIssue[] = [];
    const lower = text.toLowerCase();
    for (const { word, suggestion } of BUZZWORDS) {
        const idx = lower.indexOf(word.toLowerCase());
        if (idx !== -1) {
            issues.push({
                type: 'buzzword',
                section: '',
                field: '',
                text: word,
                suggestion: suggestion,
                context: text.substring(Math.max(0, idx - 30), idx + word.length + 30),
                startIndex: idx,
                endIndex: idx + word.length,
                severity: 'low',
            });
        }
    }
    return issues;
}

function findWeakLanguage(text: string): SpellCheckIssue[] {
    const issues: SpellCheckIssue[] = [];
    for (const { pattern, suggestion } of WEAK_LANGUAGE_PATTERNS) {
        let match: RegExpExecArray | null;
        const re = new RegExp(pattern.source, 'gi');
        while ((match = re.exec(text)) !== null) {
            issues.push({
                type: 'weak-language',
                section: '',
                field: '',
                text: match[0],
                suggestion,
                context: text.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30),
                startIndex: match.index,
                endIndex: match.index + match[0].length,
                severity: 'medium',
            });
        }
    }
    return issues;
}

function findGrammarIssues(text: string): SpellCheckIssue[] {
    const issues: SpellCheckIssue[] = [];
    for (const { pattern, suggestion } of GRAMMAR_PATTERNS) {
        let match: RegExpExecArray | null;
        const re = new RegExp(pattern.source, 'gi');
        while ((match = re.exec(text)) !== null) {
            issues.push({
                type: 'grammar',
                section: '',
                field: '',
                text: match[0],
                suggestion,
                context: text.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30),
                startIndex: match.index,
                endIndex: match.index + match[0].length,
                severity: 'high',
            });
        }
    }
    return issues;
}

function findSpellingIssues(text: string): SpellCheckIssue[] {
    const issues: SpellCheckIssue[] = [];
    const words = text.split(/\s+/);
    let charIndex = 0;

    for (const word of words) {
        const suggestion = checkSpelling(word);
        if (suggestion) {
            issues.push({
                type: 'spelling',
                section: '',
                field: '',
                text: word,
                suggestion,
                context: text.substring(Math.max(0, charIndex - 20), Math.min(text.length, charIndex + word.length + 20)),
                startIndex: charIndex,
                endIndex: charIndex + word.length,
                severity: 'high',
            });
        }
        charIndex += word.length + 1; // +1 for the space
    }

    return issues;
}

function findPassiveVoice(text: string): SpellCheckIssue[] {
    const issues: SpellCheckIssue[] = [];
    for (const pattern of PASSIVE_INDICATORS) {
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(text)) !== null) {
            issues.push({
                type: 'passive-voice',
                section: '',
                field: '',
                text: match[0],
                suggestion: 'Use active voice. Put the subject before the verb.',
                context: text.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30),
                startIndex: match.index,
                endIndex: match.index + match[0].length,
                severity: 'medium',
            });
        }
    }
    return issues;
}

function tagIssues(issues: SpellCheckIssue[], section: string, field: string): SpellCheckIssue[] {
    return issues.map(i => ({ ...i, section, field }));
}

// ─── Text extraction helpers ───

function getAllBulletText(formData: FormData): { text: string; idx: number; field: string }[] {
    const bullets: { text: string; idx: number; field: string }[] = [];
    const exps = formData.experiences || [];
    exps.forEach((exp: any, i: number) => {
        if (exp.description?.trim()) {
            const lines = exp.description.split('\n').filter((l: string) => l.trim());
            lines.forEach((line: string) => {
                bullets.push({ text: line.trim(), idx: bullets.length, field: `experience_${i}` });
            });
        }
    });
    return bullets;
}

function getAllProjectText(formData: FormData): { text: string; idx: number; field: string }[] {
    const items: { text: string; idx: number; field: string }[] = [];
    const projects = formData.projects || [];
    projects.forEach((proj: any, i: number) => {
        if (proj.description?.trim()) {
            items.push({ text: proj.description.trim(), idx: items.length, field: `project_${i}` });
        }
    });
    return items;
}

// ─── Main export function ───

export function checkResumeText(formData: FormData): SpellCheckResult {
    const allIssues: SpellCheckIssue[] = [];

    // Check summary
    if (formData.summary?.trim()) {
        const text = formData.summary;
        allIssues.push(...tagIssues(findGrammarIssues(text), 'summary', 'summary'));
        allIssues.push(...tagIssues(findSpellingIssues(text), 'summary', 'summary'));
        allIssues.push(...tagIssues(findWeakLanguage(text), 'summary', 'summary'));
        allIssues.push(...tagIssues(findPassiveVoice(text), 'summary', 'summary'));
        allIssues.push(...tagIssues(findBuzzwords(text), 'summary', 'summary'));
    }

    // Check experience bullets
    const bullets = getAllBulletText(formData);
    for (const bullet of bullets) {
        allIssues.push(...tagIssues(findGrammarIssues(bullet.text), `experience_${bullet.idx}`, bullet.field));
        allIssues.push(...tagIssues(findSpellingIssues(bullet.text), `experience_${bullet.idx}`, bullet.field));
        allIssues.push(...tagIssues(findWeakLanguage(bullet.text), `experience_${bullet.idx}`, bullet.field));
        allIssues.push(...tagIssues(findPassiveVoice(bullet.text), `experience_${bullet.idx}`, bullet.field));
        allIssues.push(...tagIssues(findBuzzwords(bullet.text), `experience_${bullet.idx}`, bullet.field));
    }

    // Check projects
    const projectTexts = getAllProjectText(formData);
    for (const proj of projectTexts) {
        allIssues.push(...tagIssues(findGrammarIssues(proj.text), `project_${proj.idx}`, proj.field));
        allIssues.push(...tagIssues(findSpellingIssues(proj.text), `project_${proj.idx}`, proj.field));
        allIssues.push(...tagIssues(findWeakLanguage(proj.text), `project_${proj.idx}`, proj.field));
    }

    // Check education descriptions
    const edus = formData.educations || [];
    edus.forEach((edu: any, i: number) => {
        if (edu.description?.trim()) {
            allIssues.push(...tagIssues(findGrammarIssues(edu.description), `education_${i}`, `education_${i}`));
            allIssues.push(...tagIssues(findSpellingIssues(edu.description), `education_${i}`, `education_${i}`));
        }
    });

    // Check achievements
    const achievements = formData.achievements || [];
    achievements.forEach((ach: any, i: number) => {
        if (ach.title?.trim()) {
            allIssues.push(...tagIssues(findSpellingIssues(ach.title), `achievement_${i}`, `achievement_${i}`));
        }
        if (ach.description?.trim()) {
            allIssues.push(...tagIssues(findSpellingIssues(ach.description), `achievement_${i}`, `achievement_${i}`));
        }
    });

    // Calculate stats
    const byType: Record<string, number> = {};
    const bySection: Record<string, number> = {};
    allIssues.forEach(issue => {
        byType[issue.type] = (byType[issue.type] || 0) + 1;
        const section = issue.section.startsWith('experience') ? 'experience' :
                        issue.section.startsWith('project') ? 'projects' :
                        issue.section.startsWith('education') ? 'education' :
                        issue.section.startsWith('achievement') ? 'achievements' : issue.section;
        bySection[section] = (bySection[section] || 0) + 1;
    });

    // Calculate score (deduct from 100)
    const deductions: Record<string, number> = {
        'spelling': 5,
        'grammar': 4,
        'weak-language': 2,
        'passive-voice': 1,
        'buzzword': 1,
    };
    let score = 100;
    allIssues.forEach(issue => {
        const deduction = deductions[issue.type] || 1;
        if (issue.severity === 'high') score -= deduction;
        else if (issue.severity === 'medium') score -= deduction * 0.6;
        else score -= deduction * 0.3;
    });
    score = Math.max(0, Math.round(score));

    return {
        issues: allIssues,
        total: allIssues.length,
        byType,
        bySection,
        score
    };
}
