import { useState, useEffect } from 'react';
import Button from '../../../components/common/Button';
import { Plus, Trash2, Shield } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

const insuranceTypes = [
  'Life Insurance',
  'Health Insurance',
  'Term Insurance',
  'Accidental Insurance',
  'Vehicle Insurance',
  'Home Insurance',
  'Other'
];

export function Step3Insurance({ formData, updateFormData }) {
  const [insurances, setInsurances] = useState(formData.insurances || []);

  useEffect(() => {
    if (insurances.length === 0) {
      addInsurance();
    }
  }, []);

  useEffect(() => {
    updateFormData({ insurances });
  }, [insurances]);

  const addInsurance = () => {
    setInsurances([...insurances, {
      id: Date.now(),
      type: '',
      provider: '',
      coverAmount: '',
      premium: '',
      premiumFrequency: 'annual'
    }]);
  };

  const removeInsurance = (id) => {
    setInsurances(insurances.filter(ins => ins.id !== id));
  };

  const updateInsurance = (id, field, value) => {
    setInsurances(insurances.map(ins =>
      ins.id === id ? { ...ins, [field]: value } : ins
    ));
  };

  const calculateTotalPremium = () => {
    return insurances.reduce((total, ins) => {
      const premium = parseFloat(ins.premium) || 0;
      const annualPremium = ins.premiumFrequency === 'monthly' ? premium * 12 : premium;
      return total + annualPremium;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-900">
          Add your insurance policies to ensure adequate protection for you and your family.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Insurance Policies</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addInsurance}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Policy
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Insurance Type</th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Provider</th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Cover Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Premium</th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Frequency</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {insurances.map((ins) => (
              <tr key={ins.id} className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <select
                    value={ins.type}
                    onChange={(e) => updateInsurance(ins.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select type</option>
                    {insuranceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={ins.provider}
                    onChange={(e) => updateInsurance(ins.id, 'provider', e.target.value)}
                    placeholder="e.g., HDFC Life"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">₹</span>
                    <input
                      type="number"
                      value={ins.coverAmount}
                      onChange={(e) => updateInsurance(ins.id, 'coverAmount', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      min="0"
                    />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">₹</span>
                    <input
                      type="number"
                      value={ins.premium}
                      onChange={(e) => updateInsurance(ins.id, 'premium', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      min="0"
                    />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={ins.premiumFrequency}
                    onChange={(e) => updateInsurance(ins.id, 'premiumFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => removeInsurance(ins.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                    disabled={insurances.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {insurances.map((ins) => (
          <div key={ins.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Type</label>
              <select
                value={ins.type}
                onChange={(e) => updateInsurance(ins.id, 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select type</option>
                {insuranceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <input
                type="text"
                value={ins.provider}
                onChange={(e) => updateInsurance(ins.id, 'provider', e.target.value)}
                placeholder="e.g., HDFC Life"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Amount</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">₹</span>
                <input
                  type="number"
                  value={ins.coverAmount}
                  onChange={(e) => updateInsurance(ins.id, 'coverAmount', e.target.value)}
                  placeholder="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Premium</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">₹</span>
                  <input
                    type="number"
                    value={ins.premium}
                    onChange={(e) => updateInsurance(ins.id, 'premium', e.target.value)}
                    placeholder="0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={ins.premiumFrequency}
                  onChange={(e) => updateInsurance(ins.id, 'premiumFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeInsurance(ins.id)}
              className="w-full flex items-center justify-center gap-2 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50"
              disabled={insurances.length === 1}
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Total Premium */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-emerald-900">Total Annual Premium:</span>
          <span className="text-xl font-bold text-emerald-600">
            {formatCurrency(calculateTotalPremium())}
          </span>
        </div>
      </div>
    </div>
  );
}
