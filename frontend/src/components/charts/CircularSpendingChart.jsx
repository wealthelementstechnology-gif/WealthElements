import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/constants';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const CircularSpendingChart = ({
  categories = [],
  totalSpent = 0,
  size = 220,
}) => {
  const chartData = useMemo(() => {
    // Sort by amount (highest first) and take top 5
    const sortedCategories = [...categories]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      labels: sortedCategories.map((c) => c.category),
      datasets: [
        {
          data: sortedCategories.map((c) => c.amount),
          backgroundColor: CHART_COLORS.spending.slice(0, sortedCategories.length),
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  }, [categories]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      cutout: '75%',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#1F2937',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context) => {
              const value = context.raw;
              const percentage = ((value / totalSpent) * 100).toFixed(1);
              return `${formatCurrency(value)} (${percentage}%)`;
            },
          },
        },
      },
    }),
    [totalSpent]
  );

  if (!categories || categories.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400"
        style={{ width: size, height: size }}
      >
        No spending data
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Doughnut data={chartData} options={options} />

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs text-gray-500">Spent this month</span>
        <span className="text-xl font-bold text-gray-900 mt-1">
          {formatCurrency(totalSpent)}
        </span>
      </div>
    </div>
  );
};

export default CircularSpendingChart;
