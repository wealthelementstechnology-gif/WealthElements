/**
 * ML Model - Machine Learning for Constraint Prediction
 * This uses TensorFlow.js to predict optimal optimization constraints
 * Falls back to rule-based system when ML model is not available
 */

class OptimizationMLModel {
  constructor() {
    this.model = null;
    this.modelLoaded = false;
    this.fallbackToRules = true;
    this.modelVersion = '1.0';
    this.minTrainingSamples = 50;
  }

  async initialize() {
    try {
      // Check if TensorFlow.js is loaded
      if (typeof tf === 'undefined') {
        console.warn('TensorFlow.js not loaded. Using rule-based fallback.');
        this.fallbackToRules = true;
        return;
      }

      // Try to load pre-trained model from localStorage
      try {
        this.model = await tf.loadLayersModel('localstorage://constraint-predictor-model');
        this.modelLoaded = true;
        this.fallbackToRules = false;
        console.log('✅ ML model loaded successfully from localStorage');
      } catch (e) {
        console.log('No pre-trained model found. Will use rule-based fallback until training.');
        this.fallbackToRules = true;
      }
    } catch (e) {
      console.error('Error initializing ML model:', e);
      this.fallbackToRules = true;
    }
  }

  // Predict optimal constraints for a goal
  async predictConstraints(goal, userProfile, allGoals, historicalData) {
    // Always fall back to rules if model not ready
    if (!this.modelLoaded || this.fallbackToRules) {
      return this.ruleBasedConstraints(goal);
    }

    try {
      // Extract features
      const features = window.featureExtractor.extractGoalFeatures(
        goal, userProfile, allGoals, historicalData
      );

      // Convert to tensor
      const featureArray = window.featureExtractor.featuresToArray(features);
      const inputTensor = tf.tensor2d([featureArray], [1, featureArray.length]);

      // Predict
      const prediction = this.model.predict(inputTensor);
      const values = await prediction.data();

      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();

      // Output: [maxAmountReduction, maxTenureExtension, confidence]
      const result = {
        maxAmountReduction: Math.min(0.70, Math.max(0.05, values[0])),
        maxTenureExtension: Math.min(5, Math.max(0, Math.round(values[1] * 5))),
        confidence: Math.min(1.0, Math.max(0.0, values[2])),
        source: 'ml_model',
        modelVersion: this.modelVersion
      };

      console.log(`ML Prediction for ${goal.name}:`, result);
      return result;

    } catch (e) {
      console.error('ML prediction failed, falling back to rules:', e);
      return this.ruleBasedConstraints(goal);
    }
  }

  // Fallback to rule-based constraints (original hardcoded logic)
  ruleBasedConstraints(goal) {
    const name = (goal.name || '').toLowerCase();
    const goalType = goal.type || window.featureExtractor.classifyGoalType(goal.name);

    let result;

    if (name.includes('emergency') || goalType === 'emergency') {
      result = {
        maxAmountReduction: 0.30,
        maxTenureExtension: 1,
        confidence: 0.80,
        source: 'rule_based',
        type: 'emergency'
      };
    } else if (name.includes('retire') || goalType === 'retirement') {
      result = {
        maxAmountReduction: 0.20,
        maxTenureExtension: 1,
        confidence: 0.90,
        source: 'rule_based',
        type: 'retirement'
      };
    } else if (name.includes('marriage') || name.includes('wedding') || goalType === 'marriage') {
      result = {
        maxAmountReduction: 0.25,
        maxTenureExtension: 1,
        confidence: 0.85,
        source: 'rule_based',
        type: 'marriage'
      };
    } else if (name.includes('education') || name.includes('child') || goalType === 'education') {
      result = {
        maxAmountReduction: 0.25,
        maxTenureExtension: 1,
        confidence: 0.85,
        source: 'rule_based',
        type: 'education'
      };
    } else {
      result = {
        maxAmountReduction: 0.50,
        maxTenureExtension: 5,
        confidence: 0.70,
        source: 'rule_based',
        type: 'other'
      };
    }

    return result;
  }

