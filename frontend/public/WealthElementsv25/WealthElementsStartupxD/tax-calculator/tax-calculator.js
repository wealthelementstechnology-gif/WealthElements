// Tax Calculator JavaScript
let taxChartInstance = null;
let taxInitialized = false;

// Tax data for different assessment years
const taxData = {
    '2024-25': {
        oldRegime: { 
            slabs: [ 
                { upto: 250000, rate: 0 }, 
                { upto: 500000, rate: 0.05 }, 
                { upto: 1000000, rate: 0.20 }, 
                { upto: Infinity, rate: 0.30 } 
            ], 
            rebateIncomeLimit: 500000, 
            maxRebate: 12500, 
            standardDeduction: 50000, 
            exemption: { '<60': 250000, '60-80': 300000, '>80': 500000 } 
        },
        newRegime: { 
            slabs: [ 
                { upto: 300000, rate: 0 }, 
                { upto: 700000, rate: 0.05 }, 
                { upto: 1000000, rate: 0.10 }, 
                { upto: 1200000, rate: 0.15 }, 
                { upto: 1500000, rate: 0.20 }, 
                { upto: Infinity, rate: 0.30 } 
            ], 
            rebateIncomeLimit: 700000, 
            maxRebate: 25000, 
            standardDeduction: 75000, 
            exemption: { '<60': 300000, '60-80': 300000, '>80': 300000 } 
        },
        capitalGains: { 
            STCG: [ { upto: Infinity, rate: 0.15 } ], 
            LTCG: [ { upto: 125000, rate: 0.0 }, { upto: Infinity, rate: 0.10 } ] 
        }
    },
    '2025-26': {
        oldRegime: { 
            slabs: [ 
                { upto: 250000, rate: 0 }, 
                { upto: 500000, rate: 0.05 }, 
                { upto: 1000000, rate: 0.20 }, 
                { upto: Infinity, rate: 0.30 } 
            ], 
            rebateIncomeLimit: 500000, 
            maxRebate: 12500, 
            standardDeduction: 50000, 
            exemption: { '<60': 250000, '60-80': 300000, '>80': 500000 } 
        },
        newRegime: { 
            slabs: [ 
                { upto: 400000, rate: 0 }, 
                { upto: 800000, rate: 0.05 }, 
                { upto: 1200000, rate: 0.10 }, 
                { upto: 1600000, rate: 0.15 }, 
                { upto: 2000000, rate: 0.20 }, 
                { upto: 2400000, rate: 0.25 }, 
                { upto: Infinity, rate: 0.30 } 
            ], 
            rebateIncomeLimit: 1200000, 
            maxRebate: 60000, 
            standardDeduction: 75000, 
            exemption: { '<60': 400000, '60-80': 400000, '>80': 400000 } 
        },
        capitalGains: { 
            STCG: [ { upto: Infinity, rate: 0.15 } ], 
            LTCG: [ { upto: 125000, rate: 0.0 }, { upto: Infinity, rate: 0.10 } ] 
        }
    },
    '2026-27': {
        oldRegime: { 
            slabs: [ 
                { upto: 250000, rate: 0 }, 
                { upto: 500000, rate: 0.05 }, 
                { upto: 1000000, rate: 0.20 }, 
                { upto: Infinity, rate: 0.30 } 
            ], 
            rebateIncomeLimit: 500000, 
            maxRebate: 12500, 
            standardDeduction: 50000, 
            exemption: { '<60': 250000, '60-80': 300000, '>80': 500000 } 
        },
        newRegime: { 
            slabs: [ 
                { upto: 400000, rate: 0 }, 
                { upto: 800000, rate: 0.05 }, 
                { upto: 1200000, rate: 0.10 }, 
                { upto: 1600000, rate: 0.15 }, 
                { upto: 2000000, rate: 0.20 }, 
                { upto: 2400000, rate: 0.25 }, 
                { upto: Infinity, rate: 0.30 } 
            ], 
            rebateIncomeLimit: 1200000, 
            maxRebate: 60000, 
            standardDeduction: 75000, 
            exemption: { '<60': 400000, '60-80': 400000, '>80': 400000 } 
        },
        capitalGains: { 
            STCG: [ { upto: Infinity, rate: 0.15 } ], 
            LTCG: [ { upto: 125000, rate: 0.0 }, { upto: Infinity, rate: 0.10 } ] 
        }
    }
};

// Utility functions
const taxFormatCurrency = (num) => '₹' + Math.round(Number(num || 0)).toLocaleString('en-IN');

