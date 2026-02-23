// UI Helper functions to sync hidden table data with modern card-based UI

(function() {
  // Toggle expense sections
  window.toggleExpenseSection = function(sectionId) {
    const content = document.getElementById(`${sectionId}-expenses`);
    const icon = document.getElementById(`${sectionId}-icon`);

    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      icon.style.transform = 'rotate(180deg)';
    } else {
      content.classList.add('hidden');
      icon.style.transform = 'rotate(0deg)';
    }
  };

  // Render expense items from hidden table to visual display
  function renderExpenseItems() {
    const expensesTbody = document.getElementById('expenses-tbody');
    if (!expensesTbody) return;

    const householdContainer = document.getElementById('household-expenses');
    const lifestyleContainer = document.getElementById('lifestyle-expenses');
    const dependentContainer = document.getElementById('dependent-expenses');
    const miscContainer = document.getElementById('misc-expenses');

    if (!householdContainer || !lifestyleContainer || !dependentContainer || !miscContainer) return;

    householdContainer.innerHTML = '';
    lifestyleContainer.innerHTML = '';
    dependentContainer.innerHTML = '';
    miscContainer.innerHTML = '';

    Array.from(expensesTbody.querySelectorAll('tr')).forEach((row) => {
      const subsectionCell = row.querySelector('td[data-subsection]');
      const labelSpan = row.querySelector('td span');
      const monthlyInput = row.querySelector('[data-monthly]');
      const annualInput = row.querySelector('[data-annual]');
      const retirementCheckbox = row.querySelector('input[type="checkbox"][name="expenseRetirement[]"]');

      if (!subsectionCell || !labelSpan || !monthlyInput || !annualInput) return;

      const subsection = subsectionCell.getAttribute('data-subsection');
      const label = labelSpan.textContent.trim();

      const itemDiv = document.createElement('div');
      itemDiv.className = 'space-y-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm';
      itemDiv.innerHTML = `
        <div class="flex justify-between items-center">
          <h4 class="text-sm font-semibold text-text-primary">${label}</h4>
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-[10px] text-gray-500 uppercase tracking-wide font-medium hidden sm:inline">In Retirement?</span>
            <div class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" ${retirementCheckbox && retirementCheckbox.checked ? 'checked' : ''} class="sr-only peer expense-retirement-toggle" data-expense-name="${label}"/>
              <div class="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </label>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-semibold text-text-secondary mb-1">Monthly</label>
            <div class="relative">
              <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
              <input class="w-full bg-white border border-gray-300 rounded-lg py-2 pl-6 pr-2 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary expense-monthly-input" data-expense-name="${label}" placeholder="0" type="number" value="${monthlyInput.value || ''}"/>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-semibold text-text-secondary mb-1">Annual (Calc)</label>
            <div class="relative">
              <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
              <input class="w-full bg-gray-100 border border-transparent rounded-lg py-2 pl-6 pr-2 text-sm text-gray-500 expense-annual-input" data-expense-name="${label}" placeholder="0" type="number" value="${annualInput.value || ''}"/>
            </div>
          </div>
        </div>
      `;

      // Add to appropriate container
      if (subsection === 'household') {
        householdContainer.appendChild(itemDiv);
      } else if (subsection === 'lifestyle') {
        lifestyleContainer.appendChild(itemDiv);
      } else if (subsection === 'dependent') {
        dependentContainer.appendChild(itemDiv);
      } else if (subsection === 'misc') {
        miscContainer.appendChild(itemDiv);
      }
    });

    // Bind event listeners for syncing
    bindExpenseInputListeners();
  }

  // Bind expense input listeners to sync with hidden table
  function bindExpenseInputListeners() {
    const monthlyInputs = document.querySelectorAll('.expense-monthly-input');
    const annualInputs = document.querySelectorAll('.expense-annual-input');
    const retirementToggles = document.querySelectorAll('.expense-retirement-toggle');

    monthlyInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const expenseName = e.target.getAttribute('data-expense-name');
        syncToHiddenTable(expenseName, 'monthly', e.target.value);
      });
    });

    annualInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const expenseName = e.target.getAttribute('data-expense-name');
        syncToHiddenTable(expenseName, 'annual', e.target.value);
      });
    });

    retirementToggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const expenseName = e.target.getAttribute('data-expense-name');
        syncToHiddenTable(expenseName, 'retirement', e.target.checked);
      });
    });
  }

  // Sync UI input changes back to hidden table
  function syncToHiddenTable(expenseName, field, value) {
    const expensesTbody = document.getElementById('expenses-tbody');
    if (!expensesTbody) return;

    Array.from(expensesTbody.querySelectorAll('tr')).forEach((row) => {
      const labelSpan = row.querySelector('td span');
      if (labelSpan && labelSpan.textContent.trim() === expenseName) {
        if (field === 'monthly') {
          const monthlyInput = row.querySelector('[data-monthly]');
          if (monthlyInput) {
            monthlyInput.value = value;
            monthlyInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        } else if (field === 'annual') {
          const annualInput = row.querySelector('[data-annual]');
          if (annualInput) {
            annualInput.value = value;
            annualInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        } else if (field === 'retirement') {
          const checkbox = row.querySelector('input[type="checkbox"][name="expenseRetirement[]"]');
          if (checkbox) {
            checkbox.checked = value;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
    });
  }

  // Render income items
  function renderIncomeItems() {
    const incomeTbody = document.getElementById('income-tbody');
    const incomeList = document.getElementById('income-list');

    if (!incomeTbody || !incomeList) return;

    // Clear existing visual cards
    incomeList.innerHTML = '';

    // Get all table rows from the hidden table
    const rows = Array.from(incomeTbody.querySelectorAll('tr'));

    rows.forEach((row) => {
      const sourceSelect = row.querySelector('select[name="incomeSource[]"]');
      const sourceOther = row.querySelector('input[name="incomeSourceOther[]"]');
      const amountInput = row.querySelector('input[name="incomeAmount[]"]');
      const ownerSelect = row.querySelector('select[name="incomeOwner[]"]');

      if (!sourceSelect || !amountInput) return;

      // Create card
      const card = document.createElement('div');
      card.className = 'income-card relative bg-white rounded-xl p-4 border border-gray-200 shadow-sm group hover:border-primary/30 transition-colors';

      let ownerHTML = '';
      if (ownerSelect) {
        ownerHTML = `
          <div class="space-y-1">
            <label class="text-xs font-medium text-text-secondary">Whose Income</label>
            <div class="relative">
              <select class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary appearance-none income-owner-ui">
                <option value="">Select</option>
                <option value="husband" ${ownerSelect.value === 'husband' ? 'selected' : ''}>Husband</option>
                <option value="wife" ${ownerSelect.value === 'wife' ? 'selected' : ''}>Wife</option>
              </select>
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px] pointer-events-none">expand_more</span>
            </div>
          </div>
        `;
      }

      card.innerHTML = `
        <button class="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors income-remove-btn">
          <span class="material-symbols-outlined text-[20px]">delete</span>
        </button>
        <div class="grid gap-4">
          <div class="space-y-1">
            <label class="text-xs font-medium text-text-secondary">Source</label>
            <div class="relative">
              <select class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary appearance-none income-source-ui">
                <option value="">-- Select Source --</option>
                <option value="Salary" ${sourceSelect.value === 'Salary' ? 'selected' : ''}>Salary</option>
                <option value="Business Income" ${sourceSelect.value === 'Business Income' ? 'selected' : ''}>Business Income</option>
                <option value="Rental Income" ${sourceSelect.value === 'Rental Income' ? 'selected' : ''}>Rental Income</option>
                <option value="Freelance/Consulting" ${sourceSelect.value === 'Freelance/Consulting' ? 'selected' : ''}>Freelance/Consulting</option>
                <option value="Interest Income" ${sourceSelect.value === 'Interest Income' ? 'selected' : ''}>Interest Income</option>
                <option value="Dividend Income" ${sourceSelect.value === 'Dividend Income' ? 'selected' : ''}>Dividend Income</option>
                <option value="Other" ${sourceSelect.value === 'Other' ? 'selected' : ''}>Other (Specify)</option>
              </select>
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px] pointer-events-none">expand_more</span>
            </div>
            <input class="income-source-other-ui w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary ${sourceOther && sourceOther.classList.contains('show') ? 'show' : ''}" type="text" placeholder="Specify income source" value="${sourceOther ? sourceOther.value : ''}"/>
          </div>
          ${ownerHTML}
          <div class="space-y-1">
            <label class="text-xs font-medium text-text-secondary">Amount (Monthly)</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">₹</span>
              <input class="income-amount-ui w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-7 pr-3 text-sm text-text-primary font-medium focus:ring-1 focus:ring-primary focus:border-primary" type="number" value="${amountInput.value || ''}"/>
            </div>
          </div>
        </div>
      `;

      // Store reference to hidden row
      card.dataset.rowIndex = rows.indexOf(row);

      // Add card to the visual list
      incomeList.appendChild(card);

      // Bind events
      const uiSource = card.querySelector('.income-source-ui');
      const uiSourceOther = card.querySelector('.income-source-other-ui');
      const uiAmount = card.querySelector('.income-amount-ui');
      const uiOwner = card.querySelector('.income-owner-ui');
      const removeBtn = card.querySelector('.income-remove-btn');

      if (uiSource) {
        uiSource.addEventListener('change', (e) => {
          sourceSelect.value = e.target.value;
          if (e.target.value === 'Other') {
            uiSourceOther.classList.add('show');
            if (sourceOther) {
              setTimeout(() => {
                sourceOther.classList.add('show');
              }, 10);
              sourceOther.required = true;
            }
          } else {
            uiSourceOther.classList.remove('show');
            if (sourceOther) {
              sourceOther.classList.remove('show');
              sourceOther.required = false;
              sourceOther.value = '';
            }
            uiSourceOther.value = '';
          }
          sourceSelect.dispatchEvent(new Event('change'));
        });
      }

      if (uiSourceOther && sourceOther) {
        uiSourceOther.addEventListener('input', (e) => {
          sourceOther.value = e.target.value;
        });
      }

      if (uiAmount) {
        uiAmount.addEventListener('input', (e) => {
          amountInput.value = e.target.value;
          amountInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
      }

      if (uiOwner && ownerSelect) {
        uiOwner.addEventListener('change', (e) => {
          ownerSelect.value = e.target.value;
        });
      }

      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          // Trigger the remove button in the hidden table
          const hiddenRemoveBtn = row.querySelector('[data-remove]');
          if (hiddenRemoveBtn) {
            hiddenRemoveBtn.click();
          } else {
            // Fallback if the hidden button doesn't exist
            row.remove();
            renderIncomeItems();
            const updateEvent = new Event('input', { bubbles: true });
            incomeTbody.dispatchEvent(updateEvent);
          }
        });
      }
    });
  }

  // Render insurance items
  function renderInsuranceItems() {
    const insuranceTbody = document.getElementById('insurance-tbody');
    const insuranceList = document.getElementById('insurance-list');

    if (!insuranceTbody || !insuranceList) return;

    insuranceList.innerHTML = '';

    const rows = Array.from(insuranceTbody.querySelectorAll('tr'));

    rows.forEach((row) => {
      const policyInput = row.querySelector('input[name="insPolicy[]"]');
      const typeSelect = row.querySelector('select[name="insType[]"]');
      const sumInput = row.querySelector('input[name="insSum[]"]');
      const premiumInput = row.querySelector('input[name="insPremium[]"]');
      const termInput = row.querySelector('input[name="insTerm[]"]');
      const modeSelect = row.querySelector('select[name="insMode[]"]');

      if (!policyInput) return;

      const card = document.createElement('div');
      card.className = 'relative bg-white rounded-xl p-4 border border-gray-200 shadow-sm group hover:border-primary/30 transition-colors';
      card.innerHTML = `
        <button class="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors insurance-remove-btn">
          <span class="material-symbols-outlined text-[20px]">delete</span>
        </button>
        <div class="grid gap-3">
          <div class="space-y-1">
            <label class="text-xs font-medium text-text-secondary">Policy Name</label>
            <input class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary insurance-policy-ui" type="text" value="${policyInput.value || ''}" placeholder="e.g., Life Cover"/>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-xs font-medium text-text-secondary">Type</label>
              <div class="relative">
                <select class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary appearance-none insurance-type-ui">
                  <option value="Term" ${typeSelect && typeSelect.value === 'Term' ? 'selected' : ''}>Term</option>
                  <option value="Health" ${typeSelect && typeSelect.value === 'Health' ? 'selected' : ''}>Health</option>
                  <option value="ULIP" ${typeSelect && typeSelect.value === 'ULIP' ? 'selected' : ''}>ULIP</option>
                  <option value="Endowment" ${typeSelect && typeSelect.value === 'Endowment' ? 'selected' : ''}>Endowment</option>
                </select>
                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-text-secondary">Mode</label>
              <div class="relative">
                <select class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary appearance-none insurance-mode-ui">
                  <option value="Monthly" ${modeSelect && modeSelect.value === 'Monthly' ? 'selected' : ''}>Monthly</option>
                  <option value="Quarterly" ${modeSelect && modeSelect.value === 'Quarterly' ? 'selected' : ''}>Quarterly</option>
                  <option value="Yearly" ${modeSelect && modeSelect.value === 'Yearly' ? 'selected' : ''}>Yearly</option>
                </select>
                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="text-xs font-medium text-text-secondary">Sum Assured<br/>(₹)</label>
              <input class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary insurance-sum-ui" type="number" value="${sumInput && sumInput.value || ''}" placeholder="1000000"/>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-text-secondary">Premium<br/>(₹)</label>
              <input class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary insurance-premium-ui" type="number" value="${premiumInput && premiumInput.value || ''}" placeholder="5000"/>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-text-secondary">Term<br/>(Yrs)</label>
              <input class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary insurance-term-ui" type="number" value="${termInput && termInput.value || ''}" placeholder="20"/>
            </div>
          </div>
        </div>
      `;

      // Bind events
      const uiPolicy = card.querySelector('.insurance-policy-ui');
      const uiType = card.querySelector('.insurance-type-ui');
      const uiSum = card.querySelector('.insurance-sum-ui');
      const uiPremium = card.querySelector('.insurance-premium-ui');
      const uiTerm = card.querySelector('.insurance-term-ui');
      const uiMode = card.querySelector('.insurance-mode-ui');
      const removeBtn = card.querySelector('.insurance-remove-btn');

      if (uiPolicy) uiPolicy.addEventListener('input', (e) => { policyInput.value = e.target.value; policyInput.dispatchEvent(new Event('input', { bubbles: true })); });
      if (uiType) uiType.addEventListener('change', (e) => { typeSelect.value = e.target.value; typeSelect.dispatchEvent(new Event('change', { bubbles: true })); });
      if (uiSum) uiSum.addEventListener('input', (e) => { sumInput.value = e.target.value; sumInput.dispatchEvent(new Event('input', { bubbles: true })); });
      if (uiPremium) uiPremium.addEventListener('input', (e) => { premiumInput.value = e.target.value; premiumInput.dispatchEvent(new Event('input', { bubbles: true })); });
      if (uiTerm) uiTerm.addEventListener('input', (e) => { termInput.value = e.target.value; termInput.dispatchEvent(new Event('input', { bubbles: true })); });
      if (uiMode) uiMode.addEventListener('change', (e) => { modeSelect.value = e.target.value; modeSelect.dispatchEvent(new Event('change', { bubbles: true })); });

      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const hiddenRemoveBtn = row.querySelector('[data-remove]');
          if (hiddenRemoveBtn) {
            hiddenRemoveBtn.click();
          } else {
            row.remove();
            renderInsuranceItems();
          }
        });
      }

      insuranceList.appendChild(card);
    });
  }

  // Render investment items
  function renderInvestmentItems() {
    const investmentsTbody = document.getElementById('investments-tbody');
    const investmentList = document.getElementById('investment-list');

    if (!investmentsTbody || !investmentList) return;

    investmentList.innerHTML = '';

    const rows = Array.from(investmentsTbody.querySelectorAll('tr'));

    rows.forEach((row) => {
      const nameInput = row.querySelector('input[name="invName[]"]');
      const currentInput = row.querySelector('input[name="invCurrent[]"]');
      const returnInput = row.querySelector('input[name="invReturn[]"]');
      const amountInput = row.querySelector('input[name="invAmount[]"]');
      const typeSelect = row.querySelector('select[name="invType[]"]');
      const modeSelect = row.querySelector('select[name="invMode[]"]');

      if (!nameInput) return;

      const card = document.createElement('div');
      card.className = 'relative bg-white rounded-xl p-4 border border-gray-200 shadow-sm group hover:border-primary/30 transition-colors';
      card.innerHTML = `
        <button class="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors investment-remove-btn">
          <span class="material-symbols-outlined text-[20px]">delete</span>
        </button>
        <div class="grid gap-3">
          <div class="space-y-1">
            <label class="text-xs font-medium text-text-secondary">Asset Name</label>
            <input class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary investment-name-ui" type="text" value="${nameInput.value || ''}" placeholder="e.g., EPF"/>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-xs font-medium text-text-secondary">Type</label>
              <div class="relative">
                <select class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary appearance-none investment-type-ui">
                  <option value="Select">Select Type</option>
                  <option value="Equity MF" ${typeSelect && typeSelect.value === 'Equity MF' ? 'selected' : ''}>Equity MF</option>
                  <option value="Debt MF" ${typeSelect && typeSelect.value === 'Debt MF' ? 'selected' : ''}>Debt MF</option>
                  <option value="FD" ${typeSelect && typeSelect.value === 'FD' ? 'selected' : ''}>FD</option>
                  <option value="PPF" ${typeSelect && typeSelect.value === 'PPF' ? 'selected' : ''}>PPF</option>
                  <option value="EPF" ${typeSelect && typeSelect.value === 'EPF' ? 'selected' : ''}>EPF</option>
                  <option value="Stocks" ${typeSelect && typeSelect.value === 'Stocks' ? 'selected' : ''}>Stocks</option>
                </select>
                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-text-secondary">Mode</label>
              <div class="relative">
                <select class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary appearance-none investment-mode-ui">
                  <option value="Monthly" ${modeSelect && modeSelect.value === 'Monthly' ? 'selected' : ''}>Monthly</option>
                  <option value="Quarterly" ${modeSelect && modeSelect.value === 'Quarterly' ? 'selected' : ''}>Quarterly</option>
                  <option value="Yearly" ${modeSelect && modeSelect.value === 'Yearly' ? 'selected' : ''}>Yearly</option>
                </select>
                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="text-xs font-medium text-text-secondary">Current Value<br/>(₹)</label>
              <input class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary investment-current-ui" type="number" value="${currentInput && currentInput.value || ''}" placeholder="100000"/>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-text-secondary">Return<br/>(%)</label>
              <input class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary investment-return-ui" type="number" value="${returnInput && returnInput.value || ''}" placeholder="8" step="0.1"/>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-text-secondary">Investment<br/>(₹)</label>
              <input class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary investment-amount-ui" type="number" value="${amountInput && amountInput.value || ''}" placeholder="1500"/>
            </div>
          </div>
        </div>
      `;

      // Bind events
      const uiName = card.querySelector('.investment-name-ui');
      const uiType = card.querySelector('.investment-type-ui');
      const uiMode = card.querySelector('.investment-mode-ui');
      const uiCurrent = card.querySelector('.investment-current-ui');
      const uiReturn = card.querySelector('.investment-return-ui');
      const uiAmount = card.querySelector('.investment-amount-ui');
      const removeBtn = card.querySelector('.investment-remove-btn');

      if (uiName) uiName.addEventListener('input', (e) => { nameInput.value = e.target.value; nameInput.dispatchEvent(new Event('input', { bubbles: true })); });
      if (uiType) uiType.addEventListener('change', (e) => { typeSelect.value = e.target.value; typeSelect.dispatchEvent(new Event('change', { bubbles: true })); });
      if (uiMode) uiMode.addEventListener('change', (e) => { modeSelect.value = e.target.value; modeSelect.dispatchEvent(new Event('change', { bubbles: true })); });
      if (uiCurrent) uiCurrent.addEventListener('input', (e) => { currentInput.value = e.target.value; currentInput.dispatchEvent(new Event('input', { bubbles: true })); });
      if (uiReturn) uiReturn.addEventListener('input', (e) => { returnInput.value = e.target.value; returnInput.dispatchEvent(new Event('input', { bubbles: true })); });
      if (uiAmount) uiAmount.addEventListener('input', (e) => { amountInput.value = e.target.value; amountInput.dispatchEvent(new Event('input', { bubbles: true })); });

      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const hiddenRemoveBtn = row.querySelector('[data-remove]');
          if (hiddenRemoveBtn) {
            hiddenRemoveBtn.click();
          } else {
            row.remove();
            renderInvestmentItems();
          }
        });
      }

      investmentList.appendChild(card);
    });
  }

  // Render asset items
  function renderAssetItems() {
    const assetsTbody = document.getElementById('assets-tbody');
    const assetsList = document.getElementById('assets-list');

    if (!assetsTbody || !assetsList) return;

    assetsList.innerHTML = '';

    const rows = Array.from(assetsTbody.querySelectorAll('tr'));

    rows.forEach((row) => {
      const nameInput = row.querySelector('input[name="assetName[]"]');
      const typeSelect = row.querySelector('select[name="assetType[]"]');
      const valueInput = row.querySelector('input[name="assetValue[]"]');
      const emiInput = row.querySelector('input[name="assetEmi[]"]');

      if (!nameInput) return;

      const isLiability = typeSelect && typeSelect.value === 'Liability';

      const card = document.createElement('div');
      card.className = 'relative bg-white rounded-xl p-4 border border-gray-200 shadow-sm group hover:border-primary/30 transition-colors';
      card.innerHTML = `
        <button class="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors asset-remove-btn">
          <span class="material-symbols-outlined text-[20px]">delete</span>
        </button>
        <div class="grid gap-3">
          <div class="space-y-1">
            <label class="text-xs font-medium text-text-secondary">Item Name / Description</label>
            <input class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary asset-name-ui" type="text" value="${nameInput.value || ''}" placeholder="e.g., Home Loan"/>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-xs font-medium text-text-secondary">Type</label>
              <div class="relative">
                <select class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary appearance-none asset-type-ui">
                  <option value="Asset" ${typeSelect && typeSelect.value === 'Asset' ? 'selected' : ''}>Asset</option>
                  <option value="Liability" ${typeSelect && typeSelect.value === 'Liability' ? 'selected' : ''}>Liability</option>
                </select>
                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-text-secondary">Current Value (₹)</label>
              <input class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary asset-value-ui" type="number" value="${valueInput && valueInput.value || ''}" placeholder="Value"/>
            </div>
          </div>
          <div class="space-y-1 ${!isLiability ? 'hidden' : ''}" id="emi-field-${rows.indexOf(row)}">
            <label class="text-xs font-medium text-text-secondary">EMI (if any) (₹)</label>
            <input class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary asset-emi-ui" type="number" value="${emiInput && emiInput.value || ''}" placeholder="EMI" ${!isLiability ? 'disabled' : ''}/>
          </div>
        </div>
      `;

      // Bind events
      const uiName = card.querySelector('.asset-name-ui');
      const uiType = card.querySelector('.asset-type-ui');
      const uiValue = card.querySelector('.asset-value-ui');
      const uiEmi = card.querySelector('.asset-emi-ui');
      const emiField = card.querySelector(`#emi-field-${rows.indexOf(row)}`);
      const removeBtn = card.querySelector('.asset-remove-btn');

      if (uiName) uiName.addEventListener('input', (e) => { nameInput.value = e.target.value; nameInput.dispatchEvent(new Event('input', { bubbles: true })); });
      if (uiType) {
        uiType.addEventListener('change', (e) => {
          typeSelect.value = e.target.value;
          const isLiability = e.target.value === 'Liability';
          if (emiField) {
            if (isLiability) {
              emiField.classList.remove('hidden');
            } else {
              emiField.classList.add('hidden');
            }
          }
          if (uiEmi) {
            uiEmi.disabled = !isLiability;
            if (!isLiability) {
              uiEmi.value = '';
              emiInput.value = '';
            }
          }
          typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      if (uiValue) uiValue.addEventListener('input', (e) => { valueInput.value = e.target.value; valueInput.dispatchEvent(new Event('input', { bubbles: true })); });
      if (uiEmi) uiEmi.addEventListener('input', (e) => { emiInput.value = e.target.value; emiInput.dispatchEvent(new Event('input', { bubbles: true })); });

      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const hiddenRemoveBtn = row.querySelector('[data-remove]');
          if (hiddenRemoveBtn) {
            hiddenRemoveBtn.click();
          } else {
            row.remove();
            renderAssetItems();
          }
        });
      }

      assetsList.appendChild(card);
    });
  }

  // Initialize UI rendering
  function initializeUI() {
    // Wait for the main script to initialize
    setTimeout(() => {
      renderExpenseItems();
      renderIncomeItems();
      renderInsuranceItems();
      renderInvestmentItems();
      renderAssetItems();
    }, 100);
  }

  // Track if we're currently rendering to avoid infinite loops
  let isRendering = false;

  // Re-render when data changes
  const observer = new MutationObserver((mutations) => {
    if (isRendering) return; // Prevent infinite loops

    mutations.forEach((mutation) => {
      if (mutation.target.id === 'income-tbody') {
        const hasTrMutation = Array.from(mutation.addedNodes).some(node => node.tagName === 'TR') ||
                              Array.from(mutation.removedNodes).some(node => node.tagName === 'TR');
        if (hasTrMutation) {
          isRendering = true;
          setTimeout(() => {
            renderIncomeItems();
            isRendering = false;
          }, 10);
        }
      } else if (mutation.target.id === 'insurance-tbody') {
        isRendering = true;
        setTimeout(() => {
          renderInsuranceItems();
          isRendering = false;
        }, 10);
      } else if (mutation.target.id === 'investments-tbody') {
        isRendering = true;
        setTimeout(() => {
          renderInvestmentItems();
          isRendering = false;
        }, 10);
      } else if (mutation.target.id === 'assets-tbody') {
        isRendering = true;
        setTimeout(() => {
          renderAssetItems();
          isRendering = false;
        }, 10);
      }
    });
  });

  // Observe changes to hidden tables
  const incomeTbody = document.getElementById('income-tbody');
  const insuranceTbody = document.getElementById('insurance-tbody');
  const investmentsTbody = document.getElementById('investments-tbody');
  const assetsTbody = document.getElementById('assets-tbody');

  if (incomeTbody) observer.observe(incomeTbody, { childList: true, subtree: true });
  if (insuranceTbody) observer.observe(insuranceTbody, { childList: true, subtree: true });
  if (investmentsTbody) observer.observe(investmentsTbody, { childList: true, subtree: true });
  if (assetsTbody) observer.observe(assetsTbody, { childList: true, subtree: true });

  // Don't listen for input changes - they cause re-renders which break typing
  // The UI syncs directly to hidden inputs via event handlers, no need to re-render on input

  // Setup add button clicks - these are handled by existing 8-events.js
  function setupAddButtons() {
    // The add buttons for insurance, investment, and asset are already
    // handled by 8-events.js which adds empty rows to hidden tables
    // We just need to make sure renders happen after those additions

    // Listen for family mode changes to re-render income
    const familyModeRadios = document.querySelectorAll('input[name="familyMode"]');
    familyModeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        setTimeout(() => {
          renderIncomeItems();
        }, 200);
      });
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeUI();
      setupAddButtons();
    });
  } else {
    initializeUI();
    setupAddButtons();
  }
})();
