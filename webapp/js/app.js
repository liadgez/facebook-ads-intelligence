// Facebook Ads Intelligence Dashboard - Main Application
let adsData = [];
let filteredData = [];
let charts = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    document.getElementById('uploadBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    document.getElementById('searchInput').addEventListener('input', filterAds);
    document.getElementById('statusFilter').addEventListener('change', filterAds);
    document.getElementById('platformFilter').addEventListener('change', filterAds);
    document.getElementById('sortBy').addEventListener('change', sortAds);
    
    // Check for dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
        document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Don't load sample data on main dashboard - wait for real data upload
    // loadSampleData();
});

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            loadData(Array.isArray(data) ? data : [data]);
            showNotification('Data loaded successfully!', 'success');
        } catch (error) {
            showNotification('Error parsing JSON file', 'error');
            console.error('Error:', error);
        }
    };
    reader.readAsText(file);
}

// Load sample data
async function loadSampleData() {
    try {
        const response = await fetch('data/sample.json');
        if (response.ok) {
            const data = await response.json();
            loadData(data);
        }
    } catch (error) {
        console.log('Sample data not found');
    }
}

// Load data into the dashboard
function loadData(data) {
    adsData = data;
    filteredData = [...adsData];
    
    // Hide empty state
    document.getElementById('emptyState').style.display = 'none';
    
    // Update statistics
    updateStats();
    
    // Update charts
    updateCharts();
    
    // Display ads
    displayAds();
}

// Update statistics
function updateStats() {
    document.getElementById('totalAds').textContent = adsData.length;
    
    const activeCount = adsData.filter(ad => ad.performance?.metrics?.isActive).length;
    document.getElementById('activeAds').textContent = activeCount;
    
    const advertisers = new Set(adsData.map(ad => ad.advertiser?.name).filter(Boolean));
    document.getElementById('totalAdvertisers').textContent = advertisers.size;
    
    const totalWords = adsData.reduce((sum, ad) => sum + (ad.creative?.copy?.wordCount || 0), 0);
    const avgWords = adsData.length > 0 ? Math.round(totalWords / adsData.length) : 0;
    document.getElementById('avgWordCount').textContent = avgWords;
}

// Display ads in the grid
function displayAds() {
    const grid = document.getElementById('adsGrid');
    grid.innerHTML = '';
    
    if (filteredData.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">No ads match your filters</div>';
        return;
    }
    
    filteredData.forEach(ad => {
        const card = createAdCard(ad);
        grid.appendChild(card);
    });
}

