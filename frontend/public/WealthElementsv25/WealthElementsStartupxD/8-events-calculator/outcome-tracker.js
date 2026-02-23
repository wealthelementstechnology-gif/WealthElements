/**
 * Outcome Tracker - Collects optimization data for ML training
 * This tracks user decisions and outcomes to improve future recommendations
 */

class OptimizationOutcomeTracker {
  constructor() {
    this.storageKey = 'we_optimization_outcomes';
    this.userStorageKey = 'we_user_profile';
  }

  // Record when user accepts an optimization
  recordOptimizationAttempt(data) {
    const record = {
      // Unique ID
      optimizationId: this.generateId(),
      timestamp: Date.now(),
      userId: this.getUserId(),

      // User demographics (anonymized)
      userProfile: {
        ageGroup: this.getAgeGroup(data.userAge),
        incomeGroup: this.getIncomeGroup(data.monthlyIncome),
        city: data.city || 'unknown',
        familyStatus: data.familyStatus || 'single',
        riskProfile: data.riskProfile || 'moderate',
        monthlyIncome: data.monthlyIncome,
        monthlyExpenses: data.monthlyExpenses,
        investmentBudget: data.investmentBudget
      },

      // Original goals before optimization
      originalGoals: data.originalGoals.map(g => ({
        name: g.name,
        type: this.classifyGoalType(g.name),
        priority: g.priority || 'Medium',
        targetAmount: g.fv,
        yearsLeft: g.yearsLeft,
        requiredSIP: g.sip,
        targetYear: g.targetYear
      })),

      // Optimization parameters applied
      optimizationApplied: {
        stepUpIncreased: data.stepUpBefore !== data.stepUpAfter,
        stepUpBefore: data.stepUpBefore,
        stepUpAfter: data.stepUpAfter,

        goalAdjustments: data.goals.map((g, idx) => {
          const original = data.originalGoals[idx];
          return {
            goalName: g.name,
            goalType: this.classifyGoalType(g.name),
            priority: g.priority || 'Medium',

            // What changed?
            amountReductionPercent: this.calcReduction(original.fv, g.fv),
            tenureExtensionYears: g.yearsLeft - original.yearsLeft,
            sipReductionPercent: this.calcReduction(original.sip, g.sip),

            // Before and after values
            originalAmount: original.fv,
            optimizedAmount: g.fv,
            originalSIP: original.sip,
            optimizedSIP: g.sip,
            originalYearsLeft: original.yearsLeft,
            optimizedYearsLeft: g.yearsLeft
          };
        })
      },

      // Budget context
      budgetContext: {
        monthlyIncome: data.monthlyIncome,
        monthlyExpenses: data.monthlyExpenses,
        investmentBudget: data.investmentBudget,
        originalTotalSIP: data.originalTotalSIP,
        optimizedTotalSIP: data.optimizedTotalSIP,
        budgetUtilization: data.optimizedTotalSIP / data.investmentBudget,
        shortfallResolved: data.optimizedTotalSIP <= data.investmentBudget
      },

      // User acceptance (to be updated)
      userAccepted: null,
      userFeedback: null,
      decisionTimestamp: null,

      // Outcome tracking (to be updated over time)
      outcome: {
        planStarted: false,
        monthsFollowed: 0,
        actualSIPsPaid: [],
        goalsAchieved: [],
        planAbandoned: false,
        abandonmentReason: null
      }
    };

    this.saveRecord(record);
    console.log('Optimization attempt recorded:', record.optimizationId);
    return record.optimizationId;
  }

  // Track user acceptance/rejection
  recordUserDecision(optimizationId, accepted, feedback = null) {
    const records = this.getAllRecords();
    const record = records.find(r => r.optimizationId === optimizationId);

    if (record) {
      record.userAccepted = accepted;
      record.userFeedback = feedback;
      record.decisionTimestamp = Date.now();

      if (accepted) {
        record.outcome.planStarted = true;
      }

      this.updateRecord(record);
      console.log(`User decision recorded: ${accepted ? 'ACCEPTED' : 'REJECTED'}`);
    }
  }

  // Track ongoing progress (called monthly)
  recordMonthlyProgress(userId, month, data) {
    const activeOptimizations = this.getUserOptimizations(userId);

    activeOptimizations.forEach(opt => {
      if (opt.outcome.planAbandoned) return;

      opt.outcome.monthsFollowed = month;
      opt.outcome.actualSIPsPaid.push({
        month: month,
        plannedAmount: data.plannedSIP,
        actualAmount: data.actualSIPPaid,
        adherenceRate: data.actualSIPPaid / data.plannedSIP,
        timestamp: Date.now()
      });

      // Check if any goals achieved
      if (data.goalsAchieved) {
        data.goalsAchieved.forEach(goalName => {
          const alreadyRecorded = opt.outcome.goalsAchieved.find(g => g.goalName === goalName);
          if (!alreadyRecorded) {
            opt.outcome.goalsAchieved.push({
              goalName: goalName,
              achievedInMonth: month,
              targetMonth: this.getTargetMonth(opt, goalName),
              onTime: month <= this.getTargetMonth(opt, goalName)
            });
          }
        });
      }

      this.updateRecord(opt);
    });
  }

  // Track abandonment
  recordPlanAbandonment(optimizationId, reason) {
    const record = this.getRecord(optimizationId);
    if (record) {
      record.outcome.planAbandoned = true;
      record.outcome.abandonmentReason = reason;
      record.abandonmentTimestamp = Date.now();
      this.updateRecord(record);
      console.log('Plan abandonment recorded:', reason);
    }
  }

