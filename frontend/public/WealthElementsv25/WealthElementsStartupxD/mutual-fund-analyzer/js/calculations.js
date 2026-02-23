/**
 * ========================================
 * MUTUAL FUND ANALYZER - FINANCIAL CALCULATIONS
 * Version: 1.3 - Limited rolling returns to recent 10-15 years to avoid inflated equity returns
 * ========================================
 */

/**
 * Calculate financial metrics for a specific time period
 * @param {Array} navHistory - NAV history data
 * @param {number} years - Number of years for calculation
 * @param {number} riskFreeRate - Risk-free rate (default: 7%)
 * @returns {Object} Calculated metrics
 */
const calculateMetricsForPeriod = (navHistory, years, riskFreeRate = 0.07) => {
    if (!navHistory || navHistory.length < 2) {
        return {
            annualizedStdDev: NaN,
            sharpeRatio: NaN,
            sortinoRatio: NaN,
            rollingReturn: NaN,
            cagr: NaN,
            maxDrawdown: NaN
        };
    }

    // Calculate daily returns
    const dailyReturns = [];
    for (let i = 1; i < navHistory.length; i++) {
        const prevNav = parseFloat(navHistory[i - 1].nav);
        const currentNav = parseFloat(navHistory[i].nav);
        if (prevNav !== 0) {
            dailyReturns.push({
                date: new Date(navHistory[i].date.split('-').reverse().join('-')),
                return: (currentNav - prevNav) / prevNav
            });
        }
    }

    // Filter returns for the specified period
    const today = new Date();
    const startDate = new Date(new Date().setFullYear(today.getFullYear() - years));
    const periodReturns = dailyReturns
        .filter(dr => dr.date >= startDate)
        .map(dr => dr.return);

    // Check if we have sufficient data
    const minRequiredDays = 252 * (years - 1); // Allow some flexibility
    if (periodReturns.length < minRequiredDays) {
        return {
            annualizedStdDev: NaN,
            sharpeRatio: NaN,
            sortinoRatio: NaN,
            rollingReturn: NaN,
            cagr: NaN,
            maxDrawdown: NaN
        };
    }

    // Calculate basic statistics
    const meanDailyReturn = calculateMean(periodReturns);
    const annualizedReturn = Math.pow(1 + meanDailyReturn, 252) - 1;
    const annualizedStdDev = calculateStandardDeviation(periodReturns, meanDailyReturn) * Math.sqrt(252);

    // Calculate risk-adjusted ratios
    const dailyRiskFreeRate = Math.pow(1 + riskFreeRate, 1/252) - 1;
    const sharpeRatio = (annualizedReturn - riskFreeRate) / annualizedStdDev;
    
    const downsideDeviation = calculateDownsideDeviation(periodReturns, dailyRiskFreeRate) * Math.sqrt(252);
    const sortinoRatio = downsideDeviation === 0 ? Infinity : (annualizedReturn - riskFreeRate) / downsideDeviation;

    // Calculate rolling returns
    const tradingDaysInYear = 252;
    const tradingDaysInPeriod = tradingDaysInYear * years;
    const rollingReturns = [];

    // Limit rolling return calculation window to avoid inflated returns from very old data
    // For recent analysis (3-7 years), look at max 10 years of history
    // For 10+ year analysis, look at max 15 years of history
    const maxLookbackYears = years >= 10 ? 15 : 10;
    const maxLookbackDays = maxLookbackYears * tradingDaysInYear;

    // Calculate the starting index - use recent data only (not entire 20+ year history)
    const startIndex = Math.max(0, navHistory.length - maxLookbackDays);
    const workingNavHistory = navHistory.slice(startIndex);

    if (workingNavHistory.length >= tradingDaysInPeriod) {
        for (let i = 0; i <= workingNavHistory.length - tradingDaysInPeriod; i++) {
            const startNavData = workingNavHistory[i];
            const endNavData = workingNavHistory[i + tradingDaysInPeriod - 1];
            const startNav = parseFloat(startNavData.nav);
            const endNav = parseFloat(endNavData.nav);

            if (startNav > 0 && endNav > 0) {
                const periodReturn = (endNav / startNav);
                const annualized = Math.pow(periodReturn, 1 / years) - 1;
                rollingReturns.push(annualized);
            }
        }
    }

    const rollingReturn = rollingReturns.length > 0 ? calculateMean(rollingReturns) : NaN;

    // Calculate CAGR - use the most recent 'years' of data
    // Get the index that represents 'years' ago
    const yearlyTradingDays = Math.floor(252 * years);
    const cagrStartIndex = Math.max(0, navHistory.length - yearlyTradingDays - 1);
    const cagrStartNav = parseFloat(navHistory[cagrStartIndex].nav);
    const cagrEndNav = parseFloat(navHistory[navHistory.length - 1].nav);
    const cagr = Math.pow(cagrEndNav / cagrStartNav, 1/years) - 1;

    // Calculate maximum drawdown over the specified period
    let maxDrawdown = 0;
    let peak = cagrStartNav;

    for (let i = cagrStartIndex + 1; i < navHistory.length; i++) {
        const currentNav = parseFloat(navHistory[i].nav);
        if (currentNav > peak) {
            peak = currentNav;
        }
        const drawdown = (peak - currentNav) / peak;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    return {
        annualizedStdDev,
        sharpeRatio,
        sortinoRatio,
        rollingReturn,
        cagr,
        maxDrawdown
    };
};

/**
 * Calculate detailed metrics for fund analysis
 * @param {Array} navData - NAV data
 * @param {Array} benchmarkData - Benchmark data
 * @param {number} riskFreeRate - Risk-free rate
 * @returns {Object} Detailed metrics
 */
const calculateDetailedMetrics = (navData, benchmarkData, riskFreeRate = 0.07) => {
    if (!navData || navData.length < 2) return null;

    // Calculate daily returns
    const returns = [];
    for (let i = 1; i < navData.length; i++) {
        const prevNav = parseFloat(navData[i-1].nav);
        const currentNav = parseFloat(navData[i].nav);
        if (prevNav !== 0) {
            returns.push((currentNav - prevNav) / prevNav);
        }
    }

    // Basic statistics
    const meanReturn = calculateMean(returns);
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // CAGR calculation
    const startNav = parseFloat(navData[0].nav);
    const endNav = parseFloat(navData[navData.length - 1].nav);
    // Calculate years dynamically based on data range
    const startDate = new Date(navData[0].date);
    const endDate = new Date(navData[navData.length - 1].date);
    const yearsDiff = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
    const cagr = Math.pow(endNav / startNav, 1/yearsDiff) - 1;

    // Risk-adjusted ratios - Sharpe Ratio calculation
    // Annualize the daily standard deviation
    const annualizedStdDev = stdDev * Math.sqrt(252);
    const sharpeRatio = (cagr - riskFreeRate) / annualizedStdDev;
    
    // Sortino Ratio calculation - similar to Sharpe but uses downside deviation
    const dailyRiskFreeRate = riskFreeRate / 252;
    const downsideReturns = returns.filter(ret => ret < dailyRiskFreeRate);
    const downsideVariance = downsideReturns.reduce((sum, ret) => sum + Math.pow(ret - dailyRiskFreeRate, 2), 0) / returns.length;
    const downsideDeviation = Math.sqrt(downsideVariance);
    const annualizedDownsideDeviation = downsideDeviation * Math.sqrt(252);
    const sortinoRatio = annualizedDownsideDeviation === 0 ? 0 : (cagr - riskFreeRate) / annualizedDownsideDeviation;

    // Beta calculation (if benchmark data available)
    let beta = 0;
    let alpha = 0;
    
    if (benchmarkData && benchmarkData.length > 0) {
        const benchmarkReturns = [];
        const benchmarkDataArray = Array.isArray(benchmarkData) ? benchmarkData : benchmarkData.data;
        
        for (let i = 1; i < benchmarkDataArray.length; i++) {
            const prevValue = benchmarkDataArray[i-1].value;
            const currentValue = benchmarkDataArray[i].value;
            benchmarkReturns.push((currentValue - prevValue) / prevValue);
        }

        // Use last 3 years for beta calculation
        const threeYearReturns = returns.slice(-756);
        const threeYearBenchmarkReturns = benchmarkReturns.slice(-756);
        
        if (threeYearReturns.length > 0 && threeYearBenchmarkReturns.length > 0) {
            const fundMean = calculateMean(threeYearReturns);
            const benchmarkMean = calculateMean(threeYearBenchmarkReturns);
            
            const covariance = threeYearReturns.reduce((sum, ret, i) => 
                sum + (ret - fundMean) * (threeYearBenchmarkReturns[i] - benchmarkMean), 0) / threeYearReturns.length;
            
            const benchmarkVariance = threeYearBenchmarkReturns.reduce((sum, ret) => 
                sum + Math.pow(ret - benchmarkMean, 2), 0) / threeYearBenchmarkReturns.length;
            
            beta = benchmarkVariance === 0 ? 0 : covariance / benchmarkVariance;
            
            // Alpha calculation
            const benchmarkCagr = Math.pow(benchmarkDataArray[benchmarkDataArray.length - 1].value / benchmarkDataArray[0].value, 1/3) - 1;
            alpha = cagr - (riskFreeRate + beta * (benchmarkCagr - riskFreeRate));
        }
    }

    // Maximum drawdown
    let maxDrawdown = 0;
    let peak = startNav;
    
    for (let i = 1; i < navData.length; i++) {
        const currentNav = parseFloat(navData[i].nav);
        if (currentNav > peak) {
            peak = currentNav;
        }
        const drawdown = (peak - currentNav) / peak;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    return {
        cagr: cagr * 100,
        sharpeRatio,
        sortinoRatio,
        beta,
        alpha: alpha * 100,
        stdDev: stdDev * Math.sqrt(252) * 100,
        maxDrawdown: maxDrawdown * 100
    };
};

/**
 * Calculate composite score for fund ranking
 * @param {Object} fund - Fund data
 * @param {Object} ranges - Min/max ranges for normalization
 * @returns {number} Composite score
 */
const calculateCompositeScore = (fund, ranges) => {
    const {
        minRolling3yr, maxRolling3yr,
        minRolling5yr, maxRolling5yr,
        minSharpe3yr, maxSharpe3yr,
        minSharpe5yr, maxSharpe5yr,
        minSortino3yr, maxSortino3yr,
        minSortino5yr, maxSortino5yr,
        minSd3yr, maxSd3yr,
        minSd5yr, maxSd5yr
    } = ranges;

    // Check for invalid data
    if (isNaN(fund.rollingReturn3yr) || isNaN(fund.rollingReturn5yr) || 
        isNaN(fund.sharpe3yr) || isNaN(fund.sharpe5yr) || 
        isNaN(fund.sortino3yr) || isNaN(fund.sortino5yr) || 
        isNaN(fund.sd3yr) || isNaN(fund.sd5yr)) {
        return -Infinity;
    }

    // Normalize metrics
    // Rolling Returns: 40% total (25% for 3yr, 15% for 5yr)
    const rolling3yrScore = normalize(fund.rollingReturn3yr, minRolling3yr, maxRolling3yr);
    const rolling5yrScore = normalize(fund.rollingReturn5yr, minRolling5yr, maxRolling5yr);
    const rollingReturnScore = (rolling3yrScore * 0.25) + (rolling5yrScore * 0.15);

    // Fundamentals: 60% total
    // Sharpe Ratio: 25% (12.5% for 3yr, 12.5% for 5yr)
    const sharpe3yrScore = normalize(fund.sharpe3yr, minSharpe3yr, maxSharpe3yr);
    const sharpe5yrScore = normalize(fund.sharpe5yr, minSharpe5yr, maxSharpe5yr);
    const sharpeScore = (sharpe3yrScore * 0.125) + (sharpe5yrScore * 0.125);

    // Sortino Ratio: 25% (12.5% for 3yr, 12.5% for 5yr)
    const sortino3yrScore = normalize(fund.sortino3yr, minSortino3yr, maxSortino3yr);
    const sortino5yrScore = normalize(fund.sortino5yr, minSortino5yr, maxSortino5yr);
    const sortinoScore = (sortino3yrScore * 0.125) + (sortino5yrScore * 0.125);

    // Standard Deviation (Risk): 10% (5% for 3yr, 5% for 5yr) - lower is better
    const sd3yrScore = normalizeInverted(fund.sd3yr, minSd3yr, maxSd3yr);
    const sd5yrScore = normalizeInverted(fund.sd5yr, minSd5yr, maxSd5yr);
    const sdScore = (sd3yrScore * 0.05) + (sd5yrScore * 0.05);

    // Weighted composite score: 40% Rolling Returns + 60% Fundamentals
    const compositeScore = (rollingReturnScore * 1.0) + (sharpeScore * 1.0) + (sortinoScore * 1.0) + (sdScore * 1.0);
    
    return compositeScore;
};

/**
 * Calculate ranges for normalization
 * @param {Array} funds - Array of fund data
 * @returns {Object} Min/max ranges for each metric
 */
const calculateRanges = (funds) => {
    const validFunds = funds.filter(f => 
        !isNaN(f.rollingReturn3yr) && !isNaN(f.rollingReturn5yr) && 
        !isNaN(f.sharpe3yr) && !isNaN(f.sharpe5yr) && 
        !isNaN(f.sortino3yr) && !isNaN(f.sortino5yr) && 
        !isNaN(f.sd3yr) && !isNaN(f.sd5yr)
    );

    if (validFunds.length === 0) {
        return {
            minRolling3yr: 0, maxRolling3yr: 0,
            minRolling5yr: 0, maxRolling5yr: 0,
            minSharpe3yr: 0, maxSharpe3yr: 0,
            minSharpe5yr: 0, maxSharpe5yr: 0,
            minSortino3yr: 0, maxSortino3yr: 0,
            minSortino5yr: 0, maxSortino5yr: 0,
            minSd3yr: 0, maxSd3yr: 0,
            minSd5yr: 0, maxSd5yr: 0
        };
    }

    return {
        minRolling3yr: Math.min(...validFunds.map(f => f.rollingReturn3yr)),
        maxRolling3yr: Math.max(...validFunds.map(f => f.rollingReturn3yr)),
        minRolling5yr: Math.min(...validFunds.map(f => f.rollingReturn5yr)),
        maxRolling5yr: Math.max(...validFunds.map(f => f.rollingReturn5yr)),
        minSharpe3yr: Math.min(...validFunds.map(f => f.sharpe3yr)),
        maxSharpe3yr: Math.max(...validFunds.map(f => f.sharpe3yr)),
        minSharpe5yr: Math.min(...validFunds.map(f => f.sharpe5yr)),
        maxSharpe5yr: Math.max(...validFunds.map(f => f.sharpe5yr)),
        minSortino3yr: Math.min(...validFunds.map(f => f.sortino3yr)),
        maxSortino3yr: Math.max(...validFunds.map(f => f.sortino3yr)),
        minSortino5yr: Math.min(...validFunds.map(f => f.sortino5yr)),
        maxSortino5yr: Math.max(...validFunds.map(f => f.sortino5yr)),
        minSd3yr: Math.min(...validFunds.map(f => f.sd3yr)),
        maxSd3yr: Math.max(...validFunds.map(f => f.sd3yr)),
        minSd5yr: Math.min(...validFunds.map(f => f.sd5yr)),
        maxSd5yr: Math.max(...validFunds.map(f => f.sd5yr))
    };
};

/**
 * Calculate volatility (standard deviation) for a period
 * @param {Array} returns - Array of returns
 * @param {number} period - Period in days
 * @returns {number} Volatility
 */
const calculateVolatility = (returns, period = 252) => {
    if (!returns || returns.length < period) return NaN;
    
    const recentReturns = returns.slice(-period);
    const mean = calculateMean(recentReturns);
    const variance = recentReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / recentReturns.length;
    
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized
};

/**
 * Calculate Value at Risk (VaR)
 * @param {Array} returns - Array of returns
 * @param {number} confidence - Confidence level (default: 0.05 for 95%)
 * @returns {number} VaR value
 */
const calculateVaR = (returns, confidence = 0.05) => {
    if (!returns || returns.length === 0) return NaN;
    
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor(confidence * sortedReturns.length);
    
    return sortedReturns[index];
};

/**
 * Calculate Conditional Value at Risk (CVaR)
 * @param {Array} returns - Array of returns
 * @param {number} confidence - Confidence level (default: 0.05 for 95%)
 * @returns {number} CVaR value
 */
const calculateCVaR = (returns, confidence = 0.05) => {
    if (!returns || returns.length === 0) return NaN;
    
    const varValue = calculateVaR(returns, confidence);
    const tailReturns = returns.filter(ret => ret <= varValue);
    
    return calculateMean(tailReturns);
};

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateMetricsForPeriod,
        calculateDetailedMetrics,
        calculateCompositeScore,
        calculateRanges,
        calculateVolatility,
        calculateVaR,
        calculateCVaR
    };
}
