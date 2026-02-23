(function () {
  const addIncomeButton = document.getElementById('add-income');
  const incomeTableBody = document.getElementById('income-tbody');
  const totalIncomeAmount = document.getElementById('total-income-amount');
  const expensesTbody = document.getElementById('expenses-tbody');
  const totalCurrentMonthlyText = document.getElementById('total-current-monthly-text');
  const totalPostRetMonthlyText = document.getElementById('total-postret-monthly-text');
  const insuranceTbody = document.getElementById('insurance-tbody');
  const investmentsTbody = document.getElementById('investments-tbody');
  const assetsTbody = document.getElementById('assets-tbody');
  const ageInput = document.getElementById('age');
  const retirementAgeInput = document.getElementById('retirementAge');

  // Family Mode Elements
  const familyModeRadios = document.querySelectorAll('input[name="familyMode"]');
  const individualFields = document.querySelector('.individual-fields');
  const coupleFields = document.querySelector('.couple-fields');
  const incomeHeaderIndividual = document.getElementById('income-header-individual');
  const incomeHeaderCouple = document.getElementById('income-header-couple');
  // Standardized inflation rates across the entire application
  const itemInflationRates = {
    // Household
    'Grocery & Toiletries': 4.5,
    'House Rent, Maintenance, Repair': 4.5,
    'Vehicle - Fuel, Servicing': 4.5,
    'Doctor Visits, Medicines': 9.0,
    'Utilities (Electricity, Property tax)': 5.5,
    'Maid, Laundry, Newspaper': 6.5,
    'Gadgets - Mobile/TV devices': 3.0,
    'Gadgets - Internet/Mobile plans': 5.5,
    // Lifestyle
    'Clothes & Accessories': 4.5,
    'Shopping, Gifts': 5.5,
    'Dining, Movies, Sports': 6.5,
    'Coach - Financial, Fitness': 6.5,
    'Travel, Annual holidays': 6.5,
    'Charity, Donations': 0.0,
    'House renovations, Celebrations': 6.5,
    // Dependent
    'Children school / college fees': 12.0, // Education inflation
    'Children pocket money': 4.5,
    'Contribution to parents, siblings': 4.5,
    // Misc
    'Personal Expenses': 5.5,
    // Special categories
    'Education': 12.0,
    'Healthcare': 12.0,
    'General': 6.0, // Default inflation for items not specifically categorized
    'Marriage': 6.0,
    'Emergency Fund': 6.0
  };

  // Family Mode Functions
  function toggleFamilyMode() {
    const selectedMode = document.querySelector('input[name="familyMode"]:checked').value;

    // Update toggle animation to match current selection
    updateToggleAnimation();

    if (selectedMode === 'couple') {
      individualFields.style.display = 'none';
      coupleFields.style.display = 'contents';
      incomeHeaderIndividual.style.display = 'none';
      incomeHeaderCouple.style.display = 'table-row';
      clearIncomeTable();
      createCoupleIncomeRow(); // Add first couple income row
    } else {
      individualFields.style.display = 'contents';
      coupleFields.style.display = 'none';
      incomeHeaderIndividual.style.display = 'table-row';
      incomeHeaderCouple.style.display = 'none';
      clearIncomeTable();
      createIndividualIncomeRow(); // Add first individual income row
    }

    updateTotalIncome();
    recalcTotals();
  }

  function clearIncomeTable() {
    if (incomeTableBody) {
      incomeTableBody.innerHTML = '';
    }
  }

  function createIndividualIncomeRow() {
    const row = createIncomeRow();
    row.className = 'income-row-individual';
    if (incomeTableBody) {
      incomeTableBody.appendChild(row);
    }
  }

  function createCoupleIncomeRow() {
    const row = document.createElement('tr');
    row.className = 'income-row-couple';

    // Create source cell with dropdown
    const sourceCell = document.createElement('td');
    const sourceSelect = document.createElement('select');
    sourceSelect.name = 'incomeSource[]';
    sourceSelect.setAttribute('aria-label', 'Source of Income');
    sourceSelect.className = 'income-source-select';

    const incomeOptions = [
      { value: '', label: '-- Select Source --' },
      { value: 'Salary', label: 'Salary' },
      { value: 'Business Income', label: 'Business Income' },
      { value: 'Rental Income', label: 'Rental Income' },
      { value: 'Freelance/Consulting', label: 'Freelance/Consulting' },
      { value: 'Interest Income', label: 'Interest Income' },
      { value: 'Dividend Income', label: 'Dividend Income' },
      { value: 'Other', label: 'Other (Specify)' }
    ];

    incomeOptions.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.label;
      sourceSelect.appendChild(opt);
    });

    sourceCell.appendChild(sourceSelect);

    // Create "Other" text input (hidden by default with CSS)
    const otherInput = document.createElement('input');
    otherInput.type = 'text';
    otherInput.name = 'incomeSourceOther[]';
    otherInput.placeholder = 'Specify income source';
    otherInput.className = 'income-source-other';
    otherInput.setAttribute('aria-label', 'Specify other income source');
    sourceCell.appendChild(otherInput);

    sourceSelect.addEventListener('change', function() {
      if (this.value === 'Other') {
        // Use setTimeout to trigger smooth animation
        setTimeout(() => {
          otherInput.classList.add('show');
        }, 10);
        otherInput.required = true;
      } else {
        otherInput.classList.remove('show');
        otherInput.required = false;
        otherInput.value = '';
      }
    });

    // Create owner cell
    const ownerCell = document.createElement('td');
    ownerCell.innerHTML = `
      <select name="incomeOwner[]" aria-label="Whose income">
        <option value="">Select</option>
        <option value="husband">Husband</option>
        <option value="wife">Wife</option>
      </select>
    `;

    // Create amount cell
    const amountCell = document.createElement('td');
    amountCell.innerHTML = `
      <div class="amount-input">
        <span class="prefix">₹</span>
        <input type="number" name="incomeAmount[]" min="0" step="0.01" placeholder="0.00" aria-label="Amount per month" />
      </div>
    `;

    // Create actions cell
    const actionsCell = document.createElement('td');
    actionsCell.className = 'row-actions';
    actionsCell.innerHTML = '<button type="button" class="icon-btn" data-remove>×</button>';

    row.appendChild(sourceCell);
    row.appendChild(ownerCell);
    row.appendChild(amountCell);
    row.appendChild(actionsCell);

    if (incomeTableBody) {
      incomeTableBody.appendChild(row);
    }
  }

  // Add event listeners for family mode toggle
  familyModeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      // Use setTimeout to ensure DOM updates are complete
      setTimeout(() => {
        updateToggleAnimation();
        toggleFamilyMode();
      }, 0);
    });
  });

  // Initialize toggle animation on page load
  updateToggleAnimation();

  function updateToggleAnimation() {
    const toggleSwitch = document.querySelector('.toggle-switch');
    const coupleRadio = document.getElementById('couple');
    const individualRadio = document.getElementById('individual');

    if (toggleSwitch && coupleRadio && individualRadio) {
      console.log('Updating toggle animation - couple checked:', coupleRadio.checked, 'individual checked:', individualRadio.checked);

      if (coupleRadio.checked) {
        toggleSwitch.classList.add('couple-selected');
        console.log('Added couple-selected class');
      } else {
        toggleSwitch.classList.remove('couple-selected');
        console.log('Removed couple-selected class');
      }
    } else {
      console.warn('Toggle elements not found:', {
        toggleSwitch: !!toggleSwitch,
        coupleRadio: !!coupleRadio,
        individualRadio: !!individualRadio
      });
    }
  }


  function createIncomeRow() {
    const row = document.createElement('tr');

    const sourceCell = document.createElement('td');

    // Create dropdown for income source
    const sourceSelect = document.createElement('select');
    sourceSelect.name = 'incomeSource[]';
    sourceSelect.setAttribute('aria-label', 'Source of Income');
    sourceSelect.className = 'income-source-select';

    // Add income source options
    const incomeOptions = [
      { value: '', label: '-- Select Source --' },
      { value: 'Salary', label: 'Salary' },
      { value: 'Business Income', label: 'Business Income' },
      { value: 'Rental Income', label: 'Rental Income' },
      { value: 'Freelance/Consulting', label: 'Freelance/Consulting' },
      { value: 'Interest Income', label: 'Interest Income' },
      { value: 'Dividend Income', label: 'Dividend Income' },
      { value: 'Other', label: 'Other (Specify)' }
    ];

    incomeOptions.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.label;
      sourceSelect.appendChild(opt);
    });

    sourceCell.appendChild(sourceSelect);

    // Create "Other" text input (hidden by default with CSS)
    const otherInput = document.createElement('input');
    otherInput.type = 'text';
    otherInput.name = 'incomeSourceOther[]';
    otherInput.placeholder = 'Specify income source';
    otherInput.className = 'income-source-other';
    otherInput.setAttribute('aria-label', 'Specify other income source');
    sourceCell.appendChild(otherInput);

    // Add event listener to show/hide "Other" input
    sourceSelect.addEventListener('change', function() {
      if (this.value === 'Other') {
        // Use setTimeout to trigger smooth animation
        setTimeout(() => {
          otherInput.classList.add('show');
        }, 10);
        otherInput.required = true;
      } else {
        otherInput.classList.remove('show');
        otherInput.required = false;
        otherInput.value = '';
      }
    });

    const amountCell = document.createElement('td');
    const amountWrapper = document.createElement('div');
    amountWrapper.className = 'amount-input';
    const prefix = document.createElement('span');
    prefix.className = 'prefix';
    prefix.textContent = '₹';
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.name = 'incomeAmount[]';
    amountInput.min = '0';
    amountInput.step = '0.01';
    amountInput.placeholder = '0.00';
    amountInput.setAttribute('aria-label', 'Amount per month');
    amountWrapper.appendChild(prefix);
    amountWrapper.appendChild(amountInput);
    amountCell.appendChild(amountWrapper);

    const actionsCell = document.createElement('td');
    actionsCell.className = 'row-actions';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'icon-btn';
    removeBtn.setAttribute('data-remove', '');
    removeBtn.textContent = '×';
    actionsCell.appendChild(removeBtn);

    row.appendChild(sourceCell);
    row.appendChild(amountCell);
    row.appendChild(actionsCell);
    return row;
  }

  function onAddIncome() {
    if (!incomeTableBody) return;

    const selectedMode = document.querySelector('input[name="familyMode"]:checked').value;

    if (selectedMode === 'couple') {
      createCoupleIncomeRow();
    } else {
      createIndividualIncomeRow();
    }

    updateTotalIncome(); // Update total when adding new income
  }

  // Function to calculate and update total income
  function updateTotalIncome() {
    if (!totalIncomeAmount || !incomeTableBody) return;
    
    let total = 0;
    Array.from(incomeTableBody.querySelectorAll('tr')).forEach((tr) => {
      const amountInput = tr.querySelector('input[name="incomeAmount[]"]');
      if (amountInput) {
        const value = parseFloat(amountInput.value || '0');
        if (!isNaN(value)) {
          total += value;
        }
      }
    });
    
    // Format the total with proper currency formatting
    totalIncomeAmount.textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  if (addIncomeButton) {
    addIncomeButton.addEventListener('click', onAddIncome);
  }
  
  function toNumberOrNull(value) {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(value);
    return Number.isFinite(num) && num >= 0 ? num : null; // Only allow positive numbers
  }

  // Input sanitization function
  function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>\"'&]/g, ''); // Remove potentially dangerous characters
  }

  // Validate and sanitize form data
  function validateFormData(data) {
    const validated = { ...data };
    
    // Sanitize basic info
    if (validated.basic) {
      if (validated.basic.fullName) {
        validated.basic.fullName = sanitizeInput(validated.basic.fullName);
      }
      if (validated.basic.city) {
        validated.basic.city = sanitizeInput(validated.basic.city);
      }
      // Validate age and retirement age
      if (validated.basic.age) {
        const age = parseInt(validated.basic.age);
        if (age < 18 || age > 100) {
          console.warn('Invalid age provided:', age);
          validated.basic.age = Math.max(18, Math.min(100, age));
        }
      }
      if (validated.basic.retirementAge) {
        const retAge = parseInt(validated.basic.retirementAge);
        if (retAge < 50 || retAge > 80) {
          console.warn('Invalid retirement age provided:', retAge);
          validated.basic.retirementAge = Math.max(50, Math.min(80, retAge));
        }
      }
    }
    
    return validated;
  }

  // Annual input is user-entered; remove auto-calc from monthly

  function bindAnnualCalculations(root) {
    if (!root) return;
    const monthlyInputs = root.querySelectorAll('[data-monthly]');
    monthlyInputs.forEach((input) => {
      input.addEventListener('input', () => {
        recalcTotals();
      });
    });
    const annualInputs = root.querySelectorAll('[data-annual]');
    annualInputs.forEach((input) => {
      if (input.hasAttribute('readonly')) {
        input.removeAttribute('readonly');
      }
      input.addEventListener('input', recalcTotals);
    });
  }

  function getYearsToRetirement() {
    const selectedMode = document.querySelector('input[name="familyMode"]:checked').value;

    if (selectedMode === 'couple') {
      const husbandAge = toNumberOrNull(document.getElementById('husbandAge') && document.getElementById('husbandAge').value);
      const husbandRetAge = toNumberOrNull(document.getElementById('husbandRetirementAge') && document.getElementById('husbandRetirementAge').value);
      const wifeAge = toNumberOrNull(document.getElementById('wifeAge') && document.getElementById('wifeAge').value);
      const wifeRetAge = toNumberOrNull(document.getElementById('wifeRetirementAge') && document.getElementById('wifeRetirementAge').value);

      if (husbandAge !== null && husbandRetAge !== null && wifeAge !== null && wifeRetAge !== null) {
        const husbandYears = Math.max(0, husbandRetAge - husbandAge);
        const wifeYears = Math.max(0, wifeRetAge - wifeAge);
        // Return the maximum years to retirement (when both have retired)
        return Math.max(husbandYears, wifeYears);
      }
      return 0;
    } else {
      const age = toNumberOrNull(ageInput && ageInput.value);
      const retAge = toNumberOrNull(retirementAgeInput && retirementAgeInput.value);
      if (age === null || retAge === null) return 0;
      const years = Math.max(0, retAge - age);
      return years;
    }
  }

  function getInflationForItem(row) {
    const label = row.querySelector('td span');
    if (!label) return 0;
    const name = label.textContent && label.textContent.trim();
    const rate = itemInflationRates[name];
    return typeof rate === 'number' ? rate : 0;
  }

  // Function to calculate additional monthly expenses from insurance, investments, and EMIs
  function calculateAdditionalMonthlyExpenses() {
    let additionalCurrentMonthly = 0;
    let additionalPostRetMonthly = 0;
    const years = getYearsToRetirement();

    // Add insurance premiums
    if (insuranceTbody) {
      Array.from(insuranceTbody.querySelectorAll('tr')).forEach((tr) => {
        const premium = parseFloat((tr.querySelector('input[name="insPremium[]"]') || {}).value || '') || 0;
        const mode = (tr.querySelector('select[name="insMode[]"]') || {}).value || '';
        
        if (premium > 0) {
          const monthlyPremium = convertToMonthly(premium, mode);
          additionalCurrentMonthly += monthlyPremium;
          // Insurance typically continues in retirement with inflation
          const inflatedPremium = monthlyPremium * Math.pow(1.05, years); // 5% inflation for insurance
          additionalPostRetMonthly += inflatedPremium;
        }
      });
    }

    // Investments are NOT expenses - they are handled separately in surplus calculation
    // Removed investment calculation from expense totals

    // EMIs are now handled separately in the surplus calculation, not as additional expenses

    return { additionalCurrentMonthly, additionalPostRetMonthly };
  }

  function recalcTotals() {
    if (!expensesTbody) return;
    const rows = Array.from(expensesTbody.querySelectorAll('tr'));
    let currentMonthlyTotal = 0;
    let postRetMonthlyTotal = 0;
    const years = getYearsToRetirement();

    rows.forEach((row) => {
      const annualEl = row.querySelector('[data-annual]');
      const monthlyEl = row.querySelector('[data-monthly]');
      const contCheckbox = row.querySelector('input[type="checkbox"][name="expenseRetirement[]"]');
      const cellWithSubsection = row.querySelector('td[data-subsection]');
      if (!annualEl || !monthlyEl || !cellWithSubsection) return; // skip header/separator rows

      const monthlyVal = toNumberOrNull(monthlyEl.value) || 0;
      const annualVal = toNumberOrNull(annualEl.value) || 0;
      currentMonthlyTotal += monthlyVal + (annualVal / 12);

      if (contCheckbox && contCheckbox.checked) {
        const inflationRate = getInflationForItem(row) / 100;
        const baseMonthly = monthlyVal + (annualVal / 12);
        const inflatedMonthly = baseMonthly * Math.pow(1 + inflationRate, years);
        postRetMonthlyTotal += inflatedMonthly;
      }
    });

    // Add additional monthly expenses from insurance, investments, and EMIs
    const additionalExpenses = calculateAdditionalMonthlyExpenses();
    currentMonthlyTotal += additionalExpenses.additionalCurrentMonthly;
    postRetMonthlyTotal += additionalExpenses.additionalPostRetMonthly;

    const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n));
    if (totalCurrentMonthlyText) totalCurrentMonthlyText.textContent = `₹${fmt(currentMonthlyTotal)}`;
    if (totalPostRetMonthlyText) totalPostRetMonthlyText.textContent = `₹${fmt(postRetMonthlyTotal)}`;
  }

  // Bind listeners for totals recalculation triggers
  if (ageInput) ageInput.addEventListener('input', recalcTotals);
  if (retirementAgeInput) retirementAgeInput.addEventListener('input', recalcTotals);

  // Bind listeners for couple mode fields
  const husbandAgeInput = document.getElementById('husbandAge');
  const wifeAgeInput = document.getElementById('wifeAge');
  const husbandRetirementAgeInput = document.getElementById('husbandRetirementAge');
  const wifeRetirementAgeInput = document.getElementById('wifeRetirementAge');

  if (husbandAgeInput) husbandAgeInput.addEventListener('input', recalcTotals);
  if (wifeAgeInput) wifeAgeInput.addEventListener('input', recalcTotals);
  if (husbandRetirementAgeInput) husbandRetirementAgeInput.addEventListener('input', recalcTotals);
  if (wifeRetirementAgeInput) wifeRetirementAgeInput.addEventListener('input', recalcTotals);
  if (incomeTableBody) {
    incomeTableBody.addEventListener('input', updateTotalIncome);
  }
  if (expensesTbody) {
    expensesTbody.addEventListener('input', recalcTotals);
    expensesTbody.addEventListener('change', (e) => {
      const target = e.target;
      if (target && target.matches('input[type="checkbox"][name="expenseRetirement[]"]')) {
        recalcTotals();
      }
    });
  }

  // Add event listeners for insurance, investment, and asset changes
  if (insuranceTbody) {
    insuranceTbody.addEventListener('input', recalcTotals);
    insuranceTbody.addEventListener('change', recalcTotals);
  }
  if (investmentsTbody) {
    investmentsTbody.addEventListener('input', recalcTotals);
    investmentsTbody.addEventListener('change', recalcTotals);
  }
  if (assetsTbody) {
    assetsTbody.addEventListener('input', recalcTotals);
    assetsTbody.addEventListener('change', recalcTotals);
  }

  bindAnnualCalculations(expensesTbody);
  
  // Initialize the page
  function initializePage() {
    // Check if there's saved data first
    const savedData = localStorage.getItem('we_step1');

    if (savedData) {
      // If we have saved data, load it instead of initializing defaults
      loadSavedData();
    } else {
      // Only initialize defaults if no saved data exists
      const selectedMode = document.querySelector('input[name="familyMode"]:checked');
      if (!selectedMode) {
        const individualRadio = document.getElementById('individual');
        if (individualRadio) individualRadio.checked = true;
      }

      // Ensure individual income row exists by default
      if (incomeTableBody && incomeTableBody.children.length === 0) {
        createIndividualIncomeRow();
      }

      // Apply initial mode settings
      toggleFamilyMode();
    }

    recalcTotals();
  }

  // Auto-save data when users make changes
  setupAutoSave();

  // Initialize the page
  initializePage();

  // --- Dynamic rows helpers ---
  function onRemoveRow(e) {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    const row = btn.closest('tr');
    if (row && row.parentElement) {
      row.parentElement.removeChild(row);
      recalcTotals();
      updateTotalIncome(); // Update income total when removing income rows
    }
  }

  function createInsuranceRow() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" name="insPolicy[]" placeholder="e.g., Life Cover" /></td>
      <td>
        <select name="insType[]">
          <option value="Term">Term</option>
          <option value="Health">Health</option>
          <option value="ULIP">ULIP</option>
          <option value="Endowment">Endowment</option>
        </select>
      </td>
      <td><input type="number" name="insSum[]" min="0" step="1" placeholder="1000000" /></td>
      <td><input type="number" name="insPremium[]" min="0" step="1" placeholder="5000" /></td>
      <td><input type="number" name="insTerm[]" min="0" step="1" placeholder="20" /></td>
      <td>
        <select name="insMode[]">
          <option value="Monthly">Month</option>
          <option value="Quarterly">Quarter</option>
          <option value="Yearly">Year</option>
        </select>
      </td>
      <td class="row-actions"><button type="button" class="icon-btn" data-remove>×</button></td>
    `;
    return tr;
  }

  function createInvestmentRow() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" name="invName[]" placeholder="e.g., EPF" /></td>
      <td><input type="number" name="invCurrent[]" min="0" step="1" placeholder="100000" /></td>
      <td><input type="number" name="invReturn[]" min="0" step="0.1" placeholder="8" /></td>
      <td><input type="number" name="invAmount[]" min="0" step="1" placeholder="1500" /></td>
      <td>
        <select name="invType[]">
          <option value="Select">Select Type</option>
          <option value="Equity MF">Equity MF</option>
          <option value="Debt MF">Debt MF</option>
          <option value="FD">FD</option>
          <option value="PPF">PPF</option>
          <option value="EPF">EPF</option>
          <option value="Stocks">Stocks</option>
        </select>
      </td>
      <td>
        <select name="invMode[]">
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Yearly">Yearly</option>
        </select>
      </td>
      <td class="row-actions"><button type="button" class="icon-btn" data-remove>×</button></td>
    `;
    return tr;
  }

  function createAssetRow() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" name="assetName[]" placeholder="e.g., Home Loan" /></td>
      <td>
        <select name="assetType[]">
          <option value="Asset">Asset</option>
          <option value="Liability">Liability</option>
        </select>
      </td>
      <td><input type="number" name="assetValue[]" min="0" step="1" placeholder="Value" /></td>
      <td><input type="number" name="assetEmi[]" min="0" step="1" placeholder="EMI" /></td>
      <td class="row-actions"><button type="button" class="icon-btn" data-remove>×</button></td>
    `;
    return tr;
  }

  const addInsuranceBtn = document.getElementById('add-insurance');
  const addInvestmentBtn = document.getElementById('add-investment');
  const addAssetBtn = document.getElementById('add-asset');
  const nextBtn = document.getElementById('go-next');

  if (incomeTableBody) {
    incomeTableBody.addEventListener('click', onRemoveRow);
  }
  if (insuranceTbody) {
    insuranceTbody.addEventListener('click', onRemoveRow);
  }
  if (investmentsTbody) {
    investmentsTbody.addEventListener('click', onRemoveRow);
  }
  if (assetsTbody) {
    assetsTbody.addEventListener('click', onRemoveRow);
  }

  // --- Assets & Liabilities: toggle EMI field based on Type ---
  function updateAssetRowEmi(row) {
    if (!row) return;
    const typeSelect = row.querySelector('select[name="assetType[]"]');
    const emiInput = row.querySelector('input[name="assetEmi[]"]');
    if (!typeSelect || !emiInput) return;
    const isAsset = (typeSelect.value || '').toLowerCase() === 'asset';
    emiInput.disabled = isAsset;
    emiInput.placeholder = isAsset ? 'N/A' : 'EMI';
    if (isAsset) emiInput.value = '';
  }

  if (assetsTbody) {
    // Initialize existing rows
    Array.from(assetsTbody.querySelectorAll('tr')).forEach(updateAssetRowEmi);
    // React to changes
    assetsTbody.addEventListener('change', (e) => {
      const select = e.target && e.target.matches('select[name="assetType[]"]') ? e.target : null;
      if (select) updateAssetRowEmi(select.closest('tr'));
    });
  }

  if (addInsuranceBtn && insuranceTbody) {
    addInsuranceBtn.addEventListener('click', () => {
      insuranceTbody.appendChild(createInsuranceRow());
    });
  }

  if (addInvestmentBtn && investmentsTbody) {
    addInvestmentBtn.addEventListener('click', () => {
      investmentsTbody.appendChild(createInvestmentRow());
    });
  }

  if (addAssetBtn && assetsTbody) {
    addAssetBtn.addEventListener('click', () => {
      const tr = createAssetRow();
      assetsTbody.appendChild(tr);
      updateAssetRowEmi(tr);
    });
  }

  // Function to convert different payment modes to monthly equivalents
  function convertToMonthly(amount, mode) {
    if (!amount || amount <= 0) return 0;
    
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
        return amount; // Default to monthly if unknown
    }
  }

  function loadSavedData() {
    try {
      const savedData = localStorage.getItem('we_step1');
      if (!savedData) {
        console.log('No saved data found for Step 1');
        return;
      }
      
      const data = JSON.parse(savedData);
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        console.warn('Invalid saved data structure, resetting...');
        localStorage.removeItem('we_step1');
        return;
      }
      
      // Set family mode first
      if (data.familyMode) {
        const familyModeRadio = document.querySelector(`input[name="familyMode"][value="${data.familyMode}"]`);
        if (familyModeRadio) {
          familyModeRadio.checked = true;
          // Update toggle animation after setting radio button
          updateToggleAnimation();
          // Apply the mode changes but don't create default rows yet
          const selectedMode = data.familyMode;
          if (selectedMode === 'couple') {
            individualFields.style.display = 'none';
            coupleFields.style.display = 'contents';
            incomeHeaderIndividual.style.display = 'none';
            incomeHeaderCouple.style.display = 'table-row';
          } else {
            individualFields.style.display = 'contents';
            coupleFields.style.display = 'none';
            incomeHeaderIndividual.style.display = 'table-row';
            incomeHeaderCouple.style.display = 'none';
          }
        }
      }

      // Load basic details
      if (data.basic) {
        if (data.familyMode === 'couple') {
          // Load couple data
          const husbandName = document.getElementById('husbandName');
          const wifeName = document.getElementById('wifeName');
          const husbandAge = document.getElementById('husbandAge');
          const wifeAge = document.getElementById('wifeAge');
          const cityCouple = document.getElementById('cityCouple');
          const husbandRetirementAge = document.getElementById('husbandRetirementAge');
          const wifeRetirementAge = document.getElementById('wifeRetirementAge');

          if (husbandName && data.basic.husbandName) husbandName.value = data.basic.husbandName;
          if (wifeName && data.basic.wifeName) wifeName.value = data.basic.wifeName;
          if (husbandAge && data.basic.husbandAge) husbandAge.value = data.basic.husbandAge;
          if (wifeAge && data.basic.wifeAge) wifeAge.value = data.basic.wifeAge;
          if (cityCouple && data.basic.city) cityCouple.value = data.basic.city;
          if (husbandRetirementAge && data.basic.husbandRetirementAge) husbandRetirementAge.value = data.basic.husbandRetirementAge;
          if (wifeRetirementAge && data.basic.wifeRetirementAge) wifeRetirementAge.value = data.basic.wifeRetirementAge;
        } else {
          // Load individual data
          const fullName = document.getElementById('fullName');
          const age = document.getElementById('age');
          const city = document.getElementById('city');
          const retirementAge = document.getElementById('retirementAge');
          const maritalStatus = document.getElementById('maritalStatus');

          if (fullName && data.basic.fullName) fullName.value = data.basic.fullName;
          if (age && data.basic.age) age.value = data.basic.age;
          if (city && data.basic.city) city.value = data.basic.city;
          if (retirementAge && data.basic.retirementAge) retirementAge.value = data.basic.retirementAge;
          if (maritalStatus && data.basic.maritalStatus) maritalStatus.value = data.basic.maritalStatus;
        }
      }
      
      // Load income data
      if (incomeTableBody) {
        // Clear existing rows
        incomeTableBody.innerHTML = '';

        if (data.income && data.income.length > 0) {
          // Add saved income entries
          data.income.forEach((income) => {
            let newRow;
            if (data.familyMode === 'couple') {
              newRow = document.createElement('tr');
              newRow.className = 'income-row-couple';

              // Create with dropdown structure
              const sourceCell = document.createElement('td');
              const sourceSelect = document.createElement('select');
              sourceSelect.name = 'incomeSource[]';
              sourceSelect.className = 'income-source-select';

              const incomeOptions = [
                { value: '', label: '-- Select Source --' },
                { value: 'Salary', label: 'Salary' },
                { value: 'Business Income', label: 'Business Income' },
                { value: 'Rental Income', label: 'Rental Income' },
                { value: 'Freelance/Consulting', label: 'Freelance/Consulting' },
                { value: 'Interest Income', label: 'Interest Income' },
                { value: 'Dividend Income', label: 'Dividend Income' },
                { value: 'Other', label: 'Other (Specify)' }
              ];

              incomeOptions.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.label;
                sourceSelect.appendChild(opt);
              });

              const otherInput = document.createElement('input');
              otherInput.type = 'text';
              otherInput.name = 'incomeSourceOther[]';
              otherInput.placeholder = 'Specify income source';
              otherInput.className = 'income-source-other';

              // Set the value based on saved data
              const predefinedOptions = ['Salary', 'Business Income', 'Rental Income', 'Freelance/Consulting', 'Interest Income', 'Dividend Income'];
              if (income.name && predefinedOptions.includes(income.name)) {
                sourceSelect.value = income.name;
              } else if (income.name) {
                sourceSelect.value = 'Other';
                otherInput.classList.add('show');
                otherInput.value = income.name;
                otherInput.required = true;
              }

              sourceSelect.addEventListener('change', function() {
                if (this.value === 'Other') {
                  // Use setTimeout to trigger smooth animation
                  setTimeout(() => {
                    otherInput.classList.add('show');
                  }, 10);
                  otherInput.required = true;
                } else {
                  otherInput.classList.remove('show');
                  otherInput.required = false;
                  otherInput.value = '';
                }
              });

              sourceCell.appendChild(sourceSelect);
              sourceCell.appendChild(otherInput);

              const ownerCell = document.createElement('td');
              ownerCell.innerHTML = `
                <select name="incomeOwner[]" aria-label="Whose income">
                  <option value="">Select</option>
                  <option value="husband" ${income.owner === 'husband' ? 'selected' : ''}>Husband</option>
                  <option value="wife" ${income.owner === 'wife' ? 'selected' : ''}>Wife</option>
                </select>
              `;

              const amountCell = document.createElement('td');
              amountCell.innerHTML = `
                <div class="amount-input">
                  <span class="prefix">₹</span>
                  <input type="number" name="incomeAmount[]" value="${income.value || ''}" min="0" step="0.01" placeholder="0.00" aria-label="Amount per month" />
                </div>
              `;

              const actionsCell = document.createElement('td');
              actionsCell.className = 'row-actions';
              actionsCell.innerHTML = '<button type="button" class="icon-btn" data-remove>×</button>';

              newRow.appendChild(sourceCell);
              newRow.appendChild(ownerCell);
              newRow.appendChild(amountCell);
              newRow.appendChild(actionsCell);
            } else {
              newRow = createIncomeRow();
              const sourceSelect = newRow.querySelector('select[name="incomeSource[]"]');
              const sourceOther = newRow.querySelector('input[name="incomeSourceOther[]"]');
              const amountInput = newRow.querySelector('input[name="incomeAmount[]"]');

              if (sourceSelect && income.name) {
                // Check if the income name matches any predefined option
                const predefinedOptions = ['Salary', 'Business Income', 'Rental Income', 'Freelance/Consulting', 'Interest Income', 'Dividend Income'];
                if (predefinedOptions.includes(income.name)) {
                  sourceSelect.value = income.name;
                } else {
                  // It's a custom source, select "Other" and fill the text input
                  sourceSelect.value = 'Other';
                  if (sourceOther) {
                    sourceOther.classList.add('show');
                    sourceOther.value = income.name;
                    sourceOther.required = true;
                  }
                }
              }

              if (amountInput) amountInput.value = income.value || '';
            }
            incomeTableBody.appendChild(newRow);
          });
        } else {
          // If no income data, add at least one row
          if (data.familyMode === 'couple') {
            createCoupleIncomeRow();
          } else {
            createIndividualIncomeRow();
          }
        }

        // Update total income after loading data
        updateTotalIncome();
      }
      
      // Load expense data
      if (data.expenses && expensesTbody) {
        const expenseRows = expensesTbody.querySelectorAll('tr');
        let expenseIndex = 0;
        
        expenseRows.forEach((row) => {
          const monthlyEl = row.querySelector('[data-monthly]');
          const annualEl = row.querySelector('[data-annual]');
          const contCheckbox = row.querySelector('input[type="checkbox"][name="expenseRetirement[]"]');
          
          if (monthlyEl && annualEl && data.expenses[expenseIndex]) {
            const expense = data.expenses[expenseIndex];
            monthlyEl.value = expense.monthly || '';
            annualEl.value = expense.annual || '';
            if (contCheckbox) contCheckbox.checked = expense.continues || false;
            expenseIndex++;
          }
        });
      }
      
      // Load insurance data
      if (data.insurances && insuranceTbody) {
        // Clear existing rows except the first one
        const existingRows = insuranceTbody.querySelectorAll('tr');
        for (let i = 1; i < existingRows.length; i++) {
          existingRows[i].remove();
        }
        
        data.insurances.forEach((insurance, index) => {
          if (index === 0) {
            // Update first row
            const firstRow = insuranceTbody.querySelector('tr');
            const inputs = firstRow.querySelectorAll('input, select');
            if (inputs[0]) inputs[0].value = insurance.policy || '';
            if (inputs[1]) inputs[1].value = insurance.type || '';
            if (inputs[2]) inputs[2].value = insurance.sum || '';
            if (inputs[3]) inputs[3].value = insurance.premium || '';
            if (inputs[4]) inputs[4].value = insurance.term || '';
            if (inputs[5]) inputs[5].value = insurance.mode || '';
          } else {
            // Add new rows
            const newRow = createInsuranceRow();
            const inputs = newRow.querySelectorAll('input, select');
            if (inputs[0]) inputs[0].value = insurance.policy || '';
            if (inputs[1]) inputs[1].value = insurance.type || '';
            if (inputs[2]) inputs[2].value = insurance.sum || '';
            if (inputs[3]) inputs[3].value = insurance.premium || '';
            if (inputs[4]) inputs[4].value = insurance.term || '';
            if (inputs[5]) inputs[5].value = insurance.mode || '';
            insuranceTbody.appendChild(newRow);
          }
        });
      }
      
      // Load investment data
      if (data.investments && investmentsTbody) {
        // Clear existing rows except the first one
        const existingRows = investmentsTbody.querySelectorAll('tr');
        for (let i = 1; i < existingRows.length; i++) {
          existingRows[i].remove();
        }
        
        data.investments.forEach((investment, index) => {
          if (index === 0) {
            // Update first row
            const firstRow = investmentsTbody.querySelector('tr');
            const inputs = firstRow.querySelectorAll('input, select');
            if (inputs[0]) inputs[0].value = investment.name || '';
            if (inputs[1]) inputs[1].value = investment.current || '';
            if (inputs[2]) inputs[2].value = investment.returnPct || '';
            if (inputs[3]) inputs[3].value = investment.amount || '';
            if (inputs[4]) inputs[4].value = investment.type || '';
            if (inputs[5]) inputs[5].value = investment.mode || '';
          } else {
            // Add new rows
            const newRow = createInvestmentRow();
            const inputs = newRow.querySelectorAll('input, select');
            if (inputs[0]) inputs[0].value = investment.name || '';
            if (inputs[1]) inputs[1].value = investment.current || '';
            if (inputs[2]) inputs[2].value = investment.returnPct || '';
            if (inputs[3]) inputs[3].value = investment.amount || '';
            if (inputs[4]) inputs[4].value = investment.type || '';
            if (inputs[5]) inputs[5].value = investment.mode || '';
            investmentsTbody.appendChild(newRow);
          }
        });
      }
      
      // Load assets data
      if (data.assets && assetsTbody) {
        // Clear existing rows except the first one
        const existingRows = assetsTbody.querySelectorAll('tr');
        for (let i = 1; i < existingRows.length; i++) {
          existingRows[i].remove();
        }
        
        data.assets.forEach((asset, index) => {
          if (index === 0) {
            // Update first row
            const firstRow = assetsTbody.querySelector('tr');
            const inputs = firstRow.querySelectorAll('input, select');
            if (inputs[0]) inputs[0].value = asset.name || '';
            if (inputs[1]) inputs[1].value = asset.type || '';
            if (inputs[2]) inputs[2].value = asset.value || '';
            if (inputs[3]) inputs[3].value = asset.emi || '';
            updateAssetRowEmi(firstRow);
          } else {
            // Add new rows
            const newRow = createAssetRow();
            const inputs = newRow.querySelectorAll('input, select');
            if (inputs[0]) inputs[0].value = asset.name || '';
            if (inputs[1]) inputs[1].value = asset.type || '';
            if (inputs[2]) inputs[2].value = asset.value || '';
            if (inputs[3]) inputs[3].value = asset.emi || '';
            updateAssetRowEmi(newRow);
            assetsTbody.appendChild(newRow);
          }
        });
      }
      
    } catch (e) {
      console.error('Error loading saved data:', e);
      // Show user-friendly error message
      const errorMsg = document.createElement('div');
      errorMsg.className = 'error-banner';
      errorMsg.innerHTML = `
        <p><strong>Warning:</strong> There was an issue loading your saved data.
        Please refresh the page and re-enter your information.</p>
      `;
      const container = document.querySelector('.container') || document.body;
      container.insertBefore(errorMsg, container.firstChild);
    }

    // Rebind event listeners after loading data
    bindAnnualCalculations(expensesTbody);

    // Ensure toggle animation is synced after all data is loaded
    setTimeout(() => {
      updateToggleAnimation();
    }, 100);
  }

  function setupAutoSave() {
    // Auto-save data every 2 seconds when users make changes
    let saveTimeout;
    let saveErrorCount = 0;
    const maxSaveErrors = 3;
    
    function autoSave() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        try {
          const data = serializeStep1();
          const dataString = JSON.stringify(data);
          
          // Check if data is too large for localStorage
          if (dataString.length > 5 * 1024 * 1024) { // 5MB limit
            console.warn('Data too large for localStorage, skipping auto-save');
            return;
          }
          
          localStorage.setItem('we_step1', dataString);
          saveErrorCount = 0; // Reset error count on successful save
        } catch (e) {
          saveErrorCount++;
          console.error('Error auto-saving data:', e);
          
          if (saveErrorCount >= maxSaveErrors) {
            console.error('Too many auto-save errors, disabling auto-save');
            // Disable auto-save to prevent further errors
            return;
          }
        }
      }, 2000);
    }
    
    // Add auto-save listeners to all input fields
    const allInputs = document.querySelectorAll('input, select');
    allInputs.forEach(input => {
      input.addEventListener('input', autoSave);
      input.addEventListener('change', autoSave);
    });
  }

  function serializeStep1() {
    const data = { basic: {}, income: [], expenses: [], insurances: [], investments: [], assets: [] };
    const selectedMode = document.querySelector('input[name="familyMode"]:checked').value;

    // Store family mode
    data.familyMode = selectedMode;

    if (selectedMode === 'couple') {
      // Couple mode data
      const husbandName = document.getElementById('husbandName');
      const wifeName = document.getElementById('wifeName');
      const husbandAge = document.getElementById('husbandAge');
      const wifeAge = document.getElementById('wifeAge');
      const cityCouple = document.getElementById('cityCouple');
      const husbandRetirementAge = document.getElementById('husbandRetirementAge');
      const wifeRetirementAge = document.getElementById('wifeRetirementAge');

      data.basic = {
        husbandName: husbandName && sanitizeInput(husbandName.value) || '',
        wifeName: wifeName && sanitizeInput(wifeName.value) || '',
        husbandAge: husbandAge && husbandAge.value || '',
        wifeAge: wifeAge && wifeAge.value || '',
        city: cityCouple && sanitizeInput(cityCouple.value) || '',
        husbandRetirementAge: husbandRetirementAge && husbandRetirementAge.value || '',
        wifeRetirementAge: wifeRetirementAge && wifeRetirementAge.value || ''
      };
    } else {
      // Individual mode data
      const fullName = document.getElementById('fullName');
      const age = document.getElementById('age');
      const city = document.getElementById('city');
      const retirementAge = document.getElementById('retirementAge');
      const maritalStatus = document.getElementById('maritalStatus');

      data.basic = {
        fullName: fullName && sanitizeInput(fullName.value) || '',
        age: age && age.value || '',
        city: city && sanitizeInput(city.value) || '',
        retirementAge: retirementAge && retirementAge.value || '',
        maritalStatus: maritalStatus && maritalStatus.value || ''
      };
    }
    
    if (incomeTableBody) {
      Array.from(incomeTableBody.querySelectorAll('tr')).forEach((tr) => {
        // Try to find dropdown first (new format), fallback to text input (old format)
        const srcSelect = tr.querySelector('select[name="incomeSource[]"]');
        const srcInput = tr.querySelector('input[name="incomeSource[]"]');
        const srcOther = tr.querySelector('input[name="incomeSourceOther[]"]');
        const amt = tr.querySelector('input[name="incomeAmount[]"]');
        const owner = tr.querySelector('select[name="incomeOwner[]"]'); // For couple mode

        // Get income source name
        let name = '';
        if (srcSelect) {
          // New dropdown format
          if (srcSelect.value === 'Other' && srcOther && srcOther.value) {
            name = srcOther.value.trim();
          } else {
            name = srcSelect.value;
          }
        } else if (srcInput) {
          // Old text input format (for backward compatibility)
          name = srcInput.value;
        }

        const value = amt && parseFloat(amt.value || '');
        const ownerValue = owner && owner.value;

        if (name) {
          const incomeItem = { name, value: Number.isFinite(value) ? value : 0 };
          if (selectedMode === 'couple' && ownerValue) {
            incomeItem.owner = ownerValue;
          }
          data.income.push(incomeItem);
        }
      });
    }

    if (expensesTbody) {
      Array.from(expensesTbody.querySelectorAll('tr')).forEach((tr) => {
        const label = tr.querySelector('td span');
        const monthly = tr.querySelector('[data-monthly]');
        const annual = tr.querySelector('[data-annual]');
        const cont = tr.querySelector('input[name="expenseRetirement[]"]');
        if (!label || !monthly || !annual) return;
        const name = label.textContent.trim();
        const m = parseFloat(monthly.value || '');
        const a = parseFloat(annual.value || '');
        data.expenses.push({ name, monthly: Number.isFinite(m) ? m : 0, annual: Number.isFinite(a) ? a : 0, continues: !!(cont && cont.checked) });
      });
    }

    // Insurance premiums are NOT added to expenses array - they are handled separately
    // Users should manually add insurance premiums to Monthly Detail Expenses if they want them counted
    // This prevents double-counting since users already enter them in the expenses section

    // Investments are NOT expenses - they are handled separately in surplus calculation
    // Removed investment addition to expenses array

    // EMIs are handled separately in the surplus calculation, not as regular expenses

    if (insuranceTbody) {
      Array.from(insuranceTbody.querySelectorAll('tr')).forEach((tr) => {
        data.insurances.push({
          policy: (tr.querySelector('input[name="insPolicy[]"]') || {}).value || '',
          type: (tr.querySelector('select[name="insType[]"]') || {}).value || '',
          sum: parseFloat((tr.querySelector('input[name="insSum[]"]') || {}).value || '') || 0,
          premium: parseFloat((tr.querySelector('input[name="insPremium[]"]') || {}).value || '') || 0,
          term: parseFloat((tr.querySelector('input[name="insTerm[]"]') || {}).value || '') || 0,
          mode: (tr.querySelector('select[name="insMode[]"]') || {}).value || ''
        });
      });
    }

    if (investmentsTbody) {
      Array.from(investmentsTbody.querySelectorAll('tr')).forEach((tr) => {
        data.investments.push({
          name: (tr.querySelector('input[name="invName[]"]') || {}).value || '',
          current: parseFloat((tr.querySelector('input[name="invCurrent[]"]') || {}).value || '') || 0,
          returnPct: parseFloat((tr.querySelector('input[name="invReturn[]"]') || {}).value || '') || 0,
          amount: parseFloat((tr.querySelector('input[name="invAmount[]"]') || {}).value || '') || 0,
          type: (tr.querySelector('select[name="invType[]"]') || {}).value || '',
          mode: (tr.querySelector('select[name="invMode[]"]') || {}).value || ''
        });
      });
    }

    if (assetsTbody) {
      Array.from(assetsTbody.querySelectorAll('tr')).forEach((tr) => {
        data.assets.push({
          name: (tr.querySelector('input[name="assetName[]"]') || {}).value || '',
          type: (tr.querySelector('select[name="assetType[]"]') || {}).value || '',
          value: parseFloat((tr.querySelector('input[name="assetValue[]"]') || {}).value || '') || 0,
          emi: parseFloat((tr.querySelector('input[name="assetEmi[]"]') || {}).value || '') || 0
        });
      });
    }
    
    // Validate the data before returning
    return validateFormData(data);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const data = serializeStep1();
      try { localStorage.setItem('we_step1', JSON.stringify(data)); } catch (e) {}
      window.location.href = 'snapshot.html';
    });
  }

  // Reset Form Functionality
  const resetBtn = document.getElementById('reset-form');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Confirm before resetting
      if (confirm('Are you sure you want to reset all fields? This action cannot be undone.')) {
        resetAllFields();
      }
    });
  }

  function resetAllFields() {
    console.log('Starting reset...');

    // First, clear ALL inputs regardless of current mode
    console.log('Clearing all inputs...');
    const allInputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"]');
    allInputs.forEach(input => {
      input.value = '';
    });

    // Reset all select dropdowns to first option
    console.log('Resetting selects...');
    const allSelects = document.querySelectorAll('select');
    allSelects.forEach(select => {
      select.selectedIndex = 0;
    });

    // Reset basic details fields specifically (for good measure)
    const basicFields = [
      'fullName', 'age', 'city', 'retirementAge', 'maritalStatus',
      'husbandName', 'wifeName', 'husbandAge', 'wifeAge', 'cityCouple',
      'husbandRetirementAge', 'wifeRetirementAge'
    ];

    basicFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        if (field.type === 'select-one') {
          field.selectedIndex = 0;
        } else {
          field.value = '';
        }
      }
    });

    // Reset family mode toggle to Individual
    const individualRadio = document.getElementById('individual');
    if (individualRadio) {
      individualRadio.checked = true;
      // Trigger the family mode change to update UI
      setTimeout(() => {
        updateToggleAnimation();
        toggleFamilyMode();
      }, 100);
    }

    // Additional clearing to make sure everything is reset
    console.log('Final clearing pass...');
    setTimeout(() => {
      // Clear everything again after family mode switch
      const finalInputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"]');
      finalInputs.forEach(input => {
        input.value = '';
      });

      const finalSelects = document.querySelectorAll('select');
      finalSelects.forEach(select => {
        select.selectedIndex = 0;
      });
    }, 200);

    // Reset expense checkboxes to checked (default state)
    console.log('Resetting checkboxes...');
    const retirementCheckboxes = document.querySelectorAll('input[name="expenseRetirement[]"]');
    retirementCheckboxes.forEach(checkbox => {
      checkbox.checked = true;
    });

    // Clear income table completely
    console.log('Clearing income table...');
    console.log('incomeTableBody:', incomeTableBody);
    if (incomeTableBody) {
      incomeTableBody.innerHTML = '';
      console.log('Income table cleared');
    }

    // Clear expenses table number inputs
    console.log('Clearing expense inputs...');
    if (expensesTbody) {
      const expenseInputs = expensesTbody.querySelectorAll('input[type="number"]');
      expenseInputs.forEach(input => {
        input.value = '';
      });
      console.log('Expense inputs cleared');
    }

    // Clear insurance table and add one blank row
    console.log('Clearing insurance table...');
    console.log('insuranceTbody:', insuranceTbody);
    if (insuranceTbody) {
      insuranceTbody.innerHTML = '';
      // Add one blank insurance row
      insuranceTbody.appendChild(createInsuranceRow());
      console.log('Insurance table cleared and blank row added');
    }

    // Clear investments table and add one blank row
    console.log('Clearing investments table...');
    console.log('investmentsTbody:', investmentsTbody);
    if (investmentsTbody) {
      investmentsTbody.innerHTML = '';
      // Add one blank investment row
      investmentsTbody.appendChild(createInvestmentRow());
      console.log('Investments table cleared and blank row added');
    }

    // Clear assets table and add one blank row
    console.log('Clearing assets table...');
    console.log('assetsTbody:', assetsTbody);
    if (assetsTbody) {
      assetsTbody.innerHTML = '';
      // Add one blank asset row
      const assetRow = createAssetRow();
      assetsTbody.appendChild(assetRow);
      updateAssetRowEmi(assetRow); // Initialize EMI field visibility
      console.log('Assets table cleared and blank row added');
    }

    // Update totals using the defined functions
    console.log('Updating totals...');
    updateTotalIncome();
    recalcTotals();

    // Reset total display to ₹0
    if (totalIncomeAmount) {
      totalIncomeAmount.textContent = '₹0';
    }

    // Clear localStorage
    try {
      localStorage.removeItem('we_step1');
      console.log('localStorage cleared');
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }

    console.log('Reset completed!');
  }
})();


