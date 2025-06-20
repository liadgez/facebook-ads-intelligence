/**
 * Visual Analysis Utilities for Ad Creative Intelligence
 */

import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import { log } from 'crawlee';

/**
 * Extract text from ad images using OCR
 */
export async function extractTextFromImage(imagePath) {
    try {
        const worker = await createWorker();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        
        const { data: { text, confidence } } = await worker.recognize(imagePath);
        await worker.terminate();
        
        return {
            text: text.trim(),
            confidence,
            hasText: text.trim().length > 0
        };
    } catch (error) {
        log.error('OCR failed:', error);
        return { text: '', confidence: 0, hasText: false };
    }
}

/**
 * Analyze image colors and composition
 */
export async function analyzeImageComposition(imagePath) {
    try {
        const image = sharp(imagePath);
        const metadata = await image.metadata();
        const stats = await image.stats();
        
        // Get dominant colors
        const { dominant } = await image.resize(50, 50).raw().toBuffer({ resolveWithObject: true });
        
        // Analyze brightness
        const brightness = stats.channels.reduce((sum, channel) => sum + channel.mean, 0) / stats.channels.length;
        
        return {
            dimensions: {
                width: metadata.width,
                height: metadata.height,
                aspectRatio: metadata.width / metadata.height
            },
            colors: {
                dominant: rgbToHex(stats.dominant),
                brightness: brightness / 255,
                isLight: brightness > 127,
                isDark: brightness < 127
            },
            format: metadata.format,
            size: metadata.size
        };
    } catch (error) {
        log.error('Image analysis failed:', error);
        return null;
    }
}

/**
 * Detect common ad elements in images
 */
export async function detectAdElements(imagePath) {
    const elements = {
        hasLogo: false,
        hasProduct: false,
        hasPerson: false,
        hasText: false,
        hasCTA: false,
        hasSale: false
    };
    
    try {
        // Use OCR to detect common ad text
        const { text } = await extractTextFromImage(imagePath);
        const lowerText = text.toLowerCase();
        
        elements.hasText = text.length > 10;
        elements.hasCTA = /learn more|shop now|sign up|get started|buy now|order now/i.test(text);
        elements.hasSale = /sale|discount|off|save|free|limited|offer/i.test(text);
        
        // Detect if it's likely a logo (small square image)
        const metadata = await sharp(imagePath).metadata();
        const aspectRatio = metadata.width / metadata.height;
        elements.hasLogo = aspectRatio > 0.8 && aspectRatio < 1.2 && metadata.width < 200;
        
    } catch (error) {
        log.error('Element detection failed:', error);
    }
    
    return elements;
}

/**
 * Generate creative insights from multiple images
 */
export async function analyzeCreativeStrategy(imagePaths) {
    const insights = {
        totalImages: imagePaths.length,
        textInImages: 0,
        dominantColors: [],
        commonElements: [],
        creativeTypes: []
    };
    
    for (const imagePath of imagePaths) {
        const textData = await extractTextFromImage(imagePath);
        if (textData.hasText) {
            insights.textInImages++;
        }
        
        const composition = await analyzeImageComposition(imagePath);
        if (composition) {
            insights.dominantColors.push(composition.colors.dominant);
        }
        
        const elements = await detectAdElements(imagePath);
        insights.commonElements.push(elements);
    }
    
    // Analyze patterns
    insights.usesTextOverlay = insights.textInImages > imagePaths.length / 2;
    insights.colorConsistency = calculateColorConsistency(insights.dominantColors);
    insights.primaryCreativeType = determineCreativeType(insights.commonElements);
    
    return insights;
}

// Helper functions
function rgbToHex(rgb) {
    return '#' + rgb.r.toString(16).padStart(2, '0') + 
                 rgb.g.toString(16).padStart(2, '0') + 
                 rgb.b.toString(16).padStart(2, '0');
}

function calculateColorConsistency(colors) {
    if (colors.length < 2) return 'single';
    
    // Simple color similarity check
    const uniqueColors = [...new Set(colors)];
    const ratio = uniqueColors.length / colors.length;
    
    if (ratio < 0.3) return 'very_consistent';
    if (ratio < 0.6) return 'consistent';
    return 'varied';
}

function determineCreativeType(elements) {
    const totals = elements.reduce((acc, el) => {
        Object.keys(el).forEach(key => {
            acc[key] = (acc[key] || 0) + (el[key] ? 1 : 0);
        });
        return acc;
    }, {});
    
    const majority = elements.length / 2;
    
    if (totals.hasPerson > majority) return 'lifestyle';
    if (totals.hasProduct > majority) return 'product_focused';
    if (totals.hasText > majority && totals.hasSale > majority) return 'promotional';
    if (totals.hasLogo > majority) return 'brand_awareness';
    
    return 'mixed';
}

