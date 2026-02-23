export const EXPENSE_CATEGORIES = [
  // Household
  { id: '1.1', name: 'Grocery & Toiletries', icon: 'ShoppingCart', keywords: ['bigbasket', 'grofers', 'dmart', 'zepto', 'blinkit'] },
  { id: '1.2', name: 'House Rent, Maintenance', icon: 'Home', keywords: ['rent', 'maintenance', 'society'] },
  { id: '1.3', name: 'Vehicle - Fuel, Servicing', icon: 'Car', keywords: ['fuel', 'petrol', 'hp', 'iocl', 'bpcl'] },
  { id: '1.4', name: 'Doctor Visits, Medicines', icon: 'Stethoscope', keywords: ['pharmacy', 'apollo', 'medplus', 'hospital'] },
  { id: '1.5', name: 'Utilities', icon: 'Zap', keywords: ['electricity', 'bescom', 'water', 'gas'] },
  { id: '1.8', name: 'Internet & Mobile Plans', icon: 'Wifi', keywords: ['airtel', 'jio', 'vodafone', 'act', 'internet'] },
  // Lifestyle
  { id: '2.2', name: 'Shopping, Gifts', icon: 'Gift', keywords: ['amazon', 'flipkart', 'myntra', 'shopping'] },
  { id: '2.3', name: 'Dining, Movies, Sports', icon: 'Utensils', keywords: ['swiggy', 'zomato', 'pvr', 'movie'] },
  { id: '2.5', name: 'Travel, Annual holidays', icon: 'Plane', keywords: ['uber', 'ola', 'makemytrip', 'flight'] },
  // Financial
  { id: '3.1', name: 'Insurance', icon: 'Shield', keywords: ['insurance', 'lic', 'premium'] },
  { id: '3.2', name: 'EMI & Loan Payments', icon: 'CreditCard', keywords: ['emi', 'loan', 'payment'] },
  // Misc
  { id: '4.1', name: 'Personal Expenses', icon: 'User', keywords: ['atm', 'cash'] },
  { id: '4.2', name: 'Untagged', icon: 'HelpCircle', keywords: [] },
];

export const ACCOUNT_TYPES = {
  SAVINGS: { label: 'Savings', icon: 'Wallet' },
  CURRENT: { label: 'Current', icon: 'Building' },
  CREDIT_CARD: { label: 'Credit Card', icon: 'CreditCard' },
  LOAN: { label: 'Loan', icon: 'Landmark' },
  FD: { label: 'Fixed Deposit', icon: 'PiggyBank' },
  RD: { label: 'Recurring Deposit', icon: 'TrendingUp' },
  MUTUAL_FUND: { label: 'Mutual Fund', icon: 'LineChart' },
};

export const SUBSCRIPTION_BRANDS = {
  Netflix: { color: '#E50914', bgColor: '#E5091420' },
  'Spotify Premium': { color: '#1DB954', bgColor: '#1DB95420' },
  Spotify: { color: '#1DB954', bgColor: '#1DB95420' },
  'Amazon Prime': { color: '#00A8E1', bgColor: '#00A8E120' },
  Amazon: { color: '#FF9900', bgColor: '#FF990020' },
  'Disney+ Hotstar': { color: '#113CCF', bgColor: '#113CCF20' },
  Hotstar: { color: '#113CCF', bgColor: '#113CCF20' },
  YouTube: { color: '#FF0000', bgColor: '#FF000020' },
  'YouTube Premium': { color: '#FF0000', bgColor: '#FF000020' },
  'Apple Music': { color: '#FA243C', bgColor: '#FA243C20' },
  iCloud: { color: '#3693F3', bgColor: '#3693F320' },
  'Google One': { color: '#4285F4', bgColor: '#4285F420' },
  LinkedIn: { color: '#0A66C2', bgColor: '#0A66C220' },
  Microsoft: { color: '#00A4EF', bgColor: '#00A4EF20' },
  Dropbox: { color: '#0061FF', bgColor: '#0061FF20' },
  Notion: { color: '#000000', bgColor: '#00000020' },
  Figma: { color: '#F24E1E', bgColor: '#F24E1E20' },
  ChatGPT: { color: '#10A37F', bgColor: '#10A37F20' },
  OpenAI: { color: '#10A37F', bgColor: '#10A37F20' },
};

export const STORAGE_KEYS = {
  USER_ID: 'wealth_user_id',
  PIN_HASH: 'wealth_pin_hash',
  AUTH_TOKEN: 'wealth_auth_token',
  BIOMETRIC_ENABLED: 'wealth_biometric',
  ONBOARDING_COMPLETED: 'wealth_onboarding',
  THEME: 'wealth_theme',
};

export const COLORS = {
  // Status Colors
  positive: '#059669',      // emerald-600 (assets, gains)
  negative: '#EF4444',      // red-500 (liabilities, expenses)
  warning: '#F59E0B',       // amber-500
  info: '#3B82F6',          // blue-500

  // Backgrounds
  background: '#F9FAFB',    // gray-50
  cardBackground: '#FFFFFF',

  // Text
  textPrimary: '#111827',   // gray-900
  textSecondary: '#4B5563', // gray-600
  textMuted: '#6B7280',     // gray-500

  // UI Elements
  border: '#E5E7EB',        // gray-200
  accent: '#111827',        // gray-900
};

export const CHART_COLORS = {
  assets: '#059669',
  assetsLight: '#10B981',
  liabilities: '#EF4444',
  liabilitiesLight: '#F87171',
  netWorth: '#059669',
  barPrevious: '#D1D5DB',   // gray-300
  barCurrent: '#059669',    // emerald-600

  // Spending gradient (red tones)
  spending: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
];

export const DASHBOARD_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'assets', label: 'Assets' },
  { id: 'spending', label: 'Spending' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'report', label: 'Report' },
];
