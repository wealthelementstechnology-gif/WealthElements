import { useState, useEffect } from 'react';
import Button from '../../../components/common/Button';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

const investmentTypes = [
  'Mutual Funds (Equity)',
  'Mutual Funds (Debt)',
  'Stocks',
  'Fixed Deposits',
  'PPF',
  'EPF',
  'NPS',
  'Bonds',
  'Gold',
  'Real Estate',
  'Other'
];

export function Step4Investments({ formData, updateFormData }) {
  const [investments, setInvestments] = useState(formData.investments || []);

  useEffect(() => {
    if (investments.length === 0) {
      addInvestment();
    }
  }, []);

  useEffect(() => {
    updateFormData({ investments });
  }, [investments]);

  const addInvestment = () => {
    setInvestments([...investments, {
      id: Date.now(),
      type: '',
      name: '',
      currentValue: '',
      monthlySIP: '',
      expectedReturn: ''
    }]);
  };

  const removeInvestment = (id) => {
    setInvestments(investments.filter(inv => inv.id !== id));
  };

  const updateInvestment = (id, field, value) => {
    setInvestments(investments.map(inv =>
      inv.id === id ? { ...inv, [field]: value } : inv
    ));
  };

  const calculateTotals = () => {
    return investments.reduce((acc, inv) => {
      acc.totalValue += parseFloat(inv.currentValue) || 0;
      acc.totalSIP += parseFloat(inv.monthlySIP) || 0;
      return acc;
    }, { totalValue: 0, totalSIP: 0 });
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-900">
          Add your current investments and ongoing SIPs to track your portfolio growth.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Investment Portfolio</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addInvestment}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Investment
        </Button>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3">
        {investments.map((inv) => (
          <div key={inv.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investment Type</label>
              <select
                value={inv.type}
                onChange={(e) => updateInvestment(inv.id, 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select type</option>
                {investmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investment Name</label>
              <input
                type="text"
                value={inv.name}
                onChange={(e) => updateInvestment(inv.id, 'name', e.target.value)}
                placeholder="e.g., Axis Bluechip Fund"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">₹</span>
                <input
                  type="number"
                  value={inv.currentValue}
                  onChange={(e) => updateInvestment(inv.id, 'currentValue', e.target.value)}
                  placeholder="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly SIP</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">₹</span>
                  <input
                    type="number"
                    value={inv.monthlySIP}
                    onChange={(e) => updateInvestment(inv.id, 'monthlySIP', e.target.value)}
                    placeholder="0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return %</label>
                <input
                  type="number"
                  value={inv.expectedReturn}
                  onChange={(e) => updateInvestment(inv.id, 'expectedReturn', e.target.value)}
                  placeholder="12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeInvestment(inv.id)}
              className="w-full flex items-center justify-center gap-2 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50"
              disabled={investments.length === 1}
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-900">Total Portfolio Value:</span>
            <span className="text-xl font-bold text-emerald-600">
              {formatCurrency(totals.totalValue)}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-900">Total Monthly SIP:</span>
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(totals.totalSIP)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