function taxApplyTaxSlabs(income, slabs, exemption) {
    if (income <= exemption) return 0;
    let tax = 0; 
    let last = 0;
    for (const slab of slabs) {
        if (income > last) {
            const slabTaxable = Math.min(income - last, slab.upto - last);
            tax += slabTaxable * slab.rate;
        }
        last = slab.upto;
        if (income <= slab.upto) break;
    }
    return tax;
}

function taxCalculateSurcharge(taxableIncome, taxAmount) {
    // Surcharge is calculated as a percentage of tax amount based on income slabs
    let surchargeRate = 0;

    if (taxableIncome > 50000000) {
        surchargeRate = 0.37; // 37% surcharge for income > ₹5 Cr
    } else if (taxableIncome > 20000000) {
        surchargeRate = 0.25; // 25% surcharge for income > ₹2 Cr
    } else if (taxableIncome > 10000000) {
        surchargeRate = 0.15; // 15% surcharge for income > ₹1 Cr
    } else if (taxableIncome > 5000000) {
        surchargeRate = 0.10; // 10% surcharge for income > ₹50 L
    }

    // Apply surcharge rate to tax amount (this is correct - surcharge is on tax, not income)
    return taxAmount * surchargeRate;
}

function taxCalcCapitalGainsTax(gain, slabs) {
    if (gain <= 0) return 0;
    let tax = 0; 
    let remaining = gain; 
    let lastLimit = 0;
    for (const slab of slabs) {
        if (remaining <= 0) break;
        const range = slab.upto - lastLimit;
        const taxableInSlab = Math.min(remaining, range);
        tax += taxableInSlab * slab.rate;
        remaining -= taxableInSlab;
        lastLimit = slab.upto;
    }
    return tax;
}

function taxCalculateRegimeTax(inputs, regimeKey, year) {
    const regimeRules = taxData[year][regimeKey];
    let deductions = regimeRules.standardDeduction;
    const used = { sec80c: 0, sec80d: 0, homeLoanInterest: 0, nps: 0, sec80e: 0, sec80g: 0 };
    
    if (regimeKey === 'oldRegime') {
        used.sec80c = Math.min(inputs.sec80c, 150000);
        used.sec80d = Math.min(inputs.sec80d, 100000);
        used.homeLoanInterest = Math.min(inputs.homeLoanInterest, 200000);
        used.nps = Math.min(inputs.nps, 50000);
        used.sec80e = inputs.sec80e;
        used.sec80g = inputs.sec80g;
        deductions += used.sec80c + used.sec80d + used.homeLoanInterest + used.nps + used.sec80e + used.sec80g + Math.min(inputs.professionalTax, 2500);
        
        // HRA approximation
        const hraReceived = inputs.salaryIncome * 0.4;
        const basicForHRA = inputs.salaryIncome * 0.5;
        const cityMultiplier = inputs.cityType === 'metro' ? 0.5 : 0.4;
        const salaryPercent = basicForHRA * cityMultiplier;
        const rentMinusTenPercent = Math.max(0, inputs.rentPaid - basicForHRA * 0.1);
        const hraExemption = Math.min(hraReceived, salaryPercent, rentMinusTenPercent);
        deductions += hraExemption;
    }
    
    const taxableIncome = Math.max(0, (inputs.salaryIncome + inputs.rentalIncome) - deductions);
    let normalTax = taxApplyTaxSlabs(taxableIncome, regimeRules.slabs, regimeRules.exemption[inputs.ageGroup]);
    
    const cgRules = taxData[year].capitalGains;
    const stcgTax = taxCalcCapitalGainsTax(inputs.shortTermCG, cgRules.STCG);
    // Use dynamic LTCG exemption from tax data instead of hardcoded amount
    const ltcgExemption = cgRules.LTCG[0].upto; // First slab is exemption amount
    let ltGainTaxable = Math.max(0, inputs.longTermCG - ltcgExemption);
    const ltcgTax = taxCalcCapitalGainsTax(ltGainTaxable, cgRules.LTCG);
    const capitalGainsTax = stcgTax + ltcgTax;
    
    let taxBeforeRebate = normalTax + capitalGainsTax;
    let rebate = 0;
    if (taxableIncome <= regimeRules.rebateIncomeLimit) {
        rebate = Math.min(normalTax, regimeRules.maxRebate);
    }
    
    let taxAfterRebate = (normalTax - rebate) + capitalGainsTax;
    let surcharge = taxCalculateSurcharge(taxableIncome + inputs.shortTermCG + inputs.longTermCG, taxAfterRebate);
    let cess = (taxAfterRebate + surcharge) * 0.04;
    let totalTax = taxAfterRebate + surcharge + cess;
    
    return { 
        deductionsUsed: used, 
        deductions, 
        taxableIncome, 
        stcgTax, 
        ltcgTax, 
        capitalGainsTax, 
        normalTax, 
        taxBeforeRebate, 
        rebate, 
        taxAfterRebate, 
        surcharge, 
        cess, 
        totalTax, 
        regimeKey, 
        year 
    };
}

