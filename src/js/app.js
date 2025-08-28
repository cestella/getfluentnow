import { GeminiAPI } from './api/gemini.js';
import { TranslationManager } from './features/translation.js';
import { ChatManager } from './features/chat.js';
import { getStoryParams, getRandomVariant } from './utils/story-generator.js';
import { languageNames, DEFAULT_SETTINGS } from './utils/constants.js';

/**
 * Main application class for Get Fluent Now language learning app
 */
class LanguageLearningApp {
    constructor() {
        this.currentStory = null;
        this.currentSentences = [];
        this.sourceLanguage = DEFAULT_SETTINGS.sourceLanguage;
        this.targetLanguage = DEFAULT_SETTINGS.targetLanguage;
        this.apiKey = null;
        this.selectedModel = DEFAULT_SETTINGS.model;
        
        // Initialize API and feature managers
        this.geminiAPI = null;
        this.translationManager = null;
        this.chatManager = null;
    }

    /**
     * Initialize the application
     */
    async initialize() {
        console.log('🚀 Initializing Get Fluent Now App...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize API configuration UI
        this.initializeApiConfig();
        
        // Check for stored API key and auto-validate
        const storedApiKey = localStorage.getItem('gemini_api_key');
        if (storedApiKey) {
            document.getElementById('gemini-api-key').value = storedApiKey;
            await this.validateApiKey();
        } else {
            this.updateStatus('🔑 Please enter your Gemini API key to enable AI features');
        }
        
        // Load saved user preferences
        this.loadUserPreferences();
        
        // Show app controls
        document.getElementById('app-controls').style.display = 'block';
        
        // Initialize theme selector behavior
        this.initializeThemeSelector();
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Theme selector
        const themeSelect = document.getElementById('story-theme');
        if (themeSelect) {
            themeSelect.addEventListener('change', () => {
                this.handleThemeChange();
                this.saveUserPreferences();
            });
        }

        // Difficulty level selector
        const difficultySelect = document.getElementById('difficulty-level');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', () => this.saveUserPreferences());
        }

        // Chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => this.handleChatKeyPress(e));
        }

        // Language selectors
        const sourceLang = document.getElementById('source-lang');
        const targetLang = document.getElementById('target-lang');
        if (sourceLang) sourceLang.addEventListener('change', () => this.updateLanguages());
        if (targetLang) targetLang.addEventListener('change', () => this.updateLanguages());

