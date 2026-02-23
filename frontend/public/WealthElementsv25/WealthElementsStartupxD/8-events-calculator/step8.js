(function(){
  // ========================================
  // STEP 8 - INVESTMENT ALLOCATION & MUTUAL FUND RECOMMENDATIONS
  // Version: 2.7 - FULLY SYNCHRONIZED with Mutual Fund Analyzer v1.6
  // - Fixed rolling returns calculation (10-15 year lookback limit)
  // - EXACT filtering logic structure copied from Mutual Fund Analyzer
  // - Same AMC checking, same exclusions, same order of operations
  // - Cache cleared on every visit for fresh fund recommendations
  // - TOP 5 funds selection (instead of top 3) for better variety
  // - Returns Regular-Growth plans only (Step 8 requirement)
  // - Excluded Defunct plans (closed/discontinued funds)
  // ========================================

  // Navigation
  const backBtn = document.getElementById('back-step7');
  if (backBtn) backBtn.addEventListener('click', () => window.location.href = 'step7.html');

  const backToDashboardBtn = document.getElementById('back-to-dashboard');
  if (backToDashboardBtn) backToDashboardBtn.addEventListener('click', () => window.location.href = '../index.html');


  // Data retrieval functions
  function getStep1() {
    try {
      const raw = localStorage.getItem('we_step1');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // Get names for assignment dropdown
  function getAssignmentNames() {
    const step1 = getStep1();
    if (!step1) return ['Self'];

    if (step1.familyMode === 'couple') {
      return [
        step1.husbandName || 'Husband',
        step1.wifeName || 'Wife'
      ];
    } else {
      return [step1.fullName || 'Self'];
    }
  }

  // Get or create assignment data
  function getAssignments() {
    try {
      const raw = localStorage.getItem('we_step8_assignments');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  // Save assignment data
  function saveAssignment(goalName, assignedTo) {
    try {
      const assignments = getAssignments();
      assignments[goalName] = assignedTo;
      localStorage.setItem('we_step8_assignments', JSON.stringify(assignments));
    } catch (e) {
      console.error('Failed to save assignment:', e);
    }
  }

  function getGoals() {
    let goals = [];
    
    // Prioritize we_plan_goals (most recent from Step 6) over we_step4_goals
    try {
      const v6 = localStorage.getItem('we_plan_goals');
      if (v6) {
        const arr = JSON.parse(v6);
        if (Array.isArray(arr) && arr.length > 0) {
          goals = arr;
        }
      }
    } catch (e) {}

    // Only fall back to we_step4_goals if we_plan_goals is empty
    if (goals.length === 0) {
      try {
        const v4 = localStorage.getItem('we_step4_goals');
        if (v4) {
          const arr = JSON.parse(v4);
          if (Array.isArray(arr) && arr.length > 0) {
            goals = arr;
          }
        }
      } catch (e) {}
    }

    // Filter out any retirement goals from the goals array to avoid duplication
    // Retirement will be handled separately in initializeStep8()
    goals = goals.filter(goal => !goal.name.toLowerCase().includes('retirement'));

    return goals;
  }

  function getRetirement() {
    try {
      const raw = localStorage.getItem('we_step4_retirement');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function getInvestmentRule() {
    try {
      const raw = localStorage.getItem('we_invest_rule');
      return raw ? JSON.parse(raw) : { autoStepUp: 0 };
    } catch (e) {
      return { autoStepUp: 0 };
    }
  }

  // Utility functions
  function formatCurrency(amount) {
    return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(amount))}`;
  }

  function getExpectedReturn(years) {
    if (years > 18) return 0.15;
    if (years >= 15) return 0.145;
    if (years >= 10) return 0.12;
    if (years >= 7) return 0.11;
    if (years >= 5) return 0.095;
    if (years >= 3) return 0.085;
    return 0.045;
  }

  // ============================================================================
  // MUTUAL FUND ANALYZER INTEGRATION
  // ============================================================================

  /**
   * Category mapping between Step 8 allocation names and Mutual Fund Analyzer categories
   */
  const CATEGORY_MAPPING = {
    "Flexi Cap Fund": "Flexi Cap",
    "Flexi Cap Funds": "Flexi Cap",
    "Multi Cap Fund": "Multi Cap",
    "Multi Cap Funds": "Multi Cap",
    "Mid Cap Fund": "Mid Cap",
    "Mid Cap Funds": "Mid Cap",
    "Small Cap Fund": "Small Cap",
    "Small Cap Funds": "Small Cap",
    "Large Cap Fund": "Large Cap",
    "Large Cap Funds": "Large Cap",
    "Conservative Hybrid Fund": "Conservative Hybrid",
    "Conservative Hybrid Funds": "Conservative Hybrid",
    "Aggressive Hybrid Fund": "Aggressive Hybrid",
    "Aggressive Hybrid Funds": "Aggressive Hybrid",
    "Liquid Funds": "Liquid",
    "Arbitrage Funds": "Arbitrage",
    "Debt Fund (Short Duration / Corporate Bond)": "Corporate Bond"
  };

  /**
   * API Configuration
   */
  const API_CONFIG = {
    BASE_URL: 'https://api.mfapi.in',
    TIMEOUT: 30000,
    CACHE_KEY_PREFIX: 'mf_recommendations_',
    CACHE_EXPIRY_HOURS: 24
  };

  /**
   * Cache management with 24-hour expiry
   */
  const FundCache = {
    set(key, data) {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expiryHours: API_CONFIG.CACHE_EXPIRY_HOURS
      };
      try {
        localStorage.setItem(`${API_CONFIG.CACHE_KEY_PREFIX}${key}`, JSON.stringify(cacheData));
      } catch (e) {
        console.warn('Cache storage failed:', e);
      }
    },

    get(key) {
      try {
        const cached = localStorage.getItem(`${API_CONFIG.CACHE_KEY_PREFIX}${key}`);
        if (!cached) return null;

        const cacheData = JSON.parse(cached);
        const ageInHours = (Date.now() - cacheData.timestamp) / (1000 * 60 * 60);

        if (ageInHours > cacheData.expiryHours) {
          // Cache expired
          this.remove(key);
          return null;
        }

        return cacheData.data;
      } catch (e) {
        console.warn('Cache retrieval failed:', e);
        return null;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(`${API_CONFIG.CACHE_KEY_PREFIX}${key}`);
      } catch (e) {
        console.warn('Cache removal failed:', e);
      }
    },

    clearAll() {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(API_CONFIG.CACHE_KEY_PREFIX)) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Cache clear failed:', e);
      }
    }
  };

  /**
   * Fetch all mutual funds list
   */
  async function fetchAllFunds() {
    const cacheKey = 'all_funds';
    const cached = FundCache.get(cacheKey);
    if (cached) return cached;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/mf`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Failed to fetch funds list');

      const data = await response.json();
      FundCache.set(cacheKey, data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error fetching all funds:', error);
      throw error;
    }
  }

  /**
   * Fetch NAV history for a specific fund
   */
  async function fetchNavHistory(schemeCode) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/mf/${schemeCode}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      clearTimeout(timeoutId);
      return [];
    }
  }

  /**
   * Check if fund has sufficient history
   */
  function hasSufficientHistory(navHistory, years = 5) {
    if (!navHistory || navHistory.length === 0) return false;

    const oldestEntry = navHistory[0];
    const [day, month, year] = oldestEntry.date.split('-');
    const inceptionDate = new Date(`${year}-${month}-${day}`);

    const requiredDate = new Date();
    requiredDate.setFullYear(requiredDate.getFullYear() - years);

    return inceptionDate <= requiredDate;
  }

  /**
   * Calculate rolling returns for a fund
   * Updated to match Mutual Fund Analyzer v1.3 - limits lookback to avoid inflated returns
   */
  function calculateRollingReturns(navHistory, years = 5) {
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
        const startNav = parseFloat(workingNavHistory[i].nav);
        const endNav = parseFloat(workingNavHistory[i + tradingDaysInPeriod - 1].nav);

        if (startNav > 0 && endNav > 0) {
          const periodReturn = (endNav / startNav);
          const annualized = Math.pow(periodReturn, 1 / years) - 1;
          rollingReturns.push(annualized);
        }
      }
    }

    if (rollingReturns.length === 0) return NaN;
    const mean = rollingReturns.reduce((sum, val) => sum + val, 0) / rollingReturns.length;
    return mean;
  }

  /**
   * Calculate comprehensive metrics following Mutual Fund Analyzer rules
   */
  function calculateMetricsForPeriod(navHistory, years, riskFreeRate = 0.07) {
    if (!navHistory || navHistory.length < 2) {
      return {
        annualizedStdDev: NaN,
        sharpeRatio: NaN,
        sortinoRatio: NaN,
        rollingReturn: NaN
      };
    }

    // Calculate daily returns
    const dailyReturns = [];
    for (let i = 1; i < navHistory.length; i++) {
      const prevNav = parseFloat(navHistory[i - 1].nav);
      const currentNav = parseFloat(navHistory[i].nav);
      if (prevNav !== 0) {
        dailyReturns.push((currentNav - prevNav) / prevNav);
      }
    }

    // Filter for period
    const today = new Date();
    const startDate = new Date(new Date().setFullYear(today.getFullYear() - years));
    const periodReturns = dailyReturns.slice(-252 * years);

    if (periodReturns.length < 252 * (years - 1)) {
      return {
        annualizedStdDev: NaN,
        sharpeRatio: NaN,
        sortinoRatio: NaN,
        rollingReturn: NaN
      };
    }

    // Mean daily return
    const meanDailyReturn = periodReturns.reduce((sum, val) => sum + val, 0) / periodReturns.length;
    const annualizedReturn = Math.pow(1 + meanDailyReturn, 252) - 1;

    // Standard Deviation
    const variance = periodReturns.reduce((sum, ret) => sum + Math.pow(ret - meanDailyReturn, 2), 0) / periodReturns.length;
    const annualizedStdDev = Math.sqrt(variance) * Math.sqrt(252);

    // Sharpe Ratio
    const dailyRiskFreeRate = Math.pow(1 + riskFreeRate, 1/252) - 1;
    const sharpeRatio = annualizedStdDev === 0 ? 0 : (annualizedReturn - riskFreeRate) / annualizedStdDev;

    // Sortino Ratio (downside deviation)
    const downsideReturns = periodReturns.filter(r => r < dailyRiskFreeRate);
    const downsideVariance = downsideReturns.reduce((sum, ret) => sum + Math.pow(ret - dailyRiskFreeRate, 2), 0) / periodReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);
    const sortinoRatio = downsideDeviation === 0 ? 0 : (annualizedReturn - riskFreeRate) / downsideDeviation;

    // Rolling Returns
    const rollingReturn = calculateRollingReturns(navHistory, years);

    return {
      annualizedStdDev,
      sharpeRatio,
      sortinoRatio,
      rollingReturn
    };
  }

  /**
   * Calculate composite score following Mutual Fund Analyzer methodology
   * 40% Rolling Returns + 60% Fundamentals (Sharpe + Sortino + SD)
   */
  function calculateCompositeScore(fund, ranges) {
    const {
      minRolling5yr, maxRolling5yr,
      minSharpe5yr, maxSharpe5yr,
      minSortino5yr, maxSortino5yr,
      minSd5yr, maxSd5yr
    } = ranges;

    // Check for invalid data
    if (isNaN(fund.rollingReturn5yr) || isNaN(fund.sharpe5yr) ||
        isNaN(fund.sortino5yr) || isNaN(fund.sd5yr)) {
      return -Infinity;
    }

    // Normalize function
    const normalize = (value, min, max) => {
      return (max === min) ? 1 : (value - min) / (max - min);
    };

    const normalizeInverted = (value, min, max) => {
      return (max === min) ? 1 : 1 - ((value - min) / (max - min));
    };

    // Rolling Returns: 40%
    const rolling5yrScore = normalize(fund.rollingReturn5yr, minRolling5yr, maxRolling5yr);
    const rollingReturnScore = rolling5yrScore * 0.40;

    // Fundamentals: 60% total
    // Sharpe Ratio: 25%
    const sharpe5yrScore = normalize(fund.sharpe5yr, minSharpe5yr, maxSharpe5yr);
    const sharpeScore = sharpe5yrScore * 0.25;

    // Sortino Ratio: 25%
    const sortino5yrScore = normalize(fund.sortino5yr, minSortino5yr, maxSortino5yr);
    const sortinoScore = sortino5yrScore * 0.25;

    // Standard Deviation (Risk): 10% - lower is better
    const sd5yrScore = normalizeInverted(fund.sd5yr, minSd5yr, maxSd5yr);
    const sdScore = sd5yrScore * 0.10;

    // Total composite score
    const compositeScore = rollingReturnScore + sharpeScore + sortinoScore + sdScore;

    return compositeScore;
  }

  /**
   * Allowed AMCs - EXACT COPY from Mutual Fund Analyzer
   */
  const ALLOWED_AMCS = [
    'sbi', 'icici prudential', 'hdfc', 'nippon india', 'kotak mahindra',
    'aditya birla sun life', 'uti', 'axis', 'mirae asset', 'dsp', 'tata',
    'canara robeco', 'bandhan', 'hsbc', 'invesco', 'franklin templeton',
    'ppfas', 'edelweiss', 'motilal oswal', 'quant', 'sundaram',
    'baroda bnp paribas', 'pgim india', 'mahindra manulife', 'whiteoak capital'
  ];

  /**
   * Check if fund is from an allowed AMC - EXACT COPY from Mutual Fund Analyzer
   */
  function isAllowedAMC(schemeName) {
    const name = schemeName.toLowerCase();
    return ALLOWED_AMCS.some(amc => {
      if (amc === 'ppfas') return name.includes('parag') && name.includes('parikh');
      if (amc === 'aditya birla sun life') return name.includes('aditya') && name.includes('birla');
      if (amc === 'baroda bnp paribas') return name.includes('baroda') && name.includes('bnp');
      if (amc === 'motilal oswal') return name.includes('motilal') && name.includes('oswal');
      if (amc === 'mahindra manulife') return name.includes('mahindra') && name.includes('manulife');
      if (amc === 'pgim india') return name.includes('pgim') && name.includes('india');
      if (amc === 'canara robeco') return name.includes('canara') && name.includes('robeco');
      if (amc === 'franklin templeton') return name.includes('franklin') && name.includes('templeton');
      if (amc === 'mirae asset') return name.includes('mirae') && name.includes('asset');
      if (amc === 'nippon india') return name.includes('nippon') && name.includes('india');
      if (amc === 'whiteoak capital') return name.includes('whiteoak') && name.includes('capital');
      if (amc === 'icici prudential') return name.includes('icici') && name.includes('prudential');
      if (amc === 'kotak mahindra') return name.includes('kotak');
      // For other AMCs including HDFC, use includes instead of startsWith for more flexible matching
      return name.includes(amc);
    });
  }

  /**
   * Global tracker for used funds to prevent repetition across goals
   */
  const usedFunds = new Set();

  /**
   * Get top 5 funds for a specific category
   * Uses Mutual Fund Analyzer methodology: 40% Rolling Returns + 60% Fundamentals
   * Returns array of top 5 funds for better variety and coverage
   */
  async function getTop5FundsForCategory(category) {
    const cacheKey = `category_top5_${category}`;
    const cached = FundCache.get(cacheKey);
    if (cached) return cached;

    try {
      const analyzerCategory = CATEGORY_MAPPING[category];
      if (!analyzerCategory) {
        console.log(`No mapping found for category: ${category}`);
        return null;
      }

      // Fetch all funds
      const allFunds = await fetchAllFunds();

      // STEP 1: Filter funds EXACTLY like Mutual Fund Analyzer (ALL plan types)
      // This ensures we rank the same funds that Analyzer ranks
      const categoryFunds = allFunds.filter(fund => {
        const name = fund.schemeName.toLowerCase();

        // Check if fund is from allowed AMC (same logic as Mutual Fund Analyzer)
        const isAllowedAmc = ALLOWED_AMCS.some(amc => {
          if (amc === 'ppfas') return name.includes('parag') && name.includes('parikh');
          if (amc === 'aditya birla sun life') return name.includes('aditya') && name.includes('birla');
          if (amc === 'baroda bnp paribas') return name.includes('baroda') && name.includes('bnp');
          if (amc === 'motilal oswal') return name.includes('motilal') && name.includes('oswal');
          if (amc === 'mahindra manulife') return name.includes('mahindra') && name.includes('manulife');
          if (amc === 'pgim india') return name.includes('pgim') && name.includes('india');
          if (amc === 'canara robeco') return name.includes('canara') && name.includes('robeco');
          if (amc === 'franklin templeton') return name.includes('franklin') && name.includes('templeton');
          if (amc === 'mirae asset') return name.includes('mirae') && name.includes('asset');
          if (amc === 'nippon india') return name.includes('nippon') && name.includes('india');
          if (amc === 'whiteoak capital') return name.includes('whiteoak') && name.includes('capital');
          if (amc === 'icici prudential') return name.includes('icici') && name.includes('prudential');
          if (amc === 'kotak mahindra') return name.includes('kotak');
          return name.includes(amc);
        });

        if (!isAllowedAmc) return false;

        // Exclude IDCW (Income Distribution cum Capital Withdrawal) plans
        if (name.includes('idcw')) return false;
        if (name.includes('dividend')) return false;
        if (name.includes('payout')) return false;

        // Exclude Retail plans
        if (name.includes('retail')) return false;

        // Exclude Bonus plans
        if (name.includes('bonus')) return false;

        // Exclude Institutional plans (high minimum investment ₹1cr-10cr+)
        if (name.includes('super institutional')) return false;
        if (name.includes('super inst')) return false;
        if (name.includes('institutional')) return false;
        if (name.includes(' inst ')) return false;
        if (name.includes('-inst-')) return false;
        if (name.includes('inst plan')) return false;

        // Exclude Defunct plans (closed/discontinued funds)
        if (name.includes('defunct')) return false;

        // Exclude Fund of Funds (FoF)
        if (name.includes('fund of fund')) return false;
        if (name.includes('fund of funds')) return false;
        if (name.includes('fof')) return false;

        // Match category
        const categoryLower = analyzerCategory.toLowerCase();
        const matchesCategory = name.includes(categoryLower);

        // Accept ALL plan types for ranking (matching Analyzer)
        const hasRegular = name.includes('regular');
        const hasGrowth = name.includes('growth');
        const hasDirect = name.includes('direct');
        const matchesPlanType = (hasRegular && hasGrowth && !hasDirect) ||
                               (!hasRegular && hasGrowth && !hasDirect) ||
                               (hasDirect && hasGrowth);

        return matchesCategory && matchesPlanType;
      }).slice(0, 50); // Match Mutual Fund Analyzer's broader initial selection

      if (categoryFunds.length === 0) {
        console.log(`No funds found for category: ${category}`);
        return null;
      }

      // CRITICAL: Deduplicate funds EXACTLY like Mutual Fund Analyzer
      // This ensures we analyze the same base funds
      const deduplicatedFunds = [];
      const seenFunds = new Set();

      categoryFunds.forEach(fund => {
        let baseName = fund.schemeName.toLowerCase();
        baseName = baseName
          .replace(/\s*-\s*regular\s*plan.*$/i, '')
          .replace(/\s*-\s*growth\s*plan.*$/i, '')
          .replace(/\s*-\s*direct\s*plan.*$/i, '')
          .replace(/\s*regular\s*plan.*$/i, '')
          .replace(/\s*growth\s*plan.*$/i, '')
          .replace(/\s*direct\s*plan.*$/i, '')
          .replace(/\s*-\s*regular\s*option.*$/i, '')
          .replace(/\s*-\s*growth\s*option.*$/i, '')
          .replace(/\s*-\s*bonus\s*option.*$/i, '')
          .replace(/\s*-\s*dividend\s*option.*$/i, '')
          .replace(/\s*regular\s*option.*$/i, '')
          .replace(/\s*growth\s*option.*$/i, '')
          .replace(/\s*bonus\s*option.*$/i, '')
          .replace(/\s*dividend\s*option.*$/i, '')
          .replace(/\s*-\s*regular.*$/i, '')
          .replace(/\s*-\s*growth.*$/i, '')
          .replace(/\s*-\s*direct.*$/i, '')
          .replace(/\s*-\s*bonus.*$/i, '')
          .replace(/\s*-\s*dividend.*$/i, '')
          .replace(/\s*-\s*payout.*$/i, '')
          .replace(/\s*-\s*monthly.*$/i, '')
          .replace(/\s*-\s*quarterly.*$/i, '')
          .replace(/\s*-\s*yearly.*$/i, '')
          .replace(/\s*regular.*$/i, '')
          .replace(/\s*growth.*$/i, '')
          .replace(/\s*direct.*$/i, '')
          .replace(/\s*bonus.*$/i, '')
          .replace(/\s*dividend.*$/i, '')
          .replace(/\s*payout.*$/i, '')
          .replace(/\s*monthly.*$/i, '')
          .replace(/\s*quarterly.*$/i, '')
          .replace(/\s*yearly.*$/i, '')
          .trim();

        if (!seenFunds.has(baseName)) {
          seenFunds.add(baseName);
          deduplicatedFunds.push(fund);
        }
      });

      console.log(`${category}: ${categoryFunds.length} funds found, ${deduplicatedFunds.length} after deduplication`);

      // Analyze funds with comprehensive metrics
      const analyzedFunds = [];
      for (const fund of deduplicatedFunds) {
        try {
          const navHistory = await fetchNavHistory(fund.schemeCode);
          if (!navHistory || navHistory.length < 2) continue;

          const reversedHistory = navHistory.slice().reverse();
          if (!hasSufficientHistory(reversedHistory, 5)) continue;

          // Calculate comprehensive metrics for 5-year period
          const metrics5yr = calculateMetricsForPeriod(reversedHistory, 5, 0.07);

          // Skip funds with invalid metrics
          if (isNaN(metrics5yr.rollingReturn) || isNaN(metrics5yr.sharpeRatio) ||
              isNaN(metrics5yr.sortinoRatio) || isNaN(metrics5yr.annualizedStdDev)) {
            continue;
          }

          analyzedFunds.push({
            schemeCode: fund.schemeCode,
            schemeName: fund.schemeName,
            rollingReturn5yr: metrics5yr.rollingReturn,
            sharpe5yr: metrics5yr.sharpeRatio,
            sortino5yr: metrics5yr.sortinoRatio,
            sd5yr: metrics5yr.annualizedStdDev
          });

          // Analyze up to 20 funds for better quality selection (matching Analyzer approach)
          if (analyzedFunds.length >= 20) break;
        } catch (error) {
          console.error(`Error analyzing fund ${fund.schemeCode}:`, error);
        }
      }

      if (analyzedFunds.length === 0) {
        console.log(`No analyzed funds for category: ${category}`);
        return null;
      }

      // Calculate min/max ranges for normalization
      const ranges = {
        minRolling5yr: Math.min(...analyzedFunds.map(f => f.rollingReturn5yr)),
        maxRolling5yr: Math.max(...analyzedFunds.map(f => f.rollingReturn5yr)),
        minSharpe5yr: Math.min(...analyzedFunds.map(f => f.sharpe5yr)),
        maxSharpe5yr: Math.max(...analyzedFunds.map(f => f.sharpe5yr)),
        minSortino5yr: Math.min(...analyzedFunds.map(f => f.sortino5yr)),
        maxSortino5yr: Math.max(...analyzedFunds.map(f => f.sortino5yr)),
        minSd5yr: Math.min(...analyzedFunds.map(f => f.sd5yr)),
        maxSd5yr: Math.max(...analyzedFunds.map(f => f.sd5yr))
      };

      // Calculate composite scores for all funds
      const fundsWithScores = analyzedFunds.map(fund => ({
        ...fund,
        compositeScore: calculateCompositeScore(fund, ranges)
      }));

      // Sort by composite score and get top 5
      const topFunds = fundsWithScores
        .sort((a, b) => b.compositeScore - a.compositeScore)
        .slice(0, 5)
        .map(f => ({
          schemeCode: f.schemeCode,
          schemeName: f.schemeName,
          compositeScore: f.compositeScore,
          rollingReturn5yr: f.rollingReturn5yr,
          sharpe5yr: f.sharpe5yr,
          sortino5yr: f.sortino5yr,
          sd5yr: f.sd5yr
        }));

      // Log top 5 funds for debugging
      console.log(`Top 5 funds for ${category}:`, topFunds.map(f => ({
        name: f.schemeName,
        score: f.compositeScore.toFixed(4),
        rolling5yr: (f.rollingReturn5yr * 100).toFixed(2) + '%',
        sharpe: f.sharpe5yr.toFixed(2),
        sortino: f.sortino5yr.toFixed(2),
        sd: (f.sd5yr * 100).toFixed(2) + '%'
      })));

      // STEP 2: Filter for Regular-Growth plans only from the top 5
      const regularGrowthFunds = topFunds.filter(fund => {
        const name = fund.schemeName.toLowerCase();
        const hasRegular = name.includes('regular');
        const hasGrowth = name.includes('growth');
        const hasDirect = name.includes('direct');
        return (hasRegular && hasGrowth && !hasDirect) || (!hasRegular && hasGrowth && !hasDirect);
      });

      console.log(`Top 5 funds for ${category} (filtered for Regular-Growth):`,
        regularGrowthFunds.map(f => f.schemeName));

      // Cache the Regular-Growth funds from top 5
      FundCache.set(cacheKey, regularGrowthFunds);

      return regularGrowthFunds;
    } catch (error) {
      console.error(`Error getting top 5 funds for ${category}:`, error);
      return null;
    }
  }

  /**
   * Select 1 fund from top 5, avoiding already used funds
   */
  function selectFundFromTop5(top5Funds, category) {
    if (!top5Funds || top5Funds.length === 0) return null;

    // Filter out already used funds
    const availableFunds = top5Funds.filter(fund => !usedFunds.has(fund.schemeCode));

    // If all 5 are used, reset and use the top one
    if (availableFunds.length === 0) {
      console.log(`All top 5 funds for ${category} already used, selecting top ranked fund`);
      const selectedFund = top5Funds[0];
      usedFunds.add(selectedFund.schemeCode);
      console.log(`Selected fund for ${category}: ${selectedFund.schemeName} (Score: ${selectedFund.compositeScore.toFixed(4)})`);
      return selectedFund;
    }

    // Randomly select from available funds
    const randomIndex = Math.floor(Math.random() * availableFunds.length);
    const selectedFund = availableFunds[randomIndex];

    // Mark as used
    usedFunds.add(selectedFund.schemeCode);

    console.log(`Selected fund for ${category}: ${selectedFund.schemeName} (Score: ${selectedFund.compositeScore.toFixed(4)}, ${availableFunds.length}/5 available)`);

    return selectedFund;
  }

  /**
   * Get fund recommendations for all categories in allocation
   * Fetches top 5 funds for each category and selects 1 avoiding repetition
   */
  async function getFundRecommendations(allocation) {
    const recommendations = {};

    // First, fetch top 5 funds for all categories
    const categoryTop5Map = {};

    for (const item of allocation) {
      const category = item.fundCategory;

      // Skip ETFs and special categories
      if (category.toLowerCase().includes('goldbees') ||
          category.toLowerCase().includes('silver etf') ||
          category.toLowerCase().includes('etf')) {
        recommendations[category] = {
          type: 'etf',
          message: 'ETF - Trade via NSE/BSE'
        };
        continue;
      }

      // Fetch top 5 funds for this category
      try {
        const top5Funds = await getTop5FundsForCategory(category);
        if (top5Funds && top5Funds.length > 0) {
          categoryTop5Map[category] = top5Funds;
        }
      } catch (error) {
        console.error(`Error fetching top 5 funds for ${category}:`, error);
      }
    }

    // Now select 1 fund from each category's top 5, avoiding repetition
    for (const item of allocation) {
      const category = item.fundCategory;

      // Skip if already handled (ETFs)
      if (recommendations[category]) continue;

      try {
        const top5Funds = categoryTop5Map[category];
        if (top5Funds) {
          const selectedFund = selectFundFromTop5(top5Funds, category);
          if (selectedFund) {
            recommendations[category] = {
              type: 'fund',
              schemeName: selectedFund.schemeName
            };
          } else {
            recommendations[category] = {
              type: 'manual',
              message: 'Consult advisor for fund selection'
            };
          }
        } else {
          recommendations[category] = {
            type: 'manual',
            message: 'Consult advisor for fund selection'
          };
        }
      } catch (error) {
        console.error(`Error selecting fund for ${category}:`, error);
        recommendations[category] = {
          type: 'manual',
          message: 'Consult advisor for fund selection'
        };
      }
    }

    return recommendations;
  }

  // New allocation logic based on risk profile - NEW RULES FOR RETIREMENT ONLY
  function getAllocationByRiskProfile(riskLevel, goalType, years, goalName = '') {
    const riskProfiles = {
      0: 'Conservative',
      1: 'Moderate', 
      2: 'Aggressive'
    };

    const risk = riskProfiles[riskLevel];
    const isRetirement = goalName.toLowerCase().includes('retirement');

    // RETIREMENT GOALS - Use new allocation rules with GoldBeES and Silver ETFs
    if (isRetirement || goalType === 'retirement') {
      switch (risk) {
        case 'Conservative':
          return [
            { fundCategory: "Multi Cap Fund", percentage: 40 },
            { fundCategory: "Conservative Hybrid Fund", percentage: 25 },
            { fundCategory: "GoldBeES ETF", percentage: 20 },
            { fundCategory: "Debt Fund (Short Duration / Corporate Bond)", percentage: 10 },
            { fundCategory: "Silver ETF", percentage: 5 }
          ];
        case 'Moderate':
          return [
            { fundCategory: "Flexi Cap Fund", percentage: 35 },
            { fundCategory: "Mid Cap Fund", percentage: 25 },
            { fundCategory: "GoldBeES ETF", percentage: 20 },
            { fundCategory: "Conservative Hybrid Fund", percentage: 10 },
            { fundCategory: "Silver ETF", percentage: 10 }
          ];
        case 'Aggressive':
          return [
            { fundCategory: "Flexi Cap Fund", percentage: 40 },
            { fundCategory: "Mid Cap Fund", percentage: 25 },
            { fundCategory: "Small Cap Fund", percentage: 15 },
            { fundCategory: "GoldBeES ETF", percentage: 12 },
            { fundCategory: "Aggressive Hybrid Fund", percentage: 8 }
          ];
      }
    }

    // NON-RETIREMENT GOALS - Use original allocation logic
    // 1. Emergency Fund - Risk-based allocation
    if (goalType === 'emergency') {
      switch (risk) {
        case 'Conservative':
          return [
            { fundCategory: "Liquid Funds", percentage: 80 },
            { fundCategory: "Arbitrage Funds", percentage: 20 }
          ];
        case 'Moderate':
          return [
            { fundCategory: "Liquid Funds", percentage: 50 },
            { fundCategory: "Arbitrage Funds", percentage: 50 }
          ];
        case 'Aggressive':
          return [
            { fundCategory: "Liquid Funds", percentage: 40 },
            { fundCategory: "Arbitrage Funds", percentage: 60 }
          ];
      }
    }

    // 2. Grouped Goals (1-5 years difference) - Original logic
    if (goalType === 'grouped') {
      switch (risk) {
        case 'Conservative':
          return [
            { fundCategory: "Conservative Hybrid Funds", percentage: 70 },
            { fundCategory: "Multi Cap Funds", percentage: 30 }
          ];
        case 'Moderate':
          return [
            { fundCategory: "Conservative Hybrid Funds", percentage: 50 },
            { fundCategory: "Flexi Cap Funds", percentage: 50 }
          ];
        case 'Aggressive':
          return [
            { fundCategory: "Flexi Cap Funds", percentage: 80 },
            { fundCategory: "Aggressive Hybrid Funds", percentage: 20 }
          ];
      }
    }

    // 3. Long-term Individual Goals (18+ years) - Original logic
    if (years >= 18) {
      switch (risk) {
        case 'Conservative':
          return [
            { fundCategory: "Conservative Hybrid Funds", percentage: 70 },
            { fundCategory: "Mid Cap Funds", percentage: 12 },
            { fundCategory: "Flexi Cap Funds", percentage: 18 }
          ];
        case 'Moderate':
          return [
            { fundCategory: "Conservative Hybrid Funds", percentage: 50 },
            { fundCategory: "Mid Cap Funds", percentage: 20 },
            { fundCategory: "Flexi Cap Funds", percentage: 30 }
          ];
        case 'Aggressive':
          return [
            { fundCategory: "Conservative Hybrid Funds", percentage: 25 },
            { fundCategory: "Mid Cap Funds", percentage: 30 },
            { fundCategory: "Flexi Cap Funds", percentage: 45 }
          ];
      }
    }

    // 4. Medium-term Individual Goals (5-17 years) - Original logic
    if (years >= 5) {
      switch (risk) {
        case 'Conservative':
          return [
            { fundCategory: "Conservative Hybrid Funds", percentage: 60 },
            { fundCategory: "Flexi Cap Funds", percentage: 40 }
          ];
        case 'Moderate':
          return [
            { fundCategory: "Conservative Hybrid Funds", percentage: 40 },
            { fundCategory: "Flexi Cap Funds", percentage: 60 }
          ];
        case 'Aggressive':
          return [
            { fundCategory: "Flexi Cap Funds", percentage: 70 },
            { fundCategory: "Mid Cap Funds", percentage: 30 }
          ];
      }
    }

    // 5. Short-term Individual Goals (1-4 years) - Original logic
    switch (risk) {
      case 'Conservative':
        return [
          { fundCategory: "Liquid Funds", percentage: 60 },
          { fundCategory: "Arbitrage Funds", percentage: 40 }
        ];
      case 'Moderate':
        return [
          { fundCategory: "Liquid Funds", percentage: 40 },
          { fundCategory: "Conservative Hybrid Funds", percentage: 60 }
        ];
      case 'Aggressive':
        return [
          { fundCategory: "Conservative Hybrid Funds", percentage: 70 },
          { fundCategory: "Flexi Cap Funds", percentage: 30 }
        ];
    }
  }

  // Group goals for allocation
  function groupGoalsForAllocation(goals) {
    const groups = [];
    const processedGoals = new Set();
    
    // 1. Handle emergency funds separately (always individual)
    const emergencyGoals = goals.filter(g => g.name.toLowerCase().includes('emergency fund'));
    emergencyGoals.forEach(goal => {
      groups.push({
        type: 'individual',
        goalType: 'emergency',
        goals: [goal],
        allocation: getAllocationByRiskProfile(1, 'emergency', goal.yearsLeft, goal.name), // Default to moderate
        description: 'Emergency Fund - Fixed allocation'
      });
      processedGoals.add(goal.name);
    });
    
    // 2. Handle retirement goals separately (always individual)
    const retirementGoals = goals.filter(g => g.name.toLowerCase().includes('retirement'));
    retirementGoals.forEach(goal => {
      groups.push({
        type: 'individual',
        goalType: 'retirement',
        goals: [goal],
        allocation: getAllocationByRiskProfile(1, 'retirement', goal.yearsLeft, goal.name), // Default to moderate
        description: 'Retirement - Individual goal allocation'
      });
      processedGoals.add(goal.name);
    });
    
    // 3. Group remaining goals by tenure similarity (1-5 years difference)
    const remainingGoals = goals.filter(g => !processedGoals.has(g.name));
    
    remainingGoals.forEach(goal => {
      if (processedGoals.has(goal.name)) return;
      
      const similarGoals = remainingGoals.filter(otherGoal => {
        if (processedGoals.has(otherGoal.name)) return false;
        const tenureDiff = Math.abs(goal.yearsLeft - otherGoal.yearsLeft);
        return tenureDiff <= 5;
      });
      
      if (similarGoals.length > 1) {
        // Grouped goals
        groups.push({
          type: 'grouped',
          goalType: 'grouped',
          goals: similarGoals,
          allocation: getAllocationByRiskProfile(1, 'grouped', 
            Math.round(similarGoals.reduce((sum, g) => sum + g.yearsLeft, 0) / similarGoals.length),
            'grouped goals'
          ),
          description: `Grouped goals (${similarGoals.length} goals, 1-5 years difference)`
        });
        similarGoals.forEach(g => processedGoals.add(g.name));
      } else {
        // Individual goals
        const goalType = goal.yearsLeft >= 18 ? 'long-term' : 'individual';
        groups.push({
          type: 'individual',
          goalType: goalType,
          goals: [goal],
          allocation: getAllocationByRiskProfile(1, goalType, goal.yearsLeft, goal.name), // Default to moderate
          description: `${goal.yearsLeft} years tenure - ${goalType === 'long-term' ? 'Long-term' : 'Individual'} goal`
        });
        processedGoals.add(goal.name);
      }
    });
    
    return groups;
  }

  // Chart creation
  function createChart(canvasId, allocation) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    // Function to get the correct color for each fund type - UNIQUE COLORS
    function getFundColor(fundCategory) {
      const category = fundCategory.toLowerCase();
      
      // Check more specific matches first to avoid conflicts
      if (category.includes('multi-asset')) return '#7c3aed'; // Deep Purple
      if (category.includes('debt fund')) return '#059669'; // Dark Green
      if (category.includes('goldbees')) return '#fbbf24'; // Gold
      if (category.includes('silver')) return '#6b7280'; // Silver/Gray
      if (category.includes('small cap')) return '#f97316'; // Orange-Red
      if (category.includes('flexi cap')) return '#ef4444'; // Red
      if (category.includes('multi cap')) return '#06b6d4'; // Cyan
      if (category.includes('mid cap')) return '#3b82f6'; // Blue
      if (category.includes('arbitrage')) return '#10b981'; // Green
      if (category.includes('hybrid')) return '#f59e0b'; // Orange
      if (category.includes('liquid')) return '#8b5cf6'; // Purple
      if (category.includes('gold')) return '#fbbf24'; // Gold (for other gold-related funds)
      
      return '#10b981'; // Default to green for other debt funds
    }
    
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: allocation.map(item => item.fundCategory),
        datasets: [{
          data: allocation.map(item => item.percentage),
          backgroundColor: allocation.map(item => getFundColor(item.fundCategory)),
          borderWidth: 3,
          borderColor: isDarkMode ? '#374151' : '#ffffff',
          hoverBorderWidth: 4,
          hoverBorderColor: isDarkMode ? '#4b5563' : '#f3f4f6'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 0.9,
        cutout: '60%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'rectRounded',
              padding: 20,
              font: {
                size: 14,
                weight: '600'
              },
              color: isDarkMode ? '#ffffff' : '#1f2937',
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const dataset = data.datasets[0];
                    return {
                      text: `${label} - ${dataset.data[i]}%`,
                      fillStyle: dataset.backgroundColor[i],
                      strokeStyle: dataset.borderColor,
                      lineWidth: dataset.borderWidth,
                      pointStyle: 'rectRounded',
                      hidden: false,
                      index: i,
                      fontColor: isDarkMode ? '#ffffff' : '#1f2937'
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            titleColor: isDarkMode ? '#f9fafb' : '#1f2937',
            bodyColor: isDarkMode ? '#d1d5db' : '#6b7280',
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed + '%';
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  // Update charts when theme changes
  function updateChartsForTheme() {
    if (!window.currentGroups) return;
    
    window.currentGroups.forEach((group, groupIndex) => {
      const chartId = `chart-${groupIndex}-0`;
      const existingChart = Chart.getChart(chartId);
      if (existingChart) {
        existingChart.destroy();
        // Force a small delay to ensure proper chart recreation
        setTimeout(() => {
          createChart(chartId, group.allocation);
        }, 100);
      }
    });
  }

  // Listen for theme changes
  document.addEventListener('themeChanged', function(event) {
    setTimeout(() => {
      updateChartsForTheme();
      ensureLegendVisibility();
    }, 100);
  });

  // Force legend text visibility after chart creation
  function ensureLegendVisibility() {
    setTimeout(() => {
      const legendItems = document.querySelectorAll('.chartjs-legend-item-text');
      legendItems.forEach(item => {
        const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
        item.style.color = isDarkMode ? '#ffffff' : '#1f2937';
        item.style.fontWeight = '600';
        item.style.fontSize = '14px';
      });
    }, 200);
  }

  // Update allocation when risk slider changes
  function updateAllocation(groupIndex, goalIndex, riskLevel) {
    const group = window.currentGroups[groupIndex];
    if (!group) return;

    // For grouped goals, use average tenure; for individual goals, use the goal's tenure
    const tenure = group.type === 'grouped' 
      ? Math.round(group.goals.reduce((sum, goal) => sum + goal.yearsLeft, 0) / group.goals.length)
      : group.goals[0].yearsLeft;

    // Update allocation based on new risk level
    // Get the goal name for retirement detection
    const goalName = group.goals.length > 0 ? group.goals[0].name : '';
    group.allocation = getAllocationByRiskProfile(riskLevel, group.goalType, tenure, goalName);

    // Update the expected return display for ALL goals
    let returnRange;
    
    if (group.goalType === 'emergency') {
      // Emergency fund always shows 6-7% regardless of risk level
      returnRange = "6-7%";
    } else {
      // Check if this is a retirement goal
      const isRetirement = goalName.toLowerCase().includes('retirement');
      
      if (isRetirement) {
        // Retirement goals show new risk-based returns
        const returnRanges = {
          0: "9-10%",   // Conservative
          1: "12-13%",  // Moderate
          2: "14-15%"   // Aggressive
        };
        returnRange = returnRanges[riskLevel];
      } else {
        // Non-retirement goals show original returns
        const returnRanges = {
          0: "9-10%",   // Conservative
          1: "10-11%",  // Moderate
          2: "12-14%"   // Aggressive
        };
        returnRange = returnRanges[riskLevel];
      }
    }
    
    const expectedReturnElement = document.querySelector(`#expected-return-${groupIndex}-${goalIndex}`);
    if (expectedReturnElement) {
      expectedReturnElement.textContent = returnRange;
    }

    // Update the allocation display WITHOUT fetching new recommendations
    // This prevents the "vibration" effect when changing risk profiles
    const allocationDetails = document.querySelector(`#allocation-details-${groupIndex}-${goalIndex}`);
    if (allocationDetails) {
      // Get cached recommendations from the initial load
      const cachedRecommendations = window.fundRecommendationsCache || {};

      allocationDetails.innerHTML = group.allocation.map((item, itemIndex) => {
        const recommendation = cachedRecommendations[item.fundCategory];
        let recommendationHTML = '';

        if (recommendation) {
          if (recommendation.type === 'fund') {
            recommendationHTML = `
              <div class="fund-recommendation">
                <span class="recommendation-label">✨ Recommended:</span>
                <span class="recommendation-fund">${recommendation.schemeName}</span>
              </div>`;
          } else if (recommendation.type === 'etf') {
            recommendationHTML = `
              <div class="fund-recommendation etf">
                <span class="recommendation-label">📊</span>
                <span class="recommendation-fund">${recommendation.message}</span>
              </div>`;
          } else if (recommendation.type === 'manual') {
            recommendationHTML = `
              <div class="fund-recommendation manual">
                <span class="recommendation-label">ℹ️</span>
                <span class="recommendation-fund">${recommendation.message}</span>
              </div>`;
          }
        }

        return `
        <div class="allocation-item ${item.fundCategory.toLowerCase().includes('multi-asset') ? 'multi-asset' :
          item.fundCategory.toLowerCase().includes('debt fund') ? 'debt-fund' :
          item.fundCategory.toLowerCase().includes('goldbees') ? 'gold' :
          item.fundCategory.toLowerCase().includes('silver') ? 'silver' :
          item.fundCategory.toLowerCase().includes('small cap') ? 'small-cap' :
          item.fundCategory.toLowerCase().includes('flexi cap') ? 'flexi-cap' :
          item.fundCategory.toLowerCase().includes('multi cap') ? 'multi-cap' :
          item.fundCategory.toLowerCase().includes('mid cap') ? 'mid-cap' :
          item.fundCategory.toLowerCase().includes('arbitrage') ? 'debt' :
          item.fundCategory.toLowerCase().includes('hybrid') ? 'hybrid' :
          item.fundCategory.toLowerCase().includes('liquid') ? 'liquid' :
          item.fundCategory.toLowerCase().includes('gold') ? 'gold' : 'debt'}">
          <div>
            <span class="allocation-fund-name">${item.fundCategory}</span>
            <span class="allocation-percentage">${item.percentage}%</span>
          </div>
          ${recommendationHTML}
        </div>`;
      }).join('');
    }

    // Update the chart WITHOUT destroying it to prevent vibration
    const chartId = `chart-${groupIndex}-${goalIndex}`;
    const existingChart = Chart.getChart(chartId);
    if (existingChart) {
      // Update chart data instead of destroying and recreating
      existingChart.data.labels = group.allocation.map(item => item.fundCategory);
      existingChart.data.datasets[0].data = group.allocation.map(item => item.percentage);
      existingChart.data.datasets[0].backgroundColor = group.allocation.map(item => {
        const category = item.fundCategory.toLowerCase();
        if (category.includes('multi-asset')) return '#7c3aed';
        if (category.includes('debt fund')) return '#059669';
        if (category.includes('goldbees')) return '#fbbf24';
        if (category.includes('silver')) return '#6b7280';
        if (category.includes('small cap')) return '#f97316';
        if (category.includes('flexi cap')) return '#ef4444';
        if (category.includes('multi cap')) return '#06b6d4';
        if (category.includes('mid cap')) return '#3b82f6';
        if (category.includes('arbitrage')) return '#10b981';
        if (category.includes('hybrid')) return '#f59e0b';
        if (category.includes('liquid')) return '#8b5cf6';
        if (category.includes('gold')) return '#fbbf24';
        return '#10b981';
      });
      existingChart.update('none'); // Update without animation to prevent vibration
    }
  }

  // Display allocation
  async function displayAllocation(groupedAllocations) {
    const container = document.getElementById('allocation-container');
    const loader = document.getElementById('allocation-loader');
    const fullscreenLoader = document.getElementById('fullscreen-loader');
    const progressFill = document.getElementById('progress-fill');

    // Update progress to 20%
    if (progressFill) progressFill.style.width = '20%';

    // Update fullscreen loader message
    if (fullscreenLoader) {
      const subtitle = fullscreenLoader.querySelector('.loader-subtitle');
      if (subtitle) {
        subtitle.textContent = 'Analyzing fund categories and fetching top performers...';
      }
    }

    if (loader) {
      loader.querySelector('p').textContent = 'Fetching fund recommendations...';
    }

    container.innerHTML = '';

    // Store groups globally for slider updates
    window.currentGroups = groupedAllocations;

    // Update progress to 30%
    if (progressFill) progressFill.style.width = '30%';

    // Try to load cached recommendations from localStorage first
    const cachedDisplayRecommendations = FundCache.get('step8_display_recommendations');

    // Fetch fund recommendations for all allocations + ALL possible risk profile variations
    let allRecommendations = {};

    // If we have cached recommendations, use them and skip API fetching
    if (cachedDisplayRecommendations) {
      console.log('Loading fund recommendations from cache (page reload)...');
      console.log('Cached recommendations:', cachedDisplayRecommendations);
      console.log('Number of cached categories:', Object.keys(cachedDisplayRecommendations).length);
      allRecommendations = cachedDisplayRecommendations;
      window.fundRecommendationsCache = cachedDisplayRecommendations;

      // Skip to progress 90%
      if (progressFill) progressFill.style.width = '90%';
      if (loader) loader.style.display = 'none';
    } else {
      // No cache - fetch fresh recommendations
      console.log('Fetching fresh fund recommendations...');
      const allPossibleCategories = new Set();

      // Get all current allocation categories
      for (const group of groupedAllocations) {
        group.allocation.forEach(item => allPossibleCategories.add(item.fundCategory));

      // Also get categories for OTHER risk profiles (Conservative and Aggressive)
      const goalName = group.goals.length > 0 ? group.goals[0].name : '';
      const tenure = group.type === 'grouped'
        ? Math.round(group.goals.reduce((sum, goal) => sum + goal.yearsLeft, 0) / group.goals.length)
        : group.goals[0].yearsLeft;

        // Get allocations for all 3 risk levels
        for (let riskLevel = 0; riskLevel <= 2; riskLevel++) {
          const allocation = getAllocationByRiskProfile(riskLevel, group.goalType, tenure, goalName);
          allocation.forEach(item => allPossibleCategories.add(item.fundCategory));
        }
      }

      // Update progress to 40%
      if (progressFill) progressFill.style.width = '40%';

      // Fetch recommendations for ALL possible categories
      const categoriesArray = Array.from(allPossibleCategories);
      const dummyAllocation = categoriesArray.map(cat => ({ fundCategory: cat, percentage: 0 }));

      // Update progress to 50%
      if (progressFill) progressFill.style.width = '50%';

      const recommendations = await getFundRecommendations(dummyAllocation);
      Object.assign(allRecommendations, recommendations);

      // Update progress to 75%
      if (progressFill) progressFill.style.width = '75%';

      // Store recommendations globally AND in localStorage to persist across page loads
      window.fundRecommendationsCache = allRecommendations;
      FundCache.set('step8_display_recommendations', allRecommendations);

      // Update progress to 90%
      if (progressFill) progressFill.style.width = '90%';

      if (loader) loader.style.display = 'none';
    }
    
    groupedAllocations.forEach((group, groupIndex) => {
      const groupElement = document.createElement('div');
      groupElement.className = 'goal-group';
      
      const isGrouped = group.type === 'grouped';
      const groupTitle = isGrouped ? 
        `Group ${groupIndex + 1} (${group.goals.length} goals)` : 
        group.goals[0].name;
      
      if (isGrouped) {
        // For grouped goals, show combined SIP and single allocation
        const totalSip = group.goals.reduce((sum, goal) => sum + goal.sip, 0);
        const totalLumpsum = group.goals.reduce((sum, goal) => sum + (goal.lumpsum || 0), 0);
        const avgTenure = Math.round(group.goals.reduce((sum, goal) => sum + goal.yearsLeft, 0) / group.goals.length);
        // Check if this is a retirement goal for initial display
        const isRetirement = group.goals.some(goal => goal.name.toLowerCase().includes('retirement'));
        const avgReturn = isRetirement ? "12-13%" : "10-11%";

        // Get assignment names and current assignments
        const assignmentNames = getAssignmentNames();
        const currentAssignments = getAssignments();

        groupElement.innerHTML = `
          <div class="goal-group-header">
            <h3 class="goal-group-title">${groupTitle}</h3>
            <p class="goal-group-subtitle">${group.description}</p>
          </div>
          <div class="goal-group-content">
            <div class="goal-item">
              <div class="goal-header">
                <h4 class="goal-name">Combined Goals</h4>
                <div class="goal-details">
                  <div class="goal-detail">
                    <span class="goal-detail-label">Total Monthly SIP</span>
                    <span class="goal-detail-value">${formatCurrency(totalSip)}</span>
                  </div>
                  ${totalLumpsum > 0 ? `
                  <div class="goal-detail">
                    <span class="goal-detail-label">Total Lumpsum Investment</span>
                    <span class="goal-detail-value" style="color: #10b981; font-weight: bold;">${formatCurrency(totalLumpsum)}</span>
                  </div>
                  ` : ''}
                  <div class="goal-detail">
                    <span class="goal-detail-label">Avg Tenure</span>
                    <span class="goal-detail-value">${avgTenure} years</span>
                  </div>
                  <div class="goal-detail">
                    <span class="goal-detail-label">Avg Expected Return</span>
                    <span class="goal-detail-value" id="expected-return-${groupIndex}-0">${avgReturn}</span>
                  </div>
                </div>
              </div>
              <div class="goal-content">
                <div class="chart-container">
                  <canvas id="chart-${groupIndex}-0"></canvas>
                </div>
                <div class="allocation-details">
                  <div class="risk-selector">
                    <label for="risk-slider-${groupIndex}-0">Risk Profile</label>
                    <input type="range" id="risk-slider-${groupIndex}-0" class="risk-slider" 
                           min="0" max="2" value="1" step="1" 
                           data-group="${groupIndex}" data-goal="0">
                    <div class="risk-labels">
                      <span>Conservative</span>
                      <span>Moderate</span>
                      <span>Aggressive</span>
                    </div>
                  </div>
                  <div id="allocation-details-${groupIndex}-0">
                    ${group.allocation.map((item, itemIndex) => {
                      const recommendation = allRecommendations[item.fundCategory];
                      console.log(`Looking up recommendation for: "${item.fundCategory}"`, recommendation);
                      let recommendationHTML = '';

                      if (recommendation) {
                        if (recommendation.type === 'fund') {
                          recommendationHTML = `
                            <div class="fund-recommendation">
                              <span class="recommendation-label">✨ Recommended:</span>
                              <span class="recommendation-fund">${recommendation.schemeName}</span>
                            </div>`;
                        } else if (recommendation.type === 'etf') {
                          recommendationHTML = `
                            <div class="fund-recommendation etf">
                              <span class="recommendation-label">📊</span>
                              <span class="recommendation-fund">${recommendation.message}</span>
                            </div>`;
                        } else if (recommendation.type === 'manual') {
                          recommendationHTML = `
                            <div class="fund-recommendation manual">
                              <span class="recommendation-label">ℹ️</span>
                              <span class="recommendation-fund">${recommendation.message}</span>
                            </div>`;
                        }
                      }

                      return `
                      <div class="allocation-item ${item.fundCategory.toLowerCase().includes('liquid') ? 'liquid' :
                        item.fundCategory.toLowerCase().includes('hybrid') ? 'hybrid' :
                        item.fundCategory.toLowerCase().includes('arbitrage') ? 'debt' :
                        item.fundCategory.toLowerCase().includes('mid cap') ? 'mid-cap' :
                        item.fundCategory.toLowerCase().includes('flexi cap') ? 'flexi-cap' :
                        item.fundCategory.toLowerCase().includes('multi cap') ? 'multi-cap' :
                        item.fundCategory.toLowerCase().includes('small cap') ? 'small-cap' :
                        item.fundCategory.toLowerCase().includes('goldbees') || item.fundCategory.toLowerCase().includes('gold') ? 'gold' :
                        item.fundCategory.toLowerCase().includes('silver') ? 'silver' :
                        item.fundCategory.toLowerCase().includes('multi-asset') ? 'multi-asset' :
                        item.fundCategory.toLowerCase().includes('debt fund') ? 'debt' : 'debt'}">
                        <div>
                          <span class="allocation-fund-name">${item.fundCategory}</span>
                          <span class="allocation-percentage">${item.percentage}%</span>
                        </div>
                        ${recommendationHTML}
                      </div>`;
                    }).join('')}
                  </div>
                </div>
              </div>
            </div>
            <div class="grouped-goals-list">
              <h5>Goals in this group:</h5>
              <ul>
                ${group.goals.map(goal => {
                  const sipDisplay = goal.isPureLumpsum ?
                    `<span style="color: #10b981; font-weight: bold;">${formatCurrency(goal.sip)} (Lumpsum)</span>` :
                    `${formatCurrency(goal.sip)}/month`;
                  const lumpsumInfo = goal.lumpsum > 0 ?
                    ` + <span style="color: #10b981; font-weight: bold;">${formatCurrency(goal.lumpsum)} lumpsum</span>` :
                    '';

                  // Build assign dropdown only if there are multiple assignment options
                  let assignDropdown = '';
                  if (assignmentNames.length > 1) {
                    const currentAssignment = currentAssignments[goal.name] || assignmentNames[0];
                    assignDropdown = `
                      <div class="goal-assign-wrapper">
                        <span class="assign-label">Assign to:</span>
                        <select class="assign-dropdown" data-goal-name="${goal.name}">
                          ${assignmentNames.map(name =>
                            `<option value="${name}" ${currentAssignment === name ? 'selected' : ''}>${name}</option>`
                          ).join('')}
                        </select>
                      </div>
                    `;
                  }

                  return `
                    <li>
                      <div class="grouped-goal-item">
                        <div class="goal-info">
                          <span class="goal-name-text">${goal.name}</span>
                          <span class="goal-sip-text">${sipDisplay}${lumpsumInfo}</span>
                          <span class="goal-tenure-text">(${goal.yearsLeft} years)</span>
                        </div>
                        ${assignDropdown}
                      </div>
                    </li>
                  `;
                }).join('')}
              </ul>
            </div>
          </div>
        `;
      } else {
        // For individual goals, show as before
        let initialReturn;
        if (group.goalType === 'emergency') {
          initialReturn = "6-7%";
        } else if (group.goalType === 'retirement') {
          initialReturn = "12-13%"; // Default moderate risk for retirement
        } else {
          initialReturn = `${(getExpectedReturn(group.goals[0].yearsLeft) * 100).toFixed(1)}%`;
        }

        const goal = group.goals[0];
        const sipDisplay = goal.isPureLumpsum ?
          `<span style="color: #10b981; font-weight: bold;">${formatCurrency(goal.sip)} (Lumpsum)</span>` :
          formatCurrency(goal.sip);

        // Get assignment names and current assignments
        const assignmentNames = getAssignmentNames();
        const currentAssignments = getAssignments();

        // Build assign dropdown only if there are multiple assignment options
        let assignDropdown = '';
        if (assignmentNames.length > 1) {
          const currentAssignment = currentAssignments[goal.name] || assignmentNames[0];
          assignDropdown = `
            <div class="goal-detail">
              <span class="goal-detail-label">Assign to</span>
              <span class="goal-detail-value">
                <select class="assign-dropdown assign-dropdown-individual" data-goal-name="${goal.name}">
                  ${assignmentNames.map(name =>
                    `<option value="${name}" ${currentAssignment === name ? 'selected' : ''}>${name}</option>`
                  ).join('')}
                </select>
              </span>
            </div>
          `;
        }

        groupElement.innerHTML = `
          <div class="goal-group-header">
            <h3 class="goal-group-title">${groupTitle}</h3>
            <p class="goal-group-subtitle">${group.description}</p>
          </div>
          <div class="goal-group-content">
            <div class="goal-item">
              <div class="goal-header">
                <h4 class="goal-name">${goal.name}</h4>
                <div class="goal-details">
                  <div class="goal-detail">
                    <span class="goal-detail-label">Monthly SIP</span>
                    <span class="goal-detail-value">${sipDisplay}</span>
                  </div>
                  ${goal.lumpsum > 0 ? `
                  <div class="goal-detail">
                    <span class="goal-detail-label">Lumpsum Investment</span>
                    <span class="goal-detail-value" style="color: #10b981; font-weight: bold;">${formatCurrency(goal.lumpsum)}</span>
                  </div>
                  ` : ''}
                  <div class="goal-detail">
                    <span class="goal-detail-label">Tenure</span>
                    <span class="goal-detail-value">${goal.yearsLeft} years</span>
                  </div>
                  <div class="goal-detail">
                    <span class="goal-detail-label">Expected Return</span>
                    <span class="goal-detail-value" id="expected-return-${groupIndex}-0">${initialReturn}</span>
                  </div>
                  ${assignDropdown}
                </div>
              </div>
              <div class="goal-content">
                <div class="chart-container">
                  <canvas id="chart-${groupIndex}-0"></canvas>
                </div>
                <div class="allocation-details">
                  <div class="risk-selector">
                    <label for="risk-slider-${groupIndex}-0">Risk Profile</label>
                    <input type="range" id="risk-slider-${groupIndex}-0" class="risk-slider" 
                           min="0" max="2" value="1" step="1" 
                           data-group="${groupIndex}" data-goal="0">
                    <div class="risk-labels">
                      <span>Conservative</span>
                      <span>Moderate</span>
                      <span>Aggressive</span>
                    </div>
                  </div>
                  <div id="allocation-details-${groupIndex}-0">
                    ${group.allocation.map((item, itemIndex) => {
                      const recommendation = allRecommendations[item.fundCategory];
                      console.log(`Looking up recommendation for: "${item.fundCategory}"`, recommendation);
                      let recommendationHTML = '';

                      if (recommendation) {
                        if (recommendation.type === 'fund') {
                          recommendationHTML = `
                            <div class="fund-recommendation">
                              <span class="recommendation-label">✨ Recommended:</span>
                              <span class="recommendation-fund">${recommendation.schemeName}</span>
                            </div>`;
                        } else if (recommendation.type === 'etf') {
                          recommendationHTML = `
                            <div class="fund-recommendation etf">
                              <span class="recommendation-label">📊</span>
                              <span class="recommendation-fund">${recommendation.message}</span>
                            </div>`;
                        } else if (recommendation.type === 'manual') {
                          recommendationHTML = `
                            <div class="fund-recommendation manual">
                              <span class="recommendation-label">ℹ️</span>
                              <span class="recommendation-fund">${recommendation.message}</span>
                            </div>`;
                        }
                      }

                      return `
                      <div class="allocation-item ${item.fundCategory.toLowerCase().includes('liquid') ? 'liquid' :
                        item.fundCategory.toLowerCase().includes('hybrid') ? 'hybrid' :
                        item.fundCategory.toLowerCase().includes('arbitrage') ? 'debt' :
                        item.fundCategory.toLowerCase().includes('mid cap') ? 'mid-cap' :
                        item.fundCategory.toLowerCase().includes('flexi cap') ? 'flexi-cap' :
                        item.fundCategory.toLowerCase().includes('multi cap') ? 'multi-cap' :
                        item.fundCategory.toLowerCase().includes('small cap') ? 'small-cap' :
                        item.fundCategory.toLowerCase().includes('goldbees') || item.fundCategory.toLowerCase().includes('gold') ? 'gold' :
                        item.fundCategory.toLowerCase().includes('silver') ? 'silver' :
                        item.fundCategory.toLowerCase().includes('multi-asset') ? 'multi-asset' :
                        item.fundCategory.toLowerCase().includes('debt fund') ? 'debt' : 'debt'}">
                        <div>
                          <span class="allocation-fund-name">${item.fundCategory}</span>
                          <span class="allocation-percentage">${item.percentage}%</span>
                        </div>
                        ${recommendationHTML}
                      </div>`;
                    }).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      
      container.appendChild(groupElement);
      
      // Create charts after DOM is updated
      setTimeout(() => {
        // For both grouped and individual goals, create only one chart per group
        createChart(`chart-${groupIndex}-0`, group.allocation);
        ensureLegendVisibility();
      }, 100);
    });

    // Add event listeners for risk sliders
    setTimeout(() => {
      document.querySelectorAll('.risk-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
          const groupIndex = parseInt(e.target.dataset.group);
          const goalIndex = parseInt(e.target.dataset.goal);
          const riskLevel = parseInt(e.target.value);

          updateAllocation(groupIndex, goalIndex, riskLevel);
        });
      });

      // Add event listeners for assign dropdowns
      document.querySelectorAll('.assign-dropdown').forEach(dropdown => {
        dropdown.addEventListener('change', (e) => {
          const goalName = e.target.dataset.goalName;
          const assignedTo = e.target.value;

          saveAssignment(goalName, assignedTo);

          // Show a brief confirmation (optional)
          console.log(`Assigned "${goalName}" to ${assignedTo}`);
        });
      });
    }, 200);
  }


  // Main initialization
  async function initializeStep8() {
    // IMPORTANT: Clear all fund recommendation caches on every Step 8 visit
    // This ensures users get fresh fund recommendations (from top 3) each time
    FundCache.clearAll();
    usedFunds.clear();
    console.log('Fund recommendation cache cleared - fetching fresh recommendations');

    const step1 = getStep1();
    const goals = getGoals();
    const retirement = getRetirement();
    const rule = getInvestmentRule();

    if (!step1 || (!goals.length && !retirement)) {
      // Redirect to step 1 if no data
      window.location.href = '8-events.html';
      return;
    }
    
    // Prepare goals data
    const allGoals = [];
    
    // Add retirement goal
    if (retirement && retirement.corpus > 0) {
      const nowYear = new Date().getFullYear();
      const yLeft = Math.max(0, Math.round(retirement.nToRet || 0));
      allGoals.push({
        name: 'Retirement',
        sip: retirement.sip || 0,
        yearsLeft: yLeft,
        expectedReturn: getExpectedReturn(yLeft)
      });
    }
    
    // Add other goals
    goals.forEach(goal => {
      // Include goals that have either SIP > 0 OR lumpsum > 0 (for allocation purposes)
      // Even if SIP is 0 due to lumpsum investment, we still need to show allocation
      if (goal.sip > 0 || (goal.lumpsum && goal.lumpsum > 0)) {
        const nowYear = new Date().getFullYear();
        const yearsLeft = Math.max(0, (goal.targetYear || nowYear) - nowYear);
        allGoals.push({
          name: goal.name,
          sip: goal.sip || 0,
          yearsLeft: yearsLeft,
          expectedReturn: getExpectedReturn(yearsLeft),
          lumpsum: goal.lumpsum || 0,
          isPureLumpsum: goal.isPureLumpsum || false
        });
      }
    });
    
    if (allGoals.length === 0) {
      // No goals to allocate
      const container = document.getElementById('allocation-container');
      const loader = document.getElementById('allocation-loader');
      
      if (loader) loader.style.display = 'none';
      
      container.innerHTML = `
        <div class="summary-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
          <h2>No Goals to Allocate</h2>
          <p>Please complete the previous steps to set up your financial goals before generating investment allocation.</p>
        </div>
      `;
      return;
    }
    
    // Group goals and display allocation
    const groupedAllocations = groupGoalsForAllocation(allGoals);
    await displayAllocation(groupedAllocations);
  }

  // Force refresh all charts with new colors
  function refreshAllCharts() {
    if (!window.currentGroups) return;
    
    window.currentGroups.forEach((group, groupIndex) => {
      const chartId = `chart-${groupIndex}-0`;
      const existingChart = Chart.getChart(chartId);
      if (existingChart) {
        existingChart.destroy();
        setTimeout(() => {
          createChart(chartId, group.allocation);
        }, 100);
      }
    });
  }

  // Force refresh all allocation lists with correct CSS classes
  function refreshAllAllocationLists() {
    if (!window.currentGroups) return;

    window.currentGroups.forEach((group, groupIndex) => {
      const allocationDetails = document.querySelector(`#allocation-details-${groupIndex}-0`);
      if (allocationDetails && group.allocation) {
        // Get cached recommendations to preserve them during refresh
        const cachedRecommendations = window.fundRecommendationsCache || {};

        allocationDetails.innerHTML = group.allocation.map((item, itemIndex) => {
          const recommendation = cachedRecommendations[item.fundCategory];
          let recommendationHTML = '';

          if (recommendation) {
            if (recommendation.type === 'fund') {
              recommendationHTML = `
                <div class="fund-recommendation">
                  <span class="recommendation-label">✨ Recommended:</span>
                  <span class="recommendation-fund">${recommendation.schemeName}</span>
                </div>`;
            } else if (recommendation.type === 'etf') {
              recommendationHTML = `
                <div class="fund-recommendation etf">
                  <span class="recommendation-label">📊</span>
                  <span class="recommendation-fund">${recommendation.message}</span>
                </div>`;
            } else if (recommendation.type === 'manual') {
              recommendationHTML = `
                <div class="fund-recommendation manual">
                  <span class="recommendation-label">ℹ️</span>
                  <span class="recommendation-fund">${recommendation.message}</span>
                </div>`;
            }
          }

          return `
          <div class="allocation-item ${item.fundCategory.toLowerCase().includes('multi-asset') ? 'multi-asset' :
            item.fundCategory.toLowerCase().includes('debt fund') ? 'debt-fund' :
            item.fundCategory.toLowerCase().includes('goldbees') ? 'gold' :
            item.fundCategory.toLowerCase().includes('silver') ? 'silver' :
            item.fundCategory.toLowerCase().includes('small cap') ? 'small-cap' :
            item.fundCategory.toLowerCase().includes('flexi cap') ? 'flexi-cap' :
            item.fundCategory.toLowerCase().includes('multi cap') ? 'multi-cap' :
            item.fundCategory.toLowerCase().includes('mid cap') ? 'mid-cap' :
            item.fundCategory.toLowerCase().includes('arbitrage') ? 'debt' :
            item.fundCategory.toLowerCase().includes('hybrid') ? 'hybrid' :
            item.fundCategory.toLowerCase().includes('liquid') ? 'liquid' :
            item.fundCategory.toLowerCase().includes('gold') ? 'gold' : 'debt'}">
            <div>
              <span class="allocation-fund-name">${item.fundCategory}</span>
              <span class="allocation-percentage">${item.percentage}%</span>
            </div>
            ${recommendationHTML}
          </div>`;
        }).join('');
      }
    });
  }

  // Initialize when DOM is loaded with loading screen
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showLoadingScreen);
  } else {
    showLoadingScreen();
  }

  async function showLoadingScreen() {
    const fullscreenLoader = document.getElementById('fullscreen-loader');
    const progressFill = document.getElementById('progress-fill');
    const subtitleElement = fullscreenLoader?.querySelector('.loader-subtitle');

    // Array of loading messages - Top 10 picks
    const loadingMessages = [
      "Analyzing your financial goals...",
      "Calculating optimal asset allocation...",
      "Matching funds to your risk profile...",
      "Building your personalized portfolio...",
      "Selecting top-performing mutual funds...",
      "Balancing risk and returns...",
      "Tailoring recommendations to your timeline...",
      "Creating your wealth-building strategy...",
      "Applying smart diversification rules...",
      "Almost there! Preparing your allocation..."
    ];

    let messageIndex = 0;
    let messageInterval;

    // Function to update loading message with fade effect
    const updateMessage = () => {
      if (subtitleElement && messageIndex < loadingMessages.length) {
        // Fade out
        subtitleElement.style.opacity = '0';

        setTimeout(() => {
          // Change text
          subtitleElement.textContent = loadingMessages[messageIndex];
          messageIndex++;

          // Fade in
          subtitleElement.style.opacity = '1';
        }, 300);
      }
    };

    // Set first message immediately
    updateMessage();

    // Rotate messages every 2.5 seconds
    messageInterval = setInterval(updateMessage, 2500);

    // Set progress to 10% initially
    if (progressFill) progressFill.style.width = '10%';

    // Keep loading screen visible while initializing
    // Initialize Step 8 first
    await initializeStep8();

    // Clear the message interval
    clearInterval(messageInterval);

    // Show final message
    if (subtitleElement) {
      subtitleElement.textContent = loadingMessages[loadingMessages.length - 1];
    }

    // Set progress to 100% when done
    if (progressFill) progressFill.style.width = '100%';

    // Wait a brief moment to show 100% progress
    await new Promise(resolve => setTimeout(resolve, 300));

    // Only hide loading screen after everything is loaded
    if (fullscreenLoader) {
      fullscreenLoader.classList.add('fade-out');

      // Remove from DOM after fade-out animation completes
      setTimeout(() => {
        fullscreenLoader.style.display = 'none';
      }, 500);
    }
  }

  // Force refresh charts and allocation lists after a short delay to ensure new colors are applied
  setTimeout(() => {
    refreshAllCharts();
    refreshAllAllocationLists();
  }, 1000);

  // Global function to manually refresh all colors (can be called from browser console)
  window.refreshStep8Colors = function() {
    refreshAllCharts();
    refreshAllAllocationLists();
    console.log('Step 8 colors refreshed!');
  };

  // ===== RISK PROFILING QUESTIONNAIRE LOGIC =====
  const riskQuizModal = document.getElementById('risk-quiz-modal');
  const openRiskQuizBtn = document.getElementById('open-risk-quiz');
  const closeRiskQuizBtn = document.getElementById('close-risk-quiz');
  const cancelRiskQuizBtn = document.getElementById('cancel-risk-quiz');
  const submitRiskQuizBtn = document.getElementById('submit-risk-quiz');
  const applyRiskProfileBtn = document.getElementById('apply-risk-profile');
  const riskQuizForm = document.getElementById('risk-quiz-form');
  const quizResults = document.getElementById('quiz-results');

  let calculatedRiskProfile = 1; // 0 = Conservative, 1 = Moderate, 2 = Aggressive

  // Open quiz modal
  if (openRiskQuizBtn) {
    openRiskQuizBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (riskQuizModal) {
        riskQuizModal.style.display = 'flex';
        // Reset form and hide results
        if (riskQuizForm) riskQuizForm.reset();
        if (quizResults) quizResults.style.display = 'none';
      }
    });
  }

  // Close modal handlers
  function closeQuizModal() {
    if (riskQuizModal) {
      riskQuizModal.style.display = 'none';
    }
  }

  if (closeRiskQuizBtn) {
    closeRiskQuizBtn.addEventListener('click', closeQuizModal);
  }

  if (cancelRiskQuizBtn) {
    cancelRiskQuizBtn.addEventListener('click', closeQuizModal);
  }

  // Close modal when clicking outside
  if (riskQuizModal) {
    riskQuizModal.addEventListener('click', (e) => {
      if (e.target === riskQuizModal) {
        closeQuizModal();
      }
    });
  }

  // Submit quiz and calculate score
  if (submitRiskQuizBtn) {
    submitRiskQuizBtn.addEventListener('click', () => {
      if (!riskQuizForm) return;

      // Validate all questions are answered
      const formData = new FormData(riskQuizForm);
      const totalQuestions = 13;
      let answeredQuestions = 0;

      for (let i = 1; i <= totalQuestions; i++) {
        if (formData.get(`q${i}`)) {
          answeredQuestions++;
        }
      }

      if (answeredQuestions < totalQuestions) {
        alert(`Please answer all questions. You've answered ${answeredQuestions} out of ${totalQuestions} questions.`);
        return;
      }

      // Calculate total score
      let totalScore = 0;
      for (let i = 1; i <= totalQuestions; i++) {
        const value = parseInt(formData.get(`q${i}`)) || 0;
        totalScore += value;
      }

      // Determine risk profile based on score
      // 13-28: Conservative, 29-44: Moderate, 45-65: Aggressive
      let profileType = '';
      let profileDescription = '';
      let profileClass = '';

      if (totalScore >= 13 && totalScore <= 28) {
        calculatedRiskProfile = 0; // Conservative
        profileType = '🟢 Conservative Investor';
        profileDescription = 'You prefer safety and low volatility. Your portfolio focuses on capital preservation with steady, lower returns. You are comfortable with debt-oriented funds and minimal equity exposure.';
        profileClass = 'conservative';
      } else if (totalScore >= 29 && totalScore <= 44) {
        calculatedRiskProfile = 1; // Moderate
        profileType = '🟡 Moderate Investor';
        profileDescription = 'You seek balanced risk and reward. Your portfolio combines stability with growth potential through a mix of debt and equity funds. You can tolerate moderate market fluctuations for better long-term returns.';
        profileClass = 'moderate';
      } else {
        calculatedRiskProfile = 2; // Aggressive
        profileType = '🔴 Aggressive Investor';
        profileDescription = 'You have high risk appetite and seek maximum growth. Your portfolio is equity-heavy with focus on high-return potential. You can handle significant market volatility for superior long-term wealth creation.';
        profileClass = 'aggressive';
      }

      // Display results
      const scoreValueEl = document.getElementById('score-value');
      const profileTypeEl = document.getElementById('profile-type');
      const profileDescEl = document.getElementById('profile-description');
      const resultProfileEl = document.getElementById('result-profile');

      if (scoreValueEl) scoreValueEl.textContent = totalScore;
      if (profileTypeEl) profileTypeEl.textContent = profileType;
      if (profileDescEl) profileDescEl.textContent = profileDescription;

      if (resultProfileEl) {
        resultProfileEl.className = 'result-profile ' + profileClass;
      }

      // Show results section
      if (quizResults) {
        quizResults.style.display = 'block';
        // Scroll to results
        quizResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      console.log(`Risk Profile Calculated: Score=${totalScore}, Profile=${profileType}, RiskLevel=${calculatedRiskProfile}`);
    });
  }

  // Apply risk profile to all sliders
  if (applyRiskProfileBtn) {
    applyRiskProfileBtn.addEventListener('click', () => {
      // Update all risk sliders
      const allSliders = document.querySelectorAll('.risk-slider');
      allSliders.forEach(slider => {
        slider.value = calculatedRiskProfile;

        // Trigger the slider change event to update allocations
        const groupIndex = parseInt(slider.dataset.group);
        const goalIndex = parseInt(slider.dataset.goal);

        if (!isNaN(groupIndex) && !isNaN(goalIndex)) {
          updateAllocation(groupIndex, goalIndex, calculatedRiskProfile);
        }
      });

      // Close modal
      closeQuizModal();

      // Show success message
      alert(`Risk profile successfully applied to all goals!\n\nYour profile: ${calculatedRiskProfile === 0 ? 'Conservative' : calculatedRiskProfile === 1 ? 'Moderate' : 'Aggressive'}`);
    });
  }
})();