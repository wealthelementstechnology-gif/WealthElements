# PATENT CLAIMS

## FOR INDIAN PATENT APPLICATION
### Machine Learning-Based Budget Optimizer and Systematic Investment Plan Adjuster

---

## INDEPENDENT CLAIMS

### CLAIM 1 (Main System Claim)

A machine learning-based system for optimizing investment budgets and systematic investment plans (SIPs), the system comprising:

**(a)** A data collection module configured to receive:
  - (i) user profile data including age, monthly income, monthly expenses, family status, risk profile, and geographic location;
  - (ii) a plurality of financial goal data, each goal comprising a goal name, goal type, priority level, target amount, target year, and required monthly SIP amount;
  - (iii) existing investment data and asset-liability information;

**(b)** A feature extraction engine operatively connected to said data collection module, wherein said feature extraction engine is configured to extract a plurality of features comprising:
  - (i) goal characteristic features including encoded goal type, encoded priority, normalized goal amount, years remaining to goal achievement, required SIP to income ratio, and portfolio concentration metric;
  - (ii) user demographic features including encoded age group, encoded income group, encoded family status, encoded risk profile, and encoded city tier;
  - (iii) portfolio context features including total number of goals, count of high-priority goals, count of critical goals, budget utilization percentage, budget shortfall amount, budget shortfall percentage, and savings rate;
  - (iv) historical pattern features including user flexibility score, similar users success rate, typical reduction percentages for goal types, and typical tenure extensions for goal types;
  - (v) interaction features including age-income interaction computed as (encoded age group × encoded income group) / 9, goal-risk interaction computed as (encoded risk profile × (1 − critical goal flag)) / 2, and budget stress indicator computed as min(1.0, budget shortfall percentage / savings rate);

**(c)** A neural network model operatively connected to said feature extraction engine, wherein said neural network model comprises:
  - (i) an input layer configured to receive at least 22 feature values extracted by said feature extraction engine;
  - (ii) a batch normalization layer configured to normalize said feature values;
  - (iii) a first hidden layer comprising 64 neurons with ReLU activation function and L2 regularization with regularization coefficient 0.001;
  - (iv) a first dropout layer with dropout rate 0.2;
  - (v) a second hidden layer comprising 32 neurons with ReLU activation function and L2 regularization with regularization coefficient 0.001;
  - (vi) a second dropout layer with dropout rate 0.2;
  - (vii) a third hidden layer comprising 16 neurons with ReLU activation function and L2 regularization with regularization coefficient 0.0005;
  - (viii) an output layer comprising 3 neurons with sigmoid activation function, configured to output: (1) maximum amount reduction constraint (0-0.70), (2) maximum tenure extension constraint normalized (0-1 representing 0-5 years), and (3) prediction confidence score (0-1);

**(d)** An optimization engine operatively connected to said neural network model and configured to:
  - (i) receive predicted constraints from said neural network model for each goal in said plurality of financial goals;
  - (ii) calculate a priority score for each goal based on user-assigned priority, goal type criticality, and said prediction confidence score;
  - (iii) iteratively adjust goal target amounts and/or goal tenures within said predicted constraints to reduce total required SIP amount to fit within available investment budget;
  - (iv) output optimized goal parameters including optimized target amounts, optimized tenures, and optimized required SIP amounts;

**(e)** An outcome tracking module operatively connected to said optimization engine and configured to:
  - (i) record optimization attempts with user profile data, original goal data, and optimization adjustments;
  - (ii) capture user acceptance or rejection of said optimized goal parameters;
  - (iii) collect user feedback sentiment selected from positive, neutral, or negative;
  - (iv) track plan adherence metrics including months followed, plan abandonment status, and goals achieved;
  - (v) store said optimization attempts and outcomes in a structured database;