function taxGenerateTaxSavingTips(used) {
    const tips = [];
    if (used.sec80c < 150000) tips.push('You have unused limit under Section 80C; investing more can reduce tax.');
    if (used.sec80d < 100000) tips.push('You can increase health insurance premium to save extra tax under 80D.');
    if (used.homeLoanInterest < 200000) tips.push('More home loan interest payment can increase deduction up to ₹2L.');
    if (used.nps < 50000) tips.push('Consider contributing up to ₹50,000 in NPS to avail extra deduction.');
    if (used.sec80e === 0 && used.sec80g === 0) tips.push('Check other deductions like donations or education loan interest for benefits.');
    
    if (tips.length === 0) return '<strong>You are currently utilizing maximum benefits. Great job!</strong>';
    return tips.map(tip => `• ${tip}`).join('<br>');
}

function taxDisplayResults(oldRes, newRes) {
    const recEl = document.getElementById('tax-recommendation');
    if (!recEl) return;
    
    const saving = Math.abs(oldRes.totalTax - newRes.totalTax);
    let recText = '';
    let recClass = '';
    
    if (oldRes.totalTax < newRes.totalTax) { 
        recText = `Old regime saves you ${taxFormatCurrency(saving)}`; 
        recClass = 'bg-green-50 text-green-700 border-green-300'; 
    }
    else if (newRes.totalTax < oldRes.totalTax) { 
        recText = `New regime saves you ${taxFormatCurrency(saving)}`; 
        recClass = 'bg-blue-50 text-blue-700 border-blue-300'; 
    }
    else { 
        recText = 'Both regimes have the same tax.'; 
        recClass = 'bg-yellow-50 text-yellow-700 border-yellow-300'; 
    }
    
    recEl.innerHTML = `<div class="inline-block px-4 py-2 rounded-full border ${recClass}">${recText}</div>`;

    function breakdownHTML(res) {
        const isOld = res.regimeKey === 'oldRegime';
        const title = isOld ? 'Old Regime Breakdown' : 'New Regime Breakdown';
        return `
        <div class="tax-breakdown-item">
            <h3 class="tax-breakdown-title">${title}</h3>
            <div class="tax-breakdown-content">
                <div class="space-y-1">
                    <div class="flex justify-between"><span>Salary + Rental Income:</span> <strong>${taxFormatCurrency((res.taxableIncome + res.deductions).toFixed(0))}</strong></div>
                    <div class="flex justify-between"><span>Total Deductions:</span> <strong>${taxFormatCurrency(res.deductions.toFixed(0))}</strong></div>
                    <div class="flex justify-between"><span>Taxable Income:</span> <strong>${taxFormatCurrency(res.taxableIncome.toFixed(0))}</strong></div>
                    <hr class="my-2 border-gray-300 dark:border-gray-600">
                    <div class="flex justify-between"><span>Normal Tax before Rebate:</span> <span>${taxFormatCurrency(res.normalTax.toFixed(0))}</span></div>
                    <div class="flex justify-between"><span>Short-term Capital Gains Tax:</span> <span>${taxFormatCurrency(res.stcgTax.toFixed(0))}</span></div>
                    <div class="flex justify-between"><span>Long-term Capital Gains Tax:</span> <span>${taxFormatCurrency(res.ltcgTax.toFixed(0))}</span></div>
                    <div class="flex justify-between"><span>Total Tax Before Rebate:</span> <span>${taxFormatCurrency(res.taxBeforeRebate.toFixed(0))}</span></div>
                    <div class="flex justify-between"><span>Rebate (Sec 87A):</span> <span>-${taxFormatCurrency(res.rebate.toFixed(0))}</span></div>
                    <div class="flex justify-between"><span>Tax After Rebate:</span> <span>${taxFormatCurrency(res.taxAfterRebate.toFixed(0))}</span></div>
                    <div class="flex justify-between"><span>Surcharge:</span> <span>+${taxFormatCurrency(res.surcharge.toFixed(0))}</span></div>
                    <div class="flex justify-between"><span>Health & Education Cess (4%):</span> <span>+${taxFormatCurrency(res.cess.toFixed(0))}</span></div>
                    <hr class="my-2 border-gray-300 dark:border-gray-600">
                    <div class="flex justify-between font-bold text-base"><span>Total Tax Payable:</span> <strong>${taxFormatCurrency(res.totalTax.toFixed(0))}</strong></div>
                </div>
            </div>
        </div>`;
    }
    
    const breakdownEl = document.getElementById('tax-breakdown');
    breakdownEl.innerHTML = breakdownHTML(oldRes) + breakdownHTML(newRes);
    
    document.getElementById('tax-tips').innerHTML = `
        <h4>Tax Saving Suggestions</h4>
        <p>${taxGenerateTaxSavingTips(oldRes.deductionsUsed)}</p>
    `;

    const ctx = document.getElementById('tax-chart').getContext('2d');
    if (taxChartInstance) taxChartInstance.destroy();
    
    taxChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Old Regime', 'New Regime'],
            datasets: [{ 
                label: 'Total Tax Payable', 
                data: [oldRes.totalTax, newRes.totalTax], 
                backgroundColor: ['#ef4444', '#22c55e'], 
                borderRadius: 4 
            }]
        },
        options: { 
            responsive: true, 
            scales: { 
                y: { 
                    beginAtZero: true, 
                    ticks: { 
                        precision: 0,
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    } 
                } 
            }, 
            plugins: { 
                legend: { display: false } 
            } 
        }
    });
    
    const resultsSection = document.getElementById('tax-results-section');
    if (resultsSection) resultsSection.classList.remove('hidden');
}

