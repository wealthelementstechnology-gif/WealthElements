import { CheckCircle, TrendingUp, TrendingDown, AlertCircle, Download } from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '../../../utils/formatters';
import Button from '../../../components/common/Button';

export function Step8Summary({ formData }) {
  // Calculate summary data
  const totalIncome = (formData.incomes || []).reduce((sum, inc) => sum + (parseFloat(inc.amount) || 0), 0);

  const expenseTotals = (formData.expenses || []).reduce((acc, exp) => {
    const monthly = parseFloat(exp.monthly) || 0;
    acc.currentMonthly += monthly;
    if (exp.continuesInRetirement) acc.retirementMonthly += monthly;
    return acc;
  }, { currentMonthly: 0, retirementMonthly: 0 });

  const totalInsurancePremium = (formData.insurances || []).reduce((sum, ins) => {
    const premium = parseFloat(ins.premium) || 0;
    return sum + (ins.premiumFrequency === 'monthly' ? premium * 12 : premium);
  }, 0);

  const investmentTotals = (formData.investments || []).reduce((acc, inv) => {
    acc.totalValue += parseFloat(inv.currentValue) || 0;
    acc.totalSIP += parseFloat(inv.monthlySIP) || 0;
    return acc;
  }, { totalValue: 0, totalSIP: 0 });

  const assetTotals = {
    totalAssets: (formData.assets || []).reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0),
    totalLiabilities: (formData.liabilities || []).reduce((sum, l) => sum + (parseFloat(l.outstandingAmount) || 0), 0)
  };
  assetTotals.netWorth = assetTotals.totalAssets - assetTotals.totalLiabilities;

  const totalGoalsAmount = (formData.goals || []).reduce((sum, g) => sum + (parseFloat(g.targetAmount) || 0), 0);
  const totalLifeEventsCost = (formData.lifeEvents || []).reduce((sum, e) => sum + (parseFloat(e.estimatedCost) || 0), 0);

  const monthlySavings = totalIncome - expenseTotals.currentMonthly;
  const savingsRate = totalIncome > 0 ? (monthlySavings / totalIncome) * 100 : 0;

  // Financial Health Score (simplified)
  const calculateHealthScore = () => {
    let score = 0;

    // Savings Rate (0-25 points)
    if (savingsRate >= 30) score += 25;
    else if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 15;
    else if (savingsRate > 0) score += 10;

    // Net Worth (0-25 points)
    if (assetTotals.netWorth > 0) score += 25;
    else if (assetTotals.netWorth > -500000) score += 15;

    // Insurance Coverage (0-20 points)
    if ((formData.insurances || []).length >= 3) score += 20;
    else if ((formData.insurances || []).length >= 2) score += 15;
    else if ((formData.insurances || []).length >= 1) score += 10;

    // Investment Portfolio (0-15 points)
    if (investmentTotals.totalValue >= 500000) score += 15;
    else if (investmentTotals.totalValue >= 100000) score += 10;
    else if (investmentTotals.totalValue > 0) score += 5;

    // Goal Planning (0-15 points)
    if ((formData.goals || []).length >= 3) score += 15;
    else if ((formData.goals || []).length >= 2) score += 10;
    else if ((formData.goals || []).length >= 1) score += 5;

    return Math.min(score, 100);
  };

  const healthScore = calculateHealthScore();

  const getScoreStatus = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'emerald', icon: CheckCircle };
    if (score >= 60) return { label: 'Good', color: 'blue', icon: TrendingUp };
    if (score >= 40) return { label: 'Fair', color: 'yellow', icon: AlertCircle };
    return { label: 'Needs Improvement', color: 'red', icon: TrendingDown };
  };

  const scoreStatus = getScoreStatus(healthScore);
  const StatusIcon = scoreStatus.icon;

  const handleDownload = () => {
    // Create a simple text summary for download
    const summary = `
FINANCIAL SNAPSHOT - 8 EVENTS CALCULATOR
Generated: ${new Date().toLocaleDateString()}

=== BASIC DETAILS ===
Name: ${formData.familyMode === 'couple'
  ? `${formData.husbandName || 'N/A'} & ${formData.wifeName || 'N/A'}`
  : formData.fullName || 'N/A'}
City: ${formData.city || formData.cityCouple || 'N/A'}

=== INCOME & EXPENSES ===
Total Monthly Income: ${formatCurrency(totalIncome)}
Total Monthly Expenses: ${formatCurrency(expenseTotals.currentMonthly)}
Monthly Savings: ${formatCurrency(monthlySavings)}
Savings Rate: ${savingsRate.toFixed(1)}%

=== NET WORTH ===
Total Assets: ${formatCurrency(assetTotals.totalAssets)}
Total Liabilities: ${formatCurrency(assetTotals.totalLiabilities)}
Net Worth: ${formatCurrency(assetTotals.netWorth)}

=== INVESTMENTS ===
Portfolio Value: ${formatCurrency(investmentTotals.totalValue)}
Monthly SIP: ${formatCurrency(investmentTotals.totalSIP)}

=== PROTECTION ===
Insurance Policies: ${(formData.insurances || []).length}
Annual Premium: ${formatCurrency(totalInsurancePremium)}

=== GOALS & EVENTS ===
Financial Goals: ${(formData.goals || []).length}
Total Goal Amount: ${formatCurrency(totalGoalsAmount)}
Life Events Planned: ${(formData.lifeEvents || []).length}
Total Event Cost: ${formatCurrency(totalLifeEventsCost)}

=== FINANCIAL HEALTH SCORE ===
Score: ${healthScore}/100 - ${scoreStatus.label}
`;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-snapshot-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Score */}
      <div className={`bg-gradient-to-r from-${scoreStatus.color}-600 to-${scoreStatus.color}-700 rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Financial Health Score</h2>
          <StatusIcon className="w-10 h-10" />
        </div>
        <div className="flex items-end gap-4">
          <div className="text-6xl font-bold">{healthScore}</div>
          <div className="text-2xl mb-2">/100</div>
        </div>
        <p className="text-xl mt-2 opacity-90">{scoreStatus.label}</p>
      </div>

      {/* Income & Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-emerald-900 mb-3">Income & Savings</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-emerald-800">Monthly Income:</span>
              <span className="font-bold text-emerald-900">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-emerald-800">Monthly Expenses:</span>
              <span className="font-bold text-emerald-900">{formatCurrency(expenseTotals.currentMonthly)}</span>
            </div>
            <div className="border-t border-emerald-300 pt-2 flex justify-between">
              <span className="text-sm font-semibold text-emerald-900">Monthly Savings:</span>
              <span className="font-bold text-emerald-600">{formatCurrency(monthlySavings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-emerald-800">Savings Rate:</span>
              <span className="font-bold text-emerald-900">{savingsRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Net Worth</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-blue-800">Total Assets:</span>
              <span className="font-bold text-blue-900">{formatCompactCurrency(assetTotals.totalAssets)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-800">Total Liabilities:</span>
              <span className="font-bold text-blue-900">{formatCompactCurrency(assetTotals.totalLiabilities)}</span>
            </div>
            <div className="border-t border-blue-300 pt-2 flex justify-between">
              <span className="text-sm font-semibold text-blue-900">Net Worth:</span>
              <span className={`font-bold ${assetTotals.netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCompactCurrency(assetTotals.netWorth)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Investments & Protection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-purple-900 mb-3">Investment Portfolio</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-purple-800">Portfolio Value:</span>
              <span className="font-bold text-purple-900">{formatCompactCurrency(investmentTotals.totalValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-purple-800">Monthly SIP:</span>
              <span className="font-bold text-purple-900">{formatCurrency(investmentTotals.totalSIP)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-purple-800">Active Investments:</span>
              <span className="font-bold text-purple-900">{(formData.investments || []).length}</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-orange-900 mb-3">Insurance Coverage</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-orange-800">Active Policies:</span>
              <span className="font-bold text-orange-900">{(formData.insurances || []).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-orange-800">Annual Premium:</span>
              <span className="font-bold text-orange-900">{formatCurrency(totalInsurancePremium)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals & Life Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-teal-900 mb-3">Financial Goals</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-teal-800">Total Goals:</span>
              <span className="font-bold text-teal-900">{(formData.goals || []).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-teal-800">Target Amount:</span>
              <span className="font-bold text-teal-900">{formatCompactCurrency(totalGoalsAmount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-pink-50 border border-pink-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-pink-900 mb-3">Life Events</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-pink-800">Events Planned:</span>
              <span className="font-bold text-pink-900">{(formData.lifeEvents || []).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-pink-800">Estimated Cost:</span>
              <span className="font-bold text-pink-900">{formatCompactCurrency(totalLifeEventsCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="space-y-3">
          {savingsRate >= 20 && (
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-900">
                Great job! Your savings rate of {savingsRate.toFixed(1)}% is healthy. Keep it up!
              </p>
            </div>
          )}
          {savingsRate < 10 && savingsRate >= 0 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-900">
                Your savings rate is {savingsRate.toFixed(1)}%. Consider reviewing expenses to increase savings.
              </p>
            </div>
          )}
          {assetTotals.netWorth > 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                Positive net worth of {formatCompactCurrency(assetTotals.netWorth)}. You're building wealth!
              </p>
            </div>
          )}
          {(formData.insurances || []).length < 2 && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-900">
                Consider adding more insurance coverage for better financial protection.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleDownload}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Financial Snapshot
        </Button>
      </div>
    </div>
  );
}