**(f)** A model training module operatively connected to said outcome tracking module and said neural network model, wherein said model training module is configured to:
  - (i) retrieve historical outcome records from said structured database;
  - (ii) filter records where user acceptance is true, plan abandonment is false, and months followed exceeds a minimum threshold;
  - (iii) prepare training data by extracting features for each goal using said feature extraction engine and deriving target outputs from actual adjustments and plan adherence duration;
  - (iv) train said neural network model using mean squared error loss function, Adam optimizer, and early stopping with patience;
  - (v) save trained model weights to persistent storage;

**(g)** A fallback rule-based module configured to provide constraint predictions when said neural network model is unavailable or when training data is insufficient, wherein said fallback module applies predefined rules based on goal type classification.

---

### CLAIM 2 (Method Claim)

A computer-implemented method for optimizing systematic investment plans using machine learning, the method comprising the steps of:

**(a)** Receiving user input data comprising:
  - (i) demographic information including age, income, expenses, family status, risk tolerance, and location;
  - (ii) a plurality of financial goals, each goal having a name, type, priority, target amount, timeline, and required SIP;
  - (iii) existing investment and asset information;

**(b)** Extracting, via a feature extraction engine, a multi-dimensional feature vector from said user input data, wherein said feature vector includes at least 22 features across five categories: goal characteristics, user demographics, portfolio context, historical patterns, and interaction features;

**(c)** Computing interaction features comprising:
  - (i) age-income interaction by multiplying encoded age group with encoded income group and normalizing;
  - (ii) goal-risk interaction by multiplying encoded risk profile with inverse of goal criticality flag and normalizing;
  - (iii) budget stress indicator by computing ratio of budget shortfall percentage to savings rate;

**(d)** Inputting said feature vector into a pre-trained neural network model comprising:
  - (i) an input layer with batch normalization;
  - (ii) multiple hidden layers with ReLU activation, L2 regularization, and dropout;
  - (iii) an output layer with sigmoid activation producing three values: maximum amount reduction, maximum tenure extension, and confidence score;

**(e)** Predicting, via said neural network model, goal-specific adjustment constraints for each goal in said plurality of financial goals;

**(f)** Calculating a priority score for each goal based on user-assigned priority, goal type criticality, and model confidence score;

**(g)** Sorting said plurality of financial goals in ascending order of said priority score;

**(h)** Iteratively adjusting goals in said sorted order by:
  - (i) determining if goal tenure can be extended within predicted maximum tenure extension constraint;
  - (ii) if tenure extension is feasible and beneficial, extending goal tenure by one year and recalculating required SIP;
  - (iii) if tenure extension is not feasible, reducing goal target amount by a predetermined increment within predicted maximum amount reduction constraint and recalculating required SIP;
  - (iv) accumulating SIP savings from each adjustment;
  - (v) repeating until total required SIP fits within investment budget or maximum iterations reached;

**(i)** Presenting optimized goal parameters to user via a user interface;

**(j)** Capturing user acceptance or rejection of said optimized goal parameters;

**(k)** Recording, via an outcome tracking module:
  - (i) all input data, predicted constraints, and optimization results;
  - (ii) user decision (accepted/rejected);
  - (iii) user feedback sentiment and comments;
  - (iv) plan adherence metrics over time;

**(l)** Periodically retraining said neural network model when:
  - (i) new outcome records exceed a predetermined threshold; or
  - (ii) time since last training exceeds a predetermined period;
  wherein said retraining uses accumulated outcome data to improve prediction accuracy.

---

### CLAIM 3 (Feature Extraction Method Claim)

A method for extracting machine learning features from financial planning data, the method comprising:

**(a)** Classifying goal types by textual analysis of goal names, wherein:
  - if goal name contains "retire" then goal type is "retirement";
  - if goal name contains "emergency" then goal type is "emergency";
  - if goal name contains "marriage" or "wedding" then goal type is "marriage";
  - if goal name contains "education", "child", or "college" then goal type is "education";
  - if goal name contains "house" or "home" then goal type is "house";
  - if goal name contains "car" or "vehicle" then goal type is "vehicle";
  - if goal name contains "vacation" or "travel" then goal type is "vacation";
  - otherwise goal type is "other";

**(b)** Encoding said goal type into a numerical value selected from {0, 1, 2, 3, 4, 5, 6, 7};

