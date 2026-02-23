(function () {
  const backBtn = document.getElementById('go-back');
  if (backBtn) backBtn.addEventListener('click', () => (window.location.href = '8-events.html'));

  function getData() {
    try {
      const raw = localStorage.getItem('we_step1');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  const data = getData() || { basic: {}, income: [], expenses: [], insurances: [], investments: [], assets: [] };

  function sum(arr, sel) { return arr.reduce((acc, it) => acc + (sel(it) || 0), 0); }

  // Helper function to convert insurance premium to monthly
  function convertInsuranceToMonthly(premium, mode) {
    if (!premium || premium <= 0) return 0;
    switch ((mode || 'Monthly').toLowerCase()) {
      case 'monthly':
      case 'month':
      case 'mon':
        return premium;
      case 'quarterly':
      case 'quarter':
      case 'qtr':
        return premium / 3;
      case 'half yearly':
      case 'half-yearly':
        return premium / 6;
      case 'yearly':
      case 'year':
      case 'yr':
        return premium / 12;
      default:
        return premium;
    }
  }

  // Aggregations
  const totalIncomeMonthly = sum(data.income, (x) => x.value);
  const totalExpensesMonthly = sum(data.expenses, (x) => x.monthly) + sum(data.expenses, (x) => (x.annual || 0) / 12);
  const totalEMIsMonthly = sum(data.assets, (x) => (x.type && x.type.toLowerCase() === 'liability') ? (x.emi || 0) : 0);
  const totalInsurancesMonthly = sum(data.insurances, (x) => convertInsuranceToMonthly(x.premium, x.mode));
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
      case 'half yearly':
      case 'half-yearly':
        return amount / 6;
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
  const monthlySurplus = totalIncomeMonthly - totalExpensesMonthly - totalEMIsMonthly - totalInsurancesMonthly - totalInvestmentsMonthly;

  const fmt = (n) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n))}`;

  const networthEl = document.getElementById('card-networth');
  const surplusEl = document.getElementById('card-surplus');
  const emisEl = document.getElementById('card-emis');
  if (networthEl) networthEl.textContent = fmt(netWorth);
  if (surplusEl) surplusEl.textContent = fmt(monthlySurplus);
  if (emisEl) emisEl.textContent = fmt(totalEMIsMonthly);

  // --- Investment Rule ---
  const investPct = document.getElementById('investPct');
  const investPctValue = document.getElementById('investPctValue');
  const investAmount = document.getElementById('investAmount');
  const investRuleNote = document.getElementById('investRuleNote');
  const stepUp = null;

  function getInvestRule(){
    try { const raw = localStorage.getItem('we_invest_rule'); return raw ? JSON.parse(raw) : null; } catch(e){ return null; }
  }
  function saveInvestRule(pct){
    try { localStorage.setItem('we_invest_rule', JSON.stringify({ pct })); } catch(e) {}
  }

  function calculateSipBudget(income, expenses) {
    // Always use percentage rule - let user decide investment amount
    if (income <= 0) return 0;
    return null; // null = use percentage rule
  }

  function updateInvestmentRule() {
    const income = totalIncomeMonthly;
    const expenses = totalExpensesMonthly + totalEMIsMonthly;
    const disable = income <= 0;
    if (investPct) investPct.disabled = disable;

    const pct = Math.max(0, Math.min(100, parseFloat((investPct && investPct.value) || '30')));
    if (investPctValue) investPctValue.textContent = `${pct}%`;

    const sipBudgetOverride = calculateSipBudget(income, expenses);
    let amount;
    if (sipBudgetOverride !== null) {
      amount = sipBudgetOverride;
      if (investRuleNote) investRuleNote.textContent = 'Using remaining income as budget.';
    } else {
      amount = (income * pct) / 100;
      if (investRuleNote) investRuleNote.textContent = 'Income × Percentage ÷ 100';
    }
    if (investAmount) investAmount.textContent = fmt(amount);

    saveInvestRule(pct);
  }

  // Load previously saved rule, if any
  const savedRule = getInvestRule();
  if (savedRule) {
    if (investPct && typeof savedRule.pct !== 'undefined') investPct.value = String(savedRule.pct);
  }

  if (investPct) investPct.addEventListener('input', updateInvestmentRule);
  updateInvestmentRule();


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

  const networthCtx = document.getElementById('chart-networth');
  const liabilitiesCtx = document.getElementById('chart-liabilities');

  // Create custom legend for Net Worth Breakdown
  function createNetWorthLegend(assetsData) {
    const legendContainer = document.getElementById('networth-legend');
    if (!legendContainer) return;

    // Clear existing content
    legendContainer.innerHTML = '';

    const networthColors = ['#6b11cc', '#94a3b8', '#f97316'];
    const totalNetWorth = Object.values(assetsData).reduce((sum, value) => sum + value, 0);

    if (totalNetWorth === 0) {
      legendContainer.innerHTML = '<p class="text-sm text-slate-subtle">No assets to display</p>';
      return;
    }

    // Individual assets
    Object.entries(assetsData).forEach(([assetName, value], index) => {
      if (value > 0) {
        const itemColor = networthColors[index % networthColors.length];
        const percentage = ((value / totalNetWorth) * 100).toFixed(0);

        const legendItem = document.createElement('div');
        legendItem.className = 'flex items-center justify-between w-full';

        legendItem.innerHTML = `
          <div class="flex items-center gap-2">
            <div class="size-3 rounded-full" style="background-color: ${itemColor};"></div>
            <span class="text-sm text-slate-text">${assetName}</span>
          </div>
          <span class="text-sm font-semibold text-slate-heading">${percentage}%</span>
        `;

        legendContainer.appendChild(legendItem);
      }
    });
  }

  // Create donut chart for Net Worth Breakdown
  if (networthCtx) {
    const networthData = Object.keys(assetsBreakdown);
    const networthValues = Object.values(assetsBreakdown);
    const networthColors = ['#6b11cc', '#94a3b8', '#f97316'];

    // eslint-disable-next-line no-undef
    new Chart(networthCtx, {
      type: 'doughnut',
      data: {
        labels: networthData,
        datasets: [{
          data: networthValues,
          backgroundColor: networthColors,
          borderColor: '#f1f5f9',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 12,
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${fmt(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    createNetWorthLegend(assetsBreakdown);
  }
  // Create custom legend for Liabilities Overview
  function createLiabilitiesLegend(liabilitiesData) {
    const legendContainer = document.getElementById('liabilities-legend');
    if (!legendContainer) return;

    // Clear existing content
    legendContainer.innerHTML = '';

    const liabilitiesColors = ['#ef4444', '#fca5a5'];
    const totalLiabilities = Object.values(liabilitiesData).reduce((sum, value) => sum + value, 0);

    if (totalLiabilities === 0) {
      legendContainer.innerHTML = '<p class="text-sm text-slate-subtle">No liabilities to display</p>';
      return;
    }

    // Individual liabilities
    Object.entries(liabilitiesData).forEach(([liabilityName, value], index) => {
      if (value > 0) {
        const itemColor = liabilitiesColors[index % liabilitiesColors.length];

        const legendItem = document.createElement('div');
        legendItem.className = 'flex items-center justify-between w-full';

        // Format value with L suffix
        const formattedValue = value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : fmt(value);

        legendItem.innerHTML = `
          <div class="flex items-center gap-2">
            <div class="size-3 rounded-full" style="background-color: ${itemColor};"></div>
            <span class="text-sm text-slate-text">${liabilityName}</span>
          </div>
          <span class="text-sm font-semibold text-slate-heading">${formattedValue}</span>
        `;

        legendContainer.appendChild(legendItem);
      }
    });
  }

  // Create donut chart for Liabilities Overview
  if (liabilitiesCtx) {
    const liabilitiesData = Object.keys(liabilitiesBreakdown);
    const liabilitiesValues = Object.values(liabilitiesBreakdown);
    const liabilitiesColors = ['#ef4444', '#fca5a5'];

    // eslint-disable-next-line no-undef
    new Chart(liabilitiesCtx, {
      type: 'doughnut',
      data: {
        labels: liabilitiesData,
        datasets: [{
          data: liabilitiesValues,
          backgroundColor: liabilitiesColors,
          borderColor: '#f1f5f9',
          borderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 12,
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${fmt(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    createLiabilitiesLegend(liabilitiesBreakdown);
  }
  

  // Create custom cash flow bars and legend with stacked segments
  function createCashFlowVisualization() {
    const barsContainer = document.getElementById('cash-flow-bars');
    const labelsContainer = document.getElementById('cash-flow-labels');
    const legendContainer = document.getElementById('cash-flow-legend');

    if (!barsContainer || !labelsContainer || !legendContainer) return;

    // Clear existing content
    barsContainer.innerHTML = '';
    labelsContainer.innerHTML = '';
    legendContainer.innerHTML = '';

    // Group income sources
    const incomeSources = data.income.map(inc => ({
      name: inc.name || 'Unnamed Income',
      value: inc.value || 0
    })).filter(inc => inc.value > 0);

    // Group expenses by category
    const expensesByCategory = [];
    data.expenses.forEach(expense => {
      const monthlyAmount = (expense.monthly || 0) + ((expense.annual || 0) / 12);
      if (monthlyAmount > 0) {
        expensesByCategory.push({
          name: expense.name || 'Unnamed Expense',
          value: monthlyAmount
        });
      }
    });

    // Define color shades
    const greenShades = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
    const redShades = ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'];

    // Calculate max value for scaling
    const maxValue = Math.max(totalIncomeMonthly, totalExpensesMonthly, Math.max(0, monthlySurplus), 1);

    // Helper function to create stacked bar
    function createStackedBar(items, colors, totalValue, label) {
      const barContainer = document.createElement('div');
      barContainer.className = 'flex flex-col items-center gap-2 flex-1 h-full justify-end';

      const heightPercent = (totalValue / maxValue) * 100;
      const heightFinal = Math.max(heightPercent, totalValue > 0 ? 10 : 0);

      barContainer.innerHTML = `
        <span class="text-xs font-bold min-h-[20px] text-center" style="color: ${colors[0]};">${totalValue > 0 ? fmt(totalValue) : ''}</span>
      `;

      const stackedBar = document.createElement('div');
      stackedBar.className = 'w-full max-w-[60px] rounded-t-lg relative overflow-hidden';
      stackedBar.style.height = `${heightFinal}%`;

      // Create segments from bottom to top
      let currentBottom = 0;
      items.forEach((item, index) => {
        const segmentPercent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
        const segment = document.createElement('div');
        segment.className = 'absolute left-0 right-0 transition-all hover:opacity-80';
        segment.style.bottom = `${currentBottom}%`;
        segment.style.height = `${segmentPercent}%`;
        segment.style.backgroundColor = colors[index % colors.length];
        segment.title = `${item.name}: ${fmt(item.value)}`;
        stackedBar.appendChild(segment);
        currentBottom += segmentPercent;
      });

      barContainer.appendChild(stackedBar);
      return barContainer;
    }

    // Create Income bar (stacked with different income sources)
    const incomeBar = createStackedBar(incomeSources, greenShades, totalIncomeMonthly, 'Income');
    barsContainer.appendChild(incomeBar);

    // Create Expenses bar (stacked with different expense categories)
    const expensesBar = createStackedBar(expensesByCategory, redShades, totalExpensesMonthly, 'Expenses');
    barsContainer.appendChild(expensesBar);

    // Create Surplus bar (single color)
    if (monthlySurplus > 0) {
      const surplusBar = createStackedBar([{ name: 'Surplus', value: monthlySurplus }], ['#6b11cc'], monthlySurplus, 'Surplus');
      barsContainer.appendChild(surplusBar);
    }

    // Create labels
    labelsContainer.innerHTML = `
      <span class="flex-1 text-center text-emerald-600 font-semibold">Income</span>
      <span class="flex-1 text-center text-red-600 font-semibold">Expenses</span>
      <span class="flex-1 text-center text-primary font-bold">Surplus</span>
    `;

    // Create detailed breakdown legend
    legendContainer.innerHTML = '<h4 class="text-xs font-bold text-slate-heading mb-3 uppercase tracking-wide">Detailed Breakdown</h4>';

    // Income section
    const incomeSection = document.createElement('div');
    incomeSection.className = 'mb-3';
    incomeSection.innerHTML = `
      <div class="flex justify-between items-center text-sm font-semibold pb-2 mb-2 border-b-2 border-emerald-500">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-emerald-600 text-[18px]">add_circle</span>
          <span class="text-emerald-700">Income Sources</span>
        </div>
        <span class="text-emerald-700">${fmt(totalIncomeMonthly)}</span>
      </div>
    `;

    // Add each income source
    incomeSources.forEach((source, index) => {
      const percentage = totalIncomeMonthly > 0 ? ((source.value / totalIncomeMonthly) * 100).toFixed(1) : 0;
      const incomeItem = document.createElement('div');
      incomeItem.className = 'flex justify-between items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded';
      incomeItem.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" style="background-color: ${greenShades[index % greenShades.length]};"></div>
          <span class="text-slate-text">${source.name}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-slate-subtle text-[10px]">${percentage}%</span>
          <span class="text-slate-heading font-semibold">${fmt(source.value)}</span>
        </div>
      `;
      incomeSection.appendChild(incomeItem);
    });

    legendContainer.appendChild(incomeSection);

    // Expenses section
    const expensesSection = document.createElement('div');
    expensesSection.className = 'mb-3';
    expensesSection.innerHTML = `
      <div class="flex justify-between items-center text-sm font-semibold pb-2 mb-2 border-b-2 border-red-500">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-red-500 text-[18px]">remove_circle</span>
          <span class="text-red-700">Expenses Breakdown</span>
        </div>
        <span class="text-red-700">${fmt(totalExpensesMonthly)}</span>
      </div>
    `;

    // Add each expense category
    expensesByCategory.forEach((expense, index) => {
      const percentage = totalExpensesMonthly > 0 ? ((expense.value / totalExpensesMonthly) * 100).toFixed(1) : 0;
      const expenseItem = document.createElement('div');
      expenseItem.className = 'flex justify-between items-center text-xs py-1.5 px-2 hover:bg-slate-50 rounded';
      expenseItem.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" style="background-color: ${redShades[index % redShades.length]};"></div>
          <span class="text-slate-text">${expense.name}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-slate-subtle text-[10px]">${percentage}%</span>
          <span class="text-slate-heading font-semibold">${fmt(expense.value)}</span>
        </div>
      `;
      expensesSection.appendChild(expenseItem);
    });

    legendContainer.appendChild(expensesSection);

    // Surplus section
    const surplusSection = document.createElement('div');
    surplusSection.className = 'pt-2 border-t border-slate-200';
    surplusSection.innerHTML = `
      <div class="flex justify-between items-center text-sm font-bold">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[18px]">savings</span>
          <span class="text-primary">Monthly Surplus</span>
        </div>
        <span class="text-primary">${fmt(Math.max(0, monthlySurplus))}</span>
      </div>
    `;
    legendContainer.appendChild(surplusSection);
  }

  // Create cash flow visualization (bars instead of chart)
  createCashFlowVisualization();

  const toStep3 = document.getElementById('to-step3');
  if (toStep3) toStep3.addEventListener('click', () => (window.location.href = 'step3.html'));
})();


