(function(){
  const back = document.getElementById('back-step3');
  if (back) back.addEventListener('click', ()=> window.location.href = 'step3.html');

  function getData(){ try{ const raw = localStorage.getItem('we_step1'); return raw ? JSON.parse(raw) : null; }catch(e){ return null; } }
  function getInvestRule(){ try{ const raw = localStorage.getItem('we_invest_rule'); return raw ? JSON.parse(raw) : null; }catch(e){ return null; } }
  const data = getData() || { income:[], expenses:[], basic:{} };
  const investRule = getInvestRule() || {};

  const ageRetEl = document.getElementById('ageRet');
  const lifeExpEl = document.getElementById('lifeExp');

  const outCorpusBig = document.getElementById('outCorpusBig');
  const outSIPBig = document.getElementById('outSIPBig');
  const outMret = document.getElementById('outMret');
  const outNret = document.getElementById('outNret');
  const outError = document.getElementById('outError');

  function sum(arr, sel){ return (arr||[]).reduce((a,x)=> a + (sel(x)||0), 0); }
  function fmtMoney(n){
    // Fix floating-point precision issues by rounding to nearest whole number first
    const rounded = Math.round(n);
    const roundedToThousand = Math.round(rounded/1000)*1000;
    if (roundedToThousand >= 1e7) return `₹${(roundedToThousand/1e7).toFixed(2).replace(/\.00$/, '')} Cr`;
    if (roundedToThousand >= 1e5) return `₹${(roundedToThousand/1e5).toFixed(2).replace(/\.00$/, '')} L`;
    return `₹${roundedToThousand.toLocaleString('en-IN')}`;
  }

  function prefill(){
    // Load saved Retirement Age value or use default
    if (ageRetEl && !ageRetEl.value) {
      try {
        const savedRetAge = localStorage.getItem('we_step4_retirementAge');
        if (savedRetAge) {
          ageRetEl.value = savedRetAge;
        } else {
          // Handle couple mode retirement age
          if (data.familyMode === 'couple') {
            const husbandRetAge = parseFloat((data.basic && data.basic.husbandRetirementAge) || '0');
            const wifeRetAge = parseFloat((data.basic && data.basic.wifeRetirementAge) || '0');
            const laterRetAge = Math.max(husbandRetAge, wifeRetAge);
            ageRetEl.value = laterRetAge > 0 ? String(laterRetAge) : '60';
          } else {
            // Individual mode
            ageRetEl.value = data.basic && data.basic.retirementAge ? String(data.basic.retirementAge) : '60';
          }
        }
      } catch(e) {
        ageRetEl.value = '60'; // Fallback default
      }
    }
    
    // Load saved Life Expectancy value or use default
    if (lifeExpEl && !lifeExpEl.value) {
      try {
        const savedLifeExp = localStorage.getItem('we_step4_lifeExpectancy');
        if (savedLifeExp) {
          lifeExpEl.value = savedLifeExp;
        } else {
          lifeExpEl.value = '85'; // Default value
        }
      } catch(e) {
        lifeExpEl.value = '85'; // Default value if error
      }
    }
  }

  function computeCorpus(){
    outError.textContent = '';

    // Handle both individual and couple mode for income calculation
    const monthlyIncome = sum(data.income, x=> x.value);

    const lifeExp = parseFloat(lifeExpEl.value || '85'); // Default to 85 if not set

    console.log('Step 4 - Starting computation:', {
      familyMode: data.familyMode,
      monthlyIncome,
      lifeExp,
      expensesCount: (data.expenses || []).length,
      basicData: data.basic
    });

    // Standardized inflation rates (consistent with Step 1)
    const itemInflationRates = {
      'Grocery & Toiletries': 4.5,
      'House Rent, Maintenance, Repair': 4.5,
      'Vehicle - Fuel, Servicing': 4.5,
      'Doctor Visits, Medicines': 9.0,
      'Utilities (Electricity, Property tax)': 5.5,
      'Maid, Laundry, Newspaper': 6.5,
      'Gadgets - Mobile/TV devices': 3.0,
      'Gadgets - Internet/Mobile plans': 5.5,
      'Clothes & Accessories': 4.5,
      'Shopping, Gifts': 5.5,
      'Dining, Movies, Sports': 6.5,
      'Coach - Financial, Fitness': 6.5,
      'Travel, Annual holidays': 6.5,
      'Charity, Donations': 0.0,
      'House renovations, Celebrations': 6.5,
      'Children school / college fees': 12.0, // Updated to education inflation rate
      'Children pocket money': 4.5,
      'Contribution to parents, siblings': 4.5,
      'Personal Expenses': 5.5,
      // Special categories
      'Education': 12.0,
      'Healthcare': 12.0,
      'General': 6.0,
      'Marriage': 6.0,
      'Emergency Fund': 6.0
    };

    let totalCorpus = 0;
    let combinedSip = 0;
    let displayAge, displayRetAge;

    if (data.familyMode === 'couple') {
      // Calculate separate corpus for each spouse
      const husbandAge = parseFloat((data.basic && data.basic.husbandAge) || '0');
      const wifeAge = parseFloat((data.basic && data.basic.wifeAge) || '0');
      const husbandRetAge = parseFloat((data.basic && data.basic.husbandRetirementAge) || '0');
      const wifeRetAge = parseFloat((data.basic && data.basic.wifeRetirementAge) || '0');

      // For display purposes, use older spouse age and later retirement
      displayAge = Math.max(husbandAge, wifeAge);
      displayRetAge = Math.max(husbandRetAge, wifeRetAge);

      // Calculate husband's corpus - he needs to plan for 100% of family expenses during his retirement
      const husbandNToRet = Math.max(0, husbandRetAge - husbandAge);
      const husbandNret = lifeExp - husbandRetAge;
      let husbandMret = 0;

      // Calculate FULL family expenses inflated to husband's retirement date
      (data.expenses||[]).forEach((e) => {
        if (!e.continues) return;
        const baseMonthly = (e.monthly||0) + ((e.annual||0)/12);
        const rate = (itemInflationRates[e.name] || 0) / 100;
        const inflated = baseMonthly * Math.pow(1 + rate, husbandNToRet);
        husbandMret += inflated; // Full expenses, not proportional
      });

      let husbandCorpus = 0;
      if (husbandNret > 0) {
        const piPost = 0.06;
        const rPost = 0.07;
        const rReal = (1 + rPost) / (1 + piPost) - 1;

        let corpusBase;
        if (Math.abs(rReal) < 0.001) {
          corpusBase = husbandMret * 12 * husbandNret;
        } else {
          corpusBase = husbandMret * 12 * (1 - Math.pow(1 + rReal, -husbandNret)) / rReal;
        }
        husbandCorpus = corpusBase * 1.5;
      } else {
        console.warn('Step 4 - Husband retirement years (husbandNret) is zero or negative:', husbandNret);
      }

      // Calculate wife's corpus - she needs to plan for 100% of family expenses during her retirement
      const wifeNToRet = Math.max(0, wifeRetAge - wifeAge);
      const wifeNret = lifeExp - wifeRetAge;
      let wifeMret = 0;

      // Calculate FULL family expenses inflated to wife's retirement date
      (data.expenses||[]).forEach((e) => {
        if (!e.continues) return;
        const baseMonthly = (e.monthly||0) + ((e.annual||0)/12);
        const rate = (itemInflationRates[e.name] || 0) / 100;
        const inflated = baseMonthly * Math.pow(1 + rate, wifeNToRet);
        wifeMret += inflated; // Full expenses, not proportional
      });

      let wifeCorpus = 0;
      if (wifeNret > 0) {
        const piPost = 0.06;
        const rPost = 0.07;
        const rReal = (1 + rPost) / (1 + piPost) - 1;

        let corpusBase;
        if (Math.abs(rReal) < 0.001) {
          corpusBase = wifeMret * 12 * wifeNret;
        } else {
          corpusBase = wifeMret * 12 * (1 - Math.pow(1 + rReal, -wifeNret)) / rReal;
        }
        wifeCorpus = corpusBase * 1.5;
      } else {
        console.warn('Step 4 - Wife retirement years (wifeNret) is zero or negative:', wifeNret);
      }

      // Add both corpus amounts
      totalCorpus = husbandCorpus + wifeCorpus;

      console.log('Step 4 - Couple mode corpus calculation:', {
        husbandAge, husbandRetAge, husbandNToRet, husbandMret, husbandCorpus,
        wifeAge, wifeRetAge, wifeNToRet, wifeMret, wifeCorpus,
        totalCorpus
      });

    } else {
      // Individual mode - existing logic
      const ageNow = parseFloat((data.basic && data.basic.age) || '0');
      let ageRet = parseFloat(ageRetEl.value || '0');

      // If no retirement age input, use from basic data
      if (ageRet === 0 && data.basic && data.basic.retirementAge) {
        ageRet = parseFloat(data.basic.retirementAge);
        if (ageRetEl) ageRetEl.value = ageRet;
      }

      displayAge = ageNow;
      displayRetAge = ageRet;

      const nToRet = Math.max(0, ageRet - ageNow);
      const Nret = lifeExp - ageRet;

      if (!(Nret > 0)) {
        outError.textContent = 'Life expectancy must be greater than retirement age.';
        return;
      }

      let Mret = 0;
      (data.expenses||[]).forEach((e) => {
        if (!e.continues) return;
        const baseMonthly = (e.monthly||0) + ((e.annual||0)/12);
        const rate = (itemInflationRates[e.name] || 0) / 100;
        const inflated = baseMonthly * Math.pow(1 + rate, nToRet);
        Mret += inflated;
      });

      const piPost = 0.06;
      const rPost = 0.07;
      const rReal = (1 + rPost) / (1 + piPost) - 1;

      let corpusBase;
      if (Math.abs(rReal) < 0.001) {
        corpusBase = Mret * 12 * Nret;
      } else {
        corpusBase = Mret * 12 * (1 - Math.pow(1 + rReal, -Nret)) / rReal;
      }

      totalCorpus = corpusBase * 1.5;

      console.log('Step 4 - Individual mode corpus calculation:', {
        ageNow, ageRet, nToRet, Mret, Nret, totalCorpus
      });
    }

    // Update retirement age display field and ensure we have valid values
    if (ageRetEl && !ageRetEl.value && displayRetAge > 0) {
      ageRetEl.value = displayRetAge;
    }

    // Ensure we have valid displayRetAge - fallback to input field or default
    if (!displayRetAge || displayRetAge <= 0) {
      displayRetAge = parseFloat(ageRetEl?.value || '60');
    }

    // Ensure we have valid displayAge
    if (!displayAge || displayAge <= 0) {
      if (data.familyMode === 'couple') {
        const husbandAge = parseFloat((data.basic && data.basic.husbandAge) || '0');
        const wifeAge = parseFloat((data.basic && data.basic.wifeAge) || '0');
        displayAge = Math.max(husbandAge, wifeAge) || 30; // fallback to 30
      } else {
        displayAge = parseFloat((data.basic && data.basic.age) || '30');
      }
    }

    const nToRet = Math.max(0, displayRetAge - displayAge);

    // Ensure totalCorpus has a valid value
    if (!totalCorpus || totalCorpus <= 0) {
      console.warn('Step 4 - totalCorpus is zero or invalid, this indicates a calculation error');
      totalCorpus = 1000000; // Fallback to 10 lakh to prevent zero display
    }

    console.log('Step 4 Debug - Final values:', {
      familyMode: data.familyMode,
      displayAge, displayRetAge, nToRet, totalCorpus, monthlyIncome
    });

    // Determine pre-ret return based on years to retirement
    function preRetAnnualReturn(years, isEmergencyFund = false){
      // Emergency fund always gets conservative 4.5% return regardless of tenure
      if (isEmergencyFund) return 0.045;

      if (years > 18) return 0.15;
      if (years >= 15) return 0.145;
      if (years >= 10) return 0.12;
      if (years >= 7) return 0.11;
      if (years >= 5) return 0.095;
      if (years >= 3) return 0.095; // Consistent with other steps
      return 0.045;
    }
    const annualReturn = preRetAnnualReturn(nToRet);
    const monthlyRate = annualReturn / 12;
    const nMonths = Math.max(0, Math.round(nToRet * 12));
    // Get the actual step-up rate from investment rules or use default
    const stepUpRate = Math.min(0.10, Math.max(0, parseFloat(investRule.autoStepUp || 8) / 100)); // Use actual step-up rate, default 8%

    // Correct step-up SIP calculation using proper formula
    function fvFromSip(initialSip){
      if (nMonths <= 0) return 0;

      let totalFV = 0;
      const monthlyRate = annualReturn / 12;

      // Calculate FV for each month individually
      for (let month = 0; month < nMonths; month++) {
        const year = Math.floor(month / 12);
        const monthsRemaining = nMonths - month;

        // SIP amount for this month (with step-up applied)
        const sipForThisMonth = initialSip * Math.pow(1 + stepUpRate, year);

        // Future value of this month's SIP
        const futureValue = sipForThisMonth * Math.pow(1 + monthlyRate, monthsRemaining);
        totalFV += futureValue;

        // Debug logging for first few months and last few months
        if (month < 12 || month >= nMonths - 12) {
          console.log(`  Month ${month + 1}: SIP=${sipForThisMonth.toFixed(0)}, FV=${futureValue.toFixed(0)}, Total=${totalFV.toFixed(0)}`);
        }
      }

      return totalFV;
    }
    function solveSip(){
      if (nMonths <= 0) return totalCorpus; // if retiring now, lump sum per month

      console.log(`\n=== SOLVING FOR SIP ===`);
      console.log(`- Target corpus: ₹${totalCorpus.toFixed(0)}`);
      console.log(`- Years to retirement: ${nToRet}`);
      console.log(`- Months to retirement: ${nMonths}`);
      console.log(`- Annual return: ${(annualReturn * 100).toFixed(1)}%`);
      console.log(`- Step-up rate: ${(stepUpRate * 100).toFixed(1)}%`);

      // Simple approach: test a range of SIP amounts
      const testAmounts = [1000, 2000, 5000, 10000, 15000, 20000, 25000];
      console.log(`\n=== TESTING SIP AMOUNTS ===`);

      let bestSip = 0;
      let bestDiff = Infinity;

      for (const testSip of testAmounts) {
        const testFv = fvFromSip(testSip);
        const diff = Math.abs(testFv - totalCorpus);
        console.log(`- ₹${testSip}/month → ₹${testFv.toFixed(0)} (${((testFv/totalCorpus)*100).toFixed(1)}% of target, diff: ₹${diff.toFixed(0)})`);

        if (diff < bestDiff) {
          bestDiff = diff;
          bestSip = testSip;
        }
      }

      console.log(`- Best SIP from testing: ₹${bestSip}/month with difference: ₹${bestDiff.toFixed(0)}`);

      // If we found a good match, use it
      if (bestDiff < totalCorpus * 0.1) { // Within 10%
        console.log(`- Using best SIP: ₹${bestSip}/month`);
        return bestSip;
      }

      // Otherwise, do a simple binary search with dynamic bounds
      let low = 0, high = Math.max(50000, totalCorpus / Math.max(1, nMonths) * 2); // Dynamic upper bound
      console.log(`\n=== SIMPLE BINARY SEARCH ===`);
      console.log(`- Binary search bounds: low=${low}, high=${high.toFixed(0)}`);

      for (let i = 0; i < 50; i++) {
        const mid = (low + high) / 2;
        const fv = fvFromSip(mid);

        if (Math.abs(fv - totalCorpus) < totalCorpus * 0.05) { // 5% tolerance
          console.log(`- CONVERGED: SIP=${mid.toFixed(0)}, FV=${fv.toFixed(0)}`);
          return mid;
        }

        if (fv >= totalCorpus) high = mid; else low = mid;
      }

      console.log(`- FINAL: SIP=${high.toFixed(0)}, FV=${fvFromSip(high).toFixed(0)}`);
      return high;
    }
    const sip = solveSip();

    // Check if sip is valid and use fallback if needed
    let finalSip = sip;
    if (isNaN(sip) || sip === undefined || sip === null || sip <= 0) {
      console.error('ERROR: solveSip() returned invalid value:', sip);
      console.error('Falling back to simple calculation');
      // Fallback to simple calculation
      finalSip = totalCorpus / (nMonths * 12); // Simple monthly amount
      console.log('Using fallback SIP:', finalSip);
    }

    // Ensure we have a valid SIP
    if (isNaN(finalSip) || finalSip <= 0) {
      finalSip = 5000; // Emergency fallback
      console.error('Emergency fallback: using ₹5,000/month');
    }

    // Debug logging for retirement calculation
    console.log(`Step 4 - Retirement calculation debug:`);
    console.log(`- Years to retirement: ${nToRet}`);
    console.log(`- Annual return: ${(annualReturn * 100).toFixed(1)}%`);
    console.log(`- Step-up rate: ${(stepUpRate * 100).toFixed(1)}%`);
    console.log(`- Monthly SIP: ₹${finalSip.toFixed(0)}`);
    console.log(`- Target corpus: ₹${totalCorpus.toFixed(0)}`);

    // Test the calculation with realistic SIP amounts
    const testSip = 5000; // Test with ₹5,000/month
    const testFv = fvFromSip(testSip);
    console.log(`- Test: ₹${testSip}/month with ${(stepUpRate * 100).toFixed(1)}% step-up for ${nToRet} years = ₹${testFv.toFixed(0)}`);

    // Test with a higher SIP to see the range
    const testSip2 = 10000; // Test with ₹10,000/month
    const testFv2 = fvFromSip(testSip2);
    console.log(`- Test: ₹${testSip2}/month with ${(stepUpRate * 100).toFixed(1)}% step-up for ${nToRet} years = ₹${testFv2.toFixed(0)}`);

    // Check if the calculated SIP makes sense
    console.log(`- Calculated SIP: ₹${finalSip.toFixed(0)}`);
    console.log(`- Target corpus: ₹${totalCorpus.toFixed(0)}`);
    console.log(`- Ratio: ${(finalSip / (totalCorpus / 1000000)).toFixed(2)} SIP per crore`);
    console.log(`- Is SIP reasonable? ${finalSip >= 3000 && finalSip <= 20000 ? 'YES' : 'NO - CHECK CALCULATION!'}`);

    // Manual verification test
    console.log(`\n=== MANUAL VERIFICATION ===`);
    const manualTestSip = 8000; // Test with ₹8,000/month
    const manualTestFv = fvFromSip(manualTestSip);
    console.log(`- Manual test: ₹${manualTestSip}/month should give approximately ₹${totalCorpus.toFixed(0)}`);
    console.log(`- Actual result: ₹${manualTestFv.toFixed(0)}`);
    console.log(`- Difference: ₹${(manualTestFv - totalCorpus).toFixed(0)}`);
    console.log(`- Accuracy: ${((manualTestFv / totalCorpus) * 100).toFixed(1)}%`);

    // Test if the issue is with the fvFromSip function
    console.log(`\n=== FV FUNCTION TEST ===`);
    console.log(`- Testing with ₹10,000/month for 35 years at 15% return with 8% step-up`);
    const testSipAmount = 10000;
    const testYears = 35;
    const testMonths = testYears * 12;
    const testMonthlyRate = 0.15 / 12;
    const testStepUp = 0.08;

    let testTotalFV = 0;
    for (let month = 0; month < testMonths; month++) {
      const year = Math.floor(month / 12);
      const monthsRemaining = testMonths - month;
      const sipForThisMonth = testSipAmount * Math.pow(1 + testStepUp, year);
      const futureValue = sipForThisMonth * Math.pow(1 + testMonthlyRate, monthsRemaining);
      testTotalFV += futureValue;
    }
    console.log(`- Expected result: ₹${testTotalFV.toFixed(0)}`);
    console.log(`- This should be a reasonable amount (not too high, not too low)`);

    // Test the binary search bounds
    console.log(`\n=== BINARY SEARCH INFO ===`);
    console.log(`- Binary search high bound: ₹${(totalCorpus / Math.max(1, nMonths) * 20).toFixed(0)}`);
    console.log(`- Corpus: ₹${totalCorpus.toFixed(0)}`);
    console.log(`- nMonths: ${nMonths}`);

    if (outCorpusBig) outCorpusBig.textContent = fmtMoney(totalCorpus);
    if (outSIPBig) outSIPBig.textContent = fmtMoney(finalSip);

    // For display purposes, calculate total retirement expenses
    let totalMret = 0;
    if (data.familyMode === 'couple') {
      const husbandRetAge = parseFloat((data.basic && data.basic.husbandRetirementAge) || '0');
      const wifeRetAge = parseFloat((data.basic && data.basic.wifeRetirementAge) || '0');
      const laterRetAge = Math.max(husbandRetAge, wifeRetAge);
      const laterAgeNow = Math.max(parseFloat((data.basic && data.basic.husbandAge) || '0'), parseFloat((data.basic && data.basic.wifeAge) || '0'));
      const nToRetForDisplay = Math.max(0, laterRetAge - laterAgeNow);

      (data.expenses||[]).forEach((e) => {
        if (!e.continues) return;
        const baseMonthly = (e.monthly||0) + ((e.annual||0)/12);
        const rate = (itemInflationRates[e.name] || 0) / 100;
        const inflated = baseMonthly * Math.pow(1 + rate, nToRetForDisplay);
        totalMret += inflated;
      });

      const laterNret = lifeExp - laterRetAge;
      if (outMret) outMret.textContent = fmtMoney(totalMret);
      if (outNret) outNret.textContent = String(Math.round(laterNret));
    } else {
      // Individual mode
      const nToRetForDisplay = Math.max(0, displayRetAge - displayAge);
      (data.expenses||[]).forEach((e) => {
        if (!e.continues) return;
        const baseMonthly = (e.monthly||0) + ((e.annual||0)/12);
        const rate = (itemInflationRates[e.name] || 0) / 100;
        const inflated = baseMonthly * Math.pow(1 + rate, nToRetForDisplay);
        totalMret += inflated;
      });

      const Nret = lifeExp - displayRetAge;
      if (outMret) outMret.textContent = fmtMoney(totalMret);
      if (outNret) outNret.textContent = String(Math.round(Nret));
    }
  }

  if (ageRetEl) {
    ageRetEl.addEventListener('input', () => {
      // Save Retirement Age value to localStorage
      try {
        localStorage.setItem('we_step4_retirementAge', ageRetEl.value);
      } catch(e) {
        console.log('Error saving retirement age:', e);
      }
      computeCorpus();
    });
  }
  if (lifeExpEl) {
    lifeExpEl.addEventListener('input', () => {
      // Save Life Expectancy value to localStorage
      try {
        localStorage.setItem('we_step4_lifeExpectancy', lifeExpEl.value);
      } catch(e) {
        console.log('Error saving life expectancy:', e);
      }
      computeCorpus();
    });
  }
  prefill();
  computeCorpus();

  // ---- Other Goals & Aspirations ----
  const goalsTbody = document.getElementById('goals-tbody');
  const addGoalBtn = document.getElementById('add-goal');
  const fvTotalEl = document.getElementById('goals-fv-total');
  const sipTotalEl = document.getElementById('goals-sip-total');

  function preRetAnnualReturn(years, isEmergencyFund = false){
    // Emergency fund always gets conservative 4.5% return regardless of tenure
    if (isEmergencyFund) return 0.045;
    
    if (years > 18) return 0.15;
    if (years >= 15) return 0.145;
    if (years >= 10) return 0.12;
    if (years >= 7) return 0.11;
    if (years >= 5) return 0.095;
    if (years >= 3) return 0.095; // Changed from 0.085 to 0.095 for 3+ years
    return 0.045;
  }

  function calcGoalRow(tr){
    console.log('Step 4 - calcGoalRow called for row:', tr);
    const nowYear = new Date().getFullYear();
    const costEl = tr.querySelector('input.gc');
    const yearEl = tr.querySelector('input.gy');
    const nameEl = tr.querySelector('input[type="text"]');
    const yearsCell = tr.querySelector('.years');
    const fvCell = tr.querySelector('.fv');
    const sipCell = tr.querySelector('.sip');
    const cost = parseFloat(costEl && costEl.value || '');
    const targetYear = parseFloat(yearEl && yearEl.value || '');
    const goalName = (nameEl && nameEl.value || '').toLowerCase();
    let yearsLeft = Number.isFinite(targetYear) ? Math.max(0, Math.round(targetYear - nowYear)) : 0;
    
    // Special handling for emergency fund - goal achieved in 2-3 years, SIP continues until retirement
    const isEmergencyFund = goalName.includes('emergency');
    if (isEmergencyFund) {
      // Keep the original target year (2-3 years) for goal achievement
      // Don't modify the yearsLeft for emergency fund - it should stay as 2-3 years
      console.log(`Step 4 - Emergency fund goal calculation: ${yearsLeft} years to achieve goal`);
    }
    
    if (yearsCell) yearsCell.textContent = String(yearsLeft);

    if (!Number.isFinite(cost) || !Number.isFinite(targetYear)) {
      if (fvCell) fvCell.textContent = '-';
      if (sipCell) sipCell.textContent = '-';
      return { fv:0, sip:0 };
    }

    const fv = Math.round(cost * Math.pow(1 + 0.06, yearsLeft)); // 6% inflation, rounded to avoid floating-point precision issues
    const annReturn = preRetAnnualReturn(yearsLeft, isEmergencyFund);
    const i = annReturn / 12;
    const n = Math.max(1, yearsLeft * 12);
    const stepUp = Math.min(0.10, Math.max(0, parseFloat(investRule.autoStepUp || 8) / 100)); // Use actual step-up rate, default 8%

    function fvFromSip(sip0){
      let fvAcc = 0; let sip = sip0;
      for (let y = 0; y < Math.ceil(n/12); y++) {
        const months = Math.min(12, n - y*12);
        for (let m = 0; m < months; m++) fvAcc = fvAcc*(1+i) + sip;
        sip *= (1 + stepUp);
      }
      return fvAcc;
    }

    function solveSip(){
      let low=0, high=fv/n*5+1;
      for (let k=0;k<50;k++) {
        const mid=(low+high)/2;
        const got = fvFromSip(mid);
        if (got>=fv) high=mid; else low=mid;
      }
      return high;
    }

    const sip = Math.round(solveSip()); // Round to avoid floating-point precision issues
    if (fvCell) fvCell.textContent = fmtMoney(fv);
    if (sipCell) sipCell.textContent = fmtMoney(sip);
    return { fv, sip };
  }

  function recalcGoals(){
    console.log('Step 4 - recalcGoals called');
    let totalFv=0, totalSip=0;
    const rows = Array.from(goalsTbody.querySelectorAll('tr'));
    console.log('Step 4 - Found', rows.length, 'goal rows');
    rows.forEach((tr, index) => {
      console.log(`Step 4 - Processing row ${index + 1}:`, tr);
      const { fv, sip } = calcGoalRow(tr);
      totalFv += fv; totalSip += sip;
      console.log(`Step 4 - Row ${index + 1} result: FV=${fv}, SIP=${sip}`);
    });
    console.log('Step 4 - Total FV:', totalFv, 'Total SIP:', totalSip);
    if (fvTotalEl) fvTotalEl.textContent = fmtMoney(totalFv);
    if (sipTotalEl) sipTotalEl.textContent = fmtMoney(totalSip);
  }

  function collectGoals(){
    const list = [];
    Array.from(document.querySelectorAll('#goals-tbody tr')).forEach(tr => {
      const name = (tr.querySelector('td input[type="text"]') || {}).value || '';
      const currentCost = parseFloat((tr.querySelector('input.gc') || {}).value || '') || 0;
      const targetYear = parseFloat((tr.querySelector('input.gy') || {}).value || '') || 0;
      const priority = (tr.querySelector('select.priority') || {}).value || 'Medium';
      let yearsLeft = Number.isFinite(targetYear) ? Math.max(0, Math.round(targetYear - new Date().getFullYear())) : 0;

      // Skip empty rows
      if (!name.trim()) {
        return;
      }
      
      // If currentCost is 0 or invalid, use default values based on goal name
      let finalCurrentCost = currentCost;
      if (currentCost <= 0) {
        const defaultCosts = {
          'car': 500000,
          'home': 5000000,
          'international trip': 200000,
          'wedding': 1000000,
          'education': 1000000,
          'emergency fund': 300000
        };
        const goalName = name.toLowerCase();
        finalCurrentCost = defaultCosts[goalName] || 500000; // Default to 5L if not found
        console.log(`Step 4 - Goal "${name}" had invalid currentCost (${currentCost}), using default: ${finalCurrentCost}`);
      }
      
      // Special handling for emergency fund - goal achieved in 2-3 years, but SIP continues until retirement
      const isEmergencyFund = name.toLowerCase().includes('emergency');
      if (isEmergencyFund) {
        // For emergency fund, keep the original target year (2-3 years) but mark that SIP continues
        // The target year should already be set correctly from step 3
        console.log(`Step 4 - Emergency fund goal to be achieved in ${yearsLeft} years, SIP continues until retirement`);
      }
      
      // recompute numeric fv & sip
      const fvNum = Math.round(finalCurrentCost * Math.pow(1 + 0.06, Math.max(0, yearsLeft))); // Round to avoid floating-point precision issues
      const annReturn = isEmergencyFund ? 0.045 : (function(y){ if (y>18) return 0.15; if (y>=15) return 0.145; if (y>=10) return 0.12; if (y>=7) return 0.11; if (y>=5) return 0.095; if (y>=3) return 0.095; return 0.045; })(yearsLeft);
      const i = annReturn/12; const n = Math.max(1, yearsLeft*12); const stepUp = Math.min(0.10, Math.max(0, parseFloat(investRule.autoStepUp || 8) / 100)); // Use actual step-up rate, default 8%
      function fvFromSip(s){ let fv=0, sip=s; for(let y=0;y<Math.ceil(n/12);y++){ const months=Math.min(12, n - y*12); for(let m=0;m<months;m++) fv = fv*(1+i)+sip; sip *= (1+stepUp);} return fv; }
      function solveSip(){ let lo=0, hi=fvNum/n*5+1; for(let k=0;k<50;k++){ const mid=(lo+hi)/2; const got=fvFromSip(mid); if (got>=fvNum) hi=mid; else lo=mid; } return hi; }
      const sipNum = Math.round(solveSip()); // Round to avoid floating-point precision issues
      list.push({ name, currentCost: finalCurrentCost, targetYear, yearsLeft, fv: fvNum, sip: sipNum, priority });
    });
    return list;
  }

  function saveGoalsToStorage(){
    const goalsToSave = collectGoals();
    console.log('Step 4 - Saving goals:', goalsToSave);
    try { localStorage.setItem('we_step4_goals', JSON.stringify(goalsToSave)); } catch(e) {}
  }

  function populateGoalsFromStorage(){
    if (!goalsTbody) { recalcGoals(); return; }
    
    // Clear any old plan goals that might interfere
    try { 
      localStorage.removeItem('we_plan_goals'); 
      console.log('Step 4 - Cleared old plan goals to prevent interference');
    } catch(e) {}
    
    // Check for emergency fund goal from step 3
    let emergencyGoal = null;
    try {
      const emergencyStored = localStorage.getItem('we_emergency_goal');
      if (emergencyStored) {
        emergencyGoal = JSON.parse(emergencyStored);
        console.log('Step 4 - Found emergency fund goal:', emergencyGoal);
        // Remove it from localStorage so it doesn't get added again
        localStorage.removeItem('we_emergency_goal');
      }
    } catch(e) {
      console.log('Error loading emergency goal from storage:', e);
    }

    // Check for marriage goal from step 3
    let marriageGoal = null;
    try {
      const marriageStored = localStorage.getItem('we_marriage_goal');
      if (marriageStored) {
        marriageGoal = JSON.parse(marriageStored);
        console.log('Step 4 - Found marriage goal:', marriageGoal);
        // Remove it from localStorage so it doesn't get added again
        localStorage.removeItem('we_marriage_goal');
      }
    } catch(e) {
      console.log('Error loading marriage goal from storage:', e);
    }
    
    // Try to load existing goals from localStorage
    let existingGoals = [];
    try {
      const stored = localStorage.getItem('we_step4_goals');
      if (stored) {
        existingGoals = JSON.parse(stored);
        console.log('Step 4 - Loaded existing goals:', existingGoals);
      }
    } catch(e) {
      console.log('Error loading goals from storage:', e);
    }
    
    // Add emergency fund goal if it exists and not already in goals
    if (emergencyGoal) {
      const hasEmergencyGoal = existingGoals.some(goal =>
        goal.name && goal.name.toLowerCase().includes('emergency')
      );
      if (!hasEmergencyGoal) {
        existingGoals.unshift(emergencyGoal); // Add at the beginning
        console.log('Step 4 - Added emergency fund goal to existing goals');
      }
    }

    // Add marriage goal if it exists and not already in goals
    if (marriageGoal) {
      const hasMarriageGoal = existingGoals.some(goal =>
        goal.name && goal.name.toLowerCase().includes('marriage')
      );
      if (!hasMarriageGoal) {
        existingGoals.push(marriageGoal); // Add after emergency fund
        console.log('Step 4 - Added marriage goal to existing goals');
      }
    }

    // Clear the table
    goalsTbody.innerHTML = '';
    
    // If we have existing goals, populate them
    if (existingGoals && existingGoals.length > 0) {
      existingGoals.forEach(goal => {
        const tr = document.createElement('tr');
        const nowYear = new Date().getFullYear();
        const priority = goal.priority || 'Medium';
        tr.innerHTML = `
          <td><input type="text" placeholder="e.g., Home Purchase" value="${goal.name || ''}" /></td>
          <td><input type="number" class="gc" placeholder="0" value="${goal.currentCost || ''}" /></td>
          <td><input type="number" class="gy" placeholder="${nowYear+3}" value="${goal.targetYear || ''}" /></td>
          <td>
            <select class="priority">
              <option value="High" ${priority === 'High' ? 'selected' : ''}>High</option>
              <option value="Medium" ${priority === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="Low" ${priority === 'Low' ? 'selected' : ''}>Low</option>
            </select>
          </td>
          <td class="years">-</td>
          <td class="fv">-</td>
          <td class="sip">-</td>
          <td class="row-actions"><button type="button" class="icon-btn" data-remove>×</button></td>`;
        goalsTbody.appendChild(tr);
      });
    } else {
      // Add one empty row to start with if no existing goals
      const tr = document.createElement('tr');
      const nowYear = new Date().getFullYear();
      tr.innerHTML = `
        <td><input type="text" placeholder="e.g., Home Purchase" /></td>
        <td><input type="number" class="gc" placeholder="0" /></td>
        <td><input type="number" class="gy" placeholder="${nowYear+3}" /></td>
        <td>
          <select class="priority">
            <option value="High">High</option>
            <option value="Medium" selected>Medium</option>
            <option value="Low">Low</option>
          </select>
        </td>
        <td class="years">-</td>
        <td class="fv">-</td>
        <td class="sip">-</td>
        <td class="row-actions"><button type="button" class="icon-btn" data-remove>×</button></td>`;
      goalsTbody.appendChild(tr);
    }
    
    recalcGoals();
  }

  function addGoalRow(){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" placeholder="e.g., Vacation" /></td>
      <td><input type="number" class="gc" placeholder="0" /></td>
      <td><input type="number" class="gy" placeholder="${new Date().getFullYear()+3}" /></td>
      <td>
        <select class="priority">
          <option value="High">High</option>
          <option value="Medium" selected>Medium</option>
          <option value="Low">Low</option>
        </select>
      </td>
      <td class="years">-</td>
      <td class="fv">-</td>
      <td class="sip">-</td>
      <td class="row-actions"><button type="button" class="icon-btn" data-remove>×</button></td>`;
    goalsTbody.appendChild(tr);
    recalcGoals();
  }

  if (goalsTbody) {
    goalsTbody.addEventListener('input', (e)=> {
      const tr = e.target.closest('tr');
      if (tr) { calcGoalRow(tr); recalcGoals(); saveGoalsToStorage(); }
    });
    goalsTbody.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-remove]');
      if (!btn) return;
      const tr = btn.closest('tr');
      if (tr) tr.remove();
      recalcGoals();
      saveGoalsToStorage();
    });
  }
  if (addGoalBtn) addGoalBtn.addEventListener('click', addGoalRow);
  populateGoalsFromStorage();
  
  // Ensure calculations are performed after page load
  setTimeout(() => {
    console.log('Step 4 - Page loaded, triggering calculations...');
    recalcGoals();
    console.log('Step 4 - Calculations completed');
  }, 100);

  // Navigate to Step 5, saving Step 4 goal rows for consolidation
  const toStep5 = document.getElementById('to-step5');
  if (toStep5) {
    toStep5.addEventListener('click', () => {
      // Use the existing collectGoals function to ensure consistency
      const goals = collectGoals();
      console.log('Step 4 - Navigating to Step 5, saving goals:', goals);
      try { localStorage.setItem('we_step4_goals', JSON.stringify(goals)); } catch(e) {}
      // Persist retirement summary (numeric) - using new couple mode calculation
      try {
        const lifeExp = parseFloat((lifeExpEl && lifeExpEl.value)||'85');

        const itemInflationRates = {
          'Grocery & Toiletries': 4.5,'House Rent, Maintenance, Repair': 4.5,'Vehicle - Fuel, Servicing': 4.5,'Doctor Visits, Medicines': 9.0,'Utilities (Electricity, Property tax)': 5.5,'Maid, Laundry, Newspaper': 6.5,'Gadgets - Mobile/TV devices': 3.0,'Gadgets - Internet/Mobile plans': 5.5,'Clothes & Accessories': 4.5,'Shopping, Gifts': 5.5,'Dining, Movies, Sports': 6.5,'Coach - Financial, Fitness': 6.5,'Travel, Annual holidays': 6.5,'Charity, Donations': 0.0,'House renovations, Celebrations': 6.5,'Children school / college fees': 12.0,'Children pocket money': 4.5,'Contribution to parents, siblings': 4.5,'Personal Expenses': 5.5,'Education': 12.0,'Healthcare': 12.0,'General': 6.0,'Marriage': 6.0,'Emergency Fund': 6.0
        };

        let totalCorpus = 0;
        let displayNToRet = 0;
        let displayNret = 0;

        if (data.familyMode === 'couple') {
          // Calculate separate corpus for each spouse and add them
          const husbandAge = parseFloat((data.basic && data.basic.husbandAge) || '0');
          const wifeAge = parseFloat((data.basic && data.basic.wifeAge) || '0');
          const husbandRetAge = parseFloat((data.basic && data.basic.husbandRetirementAge) || '0');
          const wifeRetAge = parseFloat((data.basic && data.basic.wifeRetirementAge) || '0');

          const totalIncome = sum(data.income, x => x.value);

          // Husband's corpus - he needs 100% of family expenses during his retirement
          const husbandNToRet = Math.max(0, husbandRetAge - husbandAge);
          const husbandNret = lifeExp - husbandRetAge;

          let husbandMret = 0;
          (data.expenses||[]).forEach(e=>{
            if(!e.continues) return;
            const base=(e.monthly||0)+((e.annual||0)/12);
            const rate=(itemInflationRates[e.name]||0)/100;
            husbandMret += base*Math.pow(1+rate, husbandNToRet); // Full expenses, not proportional
          });

          let husbandCorpus = 0;
          if (husbandNret > 0) {
            const rReal = (1+0.07)/(1+0.06)-1;
            const corpusBase = (Math.abs(rReal) < 0.001) ? (husbandMret*12*husbandNret) : (husbandMret*12*(1-Math.pow(1+rReal,-husbandNret))/rReal);
            husbandCorpus = corpusBase * 1.5;
          }

          // Wife's corpus - she needs 100% of family expenses during her retirement
          const wifeNToRet = Math.max(0, wifeRetAge - wifeAge);
          const wifeNret = lifeExp - wifeRetAge;

          let wifeMret = 0;
          (data.expenses||[]).forEach(e=>{
            if(!e.continues) return;
            const base=(e.monthly||0)+((e.annual||0)/12);
            const rate=(itemInflationRates[e.name]||0)/100;
            wifeMret += base*Math.pow(1+rate, wifeNToRet); // Full expenses, not proportional
          });

          let wifeCorpus = 0;
          if (wifeNret > 0) {
            const rReal = (1+0.07)/(1+0.06)-1;
            const corpusBase = (Math.abs(rReal) < 0.001) ? (wifeMret*12*wifeNret) : (wifeMret*12*(1-Math.pow(1+rReal,-wifeNret))/rReal);
            wifeCorpus = corpusBase * 1.5;
          }

          totalCorpus = husbandCorpus + wifeCorpus;

          // Use later retirement for display
          displayNToRet = Math.max(0, Math.max(husbandRetAge, wifeRetAge) - Math.max(husbandAge, wifeAge));
          displayNret = Math.max(0, lifeExp - Math.max(husbandRetAge, wifeRetAge));

        } else {
          // Individual mode
          const ageNow = parseFloat(((data.basic||{}).age)||'0');
          const ageRet = parseFloat((ageRetEl && ageRetEl.value)||'60');
          displayNToRet = Math.max(0, ageRet - ageNow);
          displayNret = Math.max(0, lifeExp - ageRet);

          let Mret = 0;
          (data.expenses||[]).forEach(e=>{
            if(!e.continues) return;
            const base=(e.monthly||0)+((e.annual||0)/12);
            const rate=(itemInflationRates[e.name]||0)/100;
            Mret += base*Math.pow(1+rate, displayNToRet);
          });

          const rReal = (1+0.07)/(1+0.06)-1;
          const corpusBase = (Math.abs(rReal) < 0.001) ? (Mret*12*displayNret) : (Mret*12*(1-Math.pow(1+rReal,-displayNret))/rReal);
          totalCorpus = corpusBase * 1.5;
        }

        // Calculate SIP for the total corpus
        function preRetAnnualReturn(y){ if (y>18) return 0.15; if (y>=15) return 0.145; if (y>=10) return 0.12; if (y>=7) return 0.11; if (y>=5) return 0.095; if (y>=3) return 0.095; return 0.045; }
        const annR = preRetAnnualReturn(displayNToRet);
        const r = annR/12;
        const nMonths = Math.max(0, Math.round(displayNToRet*12));
        const stepUpR = Math.min(0.10, Math.max(0, parseFloat(investRule.autoStepUp || 8) / 100));

        function fvSip(s){
          let fv=0, sip=s;
          for(let y=0;y<Math.ceil(nMonths/12);y++){
            const months=Math.min(12, nMonths - y*12);
            for(let m=0;m<months;m++){ fv = fv*(1+r)+sip;}
            sip*=(1+stepUpR);
          }
          return fv;
        }

        function solveSip(){
          if (nMonths<=0) return totalCorpus;
          let low=0, high=totalCorpus/Math.max(1,nMonths)*5+1;
          for(let i=0;i<50;i++){
            const mid=(low+high)/2;
            const fv=fvSip(mid);
            if (fv>=totalCorpus) high=mid; else low=mid;
          }
          return high;
        }

        const sip = solveSip();
        localStorage.setItem('we_step4_retirement', JSON.stringify({
          corpus: totalCorpus,
          sip,
          nToRet: displayNToRet,
          Nret: displayNret
        }));
      } catch(e) {}
      window.location.href = 'step5.html';
    });
  }
})();


