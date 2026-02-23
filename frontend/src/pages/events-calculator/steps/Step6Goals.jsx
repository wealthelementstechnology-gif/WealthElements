import { useState, useEffect } from 'react';
import Button from '../../../components/common/Button';
import { Plus, Trash2, Target } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

const goalTypes = [
  'Retirement',
  'Child Education',
  'Child Marriage',
  'Buy Home',
  'Buy Vehicle',
  'Vacation/Travel',
  'Emergency Fund',
  'Business/Startup',
  'Other'
];

export function Step6Goals({ formData, updateFormData }) {
  const [goals, setGoals] = useState(formData.goals || []);

  useEffect(() => {
    if (goals.length === 0) {
      addGoal();
    }
  }, []);

  useEffect(() => {
    updateFormData({ goals });
  }, [goals]);

  const addGoal = () => {
    setGoals([...goals, {
      id: Date.now(),
      type: '',
      description: '',
      targetAmount: '',
      yearsToGoal: '',
      currentSavings: '',
      priority: 'medium'
    }]);
  };

  const removeGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const updateGoal = (id, field, value) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const calculateRequiredMonthlySavings = (goal) => {
    const targetAmount = parseFloat(goal.targetAmount) || 0;
    const currentSavings = parseFloat(goal.currentSavings) || 0;
    const years = parseFloat(goal.yearsToGoal) || 1;
    const remaining = targetAmount - currentSavings;
    const months = years * 12;
    return months > 0 ? remaining / months : 0;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-900">
          Define your financial goals to create a roadmap for your future. Be specific about what you want to achieve.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addGoal}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const requiredMonthlySavings = calculateRequiredMonthlySavings(goal);

          return (
            <div key={goal.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
                  <select
                    value={goal.type}
                    onChange={(e) => updateGoal(goal.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select goal type</option>
                    {goalTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={goal.priority}
                    onChange={(e) => updateGoal(goal.id, 'priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={goal.description}
                  onChange={(e) => updateGoal(goal.id, 'description', e.target.value)}
                  placeholder="e.g., Son's college education at IIT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">₹</span>
                    <input
                      type="number"
                      value={goal.targetAmount}
                      onChange={(e) => updateGoal(goal.id, 'targetAmount', e.target.value)}
                      placeholder="0"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years to Goal</label>
                  <input
                    type="number"
                    value={goal.yearsToGoal}
                    onChange={(e) => updateGoal(goal.id, 'yearsToGoal', e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Savings</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">₹</span>
                    <input
                      type="number"
                      value={goal.currentSavings}
                      onChange={(e) => updateGoal(goal.id, 'currentSavings', e.target.value)}
                      placeholder="0"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {goal.targetAmount && goal.yearsToGoal && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm text-emerald-900">
                    <span className="font-semibold">Required Monthly Savings:</span>{' '}
                    {formatCurrency(requiredMonthlySavings)}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => removeGoal(goal.id)}
                className="text-red-600 text-sm hover:text-red-700 flex items-center gap-1"
                disabled={goals.length === 1}
              >
                <Trash2 className="w-3 h-3" /> Remove Goal
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
