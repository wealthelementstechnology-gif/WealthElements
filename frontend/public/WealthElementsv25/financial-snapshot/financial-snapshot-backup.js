(function () {
  const backBtn = document.getElementById('go-back');
  const editDataBtn = document.getElementById('edit-data');

  // Navigation handlers
  if (backBtn) backBtn.addEventListener('click', () => (window.location.href = '../index.html'));
  if (editDataBtn) editDataBtn.addEventListener('click', () => (window.location.href = '../8-events-calculator/8-events.html'));

  function getData() {
    try {
      const raw = localStorage.getItem('we_step1');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  const data = getData() || { basic: {}, income: [], expenses: [], insurances: [], investments: [], assets: [] };

  // Check if data exists, if not show message
  if (!data || (!data.income || data.income.length === 0) && (!data.expenses || data.expenses.length === 0)) {
    const container = document.querySelector('.container');
    if (container) {
      container.innerHTML = `
        <header class="page-header">
          <button class="btn back" onclick="window.location.href='../index.html'">← Back to Main</button>
          <div>
            <h1>Financial Snapshot</h1>
            <p class="subtitle">Get a quick overview of your financial position.</p>
          </div>
        </header>
        <div class="info-banner">
          <p><strong>No financial data found!</strong> Please complete Step 1 of the 8 Events Calculator first to see your financial snapshot.</p>
          <div class="actions" style="margin-top: 16px;">
            <a href="../8-events-calculator/8-events.html" class="btn">Go to 8 Events Calculator</a>
          </div>
        </div>
      `;
    }
    return;
  }

  function sum(arr, sel) { return arr.reduce((acc, it) => acc + (sel(it) || 0), 0); }

  // Aggregations
  const totalIncomeMonthly = sum(data.income, (x) => x.value);
  const totalExpensesMonthly = sum(data.expenses, (x) => x.monthly) + sum(data.expenses, (x) => (x.annual || 0) / 12);
  const totalEMIsMonthly = sum(data.assets, (x) => (x.type && x.type.toLowerCase() === 'liability') ? (x.emi || 0) : 0);
  const totalInvestmentsMonthly = sum(data.investments, (x) => {
    const amount = x.amount || 0;
    const mode = x.mode || 'Monthly';
    // Convert to monthly equivalent
    switch (mode.toLowerCase()) {
      case 'monthly':
      case 'month':
      case 'mon':
        return amount;
      case 'quarterly':
      case 'quarter':
      case 'qtr':
        return amount / 3;
      case 'yearly':
      case 'year':
      case 'yr':
        return amount / 12;
      default:
        return amount;
    }
  });
  const totalAssets = sum(data.assets, (x) => (x.type && x.type.toLowerCase() === 'asset') ? (x.value || 0) : 0);
  const totalLiabilities = sum(data.assets, (x) => (x.type && x.type.toLowerCase() === 'liability') ? (x.value || 0) : 0);
  const netWorth = totalAssets - totalLiabilities;
  const monthlySurplus = totalIncomeMonthly - totalExpensesMonthly - totalEMIsMonthly - totalInvestmentsMonthly;

  const fmt = (n) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n))}`;

  const networthEl = document.getElementById('card-networth');
  const surplusEl = document.getElementById('card-surplus');
  const emisEl = document.getElementById('card-emis');
  if (networthEl) networthEl.textContent = fmt(netWorth);
  if (surplusEl) surplusEl.textContent = fmt(monthlySurplus);
  if (emisEl) emisEl.textContent = fmt(totalEMIsMonthly);


  // Charts
  function pie(ctx, labels, data, colors) {
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    
    // eslint-disable-next-line no-undef
    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{ 
          data, 
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: isDarkMode ? '#374151' : '#ffffff',
          hoverBorderWidth: 3,
          hoverBorderColor: isDarkMode ? '#4b5563' : '#f3f4f6'
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            display: true,
            position: 'bottom',
            labels: { 
              usePointStyle: true,
              pointStyle: 'rectRounded',
              padding: 12,
              boxWidth: 16,
              boxHeight: 16,
              color: isDarkMode ? '#d1d5db' : '#374151', 
              font: { 
                size: 14,
                weight: '600'
              },
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const dataset = data.datasets[0];
                    const value = dataset.data[i];
                    const total = dataset.data.reduce((sum, val) => sum + val, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return {
                      text: `${label} (${percentage}%)`,
                      fillStyle: dataset.backgroundColor[i],
                      strokeStyle: dataset.borderColor,
                      lineWidth: dataset.borderWidth,
                      pointStyle: 'rectRounded',
                      hidden: false,
                      index: i
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
                const value = context.parsed;
                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(value))} (${percentage}%)`;
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
      },
    });
  }

  const assetsBreakdown = data.assets.reduce((acc, a) => {
    const key = (a.type && a.type.toLowerCase() === 'asset') ? (a.name || 'Unnamed') : null;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + (a.value || 0);
    return acc;
  }, {});

  const liabilitiesBreakdown = data.assets.reduce((acc, a) => {
    const key = (a.type && a.type.toLowerCase() === 'liability') ? (a.name || 'Unnamed') : null;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + (a.value || 0);
    return acc;
  }, {});

  // Monthly Cash Flow breakdown - showing how income is allocated
  const cashFlow = {
    'Expenses': totalExpensesMonthly,
    'EMIs': totalEMIsMonthly,
    'Investments': totalInvestmentsMonthly,
    'Surplus': monthlySurplus > 0 ? monthlySurplus : 0,
  };

  // If there's a deficit (negative surplus), show it as a separate category
  if (monthlySurplus < 0) {
    cashFlow['Deficit'] = Math.abs(monthlySurplus);
    delete cashFlow['Surplus'];
  }

  // Debug: Log the original cashFlow object
  console.log('Original cashFlow object:', cashFlow);
  console.log('Total Income Monthly:', totalIncomeMonthly);
  console.log('Total Expenses Monthly:', totalExpensesMonthly);
  console.log('Total EMIs Monthly:', totalEMIsMonthly);
  console.log('Total Investments Monthly:', totalInvestmentsMonthly);
  console.log('Monthly Surplus:', monthlySurplus);

  const networthCtx = document.getElementById('chart-networth');
  const liabilitiesCtx = document.getElementById('chart-liabilities');
  const cashCtx = document.getElementById('chart-cashflow');

  // Only create charts if there's data to display
  if (networthCtx && Object.keys(assetsBreakdown).length > 0) {
    pie(networthCtx, Object.keys(assetsBreakdown), Object.values(assetsBreakdown), ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f472b6']);
  } else if (networthCtx) {
    networthCtx.parentElement.innerHTML = '<div class="panel-title">Net Worth Breakdown</div><p style="text-align: center; color: var(--muted); padding: 40px;">No assets data available</p>';
  }

  if (liabilitiesCtx && Object.keys(liabilitiesBreakdown).length > 0) {
    pie(liabilitiesCtx, Object.keys(liabilitiesBreakdown), Object.values(liabilitiesBreakdown), ['#ef4444','#f97316','#f59e0b','#fb7185','#f43f5e','#eab308']);
  } else if (liabilitiesCtx) {
    liabilitiesCtx.parentElement.innerHTML = '<div class="panel-title">Liabilities Overview</div><p style="text-align: center; color: var(--muted); padding: 40px;">No liabilities data available</p>';
  }

  if (cashCtx && totalIncomeMonthly > 0) {
    // Filter out zero values for cleaner chart display
    const filteredCashFlow = Object.fromEntries(
      Object.entries(cashFlow).filter(([key, value]) => value > 0)
    );
    
    
    if (Object.keys(filteredCashFlow).length > 0) {
      // Debug: Log what we're actually passing to the chart
      console.log('Creating chart with labels:', Object.keys(filteredCashFlow));
      console.log('Creating chart with values:', Object.values(filteredCashFlow));
      pie(cashCtx, Object.keys(filteredCashFlow), Object.values(filteredCashFlow), ['#ef4444','#fbbf24','#60a5fa','#22c55e','#f97316']);
    } else {
      cashCtx.parentElement.innerHTML = '<div class="panel-title">Monthly Income Allocation</div><p style="text-align: center; color: var(--muted); padding: 40px;">No cash flow data available</p>';
    }
  } else if (cashCtx) {
    cashCtx.parentElement.innerHTML = '<div class="panel-title">Monthly Income Allocation</div><p style="text-align: center; color: var(--muted); padding: 40px;">No income data available</p>';
  }

  // Store chart references for theme updates
  window.financialCharts = {
    networth: networthCtx ? Chart.getChart(networthCtx) : null,
    liabilities: liabilitiesCtx ? Chart.getChart(liabilitiesCtx) : null,
    cashflow: cashCtx ? Chart.getChart(cashCtx) : null
  };

  // Listen for theme changes and update charts
  document.addEventListener('themeChanged', function(event) {
    setTimeout(() => {
      // Recreate charts with new theme
      if (window.financialCharts.networth && Object.keys(assetsBreakdown).length > 0) {
        window.financialCharts.networth.destroy();
        window.financialCharts.networth = pie(networthCtx, Object.keys(assetsBreakdown), Object.values(assetsBreakdown), ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f472b6']);
      }
      
      if (window.financialCharts.liabilities && Object.keys(liabilitiesBreakdown).length > 0) {
        window.financialCharts.liabilities.destroy();
        window.financialCharts.liabilities = pie(liabilitiesCtx, Object.keys(liabilitiesBreakdown), Object.values(liabilitiesBreakdown), ['#ef4444','#f97316','#f59e0b','#fb7185','#f43f5e','#eab308']);
      }
      
      if (window.financialCharts.cashflow && totalIncomeMonthly > 0) {
        window.financialCharts.cashflow.destroy();
        // Filter out zero values for cleaner chart display
        const filteredCashFlow = Object.fromEntries(
          Object.entries(cashFlow).filter(([key, value]) => value > 0)
        );
        
        if (Object.keys(filteredCashFlow).length > 0) {
          window.financialCharts.cashflow = pie(cashCtx, Object.keys(filteredCashFlow), Object.values(filteredCashFlow), ['#ef4444','#fbbf24','#60a5fa','#22c55e','#f97316']);
        }
      }
    }, 100);
  });
})();