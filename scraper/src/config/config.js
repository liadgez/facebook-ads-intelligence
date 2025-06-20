import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const config = {
    // Crawlee settings
    HEADLESS: process.env.CRAWLEE_HEADLESS === 'true',
    LOG_LEVEL: process.env.CRAWLEE_LOG_LEVEL || 'INFO',
    
    // Download settings
    DOWNLOAD_IMAGES: process.env.DOWNLOAD_IMAGES !== 'false',
    DOWNLOAD_VIDEOS: process.env.DOWNLOAD_VIDEOS !== 'false',
    SAVE_LANDING_PAGES: process.env.SAVE_LANDING_PAGES === 'true',
    DOWNLOAD_MEDIA: process.env.DOWNLOAD_IMAGES !== 'false' || process.env.DOWNLOAD_VIDEOS !== 'false',
    
    // Rate limiting
    MIN_DELAY: parseInt(process.env.MIN_DELAY_MS) || 3000,
    MAX_DELAY: parseInt(process.env.MAX_DELAY_MS) || 8000,
    MAX_REQUESTS_PER_MINUTE: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 30,
    
    // Storage paths
    STORAGE_DIR: process.env.STORAGE_DIR || join(__dirname, '../../storage'),
    DOWNLOADS_DIR: process.env.DOWNLOADS_DIR || join(__dirname, '../../downloads'),
    
    // Safety features
    ENABLE_STEALTH: process.env.ENABLE_STEALTH !== 'false',
    USE_FINGERPRINTING: process.env.USE_FINGERPRINTING !== 'false',
    PERSIST_SESSIONS: process.env.PERSIST_SESSIONS !== 'false',
    TEST_MODE: process.env.TEST_MODE === 'true',
    
    // Advanced settings
    MAX_PAGES_PER_SESSION: parseInt(process.env.MAX_PAGES_PER_SESSION) || 5,
    MAX_ADS_PER_SESSION: parseInt(process.env.MAX_ADS_PER_SESSION) || 100,
    SESSION_RETIRE_AFTER: parseInt(process.env.SESSION_RETIRE_AFTER) || 15,
    RANDOM_USER_AGENT: process.env.RANDOM_USER_AGENT !== 'false',
    
    // Proxy settings
    PROXY_URL: process.env.PROXY_URL || null,
    
    // Meta Ads Library specific
    BASE_URL: 'https://www.facebook.com/ads/library/',
    
    // Selectors (may need updates if Facebook changes their HTML)
    SELECTORS: {
        AD_CARD: '._8n_0',
        AD_ID: '[data-testid="ad-library-ad-id"]',
        AD_TEXT: '[data-testid="ad-library-ad-text"]',
        AD_IMAGE: 'img[alt*="Ad"]',
        AD_VIDEO: 'video',
        AD_CTA: '[data-testid="ad-library-cta-button"]',
        PAGE_NAME: '[data-testid="ad-library-page-name"]',
        START_DATE: '[data-testid="ad-library-start-date"]',
        PLATFORMS: '[data-testid="ad-library-platforms"]',
        NEXT_BUTTON: 'a[aria-label="Go to next page"]',
        COOKIE_ACCEPT: 'button:has-text("Accept")',
    }
};