**(c)** Encoding user age into age group: 0 if age < 30, 1 if 30 ≤ age < 40, 2 if 40 ≤ age < 50, 3 if age ≥ 50;

**(d)** Encoding user income into income group: 0 if income < 50,000, 1 if 50,000 ≤ income < 100,000, 2 if 100,000 ≤ income < 200,000, 3 if income ≥ 200,000;

**(e)** Calculating budget shortfall percentage as: max(0, (total required SIP − investment budget) / investment budget);

**(f)** Calculating savings rate as: investment budget / monthly income;

**(g)** Computing novel age-income interaction feature as: (age group × income group) / 9;

**(h)** Computing novel goal-risk interaction feature as: (encoded risk profile × (1 − is_critical_goal_flag)) / 2, wherein is_critical_goal_flag equals 1 if goal type is retirement, emergency, marriage, or education, else 0;

**(i)** Computing novel budget stress indicator as: min(1.0, budget shortfall percentage / savings rate);

**(j)** Extracting historical pattern features by:
  - (i) filtering historical records matching user identifier;
  - (ii) calculating average amount reduction percentages from accepted optimizations;
  - (iii) normalizing to user flexibility score;

**(k)** Assembling all extracted features into a feature vector of at least 22 numerical values suitable for neural network input.

---

## DEPENDENT CLAIMS

### CLAIM 4 (Dependent on Claim 1)
The system of Claim 1, wherein said feature extraction engine is further configured to compute a portfolio concentration metric for each goal, calculated as the ratio of said goal's required SIP to the total required SIP across all goals.

### CLAIM 5 (Dependent on Claim 1)
The system of Claim 1, wherein said neural network model employs He Normal kernel initialization for said hidden layers to facilitate faster convergence during training.

### CLAIM 6 (Dependent on Claim 1)
The system of Claim 1, wherein said optimization engine is configured to prioritize tenure extension adjustments over amount reduction adjustments when model confidence exceeds 0.7 and current tenure extension is below maximum allowed extension.

### CLAIM 7 (Dependent on Claim 1)
The system of Claim 1, wherein said outcome tracking module is further configured to schedule periodic follow-up checks with users to update plan adherence metrics and detect plan abandonment events.

### CLAIM 8 (Dependent on Claim 1)
The system of Claim 1, wherein said model training module employs early stopping with patience parameter set to 15 epochs and restores best model weights based on validation loss.

### CLAIM 9 (Dependent on Claim 1)
The system of Claim 1, wherein said neural network model is implemented using TensorFlow.js library and executed entirely within a user's web browser, thereby preserving user data privacy by avoiding server-side transmission.

### CLAIM 10 (Dependent on Claim 1)
The system of Claim 1, wherein said trained neural network model weights are stored in browser localStorage using the key "localstorage://constraint-predictor-model".

### CLAIM 11 (Dependent on Claim 2)
The method of Claim 2, wherein said iterative adjustment step employs a reduction increment of 2% per iteration when reducing goal target amounts.

### CLAIM 12 (Dependent on Claim 2)
The method of Claim 2, further comprising the step of suggesting an increase in annual step-up percentage when optimization within predicted constraints fails to fit total required SIP within investment budget.

### CLAIM 13 (Dependent on Claim 2)
The method of Claim 2, wherein said neural network model is retrained only if a minimum of 50 historical outcome records are available in said structured database.

### CLAIM 14 (Dependent on Claim 2)
The method of Claim 2, wherein said user feedback sentiment is collected via a user interface displaying emoji-based buttons representing positive, neutral, and negative sentiments.

### CLAIM 15 (Dependent on Claim 3)
The method of Claim 3, wherein said historical pattern features further include similar users' success rate, calculated by:
  - identifying users with matching age group and income group who optimized same goal type;
  - determining how many of said users successfully adhered to plans for at least 12 months;
  - computing success rate as ratio of successful users to total similar users.

---

## PRODUCT CLAIMS

### CLAIM 16 (Product: Computer-Readable Medium)

