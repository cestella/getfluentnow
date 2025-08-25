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

            // Get AI response
            const response = await this.geminiAPI.chat(trimmedMessage, this.context);
            
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
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
     * Handle Enter key press in chat input
     */
    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const input = event.target;
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
     * Update context with current story for more relevant help
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