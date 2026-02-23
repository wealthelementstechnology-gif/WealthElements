(function() {
    'use strict';

    // DOM Elements
    const loanAmountInput = document.getElementById('loanAmount');
    const loanAmountSlider = document.getElementById('loanAmountSlider');
    const interestRateInput = document.getElementById('interestRate');
    const interestRateSlider = document.getElementById('interestRateSlider');
    const loanTenureInput = document.getElementById('loanTenure');
    const loanTenureSlider = document.getElementById('loanTenureSlider');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const printBtn = document.getElementById('printBtn');
    const backBtn = document.getElementById('go-back');

    // Result Elements
    const monthlyEMIEl = document.getElementById('monthlyEMI');
    const principalAmountEl = document.getElementById('principalAmount');
    const totalInterestEl = document.getElementById('totalInterest');
    const totalAmountEl = document.getElementById('totalAmount');

    // Table Elements
    const amortizationBody = document.getElementById('amortizationBody');
    const monthlyBody = document.getElementById('monthlyBody');
    const yearSelect = document.getElementById('yearSelect');
    const monthlyTableContainer = document.getElementById('monthlyTableContainer');

    // Chart instances
    let pieChart = null;
    let yearlyChart = null;
    let balanceChart = null;

    // Store calculation data
    let calculationData = {
        monthlySchedule: [],
        yearlySchedule: [],
        principal: 0,
        totalInterest: 0,
        totalAmount: 0,
        emi: 0,
        tenureMonths: 0
    };

    // Tenure unit (years or months)
    let tenureUnit = 'years';

    // Format number to Indian currency format
    function formatCurrency(num) {
        if (isNaN(num) || num === null) return '₹0';
        const rounded = Math.round(num);
        return '₹' + rounded.toLocaleString('en-IN');
    }

    // Format number for input (with commas)
    function formatNumberInput(num) {
        if (!num) return '';
        return num.toLocaleString('en-IN');
    }

    // Parse number from formatted string
    function parseNumber(str) {
        if (!str) return 0;
        return parseFloat(str.toString().replace(/,/g, '')) || 0;
    }

    // Calculate EMI using the standard formula
    // E = [P x R x (1+R)^N] / [(1+R)^N - 1]
    function calculateEMI(principal, annualRate, tenureMonths) {
        if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) {
            return { emi: 0, totalInterest: 0, totalAmount: 0 };
        }

        const monthlyRate = annualRate / 12 / 100;
        const factor = Math.pow(1 + monthlyRate, tenureMonths);
        const emi = (principal * monthlyRate * factor) / (factor - 1);
        const totalAmount = emi * tenureMonths;
        const totalInterest = totalAmount - principal;

        return {
            emi: emi,
            totalInterest: totalInterest,
            totalAmount: totalAmount
        };
    }

    // Generate monthly amortization schedule
    function generateAmortizationSchedule(principal, annualRate, tenureMonths, emi) {
        const monthlySchedule = [];
        const yearlySchedule = [];
        let balance = principal;
        const monthlyRate = annualRate / 12 / 100;

        let yearlyPrincipal = 0;
        let yearlyInterest = 0;
        let currentYear = 1;

        for (let month = 1; month <= tenureMonths; month++) {
            const interestComponent = balance * monthlyRate;
            const principalComponent = emi - interestComponent;
            balance = balance - principalComponent;

            // Handle floating point precision for last payment
            if (balance < 0) balance = 0;

            monthlySchedule.push({
                month: month,
                year: currentYear,
                emi: emi,
                principal: principalComponent,
                interest: interestComponent,
                balance: balance
            });

            yearlyPrincipal += principalComponent;
            yearlyInterest += interestComponent;

            // End of year or last month
            if (month % 12 === 0 || month === tenureMonths) {
                yearlySchedule.push({
                    year: currentYear,
                    principal: yearlyPrincipal,
                    interest: yearlyInterest,
                    totalPayment: yearlyPrincipal + yearlyInterest,
                    balance: balance,
                    monthsInYear: month % 12 === 0 ? 12 : month % 12
                });
                yearlyPrincipal = 0;
                yearlyInterest = 0;
                currentYear++;
            }
        }

        return { monthlySchedule, yearlySchedule };
    }

    // Update the results display
    function updateResults() {
        const principal = parseNumber(loanAmountInput.value);
        const annualRate = parseFloat(interestRateInput.value) || 0;
        let tenureMonths = parseInt(loanTenureInput.value) || 0;

        if (tenureUnit === 'years') {
            tenureMonths = tenureMonths * 12;
        }

        if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) {
            monthlyEMIEl.textContent = '₹0';
            principalAmountEl.textContent = '₹0';
            totalInterestEl.textContent = '₹0';
            totalAmountEl.textContent = '₹0';
            return;
        }

        const result = calculateEMI(principal, annualRate, tenureMonths);
        const schedule = generateAmortizationSchedule(principal, annualRate, tenureMonths, result.emi);

        // Store calculation data
        calculationData = {
            monthlySchedule: schedule.monthlySchedule,
            yearlySchedule: schedule.yearlySchedule,
            principal: principal,
            totalInterest: result.totalInterest,
            totalAmount: result.totalAmount,
            emi: result.emi,
            tenureMonths: tenureMonths
        };

        // Update summary cards
        monthlyEMIEl.textContent = formatCurrency(result.emi);
        principalAmountEl.textContent = formatCurrency(principal);
        totalInterestEl.textContent = formatCurrency(result.totalInterest);
        totalAmountEl.textContent = formatCurrency(result.totalAmount);

        // Update charts
        updatePieChart(principal, result.totalInterest);
        updateYearlyChart(schedule.yearlySchedule);
        updateBalanceChart(schedule.yearlySchedule, principal);

        // Update tables
        updateYearlyTable(schedule.yearlySchedule);
        populateYearSelector(schedule.yearlySchedule.length);
        updateMonthlyTable(1);
    }

    // Update pie chart
    function updatePieChart(principal, interest) {
        const ctx = document.getElementById('emiPieChart');
        if (!ctx) return;

        const data = {
            labels: ['Principal Amount', 'Total Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#22c55e', '#ef4444'],
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverBorderWidth: 4
            }]
        };

        if (pieChart) {
            pieChart.data = data;
            pieChart.update();
        } else {
            pieChart = new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#ffffff',
                            borderWidth: 1,
                            cornerRadius: 8,
                            padding: 12,
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${formatCurrency(value)} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }

        // Update custom legend
        updatePieLegend(principal, interest);
    }

    // Update pie chart legend
    function updatePieLegend(principal, interest) {
        const legendContainer = document.getElementById('pieLegend');
        if (!legendContainer) return;

        const total = principal + interest;
        const principalPercent = ((principal / total) * 100).toFixed(1);
        const interestPercent = ((interest / total) * 100).toFixed(1);

        legendContainer.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background-color: #22c55e;"></div>
                <div class="legend-text">
                    <span class="legend-label">Principal Amount</span>
                    <span class="legend-value">${formatCurrency(principal)} (${principalPercent}%)</span>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background-color: #ef4444;"></div>
                <div class="legend-text">
                    <span class="legend-label">Total Interest</span>
                    <span class="legend-value">${formatCurrency(interest)} (${interestPercent}%)</span>
                </div>
            </div>
        `;
    }

    // Update yearly breakdown chart
    function updateYearlyChart(yearlyData) {
        const ctx = document.getElementById('yearlyBreakdownChart');
        if (!ctx) return;

        const labels = yearlyData.map(d => `Year ${d.year}`);
        const principalData = yearlyData.map(d => d.principal);
        const interestData = yearlyData.map(d => d.interest);

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Principal',
                    data: principalData,
                    backgroundColor: '#22c55e',
                    borderRadius: 4
                },
                {
                    label: 'Interest',
                    data: interestData,
                    backgroundColor: '#ef4444',
                    borderRadius: 4
                }
            ]
        };

        if (yearlyChart) {
            yearlyChart.data = data;
            yearlyChart.update();
        } else {
            yearlyChart = new Chart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: true,
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim()
                            }
                        },
                        y: {
                            stacked: true,
                            grid: {
                                color: getComputedStyle(document.body).getPropertyValue('--border-primary').trim()
                            },
                            ticks: {
                                color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim(),
                                callback: function(value) {
                                    if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + 'Cr';
                                    if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
                                    if (value >= 1000) return '₹' + (value / 1000).toFixed(1) + 'K';
                                    return '₹' + value;
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim(),
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }
    }

    // Update balance chart
    function updateBalanceChart(yearlyData, principal) {
        const ctx = document.getElementById('balanceChart');
        if (!ctx) return;

        const labels = ['Start', ...yearlyData.map(d => `Year ${d.year}`)];
        const balanceData = [principal, ...yearlyData.map(d => d.balance)];

        const data = {
            labels: labels,
            datasets: [{
                label: 'Outstanding Balance',
                data: balanceData,
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#0ea5e9',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        };

        if (balanceChart) {
            balanceChart.data = data;
            balanceChart.update();
        } else {
            balanceChart = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim()
                            }
                        },
                        y: {
                            grid: {
                                color: getComputedStyle(document.body).getPropertyValue('--border-primary').trim()
                            },
                            ticks: {
                                color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim(),
                                callback: function(value) {
                                    if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + 'Cr';
                                    if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
                                    if (value >= 1000) return '₹' + (value / 1000).toFixed(1) + 'K';
                                    return '₹' + value;
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            callbacks: {
                                label: function(context) {
                                    return `Balance: ${formatCurrency(context.parsed.y)}`;
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }
    }

    // Update yearly amortization table
    function updateYearlyTable(yearlyData) {
        if (!amortizationBody) return;

        amortizationBody.innerHTML = yearlyData.map(row => `
            <tr>
                <td>Year ${row.year}</td>
                <td class="principal-cell">${formatCurrency(row.principal)}</td>
                <td class="interest-cell">${formatCurrency(row.interest)}</td>
                <td>${formatCurrency(row.totalPayment)}</td>
                <td class="balance-cell">${formatCurrency(row.balance)}</td>
            </tr>
        `).join('');
    }

    // Populate year selector
    function populateYearSelector(years) {
        if (!yearSelect) return;

        yearSelect.innerHTML = '';
        for (let i = 1; i <= years; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Year ${i}`;
            yearSelect.appendChild(option);
        }
    }

    // Update monthly table for selected year
    function updateMonthlyTable(year) {
        if (!monthlyBody) return;

        const monthlyData = calculationData.monthlySchedule.filter(m => m.year === year);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        monthlyBody.innerHTML = monthlyData.map((row, index) => `
            <tr>
                <td>${monthNames[index % 12]}</td>
                <td>${formatCurrency(row.emi)}</td>
                <td class="principal-cell">${formatCurrency(row.principal)}</td>
                <td class="interest-cell">${formatCurrency(row.interest)}</td>
                <td class="balance-cell">${formatCurrency(row.balance)}</td>
            </tr>
        `).join('');
    }

    // Sync input with slider
    function syncInputWithSlider(input, slider, isAmount = false) {
        if (isAmount) {
            const value = parseNumber(input.value);
            slider.value = value;
            input.value = formatNumberInput(value);
        } else {
            slider.value = input.value;
        }
    }

    // Sync slider with input
    function syncSliderWithInput(slider, input, isAmount = false) {
        if (isAmount) {
            input.value = formatNumberInput(parseFloat(slider.value));
        } else {
            input.value = slider.value;
        }
    }

    // Event Listeners
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }

    // Loan amount input/slider sync
    if (loanAmountInput) {
        loanAmountInput.addEventListener('input', () => {
            syncInputWithSlider(loanAmountInput, loanAmountSlider, true);
            updateResults();
        });

        loanAmountInput.addEventListener('blur', () => {
            const value = parseNumber(loanAmountInput.value);
            loanAmountInput.value = formatNumberInput(value);
        });
    }

    if (loanAmountSlider) {
        loanAmountSlider.addEventListener('input', () => {
            syncSliderWithInput(loanAmountSlider, loanAmountInput, true);
            updateResults();
        });
    }

    // Interest rate input/slider sync
    if (interestRateInput) {
        interestRateInput.addEventListener('input', () => {
            syncInputWithSlider(interestRateInput, interestRateSlider);
            updateResults();
        });
    }

    if (interestRateSlider) {
        interestRateSlider.addEventListener('input', () => {
            syncSliderWithInput(interestRateSlider, interestRateInput);
            updateResults();
        });
    }

    // Loan tenure input/slider sync
    if (loanTenureInput) {
        loanTenureInput.addEventListener('input', () => {
            syncInputWithSlider(loanTenureInput, loanTenureSlider);
            updateResults();
        });
    }

    if (loanTenureSlider) {
        loanTenureSlider.addEventListener('input', () => {
            syncSliderWithInput(loanTenureSlider, loanTenureInput);
            updateResults();
        });
    }

    // Tenure unit toggle
    const tenureBtns = document.querySelectorAll('.tenure-btn');
    tenureBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const unit = btn.dataset.unit;

            tenureBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const currentValue = parseInt(loanTenureInput.value) || 0;

            if (unit === 'months' && tenureUnit === 'years') {
                // Convert years to months
                loanTenureInput.value = currentValue * 12;
                loanTenureSlider.min = 12;
                loanTenureSlider.max = 360;
                loanTenureSlider.value = currentValue * 12;
                document.querySelector('.input-suffix').textContent = 'Months';
                document.querySelector('.slider-labels span:first-child').textContent = '1 Year';
                document.querySelector('.slider-labels span:last-child').textContent = '30 Years';
            } else if (unit === 'years' && tenureUnit === 'months') {
                // Convert months to years
                loanTenureInput.value = Math.round(currentValue / 12);
                loanTenureSlider.min = 1;
                loanTenureSlider.max = 30;
                loanTenureSlider.value = Math.round(currentValue / 12);
                document.querySelector('.input-suffix').textContent = 'Years';
                document.querySelector('.slider-labels span:first-child').textContent = '1 Year';
                document.querySelector('.slider-labels span:last-child').textContent = '30 Years';
            }

            tenureUnit = unit;
            updateResults();
        });
    });

    // View toggle (Yearly/Monthly)
    const viewBtns = document.querySelectorAll('.view-btn');
    const yearlyTableContainer = document.querySelector('.table-container:not(.monthly-table-container)');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;

            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (view === 'yearly') {
                yearlyTableContainer.style.display = 'block';
                monthlyTableContainer.style.display = 'none';
            } else {
                yearlyTableContainer.style.display = 'none';
                monthlyTableContainer.style.display = 'block';
            }
        });
    });

    // Year selector change
    if (yearSelect) {
        yearSelect.addEventListener('change', () => {
            updateMonthlyTable(parseInt(yearSelect.value));
        });
    }

    // Calculate button
    if (calculateBtn) {
        calculateBtn.addEventListener('click', updateResults);
    }

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            loanAmountInput.value = '1,00,00,000';
            loanAmountSlider.value = 10000000;
            interestRateInput.value = '11';
            interestRateSlider.value = 11;
            loanTenureInput.value = '20';
            loanTenureSlider.value = 20;
            tenureUnit = 'years';

            tenureBtns.forEach(b => {
                b.classList.toggle('active', b.dataset.unit === 'years');
            });

            document.querySelector('.input-suffix').textContent = 'Years';

            updateResults();
        });
    }

    // Print button
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Initialize with formatted default value and calculate
    if (loanAmountInput) {
        loanAmountInput.value = formatNumberInput(10000000);
    }

    // Initial calculation
    updateResults();
})();