function taxCalculateAndRender() {
    try {
        const inputs = {
            salaryIncome: Math.max(0, parseFloat(document.getElementById('tax-salary-income')?.value) || 0),
            rentalIncome: Math.max(0, parseFloat(document.getElementById('tax-rental-income')?.value) || 0),
            shortTermCG: Math.max(0, parseFloat(document.getElementById('tax-short-term-cg')?.value) || 0),
            longTermCG: Math.max(0, parseFloat(document.getElementById('tax-long-term-cg')?.value) || 0),
            sec80c: Math.max(0, parseFloat(document.getElementById('tax-sec80c')?.value) || 0),
            sec80d: Math.max(0, parseFloat(document.getElementById('tax-sec80d')?.value) || 0),
            homeLoanInterest: Math.max(0, parseFloat(document.getElementById('tax-home-loan-interest')?.value) || 0),
            nps: Math.max(0, parseFloat(document.getElementById('tax-nps')?.value) || 0),
            sec80e: Math.max(0, parseFloat(document.getElementById('tax-sec80e')?.value) || 0),
            sec80g: Math.max(0, parseFloat(document.getElementById('tax-sec80g')?.value) || 0),
            professionalTax: Math.max(0, parseFloat(document.getElementById('tax-professional-tax')?.value) || 0),
            rentPaid: Math.max(0, parseFloat(document.getElementById('tax-rent-paid')?.value) || 0),
            cityType: document.getElementById('tax-city-type')?.value || 'non-metro',
            ageGroup: document.getElementById('tax-age')?.value || '<60',
            assessmentYear: document.getElementById('tax-assessment-year')?.value || '2024-25',
        };
        
        // Validate inputs
        if (inputs.salaryIncome > 100000000) { // 10 crores
            alert('Salary income seems unusually high. Please verify your input.');
            return;
        }
        
        const oldResult = taxCalculateRegimeTax(inputs, 'oldRegime', inputs.assessmentYear);
        const newResult = taxCalculateRegimeTax(inputs, 'newRegime', inputs.assessmentYear);
        taxDisplayResults(oldResult, newResult);
    } catch (error) {
        console.error('Error in tax calculation:', error);
        alert('An error occurred during tax calculation. Please check your inputs and try again.');
    }
}

