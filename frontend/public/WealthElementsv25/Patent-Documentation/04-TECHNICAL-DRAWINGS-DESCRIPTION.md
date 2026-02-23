# TECHNICAL DRAWINGS AND FLOWCHARTS DESCRIPTION

## FOR PATENT APPLICATION

*Note: This document describes the drawings that should be professionally prepared by a patent illustrator. The descriptions provided here can be used to create the actual drawings.*

---

## FIGURE 1: System Architecture Overview

### Description:
A block diagram showing the complete system architecture with all major components and data flow.

### Components to Include:

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INPUT INTERFACE                         │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────────┐      │
│  │ User Profile │  │ Goal Data   │  │ Investment Data   │      │
│  │ - Age        │  │ - Name      │  │ - Current Assets  │      │
│  │ - Income     │  │ - Type      │  │ - EMIs           │      │
│  │ - Expenses   │  │ - Amount    │  │ - Existing SIPs  │      │
│  │ - Family     │  │ - Timeline  │  │                   │      │
│  │ - Risk       │  │ - Priority  │  │                   │      │
│  └───────┬──────┘  └──────┬──────┘  └────────┬──────────┘      │
└──────────┼─────────────────┼──────────────────┼─────────────────┘
           │                 │                  │
           ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATA COLLECTION MODULE (101)                        │
│          Receives and validates all user inputs                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           FEATURE EXTRACTION ENGINE (102)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Extract 22+ Features:                                     │  │
│  │ • Goal Characteristics (6 features)                       │  │
│  │ • User Demographics (5 features)                          │  │
│  │ • Portfolio Context (7 features)                          │  │
│  │ • Historical Patterns (4 features)                        │  │
│  │ • Interaction Features (3 novel features) ⭐             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│          NEURAL NETWORK MODEL (103)                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Input Layer: [22 features] → Batch Normalization         │  │
│  │      ↓                                                    │  │
│  │ Hidden Layer 1: 64 neurons, ReLU, L2, Dropout            │  │
│  │      ↓                                                    │  │
│  │ Hidden Layer 2: 32 neurons, ReLU, L2, Dropout            │  │
│  │      ↓                                                    │  │
│  │ Hidden Layer 3: 16 neurons, ReLU, L2                     │  │
│  │      ↓                                                    │  │
│  │ Output Layer: 3 neurons, Sigmoid                         │  │
│  │ [Max Reduction, Max Extension, Confidence]               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           OPTIMIZATION ENGINE (104)                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Calculate Priority Scores                             │  │
│  │ 2. Sort Goals by Priority                                │  │
│  │ 3. Iteratively Adjust Goals                              │  │
│  │ 4. Apply ML-Predicted Constraints                        │  │
│  │ 5. Recalculate SIP Requirements                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         OPTIMIZED PLAN OUTPUT INTERFACE                          │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐         │
│  │ Before/After │  │ Savings     │  │ Confidence     │         │
│  │ Comparison   │  │ Achieved    │  │ Indicators     │         │
│  └──────────────┘  └─────────────┘  └────────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│        OUTCOME TRACKING MODULE (105)                             │
│  Records: Acceptance, Feedback, Adherence, Outcomes             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         MODEL TRAINING MODULE (106)                              │
│  Periodic Retraining Based on Accumulated Outcomes              │
│  ← Feedback Loop ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←          │
└─────────────────────────────────────────────────────────────────┘
```

**Figure 1 Legend:**
- Module 101: Data Collection Module
- Module 102: Feature Extraction Engine
- Module 103: Neural Network Model (TensorFlow.js)
- Module 104: Optimization Engine
- Module 105: Outcome Tracking Module
- Module 106: Model Training Module
- ⭐: Novel inventive features

---

## FIGURE 2: Feature Extraction Process Flowchart

### Description:
Detailed flowchart showing how raw user data is transformed into 22 machine learning features.

### Flowchart Steps:

```
START: User Input Data
  ├─ User Profile
  ├─ Goals Data
  └─ Investment Data
       │
       ▼