/**
 * Advanced OCR with preprocessing for better accuracy
 */
export async function enhancedOCR(imagePath) {
    try {
        // Preprocess image for better OCR
        const processedPath = imagePath.replace(/\.[^.]+$/, '_processed.png');
        
        await sharp(imagePath)
            .resize(1200, null, { withoutEnlargement: true })
            .grayscale()
            .normalize()
            .sharpen()
            .toFile(processedPath);
        
        const result = await extractTextFromImage(processedPath);
        
        // Clean up
        await fs.unlink(processedPath).catch(() => {});
        
        return result;
    } catch (error) {
        log.error('Enhanced OCR failed:', error);
        return { text: '', confidence: 0, hasText: false };
    }
}

/**
 * Extract structured data from ad creative
 */
export async function extractStructuredCreativeData(imagePaths, adText) {
    const creativeData = {
        style: {},
        messaging: {},
        design: {},
        strategy: {}
    };
    
    // Analyze visual style
    const visualInsights = await analyzeCreativeStrategy(imagePaths);
    creativeData.style = {
        colorScheme: visualInsights.colorConsistency,
        visualType: visualInsights.primaryCreativeType,
        usesTextOverlay: visualInsights.usesTextOverlay
    };
    
    // Analyze messaging if text is available
    if (adText) {
        creativeData.messaging = {
            tone: analyzeTone(adText),
            readability: calculateReadability(adText),
            keyPhrases: extractKeyPhrases(adText)
        };
    }
    
    // Detect design patterns
    creativeData.design = {
        imageCount: imagePaths.length,
        isCarousel: imagePaths.length > 1,
        hasConsistentBranding: visualInsights.colorConsistency === 'very_consistent'
    };
    
    // Infer strategy
    creativeData.strategy = {
        objective: inferObjective(creativeData),
        targetAudience: inferAudience(adText, visualInsights),
        creativeApproach: determineApproach(creativeData)
    };
    
    return creativeData;
}

// Text analysis helpers
function analyzeTone(text) {
    const tones = {
        professional: /professional|enterprise|solution|industry|expertise/i,
        casual: /hey|gonna|wanna|ya|lol|omg/i,
        urgent: /now|today|hurry|limited|expires|fast/i,
        friendly: /friend|love|enjoy|happy|fun|awesome/i,
        authoritative: /proven|guaranteed|certified|trusted|expert/i
    };
    
    for (const [tone, pattern] of Object.entries(tones)) {
        if (pattern.test(text)) return tone;
    }
    
    return 'neutral';
}

function calculateReadability(text) {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    if (avgWordsPerSentence < 10) return 'very_easy';
    if (avgWordsPerSentence < 15) return 'easy';
    if (avgWordsPerSentence < 20) return 'moderate';
    return 'complex';
}

function extractKeyPhrases(text) {
    const phrases = [];
    
    // Extract quoted phrases
    const quotedMatches = text.match(/"([^"]+)"/g);
    if (quotedMatches) {
        phrases.push(...quotedMatches.map(m => m.replace(/"/g, '')));
    }
    
    // Extract capitalized phrases (likely important)
    const capsMatches = text.match(/\b[A-Z][A-Z\s]+\b/g);
    if (capsMatches) {
        phrases.push(...capsMatches.filter(m => m.length > 3));
    }
    
    return [...new Set(phrases)];
}

function inferObjective(creativeData) {
    if (creativeData.style.visualType === 'promotional') return 'sales';
    if (creativeData.style.visualType === 'brand_awareness') return 'awareness';
    if (creativeData.messaging?.tone === 'professional') return 'lead_generation';
    if (creativeData.design.isCarousel) return 'engagement';
    return 'traffic';
}

function inferAudience(text, visualInsights) {
    const indicators = {
        b2b: /business|enterprise|company|solution|roi|productivity/i,
        b2c: /you|your|family|home|personal|lifestyle/i,
        young: /gen z|millennial|tiktok|vibe|aesthetic/i,
        professional: /career|professional|executive|manager/i
    };
    
    if (text) {
        for (const [audience, pattern] of Object.entries(indicators)) {
            if (pattern.test(text)) return audience;
        }
    }
    
    return visualInsights.primaryCreativeType === 'lifestyle' ? 'b2c' : 'general';
}

function determineApproach(creativeData) {
    if (creativeData.messaging?.tone === 'urgent') return 'direct_response';
    if (creativeData.style.visualType === 'lifestyle') return 'aspirational';
    if (creativeData.messaging?.tone === 'professional') return 'educational';
    if (creativeData.style.usesTextOverlay) return 'informational';
    return 'visual_storytelling';
}