// Create an ad card
function createAdCard(ad) {
    const card = document.createElement('div');
    card.className = 'ad-card bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer';
    card.onclick = () => showAdDetails(ad);
    
    // Get primary image
    const primaryImage = ad.creative?.media?.images?.[0]?.url || 'https://via.placeholder.com/400x200?text=No+Image';
    
    // Get emotional triggers
    const triggers = ad.creative?.emotional?.triggers || [];
    const triggerBadges = triggers.slice(0, 3).map(trigger => 
        `<span class="trigger-badge trigger-${trigger}">${trigger.replace('_', ' ')}</span>`
    ).join('');
    
    // Get platforms
    const platforms = ad.targeting?.platforms || ['facebook'];
    const platformIcons = platforms.map(platform => 
        `<span class="platform-icon platform-${platform}">
            <i class="fab fa-${platform === 'audience_network' ? 'buysellads' : platform}"></i>
        </span>`
    ).join('');
    
    card.innerHTML = `
        <div class="p-6">
            <!-- Image -->
            <div class="mb-4 -mx-6 -mt-6">
                <img src="${primaryImage}" 
                     alt="Ad creative" 
                     onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\\'http://www.w3.org/2000/svg\\\' width=\\\'400\\\' height=\\\'200\\\' viewBox=\\\'0 0 400 200\\\'%3E%3Crect width=\\\'400\\\' height=\\\'200\\\' fill=\\\'%23e5e7eb\\\'/%3E%3Ctext x=\\\'50%25\\\' y=\\\'50%25\\\' text-anchor=\\\'middle\\\' dy=\\\'.3em\\\' fill=\\\'%236b7280\\\' font-family=\\\'Arial\\\' font-size=\\\'16\\\'%3ENo Image Available%3C/text%3E%3C/svg%3E'"
                     class="w-full h-48 object-cover rounded-t-lg">
            </div>
            
            <!-- Advertiser -->
            <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                    ${ad.advertiser?.name || 'Unknown Advertiser'}
                </h3>
                <div class="flex gap-1">
                    ${platformIcons}
                </div>
            </div>
            
            <!-- Headline -->
            <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                ${ad.creative?.copy?.headline || 'No headline'}
            </h4>
            
            <!-- Copy Preview -->
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                ${ad.creative?.copy?.primaryText || 'No copy available'}
            </p>
            
            <!-- Triggers -->
            <div class="flex flex-wrap gap-2 mb-4">
                ${triggerBadges}
                ${triggers.length > 3 ? `<span class="text-xs text-gray-500">+${triggers.length - 3} more</span>` : ''}
            </div>
            
            <!-- Stats -->
            <div class="flex justify-between items-center text-sm">
                <div class="flex items-center gap-4">
                    <span class="text-gray-500 dark:text-gray-400">
                        <i class="fas fa-file-word mr-1"></i>
                        ${ad.creative?.copy?.wordCount || 0} words
                    </span>
                    <span class="text-gray-500 dark:text-gray-400">
                        <i class="fas fa-calendar mr-1"></i>
                        ${ad.performance?.metrics?.daysRunning || 0} days
                    </span>
                </div>
                <span class="${ad.performance?.metrics?.isActive ? 'text-success' : 'text-gray-400'}">
                    <i class="fas fa-circle text-xs mr-1"></i>
                    ${ad.performance?.metrics?.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
        </div>
    `;
    
    return card;
}

// Filter ads
function filterAds() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const platformFilter = document.getElementById('platformFilter').value;
    
    filteredData = adsData.filter(ad => {
        // Search filter
        if (searchTerm) {
            const searchableText = [
                ad.creative?.copy?.headline,
                ad.creative?.copy?.primaryText,
                ad.advertiser?.name,
                ad.creative?.copy?.ctaButton
            ].filter(Boolean).join(' ').toLowerCase();
            
            if (!searchableText.includes(searchTerm)) return false;
        }
        
        // Status filter
        if (statusFilter) {
            const isActive = ad.performance?.metrics?.isActive;
            if (statusFilter === 'active' && !isActive) return false;
            if (statusFilter === 'inactive' && isActive) return false;
        }
        
        // Platform filter
        if (platformFilter) {
            const platforms = ad.targeting?.platforms || [];
            if (!platforms.includes(platformFilter)) return false;
        }
        
        return true;
    });
    
    sortAds();
}

// Sort ads
function sortAds() {
    const sortBy = document.getElementById('sortBy').value;
    
    filteredData.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.metadata?.scrapedAt || 0) - new Date(a.metadata?.scrapedAt || 0);
            case 'oldest':
                return new Date(a.metadata?.scrapedAt || 0) - new Date(b.metadata?.scrapedAt || 0);
            case 'wordCount':
                return (b.creative?.copy?.wordCount || 0) - (a.creative?.copy?.wordCount || 0);
            case 'daysRunning':
                return (b.performance?.metrics?.daysRunning || 0) - (a.performance?.metrics?.daysRunning || 0);
            default:
                return 0;
        }
    });
    
    displayAds();
}

