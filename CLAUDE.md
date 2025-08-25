# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

"Get Fluent Now" is a browser-based language learning application that uses Google's Gemini API to generate stories and provide translation feedback. The entire application runs as a single HTML file with no backend required.

## Technology Stack

- **Frontend**: Single HTML file with embedded JavaScript and CSS
- **AI Service**: Google Gemini API (Gemini 1.5 Flash) for story generation and translation assistance
- **Dependencies**: Marked.js for markdown parsing (loaded via CDN)
- **Storage**: LocalStorage for API key persistence

## Key Files

- `index.html` - Complete single-page application (v1.0)
- `package.json` - Project configuration and scripts  
- `README.md` - User documentation

## Development Commands

```bash
# Development server with hot reload (runs on port 8000, accessible from network)
npm run dev

# Build for production (creates single HTML file)
npm run build

# Preview production build
npm run preview

# Legacy development server
npm run serve
# or
python -m http.server 8000

# Validate HTML (if using HTML validator)
npm run lint
```

### Development Server Configuration
- **Port**: 8000 (configurable in `vite.config.js`)
- **Network Access**: Binds to `0.0.0.0` so accessible from other machines
- **Local URL**: `http://localhost:8000`
- **Network URL**: `http://YOUR_IP:8000` (shown when server starts)

## Architecture

### Development Structure
- **src/**: Source code organized in modules
  - **index.html**: HTML template
  - **css/**: Stylesheets
  - **js/**: JavaScript modules
    - **app.js**: Main application class
    - **api/gemini.js**: Gemini API wrapper
    - **features/**: Translation and chat features
    - **utils/**: Constants and utilities

### Production Build
- **dist/index.html**: Single HTML file with inlined CSS and JavaScript (~75KB)

### Key Components
- **LanguageLearningApp class**: Main application logic and state management
- **GeminiAPI class**: Dedicated API wrapper with error handling
- **Translation Features**: Story generation, rating, and mini lessons
- **Chat Features**: AI-powered translation assistance
- **Responsive UI**: Mobile-friendly design with floating chat widget
- **Help System**: Built-in guidance for API key setup

## Core Features

- **AI Story Generation**: Create stories in Spanish, Italian, French, or English at different CEFR levels (A1-C1)
- **Theme Selection**: Preset themes plus custom theme input capability
- **Translation Practice**: Users translate stories and receive AI feedback
- **Chat Assistant**: Real-time help with translation questions and grammar
- **Language Swapping**: Bidirectional translation support
- **Markdown Feedback**: Rich formatting for AI evaluation responses

## API Key Setup

Users need a free Google Gemini API key from [ai.google.dev/gemini-api/docs/api-key](https://ai.google.dev/gemini-api/docs/api-key). The app includes:
- Built-in help modal with step-by-step instructions
- Secure key storage in localStorage
- API key validation with error handling

## Browser Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- Internet connection for Gemini API calls
- JavaScript enabled
- LocalStorage support

## Development Notes

- All AI processing happens via Gemini API (cloud-based)
- API key is stored locally and never transmitted except to Google's servers
- Responsive design works on mobile and desktop
- No build process required - single HTML file deployment
- Graceful error handling for API failures

## v1.0 Status

The application has been cleaned and optimized for production use:
- Removed legacy code and unused dependencies
- Streamlined to single HTML file architecture
- Added comprehensive help system
- Optimized UI/UX with professional styling
- Validated all external links and API endpoints