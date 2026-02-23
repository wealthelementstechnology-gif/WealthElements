/**
 * Feature Extractor - Converts goals and user data into ML features
 * This prepares data for machine learning model training and prediction
 */

class FeatureExtractor {

  // Extract features for a specific goal
  extractGoalFeatures(goal, userProfile, allGoals, historicalData = []) {
    const features = {
      // Goal characteristics
      goal_type: this.encodeGoalType(goal.type || this.classifyGoalType(goal.name)),
      goal_priority: this.encodePriority(goal.priority),
      goal_amount: goal.fv || goal.targetAmount || 0,
      goal_amount_normalized: this.normalizeAmount(goal.fv || goal.targetAmount || 0, userProfile.monthlyIncome),
      years_to_goal: goal.yearsLeft || 0,
      required_sip: goal.sip || goal.requiredSIP || 0,
      sip_to_income_ratio: this.calcRatio(goal.sip || goal.requiredSIP || 0, userProfile.monthlyIncome),

      // User demographics
      user_age: userProfile.age || 30,
      user_age_group: this.encodeAgeGroup(userProfile.age || 30),
      user_income_group: this.encodeIncomeGroup(userProfile.monthlyIncome),
      family_status: this.encodeFamilyStatus(userProfile.familyStatus),
      risk_profile: this.encodeRiskProfile(userProfile.riskProfile),
      city_tier: this.encodeCityTier(userProfile.city),

      // Portfolio context
      total_goals: allGoals.length,
      high_priority_goals: allGoals.filter(g => (g.priority || 'Medium') === 'High').length,
      critical_goals: allGoals.filter(g => this.isCritical(this.classifyGoalType(g.name))).length,
      portfolio_concentration: this.calcConcentration(goal, allGoals),

      // Budget context
      budget_utilization: this.calcRatio(userProfile.totalRequiredSIP || 0, userProfile.investmentBudget || 1),
      budget_shortfall: Math.max(0, (userProfile.totalRequiredSIP || 0) - (userProfile.investmentBudget || 0)),
      budget_shortfall_percent: this.calcShortfallPercent(userProfile.totalRequiredSIP, userProfile.investmentBudget),
      savings_rate: this.calcRatio(userProfile.investmentBudget || 0, userProfile.monthlyIncome || 1),

      // Historical patterns (if available)
      user_past_flexibility: this.getUserFlexibilityScore(userProfile.userId, historicalData),
      similar_users_success_rate: this.getSimilarUsersSuccessRate(userProfile, goal.type || this.classifyGoalType(goal.name), historicalData),
      goal_typical_reduction: this.getTypicalReduction(goal.type || this.classifyGoalType(goal.name), historicalData),
      goal_typical_extension: this.getTypicalExtension(goal.type || this.classifyGoalType(goal.name), historicalData),

      // Time-based features
      is_near_term: (goal.yearsLeft || 0) <= 3 ? 1 : 0,
      is_medium_term: ((goal.yearsLeft || 0) > 3 && (goal.yearsLeft || 0) <= 10) ? 1 : 0,
      is_long_term: (goal.yearsLeft || 0) > 10 ? 1 : 0,

      // Market conditions (placeholder - can be enhanced with real data)
      market_condition: 0, // -1 = bear, 0 = neutral, 1 = bull
      interest_rate_environment: 0 // -1 = falling, 0 = stable, 1 = rising
    };

    // === INTERACTION FEATURES (Quick Win #3) ===
    // These capture relationships between features that the model can't learn independently

    // Age-Income Interaction: Younger high-earners are typically more flexible
    const ageGroup = this.encodeAgeGroup(userProfile.age || 30);
    const incomeGroup = this.encodeIncomeGroup(userProfile.monthlyIncome);
    features.age_income_interaction = (ageGroup * incomeGroup) / 9; // Normalize to 0-1 range (max is 3*3=9)

    // Goal-Risk Interaction: Aggressive investors more flexible on non-critical goals
    const goalTypeEncoded = this.encodeGoalType(goal.type || this.classifyGoalType(goal.name));
    const riskProfile = this.encodeRiskProfile(userProfile.riskProfile);
    const isCriticalGoal = this.isCritical(goal.type || this.classifyGoalType(goal.name)) ? 1 : 0;
    features.goal_risk_interaction = (riskProfile * (1 - isCriticalGoal)) / 2; // Normalize to 0-1 (max is 2*1=2)

    // Budget Stress Indicator: High stress = less flexibility
    const budgetShortfallPercent = this.calcShortfallPercent(userProfile.totalRequiredSIP, userProfile.investmentBudget);
    const savingsRate = this.calcRatio(userProfile.investmentBudget || 0, userProfile.monthlyIncome || 1);
    features.budget_stress = savingsRate > 0 ? Math.min(1.0, budgetShortfallPercent / savingsRate) : 0;

    return features;
  }