// Toggle dark mode
function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    document.getElementById('darkModeToggle').innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    // Update charts for dark mode
    if (charts.triggers) updateCharts();
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white shadow-lg fade-in z-50 ${
        type === 'success' ? 'bg-success' : 
        type === 'error' ? 'bg-danger' : 
        'bg-primary'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show ad details modal
function showAdDetails(ad) {
    const modal = document.getElementById('adModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = createAdDetailsHTML(ad);
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    document.getElementById('adModal').classList.add('hidden');
    document.body.style.overflow = '';
}

// Create ad details HTML
function createAdDetailsHTML(ad) {
    const images = ad.creative?.media?.images || [];
    const triggers = ad.creative?.emotional?.triggers || [];
    const platforms = ad.targeting?.platforms || ['facebook'];
    
    return `
        <!-- Header -->
        <div class="mb-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ${ad.advertiser?.name || 'Unknown Advertiser'}
            </h3>
            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span><i class="fas fa-fingerprint mr-1"></i> ID: ${ad.id}</span>
                <span class="${ad.performance?.metrics?.isActive ? 'text-success' : 'text-gray-400'}">
                    <i class="fas fa-circle text-xs mr-1"></i>
                    ${ad.performance?.metrics?.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
        </div>
        
        <!-- Images -->
        ${images.length > 0 ? `
            <div class="mb-6">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Creative Assets</h4>
                <div class="image-gallery">
                    ${images.map(img => `
                        <img src="${img.url}" alt="${img.alt || 'Ad image'}" 
                             onclick="window.open('${img.url}', '_blank')">
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <!-- Copy Analysis -->
        <div class="mb-6">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Copy Analysis</h4>
            
            ${ad.creative?.copy?.headline ? `
                <div class="mb-4">
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Headline</h5>
                    <p class="text-lg font-medium text-gray-900 dark:text-white">
                        ${ad.creative.copy.headline}
                    </p>
                </div>
            ` : ''}
            
            ${ad.creative?.copy?.primaryText ? `
                <div class="mb-4">
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Primary Text</h5>
                    <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        ${ad.creative.copy.primaryText}
                    </p>
                </div>
            ` : ''}
            
            ${ad.creative?.copy?.ctaButton ? `
                <div class="mb-4">
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Call to Action</h5>
                    <button class="bg-primary text-white px-4 py-2 rounded-lg">
                        ${ad.creative.copy.ctaButton}
                    </button>
                </div>
            ` : ''}
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Word Count</h5>
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">
                        ${ad.creative?.copy?.wordCount || 0}
                    </p>
                </div>
                <div>
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Personal Level</h5>
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">
                        ${Math.round((ad.creative?.emotional?.personalLevel || 0) * 100)}%
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Emotional Intelligence -->
        <div class="mb-6">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Emotional Intelligence</h4>
            
            <div class="mb-4">
                <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Triggers Detected</h5>
                <div class="flex flex-wrap gap-2">
                    ${triggers.map(trigger => 
                        `<span class="trigger-badge trigger-${trigger}">${trigger.replace('_', ' ')}</span>`
                    ).join('')}
                </div>
            </div>
            
            ${ad.creative?.emotional?.powerWords?.length > 0 ? `
                <div class="mb-4">
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Power Words</h5>
                    <div class="flex flex-wrap gap-2">
                        ${ad.creative.emotional.powerWords.map(word => 
                            `<span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                                ${word}
                            </span>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sentiment</h5>
                    <p class="text-lg font-semibold ${
                        ad.creative?.emotional?.sentiment === 'positive' ? 'text-success' :
                        ad.creative?.emotional?.sentiment === 'negative' ? 'text-danger' :
                        'text-gray-600'
                    }">
                        ${ad.creative?.emotional?.sentiment || 'Neutral'}
                    </p>
                </div>
                <div>
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Urgency Score</h5>
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">
                        ${ad.creative?.emotional?.urgency || 0}/10
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Strategic Analysis -->
        <div class="mb-6">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Strategic Analysis</h4>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Objective</h5>
                    <p class="text-gray-900 dark:text-white capitalize">
                        ${ad.strategy?.objective?.replace('_', ' ') || 'Unknown'}
                    </p>
                </div>
                <div>
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Positioning</h5>
                    <p class="text-gray-900 dark:text-white capitalize">
                        ${ad.strategy?.positioning?.replace('_', ' ') || 'Unknown'}
                    </p>
                </div>
                <div>
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Approach</h5>
                    <p class="text-gray-900 dark:text-white capitalize">
                        ${ad.strategy?.approach?.replace('_', ' ') || 'Unknown'}
                    </p>
                </div>
                <div>
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Target Audience</h5>
                    <p class="text-gray-900 dark:text-white uppercase">
                        ${ad.targeting?.audience?.type || 'General'}
                    </p>
                </div>
            </div>
            
            ${ad.strategy?.differentiators?.length > 0 ? `
                <div class="mt-4">
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Key Differentiators</h5>
                    <div class="flex flex-wrap gap-2">
                        ${ad.strategy.differentiators.map(diff => 
                            `<span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                                ${diff.replace('_', ' ')}
                            </span>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
        
        <!-- Campaign Details -->
        <div class="mb-6">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Campaign Details</h4>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</h5>
                    <p class="text-gray-900 dark:text-white">
                        ${ad.performance?.timeline?.startDate || 'Unknown'}
                    </p>
                </div>
                <div>
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Days Running</h5>
                    <p class="text-gray-900 dark:text-white">
                        ${ad.performance?.metrics?.daysRunning || 0}
                    </p>
                </div>
                <div>
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Platforms</h5>
                    <div class="flex gap-2">
                        ${platforms.map(platform => 
                            `<span class="platform-icon platform-${platform}">
                                <i class="fab fa-${platform === 'audience_network' ? 'buysellads' : platform}"></i>
                            </span>`
                        ).join('')}
                    </div>
                </div>
                <div>
                    <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Creative Count</h5>
                    <p class="text-gray-900 dark:text-white">
                        ${ad.performance?.metrics?.creativesCount || 1}
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Landing Page -->
        ${ad.funnel?.landing?.url ? `
            <div class="mb-6">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Landing Page</h4>
                <a href="${ad.funnel.landing.url}" target="_blank" 
                   class="inline-flex items-center text-primary hover:underline">
                    <i class="fas fa-external-link-alt mr-2"></i>
                    ${ad.funnel.landing.domain}
                </a>
            </div>
        ` : ''}
        
        <!-- Export Options -->
        <div class="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button onclick="exportAdAsJSON(${JSON.stringify(ad).replace(/"/g, '&quot;')})" 
                    class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <i class="fas fa-download mr-2"></i>Export JSON
            </button>
            <button onclick="copyAdText(${JSON.stringify(ad).replace(/"/g, '&quot;')})" 
                    class="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                <i class="fas fa-copy mr-2"></i>Copy Text
            </button>
        </div>
    `;
}

// Export ad as JSON
function exportAdAsJSON(ad) {
    const blob = new Blob([JSON.stringify(ad, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ad-${ad.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Ad exported as JSON', 'success');
}

// Copy ad text
function copyAdText(ad) {
    const text = `
${ad.advertiser?.name || 'Unknown Advertiser'}
${'-'.repeat(40)}

HEADLINE: ${ad.creative?.copy?.headline || 'N/A'}

PRIMARY TEXT:
${ad.creative?.copy?.primaryText || 'N/A'}

CTA: ${ad.creative?.copy?.ctaButton || 'N/A'}

EMOTIONAL TRIGGERS: ${ad.creative?.emotional?.triggers?.join(', ') || 'None'}
WORD COUNT: ${ad.creative?.copy?.wordCount || 0}
DAYS RUNNING: ${ad.performance?.metrics?.daysRunning || 0}
STATUS: ${ad.performance?.metrics?.isActive ? 'Active' : 'Inactive'}
    `.trim();
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Ad copy copied to clipboard', 'success');
    }).catch(() => {
        showNotification('Failed to copy text', 'error');
    });
}