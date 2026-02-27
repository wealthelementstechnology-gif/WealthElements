const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');
const Goal = require('../models/Goal');
const FinancialProfile = require('../models/FinancialProfile');
const User = require('../models/User');

// ─── Persona definitions ──────────────────────────────────────────────────────

const personas = {
  salaried: {
    name: 'Rohan Sharma',
    profile: { monthlyIncome: 120000, monthlyExpenses: 72000, riskProfile: 'MODERATE' },
    accounts: [
      { accountName: 'HDFC Savings', accountType: 'SAVINGS', assetOrLiability: 'ASSET', balance: 285000, institution: 'HDFC Bank' },
      { accountName: 'SBI Savings', accountType: 'SAVINGS', assetOrLiability: 'ASSET', balance: 42000, institution: 'SBI' },
      { accountName: 'Zerodha Portfolio', accountType: 'STOCKS', assetOrLiability: 'ASSET', balance: 340000, institution: 'Zerodha' },
      { accountName: 'HDFC Mutual Funds', accountType: 'MUTUAL_FUND', assetOrLiability: 'ASSET', balance: 180000, institution: 'HDFC AMC' },
      { accountName: 'EPF Account', accountType: 'EPF', assetOrLiability: 'ASSET', balance: 520000, institution: 'EPFO' },
      { accountName: 'HDFC Credit Card', accountType: 'CREDIT_CARD', assetOrLiability: 'LIABILITY', balance: 38000, institution: 'HDFC Bank' },
      { accountName: 'Car Loan - Maruti', accountType: 'LOAN', assetOrLiability: 'LIABILITY', balance: 420000, institution: 'ICICI Bank' },
    ],
    subscriptions: [
      { brandName: 'Netflix', amount: 649, frequency: 'MONTHLY', category: 'Entertainment', status: 'ACTIVE' },
      { brandName: 'Spotify', amount: 119, frequency: 'MONTHLY', category: 'Entertainment', status: 'ACTIVE' },
      { brandName: 'Swiggy One', amount: 299, frequency: 'MONTHLY', category: 'Food', status: 'ACTIVE' },
      { brandName: 'LinkedIn Premium', amount: 2299, frequency: 'MONTHLY', category: 'Productivity', status: 'ACTIVE' },
      { brandName: 'Amazon Prime', amount: 1499, frequency: 'ANNUAL', category: 'Entertainment', status: 'ACTIVE' },
      { brandName: 'Hotstar', amount: 899, frequency: 'ANNUAL', category: 'Entertainment', status: 'DETECTED' },
    ],
    goals: [
      { title: 'Emergency Fund (6 months)', category: 'EMERGENCY', targetAmount: 720000, currentAmount: 285000, targetDate: futureDate(18), priority: 'HIGH' },
      { title: 'Goa Trip with family', category: 'TRAVEL', targetAmount: 150000, currentAmount: 32000, targetDate: futureDate(8), priority: 'MEDIUM' },
      { title: 'New MacBook Pro', category: 'OTHER', targetAmount: 250000, currentAmount: 60000, targetDate: futureDate(6), priority: 'MEDIUM' },
      { title: 'Home Down Payment', category: 'HOME', targetAmount: 3000000, currentAmount: 340000, targetDate: futureDate(48), priority: 'HIGH' },
    ],
    transactions: generateTransactions('salaried'),
  },

  selfemployed: {
    name: 'Priya Mehta',
    profile: { monthlyIncome: 200000, monthlyExpenses: 95000, riskProfile: 'AGGRESSIVE' },
    accounts: [
      { accountName: 'ICICI Current Account', accountType: 'CURRENT', assetOrLiability: 'ASSET', balance: 580000, institution: 'ICICI Bank' },
      { accountName: 'Kotak Savings', accountType: 'SAVINGS', assetOrLiability: 'ASSET', balance: 120000, institution: 'Kotak Bank' },
      { accountName: 'Groww Stocks', accountType: 'STOCKS', assetOrLiability: 'ASSET', balance: 820000, institution: 'Groww' },
      { accountName: 'NPS Account', accountType: 'EPF', assetOrLiability: 'ASSET', balance: 240000, institution: 'NPS' },
      { accountName: 'SBI Home Loan', accountType: 'LOAN', assetOrLiability: 'LIABILITY', balance: 4800000, institution: 'SBI' },
      { accountName: '2BHK Andheri', accountType: 'REAL_ESTATE', assetOrLiability: 'ASSET', balance: 9500000, institution: 'Self' },
    ],
    subscriptions: [
      { brandName: 'Adobe Creative Cloud', amount: 4230, frequency: 'MONTHLY', category: 'Productivity', status: 'ACTIVE' },
      { brandName: 'Notion', amount: 800, frequency: 'MONTHLY', category: 'Productivity', status: 'ACTIVE' },
      { brandName: 'AWS', amount: 3200, frequency: 'MONTHLY', category: 'Business', status: 'ACTIVE' },
      { brandName: 'Zoom', amount: 1300, frequency: 'MONTHLY', category: 'Business', status: 'ACTIVE' },
      { brandName: 'Netflix', amount: 649, frequency: 'MONTHLY', category: 'Entertainment', status: 'ACTIVE' },
    ],
    goals: [
      { title: 'Business Emergency Fund', category: 'EMERGENCY', targetAmount: 1200000, currentAmount: 580000, targetDate: futureDate(12), priority: 'HIGH' },
      { title: 'Europe Trip', category: 'TRAVEL', targetAmount: 400000, currentAmount: 85000, targetDate: futureDate(10), priority: 'MEDIUM' },
      { title: 'Retirement Corpus', category: 'RETIREMENT', targetAmount: 30000000, currentAmount: 1060000, targetDate: futureDate(240), priority: 'HIGH' },
      { title: 'Daughter Education', category: 'EDUCATION', targetAmount: 2000000, currentAmount: 120000, targetDate: futureDate(120), priority: 'HIGH' },
    ],
    transactions: generateTransactions('selfemployed'),
  },

  student: {
    name: 'Arjun Nair',
    profile: { monthlyIncome: 25000, monthlyExpenses: 18000, riskProfile: 'CONSERVATIVE' },
    accounts: [
      { accountName: 'SBI Student Account', accountType: 'SAVINGS', assetOrLiability: 'ASSET', balance: 28000, institution: 'SBI' },
      { accountName: 'Paytm Wallet', accountType: 'SAVINGS', assetOrLiability: 'ASSET', balance: 3200, institution: 'Paytm' },
      { accountName: 'Zerodha Starter', accountType: 'STOCKS', assetOrLiability: 'ASSET', balance: 15000, institution: 'Zerodha' },
      { accountName: 'Education Loan', accountType: 'LOAN', assetOrLiability: 'LIABILITY', balance: 800000, institution: 'SBI' },
    ],
    subscriptions: [
      { brandName: 'Spotify', amount: 119, frequency: 'MONTHLY', category: 'Entertainment', status: 'ACTIVE' },
      { brandName: 'YouTube Premium', amount: 139, frequency: 'MONTHLY', category: 'Entertainment', status: 'ACTIVE' },
      { brandName: 'Coursera', amount: 2499, frequency: 'ANNUAL', category: 'Education', status: 'ACTIVE' },
      { brandName: 'ChatGPT Plus', amount: 1650, frequency: 'MONTHLY', category: 'Productivity', status: 'DETECTED' },
    ],
    goals: [
      { title: 'Emergency Fund', category: 'EMERGENCY', targetAmount: 100000, currentAmount: 28000, targetDate: futureDate(24), priority: 'HIGH' },
      { title: 'First Laptop Upgrade', category: 'OTHER', targetAmount: 80000, currentAmount: 15000, targetDate: futureDate(8), priority: 'HIGH' },
      { title: 'Bike Purchase', category: 'VEHICLE', targetAmount: 120000, currentAmount: 18000, targetDate: futureDate(12), priority: 'MEDIUM' },
    ],
    transactions: generateTransactions('student'),
  },

  kushal: {
    name: 'Kushal Sawant',
    profile: { monthlyIncome: 94000, monthlyExpenses: 88200, riskProfile: 'MODERATE' },
    accounts: [
      // Assets: total ₹7,86,082
      { accountName: 'HDFC Salary Account', accountType: 'SAVINGS', assetOrLiability: 'ASSET', balance: 28400, institution: 'HDFC Bank' },
      { accountName: 'Zerodha - Equity', accountType: 'STOCKS', assetOrLiability: 'ASSET', balance: 69400, institution: 'Zerodha' },
      { accountName: 'Groww Mutual Funds', accountType: 'MUTUAL_FUND', assetOrLiability: 'ASSET', balance: 221700, institution: 'Groww' },
      { accountName: 'Groww Debt Fund', accountType: 'MUTUAL_FUND', assetOrLiability: 'ASSET', balance: 51400, institution: 'Groww' },
      { accountName: 'Gold ETF - Zerodha', accountType: 'STOCKS', assetOrLiability: 'ASSET', balance: 25100, institution: 'Zerodha' },
      { accountName: 'HDFC Recurring Deposit', accountType: 'SAVINGS', assetOrLiability: 'ASSET', balance: 84000, institution: 'HDFC Bank' },
      { accountName: 'PPF - SBI', accountType: 'EPF', assetOrLiability: 'ASSET', balance: 149500, institution: 'SBI' },
      // Liabilities: total ₹9,12,800 → Net Worth = ₹-2,82,200 (clearly negative)
      { accountName: 'ICICI Credit Card', accountType: 'CREDIT_CARD', assetOrLiability: 'LIABILITY', balance: 87400, institution: 'ICICI Bank' },
      { accountName: 'HDFC Personal Loan', accountType: 'LOAN', assetOrLiability: 'LIABILITY', balance: 340000, institution: 'HDFC Bank' },
      { accountName: 'Bajaj Finserv Consumer Loan', accountType: 'LOAN', assetOrLiability: 'LIABILITY', balance: 485400, institution: 'Bajaj Finserv' },
    ],
    subscriptions: [
      { brandName: 'Netflix', amount: 649, frequency: 'MONTHLY', category: 'Entertainment', status: 'ACTIVE' },
      { brandName: 'Spotify', amount: 119, frequency: 'MONTHLY', category: 'Entertainment', status: 'ACTIVE' },
      { brandName: 'Amazon Prime', amount: 299, frequency: 'MONTHLY', category: 'Entertainment', status: 'ACTIVE' },
      { brandName: 'Hotstar', amount: 299, frequency: 'MONTHLY', category: 'Entertainment', status: 'DETECTED' },
      { brandName: 'YouTube Premium', amount: 189, frequency: 'MONTHLY', category: 'Entertainment', status: 'DETECTED' },
      { brandName: 'iCloud 200GB', amount: 219, frequency: 'MONTHLY', category: 'Utilities', status: 'ACTIVE' },
      { brandName: 'Google One', amount: 130, frequency: 'MONTHLY', category: 'Utilities', status: 'DETECTED' },
    ],
    goals: [
      { title: 'Become Debt Free', category: 'EMERGENCY', targetAmount: 912800, currentAmount: 629400, targetDate: futureDate(20), priority: 'HIGH' },
      { title: 'Clear Credit Card Balance', category: 'EMERGENCY', targetAmount: 87400, currentAmount: 12000, targetDate: futureDate(5), priority: 'HIGH' },
      { title: 'Emergency Fund (3 months)', category: 'EMERGENCY', targetAmount: 213600, currentAmount: 28400, targetDate: futureDate(18), priority: 'HIGH' },
      { title: 'Home Down Payment', category: 'HOME', targetAmount: 3500000, currentAmount: 84000, targetDate: futureDate(60), priority: 'MEDIUM' },
    ],
    transactions: generateTransactions('kushal'),
  },

  sumit: {
    name: 'Sumit Verma',
    profile: { monthlyIncome: 85000, monthlyExpenses: 68000, riskProfile: 'MODERATE' },
    accounts: [
      { accountName: 'HDFC Salary Account', accountType: 'SAVINGS', assetOrLiability: 'ASSET', balance: 95000, institution: 'HDFC Bank' },
      { accountName: 'Zerodha Portfolio', accountType: 'STOCKS', assetOrLiability: 'ASSET', balance: 125000, institution: 'Zerodha' },
      { accountName: 'Groww Mutual Funds', accountType: 'MUTUAL_FUND', assetOrLiability: 'ASSET', balance: 68000, institution: 'Groww' },
      { accountName: 'EPF Account', accountType: 'EPF', assetOrLiability: 'ASSET', balance: 210000, institution: 'EPFO' },
      { accountName: 'Personal Loan - HDFC', accountType: 'LOAN', assetOrLiability: 'LIABILITY', balance: 350000, institution: 'HDFC Bank' },
      { accountName: 'ICICI Credit Card', accountType: 'CREDIT_CARD', assetOrLiability: 'LIABILITY', balance: 62000, institution: 'ICICI Bank' },
    ],
    subscriptions: [
      { brandName: 'Netflix', amount: 649, frequency: 'MONTHLY', category: 'Entertainment', status: 'ACTIVE' },
      { brandName: 'Spotify', amount: 119, frequency: 'MONTHLY', category: 'Entertainment', status: 'ACTIVE' },
      { brandName: 'Amazon Prime', amount: 1499, frequency: 'ANNUAL', category: 'Entertainment', status: 'ACTIVE' },
      { brandName: 'ChatGPT', amount: 1650, frequency: 'MONTHLY', category: 'Productivity', status: 'ACTIVE' },
      { brandName: 'iCloud', amount: 75, frequency: 'MONTHLY', category: 'Utilities', status: 'ACTIVE' },
    ],
    goals: [
      { title: 'Clear Credit Card Debt', category: 'EMERGENCY', targetAmount: 62000, currentAmount: 12000, targetDate: futureDate(4), priority: 'HIGH' },
      { title: 'Emergency Fund', category: 'EMERGENCY', targetAmount: 300000, currentAmount: 95000, targetDate: futureDate(18), priority: 'HIGH' },
      { title: 'Manali Trip', category: 'TRAVEL', targetAmount: 80000, currentAmount: 15000, targetDate: futureDate(5), priority: 'MEDIUM' },
      { title: 'Home Down Payment', category: 'HOME', targetAmount: 2000000, currentAmount: 288000, targetDate: futureDate(36), priority: 'HIGH' },
    ],
    transactions: generateTransactions('sumit'),
  },
};

