// Financial Wellness Module Types
// These types power the core financial wellness engine

/**
 * ===========================================
 * CASH FLOW CLARITY ENGINE TYPES
 * ===========================================
 */

/**
 * @typedef {'SALARY' | 'BUSINESS' | 'RENTAL' | 'INTEREST' | 'DIVIDEND' | 'FREELANCE' | 'OTHER_INCOME'} IncomeType
 */

/**
 * @typedef {'FIXED' | 'VARIABLE' | 'DISCRETIONARY'} ExpenseCategory
 */

/**
 * @typedef {Object} IncomeSource
 * @property {string} id
 * @property {IncomeType} type
 * @property {string} name
 * @property {number} amount
 * @property {boolean} isRecurring
 * @property {'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME'} frequency
 * @property {number} monthlyEquivalent - Normalized to monthly
 * @property {string} [lastReceivedDate]
 */

/**
 * @typedef {Object} ExpenseItem
 * @property {string} id
 * @property {string} name
 * @property {number} amount
 * @property {ExpenseCategory} category - FIXED, VARIABLE, DISCRETIONARY
 * @property {string} subcategory - e.g., "House Rent", "Groceries"
 * @property {boolean} isEssential
 * @property {boolean} isRecurring
 * @property {number} monthlyEquivalent
 */

/**
 * @typedef {Object} CashFlowSummary
 * @property {number} totalIncome
 * @property {number} fixedExpenses - EMIs, rent, insurance premiums
 * @property {number} variableExpenses - Groceries, utilities, fuel
 * @property {number} discretionaryExpenses - Entertainment, shopping
 * @property {number} surplus - What's left after all expenses
 * @property {number} deficitRisk - If surplus is negative
 * @property {number} savingsRate - Surplus / Income * 100
 * @property {string} month - Format: "2025-01"
 */

/**
 * @typedef {Object} CashFlowComparison
 * @property {CashFlowSummary} current
 * @property {CashFlowSummary} previous
 * @property {Object} changes
 * @property {number} changes.incomeChange
 * @property {number} changes.fixedExpenseChange
 * @property {number} changes.variableExpenseChange
 * @property {number} changes.discretionaryChange
 * @property {number} changes.surplusChange
 * @property {string[]} explanations - Plain English explanations
 */

/**
 * ===========================================
 * EMERGENCY READINESS SYSTEM TYPES
 * ===========================================
 */

/**
 * @typedef {Object} EmergencyFund
 * @property {number} currentAmount - Liquid savings available
 * @property {number} monthlyEssentialExpenses - Fixed + Variable essentials
 * @property {number} survivalMonths - How many months can survive
 * @property {number} targetMonths - Recommended 6 months
 * @property {number} shortfall - Gap to reach target
 * @property {'CRITICAL' | 'WARNING' | 'ADEQUATE' | 'STRONG'} status
 * @property {string} statusMessage - Plain English explanation
 * @property {number} monthlyContributionNeeded - To reach target in 12 months
 */

/**
 * @typedef {Object} EmergencyReadinessAlert
 * @property {string} id
 * @property {'FUND_DEPLETED' | 'FUND_WEAKENING' | 'EXPENSE_SPIKE' | 'INCOME_DROP'} type
 * @property {string} message
 * @property {string} recommendation
 * @property {string} triggeredAt
 * @property {boolean} isRead
 */

/**
 * ===========================================
 * GOAL DISCIPLINE LAYER TYPES
 * ===========================================
 */

/**
 * @typedef {'EMERGENCY_FUND' | 'HOUSE_DOWN_PAYMENT' | 'CAR' | 'WEDDING' | 'EDUCATION' | 'TRAVEL' | 'RETIREMENT' | 'DEBT_FREE' | 'CUSTOM'} GoalType
 */

/**
 * @typedef {Object} FinancialGoal
 * @property {string} id
 * @property {GoalType} type
 * @property {string} name
 * @property {number} targetAmount
 * @property {number} currentAmount
 * @property {string} targetDate
 * @property {number} monthlyCommitment - Promised monthly SIP towards goal
 * @property {boolean} isActive
 * @property {string} createdAt
 */

/**
 * @typedef {Object} GoalProgress
 * @property {string} goalId
 * @property {number} progressPercent
 * @property {number} monthsRemaining
 * @property {number} requiredMonthlyToComplete
 * @property {boolean} isOnTrack
 * @property {number} projectedShortfall - If continuing current pace
 * @property {string} statusMessage
 */