  // Classification and encoding methods
  classifyGoalType(goalName) {
    const name = (goalName || '').toLowerCase();
    if (name.includes('retire')) return 'retirement';
    if (name.includes('emergency')) return 'emergency';
    if (name.includes('marriage') || name.includes('wedding')) return 'marriage';
    if (name.includes('education') || name.includes('child') || name.includes('college')) return 'education';
    if (name.includes('house') || name.includes('home')) return 'house';
    if (name.includes('car') || name.includes('vehicle')) return 'vehicle';
    if (name.includes('vacation') || name.includes('travel')) return 'vacation';
    return 'other';
  }

  encodeGoalType(type) {
    const mapping = {
      'retirement': 0,
      'emergency': 1,
      'marriage': 2,
      'education': 3,
      'house': 4,
      'vehicle': 5,
      'vacation': 6,
      'other': 7
    };
    return mapping[type] || 7;
  }

  encodePriority(priority) {
    const mapping = { 'High': 2, 'Medium': 1, 'Low': 0 };
    return mapping[priority] || 1;
  }

  encodeAgeGroup(age) {
    if (age < 30) return 0;
    if (age < 40) return 1;
    if (age < 50) return 2;
    return 3;
  }

  encodeIncomeGroup(income) {
    if (income < 50000) return 0;
    if (income < 100000) return 1;
    if (income < 200000) return 2;
    return 3;
  }

  encodeFamilyStatus(status) {
    const mapping = { 'single': 0, 'married': 1, 'married_with_kids': 2 };
    return mapping[status] || 0;
  }

  encodeRiskProfile(profile) {
    const mapping = { 'conservative': 0, 'moderate': 1, 'aggressive': 2 };
    return mapping[profile] || 1;
  }

  encodeCityTier(city) {
    const tier1 = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad'];
    return tier1.includes((city || '').toLowerCase()) ? 1 : 0;
  }

  isCritical(goalType) {
    return ['retirement', 'emergency', 'marriage', 'education'].includes(goalType);
  }

  // Calculation methods
  normalizeAmount(amount, income) {
    if (!income || income === 0) return 0;
    return amount / (income * 12); // Normalize to annual income
  }

  calcRatio(numerator, denominator) {
    if (!denominator || denominator === 0) return 0;
    return Math.min(10, numerator / denominator); // Cap at 10x
  }

  calcShortfallPercent(required, budget) {
    if (!budget || budget === 0) return 0;
    return Math.max(0, ((required || 0) - budget) / budget);
  }

  calcConcentration(goal, allGoals) {
    const totalSIP = allGoals.reduce((sum, g) => sum + (g.sip || g.requiredSIP || 0), 0);
    if (totalSIP === 0) return 0;
    return (goal.sip || goal.requiredSIP || 0) / totalSIP;
  }

  // Historical data analysis methods
  getUserFlexibilityScore(userId, historicalData) {
    if (!historicalData || historicalData.length === 0) return 0.5;

    const userHistory = historicalData.filter(d => d.userId === userId && d.userAccepted);
    if (userHistory.length === 0) return 0.5; // Default neutral

    const avgReduction = userHistory.reduce((sum, h) => {
      const avgGoalReduction = h.optimizationApplied.goalAdjustments
        .reduce((s, g) => s + Math.abs(g.amountReductionPercent || 0), 0) / h.optimizationApplied.goalAdjustments.length;
      return sum + avgGoalReduction;
    }, 0) / userHistory.length;

    // Normalize: 0-20% reduction = 0.2, 20-40% = 0.5, 40%+ = 1.0
    return Math.min(1.0, avgReduction / 40);
  }

