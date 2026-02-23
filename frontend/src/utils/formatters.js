import { format, formatDistance, isValid, parseISO } from 'date-fns';

// Format as Indian currency: 1245000 → ₹12,45,000 / -800000 → -₹8,00,000
export const formatCurrency = (amount) => {
  const sign = amount < 0 ? '-' : '';
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  return `${sign}${formatted}`;
};

// Format compact: 1245000 → ₹12.5L, 15600 → ₹15.6K
export const formatCompactCurrency = (amount) => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 10000000) return `₹${(absAmount / 10000000).toFixed(1)}Cr`;
  if (absAmount >= 100000) return `₹${(absAmount / 100000).toFixed(1)}L`;
  if (absAmount >= 1000) return `₹${(absAmount / 1000).toFixed(1)}K`;
  return formatCurrency(amount);
};

// Format for chart Y-axis labels — preserves negative sign
export const formatChartCurrency = (amount) => {
  const sign = amount < 0 ? '-' : '';
  const absAmount = Math.abs(amount);
  if (absAmount >= 10000000) return `${sign}₹${(absAmount / 10000000).toFixed(1)}Cr`;
  if (absAmount >= 100000) return `${sign}₹${(absAmount / 100000).toFixed(1)}L`;
  if (absAmount >= 1000) return `${sign}₹${(absAmount / 1000).toFixed(0)}K`;
  return `${sign}₹${absAmount}`;
};

// Format date: dd MMM yyyy
export const formatDate = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return 'Invalid date';
  return format(parsedDate, 'dd MMM yyyy');
};

// Format relative: "2 hours ago", "3 days ago"
export const formatRelativeTime = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return 'Unknown';
  return formatDistance(parsedDate, new Date(), { addSuffix: true });
};

// Format short month for charts: "Jan '25"
export const formatShortMonth = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  return format(parsedDate, "MMM ''yy");
};

// Format month from YYYY-MM string: "2025-01" → "Jan '25"
export const formatMonthYear = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return format(date, "MMM ''yy");
};

// Get current month name
export const getCurrentMonthName = () => {
  return format(new Date(), 'MMMM');
};

// Mask account number: 1234567890 → XXXX 7890
export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return '';
  if (accountNumber.length <= 4) return accountNumber;
  return `XXXX ${accountNumber.slice(-4)}`;
};

// Format percentage: 12.5 → "12.5%"
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

// Format change with sign: +5.2% or -3.1%
export const formatChange = (value, decimals = 1) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

// Get due date status for recurring payments
export const getDueDateStatus = (dueDate) => {
  const today = new Date();
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (!isValid(due)) return 'normal';

  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 3) return 'soon';
  return 'normal';
};

// Format due date badge text
export const formatDueDateBadge = (dueDate) => {
  const today = new Date();
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (!isValid(due)) return 'Unknown';

  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return format(due, 'dd MMM');
};
