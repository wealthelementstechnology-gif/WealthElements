(function(){
  const back = document.getElementById('back-step5');
  if (back) back.addEventListener('click', ()=> window.location.href = 'step5.html');

  function getGoals(){
    try{ const raw = localStorage.getItem('we_plan_goals'); return raw ? JSON.parse(raw) : []; }catch(e){ return []; }
  }
  function getRetirement(){ try{ const raw = localStorage.getItem('we_step4_retirement'); return raw ? JSON.parse(raw) : null; } catch(e){ return null; } }
  function getInvestRule(){ 
    try{ 
      const raw = localStorage.getItem('we_invest_rule'); 
      return raw ? JSON.parse(raw) : { autoStepUp: 0 }; 
    } catch(e){ 
      return { autoStepUp: 0 }; 
    } 
  }
  
  function getInvestmentBudget(){
    try {
      const data = JSON.parse(localStorage.getItem('we_step1') || '{}');
      const investRule = getInvestRule();
      
      // Calculate monthly income
      const monthlyIncome = (data.income || []).reduce((sum, item) => sum + (item.value || 0), 0);
      
      // Calculate monthly expenses
      const monthlyExpenses = (data.expenses || []).reduce((sum, item) => {
        return sum + (item.monthly || 0) + ((item.annual || 0) / 12);
      }, 0);
      
      // Calculate existing investments and EMIs
      const existingInvestments = (data.investments || []).reduce((sum, item) => {
        const amount = item.amount || 0;
        const mode = item.mode || 'Monthly';
        // Convert to monthly equivalent
        switch (mode.toLowerCase()) {
          case 'monthly':
          case 'month':
          case 'mon':
            return sum + amount;
          case 'quarterly':
          case 'quarter':
          case 'qtr':
            return sum + (amount / 3);
          case 'yearly':
          case 'year':
          case 'yr':
            return sum + (amount / 12);
          default:
            return sum + amount;
        }
      }, 0);
      const existingEMIs = (data.assets || []).reduce((sum, item) => {
        return sum + ((item.type && item.type.toLowerCase() === 'liability') ? (item.emi || 0) : 0);
      }, 0);
      
      const totalExpenses = monthlyExpenses + existingEMIs;
      
      // Always use percentage rule - let user decide investment amount
      // Removed 70% expense override condition
      
      // Otherwise use percentage rule
      const pct = investRule.pct || 30;
      return (monthlyIncome * pct) / 100;
    } catch(e) {
      console.error('Error calculating investment budget:', e);
      return 0;
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

  function fmt(n){ return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n))}`; }

  // Function to store original values for reset functionality
  function storeOriginalValues() {
    window.originalValues = {};
    Array.from(tbody.querySelectorAll('tr')).forEach((tr, index) => {
      const name = (tr.querySelector('td') && tr.querySelector('td').textContent) || `Goal ${index + 1}`;
      const fvInput = tr.querySelector('input[data-fv]');
      const lumpInput = tr.querySelector('input[data-lump]');
      const yearInput = tr.querySelector('input[data-year]');
      const sipCell = tr.querySelector('[data-sip]');
      
      const fv = parseFloat((fvInput && fvInput.value) || '0');
      const lump = parseFloat((lumpInput && lumpInput.value) || '0');
      const year = parseInt((yearInput && yearInput.value) || '0', 10);
      const sipText = sipCell ? sipCell.textContent : '0';
      const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
      
      window.originalValues[name] = {
        fv: fv,
        lumpsum: lump,
        targetYear: year,
        sip: sip
      };
    });
    console.log('Original values stored:', window.originalValues);
  }

  // Function to restore original values
  function restoreOriginalValues() {
    if (!window.originalValues || Object.keys(window.originalValues).length === 0) {
      console.log('No original values to restore');
      return;
    }
    
    console.log('Restoring original values:', window.originalValues);
    
    Array.from(tbody.querySelectorAll('tr')).forEach((tr, index) => {
      const name = (tr.querySelector('td') && tr.querySelector('td').textContent) || `Goal ${index + 1}`;
      const originalData = window.originalValues[name];
      
      if (originalData) {
        const fvInput = tr.querySelector('input[data-fv]');
        const lumpInput = tr.querySelector('input[data-lump]');
        const yearInput = tr.querySelector('input[data-year]');
        const sipCell = tr.querySelector('[data-sip]');
        
        // Restore original values
        if (fvInput) fvInput.value = originalData.fv;
        if (lumpInput) lumpInput.value = originalData.lumpsum;
        if (yearInput) yearInput.value = originalData.targetYear;
        if (sipCell) sipCell.textContent = fmt(originalData.sip);
        
        console.log(`Restored ${name}: FV=${originalData.fv}, Lumpsum=${originalData.lumpsum}, Year=${originalData.targetYear}, SIP=${originalData.sip}`);
      }
    });
    
    // Recalculate totals after restoring values
    recalc();
  }

  // Function to update optimize button state based on budget comparison
  function updateOptimizeButtonState(totalSip) {
    const optimizeBtn = document.getElementById('optimizeBtn');
    if (!optimizeBtn) return;
    
    const budget = getInvestmentBudget();
    const budgetBuffer = 200; // Small buffer to account for rounding differences
    
    // If total SIP is within budget (with small buffer), disable optimize button
    if (totalSip <= (budget + budgetBuffer)) {
      optimizeBtn.disabled = true;
      optimizeBtn.innerHTML = '<span class="btn-icon">✅</span> PLAN FITS BUDGET';
      optimizeBtn.title = 'Your current plan fits within your investment budget. No optimization needed.';
      
      // Update explanation text
      const optExplain = document.getElementById('optExplain');
      if (optExplain) {
        optExplain.innerHTML = `
          <div style="color: #10b981; font-weight: bold;">
            ✅ Your plan fits within your budget!
          </div>
          <div style="margin-top: 8px; color: #6b7280;">
            Total Required SIP: ${fmt(totalSip)}<br>
            Your Investment Budget: ${fmt(budget)}<br>
            Remaining Budget: ${fmt(Math.max(0, budget - totalSip))}
          </div>
        `;
      }
    } else {
      // If total SIP exceeds budget, enable optimize button (if not at max attempts)
      if (window.optimizationCount < window.maxOptimizations) {
        optimizeBtn.disabled = false;
        const remaining = window.maxOptimizations - window.optimizationCount;
        optimizeBtn.innerHTML = `<span class="btn-icon">🎯</span> OPTIMIZE (${remaining} left)`;
        optimizeBtn.title = 'Your plan exceeds your budget. Click to optimize.';
        
        // Update explanation text
        const optExplain = document.getElementById('optExplain');
        if (optExplain) {
          optExplain.innerHTML = `
            <div style="color: #f59e0b; font-weight: bold;">
              ⚠️ Your plan exceeds your budget
            </div>
            <div style="margin-top: 8px; color: #6b7280;">
              Total Required SIP: ${fmt(totalSip)}<br>
              Your Investment Budget: ${fmt(budget)}<br>
              Shortfall: ${fmt(totalSip - budget)}
            </div>
          `;
        }
      }
    }
  }

  // Helper function to identify goal types and their constraints
  // NOTE: If ML integration is loaded, it will use cached ML predictions via window.getGoalConstraintsML
  function getGoalConstraints(goalName) {
    // Try to use ML-based constraints if available
    if (typeof window.getGoalConstraintsML === 'function') {
      return window.getGoalConstraintsML(goalName);
    }

    // Fallback to rule-based constraints (original hardcoded logic)
    const name = goalName.toLowerCase();
    if (name.includes('emergency')) {
      return { type: 'emergency', maxTenureExtension: 1, maxAmountReduction: 0.3, source: 'rule_based' };
    } else if (name.includes('retire')) {
      return { type: 'retirement', maxTenureExtension: 1, maxAmountReduction: 0.2, source: 'rule_based' };
    } else if (name.includes('marriage') || name.includes('wedding')) {
      return { type: 'marriage', maxTenureExtension: 1, maxAmountReduction: 0.25, source: 'rule_based' };
    } else if (name.includes('education') || name.includes('child') || name.includes('children')) {
      return { type: 'education', maxTenureExtension: 1, maxAmountReduction: 0.25, source: 'rule_based' };
    } else {
      return { type: 'other', maxTenureExtension: 5, maxAmountReduction: 0.5, source: 'rule_based' };
    }
  }

  const tbody = document.getElementById('sipRows');
  const totalEl = document.getElementById('sipTotal');
  const goals = getGoals();
  const retirement = getRetirement();
  const optExplain = document.getElementById('optExplain');
  const budgetInfo = document.getElementById('budgetInfo');
  const budgetAmount = document.getElementById('budgetAmount');
  const investRule = getInvestRule();
  
  // Display budget information
  const budget = getInvestmentBudget();
  if (budget > 0 && budgetInfo && budgetAmount) {
    budgetAmount.textContent = fmt(budget);
    budgetInfo.style.display = 'block';
  }

  function rowSipFor(futureValue, yearsLeft, lumpsum, customStepUp = null, isEmergencyFund = false){
    const annR = preRetAnnualReturn(yearsLeft, isEmergencyFund);
    const i = annR/12; const n = Math.max(1, yearsLeft*12);
    // Use custom step-up if provided, otherwise use the investment rule
    const stepUp = customStepUp !== null ? customStepUp : Math.min(0.10, Math.max(0, parseFloat(investRule.autoStepUp||'0')/100));
    const fvLump = Math.max(0, (lumpsum||0)) * Math.pow(1 + i, n);
    const need = Math.max(0, futureValue - fvLump);
    
    // If lumpsum investment is sufficient to meet the target, return 0 SIP
    if (need <= 0) {
      return 0;
    }
    
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
    let lo=0, hi=(need>0 ? need/n*20+10000 : 0); for(let k=0;k<100;k++){ const mid=(lo+hi)/2; const got=fvFromSip(mid); if (Math.abs(got - need) < 1000) return mid; if (got>=need) hi=mid; else lo=mid; }
    return hi;
  }

  function recalc(){
    let total=0;
    Array.from(tbody.querySelectorAll('tr')).forEach(tr=>{
      // Don't recalculate SIP amounts - just read the existing displayed values
      const sipCell = tr.querySelector('[data-sip]');
      const sipText = sipCell ? sipCell.textContent : '0';
      const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
      
      total += sip;
    });
    if (totalEl) totalEl.textContent = fmt(total);
    
    // Check if optimization is needed and update button state
    updateOptimizeButtonState(total);
  }
  
  function recalcSipForRow(tr){
    // This function recalculates SIP for a specific row when user manually changes inputs
    const fvInput = tr.querySelector('input[data-fv]');
    const lumpInput = tr.querySelector('input[data-lump]');
    const yearInput = tr.querySelector('input[data-year]');
    const nameCell = tr.querySelector('td');
    const nowYear = new Date().getFullYear();
    let targetYear = parseInt((yearInput && yearInput.value)||'0',10)||nowYear;
    let yLeft = Math.max(0, targetYear - nowYear);

    // Special handling for emergency fund
    const name = (nameCell && nameCell.textContent || '').toLowerCase();
    const isEmergencyFund = name.includes('emergency');
    if (isEmergencyFund) {
      console.log(`Step 6 - Emergency fund manual recalculation: goal in ${yLeft} years, SIP continues until retirement`);
    }

    const fv = parseFloat((fvInput && fvInput.value)||'')||0;
    const lump = parseFloat((lumpInput && lumpInput.value)||'')||0;
    const sip = rowSipFor(fv, yLeft, lump, null, isEmergencyFund);

    // Update the Expected Return based on new tenure
    const annR = preRetAnnualReturn(yLeft, isEmergencyFund);
    const expectedReturnCell = tr.querySelectorAll('td')[5]; // 6th column (0-indexed: 5)
    if (expectedReturnCell) {
      expectedReturnCell.textContent = `${(annR*100).toFixed(1)}%`;
    }

    // Update the SIP display
    const sipCell = tr.querySelector('[data-sip]');
    if (sipCell) {
      sipCell.textContent = fmt(sip);
      if (sip === 0 && lump > 0) {
        sipCell.innerHTML = `<span style="color: #10b981; font-weight: bold;">${fmt(sip)} (Lumpsum)</span>`;
      }
    }

    return sip;
  }

  function render(){
    if (!tbody) return;
    tbody.innerHTML='';
    const nowYear = new Date().getFullYear();
    
    // Add retirement row first if available
    if (retirement && typeof retirement.corpus === 'number' && retirement.corpus>0) {
      const yLeft = Math.max(0, Math.round(retirement.nToRet||0));
      const fv = Math.round(retirement.corpus);
      const annR = preRetAnnualReturn(yLeft);
      const currentStepUp = parseFloat(investRule.autoStepUp||8);
      const stepUp = currentStepUp + '%';
      // Use the stored SIP value instead of recalculating to preserve optimized amounts
      const sip = retirement.sip || 0; // Don't recalculate, use stored value or 0
      const trR = document.createElement('tr');
      trR.setAttribute('data-yearsleft', String(yLeft));
      trR.setAttribute('data-priority', 'High');
      trR.innerHTML = `
        <td>Retirement</td>
        <td><span class="priority-badge high">High</span></td>
        <td class="right"><input type="number" data-fv value="${fv}" /></td>
        <td class="right"><input type="number" data-lump value="0" /></td>
        <td class="right"><input type="number" data-year value="${nowYear + yLeft}" min="${nowYear}" max="${nowYear + 50}" /></td>
        <td>${(annR*100).toFixed(1)}%</td>
        <td>${stepUp}</td>
        <td class="right" data-sip>${fmt(sip)}</td>`;
      tbody.appendChild(trR);
    }
    goals.forEach(g=>{
      const tr = document.createElement('tr');
      let yLeft = Math.max(0, (g.targetYear||nowYear) - nowYear);
      const fv = g.fv || 0;
      const name = g.name || 'Goal';
      const priority = g.priority || 'Medium';
      const isEmergencyFund = name.toLowerCase().includes('emergency');

      // For emergency fund, keep the original target year (2-3 years) but SIP continues until retirement
      if (isEmergencyFund) {
        // Keep the original target year for goal achievement (2-3 years)
        // The SIP will continue until retirement in the simulation
        console.log(`Step 6 - Emergency fund goal to be achieved in ${yLeft} years, SIP continues until retirement`);
      }

      const annR = preRetAnnualReturn(yLeft, isEmergencyFund);
      const currentStepUp = parseFloat(investRule.autoStepUp||8);
      const stepUp = currentStepUp + '%';
      // Use the stored SIP value instead of recalculating to preserve optimized amounts
      const sip = g.sip || 0; // Don't recalculate, use stored value or 0
      tr.setAttribute('data-yearsleft', String(yLeft));
      tr.setAttribute('data-priority', priority);
      tr.innerHTML = `
        <td>${name}</td>
        <td><span class="priority-badge ${priority.toLowerCase()}">${priority}</span></td>
        <td class="right"><input type="number" data-fv value="${Math.round(fv)}" /></td>
        <td class="right"><input type="number" data-lump value="0" /></td>
        <td class="right"><input type="number" data-year value="${g.targetYear||nowYear}" min="${nowYear}" max="${nowYear + 50}" ${isEmergencyFund ? 'readonly' : ''} /></td>
        <td>${(annR*100).toFixed(1)}%</td>
        <td>${stepUp}</td>
        <td class="right" data-sip>${fmt(sip)}</td>`;
      tbody.appendChild(tr);
    });
    tbody.addEventListener('input', (e)=>{
      if (e.target && (e.target.matches('input[data-fv]') || e.target.matches('input[data-lump]') || e.target.matches('input[data-year]'))) {
        // Recalculate SIP for this specific row when user manually changes inputs
        const tr = e.target.closest('tr');
        if (tr) {
          recalcSipForRow(tr);
          recalc(); // Recalculate total
        }
      }
    });
    // Calculate initial total without recalculating SIP amounts
    recalc();
    
    // Update optimize button state based on initial calculation
    let initialTotal = 0;
    Array.from(tbody.querySelectorAll('tr')).forEach(tr=>{
      const sipCell = tr.querySelector('[data-sip]');
      const sipText = sipCell ? sipCell.textContent : '0';
      const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
      initialTotal += sip;
    });
    updateOptimizeButtonState(initialTotal);
    
    // Store original values for reset functionality
    storeOriginalValues();
    
    // Persist an initial snapshot so Step 7 has data even if user navigates directly
    try {
      const save = [];
      Array.from(tbody.querySelectorAll('tr')).forEach(tr=>{
        const name = (tr.querySelector('td') && tr.querySelector('td').textContent) || 'Goal';
        const fv = parseFloat((tr.querySelector('input[data-fv]')||{}).value||'')||0;
        const lump = parseFloat((tr.querySelector('input[data-lump]')||{}).value||'')||0;
        const yearInput = tr.querySelector('input[data-year]');
        const targetYear = parseInt((yearInput && yearInput.value)||'0',10)||new Date().getFullYear();
        const nowYear = new Date().getFullYear();
        const yLeft = Math.max(0, targetYear - nowYear);
        const sipText = (tr.querySelector('[data-sip]')||{}).textContent || '0';
        const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,''))||0;
        
        if (/retire/i.test(name)) {
          // Update retirement data with current SIP and target value
          const updatedRetirement = {
            ...retirement,
            sip: sip,
            corpus: fv  // Save the current target value
          };
          localStorage.setItem('we_step4_retirement', JSON.stringify(updatedRetirement));
          
          // Don't save retirement as a regular goal in we_plan_goals to prevent duplication
          // Step 7 will handle retirement separately
          console.log('Step 6 - Initial render: Retirement goal updated, not adding to regular goals');
        } else {
          // Save regular goals
          save.push({ name, fv, lumpsum: lump, targetYear, yearsLeft: yLeft, sip });
        }
      });
      localStorage.setItem('we_plan_goals', JSON.stringify(save));
    } catch(e) {}
  }

  // Reset optimization state on page load
  window.optimizationInProgress = false;
  window.optimizationCompleted = false;
  window.optimizationCount = 0;
  window.maxOptimizations = 3;
  window.stepUpOptimizationDone = false; // Track if step-up optimization has been applied
  window.originalValues = {}; // Store original values for reset functionality
  
  render();
  
  // Check if optimization was already completed and show reset button
  setTimeout(() => {
    const resetBtn = document.getElementById('resetOptimizationBtn');
    if (resetBtn && window.optimizationCompleted) {
      resetBtn.style.display = 'inline-block';
    }
  }, 100);
  
  // Priority-based Optimization functionality
  function optimizePlan() {
    // Add safeguards to prevent multiple optimizations
    if (window.optimizationInProgress) {
      console.log('Optimization already in progress, skipping...');
      return;
    }

    // Check if maximum optimizations reached
    if (window.optimizationCount >= window.maxOptimizations) {
      alert(`Maximum optimization attempts reached (${window.maxOptimizations}). Please use the RESET button to start over.`);
      return;
    }

    // Mark optimization as in progress and increment counter
    window.optimizationInProgress = true;
    window.optimizationCount++;

    console.log(`Starting PRIORITY-BASED optimization attempt ${window.optimizationCount}/${window.maxOptimizations}`);

    const budget = getInvestmentBudget();
    if (budget <= 0) {
      alert('No investment budget found. Please complete the previous steps first.');
      window.optimizationInProgress = false;
      return;
    }

    // Refresh investRule from localStorage to ensure we have latest values
    const freshInvestRule = getInvestRule();
    if (freshInvestRule) {
      investRule.autoStepUp = freshInvestRule.autoStepUp;
    }

    // Collect all goals with their priorities
    const goalsData = [];
    Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
      const nameCell = tr.querySelector('td');
      const name = (nameCell && nameCell.textContent) || 'Goal';
      const fvInput = tr.querySelector('input[data-fv]');
      const lumpInput = tr.querySelector('input[data-lump]');
      const yearInput = tr.querySelector('input[data-year]');
      const nowYear = new Date().getFullYear();
      const targetYear = parseInt((yearInput && yearInput.value) || '0', 10) || nowYear;
      const yLeft = Math.max(0, targetYear - nowYear);
      const fv = parseFloat((fvInput && fvInput.value) || '') || 0;
      const lump = parseFloat((lumpInput && lumpInput.value) || '') || 0;
      const isEmergencyFund = name.toLowerCase().includes('emergency');
      const sip = rowSipFor(fv, yLeft, lump, null, isEmergencyFund);

      // Get priority from stored goals or default to High for retirement/emergency
      let priority = 'Medium';
      if (name.toLowerCase().includes('retire')) {
        priority = 'High';
      } else if (name.toLowerCase().includes('emergency')) {
        priority = 'High';
      } else {
        const storedGoal = goals.find(g => g.name === name);
        if (storedGoal && storedGoal.priority) {
          priority = storedGoal.priority;
        }
      }

      goalsData.push({ tr, name, fv, lump, yLeft, targetYear, sip, priority, fvInput, lumpInput, yearInput, isEmergencyFund });
    });

    // Calculate current total SIP
    let currentTotal = goalsData.reduce((sum, g) => sum + g.sip, 0);

    if (currentTotal <= budget) {
      alert('Your current plan already fits within your budget!');
      window.optimizationInProgress = false;
      return;
    }

    const optimizeBtn = document.getElementById('optimizeBtn');
    if (optimizeBtn) {
      optimizeBtn.disabled = true;
      const remaining = window.maxOptimizations - window.optimizationCount;
      optimizeBtn.innerHTML = `<span class="btn-icon">⏳</span> Optimizing... (${remaining} left)`;
    }

    // Priority-based optimization strategy
    const shortfall = currentTotal - budget;
    console.log(`Shortfall: ₹${shortfall}, Budget: ₹${budget}, Current Total: ₹${currentTotal}`);

    // Separate goals by priority
    const highPriorityGoals = goalsData.filter(g => g.priority === 'High');
    const mediumPriorityGoals = goalsData.filter(g => g.priority === 'Medium');
    const lowPriorityGoals = goalsData.filter(g => g.priority === 'Low');

    console.log(`Priority breakdown: High=${highPriorityGoals.length}, Medium=${mediumPriorityGoals.length}, Low=${lowPriorityGoals.length}`);

    let optimizationChanges = [];
    let remainingShortfall = shortfall;

    // STEP 0: Try increasing step-up rate first (reduces SIP requirements) - only on first attempt
    const currentStepUp = parseFloat(investRule.autoStepUp || 8);
    const maxStepUp = 10; // Max 10%

    // Check if step-up has already been applied (to ensure consistency across optimization attempts)
    const stepUpAlreadyApplied = window.stepUpOptimizationDone || currentStepUp >= maxStepUp;

    if (window.optimizationCount === 1 && !stepUpAlreadyApplied) {
      const newStepUp = maxStepUp; // Jump directly to 10%
      investRule.autoStepUp = newStepUp;
      try {
        localStorage.setItem('we_invest_rule', JSON.stringify(investRule));
        window.stepUpOptimizationDone = true; // Mark step-up as applied
        console.log(`Step-up increased from ${currentStepUp}% to ${newStepUp}%`);
      } catch(e) {
        console.error('Error saving investRule:', e);
      }

      // Re-render and recalculate with new step-up
      setTimeout(() => {
        render();
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.forEach(tr => recalcSipForRow(tr));
        recalc();

        // Check if step-up increase was enough
        let newTotal = 0;
        rows.forEach(tr => {
          const sipCell = tr.querySelector('[data-sip]');
          const sipText = sipCell ? sipCell.textContent : '0';
          const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
          newTotal += sip;
        });

        // Recalculate shortfall after step-up increase
        remainingShortfall = newTotal - budget;

        if (optExplain) {
          const statusColor = newTotal <= budget ? '#10b981' : '#f59e0b';
          const statusIcon = newTotal <= budget ? '✅' : '⚠️';
          const statusText = newTotal <= budget ? 'Optimized Successfully!' : 'Partially Optimized - Continue optimizing';

          optExplain.innerHTML = `
            <div style="color: ${statusColor}; font-weight: bold; margin-bottom: 12px;">
              ${statusIcon} ${statusText}
            </div>
            <div style="color: #6b7280; margin-bottom: 16px;">
              <strong>Original Total SIP:</strong> ${fmt(currentTotal)}<br>
              <strong>Optimized Total SIP:</strong> ${fmt(newTotal)}<br>
              <strong>Your Investment Budget:</strong> ${fmt(budget)}<br>
              <strong>${newTotal <= budget ? 'Remaining Budget' : 'Still Short'}:</strong> ${fmt(Math.abs(budget - newTotal))}
            </div>
            <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; border-left: 4px solid ${statusColor};">
              <strong>Optimization Attempt ${window.optimizationCount}:</strong>
              <div style="margin-top: 8px; font-size: 13px; line-height: 1.6;">
                • Increased annual step-up from ${currentStepUp}% to ${newStepUp}%<br>
                • This reduces monthly SIP requirements by leveraging annual increases<br>
                ${newTotal > budget ? '• <strong style="color: #ef4444;">Still exceeds budget - click Optimize again to reduce goals</strong>' : '• All goals fit within budget!'}
              </div>
            </div>
          `;
        }

        window.optimizationInProgress = false;
        window.optimizationCompleted = true;

        if (optimizeBtn) {
          if (newTotal <= budget) {
            optimizeBtn.disabled = true;
            optimizeBtn.innerHTML = '<span class="btn-icon">✅</span> OPTIMIZED';
          } else {
            const remaining = window.maxOptimizations - window.optimizationCount;
            optimizeBtn.disabled = false;
            optimizeBtn.innerHTML = `<span class="btn-icon">🎯</span> OPTIMIZE AGAIN (${remaining} left)`;
          }
        }

        const resetBtn = document.getElementById('resetOptimizationBtn');
        if (resetBtn) resetBtn.style.display = 'inline-block';
      }, 100);

      return; // Exit early - step-up optimization complete
    }

    // Step 1: ITERATIVE reduction to stay within budget (max 1.5k below budget)
    // Goal: Total SIP should be BELOW budget, ideally within 500-1500rs of budget
    // Priority: Critical life goals (marriage, retirement, education, emergency) > Aspirational goals (home, car, etc.)

    // Recalculate current total (already declared earlier)
    currentTotal = Array.from(tbody.querySelectorAll('tr')).reduce((sum, tr) => {
      const sipCell = tr.querySelector('[data-sip]');
      const sipText = sipCell ? sipCell.textContent : '0';
      const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
      return sum + sip;
    }, 0);

    remainingShortfall = currentTotal - budget;

    // Only optimize if we're over budget OR way under budget (more than 600rs under)
    if (remainingShortfall > 0 || (budget - currentTotal) > 600) {
      const allGoals = [...highPriorityGoals, ...mediumPriorityGoals, ...lowPriorityGoals];

      // Categorize goals into CRITICAL vs ASPIRATIONAL
      const isCriticalGoal = (goalName) => {
        const name = goalName.toLowerCase();
        return name.includes('retire') || name.includes('emergency') ||
               name.includes('marriage') || name.includes('wedding') ||
               name.includes('education') || name.includes('school') || name.includes('college') ||
               name.includes('child');
      };

      const criticalGoals = allGoals.filter(g => isCriticalGoal(g.name));
      const aspirationalGoals = allGoals.filter(g => !isCriticalGoal(g.name));

      // Store original FV values to track cumulative reductions
      const originalFVs = {};
      allGoals.forEach(g => {
        originalFVs[g.name] = parseFloat(g.fvInput.value) || 0;
      });

      // Target: 550rs below budget to maximize budget utilization
      const targetTotal = budget - 550;

      console.log(`Step 6 - Starting optimization: Budget=${budget}, Current Total=${Math.round(currentTotal)}, Target=${Math.round(targetTotal)}`);
      console.log(`Step 6 - Shortfall=${Math.round(remainingShortfall)} (positive=over budget, negative=under budget)`);
      console.log(`Step 6 - Critical goals: ${criticalGoals.length}, Aspirational goals: ${aspirationalGoals.length}`);

      // Iteratively reduce goals until we're within acceptable range
      let iterations = 0;
      const maxIterations = 30;

      // Continue if we're over budget OR more than 600rs under budget (to stay within 500-600 buffer)
      while ((currentTotal > budget || (budget - currentTotal) > 600) && iterations < maxIterations) {
        iterations++;

        // Recalculate current total after each iteration
        currentTotal = Array.from(tbody.querySelectorAll('tr')).reduce((sum, tr) => {
          const sipCell = tr.querySelector('[data-sip]');
          const sipText = sipCell ? sipCell.textContent : '0';
          const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
          return sum + sip;
        }, 0);

        remainingShortfall = currentTotal - budget;

        // Success: within budget and within 500-600rs buffer
        if (currentTotal <= budget && (budget - currentTotal) <= 600) {
          console.log(`Step 6 - Iteration ${iterations}: Success! Current=${Math.round(currentTotal)}, Buffer=${Math.round(budget - currentTotal)}rs`);
          break;
        }

        // Calculate how much we need to reduce to hit target
        const stillNeedToReduce = currentTotal - targetTotal;

        // Update all goals with current SIP values
        allGoals.forEach(g => {
          const sipCell = g.tr.querySelector('[data-sip]');
          const sipText = sipCell ? sipCell.textContent : '0';
          g.sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
        });

        console.log(`Step 6 - Iteration ${iterations}: Current=${Math.round(currentTotal)}, Target=${Math.round(targetTotal)}, Reduce by=${Math.round(stillNeedToReduce)}`);

        // STRATEGY: Reduce based on priority - Low first, then Medium, then High (minimal)
        const lowPriorityGoalsList = allGoals.filter(g => g.priority === 'Low');
        const mediumPriorityGoalsList = allGoals.filter(g => g.priority === 'Medium');
        const highPriorityGoalsList = allGoals.filter(g => g.priority === 'High');

        const totalLowSip = lowPriorityGoalsList.reduce((sum, g) => sum + g.sip, 0);
        const totalMediumSip = mediumPriorityGoalsList.reduce((sum, g) => sum + g.sip, 0);
        const totalHighSip = highPriorityGoalsList.reduce((sum, g) => sum + g.sip, 0);

        // Distribute reduction: 60% from Low priority, 30% from Medium, 10% from High
        const lowPriorityReduction = stillNeedToReduce * 0.60;
        const mediumPriorityReduction = stillNeedToReduce * 0.30;
        const highPriorityReduction = stillNeedToReduce * 0.10;

        // Reduce LOW PRIORITY goals most aggressively
        lowPriorityGoalsList.forEach(goal => {
          if (goal.sip <= 0) return;

          const currentFV = parseFloat(goal.fvInput.value) || 0;
          const originalFV = originalFVs[goal.name] || currentFV;
          const cumulativeReductionPercent = (originalFV - currentFV) / originalFV;

          // Check if critical goal type
          const isCritical = isCriticalGoal(goal.name);
          const maxTotalReductionPercent = isCritical ? 0.30 : 0.70; // 30% for critical, 70% for aspirational
          const maxReductionPercentThisIteration = isCritical ? 0.05 : 0.15; // 5% vs 15% per iteration

          if (cumulativeReductionPercent >= maxTotalReductionPercent) return;

          // Proportional reduction from low priority pool
          const goalProportion = totalLowSip > 0 ? goal.sip / totalLowSip : 0;
          const proportionalReduction = lowPriorityReduction * goalProportion;
          const targetReduction = Math.min(proportionalReduction, goal.sip * maxReductionPercentThisIteration);
          const reductionPercentage = targetReduction / goal.sip;

          const remainingAllowedReduction = maxTotalReductionPercent - cumulativeReductionPercent;
          const finalReductionPercentage = Math.min(reductionPercentage, remainingAllowedReduction);

          if (finalReductionPercentage > 0.001) {
            const newFV = Math.max(0, currentFV * (1 - finalReductionPercentage));
            goal.fvInput.value = Math.round(newFV);
            recalcSipForRow(goal.tr);

            if (iterations === 1) {
              optimizationChanges.push(`${goal.name} (Low Priority): Adjusted to fit budget`);
            }
          }
        });

        // Reduce MEDIUM PRIORITY goals moderately
        mediumPriorityGoalsList.forEach(goal => {
          if (goal.sip <= 0) return;

          const currentFV = parseFloat(goal.fvInput.value) || 0;
          const originalFV = originalFVs[goal.name] || currentFV;
          const cumulativeReductionPercent = (originalFV - currentFV) / originalFV;

          // Check if critical goal type
          const isCritical = isCriticalGoal(goal.name);
          const maxTotalReductionPercent = isCritical ? 0.15 : 0.45; // 15% for critical, 45% for aspirational
          const maxReductionPercentThisIteration = isCritical ? 0.03 : 0.08; // 3% vs 8% per iteration

          if (cumulativeReductionPercent >= maxTotalReductionPercent) return;

          // Proportional reduction from medium priority pool
          const goalProportion = totalMediumSip > 0 ? goal.sip / totalMediumSip : 0;
          const proportionalReduction = mediumPriorityReduction * goalProportion;
          const targetReduction = Math.min(proportionalReduction, goal.sip * maxReductionPercentThisIteration);
          const reductionPercentage = targetReduction / goal.sip;

          const remainingAllowedReduction = maxTotalReductionPercent - cumulativeReductionPercent;
          const finalReductionPercentage = Math.min(reductionPercentage, remainingAllowedReduction);

          if (finalReductionPercentage > 0.001) {
            const newFV = Math.max(0, currentFV * (1 - finalReductionPercentage));
            goal.fvInput.value = Math.round(newFV);
            recalcSipForRow(goal.tr);

            if (iterations === 1) {
              optimizationChanges.push(`${goal.name} (Medium Priority): Adjusted moderately`);
            }
          }
        });

        // Reduce HIGH PRIORITY goals minimally (protect critical life goals)
        highPriorityGoalsList.forEach(goal => {
          if (goal.sip <= 0) return;

          const currentFV = parseFloat(goal.fvInput.value) || 0;
          const originalFV = originalFVs[goal.name] || currentFV;
          const cumulativeReductionPercent = (originalFV - currentFV) / originalFV;

          // Check if critical goal type
          const isCritical = isCriticalGoal(goal.name);
          const maxTotalReductionPercent = isCritical ? 0.05 : 0.20; // Only 5% for critical, 20% for aspirational
          const maxReductionPercentThisIteration = isCritical ? 0.01 : 0.03; // 1% vs 3% per iteration

          if (cumulativeReductionPercent >= maxTotalReductionPercent) return;

          // Proportional reduction from high priority pool
          const goalProportion = totalHighSip > 0 ? goal.sip / totalHighSip : 0;
          const proportionalReduction = highPriorityReduction * goalProportion;
          const targetReduction = Math.min(proportionalReduction, goal.sip * maxReductionPercentThisIteration);
          const reductionPercentage = targetReduction / goal.sip;

          const remainingAllowedReduction = maxTotalReductionPercent - cumulativeReductionPercent;
          const finalReductionPercentage = Math.min(reductionPercentage, remainingAllowedReduction);

          if (finalReductionPercentage > 0.001) {
            const newFV = Math.max(0, currentFV * (1 - finalReductionPercentage));
            goal.fvInput.value = Math.round(newFV);
            recalcSipForRow(goal.tr);

            if (iterations === 1) {
              optimizationChanges.push(`${goal.name} (High Priority): Minimally adjusted`);
            }
          }
        });
      }

      // Final recalc to get exact total
      const finalTotal = Array.from(tbody.querySelectorAll('tr')).reduce((sum, tr) => {
        const sipCell = tr.querySelector('[data-sip]');
        const sipText = sipCell ? sipCell.textContent : '0';
        const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
        return sum + sip;
      }, 0);

      remainingShortfall = finalTotal - budget;
      const buffer = budget - finalTotal;

      console.log(`Step 6 - Optimization complete! Iterations=${iterations}, Final total=${Math.round(finalTotal)}, Buffer=${Math.round(buffer)}rs`);
      optimizationChanges.push(`Optimized in ${iterations} iteration${iterations > 1 ? 's' : ''} - within ₹${Math.abs(Math.round(buffer))} of budget`);
    }

    // Step 2: If still over budget, reduce Low Priority ASPIRATIONAL goals more aggressively
    if (remainingShortfall > 0 && lowPriorityGoals.length > 0) {
      const isCriticalGoal = (goalName) => {
        const name = goalName.toLowerCase();
        return name.includes('retire') || name.includes('emergency') ||
               name.includes('marriage') || name.includes('wedding') ||
               name.includes('education') || name.includes('school') || name.includes('college') ||
               name.includes('child');
      };

      const aspirationalLowGoals = lowPriorityGoals.filter(g => !isCriticalGoal(g.name));
      const totalAspirationalLowSip = aspirationalLowGoals.reduce((sum, g) => sum + g.sip, 0);

      aspirationalLowGoals.forEach(goal => {
        if (remainingShortfall <= 0) return;

        const goalProportion = totalAspirationalLowSip > 0 ? goal.sip / totalAspirationalLowSip : 0;
        const proportionalReduction = remainingShortfall * goalProportion;
        const targetReduction = Math.min(proportionalReduction, goal.sip * 0.50); // Can reduce up to 50% more
        const reductionPercentage = targetReduction / goal.sip;

        const newFV = Math.max(0, goal.fv * (1 - reductionPercentage));
        goal.fvInput.value = Math.round(newFV);
        recalcSipForRow(goal.tr);

        const sipCell = goal.tr.querySelector('[data-sip]');
        const sipText = sipCell ? sipCell.textContent : '0';
        const newSip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
        const actualReduction = goal.sip - newSip;

        remainingShortfall -= actualReduction;
        goal.sip = newSip;
        optimizationChanges.push(`${goal.name} (Low, Aspirational): Further reduced by ${(reductionPercentage * 100).toFixed(1)}% → ₹${Math.round(actualReduction)} saved`);
      });
    }

    // Step 3: If still over budget, reduce Medium Priority ASPIRATIONAL goals more
    if (remainingShortfall > 0 && mediumPriorityGoals.length > 0) {
      const isCriticalGoal = (goalName) => {
        const name = goalName.toLowerCase();
        return name.includes('retire') || name.includes('emergency') ||
               name.includes('marriage') || name.includes('wedding') ||
               name.includes('education') || name.includes('school') || name.includes('college') ||
               name.includes('child');
      };

      const aspirationalMediumGoals = mediumPriorityGoals.filter(g => !isCriticalGoal(g.name));
      const totalAspirationalMediumSip = aspirationalMediumGoals.reduce((sum, g) => sum + g.sip, 0);

      aspirationalMediumGoals.forEach(goal => {
        if (remainingShortfall <= 0) return;

        const goalProportion = totalAspirationalMediumSip > 0 ? goal.sip / totalAspirationalMediumSip : 0;
        const proportionalReduction = remainingShortfall * goalProportion;
        const targetReduction = Math.min(proportionalReduction, goal.sip * 0.35); // Can reduce up to 35% more
        const reductionPercentage = targetReduction / goal.sip;

        const newFV = Math.max(0, goal.fv * (1 - reductionPercentage));
        goal.fvInput.value = Math.round(newFV);
        recalcSipForRow(goal.tr);

        const sipCell = goal.tr.querySelector('[data-sip]');
        const sipText = sipCell ? sipCell.textContent : '0';
        const newSip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
        const actualReduction = goal.sip - newSip;

        remainingShortfall -= actualReduction;
        goal.sip = newSip;
        optimizationChanges.push(`${goal.name} (Medium, Aspirational): Further reduced by ${(reductionPercentage * 100).toFixed(1)}% → ₹${Math.round(actualReduction)} saved`);
      });
    }

    // Step 4: If still short, try deferring High Priority goals (extend by up to 1 year)
    if (remainingShortfall > 0 && highPriorityGoals.length > 0) {
      highPriorityGoals.forEach(goal => {
        if (remainingShortfall <= 0) return;

        // STRICT: Never extend these critical goals
        const goalNameLower = goal.name.toLowerCase();
        if (goalNameLower.includes('retire') ||
            goalNameLower.includes('emergency') ||
            goalNameLower.includes('marriage') ||
            goalNameLower.includes('wedding') ||
            goalNameLower.includes('education') ||
            goalNameLower.includes('school') ||
            goalNameLower.includes('college')) {
          console.log(`Step 6 - Skipping tenure extension for protected goal: ${goal.name}`);
          return;
        }

        const maxExtension = 1; // High priority can be deferred up to 1 year only
        for (let ext = 1; ext <= maxExtension && remainingShortfall > 0; ext++) {
          const newTargetYear = goal.targetYear + ext;
          const newYearsLeft = Math.max(0, newTargetYear - new Date().getFullYear());
          const originalSip = goal.sip;

          goal.yearInput.value = newTargetYear;

          // Update display to recalculate SIP with extended timeline
          recalcSipForRow(goal.tr);

          // Get the newly calculated SIP
          const sipCell = goal.tr.querySelector('[data-sip]');
          const sipText = sipCell ? sipCell.textContent : '0';
          const newSip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
          const reduction = originalSip - newSip;

          if (reduction > 0) {
            remainingShortfall -= reduction;
            optimizationChanges.push(`${goal.name} (High): Deferred by ${ext} year → ₹${Math.round(reduction)} saved`);
            goal.sip = newSip; // Update goal's SIP for further calculations
            break;
          }
        }
      });
    }

    // Step 5: If still short, try deferring Medium Priority goals (extend by up to 2 years max)
    if (remainingShortfall > 0 && mediumPriorityGoals.length > 0) {
      mediumPriorityGoals.forEach(goal => {
        if (remainingShortfall <= 0) return;

        // STRICT: Never extend these critical goals
        const goalNameLower = goal.name.toLowerCase();
        if (goalNameLower.includes('retire') ||
            goalNameLower.includes('emergency') ||
            goalNameLower.includes('marriage') ||
            goalNameLower.includes('wedding') ||
            goalNameLower.includes('education') ||
            goalNameLower.includes('school') ||
            goalNameLower.includes('college')) {
          return;
        }

        const maxExtension = 2; // Medium priority can be deferred up to 2 years max (reduced from 4)
        for (let ext = 1; ext <= maxExtension && remainingShortfall > 0; ext++) {
          const newTargetYear = goal.targetYear + ext;
          const newYearsLeft = Math.max(0, newTargetYear - new Date().getFullYear());
          const originalSip = goal.sip;

          goal.yearInput.value = newTargetYear;

          // Update display to recalculate SIP with extended timeline
          recalcSipForRow(goal.tr);

          // Get the newly calculated SIP
          const sipCell = goal.tr.querySelector('[data-sip]');
          const sipText = sipCell ? sipCell.textContent : '0';
          const newSip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
          const reduction = originalSip - newSip;

          if (reduction > 0) {
            remainingShortfall -= reduction;
            optimizationChanges.push(`${goal.name} (Medium): Deferred by ${ext} year(s) → ₹${Math.round(reduction)} saved`);
            goal.sip = newSip; // Update goal's SIP for further calculations
            break;
          }
        }
      });
    }

    // Step 6: If still short, try deferring Low Priority goals (extend by up to 4 years max)
    if (remainingShortfall > 0 && lowPriorityGoals.length > 0) {
      lowPriorityGoals.forEach(goal => {
        if (remainingShortfall <= 0) return;

        // STRICT: Never extend these critical goals
        const goalNameLower = goal.name.toLowerCase();
        if (goalNameLower.includes('retire') ||
            goalNameLower.includes('emergency') ||
            goalNameLower.includes('marriage') ||
            goalNameLower.includes('wedding') ||
            goalNameLower.includes('education') ||
            goalNameLower.includes('school') ||
            goalNameLower.includes('college')) {
          return;
        }

        const maxExtension = 4; // Low priority can be deferred up to 4 years max (reduced from 6)
        for (let ext = 1; ext <= maxExtension && remainingShortfall > 0; ext++) {
          const newTargetYear = goal.targetYear + ext;
          const newYearsLeft = Math.max(0, newTargetYear - new Date().getFullYear());
          const originalSip = goal.sip;

          goal.yearInput.value = newTargetYear;

          // Update display to recalculate SIP with extended timeline
          recalcSipForRow(goal.tr);

          // Get the newly calculated SIP
          const sipCell = goal.tr.querySelector('[data-sip]');
          const sipText = sipCell ? sipCell.textContent : '0';
          const newSip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
          const reduction = originalSip - newSip;

          if (reduction > 0) {
            remainingShortfall -= reduction;
            optimizationChanges.push(`${goal.name} (Low): Deferred by ${ext} year(s) → ₹${Math.round(reduction)} saved`);
            goal.sip = newSip; // Update goal's SIP for further calculations
            break;
          }
        }
      });
    }

    // Step 6: Calculate final total and fine-tune if below budget
    recalc(); // Recalc to get current total

    currentTotal = Array.from(tbody.querySelectorAll('tr')).reduce((sum, tr) => {
      const sipCell = tr.querySelector('[data-sip]');
      const sipText = sipCell ? sipCell.textContent : '0';
      const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
      return sum + sip;
    }, 0);

    // No fine-tuning needed - we target 97% utilization from the start in Step 1
    console.log(`Step 6 - Final total: ${currentTotal}, Budget: ${budget}, Utilization: ${(currentTotal/budget*100).toFixed(1)}%`);

    // Step 7: Summary note about priority protection
    optimizationChanges.push(`Retirement & Emergency funds are always fully protected from deferral`);

    // Final recalculate
    recalc();

    // Display optimization results
    setTimeout(() => {
      const newTotal = Array.from(tbody.querySelectorAll('tr')).reduce((sum, tr) => {
        const sipCell = tr.querySelector('[data-sip]');
        const sipText = sipCell ? sipCell.textContent : '0';
        const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
        return sum + sip;
      }, 0);

      const optimizationMessage = optimizationChanges.join('\n');

      if (optExplain) {
        const statusColor = newTotal <= budget ? '#10b981' : '#f59e0b';
        const statusIcon = newTotal <= budget ? '✅' : '⚠️';
        const statusText = newTotal <= budget ? 'Optimized Successfully!' : 'Partially Optimized';

        optExplain.innerHTML = `
          <div style="color: ${statusColor}; font-weight: bold; margin-bottom: 12px; font-size: 16px;">
            ${statusIcon} ${statusText}
          </div>
          <div style="color: var(--text-primary); margin-bottom: 16px;">
            <strong>Original Total SIP:</strong> ${fmt(currentTotal)}<br>
            <strong>Optimized Total SIP:</strong> ${fmt(newTotal)}<br>
            <strong>Your Investment Budget:</strong> ${fmt(budget)}<br>
            <strong>${newTotal <= budget ? 'Remaining Budget' : 'Still Short'}:</strong> ${fmt(Math.abs(budget - newTotal))}
          </div>
          <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; border-left: 4px solid ${statusColor}; color: var(--text-primary);">
            <strong style="color: var(--text-primary);">Optimization Changes:</strong>
            <div style="margin-top: 8px; font-size: 13px; line-height: 1.6; color: var(--text-primary);">
              ${optimizationChanges.map(change => `• ${change}`).join('<br>')}
            </div>
          </div>
        `;
      }

      window.optimizationInProgress = false;
      window.optimizationCompleted = true;

      // Update optimize button
      if (optimizeBtn) {
        if (newTotal <= budget) {
          optimizeBtn.disabled = true;
          optimizeBtn.innerHTML = '<span class="btn-icon">✅</span> OPTIMIZED';
        } else if (window.optimizationCount < window.maxOptimizations) {
          optimizeBtn.disabled = false;
          const remaining = window.maxOptimizations - window.optimizationCount;
          optimizeBtn.innerHTML = `<span class="btn-icon">🎯</span> OPTIMIZE AGAIN (${remaining} left)`;
        } else {
          optimizeBtn.disabled = true;
          optimizeBtn.innerHTML = '<span class="btn-icon">⛔</span> MAX ATTEMPTS REACHED';
        }
      }

      // Show reset button
      const resetBtn = document.getElementById('resetOptimizationBtn');
      if (resetBtn) {
        resetBtn.style.display = 'inline-block';
      }

      // Save optimized plan
      try {
        const save = [];
        Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
          const name = (tr.querySelector('td') && tr.querySelector('td').textContent) || 'Goal';
          const fv = parseFloat((tr.querySelector('input[data-fv]') || {}).value || '') || 0;
          const lump = parseFloat((tr.querySelector('input[data-lump]') || {}).value || '') || 0;
          const yearInput = tr.querySelector('input[data-year]');
          const targetYear = parseInt((yearInput && yearInput.value) || '0', 10) || new Date().getFullYear();
          const nowYear = new Date().getFullYear();
          const yLeft = Math.max(0, targetYear - nowYear);
          const sipText = (tr.querySelector('[data-sip]') || {}).textContent || '0';
          const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;

          if (!/retire/i.test(name)) {
            save.push({ name, fv, lumpsum: lump, targetYear, yearsLeft: yLeft, sip });
          }
        });
        localStorage.setItem('we_plan_goals', JSON.stringify(save));
      } catch (e) {
        console.error('Error saving optimized plan:', e);
      }
    }, 100);
    return; // Exit the function here - remove old optimization logic

    // OLD OPTIMIZATION LOGIC REMOVED
    if (window.optimizationCount === 1) {
      // First optimization: Increase step-up to 10% (but never exceed 10%)
      optimizationStep = 'stepup';
      const currentStepUp = parseFloat(investRule.autoStepUp || 8);
      const newStepUp = Math.min(10, Math.max(currentStepUp, 10)); // Never exceed 10%
    
      if (newStepUp > currentStepUp) {
        investRule.autoStepUp = newStepUp;
        try {
          localStorage.setItem('we_invest_rule', JSON.stringify(investRule));
          console.log('Updated investRule with new step-up:', investRule);
      } catch(e) {
        console.error('Error saving investRule:', e);
      }
      
        // Force re-render with new step-up and recalculate SIP amounts
      setTimeout(() => {
        render();
          // Recalculate SIP amounts for all rows with new step-up
          const rows = Array.from(tbody.querySelectorAll('tr'));
          rows.forEach(tr => {
            recalcSipForRow(tr);
          });
          recalc();
        console.log('Re-rendered with new step-up:', newStepUp + '%');
      }, 100);
      
        optimizationMessage = `Step-up increased from ${currentStepUp}% to ${newStepUp}%`;
      } else {
        optimizationMessage = `Step-up already at ${currentStepUp}%`;
      }
      
    } else if (window.optimizationCount === 2) {
      // Second optimization: Reduce goal amounts more aggressively with constraints
      optimizationStep = 'reduce';
      const targetAmount = budget + 300; // Target budget + 300 (closer to budget)
      const excess = currentTotal - targetAmount;
      
      if (excess > 0) {
        // More aggressive reduction: aim to reduce by at least 40-60% or enough to reach target
        const baseReductionPercentage = Math.max(0.40, Math.min(excess / currentTotal, 0.60)); // 40-60% reduction
        console.log(`Goal reduction: excess=${excess}, baseReductionPercentage=${(baseReductionPercentage*100).toFixed(1)}%`);
        const rows = Array.from(tbody.querySelectorAll('tr'));
        let totalReduction = 0;
        
        rows.forEach(tr => {
          const fvInput = tr.querySelector('input[data-fv]');
          const nameCell = tr.querySelector('td');
          const goalName = nameCell ? nameCell.textContent : '';
          const constraints = getGoalConstraints(goalName);
          
          if (fvInput) {
            const currentValue = parseFloat(fvInput.value) || 0;
            // Apply different reduction rates based on goal type
            const reductionPercentage = Math.min(baseReductionPercentage, constraints.maxAmountReduction);
            const reduction = currentValue * reductionPercentage;
            const minValue = currentValue * (1 - constraints.maxAmountReduction); // Respect max reduction limit
            const newValue = Math.max(currentValue - reduction, minValue);
            fvInput.value = Math.round(newValue);
            totalReduction += (currentValue - newValue);
            
            console.log(`Goal "${goalName}": ${constraints.type}, reduced by ${(reductionPercentage*100).toFixed(1)}% (max: ${(constraints.maxAmountReduction*100).toFixed(1)}%)`);
          }
        });
        
        if (totalReduction > 0) {
          // Recalculate SIP amounts for all rows after reducing goal amounts
          rows.forEach(tr => {
            recalcSipForRow(tr);
          });
          recalc();
          
          // Safety check: ensure we don't go below budget
          let newTotal = 0;
          Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
            const sipCell = tr.querySelector('[data-sip]');
            const sipText = sipCell ? sipCell.textContent : '0';
            const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
            newTotal += sip;
          });
          
          if (newTotal < budget) {
            // If we went below budget, adjust goal amounts slightly upward
            const adjustment = (budget + 200) - newTotal; // Target budget + 200
            const adjustmentPercentage = adjustment / newTotal;
            
            rows.forEach(tr => {
              const fvInput = tr.querySelector('input[data-fv]');
              if (fvInput) {
                const currentValue = parseFloat(fvInput.value) || 0;
                const adjustment = currentValue * adjustmentPercentage;
                fvInput.value = Math.round(currentValue + adjustment);
              }
            });
            
            // Recalculate again with adjusted amounts
            rows.forEach(tr => {
              recalcSipForRow(tr);
            });
            recalc();
            console.log(`Adjusted goal amounts to maintain budget buffer: +${adjustmentPercentage.toFixed(1)}%`);
          }
          
          optimizationMessage = `Goal amounts reduced by ${(baseReductionPercentage * 100).toFixed(1)}% (constrained by goal types)`;
        } else {
          optimizationMessage = 'Goal amounts already optimized';
        }
      } else {
        optimizationMessage = 'Goal amounts already within target';
      }
      
    } else if (window.optimizationCount === 3) {
      // Third optimization: Extend tenure with constraints for emergency/retirement
      optimizationStep = 'extend';
      const targetAmount = budget + 200; // Target budget + 200 (very close to budget)
      
      if (currentTotal > targetAmount) {
        console.log(`Tenure extension: currentTotal=${currentTotal}, targetAmount=${targetAmount}`);
          const rows = Array.from(tbody.querySelectorAll('tr'));
          const nowYear = new Date().getFullYear();
          let totalExtension = 0;
        let constrainedGoals = 0;
        let flexibleGoals = 0;
          
          rows.forEach(tr => {
            const yearInput = tr.querySelector('input[data-year]');
          const nameCell = tr.querySelector('td');
          const goalName = nameCell ? nameCell.textContent : '';
          const constraints = getGoalConstraints(goalName);
          
            if (yearInput) {
              const currentYear = parseInt(yearInput.value) || nowYear;
            let extensionYears;
            
            if (constraints.type === 'emergency' || constraints.type === 'retirement' || constraints.type === 'marriage' || constraints.type === 'education') {
              // Critical life goals: max 1 year extension
              extensionYears = Math.min(1, constraints.maxTenureExtension);
              constrainedGoals++;
              console.log(`Goal "${goalName}": ${constraints.type}, extending by ${extensionYears} year (constrained)`);
            } else {
              // Other goals: more flexible extension
              extensionYears = currentTotal > budget * 1.2 ? 5 : 4; // 4-5 years for other goals
              flexibleGoals++;
              console.log(`Goal "${goalName}": ${constraints.type}, extending by ${extensionYears} years (flexible)`);
            }
            
            const newYear = currentYear + extensionYears;
            yearInput.value = newYear;
            totalExtension += extensionYears;
          }
        });
        
        if (totalExtension > 0) {
          // Recalculate SIP amounts for all rows after extending tenure
          rows.forEach(tr => {
            recalcSipForRow(tr);
          });
          recalc();
          
          // Safety check: ensure we don't go below budget
          let newTotal = 0;
          Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
            const sipCell = tr.querySelector('[data-sip]');
            const sipText = sipCell ? sipCell.textContent : '0';
            const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
            newTotal += sip;
          });
          
          if (newTotal < budget) {
            // If we went below budget, adjust goal amounts slightly upward
            const adjustment = (budget + 200) - newTotal; // Target budget + 200
            const adjustmentPercentage = adjustment / newTotal;
            
            rows.forEach(tr => {
              const fvInput = tr.querySelector('input[data-fv]');
              if (fvInput) {
                const currentValue = parseFloat(fvInput.value) || 0;
                const adjustment = currentValue * adjustmentPercentage;
                fvInput.value = Math.round(currentValue + adjustment);
              }
            });
            
            // Recalculate again with adjusted amounts
            rows.forEach(tr => {
              recalcSipForRow(tr);
            });
            recalc();
            console.log(`Adjusted goal amounts after tenure extension to maintain budget buffer: +${adjustmentPercentage.toFixed(1)}%`);
          }
            
            // Update retirement data with new tenure if retirement goal was extended
            const retirementRow = Array.from(tbody.querySelectorAll('tr')).find(tr => {
              const nameCell = tr.querySelector('td');
              return nameCell && /retire/i.test(nameCell.textContent);
            });
            
            if (retirementRow) {
              const yearInput = retirementRow.querySelector('input[data-year]');
              if (yearInput) {
                const newTargetYear = parseInt(yearInput.value) || new Date().getFullYear();
                const nowYear = new Date().getFullYear();
                const newNToRet = Math.max(0, newTargetYear - nowYear);
                
                const currentRetirement = getRetirement();
                if (currentRetirement) {
                  const updatedRetirement = {
                    ...currentRetirement,
                    nToRet: newNToRet
                  };
                  try {
                    localStorage.setItem('we_step4_retirement', JSON.stringify(updatedRetirement));
                    console.log(`Step 6 - Updated retirement tenure: ${currentRetirement.nToRet} → ${newNToRet} years`);
                  } catch(e) {
                    console.error('Error updating retirement tenure:', e);
                  }
                }
              }
            }
            
          optimizationMessage = `Tenure extended: ${constrainedGoals} constrained goal${constrainedGoals > 1 ? 's' : ''} (+1 year), ${flexibleGoals} flexible goal${flexibleGoals > 1 ? 's' : ''} (+4-5 years)`;
        } else {
          optimizationMessage = 'Tenure already optimized';
        }
      } else {
        // If already within budget, do additional reduction to ensure we're well below budget
        const rows = Array.from(tbody.querySelectorAll('tr'));
        let additionalReduction = 0;
        
        rows.forEach(tr => {
          const fvInput = tr.querySelector('input[data-fv]');
          const nameCell = tr.querySelector('td');
          const goalName = nameCell ? nameCell.textContent : '';
          const constraints = getGoalConstraints(goalName);
          
          if (fvInput) {
            const currentValue = parseFloat(fvInput.value) || 0;
            // More aggressive fine-tuning: 15-20% additional reduction
            const fineTuningReduction = constraints.type === 'other' ? 0.20 : 0.15; // 20% for other goals, 15% for constrained
            const reduction = currentValue * fineTuningReduction;
            const minValue = currentValue * (1 - constraints.maxAmountReduction);
            const newValue = Math.max(currentValue - reduction, minValue);
            fvInput.value = Math.round(newValue);
            additionalReduction += (currentValue - newValue);
          }
        });
        
        if (additionalReduction > 0) {
          rows.forEach(tr => {
            recalcSipForRow(tr);
          });
          recalc();
          
          // Safety check: ensure we don't go below budget
          let newTotal = 0;
          Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
            const sipCell = tr.querySelector('[data-sip]');
            const sipText = sipCell ? sipCell.textContent : '0';
            const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
            newTotal += sip;
          });
          
          if (newTotal < budget) {
            // If we went below budget, adjust goal amounts slightly upward
            const adjustment = (budget + 200) - newTotal; // Target budget + 200
            const adjustmentPercentage = adjustment / newTotal;
            
            rows.forEach(tr => {
              const fvInput = tr.querySelector('input[data-fv]');
              if (fvInput) {
                const currentValue = parseFloat(fvInput.value) || 0;
                const adjustment = currentValue * adjustmentPercentage;
                fvInput.value = Math.round(currentValue + adjustment);
              }
            });
            
            // Recalculate again with adjusted amounts
            rows.forEach(tr => {
              recalcSipForRow(tr);
            });
            recalc();
            console.log(`Adjusted goal amounts after fine-tuning to maintain budget buffer: +${adjustmentPercentage.toFixed(1)}%`);
          }
          
          optimizationMessage = 'Final fine-tuning: Additional 15-20% reduction applied';
        } else {
          optimizationMessage = 'Plan already fits within budget';
        }
      }
    }
    
    // Show feedback and re-enable button
    setTimeout(() => {
          const optExplain = document.getElementById('optExplain');
          const remaining = window.maxOptimizations - window.optimizationCount;
      
      // Calculate new total SIP after optimization
      let newTotal = 0;
      Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
        const sipCell = tr.querySelector('[data-sip]');
        const sipText = sipCell ? sipCell.textContent : '0';
        const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
        newTotal += sip;
      });
      
      const sipReduction = currentTotal - newTotal;
      const reductionPercent = currentTotal > 0 ? ((sipReduction / currentTotal) * 100).toFixed(1) : 0;
      
      const budgetBuffer = newTotal - budget;
      const bufferStatus = budgetBuffer >= 0 ? 
        `✅ ${fmt(budgetBuffer)} above budget` : 
        `⚠️ ${fmt(Math.abs(budgetBuffer))} below budget`;
      
          optExplain.innerHTML = `
            <div style="color: #10b981; font-weight: 600; margin-bottom: 8px;">
          ✅ Optimization ${window.optimizationCount} Complete!
            </div>
            <div style="color: var(--text-secondary); font-size: 14px; line-height: 1.5;">
          ${optimizationMessage}<br>
          SIP reduced by ${fmt(sipReduction)} (${reductionPercent}%)<br>
          New total: ${fmt(newTotal)} (Budget: ${fmt(budget)})<br>
          ${bufferStatus}<br>
          ${remaining > 0 ? `${remaining} optimization${remaining > 1 ? 's' : ''} remaining` : 'Maximum optimizations reached'}
            </div>
          `;
        
        // Re-enable button or disable if max reached
        if (optimizeBtn) {
          if (window.optimizationCount >= window.maxOptimizations) {
            optimizeBtn.disabled = true;
            optimizeBtn.innerHTML = '<span class="btn-icon">🚫</span> MAX REACHED';
          // Show reset button
          const resetBtn = document.getElementById('resetOptimizationBtn');
          if (resetBtn) {
            resetBtn.style.display = 'inline-block';
          }
          } else {
            optimizeBtn.disabled = false;
            const remaining = window.maxOptimizations - window.optimizationCount;
            optimizeBtn.innerHTML = `<span class="btn-icon">🎯</span> OPTIMIZE (${remaining} left)`;
          }
        }
        
        // Mark optimization as completed
        window.optimizationInProgress = false;
    }, 1000);
  }
  
  // Expose optimizePlan to window for ML integration (MUST be before addEventListener!)
  window.optimizePlan = optimizePlan;

  // Add event listener for optimize button
  // Use arrow function to call window.optimizePlan (allows ML wrapper to intercept)
  const optimizeBtn = document.getElementById('optimizeBtn');
  if (optimizeBtn) {
    optimizeBtn.addEventListener('click', function() {
      // Call through window.optimizePlan so ML integration can wrap it
      if (typeof window.optimizePlan === 'function') {
        window.optimizePlan();
      }
    });
  }

  // Add reset optimization functionality
  function resetOptimization() {
    window.optimizationInProgress = false;
    window.optimizationCompleted = false;
    window.optimizationCount = 0;
    window.stepUpOptimizationDone = false; // Reset step-up flag for consistency
    console.log('Optimization state reset - you can now optimize again (3 attempts available)');

    // Hide reset button
    const resetBtn = document.getElementById('resetOptimizationBtn');
    if (resetBtn) {
      resetBtn.style.display = 'none';
    }

    // Clear optimization explanation
    const optExplain = document.getElementById('optExplain');
    if (optExplain) {
      optExplain.innerHTML = 'Your plan is optimized to fit your budget. Details will appear here.';
    }

    // Restore original values and recalculate
    restoreOriginalValues();
  }
  
  // Add reset button if it exists
  const resetBtn = document.getElementById('resetOptimizationBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetOptimization);
  }
  
  const to7 = document.getElementById('to-step7');
  if (to7) to7.addEventListener('click', ()=> {
    // Persist Step 6 overrides (fv & lumpsum & recomputed sip)
    const save = [];
    Array.from(tbody.querySelectorAll('tr')).forEach(tr=>{
      const name = (tr.querySelector('td') && tr.querySelector('td').textContent) || 'Goal';
      const fv = parseFloat((tr.querySelector('input[data-fv]')||{}).value||'')||0;
      const lump = parseFloat((tr.querySelector('input[data-lump]')||{}).value||'')||0;
      const yearInput = tr.querySelector('input[data-year]');
      const targetYear = parseInt((yearInput && yearInput.value)||'0',10)||new Date().getFullYear();
      const nowYear = new Date().getFullYear();
      const yLeft = Math.max(0, targetYear - nowYear);
      
      // Use the actual SIP value displayed in the table instead of recalculating
      const sipCell = tr.querySelector('[data-sip]');
      const sipText = sipCell ? sipCell.textContent : '0';
      const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
      const isPureLumpsum = (sip === 0 && lump > 0);
      
      console.log(`Step 6 - Saving goal "${name}": FV=${fv}, Lumpsum=${lump}, SIP=${sip}, SIPText="${sipText}"`);
      
      if (/retire/i.test(name)) {
        // Update retirement data with new SIP, optimized corpus, and target year
        const updatedRetirement = {
          ...retirement,
          sip: sip,
          corpus: fv,  // Save the optimized target value
          nToRet: yLeft  // Save the current tenure (may have been extended during optimization)
        };
        try { localStorage.setItem('we_step4_retirement', JSON.stringify(updatedRetirement)); } catch(e) {}
        
        // Don't save retirement as a regular goal in we_plan_goals to prevent duplication
        // Step 7 will handle retirement separately
        console.log(`Step 6 - Retirement goal updated: SIP=${sip}, Corpus=${fv}, Tenure=${yLeft} years`);
      } else {
        // Save regular goals
        save.push({ name, fv, lumpsum: lump, targetYear, yearsLeft: yLeft, sip, isPureLumpsum });
      }
    });
    try { localStorage.setItem('we_plan_goals', JSON.stringify(save)); } catch(e) {}
    window.location.href = 'step7.html';
  });
})();