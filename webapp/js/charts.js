// Chart configuration and updates
function updateCharts() {
    updateTriggersChart();
    updateTimelineChart();
}

// Update emotional triggers chart
function updateTriggersChart() {
    const ctx = document.getElementById('triggersChart').getContext('2d');
    
    // Count triggers
    const triggerCounts = {};
    adsData.forEach(ad => {
        const triggers = ad.creative?.emotional?.triggers || [];
        triggers.forEach(trigger => {
            triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
    });
    
    // Format data for chart
    const labels = Object.keys(triggerCounts).map(t => t.replace('_', ' '));
    const data = Object.values(triggerCounts);
    
    // Colors for triggers
    const triggerColors = {
        fear: '#fbbf24',
        greed: '#10b981',
        urgency: '#ef4444',
        social_proof: '#3b82f6',
        trust: '#8b5cf6',
        curiosity: '#a855f7',
        exclusivity: '#ec4899'
    };
    
    const backgroundColor = Object.keys(triggerCounts).map(trigger => 
        triggerColors[trigger] || '#6b7280'
    );
    
    // Destroy existing chart
    if (charts.triggers) {
        charts.triggers.destroy();
    }
    
    // Create new chart
    charts.triggers = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColor,
                borderWidth: 2,
                borderColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        },
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#4b5563'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update timeline chart
function updateTimelineChart() {
    const ctx = document.getElementById('timelineChart').getContext('2d');
    
    // Group ads by month
    const monthlyData = {};
    adsData.forEach(ad => {
        const startDate = ad.performance?.timeline?.startDate;
        if (!startDate) return;
        
        const date = new Date(startDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    
    // Sort by date and get last 6 months
    const sortedMonths = Object.keys(monthlyData).sort();
    const last6Months = sortedMonths.slice(-6);
    
    // Format labels
    const labels = last6Months.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    const data = last6Months.map(month => monthlyData[month]);
    
    // Destroy existing chart
    if (charts.timeline) {
        charts.timeline.destroy();
    }
    
    // Create new chart
    charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ads Launched',
                data: data,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} ads launched`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                    },
                    grid: {
                        color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                    }
                }
            }
        }
    });
}

// Additional chart types for analysis page
function createWordCloudData() {
    const wordFrequency = {};
    
    adsData.forEach(ad => {
        const text = [
            ad.creative?.copy?.headline,
            ad.creative?.copy?.primaryText
        ].filter(Boolean).join(' ').toLowerCase();
        
        // Extract meaningful words (exclude common words)
        const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'some', 'any', 'few', 'more', 'most', 'other', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just']);
        
        const words = text.match(/\b\w{4,}\b/g) || [];
        words.forEach(word => {
            if (!commonWords.has(word)) {
                wordFrequency[word] = (wordFrequency[word] || 0) + 1;
            }
        });
    });
    
    // Get top 50 words
    return Object.entries(wordFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 50)
        .map(([word, count]) => ({ word, count }));
}

// Create positioning matrix chart
function createPositioningMatrix() {
    const positioningData = {
        premium: { urgency: 0, count: 0 },
        value: { urgency: 0, count: 0 },
        innovation_leader: { urgency: 0, count: 0 },
        trusted_authority: { urgency: 0, count: 0 }
    };
    
    adsData.forEach(ad => {
        const positioning = ad.strategy?.positioning;
        const urgency = ad.creative?.emotional?.urgency || 0;
        
        if (positioning && positioningData[positioning]) {
            positioningData[positioning].urgency += urgency;
            positioningData[positioning].count += 1;
        }
    });
    
    // Calculate averages
    const matrixData = Object.entries(positioningData)
        .filter(([, data]) => data.count > 0)
        .map(([positioning, data]) => ({
            x: data.urgency / data.count,
            y: data.count,
            label: positioning.replace('_', ' '),
            r: Math.sqrt(data.count) * 10
        }));
    
    return matrixData;
}

// Create platform distribution chart
function createPlatformChart() {
    const platformCounts = {};
    
    adsData.forEach(ad => {
        const platforms = ad.targeting?.platforms || ['facebook'];
        platforms.forEach(platform => {
            platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });
    });
    
    return {
        labels: Object.keys(platformCounts).map(p => p.replace('_', ' ')),
        data: Object.values(platformCounts)
    };
}

// Export chart as image
function exportChart(chartId) {
    const canvas = document.getElementById(chartId);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
    a.click();
}