  // Train model with collected data
  async trainModel(trainingData, options = {}) {
    if (typeof tf === 'undefined') {
      throw new Error('TensorFlow.js is required for model training');
    }

    if (!trainingData || trainingData.length < this.minTrainingSamples) {
      throw new Error(`Insufficient training data. Need at least ${this.minTrainingSamples} samples, got ${trainingData.length}`);
    }

    console.log(`🎓 Training ML model with ${trainingData.length} samples...`);

    // Prepare training data
    const { inputs, outputs } = this.prepareTrainingData(trainingData);

    if (!inputs || !outputs) {
      throw new Error('Failed to prepare training data');
    }

    // Define model architecture
    const model = tf.sequential({
      layers: [
        // Batch normalization for input layer
        tf.layers.batchNormalization({ inputShape: [22] }), // Updated to 22 features (19 + 3 interaction features)

        // First hidden layer with L2 regularization
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          kernelInitializer: 'heNormal',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        tf.layers.dropout({ rate: 0.2 }),

        // Second hidden layer with L2 regularization
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelInitializer: 'heNormal',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        tf.layers.dropout({ rate: 0.2 }),

        // Third hidden layer with L2 regularization
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          kernelInitializer: 'heNormal',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.0005 })
        }),

        // Output layer: [maxReduction (0-1), maxExtension (0-1), confidence (0-1)]
        tf.layers.dense({
          units: 3,
          activation: 'sigmoid'
        })
      ]
    });

    // Compile model
    model.compile({
      optimizer: tf.train.adam(options.learningRate || 0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    console.log('Model architecture created');
    model.summary();

    // Custom early stopping with best weights tracking
    let bestValLoss = Infinity;
    let bestWeights = null;
    let patienceCounter = 0;
    const patience = options.patience || 15;
    let stoppedEarly = false;

    // Training callbacks
    const callbacks = {
      onEpochEnd: async (epoch, logs) => {
        console.log(
          `Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, ` +
          `mae = ${logs.mae.toFixed(4)}, ` +
          `val_loss = ${logs.val_loss.toFixed(4)}`
        );

        // Early stopping logic with best weights tracking
        if (logs.val_loss < bestValLoss) {
          console.log(`  ✅ New best val_loss: ${logs.val_loss.toFixed(4)} (improved by ${(bestValLoss - logs.val_loss).toFixed(4)})`);
          bestValLoss = logs.val_loss;
          // Save best weights
          if (bestWeights) {
            bestWeights.forEach(w => w.dispose());
          }
          bestWeights = model.getWeights().map(w => w.clone());
          patienceCounter = 0;
        } else {
          patienceCounter++;
          console.log(`  ⏳ No improvement for ${patienceCounter}/${patience} epochs`);

          if (patienceCounter >= patience) {
            console.log(`  🛑 Early stopping triggered! Restoring best weights from epoch ${epoch + 1 - patience}`);
            stoppedEarly = true;
            model.stopTraining = true;
          }
        }

        // Store progress for UI
        if (options.onProgress) {
          options.onProgress(epoch + 1, logs);
        }
      },
      onTrainEnd: async () => {
        // Restore best weights if early stopping occurred
        if (stoppedEarly && bestWeights) {
          console.log('🔄 Restoring best weights...');
          model.setWeights(bestWeights);
          console.log(`✅ Restored weights with val_loss: ${bestValLoss.toFixed(4)}`);
        }

        // Clean up stored weights
        if (bestWeights) {
          bestWeights.forEach(w => w.dispose());
        }

        console.log('✅ Training completed');
      }
    };

    // Train model
    const history = await model.fit(inputs, outputs, {
      epochs: options.epochs || 100,
      batchSize: options.batchSize || 32,
      validationSplit: options.validationSplit || 0.2,
      shuffle: true,
      callbacks: callbacks
    });

    // Clean up tensors
    inputs.dispose();
    outputs.dispose();

    // Save model to localStorage
    await model.save('localstorage://constraint-predictor-model');
    console.log('💾 Model saved to localStorage');

    // Update instance
    this.model = model;
    this.modelLoaded = true;
    this.fallbackToRules = false;

    // Save metadata
    const metadata = {
      version: this.modelVersion,
      trainedDate: new Date().toISOString(),
      sampleCount: trainingData.length,
      finalLoss: history.history.loss[history.history.loss.length - 1],
      finalValLoss: history.history.val_loss[history.history.val_loss.length - 1]
    };
    localStorage.setItem('ml_model_metadata', JSON.stringify(metadata));

    console.log('🎉 Model training complete!', metadata);
    return { history, metadata };
  }

  // Prepare training data from outcome records
  prepareTrainingData(rawData) {
    const inputsArray = [];
    const outputsArray = [];

    rawData.forEach(record => {
      // Only use successful optimizations (user accepted AND followed through)
      if (!record.userAccepted || record.outcome.planAbandoned) return;

      // Need at least some follow-through data
      if (record.outcome.monthsFollowed < 3) return;

      // For each goal adjustment in this optimization
      record.optimizationApplied.goalAdjustments.forEach((adjustment, idx) => {
        const originalGoal = record.originalGoals[idx];
        if (!originalGoal) return;

        // Create goal object for feature extraction
        const goal = {
          name: originalGoal.name,
          type: originalGoal.type,
          priority: originalGoal.priority,
          fv: originalGoal.targetAmount,
          yearsLeft: originalGoal.yearsLeft,
          sip: originalGoal.requiredSIP,
          targetAmount: originalGoal.targetAmount,
          requiredSIP: originalGoal.requiredSIP
        };

        // User profile
        const userProfile = {
          age: window.featureExtractor.getAgeFromGroup(record.userProfile.ageGroup),
          monthlyIncome: record.userProfile.monthlyIncome || record.budgetContext.monthlyIncome,
          monthlyExpenses: record.userProfile.monthlyExpenses || record.budgetContext.monthlyExpenses,
          familyStatus: record.userProfile.familyStatus,
          riskProfile: record.userProfile.riskProfile,
          city: record.userProfile.city,
          userId: record.userId,
          investmentBudget: record.budgetContext.investmentBudget,
          totalRequiredSIP: record.budgetContext.originalTotalSIP
        };

        // Extract features
        const features = window.featureExtractor.extractGoalFeatures(
          goal,
          userProfile,
          record.originalGoals,
          rawData
        );

        const featureArray = window.featureExtractor.featuresToArray(features);

        // Target outputs: what actually worked for this user
        const amountReduction = Math.abs(adjustment.amountReductionPercent || 0) / 100;
        const tenureExtension = (adjustment.tenureExtensionYears || 0) / 5; // Normalize to 0-1 (max 5 years)

        // Confidence based on follow-through (more months = higher confidence)
        const confidence = Math.min(1.0, record.outcome.monthsFollowed / 36);

        const targetOutputs = [
          Math.min(0.70, Math.max(0.0, amountReduction)),
          Math.min(1.0, Math.max(0.0, tenureExtension)),
          confidence
        ];

        inputsArray.push(featureArray);
        outputsArray.push(targetOutputs);
      });
    });

    if (inputsArray.length === 0) {
      console.error('No valid training samples found');
      return null;
    }

    console.log(`Prepared ${inputsArray.length} training samples`);

    return {
      inputs: tf.tensor2d(inputsArray),
      outputs: tf.tensor2d(outputsArray)
    };
  }

  // Evaluate model on test data
  async evaluateModel(testData) {
    if (!this.modelLoaded || !this.model) {
      throw new Error('Model not loaded');
    }

    const predictions = [];
    let totalError = 0;

    for (const record of testData) {
      if (!record.userAccepted || record.outcome.planAbandoned) continue;

      for (let idx = 0; idx < record.originalGoals.length; idx++) {
        const originalGoal = record.originalGoals[idx];
        const actualAdjustment = record.optimizationApplied.goalAdjustments[idx];

        if (!originalGoal || !actualAdjustment) continue;

        const goal = {
          name: originalGoal.name,
          type: originalGoal.type,
          priority: originalGoal.priority,
          fv: originalGoal.targetAmount,
          yearsLeft: originalGoal.yearsLeft,
          sip: originalGoal.requiredSIP,
          targetAmount: originalGoal.targetAmount,
          requiredSIP: originalGoal.requiredSIP
        };

        const userProfile = {
          age: window.featureExtractor.getAgeFromGroup(record.userProfile.ageGroup),
          monthlyIncome: record.budgetContext.monthlyIncome,
          monthlyExpenses: record.budgetContext.monthlyExpenses,
          familyStatus: record.userProfile.familyStatus,
          riskProfile: record.userProfile.riskProfile,
          city: record.userProfile.city,
          userId: record.userId,
          investmentBudget: record.budgetContext.investmentBudget,
          totalRequiredSIP: record.budgetContext.originalTotalSIP
        };

        const predicted = await this.predictConstraints(
          goal,
          userProfile,
          record.originalGoals,
          testData
        );

        const actualReduction = Math.abs(actualAdjustment.amountReductionPercent) / 100;
        const actualExtension = actualAdjustment.tenureExtensionYears;

        const reductionError = Math.abs(actualReduction - predicted.maxAmountReduction);
        const extensionError = Math.abs(actualExtension - predicted.maxTenureExtension);

        totalError += reductionError + extensionError;

        predictions.push({
          goal: goal.name,
          goalType: goal.type,
          actual_reduction: actualReduction,
          predicted_reduction: predicted.maxAmountReduction,
          actual_extension: actualExtension,
          predicted_extension: predicted.maxTenureExtension,
          error: reductionError + extensionError
        });
      }
    }

    const avgError = predictions.length > 0 ? (totalError / predictions.length).toFixed(4) : 0;

    return {
      averageError: avgError,
      predictions: predictions,
      sampleCount: predictions.length
    };
  }

  // Get model info
  getModelInfo() {
    const metadata = localStorage.getItem('ml_model_metadata');
    return {
      loaded: this.modelLoaded,
      fallbackMode: this.fallbackToRules,
      version: this.modelVersion,
      metadata: metadata ? JSON.parse(metadata) : null
    };
  }

  // Delete model
  async deleteModel() {
    try {
      await tf.io.removeModel('localstorage://constraint-predictor-model');
      localStorage.removeItem('ml_model_metadata');
      this.model = null;
      this.modelLoaded = false;
      this.fallbackToRules = true;
      console.log('Model deleted');
      return true;
    } catch (e) {
      console.error('Error deleting model:', e);
      return false;
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.mlModel = new OptimizationMLModel();

  let initAttempts = 0;
  const maxAttempts = 50; // 5 seconds max wait time

  // Wait for TensorFlow.js to load, then initialize
  function initializeWhenReady() {
    initAttempts++;

    if (typeof tf !== 'undefined') {
      window.mlModel.initialize();
      console.log('✅ ML Model initialized (TensorFlow.js loaded)');
      return;
    }

    if (initAttempts >= maxAttempts) {
      console.warn('⚠️ TensorFlow.js failed to load after 5 seconds. ML will use rule-based fallback.');
      console.warn('💡 This is OK - the system will work with hardcoded rules instead of ML predictions.');
      console.warn('💡 Check your internet connection if you want to use ML features.');
      window.mlModel.initialize(); // Initialize anyway, will use fallback
      return;
    }

    if (initAttempts === 1 || initAttempts % 10 === 0) {
      console.log(`⏳ Waiting for TensorFlow.js to load... (attempt ${initAttempts}/${maxAttempts})`);
    }

    setTimeout(initializeWhenReady, 100);
  }

  // Auto-initialize when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhenReady);
  } else {
    initializeWhenReady();
  }

  console.log('ML Model script loaded');
}
