// Advanced analysis functions for competitive intelligence

// Analyze copy patterns across all ads
function analyzeCopyPatterns() {
    const patterns = {
        headlines: {
            questions: 0,
            numbers: 0,
            urgency: 0,
            curiosity: 0,
            negative: 0,
            benefit: 0
        },
        copyLength: {
            short: 0,  // < 50 words
            medium: 0, // 50-150 words
            long: 0    // > 150 words
        },
        readability: {
            simple: 0,   // < 10 words per sentence
            moderate: 0, // 10-20 words per sentence
            complex: 0   // > 20 words per sentence
        },
        hooks: [],
        formulas: {
            pas: 0,    // Problem-Agitate-Solution
            aida: 0,   // Attention-Interest-Desire-Action
            bab: 0,    // Before-After-Bridge
            fab: 0     // Features-Advantages-Benefits
        }
    };
    
    adsData.forEach(ad => {
        const headline = ad.creative?.copy?.headline || '';
        const primaryText = ad.creative?.copy?.primaryText || '';
        const wordCount = ad.creative?.copy?.wordCount || 0;
        
        // Analyze headlines
        if (headline) {
            if (headline.includes('?')) patterns.headlines.questions++;
            if (/\d+/.test(headline)) patterns.headlines.numbers++;
            if (/now|today|hurry|limited|fast/i.test(headline)) patterns.headlines.urgency++;
            if (/secret|discover|revealed|hidden/i.test(headline)) patterns.headlines.curiosity++;
            if (/don't|never|stop|avoid|mistake/i.test(headline)) patterns.headlines.negative++;
            if (/benefit|advantage|improve|boost|increase/i.test(headline)) patterns.headlines.benefit++;
        }
        
        // Analyze copy length
        if (wordCount < 50) patterns.copyLength.short++;
        else if (wordCount <= 150) patterns.copyLength.medium++;
        else patterns.copyLength.long++;
        
        // Analyze readability (approximate)
        if (primaryText) {
            const sentences = primaryText.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const avgWordsPerSentence = wordCount / sentences.length;
            
            if (avgWordsPerSentence < 10) patterns.readability.simple++;
            else if (avgWordsPerSentence <= 20) patterns.readability.moderate++;
            else patterns.readability.complex++;
            
            // Extract opening hooks (first sentence)
            if (sentences[0]) {
                patterns.hooks.push(sentences[0].trim());
            }
            
            // Detect copy formulas
            if (detectPASFormula(primaryText)) patterns.formulas.pas++;
            if (detectAIDAFormula(primaryText)) patterns.formulas.aida++;
            if (detectBABFormula(primaryText)) patterns.formulas.bab++;
        }
    });
    
    return patterns;
}

// Detect Problem-Agitate-Solution formula
function detectPASFormula(text) {
    const problemWords = /problem|issue|struggle|challenge|frustrat|difficult/i;
    const agitateWords = /worse|terrible|awful|devastating|painful|costly/i;
    const solutionWords = /solution|solve|answer|fix|help|discover/i;
    
    return problemWords.test(text) && agitateWords.test(text) && solutionWords.test(text);
}

// Detect AIDA formula
function detectAIDAFormula(text) {
    const attentionWords = /attention|warning|alert|discover|new|revolutionary/i;
    const interestWords = /interesting|curious|wonder|imagine|think about/i;
    const desireWords = /want|need|desire|wish|dream|love/i;
    const actionWords = /click|buy|order|start|get|join|learn more/i;
    
    return attentionWords.test(text) && actionWords.test(text);
}

// Detect Before-After-Bridge formula
function detectBABFormula(text) {
    const beforeWords = /before|currently|now|today|problem|struggle/i;
    const afterWords = /after|imagine|picture|visualize|could be|will be/i;
    const bridgeWords = /here's how|the solution|the answer|the way/i;
    
    return beforeWords.test(text) && afterWords.test(text) && bridgeWords.test(text);
}

// Generate competitive insights
function generateCompetitiveInsights() {
    const insights = {
        topPerformers: [],
        emotionalStrategy: {},
        copyFormulas: {},
        recommendations: []
    };
    
    // Find top performing ads (by days running)
    insights.topPerformers = adsData
        .filter(ad => ad.performance?.metrics?.daysRunning > 30)
        .sort((a, b) => b.performance.metrics.daysRunning - a.performance.metrics.daysRunning)
        .slice(0, 5);
    
    // Analyze emotional strategy
    const emotionalUsage = {};
    adsData.forEach(ad => {
        const triggers = ad.creative?.emotional?.triggers || [];
        triggers.forEach(trigger => {
            if (!emotionalUsage[trigger]) {
                emotionalUsage[trigger] = { count: 0, avgDaysRunning: 0, ads: [] };
            }
            emotionalUsage[trigger].count++;
            emotionalUsage[trigger].ads.push(ad.performance?.metrics?.daysRunning || 0);
        });
    });
    
    // Calculate average performance by emotional trigger
    Object.keys(emotionalUsage).forEach(trigger => {
        const data = emotionalUsage[trigger];
        data.avgDaysRunning = data.ads.reduce((a, b) => a + b, 0) / data.ads.length;
    });
    
    insights.emotionalStrategy = emotionalUsage;
    
    // Copy formula effectiveness
    const patterns = analyzeCopyPatterns();
    insights.copyFormulas = patterns.formulas;
    
    // Generate recommendations
    insights.recommendations = generateRecommendations(insights, patterns);
    
    return insights;
}

// Generate actionable recommendations
function generateRecommendations(insights, patterns) {
    const recommendations = [];
    
    // Emotional trigger recommendations
    const bestTrigger = Object.entries(insights.emotionalStrategy)
        .sort(([,a], [,b]) => b.avgDaysRunning - a.avgDaysRunning)[0];
    
    if (bestTrigger) {
        recommendations.push({
            type: 'emotional',
            priority: 'high',
            title: 'Leverage High-Performing Emotional Triggers',
            description: `Ads using "${bestTrigger[0]}" triggers run ${Math.round(bestTrigger[1].avgDaysRunning)}% longer on average. Consider incorporating this in your copy.`
        });
    }
    
    // Copy length recommendations
    const lengthDistribution = patterns.copyLength;
    const dominantLength = Object.entries(lengthDistribution)
        .sort(([,a], [,b]) => b - a)[0][0];
    
    recommendations.push({
        type: 'structure',
        priority: 'medium',
        title: 'Optimize Copy Length',
        description: `${Math.round((lengthDistribution[dominantLength] / adsData.length) * 100)}% of ads use ${dominantLength} copy length. This appears to be the industry standard.`
    });
    
    // Headline pattern recommendations
    const headlinePatterns = patterns.headlines;
    const topPattern = Object.entries(headlinePatterns)
        .sort(([,a], [,b]) => b - a)[0];
    
    recommendations.push({
        type: 'headline',
        priority: 'high',
        title: 'Apply Proven Headline Formulas',
        description: `Headlines with ${topPattern[0]} are used in ${topPattern[1]} ads. This pattern shows strong engagement.`
    });
    
    // Platform strategy
    const platformUsage = {};
    adsData.forEach(ad => {
        const platforms = ad.targeting?.platforms || [];
        platforms.forEach(p => {
            platformUsage[p] = (platformUsage[p] || 0) + 1;
        });
    });
    
    if (Object.keys(platformUsage).length > 1) {
        recommendations.push({
            type: 'platform',
            priority: 'medium',
            title: 'Multi-Platform Strategy',
            description: 'Consider running ads across multiple platforms. Cross-platform campaigns show higher reach and engagement.'
        });
    }
    
    return recommendations;
}

// Compare two advertisers
function compareAdvertisers(advertiser1, advertiser2) {
    const ads1 = adsData.filter(ad => ad.advertiser?.name === advertiser1);
    const ads2 = adsData.filter(ad => ad.advertiser?.name === advertiser2);
    
    const comparison = {
        advertiser1: analyzeAdvertiser(ads1, advertiser1),
        advertiser2: analyzeAdvertiser(ads2, advertiser2)
    };
    
    return comparison;
}

// Analyze single advertiser
function analyzeAdvertiser(ads, name) {
    if (ads.length === 0) return null;
    
    const analysis = {
        name: name,
        totalAds: ads.length,
        activeAds: ads.filter(ad => ad.performance?.metrics?.isActive).length,
        avgWordCount: Math.round(ads.reduce((sum, ad) => sum + (ad.creative?.copy?.wordCount || 0), 0) / ads.length),
        avgDaysRunning: Math.round(ads.reduce((sum, ad) => sum + (ad.performance?.metrics?.daysRunning || 0), 0) / ads.length),
        emotionalProfile: {},
        primaryStrategy: '',
        platforms: new Set()
    };
    
    // Build emotional profile
    ads.forEach(ad => {
        const triggers = ad.creative?.emotional?.triggers || [];
        triggers.forEach(trigger => {
            analysis.emotionalProfile[trigger] = (analysis.emotionalProfile[trigger] || 0) + 1;
        });
        
        const platforms = ad.targeting?.platforms || [];
        platforms.forEach(p => analysis.platforms.add(p));
    });
    
    // Determine primary strategy
    const strategies = ads.map(ad => ad.strategy?.positioning).filter(Boolean);
    const strategyCounts = strategies.reduce((acc, s) => {
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});
    
    analysis.primaryStrategy = Object.entries(strategyCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'mixed';
    
    analysis.platforms = Array.from(analysis.platforms);
    
    return analysis;
}

// Export analysis report
function exportAnalysisReport() {
    const insights = generateCompetitiveInsights();
    const patterns = analyzeCopyPatterns();
    
    const report = {
        metadata: {
            generatedAt: new Date().toISOString(),
            totalAds: adsData.length,
            dateRange: {
                earliest: Math.min(...adsData.map(ad => new Date(ad.performance?.timeline?.startDate || Date.now()))),
                latest: new Date()
            }
        },
        insights: insights,
        patterns: patterns,
        advertisers: [...new Set(adsData.map(ad => ad.advertiser?.name).filter(Boolean))].map(name => 
            analyzeAdvertiser(adsData.filter(ad => ad.advertiser?.name === name), name)
        )
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competitive-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Generate CSV export
function exportToCSV() {
    const headers = [
        'ID', 'Advertiser', 'Headline', 'Word Count', 'CTA', 
        'Days Running', 'Status', 'Platforms', 'Emotional Triggers',
        'Objective', 'Positioning', 'Start Date'
    ];
    
    const rows = adsData.map(ad => [
        ad.id,
        ad.advertiser?.name || '',
        ad.creative?.copy?.headline || '',
        ad.creative?.copy?.wordCount || 0,
        ad.creative?.copy?.ctaButton || '',
        ad.performance?.metrics?.daysRunning || 0,
        ad.performance?.metrics?.isActive ? 'Active' : 'Inactive',
        (ad.targeting?.platforms || []).join('; '),
        (ad.creative?.emotional?.triggers || []).join('; '),
        ad.strategy?.objective || '',
        ad.strategy?.positioning || '',
        ad.performance?.timeline?.startDate || ''
    ]);
    
    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facebook-ads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}