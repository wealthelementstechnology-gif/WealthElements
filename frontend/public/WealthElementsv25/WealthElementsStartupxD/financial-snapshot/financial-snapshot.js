(function () {
  const backBtn = document.getElementById('go-back');
  if (backBtn) backBtn.addEventListener('click', () => (window.location.href = '../index.html'));

  function getData() {
    try {
      const raw = localStorage.getItem('we_step1');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  const data = getData() || { basic: {}, income: [], expenses: [], insurances: [], investments: [], assets: [] };

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

  // Charts
  function pie(ctx, labels, data, colors) {
    // eslint-disable-next-line no-undef
    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors }],
      },
      options: {
        plugins: { legend: { labels: { color: '#e5e7eb', font: { size: 10 } } } },
      },
    });
  }

  // Create nested pie chart for detailed cash flow (excluding income)
  function createNestedPieChart(ctx, detailedData) {
    // Prepare data for nested pie chart
    const allLabels = [];
    const allData = [];
    const allColors = [];
    
    // Flatten the nested data structure with safety checks, excluding income
    Object.entries(detailedData).forEach(([category, categoryData]) => {
      // Skip income sources from the pie chart
      if (category === 'Income Sources') return;
      
      if (categoryData && categoryData.data && Array.isArray(categoryData.data) && categoryData.data.length > 0) {
        categoryData.data.forEach(item => {
          if (item && item.label && typeof item.value === 'number' && item.value > 0) {
            allLabels.push(`${category}: ${item.label}`);
            allData.push(item.value);
            allColors.push(categoryData.color || '#6b7280');
          }
        });
      }
    });

    // Safety check - if no data, show a simple message
    if (allData.length === 0) {
      console.log('No data available for cash flow chart');
      return;
    }

    // Bright, vibrant color palette with specific color mapping
    // These colors are bright, vibrant, and eye-catching
    const brightColors = {
      // Income - Bright greens
      income: ['#00FF7F', '#32CD32', '#7FFF00', '#ADFF2F'],
      // Expenses - Bright reds  
      expenses: ['#FF0000', '#FF3333', '#FF6666', '#FF9999'],
      // EMIs - Bright oranges
      emis: ['#FF8C00', '#FFA500', '#FFD700', '#FFFF00'],
      // Investments - Bright blues
      investments: ['#00BFFF', '#1E90FF', '#87CEEB', '#ADD8E6'],
      // Surplus - Different shade of bright greens
      surplus: ['#00FF00', '#00CC00', '#66FF66', '#99FF99']
    };

    // Apply bright colors based on category
    const finalColors = allData.map((_, index) => {
      const label = allLabels[index];
      if (label.includes('Income Sources')) {
        return brightColors.income[index % brightColors.income.length];
      } else if (label.includes('Monthly Expenses')) {
        return brightColors.expenses[index % brightColors.expenses.length];
      } else if (label.includes('EMIs')) {
        return brightColors.emis[index % brightColors.emis.length];
      } else if (label.includes('Investments')) {
        return brightColors.investments[index % brightColors.investments.length];
      } else if (label.includes('Surplus')) {
        return brightColors.surplus[index % brightColors.surplus.length];
      }
      // Fallback color - bright yellow
      return '#FFFF00';
    });

    // eslint-disable-next-line no-undef
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: allLabels,
        datasets: [{
          data: allData,
          backgroundColor: finalColors,
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        radius: '90%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffffff',
            borderWidth: 1,
            cornerRadius: 8,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 12
            },
            padding: 12,
            callbacks: {
              title: function(context) {
                return context[0].label || '';
              },
              label: function(context) {
                const value = context.parsed;
                const percentage = ((value / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                return `${fmt(value)} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
          animateRotate: true,
          animateScale: true
        },
        hover: {
          animationDuration: 300
        },
        elements: {
          arc: {
            borderWidth: 3,
            borderJoinStyle: 'round'
          }
        }
      }
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

  // Prepare detailed cash flow data for nested pie chart
  const detailedCashFlow = {
    // Income sources
    'Income Sources': {
      data: data.income.map(item => ({
        label: item.name || 'Unnamed Income',
        value: item.value || 0
      })),
      color: '#10b981'
    },
    // Detailed expenses
    'Monthly Expenses': {
      data: data.expenses.map(item => ({
        label: item.name || 'Unnamed Expense',
        value: (item.monthly || 0) + ((item.annual || 0) / 12)
      })).filter(item => item.value > 0),
      color: '#ef4444'
    },
    // EMIs
    'EMIs': {
      data: data.assets.filter(asset => asset.type && asset.type.toLowerCase() === 'liability' && asset.emi > 0).map(asset => ({
        label: asset.name || 'Unnamed EMI',
        value: asset.emi || 0
      })),
      color: '#f97316'
    },
    // Investments
    'Investments': {
      data: data.investments.map(item => ({
        label: item.name || 'Unnamed Investment',
        value: (() => {
          const amount = item.amount || 0;
          const mode = item.mode || 'Monthly';
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
        })()
      })).filter(item => item.value > 0),
      color: '#3b82f6'
    },
    // Surplus (if positive)
    'Surplus': {
      data: monthlySurplus > 0 ? [{
        label: 'Monthly Surplus',
        value: monthlySurplus
      }] : [],
      color: '#a3e635'
    }
  };

  const networthCtx = document.getElementById('chart-networth');
  const liabilitiesCtx = document.getElementById('chart-liabilities');
  const cashCtx = document.getElementById('chart-cashflow');

  // Create custom legend for Net Worth Breakdown
  function createNetWorthLegend(assetsData) {
    const legendContainer = document.getElementById('networth-legend');
    if (!legendContainer) return;
    
    // Clear existing content
    legendContainer.innerHTML = '';
    
    const networthColors = ['#00FF7F', '#32CD32', '#7FFF00', '#ADFF2F', '#00FF00', '#66FF66', '#99FF99'];
    const totalNetWorth = Object.values(assetsData).reduce((sum, value) => sum + value, 0);
    
    // Category header with total
    const categoryHeader = document.createElement('div');
    categoryHeader.style.cssText = `
      font-weight: bold;
      color: #00FF7F;
      margin-bottom: 8px;
      font-size: 14px;
      border-bottom: 1px solid #00FF7F;
      padding-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const categoryTitle = document.createElement('span');
    categoryTitle.textContent = 'Net Worth Assets';
    
    const categoryTotalSpan = document.createElement('span');
    categoryTotalSpan.style.cssText = `
      color: #fbbf24;
      font-weight: bold;
      font-size: 13px;
    `;
    categoryTotalSpan.textContent = `Total: ${fmt(totalNetWorth)}`;
    
    categoryHeader.appendChild(categoryTitle);
    categoryHeader.appendChild(categoryTotalSpan);
    legendContainer.appendChild(categoryHeader);
    
    // Individual assets
    Object.entries(assetsData).forEach(([assetName, value], index) => {
      if (value > 0) {
        const itemColor = networthColors[index % networthColors.length];
        const percentage = ((value / totalNetWorth) * 100).toFixed(1);
        
        const legendItem = document.createElement('div');
        legendItem.style.cssText = `
          display: flex;
          align-items: center;
          margin-bottom: 6px;
          font-size: 12px;
          color: #e5e7eb;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
        `;
        
        const colorBox = document.createElement('div');
        colorBox.style.cssText = `
          width: 12px;
          height: 12px;
          background-color: ${itemColor};
          margin-right: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        `;
        
        const label = document.createElement('span');
        label.style.cssText = `
          flex: 1;
          margin-right: 8px;
        `;
        label.textContent = assetName;
        
        const valueSpan = document.createElement('span');
        valueSpan.style.cssText = `
          color: #fbbf24;
          font-weight: bold;
          font-size: 11px;
        `;
        valueSpan.textContent = `${fmt(value)} (${percentage}%)`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendItem.appendChild(valueSpan);
        legendContainer.appendChild(legendItem);
      }
    });
  }

  // Create donut chart for Net Worth Breakdown
  if (networthCtx) {
    const networthData = Object.keys(assetsBreakdown);
    const networthValues = Object.values(assetsBreakdown);
    const networthColors = ['#00FF7F', '#32CD32', '#7FFF00', '#ADFF2F', '#00FF00', '#66FF66', '#99FF99'];
    
    // eslint-disable-next-line no-undef
    new Chart(networthCtx, {
      type: 'doughnut',
      data: {
        labels: networthData,
        datasets: [{
          data: networthValues,
          backgroundColor: networthColors,
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        radius: '90%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffffff',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                const value = context.parsed;
                const percentage = ((value / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                return [
                  `Amount: ${fmt(value)}`,
                  `Percentage: ${percentage}%`
                ];
              }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
          animateRotate: true,
          animateScale: true
        },
        hover: {
          animationDuration: 300
        },
        elements: {
          arc: {
            borderWidth: 3,
            borderJoinStyle: 'round'
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
    
    const liabilitiesColors = ['#FF0000', '#FF3333', '#FF6666', '#FF9999', '#FF8C00', '#FFA500'];
    const totalLiabilities = Object.values(liabilitiesData).reduce((sum, value) => sum + value, 0);
    
    // Category header with total
    const categoryHeader = document.createElement('div');
    categoryHeader.style.cssText = `
      font-weight: bold;
      color: #FF0000;
      margin-bottom: 8px;
      font-size: 14px;
      border-bottom: 1px solid #FF0000;
      padding-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const categoryTitle = document.createElement('span');
    categoryTitle.textContent = 'Liabilities & Debts';
    
    const categoryTotalSpan = document.createElement('span');
    categoryTotalSpan.style.cssText = `
      color: #fbbf24;
      font-weight: bold;
      font-size: 13px;
    `;
    categoryTotalSpan.textContent = `Total: ${fmt(totalLiabilities)}`;
    
    categoryHeader.appendChild(categoryTitle);
    categoryHeader.appendChild(categoryTotalSpan);
    legendContainer.appendChild(categoryHeader);
    
    // Individual liabilities
    Object.entries(liabilitiesData).forEach(([liabilityName, value], index) => {
      if (value > 0) {
        const itemColor = liabilitiesColors[index % liabilitiesColors.length];
        const percentage = ((value / totalLiabilities) * 100).toFixed(1);
        
        const legendItem = document.createElement('div');
        legendItem.style.cssText = `
          display: flex;
          align-items: center;
          margin-bottom: 6px;
          font-size: 12px;
          color: #e5e7eb;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
        `;
        
        const colorBox = document.createElement('div');
        colorBox.style.cssText = `
          width: 12px;
          height: 12px;
          background-color: ${itemColor};
          margin-right: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        `;
        
        const label = document.createElement('span');
        label.style.cssText = `
          flex: 1;
          margin-right: 8px;
        `;
        label.textContent = liabilityName;
        
        const valueSpan = document.createElement('span');
        valueSpan.style.cssText = `
          color: #fbbf24;
          font-weight: bold;
          font-size: 11px;
        `;
        valueSpan.textContent = `${fmt(value)} (${percentage}%)`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendItem.appendChild(valueSpan);
        legendContainer.appendChild(legendItem);
      }
    });
  }

  // Create donut chart for Liabilities Overview
  if (liabilitiesCtx) {
    const liabilitiesData = Object.keys(liabilitiesBreakdown);
    const liabilitiesValues = Object.values(liabilitiesBreakdown);
    const liabilitiesColors = ['#FF0000', '#FF3333', '#FF6666', '#FF9999', '#FF8C00', '#FFA500'];
    
    // eslint-disable-next-line no-undef
    new Chart(liabilitiesCtx, {
      type: 'doughnut',
      data: {
        labels: liabilitiesData,
        datasets: [{
          data: liabilitiesValues,
          backgroundColor: liabilitiesColors,
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        radius: '90%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffffff',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                const value = context.parsed;
                const percentage = ((value / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                return [
                  `Amount: ${fmt(value)}`,
                  `Percentage: ${percentage}%`
                ];
              }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
          animateRotate: true,
          animateScale: true
        },
        hover: {
          animationDuration: 300
        },
        elements: {
          arc: {
            borderWidth: 3,
            borderJoinStyle: 'round'
          }
        }
      }
    });
    
    createLiabilitiesLegend(liabilitiesBreakdown);
  }
  

  // Create custom legend for cash flow with matching colors
  function createCashFlowLegend(detailedData) {
    const legendContainer = document.getElementById('cash-flow-legend');
    if (!legendContainer) return;
    
    // Clear existing content
    legendContainer.innerHTML = '';
    
    // Use the same color logic as the pie chart
    const brightColors = {
      // Income - Bright greens
      income: ['#00FF7F', '#32CD32', '#7FFF00', '#ADFF2F'],
      // Expenses - Bright reds  
      expenses: ['#FF0000', '#FF3333', '#FF6666', '#FF9999'],
      // EMIs - Bright oranges
      emis: ['#FF8C00', '#FFA500', '#FFD700', '#FFFF00'],
      // Investments - Bright blues
      investments: ['#00BFFF', '#1E90FF', '#87CEEB', '#ADD8E6'],
      // Surplus - Different shade of bright greens
      surplus: ['#00FF00', '#00CC00', '#66FF66', '#99FF99']
    };
    
    // Create legend items grouped by category
    Object.entries(detailedData).forEach(([category, categoryData]) => {
      if (categoryData && categoryData.data && Array.isArray(categoryData.data) && categoryData.data.length > 0) {
        // Calculate total for this category
        const categoryTotal = categoryData.data.reduce((sum, item) => {
          return sum + (item && typeof item.value === 'number' && item.value > 0 ? item.value : 0);
        }, 0);
        
        // Get the primary color for this category
        let categoryColor = '#FFFF00'; // fallback
        if (category === 'Income Sources') {
          categoryColor = brightColors.income[0];
        } else if (category === 'Monthly Expenses') {
          categoryColor = brightColors.expenses[0];
        } else if (category === 'EMIs') {
          categoryColor = brightColors.emis[0];
        } else if (category === 'Investments') {
          categoryColor = brightColors.investments[0];
        } else if (category === 'Surplus') {
          categoryColor = brightColors.surplus[0];
        }
        
        // Category header with total
        const categoryHeader = document.createElement('div');
        categoryHeader.style.cssText = `
          font-weight: bold;
          color: ${categoryColor};
          margin-bottom: 8px;
          font-size: 14px;
          border-bottom: 1px solid ${categoryColor};
          padding-bottom: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        `;
        
        const categoryTitle = document.createElement('span');
        categoryTitle.textContent = category;
        
        const categoryTotalSpan = document.createElement('span');
        categoryTotalSpan.style.cssText = `
          color: #fbbf24;
          font-weight: bold;
          font-size: 13px;
        `;
        categoryTotalSpan.textContent = `Total: ${fmt(categoryTotal)}`;
        
        categoryHeader.appendChild(categoryTitle);
        categoryHeader.appendChild(categoryTotalSpan);
        legendContainer.appendChild(categoryHeader);
        
        // Category items with individual colors
        categoryData.data.forEach((item, index) => {
          if (item && item.label && typeof item.value === 'number' && item.value > 0) {
            // Get the specific color for this item
            let itemColor = '#FFFF00'; // fallback
            if (category === 'Income Sources') {
              itemColor = brightColors.income[index % brightColors.income.length];
            } else if (category === 'Monthly Expenses') {
              itemColor = brightColors.expenses[index % brightColors.expenses.length];
            } else if (category === 'EMIs') {
              itemColor = brightColors.emis[index % brightColors.emis.length];
            } else if (category === 'Investments') {
              itemColor = brightColors.investments[index % brightColors.investments.length];
            } else if (category === 'Surplus') {
              itemColor = brightColors.surplus[index % brightColors.surplus.length];
            }
            
            const legendItem = document.createElement('div');
            legendItem.style.cssText = `
              display: flex;
              align-items: center;
              margin-bottom: 6px;
              font-size: 12px;
              color: #e5e7eb;
              padding: 4px 8px;
              border-radius: 4px;
              background: rgba(255, 255, 255, 0.05);
            `;
            
            const colorBox = document.createElement('div');
            colorBox.style.cssText = `
              width: 12px;
              height: 12px;
              background-color: ${itemColor};
              margin-right: 10px;
              border-radius: 50%;
              flex-shrink: 0;
            `;
            
            const label = document.createElement('span');
            label.style.cssText = `
              flex: 1;
              margin-right: 8px;
            `;
            label.textContent = item.label;
            
            const value = document.createElement('span');
            value.style.cssText = `
              color: #fbbf24;
              font-weight: bold;
              font-size: 11px;
            `;
            value.textContent = fmt(item.value);
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legendItem.appendChild(value);
            legendContainer.appendChild(legendItem);
          }
        });
        
        // Add spacing between categories
        const spacer = document.createElement('div');
        spacer.style.cssText = 'height: 15px;';
        legendContainer.appendChild(spacer);
      }
    });
  }

  // Create nested pie chart for cash flow
  if (cashCtx) {
    createNestedPieChart(cashCtx, detailedCashFlow);
    createCashFlowLegend(detailedCashFlow);
  }

  const toStep3 = document.getElementById('to-step3');
  if (toStep3) toStep3.addEventListener('click', () => (window.location.href = '../8-events-calculator/step3.html'));
})();
