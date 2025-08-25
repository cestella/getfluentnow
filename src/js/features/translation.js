/**
 * Translation Features Module
 * Handles translation functionality and feedback display
 */

export class TranslationManager {
    constructor(geminiAPI) {
        this.geminiAPI = geminiAPI;
        this.currentStory = null;
        this.referenceTranslation = null;
    }

    /**
     * Set the current story for translation
     */
    setCurrentStory(story) {
        this.currentStory = story;
        this.referenceTranslation = null;
    }

    /**
     * Process user's translation submission
     */
    async processTranslation(userTranslation, sourceLanguage, targetLanguage) {
        if (!this.currentStory) {
            throw new Error('No story available for translation');
        }

        if (!userTranslation || userTranslation.trim().length === 0) {
            throw new Error('Please enter your translation before submitting');
        }

        try {
            // Get reference translation if not already available
            if (!this.referenceTranslation) {
                this.referenceTranslation = await this.geminiAPI.translateText(
                    this.currentStory, 
                    sourceLanguage, 
                    targetLanguage
                );
            }

            // Get AI feedback on the translation
            const feedback = await this.geminiAPI.rateTranslation(
                this.currentStory,
                userTranslation.trim(),
                this.referenceTranslation,
                sourceLanguage,
                targetLanguage
            );

            return {
                feedback,
                referenceTranslation: this.referenceTranslation,
                userTranslation: userTranslation.trim()
            };

        } catch (error) {
            console.error('Translation processing error:', error);
            throw new Error(`Failed to process translation: ${error.message}`);
        }
    }

    /**
     * Generate a mini lesson based on translation
     */
    async generateMiniLesson(userTranslation, sourceLanguage, targetLanguage) {
        if (!this.currentStory || !userTranslation) {
            throw new Error('Story and translation required for mini lesson');
        }

        try {
            const lesson = await this.geminiAPI.generateMiniLesson(
                this.currentStory,
                userTranslation.trim(), 
                sourceLanguage,
                targetLanguage
            );

            return lesson;
        } catch (error) {
            console.error('Mini lesson generation error:', error);
            throw new Error(`Failed to generate lesson: ${error.message}`);
        }
    }

    /**
     * Display translation feedback in the UI
     */
    displayFeedback(feedbackElement, result) {
        if (!feedbackElement) return;

        // Parse and format the feedback using Marked for markdown rendering
        const formattedFeedback = (typeof marked !== 'undefined' && marked.parse) 
            ? marked.parse(result.feedback) 
            : result.feedback;
        
        feedbackElement.innerHTML = `
            <div class="feedback-content">
                <div class="reference-translation">
                    <h4>📖 Reference Translation</h4>
                    <p><em>${result.referenceTranslation}</em></p>
                </div>
                <div class="ai-feedback">
                    <h4>🎯 AI Feedback</h4>
                    ${formattedFeedback}
                </div>
            </div>
        `;
        
        // Show tabs and activate feedback tab
        this.showResultsTabs('feedback');
    }

    /**
     * Display mini lesson in the UI
     */
    displayMiniLesson(lesson) {
        const lessonElement = document.getElementById('lesson-output');
        if (!lessonElement) return;

        const formattedLesson = (typeof marked !== 'undefined' && marked.parse) 
            ? marked.parse(lesson) 
            : lesson;
        
        lessonElement.innerHTML = `
            <div class="mini-lesson-content">
                <h4>📚 Mini Lesson</h4>
                ${formattedLesson}
            </div>
        `;
        
        // Show tabs and activate lesson tab
        this.showResultsTabs('lesson');
    }

    /**
     * Clear current translation data
     */
    clear() {
        this.currentStory = null;
        this.referenceTranslation = null;
    }

    /**
     * Show translation section in UI
     */
    showTranslationSection() {
        const section = document.getElementById('translation-section');
        const tabsContainer = document.getElementById('results-tabs');
        if (section) {
            section.style.display = 'block';
            
            // Update story reference for mobile UX
            const storyReferenceText = document.getElementById('story-reference-text');
            if (storyReferenceText && this.currentStory) {
                storyReferenceText.textContent = this.currentStory;
            }
            
            // Clear previous input and feedback
            const input = document.getElementById('translation-input');
            const feedback = document.getElementById('feedback-output');
            const lessonOutput = document.getElementById('lesson-output');
            const miniLessonBtn = document.getElementById('mini-lesson-btn');
            
            if (input) input.value = '';
            if (feedback) {
                feedback.innerHTML = '';
                feedback.classList.remove('has-content');
            }
            if (lessonOutput) {
                lessonOutput.innerHTML = '';
            }
            if (miniLessonBtn) miniLessonBtn.style.display = 'none';
            if (tabsContainer) tabsContainer.style.display = 'none';
        }
    }

    /**
     * Hide translation section in UI
     */
    hideTranslationSection() {
        const section = document.getElementById('translation-section');
        if (section) {
            section.style.display = 'none';
        }
    }

    /**
     * Show results tabs and activate specified tab
     */
    showResultsTabs(activeTab = 'feedback') {
        const tabsContainer = document.getElementById('results-tabs');
        if (tabsContainer) {
            tabsContainer.style.display = 'block';
            
            // Switch to the specified tab
            this.switchTab(activeTab);
            
            // Show mini lesson button after first feedback
            const miniLessonBtn = document.getElementById('mini-lesson-btn');
            if (miniLessonBtn) {
                miniLessonBtn.style.display = 'inline-block';
            }
        }
    }

    /**
     * Switch between feedback and lesson tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        const feedbackTab = document.getElementById('feedback-tab');
        const lessonTab = document.getElementById('lesson-tab');
        
        if (feedbackTab && lessonTab) {
            feedbackTab.classList.toggle('active', tabName === 'feedback');
            lessonTab.classList.toggle('active', tabName === 'lesson');
        }
        
        // Update tab content
        const feedbackPanel = document.getElementById('feedback-tab-content');
        const lessonPanel = document.getElementById('lesson-tab-content');
        
        if (feedbackPanel && lessonPanel) {
            feedbackPanel.classList.toggle('active', tabName === 'feedback');
            lessonPanel.classList.toggle('active', tabName === 'lesson');
        }

        // Scroll to tabs
        const tabsContainer = document.getElementById('results-tabs');
        if (tabsContainer) {
            tabsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}