// ─── Helper: future date ──────────────────────────────────────────────────────

function futureDate(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

// ─── Helper: generate realistic transactions ──────────────────────────────────

function generateTransactions(personaKey) {
  const now = new Date();
  const transactions = [];

  const templates = {
    salaried: [
      { description: 'SALARY HDFC BANK', amount: 120000, type: 'CREDIT', category: 'Income', daysAgo: 1 },
      { description: 'HDFC CREDIT CARD PAYMENT', amount: 38000, type: 'DEBIT', category: 'Utilities', daysAgo: 3 },
      { description: 'SWIGGY ORDER', amount: 850, type: 'DEBIT', category: 'Food', daysAgo: 3 },
      { description: 'NETFLIX', amount: 649, type: 'DEBIT', category: 'Entertainment', daysAgo: 5 },
      { description: 'AMAZON PURCHASE', amount: 2399, type: 'DEBIT', category: 'Shopping', daysAgo: 5 },
      { description: 'UBER RIDE', amount: 320, type: 'DEBIT', category: 'Transport', daysAgo: 6 },
      { description: 'ZEPTO GROCERIES', amount: 1450, type: 'DEBIT', category: 'Groceries', daysAgo: 7 },
      { description: 'SPOTIFY PREMIUM', amount: 119, type: 'DEBIT', category: 'Entertainment', daysAgo: 8 },
      { description: 'RENT TRANSFER - LANDLORD', amount: 28000, type: 'DEBIT', category: 'Housing', daysAgo: 9 },
      { description: 'JIOFIBER BROADBAND', amount: 899, type: 'DEBIT', category: 'Utilities', daysAgo: 10 },
      { description: 'BLINKIT ORDER', amount: 760, type: 'DEBIT', category: 'Groceries', daysAgo: 11 },
      { description: 'LINKEDIN PREMIUM', amount: 2299, type: 'DEBIT', category: 'Productivity', daysAgo: 12 },
      { description: 'PETROL - HPCL', amount: 2200, type: 'DEBIT', category: 'Transport', daysAgo: 13 },
      { description: 'SWIGGY ORDER', amount: 640, type: 'DEBIT', category: 'Food', daysAgo: 14 },
      { description: 'GROWW SIP - NIFTY 50', amount: 5000, type: 'DEBIT', category: 'Investment', daysAgo: 15 },
      { description: 'ZERODHA BROKERAGE', amount: 200, type: 'DEBIT', category: 'Investment', daysAgo: 15 },
      { description: 'APOLLO PHARMACY', amount: 580, type: 'DEBIT', category: 'Health', daysAgo: 17 },
      { description: 'SWIGGY INSTAMART', amount: 920, type: 'DEBIT', category: 'Groceries', daysAgo: 18 },
      { description: 'AMAZON PRIME ANNUAL', amount: 1499, type: 'DEBIT', category: 'Entertainment', daysAgo: 20 },
      { description: 'ICICI CAR LOAN EMI', amount: 12500, type: 'DEBIT', category: 'EMI', daysAgo: 22 },
      { description: 'SWIGGY ORDER', amount: 1100, type: 'DEBIT', category: 'Food', daysAgo: 23 },
      { description: 'UBER RIDE', amount: 450, type: 'DEBIT', category: 'Transport', daysAgo: 24 },
      { description: 'ZEPTO GROCERIES', amount: 1820, type: 'DEBIT', category: 'Groceries', daysAgo: 25 },
      { description: 'FREELANCE INCOME', amount: 15000, type: 'CREDIT', category: 'Income', daysAgo: 26 },
      { description: 'MYNTRA FASHION', amount: 2799, type: 'DEBIT', category: 'Shopping', daysAgo: 27 },
      { description: 'BIGBASKET ORDER', amount: 2400, type: 'DEBIT', category: 'Groceries', daysAgo: 28 },
    ],

    selfemployed: [
      { description: 'CLIENT PAYMENT - ACME CORP', amount: 150000, type: 'CREDIT', category: 'Income', daysAgo: 2 },
      { description: 'CLIENT PAYMENT - XYZ STARTUP', amount: 85000, type: 'CREDIT', category: 'Income', daysAgo: 5 },
      { description: 'SBI HOME LOAN EMI', amount: 42000, type: 'DEBIT', category: 'EMI', daysAgo: 1 },
      { description: 'AWS CLOUD SERVICES', amount: 3200, type: 'DEBIT', category: 'Business', daysAgo: 3 },
      { description: 'ADOBE CREATIVE CLOUD', amount: 4230, type: 'DEBIT', category: 'Business', daysAgo: 5 },
      { description: 'SWIGGY ORDER', amount: 1200, type: 'DEBIT', category: 'Food', daysAgo: 6 },
      { description: 'UBER BUSINESS', amount: 850, type: 'DEBIT', category: 'Transport', daysAgo: 7 },
      { description: 'OFFICE SUPPLIES', amount: 3500, type: 'DEBIT', category: 'Business', daysAgo: 8 },
      { description: 'NETFLIX', amount: 649, type: 'DEBIT', category: 'Entertainment', daysAgo: 10 },
      { description: 'ZEPTO GROCERIES', amount: 2800, type: 'DEBIT', category: 'Groceries', daysAgo: 11 },
      { description: 'ZOOM SUBSCRIPTION', amount: 1300, type: 'DEBIT', category: 'Business', daysAgo: 12 },
      { description: 'PETROL - BP', amount: 3500, type: 'DEBIT', category: 'Transport', daysAgo: 14 },
      { description: 'GST PAYMENT', amount: 18000, type: 'DEBIT', category: 'Taxes', daysAgo: 15 },
      { description: 'CLIENT PAYMENT - DELTA CO', amount: 60000, type: 'CREDIT', category: 'Income', daysAgo: 16 },
      { description: 'NOTION SUBSCRIPTION', amount: 800, type: 'DEBIT', category: 'Business', daysAgo: 18 },
      { description: 'RESTAURANT - ZOMATO', amount: 2100, type: 'DEBIT', category: 'Food', daysAgo: 20 },
      { description: 'AMAZON BUSINESS', amount: 4800, type: 'DEBIT', category: 'Shopping', daysAgo: 22 },
      { description: 'INDIGO FLIGHT BOOKING', amount: 12500, type: 'DEBIT', category: 'Travel', daysAgo: 25 },
    ],

    student: [
      { description: 'INTERNSHIP STIPEND', amount: 20000, type: 'CREDIT', category: 'Income', daysAgo: 1 },
      { description: 'PARENTS TRANSFER', amount: 10000, type: 'CREDIT', category: 'Income', daysAgo: 2 },
      { description: 'MESS FEES - HOSTEL', amount: 4500, type: 'DEBIT', category: 'Food', daysAgo: 3 },
      { description: 'SWIGGY ORDER', amount: 380, type: 'DEBIT', category: 'Food', daysAgo: 4 },
      { description: 'OLA RIDE', amount: 120, type: 'DEBIT', category: 'Transport', daysAgo: 5 },
      { description: 'SPOTIFY PREMIUM', amount: 119, type: 'DEBIT', category: 'Entertainment', daysAgo: 7 },
      { description: 'AMAZON TEXTBOOK', amount: 1200, type: 'DEBIT', category: 'Education', daysAgo: 8 },
      { description: 'ZEPTO SNACKS', amount: 340, type: 'DEBIT', category: 'Groceries', daysAgo: 9 },
      { description: 'YOUTUBE PREMIUM', amount: 139, type: 'DEBIT', category: 'Entertainment', daysAgo: 10 },
      { description: 'CHATGPT PLUS', amount: 1650, type: 'DEBIT', category: 'Productivity', daysAgo: 12 },
      { description: 'RAPIDO RIDE', amount: 80, type: 'DEBIT', category: 'Transport', daysAgo: 13 },
      { description: 'BLINKIT ORDER', amount: 490, type: 'DEBIT', category: 'Groceries', daysAgo: 14 },
      { description: 'SWIGGY ORDER', amount: 550, type: 'DEBIT', category: 'Food', daysAgo: 16 },
      { description: 'UDEMY COURSE', amount: 499, type: 'DEBIT', category: 'Education', daysAgo: 18 },
      { description: 'ATM WITHDRAWAL', amount: 2000, type: 'DEBIT', category: 'Other', daysAgo: 20 },
      { description: 'FREELANCE PROJECT', amount: 8000, type: 'CREDIT', category: 'Income', daysAgo: 22 },
      { description: 'AMAZON ORDER', amount: 899, type: 'DEBIT', category: 'Shopping', daysAgo: 24 },
    ],

    // ── Kushal Sawant: 9-month salaried dataset with 7 hidden patterns ──────────
    // Hidden patterns embedded:
    // 1. Lifestyle Creep: discretionary spend grows ~4.2%/month even as debt falls
    // 2. Emotion Spending: shopping spikes ₹18k–₹32k in months when equity portfolio drops >8%
    // 3. Cash Flow Timing Mismatch: salary arrives 2nd, rent due 1st → artificial negative on day 1
    // 4. Investment Inconsistency: SIP flat at ₹18,500 while income grew ₹12k over 9 months (savings rate falling)
    // 5. Subscription Sprawl: 7 subs totaling ₹1,904/month, 3 overlap in service (Netflix+Hotstar+Prime)
    // 6. Debt-Payoff → CC Surge: personal loan closes Mar but CC utilization jumps 40% same month
    // 7. Gold as Emotional Hedge: gold purchases spike after market-down months (behavioral pattern)
    kushal: [
      // ── Current month (most recent ~30 days shown as daysAgo) ──────────────
      { description: 'HDFC SALARY CREDIT', amount: 94000, type: 'CREDIT', category: 'Income', daysAgo: 26 },
      { description: 'RENT TRANSFER - LANDLORD', amount: 12400, type: 'DEBIT', category: 'Housing', daysAgo: 27 },
      { description: 'GROWW SIP - NIFTY 50 INDEX', amount: 12000, type: 'DEBIT', category: 'Investment', daysAgo: 25 },
      { description: 'GROWW SIP - MIDCAP 150', amount: 6500, type: 'DEBIT', category: 'Investment', daysAgo: 25 },
      { description: 'HDFC PERSONAL LOAN EMI', amount: 14200, type: 'DEBIT', category: 'EMI', daysAgo: 24 },
      { description: 'BAJAJ FINSERV CONSUMER LOAN EMI', amount: 18400, type: 'DEBIT', category: 'EMI', daysAgo: 24 },
      { description: 'ZERODHA - GOLD ETF PURCHASE', amount: 4200, type: 'DEBIT', category: 'Investment', daysAgo: 22 },
      { description: 'HDFC RD INSTALLMENT', amount: 14000, type: 'DEBIT', category: 'Investment', daysAgo: 21 },
      { description: 'ZOMATO ORDER', amount: 780, type: 'DEBIT', category: 'Food', daysAgo: 20 },
      { description: 'BLINKIT GROCERIES', amount: 2140, type: 'DEBIT', category: 'Groceries', daysAgo: 19 },
      { description: 'NETFLIX SUBSCRIPTION', amount: 649, type: 'DEBIT', category: 'Entertainment', daysAgo: 18 },
      { description: 'HOTSTAR SUBSCRIPTION', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 18 },
      { description: 'SPOTIFY PREMIUM', amount: 119, type: 'DEBIT', category: 'Entertainment', daysAgo: 17 },
      { description: 'AMAZON PRIME MONTHLY', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 17 },
      { description: 'YOUTUBE PREMIUM', amount: 189, type: 'DEBIT', category: 'Entertainment', daysAgo: 17 },
      { description: 'ICLOUD 200GB', amount: 219, type: 'DEBIT', category: 'Utilities', daysAgo: 16 },
      { description: 'GOOGLE ONE STORAGE', amount: 130, type: 'DEBIT', category: 'Utilities', daysAgo: 16 },
      { description: 'ELECTRICITY BILL - MSEDCL', amount: 2800, type: 'DEBIT', category: 'Utilities', daysAgo: 15 },
      { description: 'JIOFIBER BROADBAND', amount: 999, type: 'DEBIT', category: 'Utilities', daysAgo: 14 },
      { description: 'SWIGGY ORDER', amount: 620, type: 'DEBIT', category: 'Food', daysAgo: 13 },
      { description: 'UBER RIDE', amount: 340, type: 'DEBIT', category: 'Transport', daysAgo: 12 },
      { description: 'PETROL - HPCL', amount: 2400, type: 'DEBIT', category: 'Transport', daysAgo: 11 },
      { description: 'APOLLO PHARMACY', amount: 680, type: 'DEBIT', category: 'Health', daysAgo: 10 },
      { description: 'CULT FIT MEMBERSHIP', amount: 1800, type: 'DEBIT', category: 'Health', daysAgo: 10 },
      { description: 'AMAZON PURCHASE - ELECTRONICS', amount: 6800, type: 'DEBIT', category: 'Shopping', daysAgo: 8 },
      { description: 'MYNTRA FASHION', amount: 3200, type: 'DEBIT', category: 'Shopping', daysAgo: 7 },
      { description: 'ZERODHA - EQUITY BUY INFY', amount: 8200, type: 'DEBIT', category: 'Investment', daysAgo: 6 },
      { description: 'SWIGGY INSTAMART', amount: 1890, type: 'DEBIT', category: 'Groceries', daysAgo: 5 },
      { description: 'ZOMATO ORDER - WEEKEND', amount: 1240, type: 'DEBIT', category: 'Food', daysAgo: 4 },
      { description: 'ICICI CREDIT CARD PAYMENT', amount: 33600, type: 'DEBIT', category: 'Utilities', daysAgo: 3 },
      { description: 'BIGBASKET MONTHLY', amount: 3800, type: 'DEBIT', category: 'Groceries', daysAgo: 2 },
      // ── Month -1 (31–60 days ago) ────────────────────────────────────────────
      { description: 'HDFC SALARY CREDIT', amount: 94000, type: 'CREDIT', category: 'Income', daysAgo: 57 },
      { description: 'RENT TRANSFER - LANDLORD', amount: 12400, type: 'DEBIT', category: 'Housing', daysAgo: 58 },
      { description: 'GROWW SIP - NIFTY 50 INDEX', amount: 12000, type: 'DEBIT', category: 'Investment', daysAgo: 56 },
      { description: 'GROWW SIP - MIDCAP 150', amount: 6500, type: 'DEBIT', category: 'Investment', daysAgo: 56 },
      { description: 'HDFC PERSONAL LOAN EMI', amount: 14200, type: 'DEBIT', category: 'EMI', daysAgo: 55 },
      { description: 'BAJAJ FINSERV CONSUMER LOAN EMI', amount: 18400, type: 'DEBIT', category: 'EMI', daysAgo: 55 },
      { description: 'HDFC RD INSTALLMENT', amount: 14000, type: 'DEBIT', category: 'Investment', daysAgo: 52 },
      // Pattern 7: Gold purchase after market dip month
      { description: 'ZERODHA - GOLD ETF PURCHASE', amount: 7400, type: 'DEBIT', category: 'Investment', daysAgo: 50 },
      { description: 'NETFLIX SUBSCRIPTION', amount: 649, type: 'DEBIT', category: 'Entertainment', daysAgo: 49 },
      { description: 'HOTSTAR SUBSCRIPTION', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 49 },
      { description: 'SPOTIFY PREMIUM', amount: 119, type: 'DEBIT', category: 'Entertainment', daysAgo: 48 },
      { description: 'AMAZON PRIME MONTHLY', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 48 },
      { description: 'YOUTUBE PREMIUM', amount: 189, type: 'DEBIT', category: 'Entertainment', daysAgo: 48 },
      { description: 'ICLOUD 200GB', amount: 219, type: 'DEBIT', category: 'Utilities', daysAgo: 47 },
      { description: 'GOOGLE ONE STORAGE', amount: 130, type: 'DEBIT', category: 'Utilities', daysAgo: 47 },
      { description: 'ELECTRICITY BILL - MSEDCL', amount: 2600, type: 'DEBIT', category: 'Utilities', daysAgo: 46 },
      { description: 'JIOFIBER BROADBAND', amount: 999, type: 'DEBIT', category: 'Utilities', daysAgo: 45 },
      // Pattern 2: equity dropped ~9% this month → shopping spike
      { description: 'AMAZON PURCHASE - HEADPHONES', amount: 14999, type: 'DEBIT', category: 'Shopping', daysAgo: 44 },
      { description: 'CROMA - SMARTWATCH', amount: 12800, type: 'DEBIT', category: 'Shopping', daysAgo: 42 },
      { description: 'ZOMATO ORDER', amount: 890, type: 'DEBIT', category: 'Food', daysAgo: 41 },
      { description: 'SWIGGY ORDER', amount: 720, type: 'DEBIT', category: 'Food', daysAgo: 40 },
      { description: 'BLINKIT GROCERIES', amount: 2320, type: 'DEBIT', category: 'Groceries', daysAgo: 39 },
      { description: 'UBER RIDE', amount: 420, type: 'DEBIT', category: 'Transport', daysAgo: 38 },
      { description: 'PETROL - HPCL', amount: 2400, type: 'DEBIT', category: 'Transport', daysAgo: 37 },
      { description: 'APOLLO PHARMACY', amount: 520, type: 'DEBIT', category: 'Health', daysAgo: 36 },
      { description: 'CULT FIT MEMBERSHIP', amount: 1800, type: 'DEBIT', category: 'Health', daysAgo: 36 },
      { description: 'ZERODHA - EQUITY BUY TCS', amount: 9100, type: 'DEBIT', category: 'Investment', daysAgo: 35 },
      { description: 'SWIGGY INSTAMART', amount: 1980, type: 'DEBIT', category: 'Groceries', daysAgo: 34 },
      { description: 'BIGBASKET MONTHLY', amount: 3650, type: 'DEBIT', category: 'Groceries', daysAgo: 33 },
      { description: 'ICICI CREDIT CARD PAYMENT', amount: 28400, type: 'DEBIT', category: 'Utilities', daysAgo: 32 },
      // ── Month -2 (61–90 days ago) ────────────────────────────────────────────
      { description: 'HDFC SALARY CREDIT', amount: 94000, type: 'CREDIT', category: 'Income', daysAgo: 87 },
      { description: 'RENT TRANSFER - LANDLORD', amount: 12400, type: 'DEBIT', category: 'Housing', daysAgo: 88 },
      { description: 'GROWW SIP - NIFTY 50 INDEX', amount: 12000, type: 'DEBIT', category: 'Investment', daysAgo: 86 },
      { description: 'GROWW SIP - MIDCAP 150', amount: 6500, type: 'DEBIT', category: 'Investment', daysAgo: 86 },
      { description: 'HDFC PERSONAL LOAN EMI', amount: 14200, type: 'DEBIT', category: 'EMI', daysAgo: 85 },
      { description: 'BAJAJ FINSERV CONSUMER LOAN EMI', amount: 18400, type: 'DEBIT', category: 'EMI', daysAgo: 85 },
      { description: 'HDFC RD INSTALLMENT', amount: 14000, type: 'DEBIT', category: 'Investment', daysAgo: 82 },
      { description: 'ZERODHA - GOLD ETF PURCHASE', amount: 3800, type: 'DEBIT', category: 'Investment', daysAgo: 80 },
      { description: 'NETFLIX SUBSCRIPTION', amount: 649, type: 'DEBIT', category: 'Entertainment', daysAgo: 79 },
      { description: 'HOTSTAR SUBSCRIPTION', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 79 },
      { description: 'SPOTIFY PREMIUM', amount: 119, type: 'DEBIT', category: 'Entertainment', daysAgo: 78 },
      { description: 'AMAZON PRIME MONTHLY', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 78 },
      { description: 'YOUTUBE PREMIUM', amount: 189, type: 'DEBIT', category: 'Entertainment', daysAgo: 78 },
      { description: 'ICLOUD 200GB', amount: 219, type: 'DEBIT', category: 'Utilities', daysAgo: 77 },
      { description: 'GOOGLE ONE STORAGE', amount: 130, type: 'DEBIT', category: 'Utilities', daysAgo: 77 },
      { description: 'ELECTRICITY BILL - MSEDCL', amount: 2400, type: 'DEBIT', category: 'Utilities', daysAgo: 76 },
      { description: 'JIOFIBER BROADBAND', amount: 999, type: 'DEBIT', category: 'Utilities', daysAgo: 75 },
      { description: 'ZOMATO ORDER', amount: 840, type: 'DEBIT', category: 'Food', daysAgo: 74 },
      { description: 'SWIGGY ORDER', amount: 690, type: 'DEBIT', category: 'Food', daysAgo: 72 },
      { description: 'BLINKIT GROCERIES', amount: 2180, type: 'DEBIT', category: 'Groceries', daysAgo: 71 },
      { description: 'UBER RIDE', amount: 380, type: 'DEBIT', category: 'Transport', daysAgo: 70 },
      { description: 'PETROL - HPCL', amount: 2400, type: 'DEBIT', category: 'Transport', daysAgo: 69 },
      { description: 'APOLLO PHARMACY', amount: 430, type: 'DEBIT', category: 'Health', daysAgo: 68 },
      { description: 'CULT FIT MEMBERSHIP', amount: 1800, type: 'DEBIT', category: 'Health', daysAgo: 68 },
      { description: 'AMAZON PURCHASE - CLOTHES', amount: 4200, type: 'DEBIT', category: 'Shopping', daysAgo: 67 },
      { description: 'ZERODHA - EQUITY BUY HDFC BANK', amount: 7600, type: 'DEBIT', category: 'Investment', daysAgo: 65 },
      { description: 'SWIGGY INSTAMART', amount: 1820, type: 'DEBIT', category: 'Groceries', daysAgo: 64 },
      { description: 'BIGBASKET MONTHLY', amount: 3500, type: 'DEBIT', category: 'Groceries', daysAgo: 63 },
      { description: 'ICICI CREDIT CARD PAYMENT', amount: 19200, type: 'DEBIT', category: 'Utilities', daysAgo: 62 },
      // ── Month -3 (91–120 days ago) ────────────────────────────────────────────
      { description: 'HDFC SALARY CREDIT', amount: 94000, type: 'CREDIT', category: 'Income', daysAgo: 117 },
      { description: 'RENT TRANSFER - LANDLORD', amount: 12400, type: 'DEBIT', category: 'Housing', daysAgo: 118 },
      { description: 'GROWW SIP - NIFTY 50 INDEX', amount: 12000, type: 'DEBIT', category: 'Investment', daysAgo: 116 },
      { description: 'GROWW SIP - MIDCAP 150', amount: 6500, type: 'DEBIT', category: 'Investment', daysAgo: 116 },
      { description: 'HDFC PERSONAL LOAN EMI', amount: 14200, type: 'DEBIT', category: 'EMI', daysAgo: 115 },
      { description: 'BAJAJ FINSERV CONSUMER LOAN EMI', amount: 18400, type: 'DEBIT', category: 'EMI', daysAgo: 115 },
      { description: 'HDFC RD INSTALLMENT', amount: 14000, type: 'DEBIT', category: 'Investment', daysAgo: 112 },
      // Pattern 6: loan closing month → CC spend jumps
      { description: 'ZERODHA - GOLD ETF PURCHASE', amount: 5100, type: 'DEBIT', category: 'Investment', daysAgo: 110 },
      { description: 'NETFLIX SUBSCRIPTION', amount: 649, type: 'DEBIT', category: 'Entertainment', daysAgo: 109 },
      { description: 'HOTSTAR SUBSCRIPTION', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 109 },
      { description: 'SPOTIFY PREMIUM', amount: 119, type: 'DEBIT', category: 'Entertainment', daysAgo: 108 },
      { description: 'AMAZON PRIME MONTHLY', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 108 },
      { description: 'YOUTUBE PREMIUM', amount: 189, type: 'DEBIT', category: 'Entertainment', daysAgo: 108 },
      { description: 'ICLOUD 200GB', amount: 219, type: 'DEBIT', category: 'Utilities', daysAgo: 107 },
      { description: 'GOOGLE ONE STORAGE', amount: 130, type: 'DEBIT', category: 'Utilities', daysAgo: 107 },
      { description: 'ELECTRICITY BILL - MSEDCL', amount: 2200, type: 'DEBIT', category: 'Utilities', daysAgo: 106 },
      { description: 'JIOFIBER BROADBAND', amount: 999, type: 'DEBIT', category: 'Utilities', daysAgo: 105 },
      // Pattern 6: CC splurge as loan closes (freed cash → hedonic spending)
      { description: 'ICICI CC - APPLE IPHONE 16', amount: 79900, type: 'DEBIT', category: 'Shopping', daysAgo: 104 },
      { description: 'ZOMATO ORDER', amount: 960, type: 'DEBIT', category: 'Food', daysAgo: 102 },
      { description: 'SWIGGY ORDER', amount: 780, type: 'DEBIT', category: 'Food', daysAgo: 100 },
      { description: 'BLINKIT GROCERIES', amount: 2050, type: 'DEBIT', category: 'Groceries', daysAgo: 99 },
      { description: 'UBER RIDE', amount: 360, type: 'DEBIT', category: 'Transport', daysAgo: 98 },
      { description: 'PETROL - HPCL', amount: 2400, type: 'DEBIT', category: 'Transport', daysAgo: 97 },
      { description: 'APOLLO PHARMACY', amount: 390, type: 'DEBIT', category: 'Health', daysAgo: 96 },
      { description: 'CULT FIT MEMBERSHIP', amount: 1800, type: 'DEBIT', category: 'Health', daysAgo: 96 },
      { description: 'ZERODHA - EQUITY BUY RELIANCE', amount: 8400, type: 'DEBIT', category: 'Investment', daysAgo: 95 },
      { description: 'SWIGGY INSTAMART', amount: 1760, type: 'DEBIT', category: 'Groceries', daysAgo: 94 },
      { description: 'BIGBASKET MONTHLY', amount: 3400, type: 'DEBIT', category: 'Groceries', daysAgo: 93 },
      { description: 'ICICI CREDIT CARD PAYMENT', amount: 41800, type: 'DEBIT', category: 'Utilities', daysAgo: 92 },
      // ── Month -4 (121–150 days ago) ───────────────────────────────────────────
      { description: 'HDFC SALARY CREDIT', amount: 94000, type: 'CREDIT', category: 'Income', daysAgo: 147 },
      { description: 'RENT TRANSFER - LANDLORD', amount: 12400, type: 'DEBIT', category: 'Housing', daysAgo: 148 },
      { description: 'GROWW SIP - NIFTY 50 INDEX', amount: 12000, type: 'DEBIT', category: 'Investment', daysAgo: 146 },
      { description: 'GROWW SIP - MIDCAP 150', amount: 6500, type: 'DEBIT', category: 'Investment', daysAgo: 146 },
      { description: 'HDFC PERSONAL LOAN EMI', amount: 14200, type: 'DEBIT', category: 'EMI', daysAgo: 145 },
      { description: 'BAJAJ FINSERV CONSUMER LOAN EMI', amount: 18400, type: 'DEBIT', category: 'EMI', daysAgo: 145 },
      { description: 'HDFC RD INSTALLMENT', amount: 14000, type: 'DEBIT', category: 'Investment', daysAgo: 142 },
      { description: 'ZERODHA - GOLD ETF PURCHASE', amount: 2600, type: 'DEBIT', category: 'Investment', daysAgo: 140 },
      { description: 'NETFLIX SUBSCRIPTION', amount: 649, type: 'DEBIT', category: 'Entertainment', daysAgo: 139 },
      { description: 'HOTSTAR SUBSCRIPTION', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 139 },
      { description: 'SPOTIFY PREMIUM', amount: 119, type: 'DEBIT', category: 'Entertainment', daysAgo: 138 },
      { description: 'AMAZON PRIME MONTHLY', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 138 },
      { description: 'YOUTUBE PREMIUM', amount: 189, type: 'DEBIT', category: 'Entertainment', daysAgo: 138 },
      { description: 'ICLOUD 200GB', amount: 219, type: 'DEBIT', category: 'Utilities', daysAgo: 137 },
      { description: 'GOOGLE ONE STORAGE', amount: 130, type: 'DEBIT', category: 'Utilities', daysAgo: 137 },
      { description: 'ELECTRICITY BILL - MSEDCL', amount: 2100, type: 'DEBIT', category: 'Utilities', daysAgo: 136 },
      { description: 'JIOFIBER BROADBAND', amount: 999, type: 'DEBIT', category: 'Utilities', daysAgo: 135 },
      { description: 'ZOMATO ORDER', amount: 820, type: 'DEBIT', category: 'Food', daysAgo: 134 },
      { description: 'SWIGGY ORDER', amount: 650, type: 'DEBIT', category: 'Food', daysAgo: 132 },
      { description: 'BLINKIT GROCERIES', amount: 1960, type: 'DEBIT', category: 'Groceries', daysAgo: 131 },
      { description: 'UBER RIDE', amount: 310, type: 'DEBIT', category: 'Transport', daysAgo: 130 },
      { description: 'PETROL - HPCL', amount: 2400, type: 'DEBIT', category: 'Transport', daysAgo: 129 },
      { description: 'APOLLO PHARMACY', amount: 360, type: 'DEBIT', category: 'Health', daysAgo: 128 },
      { description: 'CULT FIT MEMBERSHIP', amount: 1800, type: 'DEBIT', category: 'Health', daysAgo: 128 },
      // Pattern 1: shopping growing month on month (lifestyle creep)
      { description: 'AMAZON PURCHASE - FURNITURE', amount: 8900, type: 'DEBIT', category: 'Shopping', daysAgo: 127 },
      { description: 'ZERODHA - EQUITY BUY WIPRO', amount: 5800, type: 'DEBIT', category: 'Investment', daysAgo: 125 },
      { description: 'SWIGGY INSTAMART', amount: 1680, type: 'DEBIT', category: 'Groceries', daysAgo: 124 },
      { description: 'BIGBASKET MONTHLY', amount: 3280, type: 'DEBIT', category: 'Groceries', daysAgo: 123 },
      { description: 'ICICI CREDIT CARD PAYMENT', amount: 14600, type: 'DEBIT', category: 'Utilities', daysAgo: 122 },
      // ── Month -5 (151–180 days ago) ───────────────────────────────────────────
      { description: 'HDFC SALARY CREDIT', amount: 94000, type: 'CREDIT', category: 'Income', daysAgo: 177 },
      { description: 'RENT TRANSFER - LANDLORD', amount: 12400, type: 'DEBIT', category: 'Housing', daysAgo: 178 },
      { description: 'GROWW SIP - NIFTY 50 INDEX', amount: 12000, type: 'DEBIT', category: 'Investment', daysAgo: 176 },
      { description: 'GROWW SIP - MIDCAP 150', amount: 6500, type: 'DEBIT', category: 'Investment', daysAgo: 176 },
      { description: 'HDFC PERSONAL LOAN EMI', amount: 14200, type: 'DEBIT', category: 'EMI', daysAgo: 175 },
      { description: 'BAJAJ FINSERV CONSUMER LOAN EMI', amount: 18400, type: 'DEBIT', category: 'EMI', daysAgo: 175 },
      { description: 'HDFC RD INSTALLMENT', amount: 14000, type: 'DEBIT', category: 'Investment', daysAgo: 172 },
      // Pattern 7: gold purchase after prior market dip
      { description: 'ZERODHA - GOLD ETF PURCHASE', amount: 8200, type: 'DEBIT', category: 'Investment', daysAgo: 170 },
      { description: 'NETFLIX SUBSCRIPTION', amount: 649, type: 'DEBIT', category: 'Entertainment', daysAgo: 169 },
      { description: 'HOTSTAR SUBSCRIPTION', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 169 },
      { description: 'SPOTIFY PREMIUM', amount: 119, type: 'DEBIT', category: 'Entertainment', daysAgo: 168 },
      { description: 'AMAZON PRIME MONTHLY', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 168 },
      { description: 'YOUTUBE PREMIUM', amount: 189, type: 'DEBIT', category: 'Entertainment', daysAgo: 168 },
      { description: 'ICLOUD 200GB', amount: 219, type: 'DEBIT', category: 'Utilities', daysAgo: 167 },
      { description: 'GOOGLE ONE STORAGE', amount: 130, type: 'DEBIT', category: 'Utilities', daysAgo: 167 },
      { description: 'ELECTRICITY BILL - MSEDCL', amount: 1980, type: 'DEBIT', category: 'Utilities', daysAgo: 166 },
      { description: 'JIOFIBER BROADBAND', amount: 999, type: 'DEBIT', category: 'Utilities', daysAgo: 165 },
      // Pattern 2: equity dropped ~11% → big shopping spike
      { description: 'AMAZON PURCHASE - CAMERA', amount: 22400, type: 'DEBIT', category: 'Shopping', daysAgo: 164 },
      { description: 'NYKAA - GROOMING PRODUCTS', amount: 4100, type: 'DEBIT', category: 'Shopping', daysAgo: 162 },
      { description: 'ZOMATO ORDER', amount: 760, type: 'DEBIT', category: 'Food', daysAgo: 161 },
      { description: 'SWIGGY ORDER', amount: 610, type: 'DEBIT', category: 'Food', daysAgo: 159 },
      { description: 'BLINKIT GROCERIES', amount: 1840, type: 'DEBIT', category: 'Groceries', daysAgo: 158 },
      { description: 'UBER RIDE', amount: 290, type: 'DEBIT', category: 'Transport', daysAgo: 157 },
      { description: 'PETROL - HPCL', amount: 2400, type: 'DEBIT', category: 'Transport', daysAgo: 156 },
      { description: 'APOLLO PHARMACY', amount: 310, type: 'DEBIT', category: 'Health', daysAgo: 155 },
      { description: 'CULT FIT MEMBERSHIP', amount: 1800, type: 'DEBIT', category: 'Health', daysAgo: 155 },
      { description: 'ZERODHA - EQUITY BUY BAJAJ FIN', amount: 6200, type: 'DEBIT', category: 'Investment', daysAgo: 154 },
      { description: 'SWIGGY INSTAMART', amount: 1580, type: 'DEBIT', category: 'Groceries', daysAgo: 153 },
      { description: 'BIGBASKET MONTHLY', amount: 3100, type: 'DEBIT', category: 'Groceries', daysAgo: 152 },
      { description: 'ICICI CREDIT CARD PAYMENT', amount: 9700, type: 'DEBIT', category: 'Utilities', daysAgo: 152 },
      // ── Month -6 (181–210 days ago) ───────────────────────────────────────────
      { description: 'HDFC SALARY CREDIT', amount: 94000, type: 'CREDIT', category: 'Income', daysAgo: 207 },
      { description: 'RENT TRANSFER - LANDLORD', amount: 12400, type: 'DEBIT', category: 'Housing', daysAgo: 208 },
      { description: 'GROWW SIP - NIFTY 50 INDEX', amount: 12000, type: 'DEBIT', category: 'Investment', daysAgo: 206 },
      { description: 'GROWW SIP - MIDCAP 150', amount: 6500, type: 'DEBIT', category: 'Investment', daysAgo: 206 },
      { description: 'HDFC PERSONAL LOAN EMI', amount: 14200, type: 'DEBIT', category: 'EMI', daysAgo: 205 },
      { description: 'BAJAJ FINSERV CONSUMER LOAN EMI', amount: 18400, type: 'DEBIT', category: 'EMI', daysAgo: 205 },
      { description: 'HDFC RD INSTALLMENT', amount: 14000, type: 'DEBIT', category: 'Investment', daysAgo: 202 },
      { description: 'ZERODHA - GOLD ETF PURCHASE', amount: 2200, type: 'DEBIT', category: 'Investment', daysAgo: 200 },
      { description: 'NETFLIX SUBSCRIPTION', amount: 649, type: 'DEBIT', category: 'Entertainment', daysAgo: 199 },
      { description: 'HOTSTAR SUBSCRIPTION', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 199 },
      { description: 'SPOTIFY PREMIUM', amount: 119, type: 'DEBIT', category: 'Entertainment', daysAgo: 198 },
      { description: 'AMAZON PRIME MONTHLY', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 198 },
      { description: 'YOUTUBE PREMIUM', amount: 189, type: 'DEBIT', category: 'Entertainment', daysAgo: 198 },
      { description: 'ICLOUD 200GB', amount: 219, type: 'DEBIT', category: 'Utilities', daysAgo: 197 },
      { description: 'GOOGLE ONE STORAGE', amount: 130, type: 'DEBIT', category: 'Utilities', daysAgo: 197 },
      { description: 'ELECTRICITY BILL - MSEDCL', amount: 1820, type: 'DEBIT', category: 'Utilities', daysAgo: 196 },
      { description: 'JIOFIBER BROADBAND', amount: 999, type: 'DEBIT', category: 'Utilities', daysAgo: 195 },
      { description: 'ZOMATO ORDER', amount: 710, type: 'DEBIT', category: 'Food', daysAgo: 194 },
      { description: 'SWIGGY ORDER', amount: 570, type: 'DEBIT', category: 'Food', daysAgo: 192 },
      { description: 'BLINKIT GROCERIES', amount: 1720, type: 'DEBIT', category: 'Groceries', daysAgo: 191 },
      { description: 'UBER RIDE', amount: 270, type: 'DEBIT', category: 'Transport', daysAgo: 190 },
      { description: 'PETROL - HPCL', amount: 2400, type: 'DEBIT', category: 'Transport', daysAgo: 189 },
      { description: 'APOLLO PHARMACY', amount: 280, type: 'DEBIT', category: 'Health', daysAgo: 188 },
      { description: 'CULT FIT MEMBERSHIP', amount: 1800, type: 'DEBIT', category: 'Health', daysAgo: 188 },
      { description: 'AMAZON PURCHASE - HOME DECOR', amount: 5800, type: 'DEBIT', category: 'Shopping', daysAgo: 187 },
      { description: 'ZERODHA - EQUITY BUY ASIAN PAINTS', amount: 4900, type: 'DEBIT', category: 'Investment', daysAgo: 185 },
      { description: 'SWIGGY INSTAMART', amount: 1480, type: 'DEBIT', category: 'Groceries', daysAgo: 184 },
      { description: 'BIGBASKET MONTHLY', amount: 2900, type: 'DEBIT', category: 'Groceries', daysAgo: 183 },
      { description: 'ICICI CREDIT CARD PAYMENT', amount: 22100, type: 'DEBIT', category: 'Utilities', daysAgo: 182 },
      // ── Month -7 (211–240 days ago) ───────────────────────────────────────────
      { description: 'HDFC SALARY CREDIT', amount: 82000, type: 'CREDIT', category: 'Income', daysAgo: 237 },
      { description: 'RENT TRANSFER - LANDLORD', amount: 12400, type: 'DEBIT', category: 'Housing', daysAgo: 238 },
      { description: 'GROWW SIP - NIFTY 50 INDEX', amount: 12000, type: 'DEBIT', category: 'Investment', daysAgo: 236 },
      { description: 'GROWW SIP - MIDCAP 150', amount: 6500, type: 'DEBIT', category: 'Investment', daysAgo: 236 },
      // Pattern 4: SIP unchanged at ₹18,500 but salary was lower at ₹82k (investment rate higher before)
      { description: 'HDFC PERSONAL LOAN EMI', amount: 14200, type: 'DEBIT', category: 'EMI', daysAgo: 235 },
      { description: 'BAJAJ FINSERV CONSUMER LOAN EMI', amount: 18400, type: 'DEBIT', category: 'EMI', daysAgo: 235 },
      { description: 'HDFC RD INSTALLMENT', amount: 14000, type: 'DEBIT', category: 'Investment', daysAgo: 232 },
      { description: 'ZERODHA - GOLD ETF PURCHASE', amount: 1800, type: 'DEBIT', category: 'Investment', daysAgo: 230 },
      { description: 'NETFLIX SUBSCRIPTION', amount: 649, type: 'DEBIT', category: 'Entertainment', daysAgo: 229 },
      { description: 'HOTSTAR SUBSCRIPTION', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 229 },
      { description: 'SPOTIFY PREMIUM', amount: 119, type: 'DEBIT', category: 'Entertainment', daysAgo: 228 },
      { description: 'AMAZON PRIME MONTHLY', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 228 },
      { description: 'YOUTUBE PREMIUM', amount: 189, type: 'DEBIT', category: 'Entertainment', daysAgo: 228 },
      { description: 'ICLOUD 200GB', amount: 219, type: 'DEBIT', category: 'Utilities', daysAgo: 227 },
      { description: 'GOOGLE ONE STORAGE', amount: 130, type: 'DEBIT', category: 'Utilities', daysAgo: 227 },
      { description: 'ELECTRICITY BILL - MSEDCL', amount: 1700, type: 'DEBIT', category: 'Utilities', daysAgo: 226 },
      { description: 'JIOFIBER BROADBAND', amount: 999, type: 'DEBIT', category: 'Utilities', daysAgo: 225 },
      { description: 'ZOMATO ORDER', amount: 640, type: 'DEBIT', category: 'Food', daysAgo: 224 },
      { description: 'SWIGGY ORDER', amount: 520, type: 'DEBIT', category: 'Food', daysAgo: 222 },
      { description: 'BLINKIT GROCERIES', amount: 1600, type: 'DEBIT', category: 'Groceries', daysAgo: 221 },
      { description: 'UBER RIDE', amount: 250, type: 'DEBIT', category: 'Transport', daysAgo: 220 },
      { description: 'PETROL - HPCL', amount: 2400, type: 'DEBIT', category: 'Transport', daysAgo: 219 },
      { description: 'APOLLO PHARMACY', amount: 240, type: 'DEBIT', category: 'Health', daysAgo: 218 },
      { description: 'CULT FIT MEMBERSHIP', amount: 1800, type: 'DEBIT', category: 'Health', daysAgo: 218 },
      { description: 'AMAZON PURCHASE - BOOKS+MISC', amount: 3200, type: 'DEBIT', category: 'Shopping', daysAgo: 217 },
      { description: 'ZERODHA - EQUITY BUY NIFTY ETF', amount: 4100, type: 'DEBIT', category: 'Investment', daysAgo: 215 },
      { description: 'SWIGGY INSTAMART', amount: 1380, type: 'DEBIT', category: 'Groceries', daysAgo: 214 },
      { description: 'BIGBASKET MONTHLY', amount: 2700, type: 'DEBIT', category: 'Groceries', daysAgo: 213 },
      { description: 'ICICI CREDIT CARD PAYMENT', amount: 18400, type: 'DEBIT', category: 'Utilities', daysAgo: 212 },
      // ── Month -8 (241–270 days ago) ───────────────────────────────────────────
      { description: 'HDFC SALARY CREDIT', amount: 82000, type: 'CREDIT', category: 'Income', daysAgo: 267 },
      { description: 'RENT TRANSFER - LANDLORD', amount: 12400, type: 'DEBIT', category: 'Housing', daysAgo: 268 },
      { description: 'GROWW SIP - NIFTY 50 INDEX', amount: 12000, type: 'DEBIT', category: 'Investment', daysAgo: 266 },
      { description: 'GROWW SIP - MIDCAP 150', amount: 6500, type: 'DEBIT', category: 'Investment', daysAgo: 266 },
      { description: 'HDFC PERSONAL LOAN EMI', amount: 14200, type: 'DEBIT', category: 'EMI', daysAgo: 265 },
      { description: 'BAJAJ FINSERV CONSUMER LOAN EMI', amount: 18400, type: 'DEBIT', category: 'EMI', daysAgo: 265 },
      { description: 'HDFC RD INSTALLMENT', amount: 14000, type: 'DEBIT', category: 'Investment', daysAgo: 262 },
      // Pattern 7: biggest gold purchase — market had worst month
      { description: 'ZERODHA - GOLD ETF PURCHASE', amount: 9800, type: 'DEBIT', category: 'Investment', daysAgo: 260 },
      { description: 'NETFLIX SUBSCRIPTION', amount: 649, type: 'DEBIT', category: 'Entertainment', daysAgo: 259 },
      { description: 'HOTSTAR SUBSCRIPTION', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 259 },
      { description: 'SPOTIFY PREMIUM', amount: 119, type: 'DEBIT', category: 'Entertainment', daysAgo: 258 },
      { description: 'AMAZON PRIME MONTHLY', amount: 299, type: 'DEBIT', category: 'Entertainment', daysAgo: 258 },
      { description: 'YOUTUBE PREMIUM', amount: 189, type: 'DEBIT', category: 'Entertainment', daysAgo: 258 },
      { description: 'ICLOUD 200GB', amount: 219, type: 'DEBIT', category: 'Utilities', daysAgo: 257 },
      { description: 'GOOGLE ONE STORAGE', amount: 130, type: 'DEBIT', category: 'Utilities', daysAgo: 257 },
      { description: 'ELECTRICITY BILL - MSEDCL', amount: 1600, type: 'DEBIT', category: 'Utilities', daysAgo: 256 },
      { description: 'JIOFIBER BROADBAND', amount: 999, type: 'DEBIT', category: 'Utilities', daysAgo: 255 },
      // Pattern 2: market down 13% → shopping spike
      { description: 'MYNTRA - PREMIUM SHOES', amount: 8200, type: 'DEBIT', category: 'Shopping', daysAgo: 254 },
      { description: 'AMAZON PURCHASE - KITCHEN APPLIANCE', amount: 12400, type: 'DEBIT', category: 'Shopping', daysAgo: 252 },
      { description: 'ZOMATO ORDER', amount: 590, type: 'DEBIT', category: 'Food', daysAgo: 251 },
      { description: 'SWIGGY ORDER', amount: 480, type: 'DEBIT', category: 'Food', daysAgo: 249 },
      { description: 'BLINKIT GROCERIES', amount: 1480, type: 'DEBIT', category: 'Groceries', daysAgo: 248 },
      { description: 'UBER RIDE', amount: 230, type: 'DEBIT', category: 'Transport', daysAgo: 247 },
      { description: 'PETROL - HPCL', amount: 2400, type: 'DEBIT', category: 'Transport', daysAgo: 246 },
      { description: 'APOLLO PHARMACY', amount: 210, type: 'DEBIT', category: 'Health', daysAgo: 245 },
      { description: 'CULT FIT MEMBERSHIP', amount: 1800, type: 'DEBIT', category: 'Health', daysAgo: 245 },
      { description: 'ZERODHA - EQUITY BUY AXIS BANK', amount: 3800, type: 'DEBIT', category: 'Investment', daysAgo: 244 },
      { description: 'SWIGGY INSTAMART', amount: 1280, type: 'DEBIT', category: 'Groceries', daysAgo: 243 },
      { description: 'BIGBASKET MONTHLY', amount: 2500, type: 'DEBIT', category: 'Groceries', daysAgo: 242 },
      { description: 'ICICI CREDIT CARD PAYMENT', amount: 22100, type: 'DEBIT', category: 'Utilities', daysAgo: 242 },
    ],

    sumit: [
      { description: 'HDFC SALARY CREDIT', amount: 85000, type: 'CREDIT', category: 'Income', daysAgo: 1 },
      { description: 'HDFC PERSONAL LOAN EMI', amount: 12500, type: 'DEBIT', category: 'EMI', daysAgo: 2 },
      { description: 'ICICI CREDIT CARD PAYMENT', amount: 15000, type: 'DEBIT', category: 'Utilities', daysAgo: 3 },
      { description: 'RENT TRANSFER', amount: 22000, type: 'DEBIT', category: 'Housing', daysAgo: 4 },
      { description: 'SWIGGY ORDER', amount: 680, type: 'DEBIT', category: 'Food', daysAgo: 4 },
      { description: 'ZEPTO GROCERIES', amount: 1850, type: 'DEBIT', category: 'Groceries', daysAgo: 5 },
      { description: 'NETFLIX', amount: 649, type: 'DEBIT', category: 'Entertainment', daysAgo: 6 },
      { description: 'UBER RIDE', amount: 280, type: 'DEBIT', category: 'Transport', daysAgo: 7 },
      { description: 'CHATGPT PLUS', amount: 1650, type: 'DEBIT', category: 'Productivity', daysAgo: 8 },
      { description: 'BLINKIT ORDER', amount: 1120, type: 'DEBIT', category: 'Groceries', daysAgo: 9 },
      { description: 'SPOTIFY PREMIUM', amount: 119, type: 'DEBIT', category: 'Entertainment', daysAgo: 10 },
      { description: 'SWIGGY ORDER', amount: 920, type: 'DEBIT', category: 'Food', daysAgo: 11 },
      { description: 'PETROL - HPCL', amount: 1800, type: 'DEBIT', category: 'Transport', daysAgo: 12 },
      { description: 'GROWW SIP', amount: 5000, type: 'DEBIT', category: 'Investment', daysAgo: 15 },
      { description: 'AMAZON PURCHASE', amount: 3299, type: 'DEBIT', category: 'Shopping', daysAgo: 16 },
      { description: 'JIOFIBER BROADBAND', amount: 999, type: 'DEBIT', category: 'Utilities', daysAgo: 17 },
      { description: 'ZOMATO ORDER', amount: 740, type: 'DEBIT', category: 'Food', daysAgo: 18 },
      { description: 'SIDE PROJECT INCOME', amount: 12000, type: 'CREDIT', category: 'Income', daysAgo: 20 },
      { description: 'PHARMACY - APOLLO', amount: 450, type: 'DEBIT', category: 'Health', daysAgo: 21 },
      { description: 'MYNTRA CLOTHES', amount: 2199, type: 'DEBIT', category: 'Shopping', daysAgo: 23 },
      { description: 'ICICI CREDIT CARD USE', amount: 4800, type: 'DEBIT', category: 'Shopping', daysAgo: 25 },
      { description: 'AMAZON PRIME ANNUAL', amount: 1499, type: 'DEBIT', category: 'Entertainment', daysAgo: 27 },
    ],
  };

  const tmpl = templates[personaKey] || templates.salaried;
  tmpl.forEach((t, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - t.daysAgo);
    transactions.push({
      amount: t.amount,
      type: t.type,
      category: t.category,
      description: t.description,
      cleanDescription: t.description,
      date,
      source: 'MANUAL',
    });
  });

  return transactions;
}