A non-transitory computer-readable storage medium storing instructions that, when executed by one or more processors, cause said processors to perform operations comprising:

**(a)** Extracting a plurality of features from user financial data, including interaction features computed as cross-products of encoded demographic attributes;

**(b)** Feeding said plurality of features into a neural network model trained to predict goal-specific adjustment constraints;

**(c)** Receiving three output values from said neural network: maximum amount reduction, maximum tenure extension, and prediction confidence;

**(d)** Optimizing a plurality of financial goals by iteratively applying said predicted constraints to reduce total investment requirement;

**(e)** Recording user acceptance and adherence metrics for retraining said neural network model.

### CLAIM 17 (Product: Trained Neural Network Model)

A trained artificial neural network model stored on a computer-readable medium, wherein:

**(a)** Said model accepts as input a 22-dimensional feature vector extracted from user financial data;

**(b)** Said model comprises:
  - a batch normalization layer;
  - a first dense layer with 64 neurons, ReLU activation, and L2 regularization;
  - a first dropout layer with rate 0.2;
  - a second dense layer with 32 neurons, ReLU activation, and L2 regularization;
  - a second dropout layer with rate 0.2;
  - a third dense layer with 16 neurons, ReLU activation, and L2 regularization;
  - an output dense layer with 3 neurons and sigmoid activation;

**(c)** Said model outputs three values representing maximum amount reduction constraint, maximum tenure extension constraint, and prediction confidence;

**(d)** Said model is trained using historical financial planning outcome data comprising user profiles, goal adjustments, acceptances, and adherence metrics.

---

## APPLICATION-SPECIFIC CLAIMS

### CLAIM 18 (Robo-Advisory Application)

A robo-advisory system for automated financial planning, incorporating the machine learning-based optimization system of Claim 1, wherein:

**(a)** User financial data is collected through an interactive web interface or mobile application;

**(b)** Goal-based investment recommendations are generated automatically without human advisor intervention;

**(c)** Optimized SIP amounts are linked to automated investment execution systems;

**(d)** User adherence is monitored through integration with investment account APIs.

### CLAIM 19 (Financial Advisor Tool)

A computer-assisted financial advisory tool incorporating the system of Claim 1, wherein:

**(a)** A financial advisor inputs client data into said system;

**(b)** Said system generates personalized optimization recommendations based on ML predictions;

**(c)** Said financial advisor reviews and potentially modifies said recommendations before presenting to client;

**(d)** Client acceptance and outcomes are tracked to improve advisor-specific model performance.

### CLAIM 20 (Employee Benefits Platform)

An employee financial wellness platform incorporating the method of Claim 2, wherein:

**(a)** Employee demographic and salary data is automatically imported from employer HR systems;

**(b)** Investment budget is calculated based on employer-sponsored SIP contribution limits;

**(c)** Optimized investment plans are generated for multiple employees in batch mode;

**(d)** Aggregate anonymized outcome data is used to retrain ML model for improved company-specific predictions.

---

## NOVELTY AND INVENTIVENESS CLAIMS

### CLAIM 21 (Novel Interaction Features)

A method for computing financial planning features characterized by interaction terms, comprising:

**(a)** Computing an age-income interaction feature by multiplying a user's encoded age group (0-3) with the user's encoded income group (0-3) and normalizing by dividing by 9, wherein said feature captures the empirical observation that younger high-earning users exhibit greater goal adjustment flexibility;

**(b)** Computing a goal-risk interaction feature by multiplying a user's encoded risk profile (0-2) with the complement of a goal criticality flag (0 or 1) and normalizing by dividing by 2, wherein said feature captures that aggressive investors are more flexible with non-critical goals;

**(c)** Computing a budget stress indicator by dividing a budget shortfall percentage by a savings rate and capping at 1.0, wherein said feature quantifies financial pressure inversely related to adjustment flexibility.

### CLAIM 22 (Dynamic Priority Scoring)

A method for determining goal adjustment priority in investment plan optimization, comprising:

**(a)** Assigning a base priority score based on user-designated goal priority (Low=0, Medium=1, High=2);