┌─────────────────────────────┐
│ GOAL CHARACTERISTICS        │
│ EXTRACTION                  │
├─────────────────────────────┤
│ 1. Classify Goal Type       │
│    (Text Analysis)          │
│ 2. Encode Type (0-7)        │
│ 3. Encode Priority (0-2)    │
│ 4. Normalize Amount         │
│    (Amount/Annual Income)   │
│ 5. Calculate Years Left     │
│ 6. Calculate SIP/Income     │
│ 7. Calculate Concentration  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ USER DEMOGRAPHICS           │
│ ENCODING                    │
├─────────────────────────────┤
│ 1. Encode Age Group (0-3)   │
│ 2. Encode Income Group(0-3) │
│ 3. Encode Family Status(0-2)│
│ 4. Encode Risk Profile(0-2) │
│ 5. Encode City Tier (0-1)   │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ PORTFOLIO CONTEXT           │
│ CALCULATION                 │
├─────────────────────────────┤
│ 1. Count Total Goals        │
│ 2. Count High Priority      │
│ 3. Count Critical Goals     │
│ 4. Budget Utilization %     │
│ 5. Budget Shortfall         │
│ 6. Shortfall Percentage     │
│ 7. Savings Rate             │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ HISTORICAL PATTERNS         │
│ ANALYSIS                    │
├─────────────────────────────┤
│ 1. User Flexibility Score   │
│    (from past behavior)     │
│ 2. Similar Users Success    │
│    (cohort analysis)        │
│ 3. Typical Goal Reduction   │
│    (goal type average)      │
│ 4. Typical Tenure Extension │
│    (goal type average)      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ ⭐ INTERACTION FEATURES     │
│ (NOVEL INVENTION)           │
├─────────────────────────────┤
│ 1. Age-Income Interaction   │
│    = (AgeGrp × IncGrp) / 9  │
│                             │
│ 2. Goal-Risk Interaction    │
│    = (Risk × (1-Critical))/2│
│                             │
│ 3. Budget Stress Indicator  │
│    = min(1, Shortfall/Save) │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ ASSEMBLE FEATURE VECTOR     │
│                             │
│ [f1, f2, f3, ... f22]       │
│ Shape: (1, 22)              │
└──────────┬──────────────────┘
           │
           ▼
      OUTPUT TO ML MODEL
```

**Figure 2 Legend:**
- ⭐: Novel inventive interaction features
- Bold boxes: Core processing steps
- Numbers: Sequential feature extraction order

---

## FIGURE 3: Neural Network Architecture Diagram

### Description:
Detailed layer-by-layer diagram of the neural network architecture showing neurons, connections, and activation functions.

### Network Structure:

```
INPUT: Feature Vector [22 features]
  │
  │  f1  f2  f3  ... f22
  │  ●   ●   ●   ... ●
  ▼  │   │   │   ... │
┌────────────────────────────────┐
│ BATCH NORMALIZATION LAYER      │
│ μ = mean(features)             │
│ σ = std(features)              │
│ x̂ = (x - μ) / σ               │
└────────┬───────────────────────┘
         │
         ▼
    ●   ●   ●  ... ●  (22 normalized inputs)
    │   │   │      │
    └───┴───┴──────┘  (Fully Connected)
         │
         ▼
┌────────────────────────────────┐
│ HIDDEN LAYER 1                 │
│ 64 neurons                     │
│ Activation: ReLU               │
│ Regularization: L2 (λ=0.001)   │
│                                │
│  ●  ●  ●  ●  ... ●  ●  ●      │ (64 neurons)
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ DROPOUT LAYER 1                │
│ Rate: 0.2 (20% dropout)        │
│ Random neuron deactivation     │
│                                │
│  ●  ●  ✕  ●  ... ●  ✕  ●      │
└────────┬───────────────────────┘
         │
         ▼  (Fully Connected)
