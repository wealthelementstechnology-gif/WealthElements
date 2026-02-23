// --- App State & Initialization ---
let chartInstances = {}; // To store chart objects for destruction

document.addEventListener('DOMContentLoaded', () => {
    // --- Theme: inherit from parent (no local toggle) ---
    const docElement = document.documentElement;
    // Ensure charts reflect current theme on load
    setTimeout(() => {
        Object.values(chartInstances).forEach(chart => {
            if (chart) {
                chart.options = getChartOptions(chart.config.type);
                chart.update();
            }
        });
    }, 0);
    
    // --- Card Hover Effects ---
    const setupCardEffects = () => {
        document.querySelectorAll('.calculator-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    };

    // --- Navigation Logic ---
    const showStep = (stepId) => {
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
        const nextStep = document.getElementById(stepId);
        if (nextStep) {
            nextStep.classList.add('active');
            window.scrollTo(0, 0);
        }
    };

    // --- UI Generation ---
    const calculatorPagesContainer = document.getElementById('calculator-pages');
    const calcBackMain = document.getElementById('calc-back-main');
    const dashboardGrid = document.getElementById('dashboard-grid');

    const calculators = [
        { id: 1, title: '💰 Future Value of One Time Investment', inputs: [
            { id: 'investment', label: 'One Time Investment (₹)', value: 120000 },
            { id: 'period', label: 'Investment Period (Yrs)', value: 5 },
            { id: 'rate', label: 'Growth Rate Assumed (%)', value: 12 }
        ]},
        { id: 2, title: '🎯 OTI Required For Future Value', inputs: [
            { id: 'target', label: 'Target Future Value (₹)', value: 1000000 },
            { id: 'period', label: 'Investment Period (Yrs)', value: 5 },
            { id: 'rate', label: 'Growth Rate Assumed (%)', value: 15 }
        ]},
        { id: 3, title: '🗓️ SIP Calculator', inputs: [
            { id: 'amount', label: 'SIP Amount (Per Month) (₹)', value: 2000 },
            { id: 'period', label: 'SIP Period (Yrs)', value: 5 },
            { id: 'rate', label: 'Growth Rate Assumed (%)', value: 12 }
        ]},
        { id: 4, title: '🎯 SIP Required For Future Value', inputs: [
            { id: 'target', label: 'Target Future Value (₹)', value: 5200000 },
            { id: 'period', label: 'SIP Period (Yrs)', value: 20 },
            { id: 'rate', label: 'Growth Rate Assumed (%)', value: 12 }
        ]},
        { id: 5, title: '💸 SWP Calculator', inputs: [
            { id: 'investment', label: 'Initial Investment (₹)', value: 1000000 },
            { id: 'withdrawal', label: 'Monthly Withdrawal (₹)', value: 10000 },
            { id: 'rate', label: 'Expected Annual Return (%)', value: 10 },
            { id: 'period', label: 'Investment Period (Yrs)', value: 10 },
            { id: 'waiting_period', label: 'Waiting Period (Yrs)', value: 0 },
            { id: 'withdrawal_increase', label: 'Annual Withdrawal Increase', value: 0 }
        ]},
        { id: 6, title: '💰 Lumpsum for Target SWP', inputs: [
            { id: 'amount', label: 'SWP Amount Needed (Per Month) (₹)', value: 50000 },
            { id: 'period', label: 'SWP Period (Yrs)', value: 25 },
            { id: 'rate', label: 'Growth Rate Assumed (%)', value: 12 },
            { id: 'balance', label: 'Balance Required at End (₹)', value: 0 }
        ]},
        { id: 7, title: '⏳ FV of Limited Period SIP', inputs: [
            { id: 'amount', label: 'SIP Amount (Per Month) (₹)', value: 5000 },
            { id: 'sip_period', label: 'Limited SIP Period (Yrs)', value: 15 },
            { id: 'defer_period', label: 'Deferment Period (Yrs)', value: 10 },
            { id: 'rate', label: 'Growth Rate Assumed (%)', value: 15 }
        ]},
        { id: 8, title: '🏆 Limited Period SIP For Goal', inputs: [
            { id: 'target', label: 'Target Amount (₹)', value: 1000000 },
            { id: 'sip_period', label: 'Limited SIP Period (Yrs)', value: 15 },
            { id: 'defer_period', label: 'Deferment Period (Yrs)', value: 5 },
            { id: 'rate', label: 'Growth Rate Assumed (%)', value: 12 }
        ]},
        { id: 9, title: '➕ Combo (Onetime + SIP) for FV', inputs: [
            { id: 'sip_amount', label: 'SIP Amount (Per Month) (₹)', value: 10000 },
            { id: 'onetime_amount', label: 'Onetime Investment (₹)', value: 50000 },
            { id: 'period', label: 'Investment Period (Yrs)', value: 20 },
            { id: 'sip_rate', label: 'Growth Rate (SIP) (%)', value: 15 },
            { id: 'onetime_rate', label: 'Growth Rate (Onetime) (%)', value: 12 }
        ]},
        { id: 10, title: '🎯 Onetime Required (SIP known)', inputs: [
            { id: 'target', label: 'Target Future Value (₹)', value: 5000000 },
            { id: 'period', label: 'Investment Period (Yrs)', value: 20 },
            { id: 'sip_amount', label: 'SIP Amount (Per Month) (₹)', value: 20000 },
            { id: 'sip_rate', label: 'Expected Return (SIP) (%)', value: 15 },
            { id: 'onetime_rate', label: 'Expected Return (Onetime) (%)', value: 15 }
        ]},
        { id: 11, title: '🗓️ SIP Required (Onetime known)', inputs: [
            { id: 'target', label: 'Target Future Value (₹)', value: 10000000 },
            { id: 'period', label: 'Investment Period (Yrs)', value: 20 },
            { id: 'lumpsum', label: 'Lumpsum Investment (₹)', value: 100000 },
            { id: 'lumpsum_rate', label: 'Expected Return (Lumpsum) (%)', value: 15 },
            { id: 'sip_rate', label: 'Expected Return (SIP) (%)', value: 15 }
        ]},
    ];

    calculators.forEach(calc => {
        const stepId = `step-${calc.id}`;
        const emoji = calc.title.split(' ')[0];
        const text = calc.title.substring(calc.title.indexOf(' ') + 1);

        // Create Dashboard Card
        const card = document.createElement('div');
        card.className = 'calculator-card';
        card.onclick = () => showStep(stepId);
        card.innerHTML = `
            <div style="text-align: center; margin-bottom: var(--space-4);">
                <div style="font-size: 3rem; margin-bottom: var(--space-3);">${emoji}</div>
                <h3>${text}</h3>
            </div>
            <p style="text-align: center; color: var(--text-muted); margin-bottom: var(--space-4);">
                Click to open calculator
            </p>
            <button class="btn btn-primary">Open Calculator</button>`;
        dashboardGrid.appendChild(card);

        // Create Calculator Page
        const page = document.createElement('section');
        page.id = stepId;
        page.className = 'step';
        let inputsHTML = calc.inputs.map(input => {
            if (input.id === 'withdrawal_increase') {
                return `
                    <div class="form-field">
                        <label>${input.label}</label>
                        <div class="compound-input">
                            <span id="${stepId}-inc-badge" class="currency-badge" aria-hidden="true">%</span>
                            <input type="number" id="${stepId}-${input.id}" class="form-input" value="${input.value}" placeholder="5.00" style="padding-left: 2.75rem;">
                            <div class="toggle-switch inline-toggle" id="${stepId}-inc-toggle">
                                <input type="radio" id="${stepId}-inc-rupees" name="withdrawalIncreaseType" value="rupees">
                                <label for="${stepId}-inc-rupees">₹</label>
                                <input type="radio" id="${stepId}-inc-percent" name="withdrawalIncreaseType" value="percent" checked>
                                <label for="${stepId}-inc-percent">%</label>
                            </div>
                        </div>
                    </div>`;
            } else {
                return `
                    <div class="form-field">
                        <label>${input.label}</label>
                        <input type="number" id="${stepId}-${input.id}" class="form-input" value="${input.value}">
                    </div>`;
            }
        }).join('');
        
        page.innerHTML = `
             <header class="page-header">
                 <button class="btn back btn-sm" aria-label="Back">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Back
                </button>
                <div>
                    <h1>${calc.title}</h1>
                    <p class="subtitle">Financial Calculator</p>
                </div>
            </header>
            <div class="calculator-content">
                <div class="card">
                    <h2>Inputs</h2>
                    <div class="form-grid">${inputsHTML}</div>
                    <div class="actions">
                        <button class="btn btn-primary" id="calc-btn-${calc.id}">Calculate</button>
                        <button class="btn btn-secondary" id="reset-btn-${calc.id}">Reset</button>
                    </div>
                </div>
                <div class="card hidden" id="results-${calc.id}">
                    <h2>Results</h2>
                    <div class="results-summary" id="summary-${calc.id}"></div>
                    <div class="chart-container">
                        <canvas id="chart-${calc.id}"></canvas>
                    </div>
                    <div class="results-table" id="table-${calc.id}"></div>
                </div>
            </div>
        `;
        calculatorPagesContainer.appendChild(page);
        
        page.querySelector('.btn.back').addEventListener('click', () => showStep('step-0'));
    });
    
    setupCardEffects();

    // Back from calculators dashboard to main app
    if (calcBackMain) {
        calcBackMain.addEventListener('click', () => {
            // Navigate back to the main index.html
            window.location.href = '../index.html';
        });
    }

    calculators.forEach(calc => {
        document.getElementById(`calc-btn-${calc.id}`).addEventListener('click', () => {
            const results = calculate(calc.id);
            if (results) displayResults(calc.id, results);
        });
        document.getElementById(`reset-btn-${calc.id}`).addEventListener('click', () => {
            document.getElementById(`results-${calc.id}`).classList.add('hidden');
            calc.inputs.forEach(input => {
                document.getElementById(`step-${calc.id}-${input.id}`).value = input.value;
            });
            if (chartInstances[calc.id]) {
                chartInstances[calc.id].destroy();
                delete chartInstances[calc.id];
            }
        });
        
        // Add toggle functionality for SWP calculator
        if (calc.id === 5) {
            const stepId = `step-${calc.id}`;
            const incToggle = document.getElementById(`${stepId}-inc-toggle`);
            const incRupeesRadio = document.getElementById(`${stepId}-inc-rupees`);
            const incPercentRadio = document.getElementById(`${stepId}-inc-percent`);
            const withdrawalIncreaseInput = document.getElementById(`${stepId}-withdrawal_increase`);
            const incBadge = document.getElementById(`${stepId}-inc-badge`);

            let withdrawalIncreaseType = 'percent'; // Default to percentage

            const updateToggleClass = () => {
                if (incPercentRadio.checked) {
                    incToggle.classList.remove('rupees-selected');
                    withdrawalIncreaseType = 'percent';
                    withdrawalIncreaseInput.placeholder = 'e.g., 5 for %';
                    if (incBadge) incBadge.textContent = '%';
                } else {
                    incToggle.classList.add('rupees-selected');
                    withdrawalIncreaseType = 'rupees';
                    withdrawalIncreaseInput.placeholder = 'e.g., 500 for ₹';
                    if (incBadge) incBadge.textContent = '₹';
                }
                incToggle.setAttribute('data-increase-type', withdrawalIncreaseType);
            };

            incRupeesRadio.addEventListener('change', updateToggleClass);
            incPercentRadio.addEventListener('change', updateToggleClass);

            // Set default state
            incToggle.setAttribute('data-increase-type', withdrawalIncreaseType);
            updateToggleClass();
        }
    });

    // --- Calculation & Display Logic ---
    function validateInputs(calcId) {
        const inputs = document.querySelectorAll(`#step-${calcId} input[type="number"]`);
        let isValid = true;
        
        inputs.forEach(input => {
            const value = parseFloat(input.value);
            if (isNaN(value) || value < 0) {
                input.classList.add('input-error');
                isValid = false;
            } else {
                input.classList.remove('input-error');
            }
        });
        
        return isValid;
    }

    function calculate(calcId) {
        // Validate inputs first
        if (!validateInputs(calcId)) {
            alert('Please enter valid positive numbers for all fields.');
            return null;
        }
        
        // Router to specific calculation functions
        switch(calcId) {
            case 1: return calculateFVOnetime();
            case 2: return calculateOTIRequired();
            case 3: return calculateSIP();
            case 4: return calculateSIPRequired();
            case 5: return calculateSWP();
            case 6: return calculateLumpsumForSWP();
            case 7: return calculateFVLimitedSIP();
            case 8: return calculateLimitedSIPForGoal();
            case 9: return calculateComboFV();
            case 10: return calculateOnetimeRequiredSIPKnown();
            case 11: return calculateSIPRequiredOnetimeKnown();
            default: return null;
        }
    }

    // --- Individual Calculator Logic Functions ---
    function formatCurrency(value) {
        if (isNaN(value) || !isFinite(value)) return '₹0';
        if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
        if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)} Lakhs`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    }

    function displayResults(calcId, results) {
        if (!results || !results.summary || !results.chart || !results.table) {
            console.error("Invalid results structure for calculator:", calcId);
            return;
        }
        const summaryContainer = document.getElementById(`summary-${calcId}`);
        summaryContainer.innerHTML = results.summary.map(item => `
            <div class="summary-item">
                <p class="summary-label">${item.label}</p>
                <p class="summary-value">${item.value}</p>
            </div>
        `).join('');

        const chartCanvas = document.getElementById(`chart-${calcId}`);
        if (chartInstances[calcId]) chartInstances[calcId].destroy();
        chartInstances[calcId] = new Chart(chartCanvas.getContext('2d'), {
            type: results.chart.type,
            data: { labels: results.chart.labels, datasets: results.chart.datasets },
            options: getChartOptions(results.chart.type)
        });

        const tableContainer = document.getElementById(`table-${calcId}`);
        tableContainer.innerHTML = `
            <table class="results-table-content">
                <thead>
                    <tr>
                        ${results.table.headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${results.table.rows.map(row => `
                        <tr>
                            ${row.map(cell => `<td>${cell}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;

        document.getElementById(`results-${calcId}`).classList.remove('hidden');
    }

    function getChartOptions(chartType = 'line') {
        const isDarkMode = docElement.classList.contains('dark');
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDarkMode ? '#cbd5e1' : '#475569';
        
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    position: 'bottom',
                    align: 'center',
                    labels: { 
                        color: textColor,
                        font: {
                            size: 14,
                            weight: '500',
                            family: 'Inter, system-ui, sans-serif'
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 12,
                        boxHeight: 12
                    },
                    title: {
                        display: false
                    }
                },
                tooltip: {
                    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    titleFont: {
                        size: 13,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 12,
                        weight: '500'
                    },
                    padding: 12
                }
            }
        };
        
        // For pie/doughnut charts, don't include scales
        if (chartType === 'doughnut' || chartType === 'pie') {
            return baseOptions;
        }
        
        // For line/bar charts, include scales
        return {
            ...baseOptions,
            scales: {
                x: { 
                    grid: { color: gridColor }, 
                    ticks: { color: textColor } 
                },
                y: { 
                    grid: { color: gridColor }, 
                    ticks: { 
                        color: textColor, 
                        callback: (v) => formatCurrency(v).replace('₹', '') 
                    } 
                }
            }
        };
    }

    // === Calculator implementations ===
    function calculateFVOnetime() {
        const P = parseFloat(document.getElementById('step-1-investment').value);
        const t = parseInt(document.getElementById('step-1-period').value);
        const r = parseFloat(document.getElementById('step-1-rate').value) / 100;
        if (isNaN(P) || isNaN(t) || isNaN(r)) return null;

        let balance = P;
        const chartLabels = ['Start'];
        const chartData = [P];
        const tableRows = [];
        let totalInterest = 0;

        for (let year = 1; year <= t; year++) {
            let yearStartBalance = balance;
            let interestThisYear = balance * r;
            balance += interestThisYear;
            totalInterest += interestThisYear;
            chartLabels.push(`Year ${year}`);
            chartData.push(balance);
            tableRows.push([year, formatCurrency(yearStartBalance), formatCurrency(interestThisYear), formatCurrency(balance)]);
        }

        return { 
            summary: [ 
                { label: 'Principal', value: formatCurrency(P) }, 
                { label: 'Total Interest', value: formatCurrency(totalInterest) }, 
                { label: 'Final Value', value: formatCurrency(balance) } 
            ], 
            chart: { 
                type: 'line', 
                labels: chartLabels, 
                datasets: [ 
                    { 
                        label: 'Corpus Value', 
                        data: chartData, 
                        borderColor: '#107A8A', 
                        tension: 0.1, 
                        fill: true, 
                        backgroundColor: 'rgba(16, 122, 138, 0.1)' 
                    } 
                ] 
            }, 
            table: { 
                headers: ['Year', 'Opening Balance', 'Interest Earned', 'Closing Balance'], 
                rows: tableRows 
            } 
        };
    }

    function calculateOTIRequired() {
        const FV = parseFloat(document.getElementById('step-2-target').value);
        const t = parseInt(document.getElementById('step-2-period').value);
        const r = parseFloat(document.getElementById('step-2-rate').value) / 100;
        if (isNaN(FV) || isNaN(t) || isNaN(r)) return null;

        const PV = FV / Math.pow((1 + r), t);
        let balance = PV;
        const chartLabels = ['Start'];
        const chartData = [PV];
        const tableRows = [];

        for (let year = 1; year <= t; year++) {
            let yearStartBalance = balance;
            let interestThisYear = balance * r;
            balance += interestThisYear;
            chartLabels.push(`Year ${year}`);
            chartData.push(balance);
            tableRows.push([year, formatCurrency(yearStartBalance), formatCurrency(interestThisYear), formatCurrency(balance)]);
        }

        return { 
            summary: [ 
                { label: 'Investment Needed', value: formatCurrency(PV) }, 
                { label: 'Total Interest', value: formatCurrency(FV - PV) }, 
                { label: 'Target Value', value: formatCurrency(FV) } 
            ], 
            chart: { 
                type: 'line', 
                labels: chartLabels, 
                datasets: [ 
                    { 
                        label: 'Investment Growth', 
                        data: chartData, 
                        borderColor: '#107A8A', 
                        tension: 0.1, 
                        fill: true, 
                        backgroundColor: 'rgba(16, 122, 138, 0.1)' 
                    } 
                ] 
            }, 
            table: { 
                headers: ['Year', 'Opening Balance', 'Interest Earned', 'Closing Balance'], 
                rows: tableRows 
            } 
        };
    }

    function calculateSIP() {
        const P = parseFloat(document.getElementById('step-3-amount').value);
        const t = parseInt(document.getElementById('step-3-period').value);
        const r = parseFloat(document.getElementById('step-3-rate').value) / 100;
        if (isNaN(P) || isNaN(t) || isNaN(r)) return null;

        let balance = 0;
        let totalInvested = 0;
        let totalInterest = 0;
        const chartLabels = [];
        const chartDataPrincipal = [];
        const chartDataInterest = [];
        const tableRows = [];

        for (let year = 1; year <= t; year++) {
            let yearStartBalance = balance;
            let yearInterest = 0;
            for (let month = 1; month <= 12; month++) {
                balance += P;
                let monthlyInterest = balance * (r / 12);
                balance += monthlyInterest;
                yearInterest += monthlyInterest;
            }
            totalInvested += P * 12;
            totalInterest += yearInterest;
            
            chartLabels.push(`Year ${year}`);
            chartDataPrincipal.push(totalInvested);
            chartDataInterest.push(totalInterest);
            tableRows.push([year, formatCurrency(yearStartBalance), formatCurrency(P*12), formatCurrency(yearInterest), formatCurrency(balance)]);
        }

        return { 
            summary: [ 
                { label: 'Total Invested', value: formatCurrency(totalInvested) }, 
                { label: 'Total Interest', value: formatCurrency(totalInterest) }, 
                { label: 'Final Value', value: formatCurrency(balance) } 
            ], 
            chart: { 
                type: 'bar', 
                labels: chartLabels, 
                datasets: [ 
                    { label: 'Principal', data: chartDataPrincipal, backgroundColor: '#107A8A' }, 
                    { label: 'Interest', data: chartDataInterest, backgroundColor: '#83E85A' } 
                ] 
            }, 
            table: { 
                headers: ['Year', 'Opening Balance', 'Annual Investment', 'Interest Earned', 'Closing Balance'], 
                rows: tableRows 
            } 
        };
    }

    function calculateSIPRequired() {
        const FV = parseFloat(document.getElementById('step-4-target').value);
        const t = parseInt(document.getElementById('step-4-period').value);
        const r = parseFloat(document.getElementById('step-4-rate').value) / 100;
        if (isNaN(FV) || isNaN(t) || isNaN(r)) return null;
        const i = r / 12; 
        const n = t * 12; 
        let P;
        if (i === 0) {
            P = FV / n;
        } else {
            P = FV / ( ( (Math.pow(1 + i, n) - 1) / i ) * (1 + i) );
        }
        let balance = 0, totalInvested = 0, totalInterest = 0; 
        const labels=[], dp=[], di=[], rows=[];
        for (let year=1; year<=t; year++){ 
            const start=balance; 
            let yInt=0; 
            for (let m=1; m<=12; m++){ 
                balance+=P; 
                const mi=balance*i; 
                balance+=mi; 
                yInt+=mi; 
            } 
            totalInvested+=P*12; 
            totalInterest+=yInt; 
            labels.push(`Year ${year}`); 
            dp.push(totalInvested); 
            di.push(totalInterest); 
            rows.push([year, formatCurrency(start), formatCurrency(P*12), formatCurrency(yInt), formatCurrency(balance)]);
        } 
        return { 
            summary:[
                {label:'Monthly SIP Needed', value: formatCurrency(P)}, 
                {label:'Total Invested', value: formatCurrency(totalInvested)}, 
                {label:'Target Value', value: formatCurrency(FV)}
            ], 
            chart:{
                type:'bar', 
                labels, 
                datasets:[
                    {label:'Principal', data:dp, backgroundColor:'#107A8A'}, 
                    {label:'Interest', data:di, backgroundColor:'#83E85A'}
                ]
            }, 
            table:{
                headers:['Year','Opening Balance','Annual Investment','Interest Earned','Closing Balance'], 
                rows
            } 
        };
    }

    function calculateSWP() {
        const initialInvestment = parseFloat(document.getElementById('step-5-investment').value);
        const monthlyWithdrawal = parseFloat(document.getElementById('step-5-withdrawal').value);
        const annualReturnRate = parseFloat(document.getElementById('step-5-rate').value);
        const investmentPeriodYears = parseInt(document.getElementById('step-5-period').value);
        const withdrawalIncrease = parseFloat(document.getElementById('step-5-withdrawal_increase').value) || 0;
        const waitingPeriodYears = parseInt(document.getElementById('step-5-waiting_period').value) || 0;
        const withdrawalIncreaseType = document.getElementById('step-5-inc-toggle').getAttribute('data-increase-type') || 'percent';
        
        if (isNaN(initialInvestment) || initialInvestment <= 0) return null;
        if (isNaN(monthlyWithdrawal) || monthlyWithdrawal <= 0) return null;
        if (isNaN(annualReturnRate) || annualReturnRate < 0) return null;
        if (isNaN(investmentPeriodYears) || investmentPeriodYears <= 0) return null;
        if (isNaN(waitingPeriodYears) || waitingPeriodYears < 0) return null;
        if (waitingPeriodYears >= investmentPeriodYears) return null;

        let currentBalance = initialInvestment;
        let totalWithdrawn = 0;
        let totalInterestEarned = 0;
        const monthlyReturnRate = annualReturnRate / 100 / 12;
        const totalMonths = investmentPeriodYears * 12;
        const chartLabels = ['Start'];
        const chartData = [initialInvestment];
        const tableRows = [];
        let currentMonthlyWithdrawal = monthlyWithdrawal;
        
        for (let month = 1; month <= totalMonths; month++) {
            const openingBalance = currentBalance;
            let interestThisMonth = 0;
            let actualWithdrawal = 0;
            
            if (month <= waitingPeriodYears * 12) {
                interestThisMonth = openingBalance * monthlyReturnRate;
                currentBalance += interestThisMonth;
                totalInterestEarned += interestThisMonth;
                actualWithdrawal = 0;
            } else {
                // Annual step-up at the start of the year (relative to first withdrawal month)
                if ((month - (waitingPeriodYears * 12)) % 12 === 1 && month > 1) {
                    if (withdrawalIncrease > 0) {
                        if (withdrawalIncreaseType === 'percent') {
                            currentMonthlyWithdrawal *= (1 + withdrawalIncrease / 100);
                        } else {
                            currentMonthlyWithdrawal += withdrawalIncrease;
                        }
                    }
                }
                
                if (currentBalance <= 0) {
                    currentBalance = 0;
                    actualWithdrawal = 0;
                    interestThisMonth = 0;
                } else {
                    // Accrue interest first, then withdraw (standard SWP practice)
                    interestThisMonth = currentBalance * monthlyReturnRate;
                    currentBalance += interestThisMonth;
                    totalInterestEarned += interestThisMonth;

                    // Then withdraw from the updated balance
                    if (currentBalance < currentMonthlyWithdrawal) {
                        actualWithdrawal = currentBalance;
                        currentBalance = 0;
                    } else {
                        actualWithdrawal = currentMonthlyWithdrawal;
                        currentBalance -= currentMonthlyWithdrawal;
                    }
                    totalWithdrawn += actualWithdrawal;
                }
            }
            
            if (month % 12 === 0) {
                const year = month / 12;
                chartLabels.push(`Year ${year}`);
                chartData.push(currentBalance);
                const yearlyInterest = totalInterestEarned - (tableRows.length > 0 ? tableRows[tableRows.length - 1].totalInterest : 0);
                const yearlyWithdrawal = totalWithdrawn - (tableRows.length > 0 ? tableRows[tableRows.length - 1].totalWithdrawn : 0);
                tableRows.push({
                    year: year,
                    openingBalance: (tableRows.length > 0) ? tableRows[tableRows.length - 1].closingBalance : initialInvestment,
                    withdrawal: currentMonthlyWithdrawal,
                    totalWithdrawal: totalWithdrawn,
                    interest: yearlyInterest,
                    totalInterest: totalInterestEarned,
                    closingBalance: currentBalance
                });
            }
        }
        
        const formattedTableRows = tableRows.map(row => [
            row.year,
            formatCurrency(row.openingBalance),
            formatCurrency(row.totalWithdrawal),
            formatCurrency(row.totalInterest),
            formatCurrency(row.closingBalance)
        ]);
        
        return {
            summary: [
                { label: 'Total Withdrawn', value: formatCurrency(totalWithdrawn) },
                { label: 'Total Interest', value: formatCurrency(totalInterestEarned) },
                { label: 'Final Value', value: formatCurrency(currentBalance) }
            ],
            chart: {
                type: 'line', 
                labels: chartLabels,
                datasets: [{
                    label: 'Corpus Value',
                    data: chartData,
                    borderColor: '#107A8A',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(16, 122, 138, 0.2)',
                    borderWidth: 3,
                    hoverBorderWidth: 4,
                    hoverBorderColor: ['#0A5A6A', '#1D4ED8', '#047857'],
                    hoverBackgroundColor: ['#0F6B7A', '#2563EB', '#059669'],
                    pointBackgroundColor: '#107A8A',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#107A8A'
                }]
            },
            table: { 
                headers: ['Year', 'Opening Balance', 'Total Withdrawn', 'Total Interest', 'Closing Balance'], 
                rows: formattedTableRows 
            }
        };
    }

    // === Additional Calculator Functions ===
    
    function calculateLumpsumForSWP() {
        const amount = parseFloat(document.getElementById('step-6-amount').value);
        const period = parseInt(document.getElementById('step-6-period').value);
        const rate = parseFloat(document.getElementById('step-6-rate').value) / 100;
        const balance = parseFloat(document.getElementById('step-6-balance').value) || 0;
        
        if (isNaN(amount) || isNaN(period) || isNaN(rate)) return null;
        
        const monthlyRate = rate / 12;
        const totalMonths = period * 12;
        
        // Calculate lumpsum needed for SWP
        let lumpsum = 0;
        for (let i = 0; i < totalMonths; i++) {
            lumpsum += amount / Math.pow(1 + monthlyRate, i);
        }
        lumpsum += balance / Math.pow(1 + rate, period);
        
        const totalWithdrawals = amount * totalMonths;
        const interest = totalWithdrawals + balance - lumpsum;
        
        return {
            summary: [
                { label: 'Lumpsum Required', value: formatCurrency(lumpsum) },
                { label: 'Total Withdrawals', value: formatCurrency(totalWithdrawals) },
                { label: 'Interest Earned', value: formatCurrency(interest) }
            ],
            chart: {
                type: 'doughnut',
                labels: ['Lumpsum Required', 'Interest Earned'],
                datasets: [{
                    data: [lumpsum, interest],
                    backgroundColor: ['#107A8A', '#10B981'],
                    borderColor: ['#0F6B7A', '#059669'],
                    borderWidth: 3,
                    hoverBorderWidth: 4,
                    hoverBorderColor: ['#0A5A6A', '#1D4ED8', '#047857'],
                    hoverBackgroundColor: ['#0F6B7A', '#2563EB', '#059669']
                }]
            },
            table: {
                headers: ['Year', 'Monthly Withdrawal', 'Balance at Year End'],
                rows: Array.from({length: period}, (_, i) => {
                    const year = i + 1;
                    const yearWithdrawals = amount * 12;
                    const remainingBalance = Math.max(0, lumpsum * Math.pow(1 + rate, year) - amount * 12 * ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate));
                    return [year, formatCurrency(yearWithdrawals), formatCurrency(remainingBalance)];
                })
            }
        };
    }
    
    function calculateFVLimitedSIP() {
        const amount = parseFloat(document.getElementById('step-7-amount').value);
        const sipPeriod = parseInt(document.getElementById('step-7-sip_period').value);
        const deferPeriod = parseInt(document.getElementById('step-7-defer_period').value);
        const rate = parseFloat(document.getElementById('step-7-rate').value) / 100;
        
        if (isNaN(amount) || isNaN(sipPeriod) || isNaN(deferPeriod) || isNaN(rate)) return null;
        
        const monthlyRate = rate / 12;
        const sipMonths = sipPeriod * 12;
        
        // Calculate SIP future value
        const sipFV = amount * ((Math.pow(1 + monthlyRate, sipMonths) - 1) / monthlyRate);
        
        // Calculate final value after deferment
        const finalValue = sipFV * Math.pow(1 + rate, deferPeriod);
        
        const totalInvested = amount * sipMonths;
        const interest = finalValue - totalInvested;
        
        return {
            summary: [
                { label: 'Total Invested', value: formatCurrency(totalInvested) },
                { label: 'SIP Value at End', value: formatCurrency(sipFV) },
                { label: 'Final Value', value: formatCurrency(finalValue) },
                { label: 'Interest Earned', value: formatCurrency(interest) }
            ],
            chart: {
                type: 'doughnut',
                labels: ['Total Invested', 'Interest Earned'],
                datasets: [{
                    data: [totalInvested, interest],
                    backgroundColor: ['#107A8A', '#10B981'],
                    borderColor: ['#0F6B7A', '#059669'],
                    borderWidth: 3,
                    hoverBorderWidth: 4,
                    hoverBorderColor: ['#0A5A6A', '#1D4ED8', '#047857'],
                    hoverBackgroundColor: ['#0F6B7A', '#2563EB', '#059669']
                }]
            },
            table: {
                headers: ['Year', 'SIP Amount', 'Cumulative Value'],
                rows: Array.from({length: sipPeriod}, (_, i) => {
                    const year = i + 1;
                    const yearSIP = amount * 12;
                    const cumulativeValue = amount * ((Math.pow(1 + monthlyRate, year * 12) - 1) / monthlyRate);
                    return [year, formatCurrency(yearSIP), formatCurrency(cumulativeValue)];
                })
            }
        };
    }
    
    function calculateLimitedSIPForGoal() {
        const target = parseFloat(document.getElementById('step-8-target').value);
        const sipPeriod = parseInt(document.getElementById('step-8-sip_period').value);
        const deferPeriod = parseInt(document.getElementById('step-8-defer_period').value);
        const rate = parseFloat(document.getElementById('step-8-rate').value) / 100;
        
        if (isNaN(target) || isNaN(sipPeriod) || isNaN(deferPeriod) || isNaN(rate)) return null;
        
        const monthlyRate = rate / 12;
        const sipMonths = sipPeriod * 12;
        
        // Calculate required SIP amount
        const requiredSIPFV = target / Math.pow(1 + rate, deferPeriod);
        const sipAmount = requiredSIPFV / ((Math.pow(1 + monthlyRate, sipMonths) - 1) / monthlyRate);
        
        const totalInvested = sipAmount * sipMonths;
        const interest = target - totalInvested;
        
        return {
            summary: [
                { label: 'Required SIP Amount', value: formatCurrency(sipAmount) },
                { label: 'Total Invested', value: formatCurrency(totalInvested) },
                { label: 'Target Amount', value: formatCurrency(target) },
                { label: 'Interest Earned', value: formatCurrency(interest) }
            ],
            chart: {
                type: 'doughnut',
                labels: ['Total Invested', 'Interest Earned'],
                datasets: [{
                    data: [totalInvested, interest],
                    backgroundColor: ['#107A8A', '#10B981'],
                    borderColor: ['#0F6B7A', '#059669'],
                    borderWidth: 3,
                    hoverBorderWidth: 4,
                    hoverBorderColor: ['#0A5A6A', '#1D4ED8', '#047857'],
                    hoverBackgroundColor: ['#0F6B7A', '#2563EB', '#059669']
                }]
            },
            table: {
                headers: ['Year', 'SIP Amount', 'Cumulative Value'],
                rows: Array.from({length: sipPeriod}, (_, i) => {
                    const year = i + 1;
                    const yearSIP = sipAmount * 12;
                    const cumulativeValue = sipAmount * ((Math.pow(1 + monthlyRate, year * 12) - 1) / monthlyRate);
                    return [year, formatCurrency(yearSIP), formatCurrency(cumulativeValue)];
                })
            }
        };
    }
    
    function calculateComboFV() {
        const sipAmount = parseFloat(document.getElementById('step-9-sip_amount').value);
        const onetimeAmount = parseFloat(document.getElementById('step-9-onetime_amount').value);
        const period = parseInt(document.getElementById('step-9-period').value);
        const sipRate = parseFloat(document.getElementById('step-9-sip_rate').value) / 100;
        const onetimeRate = parseFloat(document.getElementById('step-9-onetime_rate').value) / 100;
        
        if (isNaN(sipAmount) || isNaN(onetimeAmount) || isNaN(period) || isNaN(sipRate) || isNaN(onetimeRate)) return null;
        
        const sipMonthlyRate = sipRate / 12;
        const sipMonths = period * 12;
        
        // Calculate SIP future value
        const sipFV = sipAmount * ((Math.pow(1 + sipMonthlyRate, sipMonths) - 1) / sipMonthlyRate);
        
        // Calculate onetime future value
        const onetimeFV = onetimeAmount * Math.pow(1 + onetimeRate, period);
        
        const totalFV = sipFV + onetimeFV;
        const totalInvested = (sipAmount * sipMonths) + onetimeAmount;
        const interest = totalFV - totalInvested;
        
        return {
            summary: [
                { label: 'SIP Future Value', value: formatCurrency(sipFV) },
                { label: 'Onetime Future Value', value: formatCurrency(onetimeFV) },
                { label: 'Total Future Value', value: formatCurrency(totalFV) },
                { label: 'Total Invested', value: formatCurrency(totalInvested) },
                { label: 'Interest Earned', value: formatCurrency(interest) }
            ],
            chart: {
                type: 'doughnut',
                labels: ['SIP Value', 'Onetime Value', 'Interest Earned'],
                datasets: [{
                    data: [sipFV, onetimeFV, interest],
                    backgroundColor: ['#107A8A', '#3B82F6', '#10B981'],
                    borderColor: ['#0F6B7A', '#2563EB', '#059669'],
                    borderWidth: 3,
                    hoverBorderWidth: 4,
                    hoverBorderColor: ['#0A5A6A', '#1D4ED8', '#047857'],
                    hoverBackgroundColor: ['#0F6B7A', '#2563EB', '#059669']
                }]
            },
            table: {
                headers: ['Year', 'SIP Value', 'Onetime Value', 'Total Value'],
                rows: Array.from({length: period}, (_, i) => {
                    const year = i + 1;
                    const yearSIPValue = sipAmount * ((Math.pow(1 + sipMonthlyRate, year * 12) - 1) / sipMonthlyRate);
                    const yearOnetimeValue = onetimeAmount * Math.pow(1 + onetimeRate, year);
                    const totalValue = yearSIPValue + yearOnetimeValue;
                    return [year, formatCurrency(yearSIPValue), formatCurrency(yearOnetimeValue), formatCurrency(totalValue)];
                })
            }
        };
    }
    
    function calculateOnetimeRequiredSIPKnown() {
        const target = parseFloat(document.getElementById('step-10-target').value);
        const period = parseInt(document.getElementById('step-10-period').value);
        const sipAmount = parseFloat(document.getElementById('step-10-sip_amount').value);
        const sipRate = parseFloat(document.getElementById('step-10-sip_rate').value) / 100;
        const onetimeRate = parseFloat(document.getElementById('step-10-onetime_rate').value) / 100;
        
        if (isNaN(target) || isNaN(period) || isNaN(sipAmount) || isNaN(sipRate) || isNaN(onetimeRate)) return null;
        
        const sipMonthlyRate = sipRate / 12;
        const sipMonths = period * 12;
        
        // Calculate SIP future value
        const sipFV = sipAmount * ((Math.pow(1 + sipMonthlyRate, sipMonths) - 1) / sipMonthlyRate);
        
        // Calculate required onetime amount
        const requiredOnetimeFV = target - sipFV;
        const onetimeAmount = requiredOnetimeFV / Math.pow(1 + onetimeRate, period);
        
        const totalInvested = (sipAmount * sipMonths) + onetimeAmount;
        const interest = target - totalInvested;
        
        return {
            summary: [
                { label: 'Required Onetime Amount', value: formatCurrency(onetimeAmount) },
                { label: 'SIP Future Value', value: formatCurrency(sipFV) },
                { label: 'Onetime Future Value', value: formatCurrency(requiredOnetimeFV) },
                { label: 'Target Amount', value: formatCurrency(target) },
                { label: 'Interest Earned', value: formatCurrency(interest) }
            ],
            chart: {
                type: 'doughnut',
                labels: ['SIP Value', 'Onetime Value', 'Interest Earned'],
                datasets: [{
                    data: [sipFV, requiredOnetimeFV, interest],
                    backgroundColor: ['#107A8A', '#3B82F6', '#10B981'],
                    borderColor: ['#0F6B7A', '#2563EB', '#059669'],
                    borderWidth: 3,
                    hoverBorderWidth: 4,
                    hoverBorderColor: ['#0A5A6A', '#1D4ED8', '#047857'],
                    hoverBackgroundColor: ['#0F6B7A', '#2563EB', '#059669']
                }]
            },
            table: {
                headers: ['Year', 'SIP Value', 'Onetime Value', 'Total Value'],
                rows: Array.from({length: period}, (_, i) => {
                    const year = i + 1;
                    const yearSIPValue = sipAmount * ((Math.pow(1 + sipMonthlyRate, year * 12) - 1) / sipMonthlyRate);
                    const yearOnetimeValue = onetimeAmount * Math.pow(1 + onetimeRate, year);
                    const totalValue = yearSIPValue + yearOnetimeValue;
                    return [year, formatCurrency(yearSIPValue), formatCurrency(yearOnetimeValue), formatCurrency(totalValue)];
                })
            }
        };
    }
    
    function calculateSIPRequiredOnetimeKnown() {
        const target = parseFloat(document.getElementById('step-11-target').value);
        const period = parseInt(document.getElementById('step-11-period').value);
        const lumpsum = parseFloat(document.getElementById('step-11-lumpsum').value);
        const lumpsumRate = parseFloat(document.getElementById('step-11-lumpsum_rate').value) / 100;
        const sipRate = parseFloat(document.getElementById('step-11-sip_rate').value) / 100;
        
        if (isNaN(target) || isNaN(period) || isNaN(lumpsum) || isNaN(lumpsumRate) || isNaN(sipRate)) return null;
        
        const sipMonthlyRate = sipRate / 12;
        const sipMonths = period * 12;
        
        // Calculate lumpsum future value
        const lumpsumFV = lumpsum * Math.pow(1 + lumpsumRate, period);
        
        // Calculate required SIP amount
        const requiredSIPFV = target - lumpsumFV;
        const sipAmount = requiredSIPFV / ((Math.pow(1 + sipMonthlyRate, sipMonths) - 1) / sipMonthlyRate);
        
        const totalInvested = (sipAmount * sipMonths) + lumpsum;
        const interest = target - totalInvested;
        
        return {
            summary: [
                { label: 'Required SIP Amount', value: formatCurrency(sipAmount) },
                { label: 'Lumpsum Future Value', value: formatCurrency(lumpsumFV) },
                { label: 'SIP Future Value', value: formatCurrency(requiredSIPFV) },
                { label: 'Target Amount', value: formatCurrency(target) },
                { label: 'Interest Earned', value: formatCurrency(interest) }
            ],
            chart: {
                type: 'doughnut',
                labels: ['SIP Value', 'Lumpsum Value', 'Interest Earned'],
                datasets: [{
                    data: [requiredSIPFV, lumpsumFV, interest],
                    backgroundColor: ['#107A8A', '#3B82F6', '#10B981'],
                    borderColor: ['#0F6B7A', '#2563EB', '#059669'],
                    borderWidth: 3,
                    hoverBorderWidth: 4,
                    hoverBorderColor: ['#0A5A6A', '#1D4ED8', '#047857'],
                    hoverBackgroundColor: ['#0F6B7A', '#2563EB', '#059669']
                }]
            },
            table: {
                headers: ['Year', 'SIP Value', 'Lumpsum Value', 'Total Value'],
                rows: Array.from({length: period}, (_, i) => {
                    const year = i + 1;
                    const yearSIPValue = sipAmount * ((Math.pow(1 + sipMonthlyRate, year * 12) - 1) / sipMonthlyRate);
                    const yearLumpsumValue = lumpsum * Math.pow(1 + lumpsumRate, year);
                    const totalValue = yearSIPValue + yearLumpsumValue;
                    return [year, formatCurrency(yearSIPValue), formatCurrency(yearLumpsumValue), formatCurrency(totalValue)];
                })
            }
        };
    }

});