**(b)** Adding a critical goal bonus of 10 points if goal type is retirement, emergency, marriage, or education;

**(c)** Adding a machine learning confidence bonus computed as ML prediction confidence score (0-1) multiplied by 5;

**(d)** Computing total priority score as sum of base priority, critical bonus, and ML confidence bonus;

**(e)** Sorting goals in ascending order of total priority score such that goals with lower scores are adjusted first during optimization.

### CLAIM 23 (Self-Improving Feedback Loop)

A method for continuous improvement of financial planning recommendations, comprising:

**(a)** Recording each optimization attempt with user profile, original goals, applied adjustments, and ML-predicted constraints;

**(b)** Capturing user acceptance or rejection decision within 2 seconds of optimization result presentation;

**(c)** Collecting user sentiment feedback via a dialog box displaying emoji-based sentiment selectors;

**(d)** Tracking long-term plan adherence by periodically querying user or integration with investment account systems;

**(e)** Accumulating outcome records in a database;

**(f)** Automatically triggering model retraining when:
  - (i) number of new outcome records exceeds 50; or
  - (ii) time since last training exceeds 30 days;

**(g)** Evaluating newly trained model on held-out test set;

**(h)** Deploying new model only if test set error is lower than current model error;

**(i)** Thereby creating a continuous learning cycle that improves prediction accuracy over time.

---

## PROCESS CLAIMS

### CLAIM 24 (Training Process)

A process for training a neural network to predict financial goal adjustment constraints, comprising:

**(a)** Collecting historical optimization records from a database, each record comprising user profile, goal data, applied adjustments, user acceptance, and adherence duration;

**(b)** Filtering said records to include only those where:
  - user acceptance is true;
  - plan abandonment is false;
  - months followed is at least 3;

**(c)** For each filtered record and each goal therein:
  - (i) extracting a 22-dimensional feature vector using a feature extraction engine;
  - (ii) deriving target outputs:
    - amount reduction target = actual amount reduction percentage / 100, clamped to [0, 0.70];
    - tenure extension target = actual tenure extension years / 5, clamped to [0, 1];
    - confidence target = min(1.0, months followed / 36);

**(d)** Assembling feature vectors into an input tensor of shape [N, 22] and target outputs into an output tensor of shape [N, 3];

**(e)** Splitting data into training set (80%) and validation set (20%) with random shuffling;

**(f)** Initializing a neural network with architecture: BatchNorm → Dense(64, ReLU, L2) → Dropout(0.2) → Dense(32, ReLU, L2) → Dropout(0.2) → Dense(16, ReLU, L2) → Dense(3, Sigmoid);

**(g)** Compiling said network with Adam optimizer (learning rate 0.001), Mean Squared Error loss, and Mean Absolute Error metric;

**(h)** Training said network for up to 100 epochs with batch size 32, while:
  - (i) monitoring validation loss after each epoch;
  - (ii) saving model weights whenever validation loss improves;
  - (iii) incrementing a patience counter when validation loss does not improve;
  - (iv) stopping training and restoring best weights when patience counter reaches 15;

**(i)** Saving trained model to persistent storage (localStorage in browser or file system on server);

**(j)** Recording model metadata including training date, sample count, final loss, and final validation loss.

### CLAIM 25 (Prediction Process)

A process for predicting goal-specific adjustment constraints for a new user and goal, comprising:

**(a)** Receiving input data comprising user profile and goal details;

**(b)** Extracting a 22-dimensional feature vector including:
  - goal characteristics: type, priority, amount, SIP, years left;
  - user demographics: age group, income group, family status, risk profile, city tier;
  - portfolio context: total goals, critical goals, budget utilization, shortfall;
  - historical patterns: user flexibility, similar users success rate, typical adjustments;
  - interaction features: age-income, goal-risk, budget stress;

**(c)** Converting said feature vector to a 2D tensor of shape [1, 22];

**(d)** Loading a pre-trained neural network model from persistent storage;

**(e)** Feeding said tensor into said model to obtain output tensor of shape [1, 3];

