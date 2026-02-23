/**
 * ========================================
 * MUTUAL FUND ANALYZER - UTILITY FUNCTIONS
 * ========================================
 */

/**
 * Calculate the mean (average) of an array of numbers
 * @param {number[]} data - Array of numbers
 * @returns {number} Mean value
 */
const calculateMean = (data) => {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
};

/**
 * Calculate the standard deviation of an array of numbers
 * @param {number[]} data - Array of numbers
 * @param {number} mean - Mean value of the data
 * @returns {number} Standard deviation
 */
const calculateStandardDeviation = (data, mean) => {
    if (!data || data.length < 2) return 0;
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = calculateMean(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
};

/**
 * Calculate downside deviation for Sortino ratio
 * @param {number[]} data - Array of returns
 * @param {number} target - Target return rate
 * @returns {number} Downside deviation
 */
const calculateDownsideDeviation = (data, target) => {
    if (!data || data.length === 0) return 0;
    const downsideReturns = data.filter(r => r < target).map(r => Math.pow(r - target, 2));
    if (downsideReturns.length === 0) return 0;
    const downsideVariance = downsideReturns.reduce((acc, val) => acc + val, 0) / data.length;
    return Math.sqrt(downsideVariance);
};

/**
 * Get color styling based on fund rank
 * @param {number} rank - Fund rank (1-based)
 * @param {number} total - Total number of funds
 * @returns {Object} CSS style object
 */
const getRankColor = (rank, total) => {
    // Use CSS classes instead of inline styles for better theme support
    return {};
};

/**
 * Format percentage values
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
const formatPercentage = (value, decimals = 2) => {
    if (isNaN(value)) return 'N/A';
    return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format ratio values
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted ratio string
 */
const formatRatio = (value, decimals = 2) => {
    if (isNaN(value)) return 'N/A';
    return value.toFixed(decimals);
};

/**
 * Validate fund data
 * @param {Object} fund - Fund object to validate
 * @returns {boolean} True if fund data is valid
 */
const isValidFund = (fund) => {
    return fund && 
           fund.schemeCode && 
           fund.schemeName && 
           !isNaN(fund.rollingReturn3yr) && 
           !isNaN(fund.rollingReturn5yr) && 
           !isNaN(fund.sharpe3yr) && 
           !isNaN(fund.sharpe5yr) && 
           !isNaN(fund.sortino3yr) && 
           !isNaN(fund.sortino5yr) && 
           !isNaN(fund.sd3yr) && 
           !isNaN(fund.sd5yr);
};

/**
 * Normalize value between min and max
 * @param {number} value - Value to normalize
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Normalized value (0-1)
 */
const normalize = (value, min, max) => {
    return (max === min) ? 1 : (value - min) / (max - min);
};

/**
 * Normalize value inversely (higher values get lower scores)
 * @param {number} value - Value to normalize
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Inversely normalized value (0-1)
 */
const normalizeInverted = (value, min, max) => {
    return (max === min) ? 1 : 1 - ((value - min) / (max - min));
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Format date string from DD-MM-YYYY to readable format
 * @param {string} dateStr - Date string in DD-MM-YYYY format
 * @returns {string} Formatted date string
 */
const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * Calculate days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Number of days between dates
 */
const daysBetween = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
};

/**
 * Check if a date is within the last N years
 * @param {Date} date - Date to check
 * @param {number} years - Number of years
 * @returns {boolean} True if date is within the period
 */
const isWithinYears = (date, years) => {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - years);
    return date >= cutoffDate;
};

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if value is empty or null
 * @param {any} value - Value to check
 * @returns {boolean} True if value is empty
 */
const isEmpty = (value) => {
    return value === null || value === undefined || value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateMean,
        calculateStandardDeviation,
        calculateDownsideDeviation,
        getRankColor,
        formatPercentage,
        formatRatio,
        isValidFund,
        normalize,
        normalizeInverted,
        debounce,
        formatDate,
        daysBetween,
        isWithinYears,
        generateId,
        deepClone,
        isEmpty,
        capitalize,
        toTitleCase
    };
}
