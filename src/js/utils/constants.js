/**
 * Application Constants
 * All constant values and configuration for the Get Fluent Now app
 */

// Language display names mapping (all well-supported by Gemini API)
export const languageNames = {
    'Spanish': 'español',
    'French': 'français',
    'Italian': 'italiano',
    'German': 'Deutsch',
    'Portuguese': 'português',
    'Dutch': 'Nederlands',
    'Russian': 'русский',
    'Japanese': '日本語',
    'Korean': '한국어',
    'Chinese (Simplified)': '中文 (简体)',
    'Arabic': 'العربية',
    'English': 'English'
};

// Available Gemini models with their API endpoints
export const geminiModels = {
    'flash-lite': 'gemini-2.5-flash-lite-preview-06-17',
    'flash': 'gemini-2.5-flash',
    'pro': 'gemini-1.5-pro-latest'
};

// Story theme prompts and variations
export const storyVariants = {
    'daily_life': [
        'morning routine', 'grocery shopping', 'commuting to work', 'weekend activities',
        'cooking dinner', 'cleaning house', 'watching TV', 'reading a book'
    ],
    'travel': [
        'booking a hotel', 'at the airport', 'ordering food abroad', 'asking for directions',
        'visiting museums', 'taking photos', 'meeting locals', 'exploring markets'
    ],
    'food': [
        'cooking a meal', 'restaurant dining', 'street food adventure', 'baking desserts',
        'farmers market visit', 'wine tasting', 'cooking with friends', 'trying new recipes'
    ],
    'friendship': [
        'making new friends', 'planning together', 'helping each other', 'celebrating birthdays',
        'weekend hangouts', 'sharing secrets', 'group activities', 'supporting friends'
    ],
    'work': [
        'job interview', 'team meeting', 'office lunch', 'project deadline',
        'networking event', 'presentation day', 'remote working', 'career change'
    ],
    'shopping': [
        'clothing store visit', 'electronics shopping', 'market bargaining', 'online ordering',
        'gift buying', 'window shopping', 'sales hunting', 'returning items'
    ],
    'health': [
        'doctor visit', 'gym workout', 'healthy cooking', 'wellness routine',
        'mental health care', 'medical checkup', 'fitness goals', 'stress management'
    ],
    'hobbies': [
        'learning instrument', 'painting class', 'sports practice', 'reading club',
        'photography walk', 'gardening time', 'crafting project', 'game night'
    ],
    'family': [
        'family dinner', 'holiday gathering', 'helping parents', 'children playing',
        'family vacation', 'visiting relatives', 'family traditions', 'home projects'
    ],
    'nature': [
        'hiking adventure', 'beach day', 'camping trip', 'garden work',
        'wildlife watching', 'mountain climbing', 'river rafting', 'nature photography'
    ],
    'technology': [
        'learning new app', 'video call', 'social media', 'online learning',
        'tech support', 'digital payments', 'smart home', 'cybersecurity'
    ],
    'education': [
        'language class', 'study group', 'exam preparation', 'university life',
        'skill development', 'online courses', 'library research', 'tutoring session'
    ]
};

// Detailed CEFR level specifications for story generation
export const cefrSpecs = {
    a1: {
        description: "Complete beginner level",
        vocabulary: "High frequency words (most common 1000-1500 words), basic nouns, verbs, adjectives. Family, numbers, colors, food, body parts, basic activities (eat, sleep, work, study)",
        grammar: "Present tense, simple past, basic sentence structures, no subordinate clauses. Simple subject-verb-object patterns only",
        sentences: "Very short sentences (5-8 words average), simple subject-verb-object structure", 
        complexity: "Single ideas per sentence, no complex connections between ideas, concrete and immediate situations only"
    },
    a2: {
        description: "Elementary level",
        vocabulary: "Common words (2000-2500 words), routine activities, personal information, basic emotions, simple descriptions",
        grammar: "Present, past, future tenses, basic modal verbs (can, must, should), simple conditionals",
        sentences: "Short sentences (8-12 words), some compound sentences with 'and', 'but', 'or'",
        complexity: "Simple connections between ideas, familiar topics, basic cause and effect"
    },
    b1: {
        description: "Intermediate level", 
        vocabulary: "Extended vocabulary (3000-4000 words), abstract concepts, opinions, experiences",
        grammar: "All major tenses, conditional sentences, passive voice, relative clauses",
        sentences: "Medium length sentences (12-18 words), complex sentences with subordinate clauses",
        complexity: "Clear connections between ideas, arguments, hypothetical situations, past experiences"
    },
    b2: {
        description: "Upper intermediate level",
        vocabulary: "Wide vocabulary (4000-6000 words), specialized terms, nuanced expressions",
        grammar: "Advanced structures, subjunctive mood, complex conditionals, advanced passive constructions",
        sentences: "Longer sentences (15-25 words), sophisticated linking, varied sentence structures",
        complexity: "Abstract ideas, detailed arguments, implicit meanings, cultural references"
    },
    c1: {
        description: "Advanced level",
        vocabulary: "Extensive vocabulary (6000+ words), idiomatic expressions, sophisticated academic and professional terms",
        grammar: "All grammatical structures, subtle distinctions, stylistic variations",
        sentences: "Complex sentences (20+ words), sophisticated discourse markers, varied rhetorical devices",
        complexity: "Nuanced arguments, cultural subtleties, implicit criticism or praise, sophisticated humor"
    }
};

// Default application settings
export const DEFAULT_SETTINGS = {
    sourceLanguage: 'Spanish',
    targetLanguage: 'English', 
    difficulty: 'A1',
    theme: 'daily_life',
    model: 'flash-lite'
};