**(f)** Extracting three scalar values from said output tensor:
  - raw_max_reduction (0-1);
  - raw_max_extension (0-1);
  - raw_confidence (0-1);

**(g)** Post-processing said values:
  - max_amount_reduction = clamp(raw_max_reduction, 0.05, 0.70);
  - max_tenure_extension = round(raw_max_extension × 5);
  - confidence = clamp(raw_confidence, 0.0, 1.0);

**(h)** Returning a constraint object comprising max_amount_reduction, max_tenure_extension, confidence, and source indicator ("ml_model");

**(i)** If model loading fails or confidence is below 0.3, falling back to rule-based constraint determination based on goal type.

---

## SYSTEM ARCHITECTURE CLAIMS

### CLAIM 26 (Browser-Based Implementation)

A client-side financial planning system executed entirely within a web browser, comprising:

**(a)** JavaScript code modules for:
  - data collection from HTML form inputs;
  - feature extraction using FeatureExtractor class;
  - neural network inference using TensorFlow.js library;
  - optimization using OptimizationEngine class;
  - outcome tracking using OutcomeTracker class;

**(b)** A trained neural network model stored in browser's localStorage at key "localstorage://constraint-predictor-model";

**(c)** Outcome records stored in browser's IndexedDB or localStorage;

**(d)** User interface elements rendered using HTML and CSS, including:
  - input forms for user profile and goals;
  - optimization results display showing before/after comparisons;
  - feedback collection dialogs with emoji buttons and text area;

**(e)** Event listeners that trigger optimization when user clicks "Optimize" button and track user interactions;

Wherein all data processing, ML inference, and optimization occur locally in the browser without transmission to remote servers, thereby preserving user privacy.

### CLAIM 27 (Modular Architecture)

A software system architecture for financial planning optimization, comprising distinct modules:

**(a)** **FeatureExtractor Module** (ml-features.js):
  - FeatureExtractor class with methods: extractGoalFeatures(), classifyGoalType(), encodeGoalType(), encodePriority(), encodeAgeGroup(), encodeIncomeGroup(), encodeFamilyStatus(), encodeRiskProfile(), encodeCityTier(), featuresToArray();

**(b)** **ML Model Module** (ml-model.js):
  - OptimizationMLModel class with methods: initialize(), predictConstraints(), trainModel(), evaluateModel(), deleteModel(), getModelInfo();

**(c)** **Integration Module** (step6-ml-integration.js):
  - Functions: getUserProfile(), captureGoalsState(), getMLConstraints(), preloadMLConstraints(), trackOptimizationStart(), trackOptimizationComplete(), showOptimizationFeedbackDialog();

**(d)** **Outcome Tracking Module** (outcome-tracker.js or outcome-tracker-firebase.js):
  - OutcomeTracker class with methods: recordOptimizationAttempt(), recordUserDecision(), updateOutcome(), getAllRecords();

**(e)** **Optimization Engine Module** (step6.js):
  - Functions: optimizePlan(), recalc(), getGoalConstraintsML();

Wherein said modules communicate via global window object properties and event-driven callbacks.

---

## DATA STRUCTURE CLAIMS

### CLAIM 28 (Optimization Record Structure)

A data structure for storing financial plan optimization records, comprising:

**(a)** An optimizationId field storing a unique identifier;

**(b)** A timestamp field storing Unix timestamp of optimization attempt;

**(c)** A userId field storing unique user identifier;

**(d)** A userProfile object comprising:
  - ageGroup: string encoding user age range;
  - incomeGroup: string encoding user income range;
  - city: string;
  - familyStatus: enumerated value (single, married, married_with_kids);
  - riskProfile: enumerated value (conservative, moderate, aggressive);
  - monthlyIncome, monthlyExpenses, investmentBudget: numeric values;

**(e)** An originalGoals array, each element comprising:
  - name, type, priority: strings;
  - targetAmount, yearsLeft, requiredSIP, targetYear: numeric values;