┌────────────────────────────────┐
│ HIDDEN LAYER 2                 │
│ 32 neurons                     │
│ Activation: ReLU               │
│ Regularization: L2 (λ=0.001)   │
│                                │
│  ●  ●  ●  ●  ... ●  ●          │ (32 neurons)
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ DROPOUT LAYER 2                │
│ Rate: 0.2 (20% dropout)        │
│                                │
│  ●  ✕  ●  ●  ... ●  ●          │
└────────┬───────────────────────┘
         │
         ▼  (Fully Connected)
┌────────────────────────────────┐
│ HIDDEN LAYER 3                 │
│ 16 neurons                     │
│ Activation: ReLU               │
│ Regularization: L2 (λ=0.0005)  │
│                                │
│  ●  ●  ●  ●  ... ●              │ (16 neurons)
└────────┬───────────────────────┘
         │
         ▼  (Fully Connected)
┌────────────────────────────────┐
│ OUTPUT LAYER                   │
│ 3 neurons                      │
│ Activation: Sigmoid            │
│                                │
│     ●         ●         ●      │
│     │         │         │      │
│     │         │         │      │
│   Output1  Output2  Output3   │
│     │         │         │      │
└─────┼─────────┼─────────┼──────┘
      │         │         │
      ▼         ▼         ▼
  Max Amount  Max Tenure  Confidence
  Reduction   Extension   Score
  (0-0.70)    (0-1.0)     (0-1.0)
      │         │         │
      └─────────┴─────────┘
              │
              ▼
     PREDICTION OUTPUT
```

**Figure 3 Legend:**
- ●: Active neuron
- ✕: Dropped neuron (during training)
- ReLU: Rectified Linear Unit activation function
- L2: L2 regularization (weight decay)
- Sigmoid: Sigmoid activation function (output)

---

## FIGURE 4: Optimization Algorithm Flowchart

### Description:
Step-by-step flowchart of the iterative optimization algorithm that applies ML-predicted constraints.

### Algorithm Flow:

```
START
  │
  ▼
┌─────────────────────────────────────┐
│ INPUT:                              │
│ - User Goals[]                      │
│ - Investment Budget                 │
│ - ML Predicted Constraints{}        │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Calculate Total Required SIP        │
│ totalSIP = Σ(goal.requiredSIP)      │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Calculate Shortfall                 │
│ shortfall = totalSIP - budget       │
└──────────┬──────────────────────────┘
           │
           ▼
       ┌───┴───┐
       │shortfall│
       │  ≤ 0?  │
       └───┬───┘
           │
    ┌──────┴──────┐
   YES             NO
    │               │
    ▼               ▼