/**
 * @typedef {Object} GoalLeakage
 * @property {string} id
 * @property {string} goalId
 * @property {string} month
 * @property {number} committedAmount
 * @property {number} actualContribution
 * @property {number} leakageAmount - Difference
 * @property {string} leakageReason - Auto-detected or user input
 * @property {string[]} competingSpends - What the money went to instead
 */

/**
 * @typedef {Object} GoalDisciplineScore
 * @property {number} score - 0-100
 * @property {number} consistencyRate - % of months commitment was met
 * @property {number} totalLeakage - Sum of all leakages
 * @property {number} goalsOnTrack - Count of goals on track
 * @property {number} totalGoals
 * @property {string[]} recommendations
 */

/**
 * ===========================================
 * BEHAVIOURAL FINANCIAL HEALTH SCORE TYPES
 * ===========================================
 */

/**
 * @typedef {Object} HealthScoreComponent
 * @property {string} name
 * @property {number} score - 0-100
 * @property {number} weight - Contribution to total score
 * @property {string} status - 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT'
 * @property {string} explanation - Plain English
 * @property {string[]} improvements - Actionable tips
 */

/**
 * @typedef {Object} FinancialHealthScore
 * @property {number} overallScore - 0-100
 * @property {'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT'} overallStatus
 * @property {HealthScoreComponent} consistencyScore - Regular saving behavior
 * @property {HealthScoreComponent} expenseDiscipline - Staying within budgets
 * @property {HealthScoreComponent} withdrawalBehavior - Not raiding savings
 * @property {HealthScoreComponent} planningHygiene - Goals, insurance, nominees
 * @property {HealthScoreComponent} debtHealth - Debt-to-income ratio
 * @property {string} summary - One paragraph explanation
 * @property {string[]} top3Actions - Top 3 things to improve score
 * @property {Object} trend
 * @property {number} trend.previousScore
 * @property {number} trend.change
 * @property {string} trend.direction - 'UP' | 'DOWN' | 'STABLE'
 */

/**
 * ===========================================
 * LIFESTYLE INFLATION DETECTOR TYPES
 * ===========================================
 */

/**
 * @typedef {Object} LifestyleInflationData
 * @property {string} month
 * @property {number} income
 * @property {number} discretionarySpending
 * @property {number} savingsRate
 */

/**
 * @typedef {Object} SpendingCreepItem
 * @property {string} category
 * @property {number} sixMonthsAgoAvg
 * @property {number} currentAvg
 * @property {number} increasePercent
 * @property {number} increaseAmount
 * @property {boolean} isJustified - Income increased proportionally
 * @property {string} explanation
 */

/**
 * @typedef {Object} LifestyleInflationReport
 * @property {boolean} isDetected
 * @property {number} incomeGrowthPercent - Last 6 months
 * @property {number} spendingGrowthPercent - Last 6 months
 * @property {number} savingsRateChange - Positive is good
 * @property {SpendingCreepItem[]} creepingCategories
 * @property {string} summary - Plain English explanation
 * @property {string[]} recommendations
 * @property {'HEALTHY' | 'MILD_CREEP' | 'CONCERNING' | 'CRITICAL'} severity
 */

/**
 * ===========================================
 * RISK GUARDRAILS TYPES
 * ===========================================
 */

/**
 * @typedef {'HIGH_DEBT_RATIO' | 'CONCENTRATION_RISK' | 'NO_INSURANCE' | 'NO_EMERGENCY_FUND' | 'OVERLEVERAGED' | 'SINGLE_INCOME_DEPENDENCY' | 'NO_TERM_INSURANCE' | 'INSUFFICIENT_HEALTH_COVER'} RiskType
 */

/**
 * @typedef {Object} RiskAlert
 * @property {string} id
 * @property {RiskType} type
 * @property {'HIGH' | 'MEDIUM' | 'LOW'} severity
 * @property {string} title
 * @property {string} description - Plain English, no jargon
 * @property {string} impact - What could go wrong
 * @property {string} recommendation
 * @property {boolean} isDismissed
 * @property {string} detectedAt
 */

/**
 * @typedef {Object} RiskProfile
 * @property {number} overallRiskScore - 0-100 (lower is better)
 * @property {'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'} riskLevel
 * @property {RiskAlert[]} activeAlerts
 * @property {Object} metrics
 * @property {number} metrics.debtToIncomeRatio
 * @property {number} metrics.emiToIncomeRatio
 * @property {number} metrics.liquidityRatio
 * @property {number} metrics.insuranceCoverageRatio
 * @property {string} summary
 */