  getSimilarUsersSuccessRate(userProfile, goalType, historicalData) {
    if (!historicalData || historicalData.length === 0) return 0.7;

    const userAgeGroup = this.encodeAgeGroup(userProfile.age || 30);
    const userIncomeGroup = this.encodeIncomeGroup(userProfile.monthlyIncome || 0);

    const similarUsers = historicalData.filter(d => {
      const profileAge = typeof d.userProfile.ageGroup === 'string'
        ? this.getAgeFromGroup(d.userProfile.ageGroup)
        : d.userProfile.ageGroup;
      const profileIncome = typeof d.userProfile.incomeGroup === 'string'
        ? this.getIncomeFromGroup(d.userProfile.incomeGroup)
        : d.userProfile.incomeGroup;

      return this.encodeAgeGroup(profileAge) === userAgeGroup &&
        this.encodeIncomeGroup(profileIncome) === userIncomeGroup &&
        d.optimizationApplied.goalAdjustments.some(g => g.goalType === goalType);
    });

    if (similarUsers.length === 0) return 0.7; // Default

    const successfulUsers = similarUsers.filter(d =>
      d.outcome.planAbandoned === false &&
      d.outcome.monthsFollowed >= 12
    );

    return successfulUsers.length / similarUsers.length;
  }

  getTypicalReduction(goalType, historicalData) {
    if (!historicalData || historicalData.length === 0) return 0.15;

    const goalsOfType = historicalData.flatMap(d =>
      d.optimizationApplied.goalAdjustments.filter(g => g.goalType === goalType && d.userAccepted)
    );

    if (goalsOfType.length === 0) return 0.15; // Default 15%

    const avgReduction = goalsOfType.reduce((sum, g) => sum + Math.abs(g.amountReductionPercent || 0), 0) / goalsOfType.length;
    return avgReduction / 100; // Convert to 0-1 scale
  }

  getTypicalExtension(goalType, historicalData) {
    if (!historicalData || historicalData.length === 0) return 1;

    const goalsOfType = historicalData.flatMap(d =>
      d.optimizationApplied.goalAdjustments.filter(g => g.goalType === goalType && d.userAccepted)
    );

    if (goalsOfType.length === 0) return 1; // Default 1 year

    const avgExtension = goalsOfType.reduce((sum, g) => sum + (g.tenureExtensionYears || 0), 0) / goalsOfType.length;
    return avgExtension;
  }

  // Helper methods for parsing age/income groups
  getAgeFromGroup(ageGroup) {
    const mapping = {
      '18-24': 21, '25-29': 27, '30-34': 32, '35-39': 37,
      '40-44': 42, '45-49': 47, '50-54': 52, '55+': 57
    };
    return mapping[ageGroup] || 30;
  }

  getIncomeFromGroup(incomeGroup) {
    const mapping = {
      '0-30k': 25000, '30k-50k': 40000, '50k-75k': 62500,
      '75k-100k': 87500, '100k-150k': 125000, '150k-200k': 175000,
      '200k-300k': 250000, '300k+': 350000
    };
    return mapping[incomeGroup] || 50000;
  }

  // Convert features object to array (for TensorFlow.js)
  featuresToArray(features) {
    return [
      features.goal_type,
      features.goal_priority,
      features.goal_amount_normalized,
      features.years_to_goal,
      features.sip_to_income_ratio,
      features.user_age_group,
      features.user_income_group,
      features.family_status,
      features.risk_profile,
      features.total_goals,
      features.critical_goals,
      features.portfolio_concentration,
      features.budget_shortfall_percent,
      features.savings_rate,
      features.user_past_flexibility,
      features.similar_users_success_rate,
      features.is_near_term,
      features.is_medium_term,
      features.is_long_term,
      // Interaction features (Quick Win #3)
      features.age_income_interaction,
      features.goal_risk_interaction,
      features.budget_stress
    ];
  }

  // Get feature names (for debugging)
  getFeatureNames() {
    return [
      'goal_type', 'goal_priority', 'goal_amount_normalized', 'years_to_goal',
      'sip_to_income_ratio', 'user_age_group', 'user_income_group', 'family_status',
      'risk_profile', 'total_goals', 'critical_goals', 'portfolio_concentration',
      'budget_shortfall_percent', 'savings_rate', 'user_past_flexibility',
      'similar_users_success_rate', 'is_near_term', 'is_medium_term', 'is_long_term',
      'age_income_interaction', 'goal_risk_interaction', 'budget_stress'
    ];
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.featureExtractor = new FeatureExtractor();
  console.log('Feature Extractor initialized');
}
