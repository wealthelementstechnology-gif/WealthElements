/**
 * ========================================
 * MUTUAL FUND ANALYZER - REACT COMPONENTS
 * ========================================
 */

// Import React hooks
const { useState, useEffect } = React;

/**
 * Detailed Fund Analysis Modal Component
 */
const DetailedFundAnalysis = ({ fund, onClose }) => {
    const [navData, setNavData] = useState(null);
    const [benchmarkData, setBenchmarkData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartInstance, setChartInstance] = useState(null);

    useEffect(() => {
        const fetchDetailedData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`);
                if (!response.ok) throw new Error('Failed to fetch fund data');
                const result = await response.json();
                const navHistory = result.data || [];
                
                if (navHistory.length < 2) {
                    throw new Error('Insufficient NAV data');
                }

                // Filter data for last 3 years
                const filteredNavData = filterNavDataByYears(navHistory, 3);
                setNavData(filteredNavData);

                // Get benchmark data
                const benchmarkName = getBenchmarkName(fund.schemeName);
                const benchmarkDataArray = generateBenchmarkData(filteredNavData, benchmarkName);
                setBenchmarkData({ data: benchmarkDataArray, name: benchmarkName });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDetailedData();
    }, [fund.schemeCode]);

    useEffect(() => {
        if (!navData || !benchmarkData || navData.length === 0) return;
        
        const benchmarkDataArray = Array.isArray(benchmarkData) ? benchmarkData : benchmarkData.data;
        const benchmarkName = benchmarkData.name || 'Benchmark';
        
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        const ctx = document.getElementById('fundChart');
        if (!ctx) return;

        // Prepare chart data
        const fundCumulativeReturns = [];
        const benchmarkCumulativeReturns = [];
        const labels = [];
        const startNav = parseFloat(navData[0].nav);
        const startBenchmark = benchmarkDataArray[0].value;

        navData.forEach((entry, index) => {
            const [day, month, year] = entry.date.split('-');
            labels.push(`${day}/${month}/${year}`);
            const currentNav = parseFloat(entry.nav);
            const fundReturn = ((currentNav - startNav) / startNav) * 100;
            fundCumulativeReturns.push(fundReturn);
            
            if (index < benchmarkDataArray.length) {
                const benchmarkReturn = ((benchmarkDataArray[index].value - startBenchmark) / startBenchmark) * 100;
                benchmarkCumulativeReturns.push(benchmarkReturn);
            }
        });

        // Create chart
        const newChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: `${fund.schemeName} (Fund)`,
                        data: fundCumulativeReturns,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: 'rgb(34, 197, 94)',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 2
                    },
                    {
                        label: benchmarkName,
                        data: benchmarkCumulativeReturns,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: 'rgb(239, 68, 68)',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Fund Performance vs ${benchmarkName} (3 Years)`,
                        font: { size: 18, weight: 'bold' },
                        color: '#1f2937'
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 14, weight: '500' }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cumulative Return (%)',
                            font: { size: 14, weight: '500' }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.1)', drawBorder: false },
                        ticks: { font: { size: 12 } }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            font: { size: 14, weight: '500' }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.1)', drawBorder: false },
                        ticks: { font: { size: 12 }, maxTicksLimit: 10 }
                    }
                },
                interaction: { intersect: false, mode: 'index' },
                elements: { point: { hoverRadius: 8 } }
            }
        });
        
        setChartInstance(newChartInstance);
        
        return () => {
            if (newChartInstance) {
                newChartInstance.destroy();
            }
        };
    }, [navData, benchmarkData, fund.schemeName]);

    const metrics = calculateDetailedMetrics(navData, benchmarkData);

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="card modal-content">
                    <div className="loading-container">
                        Loading detailed fund analysis...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="modal-overlay">
                <div className="card modal-content">
                    <h3 className="error-title">Error Loading Fund Data</h3>
                    <p>{error}</p>
                    <button className="btn" onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="card modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Detailed Analysis: {fund.schemeName}</h2>
                    <button onClick={onClose} className="modal-close">&times;</button>
                </div>
                
                <div className="notice-box">
                    <p className="notice-text">
                        <strong>Note:</strong> Benchmark data is simulated based on market correlation patterns. 
                        For accurate comparisons, use real market data.
                    </p>
                </div>
                
                <div className="chart-container">
                    <canvas id="fundChart"></canvas>
                </div>
                
                <div className="detailed-metrics">
                    <div className="detailed-metric-card">
                        <div className="detailed-metric-label metric-return">CAGR (3Y)</div>
                        <div className="detailed-metric-value">
                            {metrics ? `${metrics.cagr.toFixed(2)}%` : 'N/A'}
                        </div>
                    </div>
                    <div className="detailed-metric-card">
                        <div className="detailed-metric-label metric-sharpe">Sharpe Ratio</div>
                        <div className="detailed-metric-value">
                            {metrics ? metrics.sharpeRatio.toFixed(2) : 'N/A'}
                        </div>
                    </div>
                    <div className="detailed-metric-card">
                        <div className="detailed-metric-label metric-sortino">Sortino Ratio</div>
                        <div className="detailed-metric-value">
                            {metrics ? metrics.sortinoRatio.toFixed(2) : 'N/A'}
                        </div>
                    </div>
                    <div className="detailed-metric-card">
                        <div className="detailed-metric-label metric-risk">Beta (3Y)</div>
                        <div className="detailed-metric-value">
                            {metrics ? metrics.beta.toFixed(2) : 'N/A'}
                        </div>
                    </div>
                    <div className="detailed-metric-card">
                        <div className="detailed-metric-label metric-return">Alpha</div>
                        <div className="detailed-metric-value">
                            {metrics ? `${metrics.alpha.toFixed(2)}%` : 'N/A'}
                        </div>
                    </div>
                    <div className="detailed-metric-card">
                        <div className="detailed-metric-label metric-risk">Std Dev</div>
                        <div className="detailed-metric-value">
                            {metrics ? `${metrics.stdDev.toFixed(2)}%` : 'N/A'}
                        </div>
                    </div>
                    <div className="detailed-metric-card">
                        <div className="detailed-metric-label metric-risk">Max Drawdown</div>
                        <div className="detailed-metric-value">
                            {metrics ? `${metrics.maxDrawdown.toFixed(2)}%` : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Recommendation Report Component
 */
const RecommendationReport = ({ rankedFunds, duration, onFundClick, planType }) => {
    if (!rankedFunds || rankedFunds.length === 0) return null;

    const top3Funds = rankedFunds.slice(0, 3);
    const planTypeLabel = planType === 'direct' ? 'Direct Plans' : 'Regular Plans';

    // Helper function to generate plain language explanation
    const getExplanation = (fund, rank) => {
        const explanations = [];

        // Rolling returns explanation
        const return3y = fund.rollingReturn3yr || 0;
        const return5y = fund.rollingReturn5yr || 0;
        if (return3y > 15) {
            explanations.push(`Excellent consistent returns of ${formatPercentage(return3y)} over 3 years`);
        } else if (return3y > 10) {
            explanations.push(`Strong consistent returns of ${formatPercentage(return3y)} over 3 years`);
        } else {
            explanations.push(`Returns ${formatPercentage(return3y)} over 3 years`);
        }

        // Sharpe ratio explanation
        const sharpe = fund.sharpe3yr || 0;
        if (sharpe > 2) {
            explanations.push(`very good risk-adjusted performance (Sharpe: ${formatRatio(sharpe)})`);
        } else if (sharpe > 1) {
            explanations.push(`good risk-adjusted performance (Sharpe: ${formatRatio(sharpe)})`);
        } else {
            explanations.push(`moderate risk-adjusted performance (Sharpe: ${formatRatio(sharpe)})`);
        }

        // Volatility explanation
        const stdDev = fund.sd3yr || 0;
        if (stdDev < 10) {
            explanations.push(`low volatility (${formatPercentage(stdDev)}) means steadier growth`);
        } else if (stdDev < 15) {
            explanations.push(`moderate volatility (${formatPercentage(stdDev)})`);
        } else {
            explanations.push(`higher volatility (${formatPercentage(stdDev)}) means more ups and downs`);
        }

        return explanations;
    };

    return (
        <div className="card recommendation-section">
            <h2 className="recommendation-title">Analysis & Recommendations ({planTypeLabel})</h2>
            {top3Funds.length > 0 ? (
                <div className="recommendation-grid">
                    {top3Funds.map((fund, index) => {
                        const explanations = getExplanation(fund, index + 1);
                        return (
                            <div
                                key={fund.schemeCode}
                                className="recommendation-card"
                                onClick={() => onFundClick && onFundClick(fund)}
                            >
                                <div className="recommendation-rank">
                                    Rank {index + 1}: {fund.schemeName}
                                </div>
                                <div className="recommendation-explanation">
                                    <strong>Why this fund stands out:</strong>
                                    <ul className="recommendation-points">
                                        {explanations.map((explanation, idx) => (
                                            <li key={idx}>{explanation}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p>Not enough data to provide a top 3 recommendation for this category and duration.</p>
            )}
        </div>
    );
};

/**
 * Fund Card Component
 */
const FundCard = ({ fund, rank, onRemove, onClick }) => {
    // Determine rank class
    const getRankClass = (rank, total) => {
        if (rank === 1) return 'rank-1';
        if (rank === 2 && total > 2) return 'rank-2';
        if (rank === total && total > 2) return 'rank-last';
        if (rank === total - 1 && total > 3) return 'rank-second-last';
        return '';
    };

    return (
        <div
            className={`fund-card ${getRankClass(rank, 10)}`}
            onClick={onClick}
        >
            <div className="fund-header">
                <div className="fund-title">
                    <span className="fund-rank">{rank}.</span>
                    <h3 className="fund-name">{fund.schemeName}</h3>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(fund.schemeCode);
                    }}
                    className="remove-btn"
                >
                    &times;
                </button>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-label metric-return" title="Average annualized return over rolling 3-year periods. Measures consistent performance over time by calculating returns for overlapping 3-year windows.">
                        Rolling Return (3Y)
                    </div>
                    <div className="metric-value">
                        {isNaN(fund.rollingReturn3yr) ? 'N/A' : formatPercentage(fund.rollingReturn3yr)}
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label metric-return" title="Average annualized return over rolling 5-year periods. Measures long-term consistent performance by calculating returns for overlapping 5-year windows.">
                        Rolling Return (5Y)
                    </div>
                    <div className="metric-value">
                        {isNaN(fund.rollingReturn5yr) ? 'N/A' : formatPercentage(fund.rollingReturn5yr)}
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label metric-sharpe" title="Risk-adjusted return metric. Measures excess return per unit of total risk. Higher is better. Values >1 are good, >2 are very good, >3 are excellent.">
                        Sharpe Ratio (3Y)
                    </div>
                    <div className="metric-value">
                        {isNaN(fund.sharpe3yr) ? 'N/A' : formatRatio(fund.sharpe3yr)}
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label metric-sharpe" title="Risk-adjusted return metric over 5 years. Measures excess return per unit of total risk. Higher is better. Values >1 are good, >2 are very good, >3 are excellent.">
                        Sharpe Ratio (5Y)
                    </div>
                    <div className="metric-value">
                        {isNaN(fund.sharpe5yr) ? 'N/A' : formatRatio(fund.sharpe5yr)}
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label metric-sortino" title="Risk-adjusted return that penalizes only downside volatility. Similar to Sharpe but focuses on harmful volatility. Higher is better as it indicates better downside protection.">
                        Sortino Ratio (3Y)
                    </div>
                    <div className="metric-value">
                        {isNaN(fund.sortino3yr) ? 'N/A' : formatRatio(fund.sortino3yr)}
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label metric-sortino" title="Risk-adjusted return over 5 years that penalizes only downside volatility. Similar to Sharpe but focuses on harmful volatility. Higher is better.">
                        Sortino Ratio (5Y)
                    </div>
                    <div className="metric-value">
                        {isNaN(fund.sortino5yr) ? 'N/A' : formatRatio(fund.sortino5yr)}
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label metric-risk" title="Standard Deviation - measures volatility and risk. Shows how much returns deviate from average. Lower is better for risk-averse investors. Higher values indicate more unpredictable returns.">
                        Std Dev (3Y)
                    </div>
                    <div className="metric-value">
                        {isNaN(fund.sd3yr) ? 'N/A' : formatPercentage(fund.sd3yr)}
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label metric-risk" title="Standard Deviation over 5 years - measures volatility and risk. Shows how much returns deviate from average. Lower is better for risk-averse investors.">
                        Std Dev (5Y)
                    </div>
                    <div className="metric-value">
                        {isNaN(fund.sd5yr) ? 'N/A' : formatPercentage(fund.sd5yr)}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Loading Component
 */
const LoadingSpinner = ({ message }) => {
    return (
        <div className="loading-container">
            <div className="loading-message">{message}</div>
        </div>
    );
};

/**
 * Error Component
 */
const ErrorMessage = ({ message, onRetry }) => {
    return (
        <div className="error-container">
            <h3 className="error-title">Error</h3>
            <p>{message}</p>
            {onRetry && (
                <button className="btn" onClick={onRetry}>Retry</button>
            )}
        </div>
    );
};

// Export components for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DetailedFundAnalysis,
        RecommendationReport,
        FundCard,
        LoadingSpinner,
        ErrorMessage
    };
}
