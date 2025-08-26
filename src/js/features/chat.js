/**
 * Chat Features Module  
 * Handles the floating chat widget and AI assistant conversations
 */

export class ChatManager {
    constructor(geminiAPI) {
        this.geminiAPI = geminiAPI;
        this.chatHistory = [];
        this.isOpen = false;
        this.context = null;
    }

    /**
     * Set context for chat conversations (e.g., current story)
     */
    setContext(context) {
        this.context = context;
    }

    /**
     * Toggle chat widget visibility
     */
    toggleChat() {
        const container = document.getElementById('chat-container');
        const toggle = document.getElementById('chat-toggle');
        
        if (!container || !toggle) return;

        this.isOpen = !this.isOpen;
        
        // Update context with current state when chat opens
        if (this.isOpen) {
            this.updateContextFromCurrentState();
        }
        container.style.display = this.isOpen ? 'block' : 'none';
        
        // Update toggle appearance
        toggle.textContent = this.isOpen ? '✕' : '💬';
        
        if (this.isOpen) {
            // Focus on chat input when opening
            const input = document.getElementById('chat-input');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }

    /**
     * Send a message in the chat
     */
    async sendMessage(message) {
        if (!message || message.trim().length === 0) return;

        const trimmedMessage = message.trim();
        
        try {
            // Add user message to chat
            this.addMessageToChat(trimmedMessage, 'user');
            
            // Clear input
            const input = document.getElementById('chat-input');
            if (input) input.value = '';

            // Show typing indicator
            this.showTypingIndicator();

            // Update context with current state before sending to AI
            this.updateContextFromCurrentState();

            // Get AI response with current context
            const response = await this.geminiAPI.chat(trimmedMessage, this.formatContextForAI());
            
            // Remove typing indicator and add AI response
            this.hideTypingIndicator();
            this.addMessageToChat(response, 'bot');
            
            // Store in history
            this.chatHistory.push(
                { role: 'user', message: trimmedMessage },
                { role: 'bot', message: response }
            );

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
            console.error('Chat error:', error);
        }
    }

    /**
     * Add a message to the chat display
     */
    addMessageToChat(message, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        
        if (sender === 'bot') {
            // Render markdown for bot messages
            messageElement.innerHTML = (typeof marked !== 'undefined' && marked.parse) 
                ? marked.parse(message) 
                : message;
        } else {
            messageElement.textContent = message;
        }
        
        messagesContainer.appendChild(messageElement);
        
        // Auto-scroll to the new message
        this.scrollToBottom();
    }

    /**
     * Scroll to the bottom of the chat messages
     */
    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100); // Small delay to ensure content is rendered
        }
    }

    /**
     * Show typing indicator for AI responses
     */
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const typingElement = document.createElement('div');
        typingElement.classList.add('chat-message', 'bot-message', 'typing-indicator');
        typingElement.innerHTML = '<span class="typing-dots">●●●</span>';
        typingElement.id = 'typing-indicator';
        
        messagesContainer.appendChild(typingElement);
        
        // Auto-scroll to show typing indicator
        this.scrollToBottom();
    }

    /**
     * Hide/remove typing indicator
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Handle key press in chat input (now textarea)
     */
    handleKeyPress(event) {
        const input = event.target;
        
        // Auto-resize textarea
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage(input.value);
        }
    }

    /**
     * Clear chat history and display
     */
    clearChat() {
        this.chatHistory = [];
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    }

    /**
     * Initialize chat with a welcome message
     */
    initializeChat() {
        this.addMessageToChat(
            "Hello! I'm your AI language learning assistant. I can help you with:\n\n" +
            "• Grammar questions\n" + 
            "• Vocabulary explanations\n" +
            "• Translation help\n" +
            "• Language learning tips\n\n" +
            "What would you like to know?", 
            'bot'
        );
    }

    /**
     * Update context based on current application state
     */
    updateContextFromCurrentState() {
        const context = {
            timestamp: Date.now(),
            sourceLanguage: null,
            targetLanguage: null,
            currentStory: null,
            sentences: [],
            userTranslations: [],
            feedback: null,
            miniLesson: null
        };

        // Get language settings from app
        const sourceLang = document.getElementById('source-lang');
        const targetLang = document.getElementById('target-lang');
        if (sourceLang && targetLang) {
            context.sourceLanguage = sourceLang.value;
            context.targetLanguage = targetLang.value;
        }

        // Get current story
        const storyOutput = document.getElementById('story-output');
        if (storyOutput && storyOutput.textContent && storyOutput.classList.contains('has-content')) {
            context.currentStory = storyOutput.textContent.trim();
        }

        // Get sentence translations if using sentence-by-sentence mode
        const sentenceContainer = document.getElementById('sentence-translation-container');
        if (sentenceContainer && sentenceContainer.children.length > 0) {
            // Extract sentences from the interface
            const sentencePairs = Array.from(sentenceContainer.children);
            sentencePairs.forEach((pair, index) => {
                const originalDiv = pair.querySelector('.sentence-original');
                const translationInput = pair.querySelector('.sentence-translation-input');
                
                if (originalDiv && translationInput) {
                    const originalText = originalDiv.textContent.replace(/^Sentence \d+:\s*/, '').trim();
                    const userTranslation = translationInput.value.trim();
                    
                    context.sentences.push(originalText);
                    if (userTranslation) {
                        context.userTranslations.push({
                            sentenceIndex: index,
                            original: originalText,
                            translation: userTranslation
                        });
                    }
                }
            });
        }

        // Get current feedback if available
        const feedbackOutput = document.getElementById('feedback-output');
        if (feedbackOutput && feedbackOutput.innerHTML.trim()) {
            // Extract text content without HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = feedbackOutput.innerHTML;
            context.feedback = tempDiv.textContent.trim();
        }

        // Get current mini lesson if available
        const lessonOutput = document.getElementById('lesson-output');
        if (lessonOutput && lessonOutput.innerHTML.trim()) {
            // Extract text content without HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = lessonOutput.innerHTML;
            context.miniLesson = tempDiv.textContent.trim();
        }

        this.context = context;
    }

    /**
     * Format context for AI in a readable way
     */
    formatContextForAI() {
        if (!this.context) return null;

        let contextString = "CURRENT SESSION CONTEXT:\n\n";
        
        // Language settings
        if (this.context.sourceLanguage && this.context.targetLanguage) {
            contextString += `Learning languages: ${this.context.sourceLanguage} → ${this.context.targetLanguage}\n\n`;
        }

        // Current story
        if (this.context.currentStory) {
            contextString += `STORY TO TRANSLATE:\n${this.context.currentStory}\n\n`;
        }

        // User's sentence translations
        if (this.context.userTranslations && this.context.userTranslations.length > 0) {
            contextString += `USER'S TRANSLATION ATTEMPTS:\n`;
            this.context.userTranslations.forEach((item, index) => {
                contextString += `${index + 1}. Original: "${item.original}"\n   User translation: "${item.translation}"\n`;
            });
            contextString += "\n";
        }

        // Current feedback
        if (this.context.feedback) {
            contextString += `CURRENT FEEDBACK:\n${this.context.feedback}\n\n`;
        }

        // Current mini lesson
        if (this.context.miniLesson) {
            contextString += `CURRENT MINI LESSON:\n${this.context.miniLesson}\n\n`;
        }

        // If no meaningful content, return null
        if (contextString === "CURRENT SESSION CONTEXT:\n\n") {
            return null;
        }

        contextString += "Please help the user based on their current learning session context above.";
        return contextString;
    }

    /**
     * Update context with current story for more relevant help (legacy method)
     */
    updateContextWithStory(story, sourceLanguage, targetLanguage) {
        this.context = {
            currentStory: story,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
            timestamp: Date.now()
        };
    }

    /**
     * Close the chat widget
     */
    closeChat() {
        if (this.isOpen) {
            this.toggleChat();
        }
    }
}