┌────────┐    ┌──────────────────────┐
│ RETURN │    │ FOR each goal:       │
│  No    │    │ Calculate Priority   │
│ Optim  │    │ Score:               │
│ Needed │    │ = basePriority       │
└────────┘    │ + criticalBonus(10)  │
              │ + mlConfidence×5     │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ SORT goals by        │
              │ Priority Score       │
              │ (Ascending Order)    │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Initialize:          │
              │ iteration = 0        │
              │ maxIter = 50         │
              │ currentShortfall =   │
              │   shortfall          │
              └──────────┬───────────┘
                         │
                         ▼
                    ┌────┴─────┐
                    │ WHILE    │
                    │shortfall>│
                    │100 AND   │
                    │iter<50?  │
                    └────┬─────┘
                         │
                  ┌──────┴─────┐
                 NO            YES
                  │              │
                  ▼              ▼
           ┌──────────┐   ┌──────────────────┐
           │  EXIT    │   │ madeProgress=FALSE│
           │  LOOP    │   └──────┬───────────┘
           └────┬─────┘          │
                │                ▼
                │         ┌──────────────────┐
                │         │ FOR goal IN      │
                │         │ sortedGoals:     │
                │         └──────┬───────────┘
                │                │
                │                ▼
                │         ┌──────────────────┐
                │         │ Get ML           │
                │         │ Constraints      │
                │         │ for this goal    │
                │         └──────┬───────────┘
                │                │
                │                ▼
                │            ┌───┴────┐
                │            │ML Conf │
                │            │ > 0.7? │
                │            └───┬────┘
                │                │
                │         ┌──────┴─────┐
                │        YES           NO
                │         │             │
                │         ▼             ▼
                │  ┌──────────────┐ ┌────────────┐
                │  │Try Tenure    │ │Try Amount  │
                │  │Extension     │ │Reduction   │
                │  │+1 year       │ │-2%         │
                │  └──────┬───────┘ └──────┬─────┘
                │         │                │
                │         └────────┬───────┘
                │                  │
                │                  ▼
                │           ┌──────────────┐
                │           │ Recalculate  │
                │           │ SIP with     │
                │           │ new params   │
                │           └──────┬───────┘
                │                  │
                │                  ▼
                │           ┌──────────────┐
                │           │ IF savings>0:│
                │           │ Apply change │
                │           │ Reduce       │
                │           │ shortfall    │
                │           │ madeProgress │
                │           │ = TRUE       │
                │           └──────┬───────┘
                │                  │
                │                  ▼
                │           ┌──────────────┐
                │           │ Continue     │
                │           │ to next goal │
                │           └──────┬───────┘
                │                  │
                │                  ▼
                │            ┌─────┴──────┐
                │            │ All goals  │
                │            │ processed? │
                │            └─────┬──────┘
                │                  │
                │           ┌──────┴───────┐
                │          YES            NO
                │           │              │
                │           ▼              │
                │    ┌──────────────┐     │
                │    │IF madeProgress│    │
                │    │= FALSE:      │     │
                │    │ BREAK        │     │
                │    │ELSE:         │     │
                │    │ iteration++  │     │
                │    │ Continue     │←────┘
                │    └──────┬───────┘
                │           │
                └───────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ IF shortfall │
                     │  still > 100:│
                     │ Suggest      │
                     │ Step-Up      │
                     │ Increase     │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ RETURN       │
                     │ Optimized    │
                     │ Goals[]      │
                     └──────────────┘
                            │
                            ▼
                          END
```

**Figure 4 Legend:**
- Diamond shapes: Decision points
- Rectangle shapes: Processing steps
- Arrows: Flow direction
- Bold text: Key algorithm parameters

---

## FIGURE 5: Training and Feedback Loop Diagram

### Description:
Diagram showing how the system learns from outcomes and retrains the model.

### Feedback Loop:

```
┌──────────────────────────────────────────────────────────────┐
│                    INITIAL DEPLOYMENT                         │
│                  (Rule-Based Fallback)                        │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ USER INTERACTION 1                                            │
│ ┌──────────────┐  ┌─────────────┐  ┌────────────────────┐   │
│ │ Optimization │→ │ User Sees   │→ │ User Accepts/      │   │
│ │ Performed    │  │ Results     │  │ Rejects            │   │
│ └──────────────┘  └─────────────┘  └──────┬─────────────┘   │
└───────────────────────────────────────────┼──────────────────┘
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────────┐
│ FEEDBACK COLLECTION                                           │
│ ┌──────────────┐  ┌─────────────┐  ┌────────────────────┐   │
│ │ Acceptance   │  │ Sentiment   │  │ Text Comments      │   │
│ │ Decision     │  │ (😊/🤔/😟)  │  │ (Optional)         │   │
│ └──────────────┘  └─────────────┘  └────────────────────┘   │
└───────────────────────────────────────────┼──────────────────┘
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────────┐
│ OUTCOME TRACKING                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Store in Database:                                       │ │
│ │ • User Profile                                           │ │
│ │ • Original Goals                                         │ │
│ │ • Optimization Applied                                   │ │
│ │ • ML Constraints Used                                    │ │
│ │ • Acceptance Decision                                    │ │
│ │ • Feedback Sentiment                                     │ │
│ │ • Timestamp                                              │ │
│ └──────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────┬──────────────────────┘
                                        │
                                        ▼
