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
      return res.status(400).json({ success: false, message: 'Invalid persona. Use: salaried, selfemployed, student, sumit' });
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