// ─── Helper: generate 12 months of networth history ──────────────────────────

function generateNetworthHistory(personaKey) {
  const now = new Date();

  // Kushal: deeply in debt — lifestyle creep + consumer loans + CC abuse
  // Started very negative 8 months ago, recovering slowly but STILL negative today
  // Hidden: recovery pace slowing because spending grows as fast as EMIs are paid
  if (personaKey === 'kushal') {
    const arc = [
      { nwOffset: -524000, liabilities: 1148000 }, // 8 months ago — peak debt, just took consumer loan
      { nwOffset: -498200, liabilities: 1112000 }, // 7 months ago — marginal improvement
      { nwOffset: -462800, liabilities: 1074000 }, // 6 months ago — equity dip, CC spikes, recovery stalls
      { nwOffset: -421500, liabilities: 1038000 }, // 5 months ago
      { nwOffset: -388400, liabilities: 1004000 }, // 4 months ago — equity dip again, shopping spike
      { nwOffset: -349200, liabilities: 972000  }, // 3 months ago — loan closing soon
      { nwOffset: -318600, liabilities: 941000  }, // 2 months ago — CC surge after perceived relief
      { nwOffset: -298800, liabilities: 924000  }, // 1 month ago — slowly grinding down
      { nwOffset: -282200, liabilities: 912800  }, // current — still negative, ₹9.1L in liabilities
    ];

    const history = [];
    for (let i = 8; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.toISOString().slice(0, 7);
      const point = arc[8 - i];
      const liabilities = point.liabilities;
      const assets = liabilities + point.nwOffset;
      const netWorth = point.nwOffset;
      history.push({ month, netWorth, assets, liabilities });
    }
    return history;
  }

  // Sumit: custom trajectory — large negative → gradually recovers → positive last 3 months
  if (personaKey === 'sumit') {
    // Manually defined net worth arc over last 6 months (oldest first)
    // Month -5: deep negative (just took loans, credit card maxed)
    // Month -4: still very negative, slightly better
    // Month -3: negative but improving fast (started side income)
    // Month -2: near zero (break-even point)
    // Month -1: first positive month
    // Month  0: current — solidly positive
    const arc = [
      { nwOffset: -380000, liabilities: 480000 },  // 6 months ago
      { nwOffset: -310000, liabilities: 465000 },  // 5 months ago
      { nwOffset: -210000, liabilities: 448000 },  // 4 months ago
      { nwOffset: -90000,  liabilities: 430000 },  // 3 months ago
      { nwOffset: 35000,   liabilities: 415000 },  // 2 months ago (first positive)
      { nwOffset: 86000,   liabilities: 412000 },  // last month
    ];

    const history = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.toISOString().slice(0, 7);
      const point = arc[5 - i];
      const liabilities = point.liabilities;
      const assets = liabilities + point.nwOffset;
      const netWorth = point.nwOffset;
      history.push({ month, netWorth, assets, liabilities });
    }
    return history;
  }

  const data = {
    salaried:     { netWorth: 909000,  assets: 1367000,  liabilities: 458000,  monthlyGrowth: 0.018 },
    selfemployed: { netWorth: 6460000, assets: 11260000, liabilities: 4800000, monthlyGrowth: 0.025 },
    student:      { netWorth: -753800, assets: 46200,    liabilities: 800000,  monthlyGrowth: 0.015 },
  };

  const base = data[personaKey] || data.salaried;
  const history = [];

  // Work backwards 11 months from current, then append current month
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.toISOString().slice(0, 7);

    const factor = Math.pow(1 - base.monthlyGrowth, i);
    const noise = 1 + (Math.random() * 0.06 - 0.03);

    const assets = Math.round(base.assets * factor * noise);
    const liabilities = Math.round(base.liabilities * (1 + i * 0.005));
    const netWorth = assets - liabilities;

    history.push({ month, netWorth, assets, liabilities });
  }

  return history;
}

