/**
 * ========================================
 * MUTUAL FUND ANALYZER - API FUNCTIONS
 * ========================================
 */

/**
 * Base API configuration
 */
const API_CONFIG = {
    BASE_URL: 'https://api.mfapi.in',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
};

/**
 * Make HTTP request with error handling and retry logic
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response data
 */
const makeApiRequest = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Data not found. Please try a different fund or category.');
            } else if (response.status >= 500) {
                throw new Error('Server error. Please try again later.');
            } else if (response.status === 429) {
                throw new Error('Too many requests. Please wait a moment and try again.');
            } else {
                throw new Error(`Request failed with status ${response.status}`);
            }
        }
        
        const data = await response.json();
        
        // Validate response data
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response format from server');
        }
        
        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        
        // Provide more specific error messages
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your internet connection.');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
        }
        
        throw error;
    }
};

/**
 * Retry wrapper for API calls
 * @param {Function} apiCall - API function to retry
 * @param {number} attempts - Number of retry attempts
 * @returns {Promise<any>} API response
 */
const retryApiCall = async (apiCall, attempts = API_CONFIG.RETRY_ATTEMPTS) => {
    for (let i = 0; i < attempts; i++) {
        try {
            return await apiCall();
        } catch (error) {
            if (i === attempts - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (i + 1)));
        }
    }
};

/**
 * Fetch all mutual funds list
 * @returns {Promise<Array>} Array of all mutual funds
 */
const fetchAllFunds = async () => {
    return await retryApiCall(async () => {
        const data = await makeApiRequest(`${API_CONFIG.BASE_URL}/mf`);
        return data;
    });
};

/**
 * Fetch NAV history for a specific fund
 * @param {string} schemeCode - Fund scheme code
 * @returns {Promise<Array>} NAV history data
 */
const fetchNavHistory = async (schemeCode) => {
    return await retryApiCall(async () => {
        const result = await makeApiRequest(`${API_CONFIG.BASE_URL}/mf/${schemeCode}`);
        return result.data || [];
    });
};

/**
 * Get benchmark name based on fund category
 * @param {string} fundName - Fund name to analyze
 * @returns {string} Appropriate benchmark name
 */
const getBenchmarkName = (fundName) => {
    const name = fundName.toLowerCase();
    
    const benchmarkMap = {
        'flexi cap': 'Nifty 500 TRI',
        'flexicap': 'Nifty 500 TRI',
        'large cap': 'Nifty 100 TRI',
        'mid cap': 'Nifty Midcap 150 TRI',
        'small cap': 'Nifty Smallcap 250 TRI',
        'large & mid cap': 'Nifty LargeMidcap 250 TRI',
        'large and mid cap': 'Nifty LargeMidcap 250 TRI',
        'multi cap': 'Nifty 500 TRI',
        'value': 'Nifty 500 Value TRI',
        'contra': 'Nifty 500 Value TRI',
        'focused': 'Nifty 500 TRI',
        'elss': 'Nifty 500 TRI',
        'tax saver': 'Nifty 500 TRI',
        'dividend yield': 'Nifty 500 Dividend Opportunities 50 TRI',
        'aggressive hybrid': 'Nifty 50 TRI (65%) + CRISIL Liquid TRI (35%)',
        'equity hybrid': 'Nifty 50 TRI (65%) + CRISIL Liquid TRI (35%)',
        'conservative hybrid': 'Nifty 50 TRI (25%) + CRISIL Liquid TRI (75%)',
        'balanced advantage': 'Nifty 50 TRI (50%) + CRISIL Liquid TRI (50%)',
        'dynamic asset allocation': 'Nifty 50 TRI (50%) + CRISIL Liquid TRI (50%)',
        'equity savings': 'Nifty 50 TRI (30%) + CRISIL Liquid TRI (70%)',
        'multi asset': 'Nifty 50 TRI (40%) + CRISIL Liquid TRI (40%) + Gold (20%)',
        'international': 'MSCI World TRI',
        'global': 'MSCI World TRI',
        'banking': 'Nifty Bank TRI',
        'psu': 'Nifty Bank TRI',
        'corporate bond': 'CRISIL AAA 10Yr Gilt TRI',
        'liquid': 'CRISIL Liquid TRI',
        'overnight': 'CRISIL Liquid TRI',
        'ultra short': 'CRISIL Ultra Short Term TRI',
        'arbitrage': 'CRISIL Liquid TRI'
    };
    
    // Check for exact matches first
    for (const [keyword, benchmark] of Object.entries(benchmarkMap)) {
        if (name.includes(keyword)) {
            return benchmark;
        }
    }
    
    // Default benchmark
    return 'Nifty 500 TRI';
};