/**
 * ===========================================
 * INDIA-SPECIFIC LIFE EVENT READINESS TYPES
 * ===========================================
 */

/**
 * @typedef {'MARRIAGE' | 'FIRST_CHILD' | 'HOME_PURCHASE' | 'PARENTS_CARE' | 'CHILD_EDUCATION' | 'RETIREMENT'} LifeEventType
 */

/**
 * @typedef {Object} LifeEventCost
 * @property {LifeEventType} event
 * @property {number} estimatedCost - In today's rupees
 * @property {number} inflationAdjustedCost - At target date
 * @property {number} yearsAway
 * @property {number} inflationRate - Assumed rate (varies by event)
 * @property {string} costBreakdown - Explanation of components
 */

/**
 * @typedef {Object} LifeEventReadiness
 * @property {LifeEventType} event
 * @property {string} eventName
 * @property {number} targetYear
 * @property {LifeEventCost} cost
 * @property {number} currentSavings - Dedicated to this event
 * @property {number} readinessPercent
 * @property {number} monthlyNeeded - To be ready on time
 * @property {'NOT_STARTED' | 'BEHIND' | 'ON_TRACK' | 'AHEAD'} status
 * @property {string} message - Plain English status
 * @property {string[]} tips - India-specific advice
 */

/**
 * ===========================================
 * TRUST & HYGIENE CHECKS TYPES
 * ===========================================
 */

/**
 * @typedef {'MISSING_NOMINEE' | 'OUTDATED_NOMINEE' | 'NO_WILL' | 'COVERAGE_GAP' | 'POLICY_EXPIRING' | 'DOCUMENT_MISSING' | 'BENEFICIARY_MISMATCH'} HygieneIssueType
 */

/**
 * @typedef {Object} HygieneIssue
 * @property {string} id
 * @property {HygieneIssueType} type
 * @property {'HIGH' | 'MEDIUM' | 'LOW'} priority
 * @property {string} title
 * @property {string} description
 * @property {string} affectedAccount - Bank name or policy name
 * @property {string} consequence - What happens if not fixed
 * @property {string} howToFix
 * @property {boolean} isResolved
 * @property {string} detectedAt
 */

/**
 * @typedef {Object} NomineeStatus
 * @property {string} accountId
 * @property {string} accountName
 * @property {string} accountType
 * @property {boolean} hasNominee
 * @property {string} [nomineeName]
 * @property {string} [nomineeRelation]
 * @property {boolean} isNomineeUpdated - Within last 2 years
 * @property {string} [lastUpdated]
 */

/**
 * @typedef {Object} HygieneReport
 * @property {number} hygieneScore - 0-100
 * @property {'POOR' | 'NEEDS_ATTENTION' | 'GOOD' | 'EXCELLENT'} status
 * @property {HygieneIssue[]} issues
 * @property {NomineeStatus[]} nomineeStatuses
 * @property {number} issueCount
 * @property {number} criticalIssueCount
 * @property {string} summary
 * @property {string[]} topPriorities - Top 3 things to fix
 */

/**
 * ===========================================
 * FINANCIAL REALITY REPORT TYPES
 * ===========================================
 */

/**
 * @typedef {Object} RealityReportSection
 * @property {string} title
 * @property {'GOOD' | 'WARNING' | 'CRITICAL'} status
 * @property {string} headline - One line summary
 * @property {string} detail - 2-3 sentence explanation
 * @property {string} [actionItem] - What to do about it
 */

/**
 * @typedef {Object} FinancialRealityReport
 * @property {string} generatedAt
 * @property {string} reportMonth
 * @property {Object} snapshot
 * @property {number} snapshot.netWorth
 * @property {number} snapshot.monthlyIncome
 * @property {number} snapshot.monthlyExpenses
 * @property {number} snapshot.monthlySurplus
 * @property {number} snapshot.emergencyMonths
 * @property {number} snapshot.healthScore
 * @property {RealityReportSection} cashFlowSection
 * @property {RealityReportSection} emergencySection
 * @property {RealityReportSection} goalSection
 * @property {RealityReportSection} riskSection
 * @property {RealityReportSection} hygieneSection
 * @property {Object} thirtyDayPlan
 * @property {string[]} thirtyDayPlan.mustDo - Critical actions
 * @property {string[]} thirtyDayPlan.shouldDo - Important actions
 * @property {string[]} thirtyDayPlan.couldDo - Nice to have
 * @property {string} overallMessage - Encouraging summary
 */

export {};
