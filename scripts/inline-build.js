#!/usr/bin/env node

/**
 * Build script to inline all CSS and JavaScript into a single HTML file
 * This creates the final deployable version of Get Fluent Now
 */

import { readFileSync, writeFileSync, unlinkSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');
const OUTPUT_FILE = join(__dirname, '..', 'index.html');

function inlineAssets() {
    try {
        console.log('🔧 Starting asset inlining process...');
        
        // Read the built HTML file
        const htmlFile = join(DIST_DIR, 'index.html');
        let html = readFileSync(htmlFile, 'utf8');
        
        console.log('📄 Processing HTML file...');
        
        // Find and inline CSS files
        const cssMatches = html.matchAll(/<link[^>]+href="([^"]*\.css)"[^>]*>/g);
        for (const match of cssMatches) {
            const cssPath = join(DIST_DIR, match[1]);
            try {
                const cssContent = readFileSync(cssPath, 'utf8');
                const inlineCSS = `<style>\n${cssContent}\n</style>`;
                html = html.replace(match[0], inlineCSS);
                console.log(`✅ Inlined CSS: ${match[1]}`);
            } catch (err) {
                console.warn(`⚠️  Could not inline CSS: ${match[1]}`);
            }
        }
        
        // Find and inline JavaScript files
        const jsMatches = html.matchAll(/<script[^>]+src="([^"]*\.js)"[^>]*><\/script>/g);
        for (const match of jsMatches) {
            const jsPath = join(DIST_DIR, match[1]);
            try {
                const jsContent = readFileSync(jsPath, 'utf8');
                const inlineJS = `<script type="module">\n${jsContent}\n</script>`;
                html = html.replace(match[0], inlineJS);
                console.log(`✅ Inlined JS: ${match[1]}`);
            } catch (err) {
                console.warn(`⚠️  Could not inline JS: ${match[1]}`);
            }
        }
        
        // Find and inline image assets (favicon files)
        const imgMatches = html.matchAll(/href="([^"]*\.(png|ico|jpg|jpeg|svg|gif))"[^>]*/g);
        for (const match of imgMatches) {
            const imgPath = join(DIST_DIR, match[1]);
            try {
                const imgContent = readFileSync(imgPath);
                const ext = match[2].toLowerCase();
                const mimeType = ext === 'png' ? 'image/png' : 
                                ext === 'ico' ? 'image/x-icon' :
                                ext === 'svg' ? 'image/svg+xml' :
                                ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                                ext === 'gif' ? 'image/gif' : 'image/png';
                const base64 = imgContent.toString('base64');
                const dataUri = `data:${mimeType};base64,${base64}`;
                html = html.replace(match[1], dataUri);
                console.log(`✅ Inlined image: ${match[1]}`);
            } catch (err) {
                console.warn(`⚠️  Could not inline image: ${match[1]}`);
            }
        }
        
        // Write the final HTML file
        writeFileSync(OUTPUT_FILE, html, 'utf8');
        console.log(`✅ Created single-file build: ${OUTPUT_FILE}`);
        
        // Clean up - remove the dist directory assets (keep the directory for potential future use)
        try {
            const files = readdirSync(DIST_DIR);
            for (const file of files) {
                const filePath = join(DIST_DIR, file);
                const stat = statSync(filePath);
                if (stat.isFile() && file !== '.gitkeep') {
                    unlinkSync(filePath);
                }
            }
            console.log('🧹 Cleaned up build artifacts');
        } catch (err) {
            console.warn('⚠️  Could not clean up all build artifacts:', err.message);
        }
        
        // Get final file size
        const stats = statSync(OUTPUT_FILE);
        const fileSizeKB = Math.round(stats.size / 1024);
        
        console.log('🎉 Build complete!');
        console.log(`📊 Final size: ${fileSizeKB} KB`);
        console.log(`📁 Output: ${OUTPUT_FILE}`);
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run the inlining process
inlineAssets();