/**
 * Generate simulated benchmark data based on fund performance
 * @param {Array} navData - Fund NAV data
 * @param {string} benchmarkName - Benchmark name
 * @returns {Array} Simulated benchmark data
 */
const generateBenchmarkData = (navData, benchmarkName) => {
    const benchmarkReturns = [];
    const startValue = 100;
    let currentValue = startValue;
    
    for (let i = 1; i < navData.length; i++) {
        const fundReturn = (parseFloat(navData[i].nav) - parseFloat(navData[i-1].nav)) / parseFloat(navData[i-1].nav);
        let benchmarkReturn;
        
        // Simulate benchmark returns based on fund category
        if (benchmarkName.includes('Nifty 500')) {
            benchmarkReturn = fundReturn * 0.85 + (Math.random() - 0.5) * 0.015;
        } else if (benchmarkName.includes('Nifty 50')) {
            benchmarkReturn = fundReturn * 0.75 + (Math.random() - 0.5) * 0.02;
        } else if (benchmarkName.includes('Midcap') || benchmarkName.includes('Smallcap')) {
            benchmarkReturn = fundReturn * 0.6 + (Math.random() - 0.5) * 0.025;
        } else {
            benchmarkReturn = fundReturn * 0.7 + (Math.random() - 0.5) * 0.02;
        }
        
        currentValue *= (1 + benchmarkReturn);
        benchmarkReturns.push({ 
            date: navData[i].date, 
            value: currentValue 
        });
    }
    
    return benchmarkReturns;
};

/**
 * Filter NAV data for the last N years
 * @param {Array} navHistory - Complete NAV history
 * @param {number} years - Number of years to filter
 * @returns {Array} Filtered NAV data
 */
const filterNavDataByYears = (navHistory, years) => {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - years);
    
    return navHistory.filter(entry => {
        const [day, month, year] = entry.date.split('-');
        const entryDate = new Date(`${year}-${month}-${day}`);
        return entryDate >= cutoffDate;
    }).reverse();
};

/**
 * Validate fund data completeness
 * @param {Array} navData - NAV data to validate
 * @param {number} minDays - Minimum required days
 * @returns {boolean} True if data is sufficient
 */
const validateNavData = (navData, minDays = 252) => {
    return navData && 
           Array.isArray(navData) && 
           navData.length >= minDays &&
           navData.every(entry => entry.date && entry.nav);
};

/**
 * Calculate fund inception date
 * @param {Array} navHistory - NAV history data
 * @returns {Date} Fund inception date
 */
const getFundInceptionDate = (navHistory) => {
    if (!navHistory || navHistory.length === 0) return null;
    
    const oldestEntry = navHistory[0];
    const [day, month, year] = oldestEntry.date.split('-');
    return new Date(`${year}-${month}-${day}`);
};

/**
 * Check if fund has sufficient history for analysis
 * @param {Array} navHistory - NAV history data
 * @param {number} requiredYears - Required years of history
 * @returns {boolean} True if fund has sufficient history
 */
const hasSufficientHistory = (navHistory, requiredYears) => {
    const inceptionDate = getFundInceptionDate(navHistory);
    if (!inceptionDate) return false;
    
    const requiredDate = new Date();
    requiredDate.setFullYear(requiredDate.getFullYear() - requiredYears);
    
    return inceptionDate <= requiredDate;
};

/**
 * Cache for API responses with size limits
 */
const apiCache = new Map();
const MAX_CACHE_SIZE = 50; // Maximum number of cached items
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get cached data or fetch from API
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data if not cached
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 * @returns {Promise<any>} Cached or fresh data
 */
const getCachedData = async (key, fetchFunction, ttl = CACHE_TTL) => {
    const cached = apiCache.get(key);
    
    if (cached && (Date.now() - cached.timestamp) < ttl) {
        return cached.data;
    }
    
    // Check cache size and clean up if necessary
    if (apiCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = apiCache.keys().next().value;
        apiCache.delete(oldestKey);
    }
    
    const data = await fetchFunction();
    apiCache.set(key, {
        data,
        timestamp: Date.now()
    });
    
    return data;
};

/**
 * Clear API cache
 */
const clearApiCache = () => {
    apiCache.clear();
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
const getCacheStats = () => {
    return {
        size: apiCache.size,
        keys: Array.from(apiCache.keys())
    };
};

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchAllFunds,
        fetchNavHistory,
        getBenchmarkName,
        generateBenchmarkData,
        filterNavDataByYears,
        validateNavData,
        getFundInceptionDate,
        hasSufficientHistory,
        getCachedData,
        clearApiCache,
        getCacheStats,
        API_CONFIG
    };
}
