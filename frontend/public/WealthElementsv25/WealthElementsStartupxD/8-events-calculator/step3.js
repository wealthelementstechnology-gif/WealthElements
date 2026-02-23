(function(){
  const backBtn = document.getElementById('back-step2');
  if (backBtn) backBtn.addEventListener('click', ()=> window.location.href = 'snapshot.html');

  function getData(){
    try{ const raw = localStorage.getItem('we_step1'); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
  }

  const data = getData() || { basic:{}, income:[], expenses:[], assets:[] };

  // Helpers
  const fmt = (n) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)}`;
  function fmtWithUnit(amount) {
    if (amount >= 1e7) { // Crore
      const v = (amount / 1e7).toFixed(2).replace(/\.00$/, '');
      return `₹${v} Cr`;
    }
    if (amount >= 1e5) { // Lakh
      const vNum = amount / 1e5;
      const v = vNum.toFixed(2).replace(/\.00$/, '');
      return `₹${v} L`;
    }
    return fmt(amount);
  }
  const sum = (arr, sel) => arr.reduce((a,x)=> a + (sel(x)||0), 0);

  // Detect if couple mode
  const isCouple = data.familyMode === 'couple';

  // Insurance gap analysis
  const existingTermInsurance = (data.insurances || [])
    .filter(ins => ins.type && ins.type.toLowerCase() === 'term')
    .reduce((sum, ins) => sum + (ins.sum || 0), 0);

  const existingHealthInsurance = (data.insurances || [])
    .filter(ins => ins.type && ins.type.toLowerCase() === 'health')
    .reduce((sum, ins) => sum + (ins.sum || 0), 0);

  // City logic
  const metroCities = ['mumbai','delhi','kolkata','chennai','bengaluru','bangalore','pune','hyderabad','ahmedabad'];
  const city = (data.basic && (data.basic.city || data.basic.cityCouple) ? String(data.basic.city || data.basic.cityCouple) : '').toLowerCase();
  const isMetro = metroCities.includes(city);
  const healthMultiplier = isMetro ? 1.3 : 1.1;

  // Calculate expenses (same for individual and couple)
  const monthlyExpenses = sum(data.expenses, e => (e.monthly||0)) + sum(data.expenses, e => (e.annual||0)/12);
  const emergencyFund = monthlyExpenses * 6;

  // Set user name
  const userName = document.getElementById('userName');
  let displayName = 'Friend';

  if (isCouple) {
    const husbandName = data.basic.husbandName || 'Husband';
    const wifeName = data.basic.wifeName || 'Wife';
    const husbandFirstName = husbandName.split(' ')[0];
    const wifeFirstName = wifeName.split(' ')[0];
    displayName = `${husbandFirstName} & ${wifeFirstName}`;
  } else {
    displayName = data.basic && data.basic.fullName ? data.basic.fullName.split(' ')[0] : 'Friend';
  }

  if (userName) userName.textContent = displayName;

  // Insurance Calculations
  if (isCouple) {
    calculateCoupleInsurance();
  } else {
    calculateIndividualInsurance();
  }

  function calculateIndividualInsurance() {
    // Show individual mode UI
    document.getElementById('individual-layout').style.display = 'grid';
    document.getElementById('couple-layout').style.display = 'none';

    // Calculate individual values
    const monthlyIncome = data.income.reduce((a,x)=> a + (x.value||0), 0);
    const annualIncome = monthlyIncome * 12;

    const lifeCover = annualIncome * 15;
    const healthCover = annualIncome * healthMultiplier;

    const lifeCoverGap = Math.max(0, lifeCover - existingTermInsurance);
    const healthCoverGap = Math.max(0, healthCover - existingHealthInsurance);

    // Update UI
    const emergencyEl = document.getElementById('val-emergency');
    const lifeEl = document.getElementById('val-life');
    const healthEl = document.getElementById('val-health');
    const healthDesc = document.getElementById('health-desc');

    if (emergencyEl) emergencyEl.textContent = fmtWithUnit(emergencyFund);
    if (lifeEl) lifeEl.textContent = fmtWithUnit(lifeCoverGap);
    if (healthEl) healthEl.textContent = fmtWithUnit(healthCoverGap);
    if (healthDesc) healthDesc.textContent = isMetro ? 'Health Insurance Gap: (Metro)' : 'Health Insurance Gap: (Non-Metro)';
  }

  function calculateCoupleInsurance() {
    // Show couple mode UI
    document.getElementById('individual-layout').style.display = 'none';
    document.getElementById('couple-layout').style.display = 'block';

    // Get spouse names
    const husbandName = data.basic.husbandName || 'Husband';
    const wifeName = data.basic.wifeName || 'Wife';
    const wifeWorkingStatus = data.basic.wifeWorkingStatus || 'working';

    // Update spouse names in UI
    document.getElementById('husband-name-life').textContent = husbandName.split(' ')[0];
    document.getElementById('wife-name-life').textContent = wifeName.split(' ')[0];
    document.getElementById('husband-name-health').textContent = husbandName.split(' ')[0];
    document.getElementById('wife-name-health').textContent = wifeName.split(' ')[0];

    // Calculate incomes by owner
    const husbandIncome = data.income
      .filter(inc => inc.owner === 'husband')
      .reduce((sum, inc) => sum + (inc.value || 0), 0) * 12; // Annual income

    const wifeIncome = data.income
      .filter(inc => inc.owner === 'wife')
      .reduce((sum, inc) => sum + (inc.value || 0), 0) * 12; // Annual income

    const totalAnnualIncome = husbandIncome + wifeIncome;

    // Life Insurance Logic
    let husbandLifeCover = 0;
    let wifeLifeCover = 0;

    if (husbandIncome > 0) {
      husbandLifeCover = husbandIncome * 15; // 15x annual income
    }

    if (wifeIncome > 0 && wifeWorkingStatus === 'working') {
      wifeLifeCover = wifeIncome * 15; // 15x annual income
    }

    // Account for existing term insurance (split proportionally)
    const totalLifeCover = husbandLifeCover + wifeLifeCover;
    let husbandLifeGap = husbandLifeCover;
    let wifeLifeGap = wifeLifeCover;

    if (existingTermInsurance > 0 && totalLifeCover > 0) {
      const husbandShare = husbandLifeCover / totalLifeCover;
      const wifeShare = wifeLifeCover / totalLifeCover;

      husbandLifeGap = Math.max(0, husbandLifeCover - (existingTermInsurance * husbandShare));
      wifeLifeGap = Math.max(0, wifeLifeCover - (existingTermInsurance * wifeShare));
    }

    // Health Insurance Logic - Split into two separate policies
    const totalHealthCover = totalAnnualIncome * healthMultiplier;
    const husbandHealthCover = totalHealthCover * 0.5; // Policy A
    const wifeHealthCover = totalHealthCover * 0.5; // Policy B

    // Account for existing health insurance (split equally)
    const husbandHealthGap = Math.max(0, husbandHealthCover - (existingHealthInsurance * 0.5));
    const wifeHealthGap = Math.max(0, wifeHealthCover - (existingHealthInsurance * 0.5));

    // Update Life Insurance UI
    document.getElementById('val-life-husband').textContent = fmtWithUnit(husbandLifeGap);
    document.getElementById('val-life-wife').textContent = wifeWorkingStatus === 'working' ? fmtWithUnit(wifeLifeGap) : 'Not required';
    document.getElementById('life-total').textContent = fmtWithUnit(husbandLifeGap + wifeLifeGap);

    // Update Health Insurance UI
    document.getElementById('val-health-husband').textContent = fmtWithUnit(husbandHealthGap);
    document.getElementById('val-health-wife').textContent = fmtWithUnit(wifeHealthGap);
    document.getElementById('health-total').textContent = fmtWithUnit(husbandHealthGap + wifeHealthGap);

    // Update Emergency Fund (same calculation) - use couple emergency element
    const emergencyEl = document.getElementById('val-emergency-couple');
    if (emergencyEl) emergencyEl.textContent = fmtWithUnit(emergencyFund);

    // Hide wife's life insurance card if she's not working
    const wifeLifeCard = document.querySelector('#life-spouse-cards .wife-card');
    if (wifeLifeCard) {
      wifeLifeCard.style.display = wifeWorkingStatus === 'working' ? 'block' : 'none';
    }

    // Update wife's life insurance display text for housewife
    const wifeLifeValueEl = document.getElementById('val-life-wife');
    if (wifeLifeValueEl && wifeWorkingStatus !== 'working') {
      wifeLifeValueEl.textContent = 'Not required';
      wifeLifeValueEl.style.color = 'var(--text-muted)';
      wifeLifeValueEl.style.fontSize = 'var(--font-size-lg)';
    }
  }

  // Emergency Fund Modal Logic
  const emergencyModal = document.getElementById('emergency-fund-modal');
  const emergencyAmount = document.getElementById('emergency-amount');
  const emergencyYes = document.getElementById('emergency-yes');
  const emergencyNo = document.getElementById('emergency-no');

  // Update emergency amount in modal
  if (emergencyAmount) {
    emergencyAmount.textContent = fmtWithUnit(emergencyFund);
  }

  // Show modal when Next is clicked
  const toStep4 = document.getElementById('to-step4');
  if (toStep4) {
    toStep4.addEventListener('click', (e) => {
      e.preventDefault();
      if (emergencyModal) {
        emergencyModal.style.display = 'flex';
      }
    });
  }

  // Handle Yes button - proceed to marriage checker
  if (emergencyYes) {
    emergencyYes.addEventListener('click', () => {
      if (emergencyModal) {
        emergencyModal.style.display = 'none';
      }

      // Check marital status and show marriage checker if unmarried
      checkAndShowMarriageModal();
    });
  }

  // Handle No button - save emergency fund goal and proceed to marriage checker
  if (emergencyNo) {
    emergencyNo.addEventListener('click', () => {
      // Save emergency fund goal to localStorage for step 4
      // Emergency fund target is achieved in 2-3 years, but SIP continues until retirement
      const currentYear = new Date().getFullYear();
      const targetYear = currentYear + 3; // Achieve goal in 3 years
      // Get retirement age and current age based on mode
      let retirementAge, currentAge;

      if (isCouple) {
        // For couples, use the later retirement age
        const husbandRetAge = data.basic && data.basic.husbandRetirementAge ? data.basic.husbandRetirementAge : 60;
        const wifeRetAge = data.basic && data.basic.wifeRetirementAge ? data.basic.wifeRetirementAge : 60;
        retirementAge = Math.max(husbandRetAge, wifeRetAge);

        const husbandAge = data.basic && data.basic.husbandAge ? data.basic.husbandAge : 30;
        const wifeAge = data.basic && data.basic.wifeAge ? data.basic.wifeAge : 28;
        currentAge = Math.max(husbandAge, wifeAge); // Use older spouse's age for conservative calculation
      } else {
        retirementAge = data.basic && data.basic.retirementAge ? data.basic.retirementAge : 60;
        currentAge = data.basic && data.basic.age ? data.basic.age : 25;
      }

      const yearsToRetirement = Math.max(1, retirementAge - currentAge);

      const emergencyGoal = {
        name: 'Emergency Fund',
        currentCost: Math.round(emergencyFund), // Round to avoid floating-point precision issues
        targetYear: targetYear,
        yearsLeft: 3, // Goal achieved in 3 years
        fv: Math.round(emergencyFund * Math.pow(1 + 0.06, 3)), // Round to avoid floating-point precision issues
        sip: 0, // Will be calculated in step 4
        isEmergencyFund: true, // Special flag to identify emergency fund
        noEndGoal: true, // Flag to indicate SIP continues until retirement
        sipContinuesUntilRetirement: true, // SIP continues until retirement
        retirementYear: currentYear + yearsToRetirement
      };

      // Calculate SIP for emergency fund (3 years to achieve goal, conservative return)
      const annReturn = 0.045; // 4.5% for conservative return
      const i = annReturn / 12;
      const n = 36; // 36 months to achieve goal
      // Get step-up rate from investment rules or use default 8%
      function getInvestRule(){ try{ const raw = localStorage.getItem('we_invest_rule'); return raw ? JSON.parse(raw) : null; }catch(e){ return null; } }
      const investRule = getInvestRule() || {};
      const stepUp = Math.min(0.10, Math.max(0, parseFloat(investRule.autoStepUp || 8) / 100)); // Use actual step-up rate, default 8%

      function fvFromSip(sip0) {
        let fvAcc = 0;
        let sip = sip0;
        for (let y = 0; y < Math.ceil(n / 12); y++) {
          const months = Math.min(12, n - y * 12);
          for (let m = 0; m < months; m++) {
            fvAcc = fvAcc * (1 + i) + sip;
          }
          sip *= (1 + stepUp);
        }
        return fvAcc;
      }

      function solveSip() {
        const fv = emergencyGoal.fv;
        let low = 0, high = fv / n * 5 + 1;
        for (let k = 0; k < 50; k++) {
          const mid = (low + high) / 2;
          const got = fvFromSip(mid);
          if (got >= fv) high = mid;
          else low = mid;
        }
        return high;
      }

      emergencyGoal.sip = Math.round(solveSip()); // Round to avoid floating-point precision issues

      // Save to localStorage
      try {
        localStorage.setItem('we_emergency_goal', JSON.stringify(emergencyGoal));
        console.log('Emergency fund goal saved:', emergencyGoal);
      } catch (e) {
        console.error('Error saving emergency goal:', e);
      }

      if (emergencyModal) {
        emergencyModal.style.display = 'none';
      }

      // Check marital status and show marriage checker if unmarried
      checkAndShowMarriageModal();
    });
  }

  // Marriage Checker Logic
  function checkAndShowMarriageModal() {
    // For couple mode, skip marriage planning (they're already married)
    if (isCouple) {
      window.location.href = 'step4.html';
      return;
    }

    // Check if individual user is unmarried
    const maritalStatus = data.basic && data.basic.maritalStatus ? data.basic.maritalStatus : '';

    if (maritalStatus === 'Unmarried') {
      const marriageModal = document.getElementById('marriage-checker-modal');
      if (marriageModal) {
        marriageModal.style.display = 'flex';
      }
    } else {
      // If married or status not available, proceed to step 4
      window.location.href = 'step4.html';
    }
  }

  // Marriage Modal Elements
  const marriageModal = document.getElementById('marriage-checker-modal');
  const marriageDetails = document.getElementById('marriage-details');
  const marriageAgeInput = document.getElementById('marriage-age');
  const marriageAmountInput = document.getElementById('marriage-amount');
  const marriageYesBtn = document.getElementById('marriage-yes');
  const marriageNoBtn = document.getElementById('marriage-no');
  const marriageSaveBtn = document.getElementById('marriage-save');

  // Handle "Yes, I want to plan" button
  if (marriageYesBtn) {
    marriageYesBtn.addEventListener('click', () => {
      if (marriageDetails) {
        marriageDetails.style.display = 'block';
      }
      if (marriageYesBtn) {
        marriageYesBtn.style.display = 'none';
      }
      if (marriageNoBtn) {
        marriageNoBtn.style.display = 'none';
      }
      if (marriageSaveBtn) {
        marriageSaveBtn.style.display = 'inline-flex';
      }
    });
  }

  // Handle "No, I don't want to plan" button
  if (marriageNoBtn) {
    marriageNoBtn.addEventListener('click', () => {
      if (marriageModal) {
        marriageModal.style.display = 'none';
      }
      window.location.href = 'step4.html';
    });
  }

  // Handle "Save & Continue" button
  if (marriageSaveBtn) {
    marriageSaveBtn.addEventListener('click', () => {
      const marriageAge = marriageAgeInput ? parseInt(marriageAgeInput.value) : null;
      const marriageAmount = marriageAmountInput ? parseFloat(marriageAmountInput.value) : null;
      const currentAge = data.basic && data.basic.age ? data.basic.age : 25;

      // Validation
      if (!marriageAge || marriageAge <= currentAge) {
        alert('Please enter a valid marriage age that is greater than your current age.');
        return;
      }

      if (!marriageAmount || marriageAmount <= 0) {
        alert('Please enter a valid marriage amount.');
        return;
      }

      // Calculate marriage goal
      const currentYear = new Date().getFullYear();
      const yearsToMarriage = marriageAge - currentAge;
      const targetYear = currentYear + yearsToMarriage;
      const inflationRate = 0.06; // 6% inflation for marriage expenses
      const futureValue = Math.round(marriageAmount * Math.pow(1 + inflationRate, yearsToMarriage));

      const marriageGoal = {
        name: 'Marriage',
        currentCost: Math.round(marriageAmount),
        targetYear: targetYear,
        yearsLeft: yearsToMarriage,
        fv: futureValue,
        sip: 0, // Will be calculated in step 4
        isMarriageGoal: true,
        marriageAge: marriageAge,
        inflationRate: inflationRate
      };

      // Calculate SIP for marriage goal
      const annReturn = 0.12; // 12% return for equity investment
      const i = annReturn / 12;
      const n = yearsToMarriage * 12; // months to achieve goal

      // Get step-up rate from investment rules or use default 8%
      function getInvestRule(){ try{ const raw = localStorage.getItem('we_invest_rule'); return raw ? JSON.parse(raw) : null; }catch(e){ return null; } }
      const investRule = getInvestRule() || {};
      const stepUp = Math.min(0.10, Math.max(0, parseFloat(investRule.autoStepUp || 8) / 100)); // Use actual step-up rate, default 8%

      function fvFromSip(sip0) {
        let fvAcc = 0;
        let sip = sip0;
        for (let y = 0; y < Math.ceil(n / 12); y++) {
          const months = Math.min(12, n - y * 12);
          for (let m = 0; m < months; m++) {
            fvAcc = fvAcc * (1 + i) + sip;
          }
          sip *= (1 + stepUp);
        }
        return fvAcc;
      }

      function solveSip() {
        const fv = marriageGoal.fv;
        let low = 0, high = fv / n * 5 + 1;
        for (let k = 0; k < 50; k++) {
          const mid = (low + high) / 2;
          const got = fvFromSip(mid);
          if (got >= fv) high = mid;
          else low = mid;
        }
        return high;
      }

      marriageGoal.sip = Math.round(solveSip());

      // Save to localStorage
      try {
        localStorage.setItem('we_marriage_goal', JSON.stringify(marriageGoal));
        console.log('Marriage goal saved:', marriageGoal);
      } catch (e) {
        console.error('Error saving marriage goal:', e);
      }

      if (marriageModal) {
        marriageModal.style.display = 'none';
      }
      window.location.href = 'step4.html';
    });
  }

})();


