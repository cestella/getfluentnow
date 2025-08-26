# Get Fluent Now 🌍

AI-powered language learning application using Google Gemini API for story generation and translation practice. Built with modern web technologies and designed to work as a single HTML file for easy deployment.

## 🚀 [**Try it live at getfluentnow.net**](http://getfluentnow.net) 🚀

## ✨ Features

- **🤖 AI Story Generation**: Create stories in 12+ languages at different CEFR levels (A1-C1)
- **📝 Translation Practice**: Translate AI-generated stories and receive detailed AI feedback with markdown formatting
- **📚 Mini Lessons**: Get personalized grammar and vocabulary lessons based on your translation attempts
- **💬 Chat Assistant**: Real-time help with translation questions, grammar, and vocabulary
- **🎨 Theme Selection**: Choose from 12 preset themes or create custom story prompts
- **📱 Mobile-Friendly**: Responsive design that works perfectly on all devices
- **🎯 Tab System**: Switch between feedback and mini lessons without losing content
- **⚡ Single-File Deployment**: Production build creates one HTML file (less than 1MB) with everything inlined
- **🍔 About Modal**: Comprehensive hamburger menu with app information and GitHub link
- **🎨 SVG Logo**: Custom speech bubble logo with "GFN" branding
- **🌐 Community Footer**: Attribution and links to GitHub repository and issues

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (for development only)
- A free [Google Gemini API key](https://ai.google.dev/gemini-api/docs/api-key)

### Development Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/cestella/getfluentnow.git
   cd getfluentnow
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:8001` (or next available port) with hot reload and network access

3. **Build for production:**
   ```bash
   npm run build
   ```
   Creates a single `index.html` file (less than 1MB) with everything inlined

4. **Preview production build:**
   ```bash
   npm run serve
   # or
   python3 -m http.server 8000
   ```

### Using the App

1. **Get your API key** from [Google AI for Developers](https://ai.google.dev/gemini-api/docs/api-key)
2. **Enter and validate** your API key in the app
3. **Select languages** and difficulty level
4. **Choose a theme** or create a custom one
5. **Generate a story** and start translating!

## 🏗️ Architecture

### Development Structure
```
getfluentnow/
├── src/                    # Source files for development
│   ├── index.html         # HTML template
│   ├── img/               # Favicon and logo assets
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   └── favicon-48x48.png
│   ├── css/
│   │   └── main.css       # Comprehensive stylesheet with markdown styling
│   └── js/
│       ├── app.js         # Main application orchestrator
│       ├── api/
│       │   └── gemini.js  # Google Gemini API wrapper with safety checks
│       ├── features/
│       │   ├── translation.js  # Translation feedback & tab management
│       │   └── chat.js         # Floating chat widget functionality
│       └── utils/
│           ├── constants.js         # CEFR specs, language mappings, themes
│           └── story-generator.js   # Theme selection utilities
├── scripts/
│   └── inline-build.js    # Custom build script for asset inlining
├── vite.config.js         # Vite configuration for dev server & build
├── package.json           # Dependencies and npm scripts
├── index.html             # 📦 Final production build (less than 1MB, everything inlined)
└── CLAUDE.md              # Development guidelines for Claude Code
```

### Production Build
- **Single HTML file** (`index.html`) with all CSS and JavaScript inlined
- **Less than 1MB total size** - optimized and minified
- **One dependency**: Marked.js loaded from CDN for markdown parsing
- **Zero-config deployment** - just upload the HTML file anywhere
- **Works offline** once loaded (except for AI API calls)

## 📚 Development

### Available Scripts

```bash
npm run dev          # Start development server (port 8000+, network accessible)
npm run build        # Build production version (single HTML file with inlining)
npm run build:auto   # Build production version then start dev server
npm run build:dev    # Build without inlining (separate files in dist/)
npm run preview      # Preview production build with Vite
npm run serve        # Simple HTTP server on port 8000
npm run lint         # HTML validation info (external service)
npm run validate     # Browser dev tools validation reminder
```

### Key Technologies & Features

- **⚡ Vite** - Lightning-fast build tool and dev server with HMR
- **📦 ES Modules** - Modern JavaScript with clean imports/exports
- **🤖 Google Gemini API** - Multiple models (Flash Lite, Flash, Pro) for AI generation
- **📝 Marked.js** - Professional markdown parsing for rich formatted feedback
- **🎯 Tab System** - Custom-built tab interface for feedback/lessons
- **📱 Responsive CSS** - Mobile-first design with CSS Grid/Flexbox
- **🔧 Zero Frameworks** - Pure vanilla JavaScript for maximum performance
- **🛡️ Error Handling** - Graceful fallbacks and comprehensive error management

### Development Architecture

**Modular & Maintainable:**
- **`LanguageLearningApp`** - Main orchestrator with clean separation of concerns
- **`GeminiAPI`** - Robust API wrapper with retry logic and error handling  
- **`TranslationManager`** - Handles feedback, lessons, and tab switching
- **`ChatManager`** - Floating chat widget with context awareness
- **Utility modules** - Shared constants, CEFR specifications, and helpers

**Modern Build Process:**
1. **Development**: Vite serves modular files with hot reload
2. **Build**: Vite bundles and minifies all assets
3. **Inline**: Custom script embeds CSS/JS into single HTML file
4. **Deploy**: Upload single file (less than 1MB) - no server configuration needed

## 🔧 Customization & Extension

### Adding New Languages
1. **Add to constants**: Update `languageNames` mapping in `src/js/utils/constants.js`
2. **Update UI**: Add `<option>` elements to both language dropdowns in `src/index.html`
3. **Test**: Verify CEFR specifications work for the new language

### Adding Story Themes  
1. **Define variants**: Add theme with story variants array to `storyVariants` in `src/js/utils/constants.js`
2. **Update UI**: Add new `<option>` to the theme dropdown in `src/index.html`
3. **Custom themes**: Users can already create custom themes via the input field

### Configuring AI Models
Available models in `src/js/utils/constants.js`:
```javascript
export const geminiModels = {
    'flash-lite': 'gemini-2.5-flash-lite-latest',  // Fastest, most cost-effective
    'flash': 'gemini-2.5-flash-latest',            // Balanced speed/quality  
    'pro': 'gemini-1.5-pro-latest'                 // Highest quality (1.5 still used for Pro)
};
```

### CEFR Level Customization
Detailed CEFR specifications are in `src/js/utils/constants.js` under `cefrSpecs`. You can:
- Adjust vocabulary requirements per level
- Modify grammar complexity rules  
- Fine-tune sentence structure guidelines
- Customize complexity expectations

## 🚀 Deployment Options

### Static Hosting (Recommended)
Upload `index.html` to any static host:
- **Vercel**: Drag & drop the HTML file
- **Netlify**: Drop into deploy area  
- **GitHub Pages**: Commit to repository
- **AWS S3**: Upload as static website
- **Any web server**: No special configuration needed

### Self-Hosting
```bash
# Simple Python server
python3 -m http.server 8000

# Node.js server  
npx serve .

# Any static file server works
```

## 🛠️ Development Tips

### Debugging
- **Development**: Use browser dev tools with source maps
- **API Issues**: Check console for Gemini API errors
- **Markdown**: Test with various markdown syntax
- **Mobile**: Use device emulation in dev tools

### Hot Reload Development
The dev server supports hot reload:
- CSS changes update instantly
- JavaScript changes reload the page
- HTML changes refresh automatically
- Network accessible for mobile testing

### Build Optimization
- **Development builds**: `npm run build:dev` keeps files separate for debugging
- **Production builds**: `npm run build` creates optimized single file
- **Bundle analysis**: Check browser dev tools for size breakdown

## 📄 License

MIT License - feel free to use for personal or commercial projects!

## 🤝 Contributing

Contributions welcome! Please read the development guidelines in `CLAUDE.md`.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Run `npm run dev` for development
4. Test with `npm run build` before submitting
5. Submit pull request with clear description

---

**Made with ❤️ for language learners worldwide**

*Powered by Google Gemini AI • Built with modern web technologies • Designed for developers*