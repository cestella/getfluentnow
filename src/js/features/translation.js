/**
 * Translation Features Module
 * Handles translation functionality and feedback display
 */

export class TranslationManager {
    constructor(geminiAPI) {
        this.geminiAPI = geminiAPI;
        this.currentStory = null;
        this.currentSentences = [];
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
     * Set structured sentences for sentence-by-sentence translation
     */
    setCurrentSentences(sentences) {
        this.currentSentences = sentences;
        this.currentStory = sentences.join(' ');
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
     * Generate mini lesson based on sentence translations
     */
    async generateSentenceMiniLesson(userTranslations, sourceLanguage, targetLanguage) {
        if (!userTranslations || userTranslations.length === 0) {
            throw new Error('No translations provided for mini lesson');
        }

        try {
            const lesson = await this.geminiAPI.generateSentenceMiniLesson(
                userTranslations,
                sourceLanguage,
                targetLanguage
            );

            return lesson;
        } catch (error) {
            console.error('Sentence mini lesson generation error:', error);
            throw new Error(`Failed to generate lesson: ${error.message}`);
        }
    }

    /**
     * Process sentence-by-sentence translations
     */
    async processSentenceTranslations(sourceLanguage, targetLanguage) {
        if (!this.currentSentences || this.currentSentences.length === 0) {
            throw new Error('No sentences available for translation');
        }

        // Collect user translations from the UI
        const userTranslations = [];
        for (let i = 0; i < this.currentSentences.length; i++) {
            const input = document.getElementById(`sentence-translation-${i}`);
            userTranslations.push(input ? input.value.trim() : '');
        }

        try {
            const result = await this.geminiAPI.rateSentenceTranslations(
                this.currentSentences,
                userTranslations,
                sourceLanguage,
                targetLanguage
            );

            return result;
        } catch (error) {
            console.error('Sentence translation processing error:', error);
            throw new Error(`Failed to process translations: ${error.message}`);
        }
    }

    /**
     * Display sentence translation feedback in the UI
     */
    displaySentenceFeedback(feedbackElement, result) {
        if (!feedbackElement) return;

        const overallFeedback = (typeof marked !== 'undefined' && marked.parse) 
            ? marked.parse(result.overallFeedback) 
            : result.overallFeedback;

        let sentenceFeedbackHtml = '';
        result.sentenceFeedback.forEach((item, index) => {
            const feedback = (typeof marked !== 'undefined' && marked.parse) 
                ? marked.parse(item.feedback) 
                : item.feedback;

            // Get grade with proper styling
            const grade = item.grade || 'C'; // Default to C if no grade provided
            const gradeClass = `grade-${grade.toLowerCase()}`;
            const gradeHtml = `<span class="grade ${gradeClass}">${grade}</span>`;

            sentenceFeedbackHtml += `
                <div class="sentence-feedback-item">
                    <h5>Sentence ${item.sentenceIndex + 1} ${gradeHtml}</h5>
                    <div class="sentence-feedback-original">
                        <strong>Original:</strong> <em>"${item.original}"</em>
                    </div>
                    <div class="sentence-feedback-user">
                        <strong>Your translation:</strong> "${item.userTranslation}"
                    </div>
                    <div class="sentence-feedback-reference">
                        <strong>Reference:</strong> <em>"${item.referenceTranslation}"</em>
                    </div>
                    <div class="sentence-feedback-content">
                        ${feedback}
                    </div>
                </div>
            `;
        });
        
        feedbackElement.innerHTML = `
            <div class="feedback-content">
                <div class="overall-feedback">
                    <h4>📊 Overall Performance</h4>
                    <p><strong>Translated:</strong> ${result.translatedCount} out of ${result.totalSentences} sentences</p>
                    ${overallFeedback}
                </div>
                <div class="sentence-feedback">
                    <h4>💬 Individual Sentence Feedback</h4>
                    ${sentenceFeedbackHtml}
                </div>
            </div>
        `;
        
        // Show tabs and activate feedback tab
        this.showResultsTabs('feedback');
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

        // Check if lesson is structured JSON or plain text
        if (typeof lesson === 'object' && lesson.title) {
            this.displayStructuredMiniLesson(lesson, lessonElement);
        } else {
            // Fallback to simple text lesson
            const formattedLesson = (typeof marked !== 'undefined' && marked.parse) 
                ? marked.parse(lesson) 
                : lesson;
            
            lessonElement.innerHTML = `
                <div class="mini-lesson-content">
                    <h4>📚 Mini Lesson</h4>
                    ${formattedLesson}
                </div>
            `;
        }
        
        // Show tabs and activate lesson tab
        this.showResultsTabs('lesson');
    }

    /**
     * Display structured mini lesson with interactive exercises
     */
    displayStructuredMiniLesson(lesson, lessonElement) {
        // Generate vocabulary HTML
        const vocabularyHtml = lesson.vocabulary.map(vocab => `
            <div class="vocabulary-item">
                <strong>${vocab.word}</strong> - ${vocab.meaning}
                <div class="vocabulary-example"><em>${vocab.example}</em></div>
            </div>
        `).join('');

        // Generate mistakes HTML
        const mistakesHtml = lesson.commonMistakes.map(mistake => `
            <div class="mistake-item">
                <div class="mistake-pattern">❌ ${mistake.mistake}</div>
                <div class="mistake-correction">✅ ${mistake.correction}</div>
                <div class="mistake-example"><em>${mistake.example}</em></div>
            </div>
        `).join('');

        // Generate exercises HTML
        const exercisesHtml = lesson.exercises.map((exercise, index) => `
            <div class="exercise-item" data-exercise-id="${index}">
                <div class="exercise-header">
                    <h5>Exercise ${index + 1}: ${exercise.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h5>
                </div>
                <div class="exercise-instruction">${exercise.instruction}</div>
                <div class="exercise-question">${exercise.question}</div>
                <div class="exercise-answer-section">
                    <button class="show-answer-btn" onclick="app.toggleExerciseAnswer(${index})">
                        Show Answer
                    </button>
                    <div class="exercise-answer" id="exercise-answer-${index}" style="display: none;">
                        <div class="answer-text"><strong>Answer:</strong> ${exercise.answer}</div>
                        <div class="answer-explanation"><strong>Explanation:</strong> ${exercise.explanation}</div>
                    </div>
                </div>
            </div>
        `).join('');

        lessonElement.innerHTML = `
            <div class="structured-mini-lesson">
                <div class="lesson-header">
                    <h4>📚 ${lesson.title}</h4>
                </div>
                
                <div class="lesson-section grammar-section">
                    <h5>📖 Grammar Focus</h5>
                    <p>${lesson.grammarFocus}</p>
                </div>
                
                <div class="lesson-section vocabulary-section">
                    <h5>📝 Key Vocabulary</h5>
                    <div class="vocabulary-list">
                        ${vocabularyHtml}
                    </div>
                </div>
                
                <div class="lesson-section mistakes-section">
                    <h5>⚠️ Common Mistakes</h5>
                    <div class="mistakes-list">
                        ${mistakesHtml}
                    </div>
                </div>
                
                <div class="lesson-section exercises-section">
                    <h5>💪 Practice Exercises</h5>
                    <div class="exercises-list">
                        ${exercisesHtml}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate sentence-by-sentence translation interface
     */
    generateSentenceInterface(sentences) {
        const container = document.getElementById('sentence-translation-container');
        if (!container) return;

        container.innerHTML = '';
        
        sentences.forEach((sentence, index) => {
            const sentencePair = document.createElement('div');
            sentencePair.className = 'sentence-pair';
            
            sentencePair.innerHTML = `
                <div class="sentence-original">
                    <span class="sentence-number">Sentence ${index + 1}:</span>
                    ${sentence}
                </div>
                <textarea 
                    id="sentence-translation-${index}"
                    class="sentence-translation-input" 
                    placeholder="Type your translation here..."
                    rows="2"
                ></textarea>
            `;
            
            container.appendChild(sentencePair);
        });
    }

    /**
     * Clear current translation data
     */
    clear() {
        this.currentStory = null;
        this.currentSentences = [];
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
            
            // Generate sentence interface if we have structured sentences
            if (this.currentSentences && this.currentSentences.length > 0) {
                this.generateSentenceInterface(this.currentSentences);
            }
            
            // Clear previous feedback
            const feedback = document.getElementById('feedback-output');
            const lessonOutput = document.getElementById('lesson-output');
            const miniLessonBtn = document.getElementById('mini-lesson-btn');
            
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