┌───────────────────────────────────────────────────────────────┐
│ LONG-TERM ADHERENCE MONITORING                                │
│ ┌──────────────┐  ┌─────────────┐  ┌────────────────────┐    │
│ │ Month 1      │  │ Month 3     │  │ Month 6, 12, 24... │    │
│ │ Follow-up    │  │ Check       │  │ Periodic Checks    │    │
│ └──────────────┘  └─────────────┘  └────────────────────┘    │
│                                                                │
│ Track: monthsFollowed, planAbandoned, goalsAchieved           │
└───────────────────────────────────────┬───────────────────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        │ Accumulate Outcome Records   │
                        └───────────────┬───────────────┘
                                        │
                                        ▼
                                  ┌─────┴──────┐
                                  │ Record     │
                                  │ Count      │
                                  │  ≥ 50?     │
                                  └─────┬──────┘
                                        │
                                 ┌──────┴──────┐
                                NO            YES
                                 │              │
                                 │              ▼
                        Continue │    ┌──────────────────┐
                        Collecting│    │ TRIGGER MODEL    │
                                 │    │ RETRAINING       │
                                 │    └─────────┬────────┘
                                 │              │
                                 │              ▼
                                 │    ┌──────────────────┐
                                 │    │ Filter Successful│
                                 │    │ Outcomes:        │
                                 │    │ • Accepted=TRUE  │
                                 │    │ • Abandoned=FALSE│
                                 │    │ • Followed ≥ 3mo │
                                 │    └─────────┬────────┘
                                 │              │
                                 │              ▼
                                 │    ┌──────────────────┐
                                 │    │ Extract Features │
                                 │    │ & Targets        │
                                 │    └─────────┬────────┘
                                 │              │
                                 │              ▼
                                 │    ┌──────────────────┐
                                 │    │ Train Neural Net │
                                 │    │ (100 epochs max, │
                                 │    │ early stop @15)  │
                                 │    └─────────┬────────┘
                                 │              │
                                 │              ▼
                                 │    ┌──────────────────┐
                                 │    │ Evaluate on      │
                                 │    │ Test Set         │
                                 │    └─────────┬────────┘
                                 │              │
                                 │              ▼
                                 │         ┌────┴─────┐
                                 │         │New Model │
                                 │         │ Better?  │
                                 │         └────┬─────┘
                                 │              │
                                 │       ┌──────┴──────┐
                                 │      YES           NO
                                 │       │             │
                                 │       ▼             ▼
                                 │  ┌─────────┐  ┌─────────┐
                                 │  │ DEPLOY  │  │ KEEP    │
                                 │  │ NEW     │  │ CURRENT │
                                 │  │ MODEL   │  │ MODEL   │
                                 │  └────┬────┘  └────┬────┘
                                 │       │             │
                                 └───────┴─────────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ IMPROVED MODEL       │
                              │ CONTINUES SERVING    │
                              │ NEW USERS            │
                              └──────────┬───────────┘
                                         │
                                         ▼
                             (Loop continues with more users)
```

**Figure 5 Legend:**
- Solid arrows: Data flow
- Dashed arrows: Decision flow
- Bold boxes: Key decision points
- Circular arrow: Continuous feedback loop

---

## FIGURE 6: Interaction Feature Calculation Diagrams

### Description:
Detailed visual representation of the three novel interaction features calculation.

### 6A: Age-Income Interaction

```
Age Input: 32 years
  │
  ▼
┌──────────────────┐
│ Age Group Encode │
│ < 30: 0          │
│ 30-39: 1  ← [32] │
│ 40-49: 2         │
│ ≥ 50: 3          │
└────────┬─────────┘
         │
         ▼
    ageGroup = 1
         │
         │    Income Input: ₹125,000/month
         │         │
         │         ▼
         │    ┌──────────────────┐
         │    │Income Grp Encode │
         │    │ < 50K: 0         │
         │    │ 50-100K: 1       │
         │    │ 100-200K: 2 ← ✓  │
         │    │ ≥ 200K: 3        │
         │    └────────┬─────────┘
         │             │
         │             ▼
         │      incomeGroup = 2
         │             │
         └─────┬───────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ AGE-INCOME INTERACTION       │
    │                              │
    │ Calculation:                 │
    │ interaction = (age × income) │
    │                     / 9      │
    │                              │
    │ = (1 × 2) / 9                │
    │ = 2 / 9                      │
    │ = 0.222                      │
    │                              │
    │ Interpretation:              │
    │ Younger high-earner          │
    │ → Moderate flexibility       │
    └──────────────────────────────┘
