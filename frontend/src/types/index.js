// TypeScript-like JSDoc types for WealthTracker

/**
 * @typedef {'SAVINGS' | 'CURRENT' | 'CREDIT_CARD' | 'LOAN' | 'FD' | 'RD' | 'MUTUAL_FUND'} AccountType
 */

/**
 * @typedef {'ASSET' | 'LIABILITY'} AssetOrLiability
 */

/**
 * @typedef {'DEBIT' | 'CREDIT'} TransactionType
 */

/**
 * @typedef {'UPI' | 'CARD' | 'NEFT' | 'RTGS' | 'IMPS' | 'CASH'} TransactionMode
 */

/**
 * @typedef {'MONTHLY' | 'YEARLY' | 'QUARTERLY'} Frequency
 */

/**
 * @typedef {Object} User
 * @property {string} userId
 * @property {string} createdAt
 * @property {string} lastLoginAt
 */

/**
 * @typedef {Object} Account
 * @property {string} accountId
 * @property {string} userId
 * @property {AccountType} accountType
 * @property {string} accountNumber
 * @property {string} bankName
 * @property {string} [ifscCode]
 * @property {number} balance
 * @property {AssetOrLiability} assetOrLiability
 * @property {boolean} isActive
 * @property {string} lastSyncedAt
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Transaction
 * @property {string} transactionId
 * @property {string} userId
 * @property {string} accountId
 * @property {number} amount
 * @property {TransactionType} type
 * @property {string} merchantName
 * @property {string} description
 * @property {string} category
 * @property {number} categoryConfidence
 * @property {boolean} isManualCategory
 * @property {string} transactionDate
 * @property {number} balance
 * @property {TransactionMode} mode
 * @property {string} reference
 * @property {boolean} isSubscription
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Subscription
 * @property {string} subscriptionId
 * @property {string} userId
 * @property {string} merchantName
 * @property {number} amount
 * @property {Frequency} frequency
 * @property {string} lastChargedAt
 * @property {string} nextChargeAt
 * @property {string} detectedAt
 * @property {boolean} isConfirmed
 * @property {boolean} isActive
 * @property {string} category
 * @property {string} createdAt
 */

/**
 * @typedef {Object} TrendDataPoint
 * @property {string} month - Format: "2025-01"
 * @property {number} assets
 * @property {number} liabilities
 * @property {number} netWorth
 */

/**
 * @typedef {Object} CategorySummary
 * @property {string} category
 * @property {string} categoryId
 * @property {number} amount
 * @property {number} count
 * @property {number} percentage
 */

/**
 * @typedef {Object} TransactionSummary
 * @property {number} totalIncome
 * @property {number} totalExpenses
 * @property {number} netSavings
 * @property {CategorySummary[]} byCategory
 */

/**
 * @typedef {Object} RecurringPayment
 * @property {string} id
 * @property {string} name
 * @property {number} amount
 * @property {string} dueDate
 * @property {string} [logo]
 * @property {string} [logoColor]
 */

// Redux State Types
/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated
 * @property {string|null} userId
 * @property {boolean} biometricEnabled
 * @property {boolean} onboardingCompleted
 * @property {boolean} isLoading
 * @property {string|null} error
 */

/**
 * @typedef {Object} NetworthState
 * @property {number} totalNetWorth
 * @property {number} totalAssets
 * @property {number} totalLiabilities
 * @property {Account[]} assetAccounts
 * @property {Account[]} liabilityAccounts
 * @property {TrendDataPoint[]} trendData
 * @property {string} lastUpdated
 * @property {boolean} isLoading
 * @property {string|null} error
 */

/**
 * @typedef {Object} TransactionState
 * @property {Transaction[]} transactions
 * @property {TransactionSummary|null} monthlySummary
 * @property {boolean} isLoading
 * @property {string|null} error
 */

/**
 * @typedef {Object} SubscriptionState
 * @property {Subscription[]} activeSubscriptions
 * @property {Subscription[]} detectedSubscriptions
 * @property {Subscription[]} inactiveSubscriptions
 * @property {boolean} isLoading
 * @property {string|null} error
 */

export {};
