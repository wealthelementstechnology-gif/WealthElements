/**
 * ========================================
 * MUTUAL FUND ANALYZER - MAIN APPLICATION
 * Version: 1.6 - Excluded Super Institutional, Institutional & Defunct Plans
 * ========================================
 */

/**
 * Main App Component
 */
const App = () => {
    // State management
    const [allFundsList, setAllFundsList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [planType, setPlanType] = useState('regular'); // 'regular' or 'direct'
    const [duration, setDuration] = useState(5);
    const [analyzedFunds, setAnalyzedFunds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [riskFreeRate] = useState(0.07);
    const [selectedFund, setSelectedFund] = useState(null);

    // Event handlers
    const handleFundClick = (fund) => {
        setSelectedFund(fund);
    };

    const handleCloseFundDetails = () => {
        setSelectedFund(null);
    };

    // Configuration
    const allowedAmcs = [
        'sbi', 'icici prudential', 'hdfc', 'nippon india', 'kotak mahindra',
        'aditya birla sun life', 'uti', 'axis', 'mirae asset', 'dsp', 'tata',
        'canara robeco', 'bandhan', 'hsbc', 'invesco', 'franklin templeton',
        'ppfas', 'edelweiss', 'motilal oswal', 'quant', 'sundaram',
        'baroda bnp paribas', 'pgim india', 'mahindra manulife', 'whiteoak capital'
    ];

    const fundCategories = {
        "Flexi Cap": { include: ["flexi cap", "flexicap"] },
        "Large and Mid Cap": { include: ["large & mid cap", "large and mid cap", "large mid cap"] },
        "Value/Contra": { include: ["value", "contra"], exclude: ["dividend"] },
        "Mid Cap": { include: ["mid cap"], exclude: ["large & mid cap", "large and mid cap", "large mid cap", "small cap"] },
        "Small Cap": { include: ["small cap"], exclude: ["mid cap"] },
        "Multi Cap": { include: ["multi cap"] },
        "Dividend Yield": { include: ["dividend yield"] },
        "Focused": { include: ["focused"] },
        "Tax Saving (ELSS)": { include: ["elss", "tax saver"] },
        "Large Cap": { include: ["large cap"], exclude: ["large & mid cap", "large and mid cap", "large mid cap"] },
        "Dynamic Asset Allocation or Balanced Advantage": { include: ["dynamic asset allocation", "balanced advantage"] },
        "Multi Asset": { include: ["multi-asset", "multi asset"] },
        "Aggressive Hybrid": { include: ["aggressive hybrid", "equity hybrid"] },
        "Conservative Hybrid": { include: ["conservative hybrid"] },
        "Equity Savings": { include: ["equity savings"] },
        "Commodities": { include: ["commodities", "gold"] },
        "International Funds": { include: ["international", "global", "us opportunities", "nasdaq"] },
        "Opportunities": { include: ["opportunities", "thematic", "sectoral"] },
        "Ultra Short Term": { include: ["ultra short"] },
        "Liquid": { include: ["liquid"] },
        "Arbitrage": { include: ["arbitrage"] },
        "Banking and PSU": { include: ["banking and psu", "banking & psu"] },
        "Corporate Bond": { include: ["corporate bond"] },
        "Overnight": { include: ["overnight"] }
    };

    // Initialize app
    useEffect(() => {
        const fetchAllFundsData = async () => {
            setLoading(true);
            setLoadingMessage("Fetching master list of all funds...");
            try {
                const data = await fetchAllFunds();
                setAllFundsList(data);
                setCategories(Object.keys(fundCategories));
                setSelectedCategory(Object.keys(fundCategories)[0]);
            } catch (error) {
                console.error("Error fetching all funds:", error);
                setLoadingMessage("Error: Could not fetch fund list. Please check your internet connection and try again.");
                
                // Show user-friendly error message
                setTimeout(() => {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-banner';
                    errorDiv.innerHTML = `
                        <p><strong>Connection Error:</strong> Unable to fetch mutual fund data. 
                        Please check your internet connection and refresh the page.</p>
                    `;
                    const container = document.querySelector('.container');
                    if (container) {
                        container.insertBefore(errorDiv, container.firstChild);
                    }
                }, 1000);
            } finally {
                setLoading(false);
                setLoadingMessage("");
            }
        };
        
        fetchAllFundsData();
    }, []);

    /**
     * Perform fund analysis for a specific scheme
     */
    const performFundAnalysis = async (schemeCode, schemeName) => {
        const rawNavHistory = await fetchNavHistory(schemeCode);
        if (!rawNavHistory || rawNavHistory.length < 2) return null;

        const navHistory = rawNavHistory.slice().reverse();

        // Check if fund has sufficient history
        if (!hasSufficientHistory(navHistory, duration)) return null;

        // Calculate metrics for different periods
        const metrics3yr = calculateMetricsForPeriod(navHistory, 3, riskFreeRate);
        const metrics5yr = calculateMetricsForPeriod(navHistory, 5, riskFreeRate);

        return {
            schemeCode,
            schemeName,
            rollingReturn3yr: metrics3yr.rollingReturn,
            rollingReturn5yr: metrics5yr.rollingReturn,
            sd3yr: metrics3yr.annualizedStdDev,
            sharpe3yr: metrics3yr.sharpeRatio,
            sortino3yr: metrics3yr.sortinoRatio,
            sd5yr: metrics5yr.annualizedStdDev,
            sharpe5yr: metrics5yr.sharpeRatio,
            sortino5yr: metrics5yr.sortinoRatio
        };
    };

    /**
     * Analyze funds in selected category
     */
    const analyzeCategory = async () => {
        setLoading(true);
        setAnalyzedFunds([]);
        setLoadingMessage(`Finding top funds in ${selectedCategory}...`);

        const { include, exclude = [] } = fundCategories[selectedCategory];
        
        // Filter funds by category and AMC
        const categoryFunds = allFundsList.filter(fund => {
            const name = fund.schemeName.toLowerCase();
            
            // Check if fund is from allowed AMC
            const isAllowedAmc = allowedAmcs.some(amc => {
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

            if (!isAllowedAmc) return false;

            // Exclude category exclusions
            if (exclude.some(exKw => name.includes(exKw))) return false;

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
            const matchesCategory = include.some(kw => name.includes(kw));

            // Filter based on plan type selection
            let matchesPlanType = false;
            if (planType === 'regular') {
                // Regular - Growth only
                // Accept if has 'regular' and 'growth', OR if it has 'growth' but NO 'direct' (some funds omit 'regular' in the name)
                const hasRegular = name.includes('regular');
                const hasGrowth = name.includes('growth');
                const hasDirect = name.includes('direct');

                matchesPlanType = (hasRegular && hasGrowth && !hasDirect) ||
                                 (!hasRegular && hasGrowth && !hasDirect);
            } else if (planType === 'direct') {
                // Direct - Growth only
                matchesPlanType = name.includes('direct') && name.includes('growth');
            }

            return matchesCategory && matchesPlanType;
        }).slice(0, 40);

        // Deduplicate funds
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

        if (deduplicatedFunds.length === 0) {
            const planTypeName = planType === 'regular' ? 'Regular - Growth' : 'Direct - Growth';
            setLoadingMessage(`No "${planTypeName}" funds found for the selected criteria.`);
            setLoading(false);
            return;
        }

        setLoadingMessage(`Analyzing ${deduplicatedFunds.length} funds for a ${duration}-year history...`);

        // Analyze funds
        const analysisPromises = deduplicatedFunds.map(fund => 
            performFundAnalysis(fund.schemeCode, fund.schemeName)
        );
        
        const results = (await Promise.all(analysisPromises))
            .filter(Boolean)
            .slice(0, 15);

        setAnalyzedFunds(results);
        setLoading(false);

        if (results.length === 0) {
            setLoadingMessage(`No funds found with a ${duration}+ year history in this category.`);
        } else {
            setLoadingMessage('');
        }
    };

    /**
     * Remove fund from analysis
     */
    const removeFund = (schemeCode) => {
        setAnalyzedFunds(analyzedFunds.filter(fund => fund.schemeCode !== schemeCode));
    };

    /**
     * Calculate ranked funds with composite scoring
     */
    const rankedFunds = useMemo(() => {
        if (analyzedFunds.length < 2) {
            return analyzedFunds.map((f, i) => ({...f, rank: i + 1}));
        }

        const validFunds = analyzedFunds.filter(f => isValidFund(f));
        if (validFunds.length < 2) {
            return analyzedFunds.map((f, i) => ({...f, rank: i + 1}));
        }

        const ranges = calculateRanges(validFunds);
        
        const fundsWithScores = analyzedFunds.map(fund => {
            const compositeScore = calculateCompositeScore(fund, ranges);
            return { ...fund, compositeScore };
        });

        const sorted = fundsWithScores.sort((a, b) => b.compositeScore - a.compositeScore);
        return sorted.map((fund, index) => ({ ...fund, rank: index + 1 }));
    }, [analyzedFunds, duration]);

    return (
        <div>
            {/* Control Section */}
            <section className="section">
                <h2 className="section-title">Analysis Parameters</h2>
                <div className="form-grid">
                    <div className="form-field">
                        <label htmlFor="category-select">Fund Category</label>
                        <select
                            id="category-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            disabled={loading || categories.length === 0}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-field">
                        <label htmlFor="plan-type-toggle">Plan Type</label>
                        <div className="plan-type-toggle" id="plan-type-toggle">
                            <button
                                className={`plan-toggle-btn ${planType === 'regular' ? 'active' : ''}`}
                                onClick={() => setPlanType('regular')}
                                disabled={loading}
                            >
                                Regular
                            </button>
                            <button
                                className={`plan-toggle-btn ${planType === 'direct' ? 'active' : ''}`}
                                onClick={() => setPlanType('direct')}
                                disabled={loading}
                            >
                                Direct
                            </button>
                        </div>
                    </div>
                    <div className="form-field">
                        <label htmlFor="duration-select">Analysis Duration</label>
                        <select
                            id="duration-select"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            disabled={loading}
                        >
                            <option value={3}>3 Years</option>
                            <option value={5}>5 Years</option>
                            <option value={7}>7 Years</option>
                            <option value={10}>10+ Years</option>
                        </select>
                    </div>
                </div>
                <div className="actions">
                    <button 
                        onClick={analyzeCategory} 
                        className="btn btn-lg" 
                        disabled={loading || !selectedCategory}
                    >
                        {loading ? 'Analyzing...' : 'Analyze Category'}
                    </button>
                </div>
                {loading && (
                    <div className="loading-message">{loadingMessage}</div>
                )}
            </section>

            {/* Fund Selection Guide Section */}
            <section className="section metrics-guide-section">
                <h2 className="section-title">Understanding Fund Selection</h2>

                <div className="fund-selection-guide">
                    <p className="selection-description">
                        Our fund selection process begins by filtering the master list of mutual funds based on your chosen <strong>Fund Category</strong>
                        (such as Flexi Cap, Large Cap, or Mid Cap) and <strong>Plan Type</strong> (Regular or Direct). The analyzer identifies funds
                        from 25+ reputable Asset Management Companies (AMCs) that match the category keywords. Once filtered, the system retrieves
                        historical NAV (Net Asset Value) data and validates that each fund has sufficient trading history for your selected
                        <strong> Analysis Duration</strong> (3, 5, 7, or 10+ years). Only funds meeting the minimum duration threshold are analyzed
                        for performance metrics including <span className="metric-tooltip" data-tooltip="Average annualized returns calculated over overlapping time periods. This metric shows how consistently a fund has performed across different market cycles. Higher rolling returns indicate better and more consistent performance.">rolling returns</span>, <span className="metric-tooltip" data-tooltip="A risk-adjusted return metric that measures excess returns per unit of total risk. Values above 1 are considered good, above 2 are very good, and above 3 are excellent. Higher Sharpe ratio indicates better risk-adjusted performance.">Sharpe ratio</span>, <span className="metric-tooltip" data-tooltip="Similar to Sharpe ratio but only considers downside volatility (negative returns). This metric focuses on downside risk rather than total volatility. Higher Sortino ratio indicates better protection against losses while maintaining upside potential.">Sortino ratio</span>, and <span className="metric-tooltip" data-tooltip="A measure of volatility that shows how much a fund's returns deviate from its average. Lower standard deviation means more predictable and stable returns. Higher values indicate greater volatility and risk.">standard deviation</span>. The top 15 qualifying
                        funds are then ranked using a composite scoring algorithm that weighs risk-adjusted returns, consistency, and downside protection,
                        ensuring you see only the most suitable funds that match your investment criteria and have proven track records over your chosen timeframe.
                    </p>
                </div>
            </section>

            {/* Results Section */}
            <section className="section">
                <h2 className="section-title">Fund Rankings</h2>
                <p className="subsection-title">Top 3 Mutual Funds</p>
                
                <div className="funds-list">
                    {!loading && rankedFunds.length > 0 ? (
                        rankedFunds.map(fund => (
                            <FundCard
                                key={fund.schemeCode}
                                fund={fund}
                                rank={fund.rank}
                                onRemove={removeFund}
                                onClick={() => handleFundClick(fund)}
                            />
                        ))
                    ) : (
                        !loading && (
                            <div className="empty-state">
                                <p className="empty-message">
                                    {loadingMessage || 'Select a category and click "Analyze" to see results.'}
                                </p>
                            </div>
                        )
                    )}
                    
                    {loading && (
                        <LoadingSpinner message={loadingMessage} />
                    )}
                </div>
            </section>

            {/* Recommendations */}
            {!loading && rankedFunds.length > 0 && (
                <RecommendationReport
                    rankedFunds={rankedFunds}
                    duration={duration}
                    onFundClick={handleFundClick}
                    planType={planType}
                />
            )}

            {/* Detailed Fund Analysis Modal */}
            {selectedFund && (
                <DetailedFundAnalysis 
                    fund={selectedFund} 
                    onClose={handleCloseFundDetails} 
                />
            )}
        </div>
    );
};

/**
 * Initialize the application
 */
const mountMfAnalyzer = () => {
    const rootEl = document.getElementById('mf-analyzer-root');
    if (!rootEl) return;
    
    const root = ReactDOM.createRoot(rootEl);
    root.render(<App />);
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountMfAnalyzer);
} else {
    mountMfAnalyzer();
}