        // Model radio buttons
        const modelRadios = document.querySelectorAll('input[name="model"]');
        modelRadios.forEach(radio => {
            radio.addEventListener('change', () => this.updateModel());
        });
    }

    /**
     * Initialize API configuration UI
     */
    initializeApiConfig() {
        // Check if API key exists and auto-collapse if configured
        const storedApiKey = localStorage.getItem('gemini_api_key');
        if (storedApiKey) {
            this.updateApiConfigStatus(true, false); // configured, collapsed
        } else {
            this.updateApiConfigStatus(false, true); // not configured, expanded
        }
    }

    /**
     * Toggle API configuration section
     */
    toggleApiSection() {
        const header = document.getElementById('api-header');
        const content = document.getElementById('api-content');
        const icon = document.getElementById('api-toggle-icon');
        
        if (!header || !content || !icon) return;
        
        const isExpanded = content.classList.contains('expanded');
        
        if (isExpanded) {
            // Collapse
            content.classList.remove('expanded');
            header.classList.add('collapsed');
            icon.textContent = '▶';
        } else {
            // Expand
            content.classList.add('expanded');
            header.classList.remove('collapsed');
            icon.textContent = '▼';
        }
    }

    /**
     * Update API configuration status indicator
     */
    updateApiConfigStatus(isConfigured, forceExpanded = false) {
        const indicator = document.getElementById('api-status-indicator');
        const headerText = document.getElementById('api-header-text');
        const content = document.getElementById('api-content');
        const header = document.getElementById('api-header');
        const icon = document.getElementById('api-toggle-icon');
        
        if (!indicator || !headerText || !content || !header || !icon) return;
        
        if (isConfigured) {
            indicator.classList.remove('required');
            indicator.classList.add('configured');
            indicator.textContent = '✅';
            headerText.textContent = 'API Configuration (Ready)';
            
            // Auto-collapse unless forced to expand
            if (!forceExpanded) {
                content.classList.remove('expanded');
                header.classList.add('collapsed');
                icon.textContent = '▶';
            }
        } else {
            indicator.classList.remove('configured');
            indicator.classList.add('required');
            indicator.textContent = '🔑';
            headerText.textContent = 'API Configuration (Required)';
            
            // Keep expanded when not configured
            content.classList.add('expanded');
            header.classList.remove('collapsed');
            icon.textContent = '▼';
        }
    }

    /**
     * Initialize theme selector behavior
     */
    initializeThemeSelector() {
        const themeSelect = document.getElementById('story-theme');
        const customContainer = document.getElementById('custom-theme-container');
        
        if (themeSelect && customContainer) {
            // Set initial state
            customContainer.style.display = themeSelect.value === 'custom' ? 'block' : 'none';
        }
    }

    /**
     * Update status message
     */
    updateStatus(message) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    /**
     * Validate the API key
     */
    async validateApiKey() {
        const keyInput = document.getElementById('gemini-api-key');
        if (!keyInput) return;

        const apiKey = keyInput.value.trim();
        if (!apiKey) {
            this.updateStatus('❌ Please enter your Gemini API key');
            return;
        }

        this.updateStatus('🔄 Validating API key...');

        try {
            // Create temporary API instance for validation
            const tempAPI = new GeminiAPI(apiKey, this.selectedModel);
            const result = await tempAPI.validateApiKey();

            if (result.valid) {
                this.apiKey = apiKey;
                localStorage.setItem('gemini_api_key', apiKey);
                
                // Initialize API and managers
                this.geminiAPI = tempAPI;
                this.translationManager = new TranslationManager(this.geminiAPI);
                this.chatManager = new ChatManager(this.geminiAPI);
                this.chatManager.initializeChat();
                
                // Update configuration status to configured
                this.updateApiConfigStatus(true);
                
                this.updateStatus('✅ API key validated! Ready to generate stories');
            } else {
                this.updateStatus(`❌ ${result.error}`);
                this.updateApiConfigStatus(false, true); // Keep expanded on error
            }
        } catch (error) {
            console.error('API validation error:', error);
            this.updateStatus('❌ Failed to validate API key');
        }
    }

    /**
     * Update the selected model
     */
    updateModel() {
        const radioButtons = document.querySelectorAll('input[name="model"]');
        for (const radio of radioButtons) {
            if (radio.checked && this.geminiAPI) {
                this.selectedModel = radio.value;
                this.geminiAPI.setModel(this.selectedModel);
                break;
            }
        }
    }

    /**
     * Update language settings
     */
    updateLanguages() {
        const sourceLang = document.getElementById('source-lang');
        const targetLang = document.getElementById('target-lang');
        
        if (sourceLang && targetLang) {
            this.sourceLanguage = sourceLang.value;
            this.targetLanguage = targetLang.value;
            
            // Save preferences
            this.saveUserPreferences();
            
            // Prevent same language selection
            if (this.sourceLanguage === this.targetLanguage) {
                this.updateStatus('⚠️ Source and target languages must be different');
                return;
            }
            
            // Update chat context if story exists
            if (this.currentStory && this.chatManager) {
                this.chatManager.updateContextWithStory(
                    this.currentStory, 
                    this.sourceLanguage, 
                    this.targetLanguage
                );
            }
        }
    }

    /**
     * Swap source and target languages
     */
    swapLanguages() {
        const sourceLang = document.getElementById('source-lang');
        const targetLang = document.getElementById('target-lang');
        
        if (sourceLang && targetLang) {
            const temp = sourceLang.value;
            sourceLang.value = targetLang.value;
            targetLang.value = temp;
            this.updateLanguages();
        }
    }

    /**
     * Handle theme selection changes
     */
    handleThemeChange() {
        const themeSelect = document.getElementById('story-theme');
        const customContainer = document.getElementById('custom-theme-container');
        
        if (themeSelect && customContainer) {
            const isCustom = themeSelect.value === 'custom';
            customContainer.style.display = isCustom ? 'block' : 'none';
            
            if (isCustom) {
                const customInput = document.getElementById('custom-theme-input');
                if (customInput) customInput.focus();
            }
        }
    }

    /**
     * Generate a new story
     */
    async generateStory() {
        if (!this.geminiAPI) {
            this.updateStatus('❌ Please validate your API key first');
            return;
        }

        const difficultySelect = document.getElementById('difficulty-level');
        const themeSelect = document.getElementById('story-theme');
        const customInput = document.getElementById('custom-theme-input');
        const storyOutput = document.getElementById('story-output');
        const generateBtn = document.getElementById('generate-story-btn');
        
        if (!difficultySelect || !themeSelect || !storyOutput || !generateBtn) return;

        const difficulty = difficultySelect.value;
        const theme = themeSelect.value;
        const customTheme = customInput ? customInput.value : null;

        try {
            // Update UI for generation state
            generateBtn.textContent = '⏳ Generating...';
            generateBtn.disabled = true;
            storyOutput.textContent = 'Generating your story...';
            this.updateStatus('✨ Generating story...');

            // Get story parameters
            const storyParams = getStoryParams(theme, customTheme);
            
            // Generate story as structured sentences
            const sentences = await this.geminiAPI.generateStructuredStory(
                languageNames[this.sourceLanguage],
                difficulty,
                storyParams.theme,
                storyParams.variant
            );

            // Update UI with generated story
            this.currentStory = sentences.join(' ');
            this.currentSentences = sentences;
            storyOutput.textContent = this.currentStory;
            storyOutput.classList.add('has-content');
            
            // Enable translation section with sentences
            this.translationManager.setCurrentSentences(sentences);
            this.translationManager.showTranslationSection();
            
            // Update chat context
            this.chatManager.updateContextWithStory(this.currentStory, this.sourceLanguage, this.targetLanguage);
            
            this.updateStatus('✅ Story generated! Translate it to practice');

        } catch (error) {
            console.error('Story generation error:', error);
            this.updateStatus('❌ Failed to generate story');
            storyOutput.textContent = `Error: ${error.message}`;
        } finally {
            // Reset button state
            generateBtn.textContent = '✨ Generate New Story';
            generateBtn.disabled = false;
        }
    }

    /**
     * Submit translation for feedback
     */
    async submitTranslation() {
        if (!this.translationManager) {
            this.updateStatus('❌ Translation manager not initialized');
            return;
        }

        const input = document.getElementById('translation-input');
        const submitBtn = document.getElementById('submit-translation-btn');
        const feedbackOutput = document.getElementById('feedback-output');
        const miniLessonBtn = document.getElementById('mini-lesson-btn');
        
        if (!input || !submitBtn || !feedbackOutput) return;

        const userTranslation = input.value.trim();
        
        try {
            // Update UI for processing state
            submitBtn.textContent = '⏳ Getting feedback...';
            submitBtn.disabled = true;
            feedbackOutput.textContent = 'Analyzing your translation...';
            this.updateStatus('🔍 Analyzing your translation...');

            // Process translation
            const result = await this.translationManager.processTranslation(
                userTranslation, 
                this.sourceLanguage, 
                this.targetLanguage
            );

            // Display feedback
            this.translationManager.displayFeedback(feedbackOutput, result);
            
            // Show mini lesson button
            if (miniLessonBtn) {
                miniLessonBtn.style.display = 'inline-block';
            }
            
            this.updateStatus('✅ Feedback provided! Check your translation');

        } catch (error) {
            console.error('Translation submission error:', error);
            this.updateStatus('❌ Failed to process translation');
            feedbackOutput.textContent = `Error: ${error.message}`;
        } finally {
            // Reset button state
            submitBtn.textContent = '🎯 Get Feedback';
            submitBtn.disabled = false;
        }
    }

    /**
     * Submit sentence-by-sentence translations for feedback
     */
    async submitSentenceTranslations() {
        if (!this.translationManager) {
            this.updateStatus('❌ Translation manager not initialized');
            return;
        }

        const submitBtn = document.getElementById('submit-translation-btn');
        const feedbackOutput = document.getElementById('feedback-output');
        const miniLessonBtn = document.getElementById('mini-lesson-btn');
        
        if (!submitBtn || !feedbackOutput) return;

        try {
            // Update UI for processing state
            submitBtn.textContent = '⏳ Getting feedback...';
            submitBtn.disabled = true;
            feedbackOutput.textContent = 'Analyzing your translations...';
            this.updateStatus('🔍 Analyzing your translations...');

            // Process sentence translations
            const result = await this.translationManager.processSentenceTranslations(
                this.sourceLanguage, 
                this.targetLanguage
            );

            // Display sentence feedback
            this.translationManager.displaySentenceFeedback(feedbackOutput, result);
            
            // Show mini lesson button
            if (miniLessonBtn) {
                miniLessonBtn.style.display = 'inline-block';
            }
            
            this.updateStatus('✅ Feedback provided! Check your translations');

        } catch (error) {
            console.error('Sentence translation submission error:', error);
            this.updateStatus('❌ Failed to process translations');
            feedbackOutput.textContent = `Error: ${error.message}`;
        } finally {
            // Reset button state
            submitBtn.textContent = '🎯 Get Feedback';
            submitBtn.disabled = false;
        }
    }

    /**
     * Generate mini lesson
     */
    async generateMiniLesson() {
        if (!this.translationManager) return;

        const miniLessonBtn = document.getElementById('mini-lesson-btn');
        
        // Collect all user translations from sentence inputs
        const userTranslations = [];
        if (this.currentSentences && this.currentSentences.length > 0) {
            for (let i = 0; i < this.currentSentences.length; i++) {
                const input = document.getElementById(`sentence-translation-${i}`);
                if (input && input.value.trim()) {
                    userTranslations.push({
                        original: this.currentSentences[i],
                        translation: input.value.trim()
                    });
                }
            }
        }

        if (userTranslations.length === 0) {
            this.updateStatus('❌ Please translate at least one sentence first');
            return;
        }
        
        try {
            // Update button state
            if (miniLessonBtn) {
                miniLessonBtn.textContent = '⏳ Creating lesson...';
                miniLessonBtn.disabled = true;
            }
            this.updateStatus('📚 Creating personalized lesson...');

            // Generate lesson based on sentence translations
            const lesson = await this.translationManager.generateSentenceMiniLesson(
                userTranslations,
                this.sourceLanguage, 
                this.targetLanguage
            );

            // Display lesson
            this.translationManager.displayMiniLesson(lesson);
            this.updateStatus('✅ Mini lesson ready!');

        } catch (error) {
            console.error('Mini lesson error:', error);
            this.updateStatus('❌ Failed to generate lesson');
        } finally {
            // Reset button state
            if (miniLessonBtn) {
                miniLessonBtn.textContent = '📚 Mini Lesson';
                miniLessonBtn.disabled = false;
            }
        }
    }

    /**
     * Toggle chat widget
     */
    toggleChat() {
        if (this.chatManager) {
            this.chatManager.toggleChat();
        }
    }

    /**
     * Send chat message
     */
    async sendChatMessage() {
        if (!this.chatManager) return;

        const input = document.getElementById('chat-input');
        if (input) {
            await this.chatManager.sendMessage(input.value);
        }
    }

    /**
     * Handle chat key press events
     */
    handleChatKeyPress(event) {
        if (this.chatManager) {
            this.chatManager.handleKeyPress(event);
        }
    }

    /**
     * Minimize/restore chat widget
     */
    minimizeChat() {
        const container = document.getElementById('chat-container');
        if (container) {
            container.classList.toggle('minimized');
            const minimizeBtn = document.getElementById('chat-minimize');
            if (minimizeBtn) {
                minimizeBtn.textContent = container.classList.contains('minimized') ? '□' : '−';
                minimizeBtn.title = container.classList.contains('minimized') ? 'Restore' : 'Minimize';
            }
        }
    }

    /**
     * Clear chat conversation
     */
    clearChat() {
        if (this.chatManager) {
            this.chatManager.clearChat();
            // Re-initialize with welcome message
            this.chatManager.initializeChat();
        }
    }

    /**
     * Show API help modal
     */
    showApiHelp() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Close API help modal
     */
    closeApiHelp() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Switch between feedback and lesson tabs
     */
    switchTab(tabName) {
        if (this.translationManager) {
            this.translationManager.switchTab(tabName);
        }
    }

    /**
     * Toggle exercise answer visibility
     */
    toggleExerciseAnswer(exerciseIndex) {
        const answerElement = document.getElementById(`exercise-answer-${exerciseIndex}`);
        const buttonElement = document.querySelector(`[onclick="app.toggleExerciseAnswer(${exerciseIndex})"]`);
        
        if (answerElement && buttonElement) {
            const isHidden = answerElement.style.display === 'none';
            answerElement.style.display = isHidden ? 'block' : 'none';
            buttonElement.textContent = isHidden ? 'Hide Answer' : 'Show Answer';
            buttonElement.classList.toggle('answer-shown', isHidden);
        }
    }

    /**
     * Toggle about menu dropdown
     */
    toggleAboutMenu() {
        const dropdown = document.getElementById('about-dropdown');
        if (dropdown) {
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
            
            // Close dropdown when clicking outside
            if (!isVisible) {
                setTimeout(() => {
                    document.addEventListener('click', this.closeAboutDropdown.bind(this), { once: true });
                }, 100);
            }
        }
    }

    /**
     * Close about dropdown
     */
    closeAboutDropdown(event) {
        const dropdown = document.getElementById('about-dropdown');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (dropdown && !dropdown.contains(event.target) && !hamburger.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    }

    /**
     * Show about modal
     */
    showAboutModal() {
        const modal = document.getElementById('about-modal');
        const dropdown = document.getElementById('about-dropdown');
        
        if (modal) {
            modal.style.display = 'flex';
        }
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    /**
     * Close about modal
     */
    closeAboutModal() {
        const modal = document.getElementById('about-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Save user preferences to localStorage
     */
    saveUserPreferences() {
        const preferences = {
            sourceLanguage: this.sourceLanguage,
            targetLanguage: this.targetLanguage,
            difficultyLevel: document.getElementById('difficulty-level')?.value || DEFAULT_SETTINGS.difficulty,
            theme: document.getElementById('story-theme')?.value || DEFAULT_SETTINGS.theme
        };
        
        localStorage.setItem('user_preferences', JSON.stringify(preferences));
    }

    /**
     * Load user preferences from localStorage
     */
    loadUserPreferences() {
        try {
            const stored = localStorage.getItem('user_preferences');
            if (!stored) return;
            
            const preferences = JSON.parse(stored);
            
            // Restore language selections
            const sourceLang = document.getElementById('source-lang');
            const targetLang = document.getElementById('target-lang');
            if (sourceLang && preferences.sourceLanguage) {
                sourceLang.value = preferences.sourceLanguage;
                this.sourceLanguage = preferences.sourceLanguage;
            }
            if (targetLang && preferences.targetLanguage) {
                targetLang.value = preferences.targetLanguage;
                this.targetLanguage = preferences.targetLanguage;
            }
            
            // Restore difficulty level
            const difficultyLevel = document.getElementById('difficulty-level');
            if (difficultyLevel && preferences.difficultyLevel) {
                difficultyLevel.value = preferences.difficultyLevel;
            }
            
            // Restore theme
            const storyTheme = document.getElementById('story-theme');
            if (storyTheme && preferences.theme) {
                storyTheme.value = preferences.theme;
            }
            
        } catch (error) {
            console.warn('Could not load user preferences:', error);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LanguageLearningApp();
    window.app.initialize();
});

// Expose app globally for inline event handlers
export { LanguageLearningApp };