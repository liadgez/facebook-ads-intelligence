/**
 * Media Downloader utilities for saving ad images and videos
 */

import { mkdir, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { config } from '../config/config.js';

export async function downloadMedia(page, adData) {
    const downloads = {
        images: [],
        videos: [],
        landingPageScreenshot: null
    };
    
    if (!config.DOWNLOAD_MEDIA) {
        return downloads;
    }
    
    // Create directory structure
    const adDir = await createAdDirectory(adData);
    
    // Download images
    if (config.DOWNLOAD_IMAGES && adData.media?.images?.length > 0) {
        for (let i = 0; i < adData.media.images.length; i++) {
            const image = adData.media.images[i];
            const filename = `image_${i + 1}${getExtension(image.url)}`;
            const filepath = join(adDir, filename);
            
            try {
                await downloadFile(page, image.url, filepath);
                downloads.images.push({
                    originalUrl: image.url,
                    localPath: filepath,
                    alt: image.alt
                });
            } catch (error) {
                console.error(`Failed to download image: ${error.message}`);
            }
        }
    }
    
    // Download videos
    if (config.DOWNLOAD_VIDEOS && adData.media?.videos?.length > 0) {
        for (let i = 0; i < adData.media.videos.length; i++) {
            const video = adData.media.videos[i];
            const filename = `video_${i + 1}.mp4`;
            const filepath = join(adDir, filename);
            
            try {
                await downloadFile(page, video.url, filepath);
                downloads.videos.push({
                    originalUrl: video.url,
                    localPath: filepath,
                    poster: video.poster
                });
                
                // Also download video poster if available
                if (video.poster) {
                    const posterFilename = `video_${i + 1}_poster.jpg`;
                    const posterPath = join(adDir, posterFilename);
                    await downloadFile(page, video.poster, posterPath);
                }
            } catch (error) {
                console.error(`Failed to download video: ${error.message}`);
            }
        }
    }
    
    // Take screenshot of landing page
    if (config.SAVE_LANDING_PAGES && adData.landingPage) {
        try {
            const screenshotPath = join(adDir, 'landing_page.png');
            await captureLandingPage(page, adData.landingPage, screenshotPath);
            downloads.landingPageScreenshot = screenshotPath;
        } catch (error) {
            console.error(`Failed to capture landing page: ${error.message}`);
        }
    }
    
    return downloads;
}

async function createAdDirectory(adData) {
    const date = new Date().toISOString().split('T')[0];
    const pageName = sanitizeFilename(adData.pageName || 'unknown');
    const adId = adData.id || `ad_${Date.now()}`;
    
    const dirPath = join(
        config.DOWNLOADS_DIR,
        pageName,
        date,
        adId
    );
    
    await mkdir(dirPath, { recursive: true });
    return dirPath;
}

async function downloadFile(page, url, filepath) {
    try {
        const response = await page.context().request.get(url);
        const buffer = await response.body();
        await writeFile(filepath, buffer);
        console.log(`Downloaded: ${filepath}`);
    } catch (error) {
        console.error(`Download failed for ${url}: ${error.message}`);
        throw error;
    }
}

async function captureLandingPage(page, url, filepath) {
    const newPage = await page.context().newPage();
    
    try {
        await newPage.goto(url, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await newPage.screenshot({
            path: filepath,
            fullPage: true
        });
        
        console.log(`Captured landing page: ${filepath}`);
    } finally {
        await newPage.close();
    }
}

function getExtension(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const ext = extname(pathname);
        return ext || '.jpg'; // Default to .jpg if no extension
    } catch {
        return '.jpg';
    }
}

function sanitizeFilename(name) {
    return name
        .replace(/[^a-z0-9_-]/gi, '_')
        .replace(/_+/g, '_')
        .substring(0, 50);
}