```

### 6B: Goal-Risk Interaction

```
Risk Profile: "Aggressive"
  │
  ▼
┌──────────────────┐
│ Risk Encode      │
│ Conservative: 0  │
│ Moderate: 1      │
│ Aggressive: 2 ← ✓│
└────────┬─────────┘
         │
         ▼
    riskProfile = 2
         │
         │    Goal Type: "Vacation"
         │         │
         │         ▼
         │    ┌──────────────────┐
         │    │ Criticality Flag │
         │    │ Retirement: 1    │
         │    │ Emergency: 1     │
         │    │ Marriage: 1      │
         │    │ Education: 1     │
         │    │ Vacation: 0  ← ✓ │
         │    └────────┬─────────┘
         │             │
         │             ▼
         │      isCritical = 0
         │             │
         └─────┬───────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ GOAL-RISK INTERACTION        │
    │                              │
    │ Calculation:                 │
    │ interaction = (risk × (1-crit))│
    │                     / 2      │
    │                              │
    │ = (2 × (1 - 0)) / 2          │
    │ = (2 × 1) / 2                │
    │ = 1.0                        │
    │                              │
    │ Interpretation:              │
    │ Aggressive investor +        │
    │ Non-critical goal            │
    │ → Maximum flexibility        │
    └──────────────────────────────┘
```

### 6C: Budget Stress Indicator

```
Total Required SIP: ₹45,000
Investment Budget: ₹30,000
Monthly Income: ₹125,000
  │
  ▼
┌──────────────────────────────┐
│ Calculate Budget Shortfall % │
│                              │
│ shortfall = Required - Budget│
│ = 45,000 - 30,000            │
│ = ₹15,000                    │
│                              │
│ shortfallPct = shortfall/budget│
│ = 15,000 / 30,000            │
│ = 0.5 (50%)                  │
└──────────┬───────────────────┘
           │
           │
           ▼
┌──────────────────────────────┐
│ Calculate Savings Rate       │
│                              │
│ savingsRate = budget / income│
│ = 30,000 / 125,000           │
│ = 0.24 (24%)                 │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ BUDGET STRESS INDICATOR      │
│                              │
│ Calculation:                 │
│ stress = min(1.0,            │
│          shortfallPct/       │
│          savingsRate)        │
│                              │
│ = min(1.0, 0.5 / 0.24)       │
│ = min(1.0, 2.08)             │
│ = 1.0                        │
│                              │
│ Interpretation:              │
│ Maximum budget stress        │
│ → Low flexibility            │
│ → System will be conservative│
└──────────────────────────────┘
```

**Figure 6 Legend:**
- ✓: Selected value
- ←: Indication of mapping
- Bold: Final calculated value
- ⭐: Novel inventive feature

---

## FIGURE 7: User Interface Screenshots (Annotated)

### Description:
Mockups of key user interface screens with annotations showing data flow.

### 7A: Goal Input Screen

```
┌───────────────────────────────────────────────────────────┐
│ WealthElements - Financial Goal Planning                  │
├───────────────────────────────────────────────────────────┤
│                                                            │
│ Your Financial Goals:                                     │
│                                                            │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Goal 1: Retirement                         [High ▼]│   │
│ │ Target Amount: ₹ [5,00,00,000]                     │   │
│ │ Target Year: [2050]                                │   │
│ │ Current Lumpsum: ₹ [0]                             │   │
│ │ Required SIP: ₹8,500/month ← Calculated           │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Goal 2: Emergency Fund                   [High ▼] │   │
│ │ Target Amount: ₹ [3,00,000]                        │   │
│ │ Target Year: [2028]                                │   │
│ │ Current Lumpsum: ₹ [50,000]                        │   │
│ │ Required SIP: ₹4,200/month ← Calculated           │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│ ... (More Goals)                                          │
│                                                            │
│ ┌────────────────────────────────────────────────────┐   │
│ │ TOTAL REQUIRED SIP: ₹45,000/month                  │   │
│ │ YOUR INVESTMENT BUDGET: ₹30,000/month              │   │
│ │ SHORTFALL: ₹15,000/month ⚠️                        │   │
│ └────────────────────────────────────────────────────┘   │
│                                                            │
│            [Optimize Plan with AI 🤖]                     │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

