(function(){
  const back = document.getElementById('back-step6');
  if (back) back.addEventListener('click', ()=> window.location.href = 'step6.html');

  function getStep1(){ try{ const raw=localStorage.getItem('we_step1'); return raw? JSON.parse(raw): null; }catch(e){ return null; } }
  function getGoals(){
    let goals = [];

    // Prioritize we_plan_goals (most recent from Step 6) over we_step4_goals
    try{
      const v6 = localStorage.getItem('we_plan_goals');
      if (v6){
        const arr = JSON.parse(v6);
        if (Array.isArray(arr) && arr.length > 0) {
          goals = arr;
          console.log('Step 7 - Loaded goals from we_plan_goals:', goals);
          console.log('Step 7 - Raw we_plan_goals data:', v6);
        }
      }
    }catch(e){
      console.log('Step 7 - Error loading we_plan_goals:', e);
    }

    // Only fall back to we_step4_goals if we_plan_goals is empty
    if (goals.length === 0) {
      try{
        const v4 = localStorage.getItem('we_step4_goals');
        if (v4){
          const arr = JSON.parse(v4);
          if (Array.isArray(arr) && arr.length > 0) {
            goals = arr;
            console.log('Step 7 - Loaded goals from we_step4_goals:', goals);
          }
        }
      }catch(e){}
    }

    // Remove any duplicate retirement goals first, then add the correct one
    goals = goals.filter(g => !/retire/i.test(g.name));
    
    // Always add retirement goal from step4_retirement storage (most up-to-date)
    try{
      const ret = JSON.parse(localStorage.getItem('we_step4_retirement') || 'null');
      if (ret && typeof ret.corpus === 'number' && ret.corpus > 0) {
        const nowYear = new Date().getFullYear();
        const yLeft = Math.max(0, Math.round(ret.nToRet || 0));
        const retirementGoal = {
          name: 'Retirement',
          currentCost: 0,
          targetYear: nowYear + yLeft,
          yearsLeft: yLeft,
          fv: Math.round(ret.corpus),
          lumpsum: 0,
          sip: ret.sip || 0
        };
        goals = [retirementGoal, ...goals];
        console.log('Step 7 - Added retirement goal from step4_retirement storage:', retirementGoal);
        console.log(`Step 7 - Retirement data from storage:`, ret);
        console.log(`Step 7 - Calculated target year: ${nowYear} + ${yLeft} = ${nowYear + yLeft}`);
        console.log(`Step 7 - Retirement SIP from storage: ${ret.sip}, Final SIP: ${retirementGoal.sip}`);
      }
    }catch(e){
      console.log('Step 7 - Error loading retirement data:', e);
    }

    console.log('Step 7 - Final goals array:', goals);
    return goals;
  }
  function getRet(){ try{ const raw=localStorage.getItem('we_step4_retirement'); return raw? JSON.parse(raw): null; }catch(e){ return null; } }
  function getRule(){ 
    try{ 
      const raw=localStorage.getItem('we_invest_rule'); 
      const result = raw? JSON.parse(raw): { autoStepUp: 8 }; 
      console.log('Step 7 - Retrieved invest rule:', result);
      console.log('Step 7 - Step-up value:', result.autoStepUp);
      return result;
    }catch(e){ 
      console.error('Step 7 - Error retrieving invest rule:', e);
      return { autoStepUp: 8 }; 
    } 
  }

  const step1 = getStep1() || { basic:{}, income:[] };
  const goals = getGoals();
  const ret = getRet();
  const rule = getRule();

  const lifeNeed = document.getElementById('lifeNeed');
  const healthNeed = document.getElementById('healthNeed');
  const goalsBody = document.getElementById('goalsBody');
  const projHead = document.getElementById('projHead');
  const projBody = document.getElementById('projBody');

  function fmt(n){ return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n))}`; }

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

  // Insurance summary
  (function(){
    const incomeMonthly = (step1.income||[]).reduce((a,x)=> a + (x.value||0), 0);
    const annual = incomeMonthly * 12;
    
    // City logic for health insurance (same as Step 3)
    const metroCities = ['mumbai','delhi','kolkata','chennai','bengaluru','bangalore','pune','hyderabad','ahmedabad'];
    const city = (step1.basic && step1.basic.city ? String(step1.basic.city) : '').toLowerCase();
    const isMetro = metroCities.includes(city);
    const healthMultiplier = isMetro ? 1.3 : 1.1;
    
    // Insurance gap analysis (same as Step 3)
    const existingTermInsurance = (step1.insurances || [])
      .filter(ins => ins.type && ins.type.toLowerCase() === 'term')
      .reduce((sum, ins) => sum + (ins.sum || 0), 0);
    
    const existingHealthInsurance = (step1.insurances || [])
      .filter(ins => ins.type && ins.type.toLowerCase() === 'health')
      .reduce((sum, ins) => sum + (ins.sum || 0), 0);

    const lifeCoverGap = Math.max(0, annual * 15 - existingTermInsurance);
    const healthCoverGap = Math.max(0, annual * healthMultiplier - existingHealthInsurance);
    
    if (lifeNeed) lifeNeed.textContent = fmt(lifeCoverGap);
    if (healthNeed) healthNeed.textContent = fmt(healthCoverGap);
  })();

  // Editable table
  const now = new Date().getFullYear();
  let isInitialLoad = true; // Flag to prevent recalculation on initial load
  
  function renderTable(){
    if (!goalsBody) return;
    goalsBody.innerHTML = '';
    goals.forEach((g, idx)=>{
      const yLeft = Math.max(0, (g.targetYear||now) - now);
      const isEmergencyFund = (g.name || '').toLowerCase().includes('emergency');
      const exp = preRetAnnualReturn(yLeft, isEmergencyFund);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${g.name||'Goal'}</td>
        <td><input type="number" data-fv value="${Math.round(g.fv||0)}" /></td>
        <td><input type="number" data-lump value="${Math.round(g.lumpsum||0)}" /></td>
        <td><input type="number" data-year value="${g.targetYear||now}" /></td>
        <td class="right" data-tenure>${yLeft} year${yLeft !== 1 ? 's' : ''}</td>
        <td>${(exp*100).toFixed(1)}%</td>
        <td>${(rule.autoStepUp||8)}%</td>
        <td class="right" data-sip>${fmt(g.sip||0)}</td>`;
      goalsBody.appendChild(tr);
      
      // Use the exact SIP from step 6 data instead of recalculating
      // This preserves the lumpsum investment adjustments made in step 6
      const exactSip = g.sip || 0;
      const isPureLumpsum = g.isPureLumpsum || false;
      goals[idx] = { ...(goals[idx]||{}), sip: exactSip, isPureLumpsum };
      
      // Display SIP with visual indicator for pure lumpsum investments
      const sipCell = tr.querySelector('[data-sip]');
      if (isPureLumpsum) {
        sipCell.innerHTML = `<span style="color: #10b981; font-weight: bold;">${fmt(exactSip)} (Lumpsum)</span>`;
      } else {
        sipCell.textContent = fmt(exactSip);
      }
      
      console.log(`Step 7 - Loading goal "${g.name}": FV=${g.fv}, Lumpsum=${g.lumpsum}, SIP=${exactSip}, PureLumpsum=${isPureLumpsum}`);
      console.log(`Step 7 - Raw goal data:`, g);
    });
    
    // Don't call saveGoals() here as it might trigger recalculation
    // The goals array already has the correct SIP values from Step 6
    console.log('Step 7 - renderTable completed, preserving Step 6 SIP values');
  }

  function recomputeFromRow(tr){
    const fv = parseFloat((tr.querySelector('[data-fv]')||{}).value||'')||0;
    const lump = parseFloat((tr.querySelector('[data-lump]')||{}).value||'')||0;
    let tgt = parseInt((tr.querySelector('[data-year]')||{}).value||String(now),10)||now;
    let yLeft = Math.max(0, tgt - now);
    
    // Special handling for emergency fund
    const nameCell = tr.querySelector('td');
    const name = (nameCell && nameCell.textContent || '').toLowerCase();
    const isEmergencyFund = name.includes('emergency');
    if (isEmergencyFund) {
      // Keep the original target year for goal achievement (2-3 years)
      // The SIP will continue until retirement in the simulation
      console.log(`Step 7 - Emergency fund goal to be achieved in ${yLeft} years, SIP continues until retirement`);
    }
    
    const annR = preRetAnnualReturn(yLeft, isEmergencyFund);
    const i = annR/12; const n = Math.max(1, yLeft*12);
    const stepUp = Math.min(0.10, Math.max(0, (rule.autoStepUp||0)/100));
    console.log('Step 7 - calcSipForRow: autoStepUp raw:', rule.autoStepUp, 'parsed stepUp:', stepUp, 'isEmergencyFund:', isEmergencyFund);
    const fvLump = Math.max(0, lump) * Math.pow(1 + i, n);
    const need = Math.max(0, fv - fvLump);
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
    let lo=0, hi=(need>0? need/n*20+10000:0); for(let k=0;k<100;k++){ const mid=(lo+hi)/2; const got=fvFromSip(mid); if (Math.abs(got - need) < 1000) return mid; if (got>=need) hi=mid; else lo=mid; }
    tr.querySelector('[data-sip]').textContent = fmt(hi);
    
    // Update tenure display
    const tenureCell = tr.querySelector('[data-tenure]');
    if (tenureCell) {
      tenureCell.textContent = `${yLeft} year${yLeft !== 1 ? 's' : ''}`;
    }
    
    return { fv, lump, targetYear:tgt, sip: hi };
  }

  function isProtectedGoal(name){
    const n = String(name||'').toLowerCase();
    return /(retire|marriage|wedding|emergency|education|child|children)/.test(n);
  }

  function solveSipFor(fv, targetYear, lump, isEmergencyFund = false){
    const nowYear = new Date().getFullYear();
    const yLeft = Math.max(0, (targetYear||nowYear) - nowYear);
    const annR = preRetAnnualReturn(yLeft, isEmergencyFund);
    const i = annR/12; const n = Math.max(1, yLeft*12);
    const stepUp = Math.min(0.10, Math.max(0, (rule.autoStepUp||0)/100));
    const fvLump = Math.max(0, lump||0) * Math.pow(1 + i, n);
    const need = Math.max(0, (fv||0) - fvLump);
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
    let lo=0, hi=(need>0? need/n*20+10000:0); for(let k=0;k<100;k++){ const mid=(lo+hi)/2; const got=fvFromSip(mid); if (Math.abs(got - need) < 1000) return mid; if (got>=need) hi=mid; else lo=mid; }
    return hi;
  }

  function totalRequiredSip(list){
    return (list||[]).reduce((sum,g)=> {
      const isEmergencyFund = (g.name || '').toLowerCase().includes('emergency');
      return sum + (typeof g.sip==='number'? g.sip : solveSipFor(g.fv, g.targetYear, g.lumpsum||0, isEmergencyFund));
    }, 0);
  }

  function optimizeGoalsForCap(cap){
    const nowYear = new Date().getFullYear();
    const base = (goals||[]).map(g=> ({ ...g }));
    const reductions = [0.25, 0.30, 0.35];
    const extensions = [0, 1, 2];
    let bestPlan = base; let bestTotal = totalRequiredSip(base);
    for (let r of reductions){
      for (let ext of extensions){
        const trial = base.map(g=>{
          if (isProtectedGoal(g.name)) return { ...g };
          const fvNew = Math.max(0, (g.fv||0) * (1 - r));
          const yrNew = (g.targetYear||nowYear) + ext;
          const isEmergencyFund = (g.name || '').toLowerCase().includes('emergency');
          const sipNew = solveSipFor(fvNew, yrNew, g.lumpsum||0, isEmergencyFund);
          return { ...g, fv: fvNew, targetYear: yrNew, sip: sipNew };
        });
        const total = totalRequiredSip(trial);
        if (total <= cap) return trial; // fits budget
        if (total < bestTotal){ bestTotal = total; bestPlan = trial; }
      }
    }
    return bestPlan; // best attempt if none fit fully
  }
  if (goalsBody){
    goalsBody.addEventListener('input', (e)=>{
      const tr = e.target.closest('tr'); if (!tr) return;
      const idx = Array.from(goalsBody.children).indexOf(tr);
      
      // Don't recalculate during initial load
      if (isInitialLoad) {
        console.log('Step 7 - Initial load, ignoring input event to preserve Step 6 SIP values');
        return;
      }
      
      // Only recalculate if the user has actually changed a value
      console.log('Step 7 - User input detected, recalculating SIP for:', tr.querySelector('td').textContent);
      const upd = recomputeFromRow(tr);
      if (idx>=0) goals[idx] = { ...(goals[idx]||{}), ...upd };
      saveGoals();
      drawChart(); renderProjection();
    });
  }

  function saveGoals(){ try{ localStorage.setItem('we_step6_goals', JSON.stringify(goals)); }catch(e){} }

  // Month-by-month simulation engine
  let chart;

  function runSimulation(capAmount){
    const userAge = parseInt((step1.basic && step1.basic.age) || '25', 10) || 25;
    const stepUpRate = Math.max(0,(rule.autoStepUp||0)/100);
    console.log('Step 7 - runSimulation: autoStepUp raw:', rule.autoStepUp, 'parsed stepUpRate:', stepUpRate);

    function tenureYearsFor(g){ 
      const name = (g.name || '').toLowerCase();
      const isEmergencyFund = name.includes('emergency');
      
      if (isEmergencyFund) {
        // Emergency fund SIP continues until retirement (even though goal is achieved in 2-3 years)
        const retirementAge = step1.basic && step1.basic.retirementAge ? step1.basic.retirementAge : 60;
        const currentAge = step1.basic && step1.basic.age ? step1.basic.age : 25;
        return Math.max(1, retirementAge - currentAge);
      }
      
      return Math.max(0, (g.targetYear||now) - now); 
    }
    const simGoals = (goals||[]).map((g,i)=>{
      const exactSip = g.sip || 0;
      console.log(`Step 7 - Simulation: Goal "${g.name}", using exact SIP: ${exactSip}`);
      return {
        id: (g.name||('g'+i)).toLowerCase().replace(/\s+/g,'-'),
        name: g.name || ('Goal ' + (i+1)),
        initialSip: Math.max(0, exactSip),
        currentYearlyBaseSip: Math.max(0, exactSip),
        balance: Math.max(0, g.lumpsum||0), // Start with lumpsum investment
        returnRate: preRetAnnualReturn(tenureYearsFor(g), g.isEmergencyFund) / 12,
        tenureYears: tenureYearsFor(g),
        effectiveFirstMonthSip: 0,
        isCompleted: false,
        lumpsum: Math.max(0, g.lumpsum||0), // Store lumpsum for reference
        isPureLumpsum: g.isPureLumpsum || false, // Track if this is a pure lumpsum investment
        isEmergencyFund: (g.name || '').toLowerCase().includes('emergency'),
        targetYear: g.targetYear || now // Store original target year for emergency fund logic
      };
    }).filter(g => g.tenureYears > 0 && (g.initialSip > 0 || g.lumpsum > 0));

    const maxSimYears = Math.max(1, simGoals.reduce((m,g)=> Math.max(m, g.tenureYears), 0));
    const totalSimMonths = maxSimYears * 12;

    const wealthCreation = { name:'Wealth Creation', balance:0, returnRate: 0.12/12 };

    const labels = [];
    const datasets = simGoals.map((g,i)=>({ 
      label: g.isPureLumpsum ? `${g.name} (Lumpsum)` : g.name, 
      data: [], 
      backgroundColor: ['#1f78b4','#33a02c','#e31a1c','#ff7f00','#6a3d9a','#b15928','#a6cee3'][i%7], 
      stack:'stack' 
    }));
    datasets.push({ label:'Wealth Creation', data: [], backgroundColor:'#FFD700', stack:'stack' });
    const tableRows = [];

    for (let i=0;i<totalSimMonths;i++){
      const currentSimMonth = i + 1;
      const currentSimYearIndex = Math.floor(i / 12);
      const currentAgeAtStartOfYear = userAge + currentSimYearIndex;
      const isStartOfNewYear = (currentSimMonth % 12 === 1);

      if (isStartOfNewYear && currentSimYearIndex > 0){
        simGoals.forEach(goal => {
          if (currentSimYearIndex < goal.tenureYears) {
            // For emergency funds, stop step-up once the original goal tenure is reached
            if (goal.isEmergencyFund) {
              const originalGoalTenure = Math.max(0, (goal.targetYear||now) - now);
              if (currentSimYearIndex < originalGoalTenure) {
                // Apply step-up only during the original goal period
                goal.currentYearlyBaseSip = goal.initialSip * Math.pow(1 + stepUpRate, currentSimYearIndex);
                console.log(`Step 7 - Year ${currentSimYearIndex + 1}: Emergency Fund "${goal.name}" SIP updated to ${goal.currentYearlyBaseSip} (step-up: ${stepUpRate})`);
              } else {
                // Keep the last step-up amount (no further increases)
                const lastStepUpAmount = goal.initialSip * Math.pow(1 + stepUpRate, originalGoalTenure - 1);
                goal.currentYearlyBaseSip = lastStepUpAmount;
                console.log(`Step 7 - Year ${currentSimYearIndex + 1}: Emergency Fund "${goal.name}" SIP kept at ${goal.currentYearlyBaseSip} (no step-up after goal completion)`);
              }
            } else {
              // Apply step-up to non-emergency goals normally
              goal.currentYearlyBaseSip = goal.initialSip * Math.pow(1 + stepUpRate, currentSimYearIndex);
              console.log(`Step 7 - Year ${currentSimYearIndex + 1}: Goal "${goal.name}" SIP updated to ${goal.currentYearlyBaseSip} (step-up: ${stepUpRate})`);
            }
          }
        });
      }

      let totalPotentialSipForProportioning = 0;
      let totalRedirectedSipForMonth = 0;
      simGoals.forEach(goal => {
        if (currentSimMonth <= goal.tenureYears * 12) totalPotentialSipForProportioning += goal.currentYearlyBaseSip;
        else totalRedirectedSipForMonth += goal.currentYearlyBaseSip;
      });

      const totalSipBeforeCap = totalPotentialSipForProportioning + totalRedirectedSipForMonth;
      let actualMonthlySipToInvest = totalSipBeforeCap;
      let scalingFactor = 1;
      if (typeof capAmount === 'number' && capAmount >= 0 && totalSipBeforeCap > 0 && capAmount < totalSipBeforeCap) {
        actualMonthlySipToInvest = capAmount;
        scalingFactor = capAmount / totalSipBeforeCap;
      }

      let actualInvestedInGoalsThisMonth = 0;
      simGoals.forEach(goal => {
        let contribution = 0;
        if (currentSimMonth <= goal.tenureYears * 12) {
          if (totalPotentialSipForProportioning > 0) contribution = goal.currentYearlyBaseSip * scalingFactor;
          actualInvestedInGoalsThisMonth += contribution;
          const interest = (goal.balance + contribution) * goal.returnRate;
          goal.balance += contribution + interest;
        }
        if (i===0) goal.effectiveFirstMonthSip = contribution;
      });

      const wcContribution = actualMonthlySipToInvest - actualInvestedInGoalsThisMonth;
      const wcInterest = (wealthCreation.balance + wcContribution) * wealthCreation.returnRate;
      wealthCreation.balance += wcContribution + wcInterest;

      if (currentSimMonth % 12 === 0){
        labels.push('Age ' + (currentAgeAtStartOfYear + 1));
        simGoals.forEach((g,idx)=>{
          const isCompletedYear = (currentSimYearIndex + 1) > g.tenureYears;
          datasets[idx].data.push(isCompletedYear ? 0 : g.balance);
        });
        datasets[datasets.length-1].data.push(wealthCreation.balance);

        const row = {
          year: currentSimYearIndex + 1,
          age: currentAgeAtStartOfYear + 1,
          totalSip: actualMonthlySipToInvest,
          goalBalances: simGoals.map(g => (currentSimYearIndex + 1 > g.tenureYears) ? 0 : g.balance),
          wealthCreationBalance: wealthCreation.balance,
          totalCorpus: simGoals.reduce((acc,g)=> acc + ((currentSimYearIndex + 1 > g.tenureYears) ? 0 : g.balance), 0) + wealthCreation.balance
        };
        
        // Debug logging for SIP amounts
        if (currentSimYearIndex < 3) { // Log first few years for debugging
          console.log(`Year ${currentSimYearIndex + 1} SIP Debug:`, {
            actualMonthlySipToInvest: actualMonthlySipToInvest,
            totalPotentialSipForProportioning: totalPotentialSipForProportioning,
            totalRedirectedSipForMonth: totalRedirectedSipForMonth,
            scalingFactor: scalingFactor
          });
        }
        
        // Debug logging for total corpus calculation
        if (currentSimYearIndex < 3) { // Log first few years for debugging
          console.log(`Year ${currentSimYearIndex + 1}:`, {
            goalBalances: row.goalBalances,
            wealthCreationBalance: row.wealthCreationBalance,
            totalCorpus: row.totalCorpus
          });
        }
        tableRows.push(row);
      }
    }

    return { labels, datasets, rows: tableRows };
  }
  function datasetsForChart(){
    const startAge = parseInt((step1.basic && step1.basic.age) || '25', 10) || 25;
    const years = 35; const labels = Array.from({length:years}, function(_,i){ return 'Age ' + (startAge+i); });
    const colors = ['#3b82f6','#22c55e','#ef4444','#f59e0b','#eab308'];
    const ds = [];
    const wealthContrib = new Array(years).fill(0);
    const wealthCorpus = new Array(years).fill(0);
    const wealthRate = 0.12; // long-term assumption
    const step = Math.max(0,(rule.autoStepUp||0)/100);
    console.log('Step 7 - drawChart: autoStepUp raw:', rule.autoStepUp, 'parsed step:', step);
    const monthlySIPSeries = new Array(years).fill(0);

    function endIndexForGoal(g){
      const name = (g.name || '').toLowerCase();
      const isEmergencyFund = name.includes('emergency');
      
      if (isEmergencyFund) {
        // Emergency fund SIP continues until retirement (even though goal is achieved in 2-3 years)
        const retirementAge = step1.basic && step1.basic.retirementAge ? step1.basic.retirementAge : 60;
        const currentAge = step1.basic && step1.basic.age ? step1.basic.age : 25;
        const diff = Math.max(1, retirementAge - currentAge);
        return Math.min(years-1, diff);
      }
      
      // Trust the goal's targetYear (from Step 6 row), not stored nToRet, to match UI
      const diff = Math.max(0, (g.targetYear||now) - now);
      return Math.min(years-1, diff);
    }

    // Build per-goal balances over time (corpus), redirecting SIP to wealth after target year
    const goalSeries = goals.map(function(g, gi){
      const arr = new Array(years).fill(0);
      const endK = endIndexForGoal(g);
      const r = preRetAnnualReturn(endK, g.isEmergencyFund);
      let bal = Math.max(0, g.lumpsum||0); // Start with lumpsum investment
      
      // Use the exact SIP amount from Step 6, don't recalculate
      const exactSip = g.sip || 0;
      console.log(`Step 7 - Chart: Goal "${g.name}", using exact SIP: ${exactSip}, step-up: ${step}`);
      
      for (let k=0; k<years; k++){
        // Calculate monthly SIP with step-up logic
        let monthlySipAtK;
        const isEmergencyFund = (g.name || '').toLowerCase().includes('emergency');
        
        if (isEmergencyFund) {
          const originalGoalTenure = Math.max(0, (g.targetYear||now) - now);
          if (k < originalGoalTenure) {
            // Apply step-up during original goal period
            monthlySipAtK = exactSip * Math.pow(1+step, k);
          } else {
            // Keep the last step-up amount (no further increases)
            monthlySipAtK = exactSip * Math.pow(1+step, originalGoalTenure - 1);
          }
        } else {
          // Apply step-up normally for non-emergency goals
          monthlySipAtK = exactSip * Math.pow(1+step, k);
        }
        
        const annualAtK = monthlySipAtK * 12;
        if (k <= endK) {
          // Use monthly compounding to match simulation logic
          const monthlyRate = r / 12;
          for (let m = 0; m < 12; m++) {
            bal = bal * (1 + monthlyRate) + monthlySipAtK;
          }
          arr[k] = bal;
          monthlySIPSeries[k] += monthlySipAtK; // active monthly SIP this year
        } else {
          arr[k] = 0; // spent at completion
          const contK = endK; // continue from last active year level forward
          const redirectedMonthly = exactSip * Math.pow(1+step, contK);
          const redirectedAnnual = redirectedMonthly * 12;
          wealthContrib[k] += redirectedAnnual; // redirect constant post-goal
        }
      }
      const label = g.isPureLumpsum ? `${g.name||('Goal ' + (gi+1))} (Lumpsum)` : (g.name||('Goal ' + (gi+1)));
      return { label: label, data: arr, backgroundColor: colors[gi%4], borderRadius:4, stack:'stack' };
    });

    // Convert wealth redirected contributions into wealth corpus over time with monthly compounding
    let wealthBal = 0;
    for (let k=0; k<years; k++){
      const monthlyWealthRate = wealthRate / 12;
      const monthlyContrib = (wealthContrib[k]||0) / 12;
      for (let m = 0; m < 12; m++) {
        wealthBal = wealthBal * (1 + monthlyWealthRate) + monthlyContrib;
      }
      wealthCorpus[k] = wealthBal;
    }

    goalSeries.forEach(function(s){ ds.push(s); });
    ds.push({ label:'Wealth Creation', data: wealthCorpus, backgroundColor: colors[4], borderRadius:4, stack:'stack' });
    return { labels: labels, datasets: ds, monthlySIPSeries: monthlySIPSeries, goalCorpusSeries: goalSeries.map(s=> s.data), wealthCorpus: wealthCorpus };
  }

  function drawChart(sim){
    const ctx = document.getElementById('growthChart'); if (!ctx) return;
    const data = sim || runSimulation();
    if (chart) chart.destroy();
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    // eslint-disable-next-line no-undef
    const cfg = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
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
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                return context.dataset.label + ': ' + fmt(context.parsed.y);
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: isDarkMode ? '#9ca3af' : '#6b7280' },
            grid: { color: isDarkMode ? '#374151' : '#e5e7eb' }
          },
          y: {
            stacked: true,
            ticks: {
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              callback: function(v){
                if (v>=1e7) return '₹' + (v/1e7).toFixed(0) + ' Cr';
                if (v>=1e5) return '₹' + (v/1e5).toFixed(0) + ' L';
                return '₹' + v;
              }
            },
            grid: { color: isDarkMode ? '#374151' : '#e5e7eb' }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    };
    chart = new Chart(ctx, cfg);
    renderLegend();
  }

  function renderLegend(){
    const legendBox = document.getElementById('legend'); if (!legendBox || !chart) return;
    legendBox.innerHTML = '';
    chart.data.datasets.forEach((ds, i)=>{
      const el = document.createElement('button');
      el.className = 'item';
      
      // Hide Wealth Creation by default
      if (ds.label === 'Wealth Creation') {
        el.classList.add('hidden');
        const meta = chart.getDatasetMeta(i);
        meta.hidden = true;
      }
      
      el.innerHTML = `<span class="swatch" style="background:${ds.backgroundColor}"></span><span class="label">${ds.label}</span>`;
      el.onclick = ()=>{ const m = chart.getDatasetMeta(i); m.hidden = m.hidden === null ? !chart.data.datasets[i].hidden : null; chart.update(); el.classList.toggle('hidden'); };
      legendBox.appendChild(el);
    });
    
    // Update the chart to reflect the hidden Wealth Creation dataset
    chart.update();
    
    const reset = document.getElementById('resetChart'); if (reset) reset.onclick = ()=> { chart.data.datasets.forEach((_,i)=> chart.getDatasetMeta(i).hidden = null); legendBox.querySelectorAll('.item').forEach(n=> n.classList.remove('hidden')); chart.update(); };
  }


  // Projection table
  function renderProjection(sim){
    const startAge = parseInt((step1.basic && step1.basic.age) || '25', 10) || 25;
    const out = sim || runSimulation();
    const years = out.rows.length; 
    const heads = ['YEAR','AGE','TOTAL SIP'].concat(goals.map(function(g){ 
      const baseName = (g.name||'Goal').toUpperCase();
      const name = (g.name || '').toLowerCase();
      const isEmergencyFund = name.includes('emergency');
      
      if (isEmergencyFund) {
        // Emergency fund continues until retirement
        const retirementAge = step1.basic && step1.basic.retirementAge ? step1.basic.retirementAge : 60;
        const currentAge = step1.basic && step1.basic.age ? step1.basic.age : 25;
        const tenure = Math.max(1, retirementAge - currentAge);
        return `${baseName} (${tenure}Y)`;
      }
      
      const tenure = Math.max(0, (g.targetYear||now) - now);
      return g.isPureLumpsum ? `${baseName} (LUMPSUM)` : `${baseName} (${tenure}Y)`;
    })).concat(['WEALTH CREATION','TOTAL CORPUS']);
    projHead.innerHTML = `<tr>${heads.map(h=> `<th>${h}</th>`).join('')}</tr>`;
    projBody.innerHTML = '';
    for (let k=0;k<years;k++){
      const yr = now + k; const age = startAge + k;
      const row = out.rows[k];
      
      // Debug logging for first few rows
      if (k < 3) {
        console.log(`Projection Row ${k + 1}:`, {
          year: yr,
          age: age,
          totalSip: row.totalSip,
          goalBalances: row.goalBalances,
          wealthCreationBalance: row.wealthCreationBalance,
          totalCorpus: row.totalCorpus
        });
      }
      
      // Create SIP breakdown tooltip for this year
      const activeGoals = goals.filter((g, idx) => {
        const goalTenure = Math.max(0, (g.targetYear||now) - now);
        const isEmergencyFund = (g.name || '').toLowerCase().includes('emergency');
        // Emergency funds continue indefinitely, other goals stop at target year
        return isEmergencyFund || k < goalTenure;
      });
      
      const sipBreakdown = activeGoals.map((g, idx) => {
        const goalSip = g.sip || 0;
        const stepUpRate = Math.min(0.10, Math.max(0, (rule.autoStepUp||0)/100));
        const isEmergencyFund = (g.name || '').toLowerCase().includes('emergency');
        
        let yearSip;
        if (isEmergencyFund) {
          const originalGoalTenure = Math.max(0, (g.targetYear||now) - now);
          if (k < originalGoalTenure) {
            // Apply step-up during original goal period
            yearSip = goalSip * Math.pow(1 + stepUpRate, k);
          } else {
            // Keep the last step-up amount (no further increases)
            yearSip = goalSip * Math.pow(1 + stepUpRate, originalGoalTenure - 1);
          }
        } else {
          // Apply step-up normally for non-emergency goals
          yearSip = goalSip * Math.pow(1 + stepUpRate, k);
        }
        
        const goalName = g.name || `Goal ${idx + 1}`;
        return `${goalName}: ${fmt(yearSip)}`;
      });
      
      // Add wealth creation SIP if there are completed goals (excluding emergency funds)
      const completedGoals = goals.filter((g, idx) => {
        const goalTenure = Math.max(0, (g.targetYear||now) - now);
        const isEmergencyFund = (g.name || '').toLowerCase().includes('emergency');
        // Only non-emergency goals contribute to wealth creation when completed
        return !isEmergencyFund && k >= goalTenure;
      });

      if (completedGoals.length > 0) {
        const wealthCreationSip = completedGoals.reduce((total, g) => {
          const goalSip = g.sip || 0;
          const stepUpRate = Math.min(0.10, Math.max(0, (rule.autoStepUp||0)/100));
          const goalTenure = Math.max(0, (g.targetYear||now) - now);

          // For completed goals, use the SIP stepped up to the completion year, not current year
          // This matches the simulation logic where currentYearlyBaseSip is stepped up during tenure
          // and then maintained at the last step-up amount after completion
          const yearSip = goalSip * Math.pow(1 + stepUpRate, goalTenure);

          return total + yearSip;
        }, 0);

        if (wealthCreationSip > 0) {
          sipBreakdown.push(`Wealth Creation: ${fmt(wealthCreationSip)}`);
        }
      }
      
      const tooltipText = sipBreakdown.length > 0 
        ? `SIP Breakdown (Year ${k + 1}):\n${sipBreakdown.join('\n')}`
        : `No active SIPs in Year ${k + 1}`;
      
      const tds = [`${yr}`, `${age}`, fmt(row.totalSip||0)].concat(row.goalBalances.map(function(v){ return fmt(v); })).concat([fmt(row.wealthCreationBalance||0), fmt(row.totalCorpus||0)]);
      const tr = document.createElement('tr'); 
      tr.innerHTML = tds.map(function(v, idx){ 
        if (idx === 2) { // Total SIP column
          return `<td class="sip-tooltip" data-tooltip="${tooltipText}">${v}</td>`;
        }
        return `<td>${v}</td>`; 
      }).join(''); 
      projBody.appendChild(tr);
    }
  }

  // init
  renderTable(); const base = runSimulation(); drawChart(base); renderProjection(base);
  
  // Mark initial load as complete
  isInitialLoad = false;
  console.log('Step 7 - Initial load completed, user inputs will now trigger recalculation');

  // Tab switching logic for What-If Analysis
  function initWhatIfTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // Add active to clicked
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) selectedTab.classList.add('active');

        // Hide results when switching tabs
        hideWhatIfResults();
      });
    });
  }

  // Hide what-if results summary
  function hideWhatIfResults() {
    const resultsDiv = document.getElementById('whatifResults');
    if (resultsDiv) resultsDiv.style.display = 'none';
  }

  // Display what-if results summary
  function displayWhatIfResults(impactSummary, scenarioType) {
    const resultsDiv = document.getElementById('whatifResults');
    const summaryDiv = document.getElementById('resultsSummary');
    if (!resultsDiv || !summaryDiv) return;

    let html = '';
    if (scenarioType === 'jobLoss') {
      const s = impactSummary;
      const shortfallClass = s.shortfall > 0 ? 'negative' : 'positive';
      const impactClass = s.percentageImpact > 15 ? 'negative' : s.percentageImpact > 8 ? 'warning' : 'positive';

      html = `
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
          <h3 style="color: #667eea; margin-bottom: 16px; font-size: 18px;">📊 Job Loss Impact Analysis</h3>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Job Loss Scenario</div>
              <div style="font-size: 16px; font-weight: bold; color: #111827;">${s.monthsWithoutJob} months at age ${s.age}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Monthly Expenses</div>
              <div style="font-size: 16px; font-weight: bold; color: #111827;">${fmt(s.monthlyExpenses)}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Total Expenses</div>
              <div style="font-size: 16px; font-weight: bold; color: #111827;">${fmt(s.totalExpenses)}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Missed SIP Contributions</div>
              <div style="font-size: 16px; font-weight: bold; color: #dc2626;">${fmt(s.missedSIP)}</div>
            </div>
          </div>

          <h4 style="color: #374151; margin: 16px 0 12px 0; font-size: 15px;">💰 Emergency Fund Status</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">EF Before Job Loss</div>
              <div style="font-size: 16px; font-weight: bold; color: #111827;">${fmt(s.emergencyFundBefore)}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">EF Used</div>
              <div style="font-size: 16px; font-weight: bold; color: #f59e0b;">${fmt(s.emergencyFundUsed)}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Shortfall</div>
              <div style="font-size: 16px; font-weight: bold; color: ${s.shortfall > 0 ? '#dc2626' : '#059669'};">${fmt(s.shortfall)}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Months Covered</div>
              <div style="font-size: 16px; font-weight: bold; color: #111827;">${s.monthsCovered.toFixed(1)} / ${s.monthsWithoutJob}</div>
            </div>
          </div>

          <h4 style="color: #374151; margin: 16px 0 12px 0; font-size: 15px;">📈 Long-Term Impact (by Age ${59})</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Years to Age 59</div>
              <div style="font-size: 16px; font-weight: bold; color: #111827;">${s.yearsTo59} years</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">FV of Missed SIP</div>
              <div style="font-size: 16px; font-weight: bold; color: #dc2626;">${fmt(s.fvMissedSIP)}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">FV of EF Withdrawal</div>
              <div style="font-size: 16px; font-weight: bold; color: #dc2626;">${fmt(s.fvEFWithdrawal)}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Total Corpus Impact</div>
              <div style="font-size: 16px; font-weight: bold; color: #dc2626;">${fmt(s.totalCorpusImpact)}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Final Corpus (Without Job Loss)</div>
              <div style="font-size: 16px; font-weight: bold; color: #059669;">${fmt(s.finalCorpusWithoutJobLoss)}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Projected Corpus at 59</div>
              <div style="font-size: 16px; font-weight: bold; color: #f59e0b;">${fmt(s.projectedCorpusAt59)}</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Percentage Impact</div>
              <div style="font-size: 20px; font-weight: bold; color: ${s.percentageImpact > 15 ? '#dc2626' : s.percentageImpact > 8 ? '#f59e0b' : '#059669'};">${s.percentageImpact.toFixed(2)}%</div>
            </div>
          </div>

          ${s.shortfall > 0 ? `
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; margin-top: 16px;">
              <strong style="color: #991b1b;">⚠️ Warning:</strong>
              <span style="color: #7f1d1d;">Emergency fund insufficient! You'll need ${fmt(s.shortfall)} from other sources.</span>
            </div>
          ` : `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; margin-top: 16px;">
              <strong style="color: #166534;">✅ Good News:</strong>
              <span style="color: #14532d;">Your emergency fund fully covers this ${s.monthsWithoutJob}-month period!</span>
            </div>
          `}
        </div>
      `;
    } else if (scenarioType === 'raise') {
      html = `
        <div class="result-item positive">
          <span class="label">Extra Monthly Investment:</span>
          <span class="value">${fmt(impactSummary.extraMonthlyInvestment || 0)}</span>
        </div>
        <div class="result-item positive">
          <span class="label">Estimated Corpus Gain:</span>
          <span class="value">${fmt(impactSummary.corpusGain || 0)}</span>
        </div>
        <div class="result-item">
          <span class="label">Raise Applied From:</span>
          <span class="value">Age ${impactSummary.age || 0}</span>
        </div>
      `;
    }

    summaryDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
  }

  // Job Loss Simulation
  function runSimulationWithJobLoss(startMonth, durationMonths) {
    const userAge = parseInt((step1.basic && step1.basic.age) || '25', 10) || 25;
    const stepUpRate = Math.max(0,(rule.autoStepUp||0)/100);

    function tenureYearsFor(g){
      const name = (g.name || '').toLowerCase();
      const isEmergencyFund = name.includes('emergency');

      if (isEmergencyFund) {
        const retirementAge = step1.basic && step1.basic.retirementAge ? step1.basic.retirementAge : 60;
        const currentAge = step1.basic && step1.basic.age ? step1.basic.age : 25;
        return Math.max(1, retirementAge - currentAge);
      }

      return Math.max(0, (g.targetYear||now) - now);
    }

    const simGoals = (goals||[]).map((g,i)=>{
      const exactSip = g.sip || 0;
      return {
        id: (g.name||('g'+i)).toLowerCase().replace(/\s+/g,'-'),
        name: g.name || ('Goal ' + (i+1)),
        initialSip: Math.max(0, exactSip),
        currentYearlyBaseSip: Math.max(0, exactSip),
        balance: Math.max(0, g.lumpsum||0),
        returnRate: preRetAnnualReturn(tenureYearsFor(g), g.isEmergencyFund) / 12,
        tenureYears: tenureYearsFor(g),
        effectiveFirstMonthSip: 0,
        isCompleted: false,
        lumpsum: Math.max(0, g.lumpsum||0),
        isPureLumpsum: g.isPureLumpsum || false,
        isEmergencyFund: (g.name || '').toLowerCase().includes('emergency'),
        targetYear: g.targetYear || now
      };
    }).filter(g => g.tenureYears > 0 && (g.initialSip > 0 || g.lumpsum > 0));

    const maxSimYears = Math.max(1, simGoals.reduce((m,g)=> Math.max(m, g.tenureYears), 0));
    const totalSimMonths = maxSimYears * 12;

    const wealthCreation = { name:'Wealth Creation', balance:0, returnRate: 0.12/12 };

    const labels = [];
    const datasets = simGoals.map((g,i)=>({
      label: g.isPureLumpsum ? `${g.name} (Lumpsum)` : g.name,
      data: [],
      backgroundColor: ['#1f78b4','#33a02c','#e31a1c','#ff7f00','#6a3d9a','#b15928','#a6cee3'][i%7],
      stack:'stack'
    }));
    datasets.push({ label:'Wealth Creation', data: [], backgroundColor:'#FFD700', stack:'stack' });
    const tableRows = [];

    let emergencyFundUsed = 0;
    const endMonth = startMonth + durationMonths;

    for (let i=0;i<totalSimMonths;i++){
      const currentSimMonth = i + 1;
      const currentSimYearIndex = Math.floor(i / 12);
      const currentAgeAtStartOfYear = userAge + currentSimYearIndex;
      const isStartOfNewYear = (currentSimMonth % 12 === 1);
      const isJobLossPeriod = (i >= startMonth && i < endMonth);

      if (isStartOfNewYear && currentSimYearIndex > 0){
        simGoals.forEach(goal => {
          if (currentSimYearIndex < goal.tenureYears) {
            if (goal.isEmergencyFund) {
              const originalGoalTenure = Math.max(0, (goal.targetYear||now) - now);
              if (currentSimYearIndex < originalGoalTenure) {
                goal.currentYearlyBaseSip = goal.initialSip * Math.pow(1 + stepUpRate, currentSimYearIndex);
              } else {
                const lastStepUpAmount = goal.initialSip * Math.pow(1 + stepUpRate, originalGoalTenure - 1);
                goal.currentYearlyBaseSip = lastStepUpAmount;
              }
            } else {
              goal.currentYearlyBaseSip = goal.initialSip * Math.pow(1 + stepUpRate, currentSimYearIndex);
            }
          }
        });
      }

      let totalPotentialSipForProportioning = 0;
      let totalRedirectedSipForMonth = 0;
      simGoals.forEach(goal => {
        if (currentSimMonth <= goal.tenureYears * 12) totalPotentialSipForProportioning += goal.currentYearlyBaseSip;
        else totalRedirectedSipForMonth += goal.currentYearlyBaseSip;
      });

      const totalSipBeforeCap = totalPotentialSipForProportioning + totalRedirectedSipForMonth;
      let actualMonthlySipToInvest = isJobLossPeriod ? 0 : totalSipBeforeCap;
      let scalingFactor = isJobLossPeriod ? 0 : 1;

      let actualInvestedInGoalsThisMonth = 0;
      simGoals.forEach(goal => {
        let contribution = 0;
        if (currentSimMonth <= goal.tenureYears * 12) {
          if (totalPotentialSipForProportioning > 0) contribution = goal.currentYearlyBaseSip * scalingFactor;
          actualInvestedInGoalsThisMonth += contribution;
          const interest = (goal.balance + contribution) * goal.returnRate;
          goal.balance += contribution + interest;
        }
        if (i===0) goal.effectiveFirstMonthSip = contribution;
      });

      const wcContribution = actualMonthlySipToInvest - actualInvestedInGoalsThisMonth;
      const wcInterest = (wealthCreation.balance + wcContribution) * wealthCreation.returnRate;
      wealthCreation.balance += wcContribution + wcInterest;

      // Track emergency fund usage during job loss
      if (isJobLossPeriod) {
        const emergencyGoal = simGoals.find(g => g.isEmergencyFund);
        if (emergencyGoal) {
          // CRITICAL: Monthly expenses = Emergency Fund Balance / 12
          // This is the correct formula as emergency fund = 12 months of expenses
          const emergencyFundBalance = emergencyGoal.balance > 0 ? emergencyGoal.balance : (emergencyGoal.lumpsum || 0);
          const monthlyExpenses = emergencyFundBalance / 12;

          // Withdraw from emergency fund to cover expenses
          const withdrawal = Math.min(monthlyExpenses, emergencyGoal.balance);
          emergencyGoal.balance = Math.max(0, emergencyGoal.balance - withdrawal);
          emergencyFundUsed += withdrawal;
        }
      }

      if (currentSimMonth % 12 === 0){
        labels.push('Age ' + (currentAgeAtStartOfYear + 1));
        simGoals.forEach((g,idx)=>{
          const isCompletedYear = (currentSimYearIndex + 1) > g.tenureYears;
          datasets[idx].data.push(isCompletedYear ? 0 : g.balance);
        });
        datasets[datasets.length-1].data.push(wealthCreation.balance);

        const row = {
          year: currentSimYearIndex + 1,
          age: currentAgeAtStartOfYear + 1,
          totalSip: actualMonthlySipToInvest,
          goalBalances: simGoals.map(g => (currentSimYearIndex + 1 > g.tenureYears) ? 0 : g.balance),
          wealthCreationBalance: wealthCreation.balance,
          totalCorpus: simGoals.reduce((acc,g)=> acc + ((currentSimYearIndex + 1 > g.tenureYears) ? 0 : g.balance), 0) + wealthCreation.balance
        };
        tableRows.push(row);
      }
    }

    return { labels, datasets, rows: tableRows, emergencyFundUsed };
  }

  // Salary Raise Simulation
  function runSimulationWithRaise(raisePercent, startYear, allocationStrategy) {
    const userAge = parseInt((step1.basic && step1.basic.age) || '25', 10) || 25;
    const stepUpRate = Math.max(0,(rule.autoStepUp||0)/100);

    // Calculate initial total SIP and extra SIP from raise
    const initialTotalSip = totalRequiredSip(goals);
    const initialExtraSip = initialTotalSip * (raisePercent / 100);

    function tenureYearsFor(g){
      const name = (g.name || '').toLowerCase();
      const isEmergencyFund = name.includes('emergency');

      if (isEmergencyFund) {
        const retirementAge = step1.basic && step1.basic.retirementAge ? step1.basic.retirementAge : 60;
        const currentAge = step1.basic && step1.basic.age ? step1.basic.age : 25;
        return Math.max(1, retirementAge - currentAge);
      }

      return Math.max(0, (g.targetYear||now) - now);
    }

    const simGoals = (goals||[]).map((g,i)=>{
      const exactSip = g.sip || 0;
      return {
        id: (g.name||('g'+i)).toLowerCase().replace(/\s+/g,'-'),
        name: g.name || ('Goal ' + (i+1)),
        initialSip: Math.max(0, exactSip),
        currentYearlyBaseSip: Math.max(0, exactSip),
        balance: Math.max(0, g.lumpsum||0),
        returnRate: preRetAnnualReturn(tenureYearsFor(g), g.isEmergencyFund) / 12,
        tenureYears: tenureYearsFor(g),
        effectiveFirstMonthSip: 0,
        isCompleted: false,
        lumpsum: Math.max(0, g.lumpsum||0),
        isPureLumpsum: g.isPureLumpsum || false,
        isEmergencyFund: (g.name || '').toLowerCase().includes('emergency'),
        targetYear: g.targetYear || now
      };
    }).filter(g => g.tenureYears > 0 && (g.initialSip > 0 || g.lumpsum > 0));

    const maxSimYears = Math.max(1, simGoals.reduce((m,g)=> Math.max(m, g.tenureYears), 0));
    const totalSimMonths = maxSimYears * 12;

    const wealthCreation = { name:'Wealth Creation', balance:0, returnRate: 0.12/12 };

    const labels = [];
    const datasets = simGoals.map((g,i)=>({
      label: g.isPureLumpsum ? `${g.name} (Lumpsum)` : g.name,
      data: [],
      backgroundColor: ['#1f78b4','#33a02c','#e31a1c','#ff7f00','#6a3d9a','#b15928','#a6cee3'][i%7],
      stack:'stack'
    }));
    datasets.push({ label:'Wealth Creation', data: [], backgroundColor:'#FFD700', stack:'stack' });
    const tableRows = [];

    const raiseStartMonth = (startYear - 1) * 12;
    const raiseStartYear = startYear - 1;

    // Track the extra SIP amount (will grow with step-up after raise year)
    let currentExtraSip = 0;

    for (let i=0;i<totalSimMonths;i++){
      const currentSimMonth = i + 1;
      const currentSimYearIndex = Math.floor(i / 12);
      const currentAgeAtStartOfYear = userAge + currentSimYearIndex;
      const isStartOfNewYear = (currentSimMonth % 12 === 1);
      const hasRaise = (i >= raiseStartMonth);

      if (isStartOfNewYear && currentSimYearIndex > 0){
        simGoals.forEach(goal => {
          if (currentSimYearIndex < goal.tenureYears) {
            if (goal.isEmergencyFund) {
              const originalGoalTenure = Math.max(0, (goal.targetYear||now) - now);
              if (currentSimYearIndex < originalGoalTenure) {
                goal.currentYearlyBaseSip = goal.initialSip * Math.pow(1 + stepUpRate, currentSimYearIndex);
              } else {
                const lastStepUpAmount = goal.initialSip * Math.pow(1 + stepUpRate, originalGoalTenure - 1);
                goal.currentYearlyBaseSip = lastStepUpAmount;
              }
            } else {
              goal.currentYearlyBaseSip = goal.initialSip * Math.pow(1 + stepUpRate, currentSimYearIndex);
            }
          }
        });

        // Apply step-up to extra SIP from raise (starts from raise year)
        if (hasRaise) {
          const yearsAfterRaise = currentSimYearIndex - raiseStartYear;
          currentExtraSip = initialExtraSip * Math.pow(1 + stepUpRate, yearsAfterRaise);
        }
      }

      // Initialize extra SIP at the start of raise period
      if (i === raiseStartMonth) {
        currentExtraSip = initialExtraSip;
      }

      let totalPotentialSipForProportioning = 0;
      let totalRedirectedSipForMonth = 0;
      simGoals.forEach(goal => {
        if (currentSimMonth <= goal.tenureYears * 12) totalPotentialSipForProportioning += goal.currentYearlyBaseSip;
        else totalRedirectedSipForMonth += goal.currentYearlyBaseSip;
      });

      const totalBaseSip = totalPotentialSipForProportioning + totalRedirectedSipForMonth;
      let totalSipBeforeCap = totalBaseSip;

      let actualMonthlySipToInvest = totalBaseSip;
      let scalingFactor = 1;

      let actualInvestedInGoalsThisMonth = 0;
      simGoals.forEach(goal => {
        let contribution = 0;
        if (currentSimMonth <= goal.tenureYears * 12) {
          if (totalPotentialSipForProportioning > 0) {
            contribution = goal.currentYearlyBaseSip * scalingFactor;

            // Add proportional extra from raise
            if (hasRaise && allocationStrategy === 'proportional' && totalBaseSip > 0) {
              const proportionalShare = (goal.currentYearlyBaseSip / totalBaseSip) * currentExtraSip;
              contribution += proportionalShare;
            }
          }
          actualInvestedInGoalsThisMonth += contribution;
          const interest = (goal.balance + contribution) * goal.returnRate;
          goal.balance += contribution + interest;
        }
        if (i===0) goal.effectiveFirstMonthSip = contribution;
      });

      let wcContribution = actualMonthlySipToInvest - actualInvestedInGoalsThisMonth;

      // Add wealth creation allocation from raise
      if (hasRaise) {
        if (allocationStrategy === 'wealth') {
          wcContribution += currentExtraSip;
        } else if (allocationStrategy === 'proportional') {
          // Calculate wealth creation's share of extra SIP
          const redirectedSip = totalRedirectedSipForMonth;
          if (totalBaseSip > 0) {
            wcContribution += (redirectedSip / totalBaseSip) * currentExtraSip;
          }
        }
      }

      // Update total SIP for display
      if (hasRaise) {
        totalSipBeforeCap = totalBaseSip + currentExtraSip;
      }

      const wcInterest = (wealthCreation.balance + wcContribution) * wealthCreation.returnRate;
      wealthCreation.balance += wcContribution + wcInterest;

      if (currentSimMonth % 12 === 0){
        labels.push('Age ' + (currentAgeAtStartOfYear + 1));
        simGoals.forEach((g,idx)=>{
          const isCompletedYear = (currentSimYearIndex + 1) > g.tenureYears;
          datasets[idx].data.push(isCompletedYear ? 0 : g.balance);
        });
        datasets[datasets.length-1].data.push(wealthCreation.balance);

        const row = {
          year: currentSimYearIndex + 1,
          age: currentAgeAtStartOfYear + 1,
          totalSip: totalSipBeforeCap,
          goalBalances: simGoals.map(g => (currentSimYearIndex + 1 > g.tenureYears) ? 0 : g.balance),
          wealthCreationBalance: wealthCreation.balance,
          totalCorpus: simGoals.reduce((acc,g)=> acc + ((currentSimYearIndex + 1 > g.tenureYears) ? 0 : g.balance), 0) + wealthCreation.balance
        };
        tableRows.push(row);
      }
    }

    return { labels, datasets, rows: tableRows };
  }

  // Initialize tab switching
  initWhatIfTabs();

  // What-If handlers
  const capInput = document.getElementById('whatIfCap');
  const applyBtn = document.getElementById('applyWhatIf');
  const resetBtn = document.getElementById('resetWhatIf');
  if (applyBtn) applyBtn.addEventListener('click', ()=>{
    const cap = parseFloat((capInput && capInput.value)||'');
    if (Number.isFinite(cap) && cap >= 0){
      const currentTotal = totalRequiredSip(goals);
      if (currentTotal > cap){
        const optimized = optimizeGoalsForCap(cap);
        goals.length = 0; Array.prototype.push.apply(goals, optimized);
        renderTable();
        const sim = runSimulation(); drawChart(sim); renderProjection(sim);
        return;
      }
      const sim = runSimulation(cap); drawChart(sim); renderProjection(sim);
    } else {
      const sim = runSimulation(); drawChart(sim); renderProjection(sim);
    }
  });
  if (resetBtn) resetBtn.addEventListener('click', ()=>{
    if (capInput) capInput.value = '';
    const sim = runSimulation(); drawChart(sim); renderProjection(sim);
    hideWhatIfResults();
  });

  // Job Loss scenario handlers
  const jobLossMonthsInput = document.getElementById('jobLossMonths');
  const jobLossAgeInput = document.getElementById('jobLossAge');
  const applyJobLossBtn = document.getElementById('applyJobLoss');
  const resetJobLossBtn = document.getElementById('resetJobLoss');

  if (applyJobLossBtn) applyJobLossBtn.addEventListener('click', ()=>{
    const months = parseInt((jobLossMonthsInput && jobLossMonthsInput.value) || '0', 10);
    const jobLossAge = parseInt((jobLossAgeInput && jobLossAgeInput.value) || '0', 10);
    const currentAge = parseInt((step1.basic && step1.basic.age) || '25', 10) || 25;
    const retirementAge = parseInt((step1.basic && step1.basic.retirementAge) || '60', 10) || 60;

    // Validation checks
    if (months <= 0 || months > 24) {
      alert('Please enter a valid job loss duration between 1 and 24 months.');
      return;
    }
    if (jobLossAge < currentAge) {
      alert(`Job loss age (${jobLossAge}) cannot be less than your current age (${currentAge}).`);
      return;
    }
    if (jobLossAge >= retirementAge) {
      alert(`Job loss age (${jobLossAge}) must be before your retirement age (${retirementAge}).`);
      return;
    }

    if (months > 0 && months <= 24 && jobLossAge >= currentAge && jobLossAge < retirementAge) {
      // Convert age to year offset from current age
      const yearOffset = jobLossAge - currentAge;
      const startMonth = yearOffset * 12;

      const baseSim = runSimulation();
      const jobLossSim = runSimulationWithJobLoss(startMonth, months);

      // Get emergency fund at job loss age
      const jobLossYearIndex = yearOffset;
      const emergencyGoal = goals.find(g => (g.name || '').toLowerCase().includes('emergency'));
      const emergencyFundAtJobLoss = baseSim.rows[jobLossYearIndex]?.goalBalances[goals.indexOf(emergencyGoal)] || 0;

      // Calculate monthly expenses (Emergency Fund / 12)
      const monthlyExpenses = emergencyFundAtJobLoss / 12;
      const totalExpenses = monthlyExpenses * months;

      // Calculate total monthly SIP at that age
      const monthlySIP = totalRequiredSip(goals);
      const missedSIP = monthlySIP * months;

      // Calculate shortfall
      const shortfall = Math.max(0, totalExpenses - emergencyFundAtJobLoss);
      const monthsCovered = Math.min(months, emergencyFundAtJobLoss / monthlyExpenses);

      // LONG-TERM IMPACT using correct formulas
      const yearsTo59 = retirementAge - 1 - jobLossAge; // Years to age 59
      const ANNUAL_RETURN = 0.12;

      // FV of Missed SIP using annuity formula: PMT × [((1+r)^n - 1) / r] × (1+r)
      const fvMissedSIP = missedSIP * (((Math.pow(1 + ANNUAL_RETURN, yearsTo59) - 1) / ANNUAL_RETURN) * (1 + ANNUAL_RETURN));

      // FV of EF Withdrawal using lump sum formula: PV × (1+r)^n
      const efWithdrawal = Math.min(totalExpenses, emergencyFundAtJobLoss);
      const fvEFWithdrawal = efWithdrawal * Math.pow(1 + ANNUAL_RETURN, yearsTo59);

      // Total corpus impact
      const totalCorpusImpact = fvMissedSIP + fvEFWithdrawal;
      const baseCorpus = baseSim.rows[baseSim.rows.length - 1]?.totalCorpus || 0;
      const percentageImpact = (totalCorpusImpact / baseCorpus) * 100;

      const impactSummary = {
        monthsWithoutJob: months,
        age: jobLossAge,
        monthlyExpenses: monthlyExpenses,
        totalExpenses: totalExpenses,
        missedSIP: missedSIP,
        emergencyFundBefore: emergencyFundAtJobLoss,
        emergencyFundUsed: jobLossSim.emergencyFundUsed || 0,
        shortfall: shortfall,
        monthsCovered: monthsCovered,
        yearsTo59: yearsTo59,
        fvMissedSIP: fvMissedSIP,
        fvEFWithdrawal: fvEFWithdrawal,
        totalCorpusImpact: totalCorpusImpact,
        projectedCorpusAt59: baseCorpus - totalCorpusImpact,
        percentageImpact: percentageImpact,
        finalCorpusWithoutJobLoss: baseCorpus
      };

      drawChart(jobLossSim);
      renderProjection(jobLossSim);
      displayWhatIfResults(impactSummary, 'jobLoss');
    }
  });

  if (resetJobLossBtn) resetJobLossBtn.addEventListener('click', ()=>{
    if (jobLossMonthsInput) jobLossMonthsInput.value = '';
    if (jobLossAgeInput) jobLossAgeInput.value = '';
    const sim = runSimulation(); drawChart(sim); renderProjection(sim);
    hideWhatIfResults();
  });

  // Salary Raise scenario handlers
  const raisePercentInput = document.getElementById('raisePercent');
  const raiseAgeInput = document.getElementById('raiseAge');
  const raiseAllocationSelect = document.getElementById('raiseAllocation');
  const applyRaiseBtn = document.getElementById('applyRaise');
  const resetRaiseBtn = document.getElementById('resetRaise');

  if (applyRaiseBtn) applyRaiseBtn.addEventListener('click', ()=>{
    const raisePercent = parseFloat((raisePercentInput && raisePercentInput.value) || '0');
    const raiseAge = parseInt((raiseAgeInput && raiseAgeInput.value) || '0', 10);
    const currentAge = parseInt((step1.basic && step1.basic.age) || '25', 10) || 25;
    const retirementAge = parseInt((step1.basic && step1.basic.retirementAge) || '60', 10) || 60;
    const allocation = (raiseAllocationSelect && raiseAllocationSelect.value) || 'proportional';

    // Validation checks
    if (raisePercent <= 0 || raisePercent > 200) {
      alert('Please enter a valid salary raise percentage between 1% and 200%.');
      return;
    }
    if (raiseAge < currentAge) {
      alert(`Raise age (${raiseAge}) cannot be less than your current age (${currentAge}).`);
      return;
    }
    if (raiseAge >= retirementAge) {
      alert(`Raise age (${raiseAge}) must be before your retirement age (${retirementAge}).`);
      return;
    }

    if (raisePercent > 0 && raisePercent <= 200 && raiseAge >= currentAge && raiseAge < retirementAge) {
      // Convert age to year offset from current age
      const yearOffset = raiseAge - currentAge;
      const raiseYear = yearOffset + 1; // +1 because year 1 is current age

      const baseSim = runSimulation();
      const raiseSim = runSimulationWithRaise(raisePercent, raiseYear, allocation);

      // Calculate impact
      const baseCorpus = baseSim.rows[baseSim.rows.length - 1]?.totalCorpus || 0;
      const raiseCorpus = raiseSim.rows[raiseSim.rows.length - 1]?.totalCorpus || 0;
      const corpusGain = Math.max(0, raiseCorpus - baseCorpus);

      const currentTotalSip = totalRequiredSip(goals);
      const initialExtraSipDisplay = currentTotalSip * (raisePercent / 100);

      const impactSummary = {
        extraMonthlyInvestment: initialExtraSipDisplay,
        corpusGain: corpusGain,
        age: raiseAge
      };

      drawChart(raiseSim);
      renderProjection(raiseSim);
      displayWhatIfResults(impactSummary, 'raise');
    }
  });

  if (resetRaiseBtn) resetRaiseBtn.addEventListener('click', ()=>{
    if (raisePercentInput) raisePercentInput.value = '';
    if (raiseAgeInput) raiseAgeInput.value = '';
    if (raiseAllocationSelect) raiseAllocationSelect.value = 'proportional';
    const sim = runSimulation(); drawChart(sim); renderProjection(sim);
    hideWhatIfResults();
  });

  // Navigate to Step 8
  const to8 = document.getElementById('to-step8');
  if (to8) to8.addEventListener('click', ()=> window.location.href = 'step8.html');

  // Listen for theme changes and update chart
  document.addEventListener('themeChanged', function(event) {
    setTimeout(() => {
      drawChart();
    }, 100);
  });

})();