// ─── Controller ───────────────────────────────────────────────────────────────

const seedDemoData = async (req, res, next) => {
  try {
    const { persona = 'salaried' } = req.body;
    const userId = req.user._id;

    const data = personas[persona];
    if (!data) {
      return res.status(400).json({ success: false, message: 'Invalid persona. Use: salaried, selfemployed, student, sumit, kushal' });
    }

    // Clear existing data for this user
    await Promise.all([
      Account.deleteMany({ userId }),
      Transaction.deleteMany({ userId }),
      Subscription.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
    ]);

    // Insert accounts
    const accounts = await Account.insertMany(
      data.accounts.map(a => ({ ...a, userId, source: 'MANUAL', isActive: true }))
    );

    // Insert transactions (attach first savings account as accountId)
    const savingsAccount = accounts.find(a => a.accountType === 'SAVINGS' || a.accountType === 'CURRENT');
    await Transaction.insertMany(
      data.transactions.map(t => ({ ...t, userId, accountId: savingsAccount?._id }))
    );

    // Insert subscriptions
    const now = new Date();
    await Subscription.insertMany(
      data.subscriptions.map(s => {
        const nextRenewal = new Date(now);
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
        return { ...s, userId, nextRenewalDate: nextRenewal };
      })
    );

    // Insert goals
    await Goal.insertMany(
      data.goals.map(g => ({ ...g, userId, isCompleted: false }))
    );

    // Update financial profile (with 12-month networth history)
    const networthHistory = generateNetworthHistory(persona);
    await FinancialProfile.findOneAndUpdate(
      { userId },
      { ...data.profile, onboardingCompleted: true, networthHistory },
      { upsert: true, new: true }
    );

    // Update user name
    await User.findByIdAndUpdate(userId, { 'profile.name': data.name, 'profile.onboardingCompleted': true });

    res.status(200).json({
      success: true,
      message: `Demo data loaded for persona: ${persona}`,
      data: {
        accounts: accounts.length,
        transactions: data.transactions.length,
        subscriptions: data.subscriptions.length,
        goals: data.goals.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const clearDemoData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Promise.all([
      Account.deleteMany({ userId }),
      Transaction.deleteMany({ userId }),
      Subscription.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
    ]);
    res.status(200).json({ success: true, message: 'All data cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { seedDemoData, clearDemoData };
