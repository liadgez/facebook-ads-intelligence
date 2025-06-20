import { log } from 'crawlee';

/**
 * Simulates human-like scrolling behavior
 */
export async function humanLikeScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const scrollStep = 50 + Math.random() * 150; // Random scroll distance
            const scrollDelay = 100 + Math.random() * 200; // Random delay
            
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                const randomScroll = scrollStep + (Math.random() - 0.5) * 50; // Add some variance
                
                window.scrollBy(0, randomScroll);
                totalHeight += randomScroll;

                // Sometimes scroll up a bit (human behavior)
                if (Math.random() < 0.1) {
                    window.scrollBy(0, -20 - Math.random() * 30);
                }

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    // Final scroll to very bottom
                    window.scrollTo(0, document.body.scrollHeight);
                    setTimeout(resolve, 500 + Math.random() * 1000);
                }
            }, scrollDelay);
        });
    });
}

/**
 * Simulates random mouse movements
 */
export async function randomMouseMovements(page) {
    const viewport = await page.viewportSize();
    if (!viewport) return;
    
    const movements = 2 + Math.floor(Math.random() * 3); // 2-4 movements
    
    for (let i = 0; i < movements; i++) {
        const x = Math.random() * viewport.width;
        const y = Math.random() * viewport.height;
        
        await page.mouse.move(x, y, {
            steps: 10 + Math.floor(Math.random() * 20) // Smooth movement
        });
        
        await page.waitForTimeout(200 + Math.random() * 300);
    }
}

/**
 * Random delay between actions
 */
export async function humanDelay(minMs = 1000, maxMs = 3000) {
    const delay = minMs + Math.random() * (maxMs - minMs);
    await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Simulates reading behavior with random pauses
 */
export async function simulateReading(page, minTime = 2000, maxTime = 5000) {
    const readTime = minTime + Math.random() * (maxTime - minTime);
    
    // Sometimes move mouse while "reading"
    if (Math.random() < 0.3) {
        await randomMouseMovements(page);
    }
    
    await page.waitForTimeout(readTime);
}

/**
 * Click with human-like behavior
 */
export async function humanClick(page, selector) {
    const element = await page.$(selector);
    if (!element) return false;
    
    // Move mouse to element first
    await element.hover();
    await humanDelay(100, 300);
    
    // Sometimes move slightly before clicking
    if (Math.random() < 0.3) {
        const box = await element.boundingBox();
        if (box) {
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;
            await page.mouse.move(
                box.x + box.width / 2 + offsetX,
                box.y + box.height / 2 + offsetY
            );
        }
    }
    
    await humanDelay(50, 150);
    await element.click();
    
    return true;
}

/**
 * Type with human-like speed and occasional typos
 */
export async function humanType(page, selector, text) {
    await page.click(selector);
    await humanDelay(200, 500);
    
    for (const char of text) {
        await page.type(selector, char);
        
        // Variable typing speed
        const baseDelay = 50 + Math.random() * 150;
        
        // Occasionally pause longer (thinking)
        const longPause = Math.random() < 0.1 ? 300 + Math.random() * 700 : 0;
        
        await page.waitForTimeout(baseDelay + longPause);
    }
}

/**
 * Generate random viewport size (desktop)
 */
export function getRandomViewport() {
    const viewports = [
        { width: 1920, height: 1080 }, // Full HD
        { width: 1366, height: 768 },  // Popular laptop
        { width: 1440, height: 900 },  // MacBook
        { width: 1536, height: 864 },  // Surface
        { width: 1680, height: 1050 }, // Larger screen
    ];
    
    const viewport = viewports[Math.floor(Math.random() * viewports.length)];
    
    // Add slight variance
    return {
        width: viewport.width + Math.floor((Math.random() - 0.5) * 20),
        height: viewport.height + Math.floor((Math.random() - 0.5) * 20)
    };
}