**(f)** An optimizationApplied object comprising:
  - stepUpBefore, stepUpAfter: numeric values;
  - goalAdjustments array, each element comprising:
    - goalName, goalType, priority: strings;
    - amountReductionPercent, tenureExtensionYears, sipReductionPercent: numeric values;
    - originalAmount, optimizedAmount, originalSIP, optimizedSIP, originalYearsLeft, optimizedYearsLeft: numeric values;

**(g)** A userAccepted boolean field;

**(h)** A userFeedback object comprising:
  - sentiment: enumerated value (positive, neutral, negative);
  - comments: string;
  - timestamp: numeric value;

**(i)** An outcome object comprising:
  - planAbandoned: boolean;
  - monthsFollowed: numeric value;
  - goalsAchieved: numeric value;
  - finalSatisfaction: numeric value (1-5);

Wherein said data structure is stored in JSON format in a database or browser storage.

---

## ALGORITHM CLAIMS

### CLAIM 29 (Iterative Optimization Algorithm)

An algorithm for optimizing financial goals within budget constraints, comprising:

```
INPUT: goals[], investmentBudget, userProfile, mlConstraints{}
OUTPUT: optimizedGoals[]

1. Calculate totalRequiredSIP = sum(goal.requiredSIP for all goals)
2. Calculate shortfall = totalRequiredSIP - investmentBudget
3. IF shortfall ≤ 0 THEN RETURN goals (no optimization needed)

4. FOR each goal IN goals:
     priorityScore = basePriority(goal.priority)
                   + criticalBonus(goal.type)
                   + mlConfidenceBonus(mlConstraints[goal.name].confidence)

5. SORT goals BY priorityScore ASCENDING

6. currentShortfall = shortfall
7. iteration = 0
8. maxIterations = 50

9. WHILE currentShortfall > 100 AND iteration < maxIterations:
     madeProgress = FALSE

     FOR goal IN sortedGoals:
       IF currentShortfall ≤ 100 THEN BREAK

       constraints = mlConstraints[goal.name]
       currentReduction = (goal.originalAmount - goal.currentAmount) / goal.originalAmount
       currentExtension = goal.currentTenure - goal.originalTenure

       IF constraints.confidence > 0.7
          AND currentExtension < constraints.maxTenureExtension:

         newTenure = goal.currentTenure + 1
         newSIP = recalculateSIP(goal.currentAmount, newTenure, goal.lumpsum, returnRate)
         sipSavings = goal.currentSIP - newSIP

         IF sipSavings > 0:
           goal.currentTenure = newTenure
           goal.currentSIP = newSIP
           currentShortfall -= sipSavings
           madeProgress = TRUE

       ELSE IF currentReduction < constraints.maxAmountReduction:
         reductionIncrement = 0.02
         newAmount = goal.currentAmount × (1 - reductionIncrement)
         newSIP = recalculateSIP(newAmount, goal.currentTenure, goal.lumpsum, returnRate)
         sipSavings = goal.currentSIP - newSIP

         IF sipSavings > 0:
           goal.currentAmount = newAmount
           goal.currentSIP = newSIP
           currentShortfall -= sipSavings
           madeProgress = TRUE

     IF NOT madeProgress THEN BREAK
     iteration += 1

10. IF currentShortfall > 100 THEN suggestStepUpIncrease()
11. RETURN goals
```

Wherein said algorithm intelligently balances multiple goals using ML-predicted constraints and prioritization scores.

---

## TOTAL CLAIMS: 29

---

**Summary of Claim Types:**
- **3 Independent Claims** (Claims 1, 2, 3)
- **11 Dependent Claims** on Independent Claims (Claims 4-15)
- **2 Product Claims** (Claims 16, 17)
- **3 Application-Specific Claims** (Claims 18, 19, 20)
- **3 Novelty Claims** (Claims 21, 22, 23)
- **2 Process Claims** (Claims 24, 25)
- **2 System Architecture Claims** (Claims 26, 27)
- **1 Data Structure Claim** (Claim 28)
- **1 Algorithm Claim** (Claim 29)

---

*END OF CLAIMS DOCUMENT*