### 7B: Optimization Results Screen

```
┌───────────────────────────────────────────────────────────┐
│ Optimization Results                                       │
├───────────────────────────────────────────────────────────┤
│                                                            │
│ ✅ Your plan has been optimized using Machine Learning!   │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Goal: Retirement                                       ││
│ │ ┌──────────────┬──────────────┬────────────────────┐  ││
│ │ │   Before     │     After    │   Adjustment       │  ││
│ │ ├──────────────┼──────────────┼────────────────────┤  ││
│ │ │ ₹5,00,00,000 │ ₹4,75,00,000 │ -5% Amount         │  ││
│ │ │ 2050 (25 yr) │ 2050 (25 yr) │ No Extension       │  ││
│ │ │ ₹8,500/mo    │ ₹8,075/mo    │ ₹425 saved ✓       │  ││
│ │ └──────────────┴──────────────┴────────────────────┘  ││
│ │ 🤖 ML Confidence: 92%                                  ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Goal: Car Purchase                                     ││
│ │ ┌──────────────┬──────────────┬────────────────────┐  ││
│ │ │   Before     │     After    │   Adjustment       │  ││
│ │ ├──────────────┼──────────────┼────────────────────┤  ││
│ │ │ ₹15,00,000   │ ₹15,00,000   │ No Change          │  ││
│ │ │ 2030 (5 yr)  │ 2032 (7 yr)  │ +2 years ⏱️        │  ││
│ │ │ ₹18,500/mo   │ ₹12,300/mo   │ ₹6,200 saved ✓     │  ││
│ │ └──────────────┴──────────────┴────────────────────┘  ││
│ │ 🤖 ML Confidence: 85%                                  ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ ... (More Goals)                                          │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ SUMMARY                                                ││
│ │ • Old Total SIP: ₹45,000/month                         ││
│ │ • New Total SIP: ₹29,500/month ✓                       ││
│ │ • Monthly Savings: ₹15,500                             ││
│ │ • Now fits your budget! 🎉                             ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│      [Accept Plan ✓]        [Try Again 🔄]               │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

### 7C: Feedback Collection Dialog

```
┌────────────────────────────────────────────┐
│  📊 Help Us Improve                       │
├────────────────────────────────────────────┤
│                                            │
│ How do you feel about this optimization?  │
│                                            │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   😊     │  │   🤔     │  │   😟    │ │
│  │  Looks   │  │Acceptable│  │   Not   │ │
│  │  good!   │  │          │  │satisfied│ │
│  └──────────┘  └──────────┘  └─────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ Any specific concerns or             │ │
│  │ suggestions? (optional)              │ │
│  │                                      │ │
│  │                                      │ │
│  └──────────────────────────────────────┘ │
│                                            │
│       [Skip]          [Submit]             │
│                                            │
│  Your feedback helps improve future       │
│  recommendations using machine learning.  │
│                                            │
└────────────────────────────────────────────┘
```

**Figure 7 Legend:**
- [Buttons]: Interactive elements
- ← Calculated: Auto-calculated values
- ⚠️: Warning indicators
- ✓: Positive indicators
- 🤖: ML-powered feature
- ⏱️: Time extension indicator

---

## FIGURE 8: Data Structure Diagram

### Description:
Entity-relationship diagram showing how data is structured and stored.

```
┌─────────────────────────────────┐
│     OptimizationRecord          │
├─────────────────────────────────┤
│ PK: optimizationId (String)     │
│     timestamp (Number)          │
│     userId (String)             │
├─────────────────────────────────┤
│ Relationships:                  │
│  ├─→ userProfile (1:1)          │
│  ├─→ originalGoals (1:N)        │
│  ├─→ optimizationApplied (1:1)  │
│  ├─→ userFeedback (1:1)         │
│  └─→ outcome (1:1)              │
└─────────────────────────────────┘
            │
            ├───────────────┐
            │               │
            ▼               ▼
