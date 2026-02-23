import { useState, useEffect } from 'react';
import Button from '../../../components/common/Button';
import { Plus, Trash2, Home, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

export function Step5Assets({ formData, updateFormData }) {
  const [assets, setAssets] = useState(formData.assets || []);
  const [liabilities, setLiabilities] = useState(formData.liabilities || []);

  useEffect(() => {
    if (assets.length === 0) addAsset();
    if (liabilities.length === 0) addLiability();
  }, []);

  useEffect(() => {
    updateFormData({ assets, liabilities });
  }, [assets, liabilities]);

  const addAsset = () => {
    setAssets([...assets, {
      id: Date.now(),
      name: '',
      type: '',
      value: ''
    }]);
  };

  const removeAsset = (id) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const updateAsset = (id, field, value) => {
    setAssets(assets.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addLiability = () => {
    setLiabilities([...liabilities, {
      id: Date.now(),
      name: '',
      type: '',
      outstandingAmount: '',
      emi: ''
    }]);
  };

  const removeLiability = (id) => {
    setLiabilities(liabilities.filter(l => l.id !== id));
  };

  const updateLiability = (id, field, value) => {
    setLiabilities(liabilities.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const calculateTotals = () => {
    const totalAssets = assets.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + (parseFloat(l.outstandingAmount) || 0), 0);
    return { totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Assets Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-900">Assets</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAsset}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </Button>
        </div>

        <div className="space-y-3">
          {assets.map((asset) => (
            <div key={asset.id} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={asset.name}
                  onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                  placeholder="Asset name"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={asset.type}
                  onChange={(e) => updateAsset(asset.id, 'type', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select type</option>
                  <option value="Property">Property</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Gold">Gold/Jewelry</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">₹</span>
                  <input
                    type="number"
                    value={asset.value}
                    onChange={(e) => updateAsset(asset.id, 'value', e.target.value)}
                    placeholder="Current value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    min="0"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeAsset(asset.id)}
                className="text-red-600 text-sm hover:text-red-700 flex items-center gap-1"
                disabled={assets.length === 1}
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Liabilities Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Liabilities</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLiability}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Liability
          </Button>
        </div>

        <div className="space-y-3">
          {liabilities.map((liability) => (
            <div key={liability.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={liability.name}
                  onChange={(e) => updateLiability(liability.id, 'name', e.target.value)}
                  placeholder="Loan/Debt name"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <select
                  value={liability.type}
                  onChange={(e) => updateLiability(liability.id, 'type', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select type</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Car Loan">Car Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Credit Card">Credit Card Debt</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Outstanding Amount</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">₹</span>
                    <input
                      type="number"
                      value={liability.outstandingAmount}
                      onChange={(e) => updateLiability(liability.id, 'outstandingAmount', e.target.value)}
                      placeholder="0"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Monthly EMI</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">₹</span>
                    <input
                      type="number"
                      value={liability.emi}
                      onChange={(e) => updateLiability(liability.id, 'emi', e.target.value)}
                      placeholder="0"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeLiability(liability.id)}
                className="text-red-600 text-sm hover:text-red-700 flex items-center gap-1"
                disabled={liabilities.length === 1}
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Net Worth Summary */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Net Worth Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-emerald-100 text-sm mb-1">Total Assets</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.totalAssets)}</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm mb-1">Total Liabilities</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.totalLiabilities)}</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm mb-1">Net Worth</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.netWorth)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
