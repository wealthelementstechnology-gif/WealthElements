(function(){
  const back = document.getElementById('back-step4');
  if (back) back.addEventListener('click', ()=> window.location.href = 'step4.html');

  function getStep1(){ try{ const raw = localStorage.getItem('we_step1'); return raw ? JSON.parse(raw) : null; } catch(e){ return null; } }
  function getStep4Goals(){
    // Always prioritize fresh goals from Step 4
    try{
      const raw = localStorage.getItem('we_step4_goals');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('Step 5 - Found fresh goals from Step 4:', parsed);
          return parsed;
        }
      }
    } catch(e){ 
      console.log('Step 5 - Error loading we_step4_goals:', e);
    }
    
    // Fallback to plan goals if no fresh goals found
    try{
      const plan = localStorage.getItem('we_plan_goals');
      if (plan) {
        const parsed = JSON.parse(plan);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('Step 5 - Using fallback plan goals:', parsed);
          return parsed;
        }
      }
    }catch(e){
      console.log('Step 5 - Error loading we_plan_goals:', e);
    }
    
    console.log('Step 5 - No goals found in localStorage');
    return [];
  }

  const data = getStep1() || { income:[], expenses:[], assets:[], investments:[] };
  const goals = getStep4Goals() || [];
  console.log('Step 5 - Loaded data:', data);
  console.log('Step 5 - Loaded goals:', goals);
  
  // Check if we have any data at all
  const hasData = data && (data.income?.length > 0 || data.expenses?.length > 0 || data.assets?.length > 0 || data.investments?.length > 0);
  console.log('Step 5 - Has data:', hasData);
  
  if (!hasData) {
    console.log('Step 5 - No valid data found, available localStorage keys:', Object.keys(localStorage).filter(k => k.startsWith('we_')));
    console.log('Step 5 - Raw localStorage data:');
    Object.keys(localStorage).filter(k => k.startsWith('we_')).forEach(key => {
      try {
        const value = localStorage.getItem(key);
        console.log(`  ${key}:`, value);
      } catch(e) {
        console.log(`  ${key}: [error reading]`);
      }
    });
  }
  function getInvestRule(){ try{ const raw = localStorage.getItem('we_invest_rule'); return raw ? JSON.parse(raw) : null; }catch(e){ return null; } }
  function setAutoStepUp(valPct){ 
    try{ 
      const r=getInvestRule()||{}; 
      r.autoStepUp = valPct; 
      localStorage.setItem('we_invest_rule', JSON.stringify(r)); 
      console.log('Step 5 - Set autoStepUp to:', valPct, 'Stored rule:', r);
    }catch(e){
      console.error('Step 5 - Error setting autoStepUp:', e);
    }
  }
  function preRetAnnualReturn(years, isEmergencyFund = false){
    // Emergency fund always gets conservative 4.5% return regardless of tenure
    if (isEmergencyFund) return 0.045;

    if (years > 18) return 0.15;
    if (years >= 15) return 0.145;
    if (years >= 10) return 0.12;
    if (years >= 7) return 0.12; // Changed from 0.11 to 0.12 for 7-9 years
    if (years >= 5) return 0.095;
    if (years >= 3) return 0.095; // Changed from 0.085 to 0.095 for 3+ years
    return 0.045;
  }
  function sipFor(futureValue, yearsLeft, stepUpPct, isEmergencyFund = false){
    const annR = preRetAnnualReturn(yearsLeft, isEmergencyFund);
    const i = annR/12; const n = Math.max(1, yearsLeft*12);
    const stepUp = Math.min(0.10, Math.max(0, parseFloat(stepUpPct||'8')/100));
    console.log('Step 5 - sipFor: stepUpPct:', stepUpPct, 'parsed stepUp:', stepUp, 'yearsLeft:', yearsLeft, 'isEmergencyFund:', isEmergencyFund);
    function fvFromSip(initialSip){ 
      if (n <= 0) return 0;
      
      let totalFV = 0;
      const totalYears = Math.ceil(n / 12);
      const monthlyRate = i;
      
      for (let year = 0; year < totalYears; year++) {
        const monthsInYear = Math.min(12, n - year * 12);
        // SIP amount for this year (with step-up applied)
        const sipForThisYear = initialSip * Math.pow(1 + stepUp, year);
        
        // Calculate FV for each month in this year
        for (let month = 0; month < monthsInYear; month++) {
          const monthsRemaining = n - (year * 12 + month);
          const futureValue = sipForThisYear * Math.pow(1 + monthlyRate, monthsRemaining);
          totalFV += futureValue;
        }
      } 
      return totalFV; 
    }
    let lo=0, hi=futureValue/n*20+10000; for(let k=0;k<100;k++){ const mid=(lo+hi)/2; const got=fvFromSip(mid); if (Math.abs(got - futureValue) < 1000) return mid; if (got>=futureValue) hi=mid; else lo=mid; }
    return hi;
  }

  function sum(arr, sel){ return (arr||[]).reduce((a,x)=> a + (sel(x)||0), 0); }
  function fmt(n){ return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n))}`; }

  // From Step 2 logic
  const totalIncomeMonthly = sum(data.income || [], x=> x.value);
  const totalExpensesMonthly = sum(data.expenses || [], x=> x.monthly) + sum(data.expenses || [], x=> (x.annual||0)/12);
  const totalEMIsMonthly = sum(data.assets || [], x=> (x.type && x.type.toLowerCase()==='liability') ? (x.emi||0) : 0);
  const totalInvestmentsMonthly = sum(data.investments || [], x=> {
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

  console.log('Step 5 - Data loaded:', {
    totalIncomeMonthly,
    totalExpensesMonthly,
    totalEMIsMonthly,
    totalInvestmentsMonthly,
    data: data
  });

  function calculateSipBudget(income, expenses){
    if (income<=0) return 0;
    return null; // always use percentage rule - let user decide investment amount
  }

  // Retirement SIP from Step 4 big card text if available (parse number), else 0
  function parseMoneyText(txt){ if (!txt) return 0; const digits = txt.replace(/[^0-9.]/g,''); return parseFloat(digits||'')||0; }

  // Try reconstruct retirement SIP by re-running minimal calc if needed (fallback)
  function estimateRetirementSipFallback(){
    return 0; // keep simple; Step 4 displays/used, user just came from there
  }

  // Normalize goal shape from Step 4 (supports numeric or text-based legacy)
  const goalsBreakdownBody = document.getElementById('goalsBreakdownBody');
  function goalSipNumber(g){
    if (typeof g.sip === 'number' && isFinite(g.sip)) return g.sip;
    if (g.sipText) return parseMoneyText(g.sipText);
    return 0;
  }
  function getGoalsSipTotal(){ let total=0; goals.forEach(g=> total += goalSipNumber(g)); return total; }

  function renderGoalsBreakdown(workingGoals, retirementSip){
    if (!goalsBreakdownBody) return;

    goalsBreakdownBody.innerHTML = '';

    // Add retirement goal first
    const retDiv = document.createElement('div');
    retDiv.className = 'goal-item priority-high';
    retDiv.innerHTML = `
      <div class="goal-header">
        <span class="goal-name">Retirement Corpus</span>
        <span class="priority-badge high">High Priority</span>
      </div>
      <div class="goal-details">
        <span class="goal-sip">${fmt(retirementSip)}/month</span>
      </div>
    `;
    goalsBreakdownBody.appendChild(retDiv);

    // Add other goals with their priorities
    workingGoals.forEach(g => {
      const originalGoal = goals.find(og => og.name === g.name);
      const priority = originalGoal && originalGoal.priority ? originalGoal.priority : 'Medium';

      const goalDiv = document.createElement('div');
      goalDiv.className = `goal-item priority-${priority.toLowerCase()}`;
      goalDiv.innerHTML = `
        <div class="goal-header">
          <span class="goal-name">${g.name}</span>
          <span class="priority-badge ${priority.toLowerCase()}">${priority} Priority</span>
        </div>
        <div class="goal-details">
          <span class="goal-year">Target: ${g.targetYear}</span>
          <span class="goal-sip">${fmt(g.sip)}/month</span>
        </div>
      `;
      goalsBreakdownBody.appendChild(goalDiv);
    });
  }

  function main(){
    const budgetEl = document.getElementById('sipBudget');
    const budgetNoteEl = document.getElementById('budgetNote');
    const totalReqEl = document.getElementById('totalSipRequired');
    const utilText = document.getElementById('utilText');
    const utilFill = document.getElementById('utilFill');
    const utilStatus = document.getElementById('utilStatus');
    const optSummary = document.getElementById('optSummary');
    
    console.log('Step 5 - DOM elements found:', {
      budgetEl: !!budgetEl,
      budgetNoteEl: !!budgetNoteEl,
      totalReqEl: !!totalReqEl,
      utilText: !!utilText,
      utilFill: !!utilFill,
      utilStatus: !!utilStatus,
      optSummary: !!optSummary
    });
    
    if (!budgetEl || !totalReqEl) {
      console.error('Step 5 - Critical DOM elements not found!');
      return;
    }

    const income = totalIncomeMonthly;
    const expensesAll = totalExpensesMonthly + totalEMIsMonthly;
    const override = calculateSipBudget(income, expensesAll);
    let budget;
    
    console.log('Step 5 - Budget calculation:', {
      income,
      expensesAll,
      override,
      totalExpensesMonthly,
      totalEMIsMonthly,
      totalInvestmentsMonthly
    });
    
    if (override !== null) {
      budget = override; 
      if (budgetNoteEl) budgetNoteEl.textContent = 'Using remaining income as budget.';
      console.log('Step 5 - Using override budget:', budget);
    } else {
      const rule = getInvestRule();
      console.log('Step 5 - Investment rule loaded:', rule);
      const pct = rule && typeof rule.pct !== 'undefined' ? Math.max(0, Math.min(100, parseFloat(rule.pct))) : 30;
      budget = income * (pct/100);
      if (budgetNoteEl) budgetNoteEl.textContent = `Using ${pct}% of monthly income as SIP budget (from Step 2).`;
      console.log('Step 5 - Using percentage budget:', budget, 'pct:', pct, 'rule:', rule);
      
      // Debug: If budget is still 0, check if we have a custom budget amount
      if (budget === 0 && rule && rule.budget) {
        budget = parseFloat(rule.budget) || 0;
        if (budget > 0) {
          if (budgetNoteEl) budgetNoteEl.textContent = `Using custom SIP budget from Step 2: ₹${budget.toLocaleString()}`;
          console.log('Step 5 - Using custom budget from rule:', budget);
        }
      }
      
      // If budget is 0 and income is 0, there might be an issue with data loading
      if (budget === 0 && income === 0) {
        console.log('Step 5 - Both budget and income are 0, checking data loading...');
        console.log('Step 5 - Investment rule:', rule);
        console.log('Step 5 - Income data:', data.income);
      }
    }
    
    // Ensure budget is a valid number
    if (isNaN(budget) || budget === null || budget === undefined) {
      console.log('Step 5 - Invalid budget calculated, setting to 0');
      budget = 0;
    }
    
    // If budget is 0 and we have no data, show a default value for debugging
    if (budget === 0 && !hasData) {
      console.log('Step 5 - No data available, using default budget for debugging');
      budget = 50000; // Default 50k for debugging
      if (budgetNoteEl) budgetNoteEl.textContent = 'No data available - using default budget for debugging';
    }
    
    console.log('Step 5 - Final budget:', budget);

    const retStore = (function(){ try{ return JSON.parse(localStorage.getItem('we_step4_retirement')||'null'); }catch(e){ return null; } })();
    const investRule = getInvestRule() || {};
    
    // Recalculate retirement SIP with the current step-up rate instead of using the stored value
    let retirementSip = 0;
    if (retStore && retStore.corpus && retStore.nToRet) {
      const yearsToRet = Math.max(1, Math.round(retStore.nToRet));
      const corpus = retStore.corpus;
      const stepUpRate = Math.min(0.10, Math.max(0, parseFloat(investRule.autoStepUp || 8) / 100));
      
      console.log(`Step 5 - Recalculating retirement SIP: corpus=${corpus}, years=${yearsToRet}, stepUp=${(stepUpRate*100).toFixed(1)}%`);
      
      // Use the same calculation logic as other goals
      retirementSip = sipFor(corpus, yearsToRet, (stepUpRate * 100).toString());
      
      console.log(`Step 5 - Recalculated retirement SIP: ${retirementSip.toFixed(0)}`);
    } else {
      retirementSip = retStore && retStore.sip ? retStore.sip : 0;
      console.log(`Step 5 - Using stored retirement SIP: ${retirementSip.toFixed(0)}`);
    }

    // Build working goal list with numeric values
    const nowYear = new Date().getFullYear();
    const baseGoals = (goals||[]).map(g=>{
      const yearsLeft = Number.isFinite(g.yearsLeft) ? g.yearsLeft : Math.max(0, (g.targetYear||nowYear) - nowYear);
      const fv = (typeof g.fv === 'number' && isFinite(g.fv)) ? g.fv : ((g.currentCost||0) * Math.pow(1+0.06, yearsLeft));
      const name = g.name || 'Goal';
      const priority = g.priority || 'Medium';
      const isEmergencyFund = name.toLowerCase().includes('emergency');
      const sip = sipFor(fv, yearsLeft, '8', isEmergencyFund); // Use default 8% step up for base goals
      const protectedGoal = /retire|marriage|wedding|emergency|education|school|college|visa|medical|health/i.test(name);

      // For emergency fund, keep the original target year (2-3 years) but SIP continues until retirement
      let finalYearsLeft = yearsLeft;
      let finalTargetYear = g.targetYear || nowYear;
      if (isEmergencyFund) {
        // Keep the original target year for goal achievement (2-3 years)
        // The SIP will continue until retirement in the simulation
        console.log(`Step 5 - Emergency fund goal to be achieved in ${finalYearsLeft} years, SIP continues until retirement`);
      }

      return {
        name,
        targetYear: finalTargetYear,
        yearsLeft: finalYearsLeft,
        fv,
        sip,
        priority,
        protected: protectedGoal,
        origFv: fv,
        origYearsLeft: finalYearsLeft,
        reduced: false,
        extended: 0,
        isEmergencyFund: isEmergencyFund
      };
    });

    function sumSip(list){ return list.reduce((a,x)=> a + (x.sip||0), 0); }
    let working = baseGoals.map(x=> ({...x}));
    let totalRequired = retirementSip + sumSip(working);
    
    // If total required is 0 and we have no data, show a default value for debugging
    if (totalRequired === 0 && !hasData) {
      console.log('Step 5 - No data available, using default total required for debugging');
      totalRequired = 25000; // Default 25k for debugging
    }
    
    console.log('Step 5 - Total required calculation:', {
      retirementSip,
      sumSip: sumSip(working),
      totalRequired,
      working: working.length
    });

    console.log('Step 5 - Updating UI elements:', {
      budget,
      totalRequired,
      budgetEl: !!budgetEl,
      totalReqEl: !!totalReqEl
    });
    
    if (budgetEl) {
      budgetEl.textContent = fmt(budget);
      console.log('Step 5 - Budget element updated:', budgetEl.textContent);
      
      // Force update to test if the element is working
      if (budget === 0) {
        budgetEl.textContent = '₹0 (Debug: Element working)';
        console.log('Step 5 - Budget is 0, showing debug message');
      }
    }
    if (totalReqEl) {
      totalReqEl.textContent = fmt(totalRequired);
      console.log('Step 5 - Total required element updated:', totalReqEl.textContent);
      
      // Force update to test if the element is working
      if (totalRequired === 0) {
        totalReqEl.textContent = '₹0 (Debug: Element working)';
        console.log('Step 5 - Total required is 0, showing debug message');
      }
    }

    // DO NOT auto-optimize on initial load - keep original values from Step 4
    const changes = [];

    // Use the stored step-up rate or default to 8%
    let bestAutoStep = investRule.autoStepUp || 8;
    console.log('Step 5 - Using step-up rate:', bestAutoStep);

    // Keep working goals as-is (no optimization yet)
    // User must click "Optimize" button to apply optimization
    
    // Use retirement SIP as calculated earlier (with current step-up rate)
    let finalRetirementSip = retirementSip;

    // Calculate total required with original values (no optimization)
    totalRequired = finalRetirementSip + sumSip(working);

    // Render breakdown including retirement
    renderGoalsBreakdown(working, finalRetirementSip);

    // Utilization
    const util = budget>0 ? (totalRequired / budget) : 0;
    const utilPct = Math.round(util * 100);
    if (utilText) utilText.textContent = `${utilPct}%`;
    if (utilFill) {
      utilFill.style.width = `${Math.min(100, utilPct)}%`;
      if (utilPct >= 90 && utilPct <= 95) {
        utilFill.style.background = '#22c55e'; // Green for optimal
      } else if (utilPct > 95 && utilPct <= 100) {
        utilFill.style.background = '#3b82f6'; // Blue for excellent
      } else if (utilPct > 100) {
        utilFill.style.background = '#ef4444'; // Red for exceeded
      } else if (utilPct >= 80) {
        utilFill.style.background = '#10b981'; // Green for good
      } else {
        utilFill.style.background = '#f59e0b'; // Amber for low utilization
      }
    }
    if (utilStatus) {
      if (utilPct >= 90 && utilPct <= 95) {
        utilStatus.textContent = 'Optimal! Budget utilization maximized to achieve your goals efficiently.';
      } else if (utilPct > 95 && utilPct <= 100) {
        utilStatus.textContent = 'Excellent! Budget utilization optimized for maximum goal achievement.';
      } else if (utilPct > 100) {
        utilStatus.textContent = 'Budget exceeded! Plan optimized for maximum goal achievement within constraints.';
      } else if (utilPct >= 80) {
        utilStatus.textContent = 'Good! Budget utilization is efficient and goals are achievable.';
      } else {
        utilStatus.textContent = 'Budget utilization is low. Consider increasing goal amounts or adding new goals.';
      }
    }
    // Persist optimization details for Step 6 explanation
    try {
      const details = working
        .filter(g => (g.reduced || g.extended>0 || g.increased))
        .map(g => ({ 
          name: g.name, 
          reducedByPct: g.reduced ? 25 : 0, 
          yearsExtended: g.extended,
          increased: g.increased || false,
          finalUtilization: utilPct
        }));
      localStorage.setItem('we_step5_opt_details', JSON.stringify(details));
    } catch(e) {}
    // removed optimization summary UI

    const toStep6 = document.getElementById('to-step6');
    if (toStep6) toStep6.addEventListener('click', ()=> {
      // Persist optimized goals (retirement handled separately) - preserve priority
      const saveList = working.map(g=> ({ name:g.name, currentCost:0, targetYear:g.targetYear, yearsLeft:g.yearsLeft, fv:g.fv, sip:g.sip, priority:g.priority || 'Medium' }));
      console.log('Step 5 - Navigating to Step 6, saving goals:', saveList);
      try { localStorage.setItem('we_plan_goals', JSON.stringify(saveList)); } catch(e) {}

      // Update retirement data with the optimized SIP
      if (retStore && retStore.corpus && retStore.nToRet) {
        const updatedRetirement = {
          ...retStore,
          sip: finalRetirementSip
        };
        console.log('Step 5 - Updating retirement SIP in storage:', finalRetirementSip);
        try { localStorage.setItem('we_step4_retirement', JSON.stringify(updatedRetirement)); } catch(e) {}
      }

      window.location.href = 'step6.html';
    });
  }

  main();
})();


