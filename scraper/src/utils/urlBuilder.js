/**
 * URL Builder utilities for Meta Ads Library
 */

export function parseAdLibraryUrl(url) {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    return {
        activeStatus: params.get('active_status') || 'all',
        adType: params.get('ad_type') || 'all',
        country: params.get('country') || 'ALL',
        mediaType: params.get('media_type') || 'all',
        searchType: params.get('search_type') || 'page',
        pageId: params.get('view_all_page_id'),
        keyword: params.get('q'),
        isTargetedCountry: params.get('is_targeted_country') === 'true',
        source: params.get('source')
    };
}

export function buildAdLibraryUrl(options = {}) {
    const baseUrl = 'https://www.facebook.com/ads/library/';
    const params = new URLSearchParams();
    
    // Set default values
    const defaults = {
        active_status: 'all',
        ad_type: 'all',
        country: 'ALL',
        media_type: 'all',
        search_type: 'page',
        is_targeted_country: 'false'
    };
    
    // Merge options with defaults
    const finalParams = { ...defaults, ...options };
    
    // Build query string
    Object.entries(finalParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            params.append(key, value);
        }
    });
    
    return `${baseUrl}?${params.toString()}`;
}

export function buildCompetitorUrl(pageId, options = {}) {
    return buildAdLibraryUrl({
        ...options,
        view_all_page_id: pageId,
        search_type: 'page'
    });
}

export function buildKeywordSearchUrl(keyword, options = {}) {
    return buildAdLibraryUrl({
        ...options,
        q: keyword,
        search_type: 'keyword_unordered'
    });
}