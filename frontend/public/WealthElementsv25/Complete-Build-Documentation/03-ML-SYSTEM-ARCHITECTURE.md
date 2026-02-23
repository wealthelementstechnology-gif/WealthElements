# Machine Learning System - Complete Implementation Guide

## Table of Contents
1. [ML System Overview](#ml-system-overview)
2. [Architecture](#architecture)
3. [Feature Engineering](#feature-engineering)
4. [Model Architecture](#model-architecture)
5. [Training Process](#training-process)
6. [Prediction Flow](#prediction-flow)
7. [Outcome Tracking](#outcome-tracking)
8. [Code Implementation](#code-implementation)
9. [Integration Guide](#integration-guide)
10. [Testing & Validation](#testing--validation)

---

## 1. ML System Overview

### Purpose
The ML system predicts optimal constraint boundaries for goal optimization when a user's investment budget is insufficient to meet all financial goals.

### What It Predicts
Given a financial goal and user profile, the ML model predicts:
1. **Max Amount Reduction**: How much the goal amount can be reduced (0-70%)
2. **Max Tenure Extension**: How many years the timeline can be extended (0-5 years)
3. **Confidence Score**: Model confidence in the prediction (0-1)

### Example Scenario
```
User Goal: Buy a house worth ₹50 lakhs in 10 years
User Budget: Insufficient for required SIP of ₹25,000/month

ML Predicts:
- Max Amount Reduction: 20% (can reduce to ₹40 lakhs)
- Max Tenure Extension: 2 years (can extend to 12 years)
- Confidence: 0.85 (85% confident)
```

### Fallback Strategy
If ML model is not loaded or has low confidence, the system falls back to **rule-based constraints**:

```javascript
const ruleBasedConstraints = {
  'emergency': { maxReduction: 30%, maxExtension: 1 year },
  'retirement': { maxReduction: 20%, maxExtension: 1 year },
  'marriage': { maxReduction: 25%, maxExtension: 1 year },
  'education': { maxReduction: 25%, maxExtension: 1 year },
  'other': { maxReduction: 50%, maxExtension: 5 years }
};
```

---

## 2. Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│              (Step 6: Goal Optimization)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  ML Integration Layer                    │
│               (step6-ml-integration.js)                  │
│  • Collect user feedback                                │
│  • Trigger predictions                                  │
│  • Handle user acceptance/rejection                     │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│  ML Model        │   │  Outcome Tracker │
│  (ml-model.js)   │   │  (outcome-       │
│                  │   │   tracker.js)    │
│  • Predict       │   │  • Store data    │
│  • Train         │   │  • Track results │
│  • Evaluate      │   │  • Export for ML │
└────────┬─────────┘   └──────────────────┘
         │
         ▼
┌──────────────────┐
│ Feature          │
│ Extractor        │
│ (ml-features.js) │
│                  │
│  • Extract 22    │
│    features      │
│  • Encode data   │
│  • Normalize     │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│  TensorFlow.js   │
│  (External)      │
│                  │
│  • Neural network│
│  • Training      │
│  • Prediction    │
└──────────────────┘
```

### Data Flow

```
1. User enters goals → 2. Budget insufficient detected
                       ↓
3. Feature Extractor extracts 22 features from:
   - Goal properties (type, amount, timeline, priority)
   - User demographics (age, income, family, risk)
   - Portfolio context (total goals, budget utilization)
   - Historical patterns (if available)
                       ↓
4. ML Model predicts constraints OR fallback to rules
                       ↓
5. Optimization algorithm applies constraints
                       ↓
6. User reviews optimized goals
                       ↓
7. User accepts/rejects → Outcome Tracker records decision
                       ↓
8. (Future) Track monthly progress → Update outcome
                       ↓
9. (When enough data) Retrain model with new outcomes
```

---

## 3. Feature Engineering

### 22 Features Extracted

#### Category 1: Goal Characteristics (7 features)
```javascript
{
  goal_type: 0-7,                    // Encoded: retirement=0, emergency=1, etc.
  goal_priority: 0-2,                // High=2, Medium=1, Low=0
  goal_amount: number,               // Raw amount (e.g., 5000000)
  goal_amount_normalized: number,    // Normalized to annual income
  years_to_goal: number,             // Timeline in years
  required_sip: number,              // Monthly SIP needed
  sip_to_income_ratio: number        // SIP / Monthly Income
}
```

**Goal Type Encoding**:
```javascript
const goalTypeMapping = {
  'retirement': 0,
  'emergency': 1,
  'marriage': 2,
  'education': 3,
  'house': 4,
  'vehicle': 5,
  'vacation': 6,
  'other': 7
};
```

**Classification Logic**:
```javascript
function classifyGoalType(goalName) {
  const name = goalName.toLowerCase();
  if (name.includes('retire')) return 'retirement';
  if (name.includes('emergency')) return 'emergency';
  if (name.includes('marriage') || name.includes('wedding')) return 'marriage';
  if (name.includes('education') || name.includes('child')) return 'education';
  if (name.includes('house') || name.includes('home')) return 'house';
  if (name.includes('car') || name.includes('vehicle')) return 'vehicle';
  if (name.includes('vacation') || name.includes('travel')) return 'vacation';
  return 'other';
}
```

---

#### Category 2: User Demographics (6 features)
```javascript
{
  user_age: number,                  // Actual age (e.g., 32)
  user_age_group: 0-3,               // <30=0, 30-39=1, 40-49=2, 50+=3
  user_income_group: 0-3,            // <50k=0, 50-100k=1, 100-200k=2, 200k+=3
  family_status: 0-2,                // single=0, married=1, married_with_kids=2
  risk_profile: 0-2,                 // conservative=0, moderate=1, aggressive=2
  city_tier: 0-1                     // Tier 1 cities=1, others=0
}
```

**Age Group Encoding**:
```javascript
function encodeAgeGroup(age) {
  if (age < 30) return 0;
  if (age < 40) return 1;
  if (age < 50) return 2;
  return 3;
}
```

**Income Group Encoding**:
```javascript
function encodeIncomeGroup(income) {
  if (income < 50000) return 0;
  if (income < 100000) return 1;
  if (income < 200000) return 2;
  return 3;
}
```

**Tier 1 Cities**:
```javascript
const tier1Cities = [
  'mumbai', 'delhi', 'bangalore', 'hyderabad',
  'chennai', 'kolkata', 'pune', 'ahmedabad'
];
```

---

#### Category 3: Portfolio Context (4 features)
```javascript
{
  total_goals: number,               // Total number of goals
  high_priority_goals: number,       // Count of "High" priority goals
  critical_goals: number,            // Count of retirement/emergency/marriage/education
  portfolio_concentration: 0-1       // This goal's SIP / Total SIP
}
```

**Critical Goals**:
```javascript
const criticalGoalTypes = ['retirement', 'emergency', 'marriage', 'education'];
```

---

#### Category 4: Budget Context (4 features)
```javascript
{
  budget_utilization: number,        // Total Required SIP / Investment Budget
  budget_shortfall: number,          // Max(0, Required - Budget)
  budget_shortfall_percent: number,  // (Required - Budget) / Budget
  savings_rate: number               // Investment Budget / Monthly Income
}
```

---

#### Category 5: Historical Patterns (4 features)
```javascript
{
  user_past_flexibility: 0-1,        // How flexible user was in past (if data exists)
  similar_users_success_rate: 0-1,   // Success rate of similar users
  goal_typical_reduction: 0-1,       // Average reduction for this goal type
  goal_typical_extension: number     // Average extension for this goal type (years)
}
```

**Note**: These default to neutral values (0.5, 0.7, 0.15, 1) when no historical data exists.

---

#### Category 6: Time-Based Flags (3 features)
```javascript
{
  is_near_term: 0 or 1,              // Timeline ≤ 3 years
  is_medium_term: 0 or 1,            // Timeline 4-10 years
  is_long_term: 0 or 1               // Timeline > 10 years
}
```

---

#### Category 7: Interaction Features (3 features)
These capture relationships between features:

```javascript
{
  age_income_interaction: 0-1,       // (age_group × income_group) / 9
                                     // Younger high-earners are more flexible

  goal_risk_interaction: 0-1,        // (risk_profile × is_non_critical) / 2
                                     // Aggressive investors more flexible on non-critical goals

  budget_stress: 0-1                 // shortfall_percent / savings_rate
                                     // High stress = less flexibility
}
```

**Why Interaction Features?**
Neural networks can learn these relationships, but explicitly providing them helps:
- Faster training
- Better accuracy with limited data
- More interpretable predictions

---

### Feature Array Format

Features are converted to a flat array for TensorFlow:

```javascript
const featureArray = [
  goal_type,                    // 0
  goal_priority,                // 1
  goal_amount_normalized,       // 2
  years_to_goal,                // 3
  sip_to_income_ratio,          // 4
  user_age_group,               // 5
  user_income_group,            // 6
  family_status,                // 7
  risk_profile,                 // 8
  total_goals,                  // 9
  critical_goals,               // 10
  portfolio_concentration,      // 11
  budget_shortfall_percent,     // 12
  savings_rate,                 // 13
  user_past_flexibility,        // 14
  similar_users_success_rate,   // 15
  is_near_term,                 // 16
  is_medium_term,               // 17
  is_long_term,                 // 18
  age_income_interaction,       // 19
  goal_risk_interaction,        // 20
  budget_stress                 // 21
];  // Total: 22 features
```

---

## 4. Model Architecture

### Neural Network Design

```
Input Layer (22 features)
    ↓
Batch Normalization
    ↓
Dense Layer (64 neurons, ReLU)
    ↓
Dropout (20%)
    ↓
Dense Layer (32 neurons, ReLU)
    ↓
Dropout (20%)
    ↓
Dense Layer (16 neurons, ReLU)
    ↓
Output Layer (3 neurons, Sigmoid)
    ↓
[maxAmountReduction, maxTenureExtension, confidence]
```

### Layer Details

**1. Batch Normalization**
```javascript
tf.layers.batchNormalization({ inputShape: [22] })
```
- Normalizes input features to mean=0, std=1
- Speeds up training
- Improves stability

**2. Dense Layer 1 (64 neurons)**
```javascript
tf.layers.dense({
  units: 64,
  activation: 'relu',
  kernelInitializer: 'heNormal',
  kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
})
```
- **ReLU activation**: f(x) = max(0, x)
- **He Normal initialization**: Optimal for ReLU
- **L2 regularization**: Prevents overfitting (penalty = 0.001)

**3. Dropout Layer 1 (20%)**
```javascript
tf.layers.dropout({ rate: 0.2 })
```
- Randomly drops 20% of neurons during training
- Prevents overfitting
- Forces network to learn robust features

**4. Dense Layer 2 (32 neurons)**
- Same configuration as Layer 1, fewer neurons

**5. Dropout Layer 2 (20%)**
- Same as Dropout Layer 1

**6. Dense Layer 3 (16 neurons)**
```javascript
tf.layers.dense({
  units: 16,
  activation: 'relu',
  kernelInitializer: 'heNormal',
  kernelRegularizer: tf.regularizers.l2({ l2: 0.0005 })
})
```
- Smaller L2 penalty (0.0005) for final hidden layer

**7. Output Layer (3 neurons)**
```javascript
tf.layers.dense({
  units: 3,
  activation: 'sigmoid'
})
```
- **Sigmoid activation**: Maps output to 0-1 range
- **3 outputs**:
  - Output[0]: maxAmountReduction (0-1, interpreted as 0-70%)
  - Output[1]: maxTenureExtension (0-1, scaled to 0-5 years)
  - Output[2]: confidence (0-1)

---

### Why This Architecture?

**Progressive Narrowing (64 → 32 → 16)**
- Learns complex patterns first, then simplifies
- Prevents bottlenecks

**ReLU Activation**
- Fast to compute
- Avoids vanishing gradient problem
- Industry standard for hidden layers

**Dropout Regularization**
- Prevents co-adaptation of neurons
- Improves generalization
- 20% is optimal for most cases

**L2 Regularization**
- Penalizes large weights
- Prevents overfitting
- Gradually reduces in deeper layers

**Sigmoid Output**
- Constrains outputs to valid ranges
- Interpretable as probabilities/percentages

---

## 5. Training Process

### Training Configuration

```javascript
const trainingConfig = {
  optimizer: tf.train.adam(0.001),     // Adam optimizer, learning rate = 0.001
  loss: 'meanSquaredError',            // MSE loss function
  metrics: ['mae'],                    // Mean Absolute Error for monitoring
  epochs: 100,                         // Max 100 epochs
  batchSize: 32,                       // 32 samples per batch
  validationSplit: 0.2,                // 20% data for validation
  shuffle: true                        // Shuffle data each epoch
};
```

### Optimizer: Adam

**Why Adam?**
- Adaptive learning rate for each parameter
- Momentum + RMSprop combined
- Fast convergence
- Industry standard

**Learning Rate: 0.001**
- Standard starting point
- Can be tuned if needed

---

### Loss Function: Mean Squared Error (MSE)

```
MSE = (1/n) × Σ(predicted - actual)²

For our 3 outputs:
MSE = (1/n) × [
  (pred_reduction - actual_reduction)² +
  (pred_extension - actual_extension)² +
  (pred_confidence - actual_confidence)²
]
```

**Why MSE?**
- Suitable for regression tasks
- Penalizes large errors more heavily
- Smooth gradient for optimization

---

### Early Stopping

Prevents overfitting by stopping when validation loss stops improving:

```javascript
const earlyStopping = {
  patience: 15,                        // Wait 15 epochs for improvement
  monitorMetric: 'val_loss',           // Monitor validation loss
  restoreBestWeights: true             // Restore best weights when stopping
};
```

**How It Works**:
```
Epoch 1: val_loss = 0.050 → Save weights (best so far)
Epoch 2: val_loss = 0.045 → Save weights (improved!)
Epoch 3: val_loss = 0.046 → No improvement (patience = 1)
Epoch 4: val_loss = 0.047 → No improvement (patience = 2)
...
Epoch 18: val_loss = 0.055 → No improvement (patience = 15) → STOP!
Restore weights from Epoch 2 (val_loss = 0.045)
```

---

### Training Data Preparation

**Input Data**:
```javascript
// From outcome tracker records
const trainingData = [
  {
    features: [22 feature values],
    labels: [
      amountReduction / 100,           // 0-1 scale
      tenureExtension / 5,             // 0-1 scale (max 5 years)
      confidence                       // 0-1 scale (based on follow-through)
    ]
  },
  // ... more samples
];
```

**Confidence Calculation**:
```javascript
const confidence = Math.min(1.0, monthsFollowed / 36);

// Examples:
// 3 months followed → confidence = 0.08 (low)
// 12 months followed → confidence = 0.33 (medium)
// 36+ months followed → confidence = 1.0 (high)
```

**Only Use Successful Optimizations**:
```javascript
const validSamples = records.filter(r =>
  r.userAccepted === true &&           // User accepted the optimization
  !r.outcome.planAbandoned &&          // User didn't abandon the plan
  r.outcome.monthsFollowed >= 3        // Followed for at least 3 months
);
```

---

### Training Process Flow

```javascript
async function trainModel(trainingData) {
  // 1. Check minimum data requirement
  if (trainingData.length < 50) {
    throw new Error('Need at least 50 samples to train');
  }

  // 2. Prepare tensors
  const inputs = tf.tensor2d(inputsArray);   // Shape: [N, 22]
  const outputs = tf.tensor2d(outputsArray); // Shape: [N, 3]

  // 3. Define model architecture
  const model = tf.sequential({
    layers: [
      tf.layers.batchNormalization({ inputShape: [22] }),
      tf.layers.dense({ units: 64, activation: 'relu', ... }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 32, activation: 'relu', ... }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 16, activation: 'relu', ... }),
      tf.layers.dense({ units: 3, activation: 'sigmoid' })
    ]
  });

  // 4. Compile model
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['mae']
  });

  // 5. Train model with early stopping
  const history = await model.fit(inputs, outputs, {
    epochs: 100,
    batchSize: 32,
    validationSplit: 0.2,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: loss=${logs.loss.toFixed(4)}, val_loss=${logs.val_loss.toFixed(4)}`);
        // Early stopping logic here
      }
    }
  });

  // 6. Save model to localStorage
  await model.save('localstorage://constraint-predictor-model');

  // 7. Clean up tensors
  inputs.dispose();
  outputs.dispose();

  return model;
}
```

---

## 6. Prediction Flow

### Step-by-Step Process

```javascript
async function predictConstraints(goal, userProfile, allGoals) {
  // 1. Check if model is loaded
  if (!modelLoaded) {
    return ruleBasedConstraints(goal);  // Fallback
  }

  // 2. Extract features
  const features = featureExtractor.extractGoalFeatures(
    goal,
    userProfile,
    allGoals,
    historicalData
  );

  // 3. Convert to array
  const featureArray = featureExtractor.featuresToArray(features);
  // featureArray = [22 numbers]

  // 4. Create tensor (shape: [1, 22])
  const inputTensor = tf.tensor2d([featureArray], [1, 22]);

  // 5. Predict
  const prediction = model.predict(inputTensor);

  // 6. Extract values
  const values = await prediction.data();
  // values = Float32Array([0.25, 0.4, 0.85])

  // 7. Clean up tensors
  inputTensor.dispose();
  prediction.dispose();

  // 8. Post-process outputs
  const result = {
    maxAmountReduction: Math.min(0.70, Math.max(0.05, values[0])),  // Clamp to 5-70%
    maxTenureExtension: Math.min(5, Math.max(0, Math.round(values[1] * 5))),  // Scale to 0-5 years
    confidence: Math.min(1.0, Math.max(0.0, values[2])),  // Clamp to 0-1
    source: 'ml_model',
    modelVersion: '1.0'
  };

  // 9. Fallback if low confidence
  if (result.confidence < 0.7) {
    console.warn('Low confidence, using rule-based fallback');
    return ruleBasedConstraints(goal);
  }

  return result;
}
```

---

### Prediction Example

**Input**:
```javascript
const goal = {
  name: "Child's Education",
  type: "education",
  priority: "High",
  targetAmount: 3000000,
  yearsLeft: 10,
  requiredSIP: 15000
};

const userProfile = {
  age: 35,
  monthlyIncome: 120000,
  familyStatus: 'married_with_kids',
  riskProfile: 'moderate',
  investmentBudget: 40000,
  totalRequiredSIP: 55000  // Total for all goals
};

const allGoals = [goal, retirementGoal, emergencyGoal];
```

**Feature Extraction**:
```javascript
{
  goal_type: 3,                        // education
  goal_priority: 2,                    // High
  goal_amount_normalized: 2.08,        // 3M / (120k × 12)
  years_to_goal: 10,
  sip_to_income_ratio: 0.125,          // 15k / 120k
  user_age_group: 1,                   // 30-39
  user_income_group: 2,                // 100-200k
  family_status: 2,                    // married_with_kids
  risk_profile: 1,                     // moderate
  total_goals: 3,
  critical_goals: 2,                   // education + emergency
  portfolio_concentration: 0.27,       // 15k / 55k
  budget_shortfall_percent: 0.375,     // (55k - 40k) / 40k
  savings_rate: 0.33,                  // 40k / 120k
  // ... other features
}
```

**Model Prediction**:
```javascript
// Raw model output (after sigmoid):
values = [0.23, 0.35, 0.88]

// Post-processed result:
{
  maxAmountReduction: 0.23,            // 23% (can reduce from ₹30L to ₹23.1L)
  maxTenureExtension: 2,               // 2 years (can extend from 10 to 12 years)
  confidence: 0.88,                    // 88% confident
  source: 'ml_model'
}
```

**Application**:
```javascript
// Optimization can reduce goal by up to 23% OR extend by up to 2 years
const optimizedGoal = {
  targetAmount: 3000000 * (1 - 0.15),  // Reduce by 15% (within 23% limit)
  yearsLeft: 11,                        // Extend by 1 year (within 2 year limit)
  requiredSIP: calculateRequiredSIP(2550000, expectedReturn, 11)
};
```

---

## 7. Outcome Tracking

### Data Lifecycle

```
1. Optimization Attempted
   ↓
   Record: optimizationId, goals, user profile, constraints applied
   Status: userAccepted = null

2. User Decision
   ↓
   Update: userAccepted = true/false, userFeedback

3. Plan Started (if accepted)
   ↓
   Update: outcome.planStarted = true

4. Monthly Progress Tracking
   ↓
   Update: outcome.monthsFollowed++, outcome.actualSIPsPaid[]

5. Goal Achievement or Abandonment
   ↓
   Update: outcome.goalsAchieved[] OR outcome.planAbandoned = true

6. Export for ML Training
   ↓
   Filter: userAccepted && !planAbandoned && monthsFollowed >= 3
   Train model with successful outcomes
```

---

### Record Structure

```javascript
const optimizationRecord = {
  // Identifiers
  optimizationId: "opt_1704067200000_abc123",
  timestamp: 1704067200000,
  userId: "user_1704067200000_xyz789",

  // User profile (anonymized)
  userProfile: {
    ageGroup: "30-34",
    incomeGroup: "100k-150k",
    city: "bangalore",
    familyStatus: "married_with_kids",
    riskProfile: "moderate",
    monthlyIncome: 120000,
    monthlyExpenses: 80000,
    investmentBudget: 40000
  },

  // Original goals (before optimization)
  originalGoals: [
    {
      name: "Child's Education",
      type: "education",
      priority: "High",
      targetAmount: 3000000,
      yearsLeft: 10,
      requiredSIP: 15000,
      targetYear: 2034
    },
    // ... more goals
  ],

  // Optimization applied
  optimizationApplied: {
    stepUpIncreased: false,
    stepUpBefore: 5,
    stepUpAfter: 5,
    goalAdjustments: [
      {
        goalName: "Child's Education",
        goalType: "education",
        priority: "High",
        amountReductionPercent: 15,      // Reduced by 15%
        tenureExtensionYears: 1,         // Extended by 1 year
        sipReductionPercent: 12,
        originalAmount: 3000000,
        optimizedAmount: 2550000,
        originalSIP: 15000,
        optimizedSIP: 13200,
        originalYearsLeft: 10,
        optimizedYearsLeft: 11
      },
      // ... more adjustments
    ]
  },

  // Budget context
  budgetContext: {
    monthlyIncome: 120000,
    monthlyExpenses: 80000,
    investmentBudget: 40000,
    originalTotalSIP: 55000,
    optimizedTotalSIP: 39800,
    budgetUtilization: 0.995,            // 39800 / 40000
    shortfallResolved: true
  },

  // User decision (updated later)
  userAccepted: true,                    // User clicked "Accept"
  userFeedback: "Looks reasonable",      // Optional text feedback
  decisionTimestamp: 1704067260000,

  // Outcome tracking (updated over time)
  outcome: {
    planStarted: true,
    monthsFollowed: 18,                  // Followed for 18 months
    actualSIPsPaid: [
      { month: 1, plannedAmount: 39800, actualAmount: 39800, adherenceRate: 1.0, timestamp: ... },
      { month: 2, plannedAmount: 39800, actualAmount: 38000, adherenceRate: 0.95, timestamp: ... },
      // ... more months
    ],
    goalsAchieved: [],
    planAbandoned: false,
    abandonmentReason: null
  }
};
```

---

### localStorage Storage

**Key**: `we_optimization_outcomes`

**Structure**:
```javascript
localStorage.setItem('we_optimization_outcomes', JSON.stringify([
  optimizationRecord1,
  optimizationRecord2,
  // ... all records
]));
```

**Retrieval**:
```javascript
const records = JSON.parse(localStorage.getItem('we_optimization_outcomes') || '[]');
```

---

### Statistics

```javascript
const stats = await outcomeTracker.getStatisticsAsync();

// Returns:
{
  totalOptimizations: 150,
  acceptedOptimizations: 120,
  rejectedOptimizations: 30,
  successfulPlans: 95,
  acceptanceRate: "80.0",              // 120 / 150 × 100
  successRate: "79.2",                 // 95 / 120 × 100
  averageMonthsFollowed: "14.5"
}
```

---

## 8. Code Implementation

### Complete ML Integration Example

```javascript
// ======================================
// FILE: step6-ml-integration.js
// ======================================

// When optimization is needed (budget shortfall detected)
async function handleOptimization(goals, userProfile, investmentBudget) {
  const originalGoals = JSON.parse(JSON.stringify(goals));  // Deep copy
  const optimizedGoals = [];

  // For each goal, get ML constraints
  for (let i = 0; i < goals.length; i++) {
    const goal = goals[i];

    // Predict constraints using ML
    const constraints = await window.mlModel.predictConstraints(
      goal,
      userProfile,
      goals,
      await window.outcomeTracker.getAllRecords()  // Historical data
    );

    console.log(`Constraints for ${goal.name}:`, constraints);

    // Apply optimization (reduce amount and/or extend tenure)
    const optimizedGoal = applyOptimization(goal, constraints, investmentBudget);
    optimizedGoals.push(optimizedGoal);
  }

  // Record the optimization attempt
  const optimizationId = await window.outcomeTracker.recordOptimizationAttempt({
    userAge: userProfile.age,
    monthlyIncome: userProfile.monthlyIncome,
    monthlyExpenses: userProfile.monthlyExpenses,
    investmentBudget: investmentBudget,
    familyStatus: userProfile.familyStatus,
    riskProfile: userProfile.riskProfile,
    city: userProfile.city,
    originalGoals: originalGoals,
    goals: optimizedGoals,
    stepUpBefore: 5,
    stepUpAfter: 5,
    originalTotalSIP: originalGoals.reduce((sum, g) => sum + g.sip, 0),
    optimizedTotalSIP: optimizedGoals.reduce((sum, g) => sum + g.sip, 0)
  });

  // Show results to user
  displayOptimizedGoals(optimizedGoals, originalGoals);

  // Wait for user decision
  const userAccepted = await getUserDecision();

  // Record decision
  await window.outcomeTracker.recordUserDecision(
    optimizationId,
    userAccepted,
    userFeedback
  );

  return { optimizedGoals, accepted: userAccepted };
}

// Apply optimization within constraints
function applyOptimization(goal, constraints, budget) {
  const maxReduction = constraints.maxAmountReduction;
  const maxExtension = constraints.maxTenureExtension;

  // Start with no reduction
  let reductionPercent = 0;
  let extensionYears = 0;

  // Calculate new SIP needed
  let newSIP = goal.sip;

  // If still over budget, reduce amount
  if (newSIP > budget) {
    reductionPercent = 0.10;  // Start with 10% reduction
    const newAmount = goal.fv * (1 - reductionPercent);
    newSIP = calculateRequiredSIP(newAmount, goal.expectedReturn, goal.yearsLeft);
  }

  // If still over budget, extend tenure
  if (newSIP > budget && maxExtension > 0) {
    extensionYears = 1;
    newSIP = calculateRequiredSIP(
      goal.fv * (1 - reductionPercent),
      goal.expectedReturn,
      goal.yearsLeft + extensionYears
    );
  }

  // Ensure within constraints
  reductionPercent = Math.min(reductionPercent, maxReduction);
  extensionYears = Math.min(extensionYears, maxExtension);

  return {
    ...goal,
    fv: goal.fv * (1 - reductionPercent),
    yearsLeft: goal.yearsLeft + extensionYears,
    sip: newSIP,
    optimizationApplied: {
      reductionPercent,
      extensionYears,
      constraints
    }
  };
}
```

---

### Training Trigger

```javascript
// Check if we have enough data to train
async function checkAndTrainModel() {
  const stats = await window.outcomeTracker.getStatisticsAsync();

  if (stats.acceptedOptimizations >= 50) {
    console.log('🎓 Sufficient data available. Trigger training?');

    const userConsent = confirm('We have collected enough data to improve predictions. Train the ML model now?');

    if (userConsent) {
      await trainMLModel();
    }
  }
}

async function trainMLModel() {
  const trainingData = await window.outcomeTracker.exportForMLTraining();

  console.log(`Training with ${trainingData.recordCount} samples...`);

  const result = await window.mlModel.trainModel(trainingData.records, {
    epochs: 100,
    batchSize: 32,
    validationSplit: 0.2,
    patience: 15,
    learningRate: 0.001,
    onProgress: (epoch, logs) => {
      updateTrainingUI(epoch, logs);
    }
  });

  console.log('✅ Training complete!', result.metadata);
  alert(`Model trained successfully!\nFinal loss: ${result.metadata.finalLoss.toFixed(4)}`);
}
```

---

## 9. Integration Guide

### Step 1: Include Scripts in HTML

```html
<!-- Step 6 HTML -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.0.0/dist/tf.min.js"></script>
<script src="ml-features.js"></script>
<script src="ml-model.js"></script>
<script src="outcome-tracker.js"></script>
<script src="step6-ml-integration.js"></script>
<script src="step6.js"></script>
```

**Load Order Matters**:
1. TensorFlow.js (external CDN)
2. Feature Extractor (ml-features.js)
3. ML Model (ml-model.js)
4. Outcome Tracker (outcome-tracker.js)
5. Integration Layer (step6-ml-integration.js)
6. Step 6 Logic (step6.js)

---

### Step 2: Initialize on Page Load

```javascript
// In step6.js
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for ML model to initialize
  await window.mlModel.initialize();

  // Check model status
  const modelInfo = window.mlModel.getModelInfo();
  console.log('Model Info:', modelInfo);

  if (modelInfo.fallbackMode) {
    console.log('⚠️ Using rule-based fallback (no ML model loaded)');
  } else {
    console.log('✅ ML model loaded successfully');
  }

  // Load user data and continue
  loadStep6Data();
});
```

---

### Step 3: Use ML in Optimization

```javascript
// In step6.js - optimization function
async function optimizeGoals() {
  const goals = getGoalsFromUI();
  const userProfile = getUserProfile();
  const budget = getInvestmentBudget();

  // Check if optimization needed
  const totalSIP = goals.reduce((sum, g) => sum + g.sip, 0);

  if (totalSIP <= budget) {
    console.log('✅ Budget sufficient, no optimization needed');
    saveAndProceed(goals);
    return;
  }

  console.log('⚠️ Budget shortfall detected. Optimizing...');

  // ML-powered optimization
  const result = await handleOptimization(goals, userProfile, budget);

  if (result.accepted) {
    saveAndProceed(result.optimizedGoals);
  } else {
    console.log('User rejected optimization');
    // Handle rejection (e.g., ask to increase budget)
  }
}
```

---

## 10. Testing & Validation

### Unit Tests

```javascript
// Test feature extraction
function testFeatureExtraction() {
  const goal = {
    name: "Retirement Fund",
    type: "retirement",
    priority: "High",
    targetAmount: 10000000,
    yearsLeft: 25,
    requiredSIP: 20000
  };

  const userProfile = {
    age: 35,
    monthlyIncome: 100000,
    familyStatus: 'married',
    riskProfile: 'moderate',
    city: 'mumbai',
    investmentBudget: 50000,
    totalRequiredSIP: 60000
  };

  const features = window.featureExtractor.extractGoalFeatures(
    goal,
    userProfile,
    [goal],
    []
  );

  console.assert(features.goal_type === 0, 'Retirement should encode to 0');
  console.assert(features.goal_priority === 2, 'High priority should encode to 2');
  console.assert(features.city_tier === 1, 'Mumbai should be tier 1');

  console.log('✅ Feature extraction tests passed');
}
```

---

### Model Prediction Tests

```javascript
async function testPrediction() {
  const goal = {
    name: "Child Education",
    type: "education",
    targetAmount: 3000000,
    yearsLeft: 10,
    requiredSIP: 15000
  };

  const userProfile = {
    age: 35,
    monthlyIncome: 120000,
    investmentBudget: 40000,
    totalRequiredSIP: 55000
  };

  const constraints = await window.mlModel.predictConstraints(
    goal,
    userProfile,
    [goal],
    []
  );

  console.assert(constraints.maxAmountReduction >= 0, 'Reduction should be non-negative');
  console.assert(constraints.maxAmountReduction <= 0.70, 'Reduction should not exceed 70%');
  console.assert(constraints.maxTenureExtension >= 0, 'Extension should be non-negative');
  console.assert(constraints.maxTenureExtension <= 5, 'Extension should not exceed 5 years');

  console.log('✅ Prediction tests passed', constraints);
}
```

---

### Integration Tests

```javascript
async function testFullOptimizationFlow() {
  // 1. Create test goals
  const goals = [
    { name: "Retirement", fv: 10000000, yearsLeft: 25, sip: 20000 },
    { name: "Child Education", fv: 3000000, yearsLeft: 10, sip: 15000 },
    { name: "House Purchase", fv: 5000000, yearsLeft: 8, sip: 25000 }
  ];

  const userProfile = {
    age: 35,
    monthlyIncome: 100000,
    investmentBudget: 40000
  };

  // 2. Trigger optimization
  const result = await handleOptimization(goals, userProfile, 40000);

  // 3. Verify optimized SIP within budget
  const totalOptimizedSIP = result.optimizedGoals.reduce((sum, g) => sum + g.sip, 0);
  console.assert(totalOptimizedSIP <= 40000, 'Total SIP should be within budget');

  console.log('✅ Integration test passed');
}
```

---

## Summary

The ML system provides:
1. **Intelligent constraint prediction** based on 22 engineered features
2. **Neural network** with 3 hidden layers (64-32-16 neurons)
3. **Graceful fallback** to rule-based system when ML unavailable
4. **Continuous learning** from user outcomes
5. **Privacy-focused** design (all data stays in browser)

**Key Files**:
- `ml-model.js`: TensorFlow.js model (486 lines)
- `ml-features.js`: Feature engineering (302 lines)
- `outcome-tracker.js`: Data collection (380 lines)

**Total Complexity**: HIGH (requires understanding of ML, feature engineering, and optimization)

**Next**: See [04-API-INTEGRATION.md](./04-API-INTEGRATION.md) for Mutual Fund API implementation.
