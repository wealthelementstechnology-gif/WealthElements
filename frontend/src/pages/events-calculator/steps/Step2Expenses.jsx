import { useState, useEffect } from 'react';
import { formatCurrency } from '../../../utils/formatters';

const expenseCategories = [
  {
    name: 'Household Expenses',
    items: [
      'Grocery & Toiletries',
      'House Rent, Maintenance, Repair',
      'Vehicle - Fuel, Servicing',
      'Doctor Visits, Medicines',
      'Utilities (Electricity, Property tax)',
      'Maid, Laundry, Newspaper',
      'Gadgets - Mobile/TV devices',
      'Gadgets - Internet/Mobile plans'
    ]
  },
  {
    name: 'Lifestyle Expenses',
    items: [
      'Clothes & Accessories',
      'Shopping, Gifts',
      'Dining, Movies, Sports',
      'Coach - Financial, Fitness',
      'Travel, Annual holidays',
      'Charity, Donations',
      'House renovations, Celebrations'
    ]
  },
  {
    name: 'Dependent Expenses',
    items: [
      'Children school / college fees',
      'Children pocket money',
      'Contribution to parents, siblings'
    ]
  },
  {
    name: 'Miscellaneous',
    items: ['Personal Expenses']
  }
];

export function Step2Expenses({ formData, updateFormData }) {
  const [expenses, setExpenses] = useState(() => {
    if (formData.expenses && formData.expenses.length > 0) {
      return formData.expenses;
    }

    // Initialize with all expense items
    const initialExpenses = [];
    expenseCategories.forEach(category => {
      category.items.forEach(item => {
        initialExpenses.push({
          item,
          category: category.name,
          monthly: '',
          annual: '',
          continuesInRetirement: true
        });
      });
    });
    return initialExpenses;
  });

  useEffect(() => {
    updateFormData({ expenses });
  }, [expenses]);

  const updateExpense = (item, field, value) => {
    setExpenses(expenses.map(expense => {
      if (expense.item === item) {
        const updated = { ...expense, [field]: value };

        // Auto-calculate annual from monthly
        if (field === 'monthly') {
          const monthlyValue = parseFloat(value) || 0;
          updated.annual = (monthlyValue * 12).toFixed(2);
        }

        return updated;
      }
      return expense;
    }));
  };

  const calculateTotals = () => {
    return expenses.reduce((acc, expense) => {
      const monthly = parseFloat(expense.monthly) || 0;
      const annual = parseFloat(expense.annual) || 0;

      acc.currentMonthly += monthly;
      acc.currentAnnual += annual;

      if (expense.continuesInRetirement) {
        acc.retirementMonthly += monthly;
        acc.retirementAnnual += annual;
      }

      return acc;
    }, {
      currentMonthly: 0,
      currentAnnual: 0,
      retirementMonthly: 0,
      retirementAnnual: 0
    });
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          List your monthly household and lifestyle expenses. Check the box if the expense will continue during retirement.
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Expense Item</th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Monthly Cost</th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Annual Cost</th>
              <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700 w-40">
                Continues in Retirement?
              </th>
            </tr>
          </thead>
          <tbody>
            {expenseCategories.map((category, catIndex) => (
              <tbody key={catIndex}>
                <tr className="bg-emerald-50 border-t border-b border-emerald-200">
                  <td colSpan="4" className="py-2 px-4 font-semibold text-sm text-emerald-900">
                    {category.name}
                  </td>
                </tr>
                {category.items.map((item) => {
                  const expense = expenses.find(e => e.item === item);
                  return (
                    <tr key={item} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{item}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 max-w-xs">
                          <span className="text-gray-600">₹</span>
                          <input
                            type="number"
                            value={expense?.monthly || ''}
                            onChange={(e) => updateExpense(item, 'monthly', e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 max-w-xs">
                          <span className="text-gray-600">₹</span>
                          <input
                            type="number"
                            value={expense?.annual || ''}
                            readOnly
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={expense?.continuesInRetirement ?? true}
                          onChange={(e) => updateExpense(item, 'continuesInRetirement', e.target.checked)}
                          className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {expenseCategories.map((category, catIndex) => (
          <div key={catIndex} className="space-y-3">
            <h3 className="font-semibold text-emerald-900 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
              {category.name}
            </h3>
            {category.items.map((item) => {
              const expense = expenses.find(e => e.item === item);
              return (
                <div key={item} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-gray-900 text-sm">{item}</h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Cost</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">₹</span>
                      <input
                        type="number"
                        value={expense?.monthly || ''}
                        onChange={(e) => updateExpense(item, 'monthly', e.target.value)}
                        placeholder="0.00"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Annual Cost</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">₹</span>
                      <input
                        type="number"
                        value={expense?.annual || ''}
                        readOnly
                        placeholder="0.00"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id={`mobile-${item}`}
                      checked={expense?.continuesInRetirement ?? true}
                      onChange={(e) => updateExpense(item, 'continuesInRetirement', e.target.checked)}
                      className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor={`mobile-${item}`} className="text-sm text-gray-700 cursor-pointer">
                      Continues in Retirement
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Totals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">Current Expenses</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-800">Monthly:</span>
              <span className="font-bold text-blue-900">{formatCurrency(totals.currentMonthly)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-800">Annual:</span>
              <span className="font-bold text-blue-900">{formatCurrency(totals.currentAnnual)}</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-emerald-900 mb-3">Post-Retirement Expenses</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-emerald-800">Monthly:</span>
              <span className="font-bold text-emerald-900">{formatCurrency(totals.retirementMonthly)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-emerald-800">Annual:</span>
              <span className="font-bold text-emerald-900">{formatCurrency(totals.retirementAnnual)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