┌──────────────────┐  ┌────────────────────┐
│  UserProfile     │  │  Goal              │
├──────────────────┤  ├────────────────────┤
│ ageGroup         │  │ name               │
│ incomeGroup      │  │ type               │
│ city             │  │ priority           │
│ familyStatus     │  │ targetAmount       │
│ riskProfile      │  │ yearsLeft          │
│ monthlyIncome    │  │ requiredSIP        │
│ monthlyExpenses  │  │ targetYear         │
│ investmentBudget │  │ lumpsum            │
└──────────────────┘  └────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│  OptimizationApplied            │
├─────────────────────────────────┤
│ stepUpBefore (Number)           │
│ stepUpAfter (Number)            │
│ goalAdjustments[] ──┐           │
└─────────────────────│───────────┘
                      │
                      ▼
              ┌───────────────────────┐
              │ GoalAdjustment        │
              ├───────────────────────┤
              │ goalName              │
              │ goalType              │
              │ priority              │
              │ amountReductionPercent│
              │ tenureExtensionYears  │
              │ sipReductionPercent   │
              │ originalAmount        │
              │ optimizedAmount       │
              │ originalSIP           │
              │ optimizedSIP          │
              │ originalYearsLeft     │
              │ optimizedYearsLeft    │
              └───────────────────────┘

┌─────────────────────────────────┐
│  UserFeedback                   │
├─────────────────────────────────┤
│ sentiment (String)              │
│   [positive, neutral, negative] │
│ comments (String)               │
│ timestamp (Number)              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Outcome                        │
├─────────────────────────────────┤
│ planAbandoned (Boolean)         │
│ monthsFollowed (Number)         │
│ goalsAchieved (Number)          │
│ finalSatisfaction (Number 1-5)  │
└─────────────────────────────────┘
```

**Figure 8 Legend:**
- PK: Primary Key
- FK: Foreign Key
- 1:1: One-to-one relationship
- 1:N: One-to-many relationship
- []: Array/List

---

## DRAWING PREPARATION NOTES FOR PATENT ILLUSTRATOR

### General Requirements:
1. All figures should be in black and white line drawings
2. Use clear, bold lines (minimum 0.3mm thickness)
3. Text should be minimum 3.2mm (0.32cm) in height
4. Margins: 2.5cm top, 2.5cm left, 2.5cm right, 1.0cm bottom
5. Figure numbers and brief descriptions at bottom of each page
6. Each drawing on separate A4 sheet
7. No shading - use cross-hatching or stippling if needed

### Specific Instructions:

**Figure 1:** System architecture - use rectangular blocks with rounded corners, arrows showing data flow, numbers in circles for module references

**Figure 2:** Feature extraction flowchart - use standard flowchart symbols (rectangles for processes, diamonds for decisions, arrows for flow)

**Figure 3:** Neural network - use circles for neurons, lines for connections, boxes for layers, mathematical notation for activation functions

**Figure 4:** Optimization algorithm - detailed flowchart with decision diamonds, process rectangles, clear YES/NO paths

**Figure 5:** Training loop - circular feedback diagram with clearly marked stages, arrows showing direction of flow

**Figure 6:** Interaction features - mathematical calculation diagrams with step-by-step breakdowns, formulas in boxes

**Figure 7:** UI mockups - simplified wireframes, no actual screenshots, schematic representations only

**Figure 8:** Data structure - standard entity-relationship diagram notation, crow's foot notation for relationships

---

*END OF TECHNICAL DRAWINGS DESCRIPTION*