  // Simple outcome update (for test data generation)
  recordOutcomeUpdate(optimizationId, outcomeData) {
    const record = this.getRecord(optimizationId);
    if (record) {
      // Update outcome fields
      if (outcomeData.planStarted !== undefined) {
        record.outcome.planStarted = outcomeData.planStarted;
      }
      if (outcomeData.monthsFollowed !== undefined) {
        record.outcome.monthsFollowed = outcomeData.monthsFollowed;
      }
      if (outcomeData.goalsAchieved !== undefined) {
        record.outcome.goalsAchieved = outcomeData.goalsAchieved;
      }
      if (outcomeData.planAbandoned !== undefined) {
        record.outcome.planAbandoned = outcomeData.planAbandoned;
      }
      if (outcomeData.abandonmentReason !== undefined) {
        record.outcome.abandonmentReason = outcomeData.abandonmentReason;
      }

      this.updateRecord(record);
    }
  }

  // Helper methods
  classifyGoalType(goalName) {
    const name = goalName.toLowerCase();
    if (name.includes('retire')) return 'retirement';
    if (name.includes('emergency')) return 'emergency';
    if (name.includes('marriage') || name.includes('wedding')) return 'marriage';
    if (name.includes('education') || name.includes('child') || name.includes('college') || name.includes('school')) return 'education';
    if (name.includes('house') || name.includes('home') || name.includes('property')) return 'house';
    if (name.includes('car') || name.includes('vehicle') || name.includes('bike')) return 'vehicle';
    if (name.includes('vacation') || name.includes('travel') || name.includes('trip')) return 'vacation';
    if (name.includes('business') || name.includes('startup')) return 'business';
    return 'other';
  }

  getAgeGroup(age) {
    if (age < 25) return '18-24';
    if (age < 30) return '25-29';
    if (age < 35) return '30-34';
    if (age < 40) return '35-39';
    if (age < 45) return '40-44';
    if (age < 50) return '45-49';
    if (age < 55) return '50-54';
    return '55+';
  }

  getIncomeGroup(income) {
    if (income < 30000) return '0-30k';
    if (income < 50000) return '30k-50k';
    if (income < 75000) return '50k-75k';
    if (income < 100000) return '75k-100k';
    if (income < 150000) return '100k-150k';
    if (income < 200000) return '150k-200k';
    if (income < 300000) return '200k-300k';
    return '300k+';
  }

  calcReduction(original, current) {
    if (original === 0) return 0;
    return ((original - current) / original) * 100;
  }

  generateId() {
    return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    // Get or create user ID
    let userId = localStorage.getItem('we_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('we_user_id', userId);
    }
    return userId;
  }

  getTargetMonth(optimization, goalName) {
    const goal = optimization.originalGoals.find(g => g.name === goalName);
    return goal ? goal.yearsLeft * 12 : 0;
  }

  // Storage methods
  saveRecord(record) {
    const records = this.getAllRecords();
    records.push(record);
    localStorage.setItem(this.storageKey, JSON.stringify(records));
  }

  updateRecord(record) {
    const records = this.getAllRecords();
    const index = records.findIndex(r => r.optimizationId === record.optimizationId);
    if (index !== -1) {
      records[index] = record;
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    }
  }

  getRecord(optimizationId) {
    return this.getAllRecords().find(r => r.optimizationId === optimizationId);
  }

  getAllRecords() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error loading outcome records:', e);
      return [];
    }
  }

  getUserOptimizations(userId) {
    return this.getAllRecords().filter(r => r.userId === userId);
  }

  // Get statistics
  getStatistics() {
    const records = this.getAllRecords();
    const acceptedRecords = records.filter(r => r.userAccepted === true);
    const successfulRecords = acceptedRecords.filter(r =>
      !r.outcome.planAbandoned && r.outcome.monthsFollowed >= 6
    );

    return {
      totalOptimizations: records.length,
      acceptedOptimizations: acceptedRecords.length,
      successfulPlans: successfulRecords.length,
      acceptanceRate: records.length > 0 ? (acceptedRecords.length / records.length * 100).toFixed(1) : 0,
      successRate: acceptedRecords.length > 0 ? (successfulRecords.length / acceptedRecords.length * 100).toFixed(1) : 0,
      averageMonthsFollowed: successfulRecords.length > 0
        ? (successfulRecords.reduce((sum, r) => sum + r.outcome.monthsFollowed, 0) / successfulRecords.length).toFixed(1)
        : 0
    };
  }

  // Export for ML training
  exportForMLTraining() {
    const records = this.getAllRecords();

    // Only include accepted optimizations with outcome data
    const trainingData = records.filter(r =>
      r.userAccepted === true &&
      r.outcome.monthsFollowed >= 3 // At least 3 months of data
    );

    return {
      version: '1.0',
      exportDate: Date.now(),
      exportDateFormatted: new Date().toISOString(),
      recordCount: trainingData.length,
      statistics: this.getStatistics(),
      records: trainingData
    };
  }

  // Clear all data (for testing)
  clearAllData() {
    if (confirm('Are you sure you want to delete all optimization outcome data? This cannot be undone.')) {
      localStorage.removeItem(this.storageKey);
      console.log('All outcome data cleared');
      return true;
    }
    return false;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.outcomeTracker = new OptimizationOutcomeTracker();
  console.log('Outcome Tracker initialized');
}
