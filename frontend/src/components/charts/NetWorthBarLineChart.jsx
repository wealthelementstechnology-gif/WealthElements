import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { formatMonthYear, formatChartCurrency } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/constants';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const NetWorthBarLineChart = ({ trendData = [], height = 200 }) => {
  const chartData = useMemo(() => {
    // Take last 3-6 months of data
    const displayData = trendData.slice(-6);

    const labels = displayData.map((d) => formatMonthYear(d.month));
    const netWorthValues = displayData.map((d) => d.netWorth);

    // Colour each bar: negative = red, positive = green; current month is darker shade
    const isNegative = (v) => v < 0;
    const barColors = displayData.map((d, index) => {
      const neg = isNegative(d.netWorth);
      if (index === displayData.length - 1) {
        return neg ? '#EF4444' : CHART_COLORS.barCurrent; // red-500 or emerald
      }
      return neg ? '#FECACA' : CHART_COLORS.barPrevious;  // red-200 or gray-300
    });

    // Line/point colour: red if the latest value is negative
    const latestNegative = isNegative(netWorthValues[netWorthValues.length - 1]);
    const lineColor = latestNegative ? '#EF4444' : CHART_COLORS.netWorth;

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Net Worth',
          data: netWorthValues,
          backgroundColor: barColors,
          borderRadius: 6,
          barThickness: 32,
          order: 2,
        },
        {
          type: 'line',
          label: 'Trend',
          data: netWorthValues,
          borderColor: lineColor,
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: lineColor,
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          order: 1,
        },
      ],
    };
  }, [trendData]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
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
          displayColors: false,
          callbacks: {
            label: (context) => {
              return `₹${(context.raw / 100000).toFixed(1)}L`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: '#6B7280',
            font: {
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: '#F3F4F6',
          },
          border: {
            display: false,
          },
          ticks: {
            color: '#6B7280',
            font: {
              size: 11,
            },
            callback: (value) => formatChartCurrency(value),
          },
        },
      },
    }),
    []
  );

  if (!trendData || trendData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400"
        style={{ height }}
      >
        No trend data available
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
};

export default NetWorthBarLineChart;
