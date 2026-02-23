import { useState, useEffect } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

export function Step1BasicDetails({ formData, updateFormData }) {
  const [familyMode, setFamilyMode] = useState(formData.familyMode || 'individual');
  const [incomes, setIncomes] = useState(formData.incomes || []);

  const incomeSourceOptions = [
    'Salary',
    'Business Income',
    'Rental Income',
    'Freelance/Consulting',
    'Interest Income',
    'Dividend Income',
    'Other'
  ];

  useEffect(() => {
    // Initialize with one income row if empty
    if (incomes.length === 0) {
      addIncomeRow();
    }
  }, []);

  useEffect(() => {
    // Update parent form data whenever local state changes
    updateFormData({
      familyMode,
      incomes,
      fullName: formData.fullName,
      age: formData.age,
      city: formData.city,
      retirementAge: formData.retirementAge,
      maritalStatus: formData.maritalStatus,
      husbandName: formData.husbandName,
      wifeName: formData.wifeName,
      husbandAge: formData.husbandAge,
      wifeAge: formData.wifeAge,
      cityCouple: formData.cityCouple,
      husbandRetirementAge: formData.husbandRetirementAge,
      wifeRetirementAge: formData.wifeRetirementAge
    });
  }, [familyMode, incomes]);

  const handleFamilyModeChange = (mode) => {
    setFamilyMode(mode);
    // Reset incomes when switching modes
    setIncomes([]);
    setTimeout(() => addIncomeRow(), 100);
  };

  const addIncomeRow = () => {
    const newIncome = {
      id: Date.now(),
      source: '',
      sourceOther: '',
      owner: familyMode === 'couple' ? '' : 'self',
      amount: ''
    };
    setIncomes([...incomes, newIncome]);
  };

  const removeIncomeRow = (id) => {
    setIncomes(incomes.filter(income => income.id !== id));
  };

  const updateIncome = (id, field, value) => {
    setIncomes(incomes.map(income =>
      income.id === id ? { ...income, [field]: value } : income
    ));
  };

  const calculateTotalIncome = () => {
    return incomes.reduce((total, income) => {
      const amount = parseFloat(income.amount) || 0;
      return total + amount;
    }, 0);
  };

  const handleBasicFieldChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Family Mode Toggle */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-3">Planning for:</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleFamilyModeChange('individual')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              familyMode === 'individual'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-600'
            }`}
          >
            Individual
          </button>
          <button
            type="button"
            onClick={() => handleFamilyModeChange('couple')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              familyMode === 'couple'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-600'
            }`}
          >
            Couple
          </button>
        </div>
      </div>

      {/* Basic Details Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Basic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {familyMode === 'individual' ? (
            <>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName || ''}
                onChange={(e) => handleBasicFieldChange('fullName', e.target.value)}
                required
              />
              <Input
                label="Age"
                type="number"
                placeholder="e.g., 30"
                value={formData.age || ''}
                onChange={(e) => handleBasicFieldChange('age', e.target.value)}
                required
              />
              <Input
                label="City"
                placeholder="e.g., Mumbai"
                value={formData.city || ''}
                onChange={(e) => handleBasicFieldChange('city', e.target.value)}
                required
              />
              <Input
                label="Retirement Age"
                type="number"
                placeholder="e.g., 60"
                value={formData.retirementAge || ''}
                onChange={(e) => handleBasicFieldChange('retirementAge', e.target.value)}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                <select
                  value={formData.maritalStatus || ''}
                  onChange={(e) => handleBasicFieldChange('maritalStatus', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select status</option>
                  <option value="Unmarried">Unmarried</option>
                  <option value="Married">Married</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <Input
                label="Husband's Name"
                placeholder="Enter husband's name"
                value={formData.husbandName || ''}
                onChange={(e) => handleBasicFieldChange('husbandName', e.target.value)}
              />
              <Input
                label="Wife's Name"
                placeholder="Enter wife's name"
                value={formData.wifeName || ''}
                onChange={(e) => handleBasicFieldChange('wifeName', e.target.value)}
              />
              <Input
                label="Husband's Age"
                type="number"
                placeholder="e.g., 32"
                value={formData.husbandAge || ''}
                onChange={(e) => handleBasicFieldChange('husbandAge', e.target.value)}
              />
              <Input
                label="Wife's Age"
                type="number"
                placeholder="e.g., 28"
                value={formData.wifeAge || ''}
                onChange={(e) => handleBasicFieldChange('wifeAge', e.target.value)}
              />
              <Input
                label="City"
                placeholder="e.g., Mumbai"
                value={formData.cityCouple || ''}
                onChange={(e) => handleBasicFieldChange('cityCouple', e.target.value)}
              />
              <Input
                label="Husband's Retirement Age"
                type="number"
                placeholder="e.g., 60"
                value={formData.husbandRetirementAge || ''}
                onChange={(e) => handleBasicFieldChange('husbandRetirementAge', e.target.value)}
              />
              <Input
                label="Wife's Retirement Age"
                type="number"
                placeholder="e.g., 58"
                value={formData.wifeRetirementAge || ''}
                onChange={(e) => handleBasicFieldChange('wifeRetirementAge', e.target.value)}
              />
            </>
          )}
        </div>
      </div>

      {/* Income Sources Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sources of Income</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addIncomeRow}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Income
          </Button>
        </div>

        {/* Income Table - Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Source of Income</th>
                {familyMode === 'couple' && (
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Whose Income</th>
                )}
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Amount (Per Month)</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((income) => (
                <tr key={income.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <select
                      value={income.source}
                      onChange={(e) => updateIncome(income.id, 'source', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select source</option>
                      {incomeSourceOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {income.source === 'Other' && (
                      <input
                        type="text"
                        value={income.sourceOther}
                        onChange={(e) => updateIncome(income.id, 'sourceOther', e.target.value)}
                        placeholder="Specify income source"
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    )}
                  </td>
                  {familyMode === 'couple' && (
                    <td className="py-3 px-4">
                      <select
                        value={income.owner}
                        onChange={(e) => updateIncome(income.id, 'owner', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Select</option>
                        <option value="husband">Husband</option>
                        <option value="wife">Wife</option>
                      </select>
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">₹</span>
                      <input
                        type="number"
                        value={income.amount}
                        onChange={(e) => updateIncome(income.id, 'amount', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => removeIncomeRow(income.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      disabled={incomes.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Income Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {incomes.map((income) => (
            <div key={income.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={income.source}
                  onChange={(e) => updateIncome(income.id, 'source', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select source</option>
                  {incomeSourceOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {income.source === 'Other' && (
                  <input
                    type="text"
                    value={income.sourceOther}
                    onChange={(e) => updateIncome(income.id, 'sourceOther', e.target.value)}
                    placeholder="Specify income source"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                )}
              </div>

              {familyMode === 'couple' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Whose Income</label>
                  <select
                    value={income.owner}
                    onChange={(e) => updateIncome(income.id, 'owner', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select</option>
                    <option value="husband">Husband</option>
                    <option value="wife">Wife</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Per Month)</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">₹</span>
                  <input
                    type="number"
                    value={income.amount}
                    onChange={(e) => updateIncome(income.id, 'amount', e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeIncomeRow(income.id)}
                className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors font-medium"
                disabled={incomes.length === 1}
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Total Income Display */}
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-900">Total Monthly Income:</span>
            <span className="text-xl font-bold text-emerald-600">
              {formatCurrency(calculateTotalIncome())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