function taxResetForm() {
    const formEl = document.getElementById('tax-form');
    if (!formEl) return;
    
    formEl.querySelectorAll('input, select').forEach(el => {
        if (el.tagName.toLowerCase() === 'select') el.selectedIndex = 0;
        else el.value = '';
    });
    
    const recommendation = document.getElementById('tax-recommendation');
    const breakdown = document.getElementById('tax-breakdown');
    const tips = document.getElementById('tax-tips');
    
    if (recommendation) recommendation.textContent = '';
    if (breakdown) breakdown.innerHTML = '';
    if (tips) tips.innerHTML = '';
    
    if (taxChartInstance) { 
        taxChartInstance.destroy(); 
        taxChartInstance = null; 
    }
    
    const resultsSection = document.getElementById('tax-results-section');
    if (resultsSection) resultsSection.classList.add('hidden');
}

function taxLoadPreset(type) {
    taxResetForm();
    
    const presets = {
        salaried_low: { 'tax-salary-income': 700000, 'tax-sec80c': 50000 },
        salaried_mid: { 
            'tax-salary-income': 1200000, 
            'tax-rental-income': 100000, 
            'tax-sec80c': 150000, 
            'tax-sec80d': 25000, 
            'tax-home-loan-interest': 150000, 
            'tax-rent-paid': 300000, 
            'tax-city-type': 'metro' 
        },
        salaried_high: { 
            'tax-salary-income': 2500000, 
            'tax-rental-income': 200000, 
            'tax-short-term-cg': 100000, 
            'tax-long-term-cg': 150000, 
            'tax-sec80c': 150000, 
            'tax-sec80d': 50000, 
            'tax-home-loan-interest': 200000, 
            'tax-nps': 50000, 
            'tax-professional-tax': 2500 
        },
        senior_low: { 
            'tax-age': '60-80', 
            'tax-salary-income': 500000, 
            'tax-rental-income': 100000 
        },
        senior_mid: { 
            'tax-age': '60-80', 
            'tax-salary-income': 800000, 
            'tax-rental-income': 150000, 
            'tax-long-term-cg': 50000, 
            'tax-sec80c': 100000, 
            'tax-sec80d': 50000 
        }
    };
    
    const presetData = presets[type];
    if (presetData) {
        Object.entries(presetData).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (el.tagName.toLowerCase() === 'select') el.value = value;
            else el.value = value;
        });
    }
    
    taxCalculateAndRender();
}

function initializeTaxCalculator() {
    if (taxInitialized) { 
        return; 
    }
    
    const taxForm = document.getElementById('tax-form');
    if (!taxForm) return;
    
    // Input listeners
    taxForm.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', () => { /* wait for explicit calculate click */ });
        el.addEventListener('change', () => { /* wait for explicit calculate click */ });
    });
    
    // Advanced toggle
    const advBtn = document.getElementById('tax-toggle-advanced-btn');
    const advDiv = document.getElementById('tax-advanced-deductions');
    if (advBtn && advDiv) {
        advBtn.addEventListener('click', () => {
            const hidden = advDiv.classList.contains('hidden');
            advDiv.classList.toggle('hidden');
            advBtn.textContent = hidden ? 'Hide Advanced Deductions' : 'Show Advanced Deductions';
            
            if (!hidden) {
                ['tax-sec80d','tax-home-loan-interest','tax-nps','tax-sec80e','tax-sec80g','tax-professional-tax','tax-rent-paid','tax-city-type'].forEach(id => {
                    const input = document.getElementById(id);
                    if (!input) return;
                    if (input.tagName.toLowerCase() === 'select') input.selectedIndex = 0; 
                    else input.value = '';
                });
                taxCalculateAndRender();
            }
        });
    }
    
    // Presets
    const salariedPreset = document.getElementById('tax-salaried-preset');
    const seniorPreset = document.getElementById('tax-senior-preset');
    if (salariedPreset) salariedPreset.addEventListener('change', (e) => {
        taxLoadPreset(e.target.value);
        if (e.target.value) taxCalculateAndRender(); // Auto-calculate when preset is selected
    });
    if (seniorPreset) seniorPreset.addEventListener('change', (e) => {
        taxLoadPreset(e.target.value);
        if (e.target.value) taxCalculateAndRender(); // Auto-calculate when preset is selected
    });
    
    // Reset
    const resetBtn = document.getElementById('tax-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => { 
        taxResetForm(); 
        // Hide results section after reset
        const resultsSection = document.getElementById('tax-results-section');
        if (resultsSection) {
            resultsSection.classList.add('hidden');
        }
    });
    
    // Calculate button
    const calcBtn = document.getElementById('tax-calc-btn');
    if (calcBtn) calcBtn.addEventListener('click', () => taxCalculateAndRender());


    // Start hidden results until first calculation
    taxInitialized = true;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTaxCalculator();
});
