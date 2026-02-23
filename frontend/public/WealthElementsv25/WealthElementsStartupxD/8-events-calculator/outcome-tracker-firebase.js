/**
 * Outcome Tracker with Firebase Firestore
 * Stores optimization data in cloud database instead of localStorage
 */

class OptimizationOutcomeTracker {
  constructor() {
    this.storageKey = 'we_optimization_outcomes';
    this.userStorageKey = 'we_user_profile';
    this.useFirebase = false;
    this.db = null;
    this.collectionName = 'optimizations';

    // Try to initialize Firebase
    this.initializeFirebase();
  }

  initializeFirebase() {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
      console.warn('⚠️ Firebase not loaded. Using localStorage fallback.');
      this.useFirebase = false;
      return;
    }

    try {
      // Firebase is already initialized in HTML, just get reference
      this.db = firebase.firestore();
      this.useFirebase = true;
      console.log('✅ Firebase Firestore initialized for ML data');
    } catch (e) {
      console.warn('⚠️ Firebase initialization failed. Using localStorage fallback.', e);
      this.useFirebase = false;
      // Try again after a short delay in case Firebase is still loading
      setTimeout(() => {
        try {
          if (typeof firebase !== 'undefined' && firebase.firestore) {
            this.db = firebase.firestore();
            this.useFirebase = true;
            console.log('✅ Firebase Firestore initialized (retry successful)');
          }
        } catch (retryError) {
          console.warn('⚠️ Firebase retry also failed. Using localStorage only.');
        }
      }, 500);
    }
  }

  // Record when user accepts an optimization
  async recordOptimizationAttempt(data) {
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
      originalGoals: data.originalGoals.map(g => {
        const nowYear = new Date().getFullYear();
        return {
          name: g.name || 'Unknown Goal',
          type: this.classifyGoalType(g.name),
          priority: g.priority || 'Medium',
          targetAmount: g.fv || 0,
          yearsLeft: g.yearsLeft || 0,
          requiredSIP: g.sip || 0,
          targetYear: g.targetYear || (nowYear + (g.yearsLeft || 0))
        };
      }),

      // Optimization parameters applied
      optimizationApplied: {
        stepUpIncreased: data.stepUpBefore !== data.stepUpAfter,
        stepUpBefore: data.stepUpBefore,
        stepUpAfter: data.stepUpAfter,

        goalAdjustments: data.goals.map((g, idx) => {
          const original = data.originalGoals[idx] || {};
          return {
            goalName: g.name || 'Unknown Goal',
            goalType: this.classifyGoalType(g.name),
            priority: g.priority || 'Medium',

            // What changed?
            amountReductionPercent: this.calcReduction(original.fv || 0, g.fv || 0),
            tenureExtensionYears: (g.yearsLeft || 0) - (original.yearsLeft || 0),
            sipReductionPercent: this.calcReduction(original.sip || 0, g.sip || 0),

            // Before and after values
            originalAmount: original.fv || 0,
            optimizedAmount: g.fv || 0,
            originalSIP: original.sip || 0,
            optimizedSIP: g.sip || 0,
            originalYearsLeft: original.yearsLeft || 0,
            optimizedYearsLeft: g.yearsLeft || 0
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

    await this.saveRecord(record);
    console.log('Optimization attempt recorded:', record.optimizationId);
    return record.optimizationId;
  }

  // Track user acceptance/rejection
  async recordUserDecision(optimizationId, accepted, feedback = null) {
    const records = await this.getAllRecords();
    const record = records.find(r => r.optimizationId === optimizationId);

    if (record) {
      record.userAccepted = accepted;
      record.userFeedback = feedback;
      record.decisionTimestamp = Date.now();

      if (accepted) {
        record.outcome.planStarted = true;
      }

      await this.updateRecord(record);
      console.log(`User decision recorded: ${accepted ? 'ACCEPTED' : 'REJECTED'}`);
    }
  }

  // Track ongoing progress (called monthly)
  async recordMonthlyProgress(userId, month, data) {
    const activeOptimizations = await this.getUserOptimizations(userId);

    for (const opt of activeOptimizations) {
      if (opt.outcome.planAbandoned) continue;

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

      await this.updateRecord(opt);
    }
  }

  // Track abandonment
  async recordPlanAbandonment(optimizationId, reason) {
    const record = await this.getRecord(optimizationId);
    if (record) {
      record.outcome.planAbandoned = true;
      record.outcome.abandonmentReason = reason;
      record.abandonmentTimestamp = Date.now();
      await this.updateRecord(record);
      console.log('Plan abandonment recorded:', reason);
    }
  }

  // Simple outcome update (for test data generation)
  async recordOutcomeUpdate(optimizationId, outcomeData) {
    const record = await this.getRecord(optimizationId);
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

      await this.updateRecord(record);
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
    return '200k+';
  }

  calcReduction(original, optimized) {
    if (original === 0) return 0;
    return ((original - optimized) / original) * 100;
  }

  getTargetMonth(optimization, goalName) {
    const goal = optimization.originalGoals.find(g => g.name === goalName);
    return goal ? goal.yearsLeft * 12 : 0;
  }

  getUserId() {
    let userId = localStorage.getItem('we_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('we_user_id', userId);
    }
    return userId;
  }

  generateId() {
    return 'opt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Helper: Remove undefined values from object (Firestore doesn't allow undefined)
  sanitizeForFirestore(obj) {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeForFirestore(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (value !== undefined) {
            sanitized[key] = this.sanitizeForFirestore(value);
          }
        }
      }
      return sanitized;
    }
    
    return obj;
  }

  // Storage methods - Firebase or localStorage
  async saveRecord(record) {
    if (this.useFirebase) {
      try {
        // Sanitize record to remove undefined values before saving to Firestore
        const sanitizedRecord = this.sanitizeForFirestore(record);
        await this.db.collection(this.collectionName).doc(record.optimizationId).set(sanitizedRecord);
        console.log('✅ Saved to Firestore:', record.optimizationId);
      } catch (e) {
        console.error('❌ Firestore save failed, using localStorage fallback:', e);
        this.saveToLocalStorage(record);
      }
    } else {
      this.saveToLocalStorage(record);
    }
  }

  async updateRecord(record) {
    if (this.useFirebase) {
      try {
        await this.db.collection(this.collectionName).doc(record.optimizationId).set(record);
      } catch (e) {
        console.error('❌ Firestore update failed, using localStorage fallback:', e);
        this.updateInLocalStorage(record);
      }
    } else {
      this.updateInLocalStorage(record);
    }
  }

  async getRecord(optimizationId) {
    if (this.useFirebase) {
      try {
        const doc = await this.db.collection(this.collectionName).doc(optimizationId).get();
        return doc.exists ? doc.data() : null;
      } catch (e) {
        console.error('❌ Firestore get failed, using localStorage fallback:', e);
        return this.getFromLocalStorage(optimizationId);
      }
    } else {
      return this.getFromLocalStorage(optimizationId);
    }
  }

  async getAllRecords() {
    if (this.useFirebase) {
      try {
        const snapshot = await this.db.collection(this.collectionName).get();
        const records = [];
        snapshot.forEach(doc => {
          records.push(doc.data());
        });
        console.log(`✅ Loaded ${records.length} records from Firestore`);
        return records;
      } catch (e) {
        console.error('❌ Firestore getAllRecords failed, using localStorage fallback:', e);
        return this.getAllFromLocalStorage();
      }
    } else {
      return this.getAllFromLocalStorage();
    }
  }

  async getUserOptimizations(userId) {
    const records = await this.getAllRecords();
    return records.filter(r => r.userId === userId);
  }

  // Get statistics
  getStatistics() {
    // This needs to be async now, but keeping sync for compatibility
    // Will be called with await in updated code
    return this.getStatisticsAsync();
  }

  async getStatisticsAsync() {
    const records = await this.getAllRecords();
    const acceptedRecords = records.filter(r => r.userAccepted === true);
    const successfulRecords = acceptedRecords.filter(r =>
      !r.outcome.planAbandoned && r.outcome.monthsFollowed >= 6
    );

    return {
      totalOptimizations: records.length,
      acceptedOptimizations: acceptedRecords.length,
      rejectedOptimizations: records.filter(r => r.userAccepted === false).length,
      successfulPlans: successfulRecords.length,
      acceptanceRate: records.length > 0 ? (acceptedRecords.length / records.length * 100).toFixed(1) : 0,
      successRate: acceptedRecords.length > 0 ? (successfulRecords.length / acceptedRecords.length * 100).toFixed(1) : 0,
      averageMonthsFollowed: successfulRecords.length > 0
        ? (successfulRecords.reduce((sum, r) => sum + r.outcome.monthsFollowed, 0) / successfulRecords.length).toFixed(1)
        : 0
    };
  }

  async exportForMLTraining() {
    const records = await this.getAllRecords();
    const trainingRecords = records.filter(r =>
      r.userAccepted === true &&
      r.outcome.monthsFollowed >= 3 &&
      !r.outcome.planAbandoned
    );

    return {
      exportDate: new Date().toISOString(),
      recordCount: trainingRecords.length,
      totalRecords: records.length,
      records: trainingRecords
    };
  }

  async clearAllData() {
    if (this.useFirebase) {
      try {
        const snapshot = await this.db.collection(this.collectionName).get();
        const batch = this.db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('✅ Cleared all data from Firestore');
        return true;
      } catch (e) {
        console.error('❌ Firestore clear failed:', e);
        return false;
      }
    } else {
      localStorage.removeItem(this.storageKey);
      return true;
    }
  }

  // LocalStorage fallback methods
  saveToLocalStorage(record) {
    const records = this.getAllFromLocalStorage();
    records.push(record);
    localStorage.setItem(this.storageKey, JSON.stringify(records));
  }

  updateInLocalStorage(record) {
    const records = this.getAllFromLocalStorage();
    const index = records.findIndex(r => r.optimizationId === record.optimizationId);
    if (index !== -1) {
      records[index] = record;
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    }
  }

  getFromLocalStorage(optimizationId) {
    const records = this.getAllFromLocalStorage();
    return records.find(r => r.optimizationId === optimizationId);
  }

  getAllFromLocalStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return [];
    }
  }
}

// Global instance - wait for DOM and Firebase to be ready
(function initializeOutcomeTracker() {
  if (typeof window === 'undefined') {
    return;
  }

  // Wait for DOM to be ready if needed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOutcomeTracker);
    return;
  }

  // Try to initialize
  try {
    window.outcomeTracker = new OptimizationOutcomeTracker();
    console.log('✅ Outcome Tracker initialized (Firebase)');
  } catch (e) {
    console.error('❌ Failed to initialize Outcome Tracker:', e);
    // Retry after a short delay
    setTimeout(() => {
      try {
        window.outcomeTracker = new OptimizationOutcomeTracker();
        console.log('✅ Outcome Tracker initialized (Firebase - retry)');
      } catch (retryError) {
        console.error('❌ Outcome Tracker initialization failed after retry:', retryError);
      }
    }, 500);
  }
})();
