/**
 * Step 6 ML Integration
 * This file integrates ML-based constraint prediction into step6.js
 * Include this AFTER step6.js in your HTML
 */

(function() {
  'use strict';

  let currentOptimizationId = null;

  // Helper: Get user profile data from localStorage
  function getUserProfile() {
    try {
      const step1Data = JSON.parse(localStorage.getItem('we_step1') || '{}');
      const investRule = JSON.parse(localStorage.getItem('we_invest_rule') || '{}');

      const monthlyIncome = (step1Data.income || []).reduce((sum, item) => sum + (item.value || 0), 0);
      const monthlyExpenses = (step1Data.expenses || []).reduce((sum, item) => {
        return sum + (item.monthly || 0) + ((item.annual || 0) / 12);
      }, 0);

      // Calculate investment budget
      const pct = investRule.pct || 30;
      const investmentBudget = (monthlyIncome * pct) / 100;

      return {
        age: step1Data.age || 30,
        monthlyIncome: monthlyIncome,
        monthlyExpenses: monthlyExpenses,
        investmentBudget: investmentBudget,
        familyStatus: step1Data.familyStatus || 'single',
        riskProfile: step1Data.riskProfile || 'moderate',
        city: step1Data.city || 'unknown',
        userId: localStorage.getItem('we_user_id')
      };
    } catch (e) {
      console.error('Error getting user profile:', e);
      return {
        age: 30,
        monthlyIncome: 50000,
        monthlyExpenses: 30000,
        investmentBudget: 15000,
        familyStatus: 'single',
        riskProfile: 'moderate',
        city: 'unknown'
      };
    }
  }

  // Helper: Capture current state of goals
  function captureGoalsState() {
    const goals = [];
    const tbody = document.getElementById('sipRows');
    if (!tbody) return goals;

    Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
      const nameCell = tr.querySelector('td');
      const fvInput = tr.querySelector('input[data-fv]');
      const lumpInput = tr.querySelector('input[data-lump]');
      const yearInput = tr.querySelector('input[data-year]');
      const sipCell = tr.querySelector('[data-sip]');
      const priorityBadge = tr.querySelector('.priority-badge');

      if (!nameCell || !fvInput || !yearInput || !sipCell) return;

      const name = nameCell.textContent.trim();
      const fv = parseFloat(fvInput.value) || 0;
      const lump = parseFloat((lumpInput && lumpInput.value) || 0);
      const targetYear = parseInt(yearInput.value) || new Date().getFullYear();
      const nowYear = new Date().getFullYear();
      const yearsLeft = Math.max(0, targetYear - nowYear);
      const sipText = sipCell.textContent;
      const sip = parseFloat(String(sipText).replace(/[^0-9.]/g,'')) || 0;
      const priority = priorityBadge ? priorityBadge.textContent.trim() : 'Medium';

      goals.push({
        name: name,
        fv: fv,
        lump: lump,
        targetYear: targetYear,
        yearsLeft: yearsLeft,
        sip: sip,
        priority: priority
      });
    });

    return goals;
  }

  // Helper: Calculate total SIP
  function calculateTotalSIP(goals) {
    return goals.reduce((sum, g) => sum + (g.sip || 0), 0);
  }

  // Enhanced: Get ML-based constraints
  async function getMLConstraints(goalName, goal, userProfile, allGoals) {
    // Wait for outcomeTracker if not ready
    if (!window.outcomeTracker) {
      console.warn('⚠️ outcomeTracker not ready, using rule-based constraints');
      return getRuleBasedConstraints(goalName);
    }
    
    const historicalData = await window.outcomeTracker.getAllRecords();

    try {
      const mlConstraints = await window.mlModel.predictConstraints(
        { ...goal, name: goalName },
        userProfile,
        allGoals,
        historicalData
      );

      console.log(`${mlConstraints.source === 'ml_model' ? '🤖 ML' : '📏 Rule'} Constraints for ${goalName}:`, mlConstraints);

      return {
        type: window.featureExtractor.isCritical(goal.type || window.featureExtractor.classifyGoalType(goalName)) ? 'critical' : 'aspirational',
        maxTenureExtension: mlConstraints.maxTenureExtension,
        maxAmountReduction: mlConstraints.maxAmountReduction,
        confidence: mlConstraints.confidence,
        source: mlConstraints.source
      };
    } catch (e) {
      console.warn('ML prediction failed, using rule-based fallback:', e);
      // Fallback to original rule-based constraints
      return getRuleBasedConstraints(goalName);
    }
  }

  // Fallback: Rule-based constraints (original logic)
  function getRuleBasedConstraints(goalName) {
    const name = goalName.toLowerCase();
    if (name.includes('emergency')) {
      return { type: 'emergency', maxTenureExtension: 1, maxAmountReduction: 0.3, source: 'rule_based' };
    } else if (name.includes('retire')) {
      return { type: 'retirement', maxTenureExtension: 1, maxAmountReduction: 0.2, source: 'rule_based' };
    } else if (name.includes('marriage') || name.includes('wedding')) {
      return { type: 'marriage', maxTenureExtension: 1, maxAmountReduction: 0.25, source: 'rule_based' };
    } else if (name.includes('education') || name.includes('child')) {
      return { type: 'education', maxTenureExtension: 1, maxAmountReduction: 0.25, source: 'rule_based' };
    } else {
      return { type: 'other', maxTenureExtension: 5, maxAmountReduction: 0.5, source: 'rule_based' };
    }
  }

  // Expose ML constraints function globally so step6.js can use it
  window.getMLConstraints = getMLConstraints;

  // ML Constraints Cache for synchronous access
  let mlConstraintsCache = null;

  // Preload ML constraints for all current goals (async)
  async function preloadMLConstraints() {
    try {
      console.log('🔄 Preloading ML constraints...');
      const userProfile = getUserProfile();
      const goals = captureGoalsState();
      const allGoals = goals;

      mlConstraintsCache = {};

      for (const goal of goals) {
        try {
          const constraints = await getMLConstraints(goal.name, goal, userProfile, allGoals);
          mlConstraintsCache[goal.name] = constraints;
          console.log(`✅ Cached ML constraints for: ${goal.name}`);
        } catch (e) {
          console.warn(`⚠️ Failed to cache ML constraints for ${goal.name}:`, e);
          mlConstraintsCache[goal.name] = getRuleBasedConstraints(goal.name);
        }
      }

      console.log('✅ ML constraints preloaded for', Object.keys(mlConstraintsCache).length, 'goals');
      return true;
    } catch (e) {
      console.error('❌ Failed to preload ML constraints:', e);
      mlConstraintsCache = null;
      return false;
    }
  }

  // Synchronous wrapper to get cached ML constraints
  window.getGoalConstraintsML = function(goalName) {
    // If cache exists and has this goal, use it
    if (mlConstraintsCache && mlConstraintsCache[goalName]) {
      console.log(`🤖 Using cached ML constraints for ${goalName}`, mlConstraintsCache[goalName]);
      return mlConstraintsCache[goalName];
    }

    // Otherwise fall back to rule-based
    console.log(`📏 Using rule-based constraints for ${goalName} (no ML cache)`);
    return getRuleBasedConstraints(goalName);
  };

  // Expose preload function globally
  window.preloadMLConstraints = preloadMLConstraints;

  // Track optimization attempt BEFORE optimization starts
  function trackOptimizationStart() {
    const userProfile = getUserProfile();
    const originalGoals = captureGoalsState();
    const investRule = JSON.parse(localStorage.getItem('we_invest_rule') || '{}');

    const originalTotalSIP = calculateTotalSIP(originalGoals);

    // Store for later use
    window._mlTrackingData = {
      userProfile: userProfile,
      originalGoals: originalGoals,
      stepUpBefore: parseFloat(investRule.autoStepUp || 0),
      originalTotalSIP: originalTotalSIP,
      startTime: Date.now()
    };

    console.log('📊 Tracking optimization start:', window._mlTrackingData);
  }

  // Track optimization completion AFTER optimization finishes
  function trackOptimizationComplete() {
    if (!window._mlTrackingData) {
      console.warn('No tracking data found');
      return;
    }

    // Wait for outcomeTracker to be available (with retry)
    function tryRecordOptimization(attempts = 0) {
      if (!window.outcomeTracker) {
        if (attempts < 20) { // Try for up to 2 seconds (20 * 100ms)
          setTimeout(() => tryRecordOptimization(attempts + 1), 100);
          return;
        } else {
          console.error('❌ outcomeTracker not available after waiting');
          return;
        }
      }

      const userProfile = window._mlTrackingData.userProfile;
      const originalGoals = window._mlTrackingData.originalGoals;
      const optimizedGoals = captureGoalsState();
      const investRule = JSON.parse(localStorage.getItem('we_invest_rule') || '{}');

      const optimizedTotalSIP = calculateTotalSIP(optimizedGoals);

      const trackingData = {
        userAge: userProfile.age,
        monthlyIncome: userProfile.monthlyIncome,
        monthlyExpenses: userProfile.monthlyExpenses,
        city: userProfile.city,
        familyStatus: userProfile.familyStatus,
        riskProfile: userProfile.riskProfile,

        goals: optimizedGoals,
        originalGoals: originalGoals,

        stepUpBefore: window._mlTrackingData.stepUpBefore,
        stepUpAfter: parseFloat(investRule.autoStepUp || 0),

        investmentBudget: userProfile.investmentBudget,
        originalTotalSIP: window._mlTrackingData.originalTotalSIP,
        optimizedTotalSIP: optimizedTotalSIP
      };

      // Check if feedback dialog should be shown
      // Only show feedback if:
      // 1. User has reached max optimization attempts (3), OR
      // 2. Optimized total SIP is within investment budget
      const maxAttemptsReached = window.optimizationCount && window.optimizationCount >= 3;
      const withinBudget = optimizedTotalSIP <= userProfile.investmentBudget;
      
      const shouldShowFeedback = maxAttemptsReached || withinBudget;
      
      console.log('📊 Feedback check:', {
        maxAttemptsReached,
        withinBudget,
        optimizedTotalSIP,
        investmentBudget: userProfile.investmentBudget,
        shouldShowFeedback
      });

      // Record the optimization attempt
      window.outcomeTracker.recordOptimizationAttempt(trackingData).then(id => {
        currentOptimizationId = id;
        console.log('✅ Optimization tracked (localStorage):', currentOptimizationId);

        if (shouldShowFeedback) {
          console.log('✅ Showing feedback dialog (max attempts reached or within budget)');
          // Show feedback dialog after 2 seconds (gives user time to review results)
          setTimeout(() => {
            showOptimizationFeedbackDialog(currentOptimizationId);
          }, 2000);
        } else {
          console.log('⏭️ Skipping feedback dialog (not at max attempts and not within budget)');
        }
      }).catch(err => {
        console.error('❌ Failed to track optimization:', err);
        // Still show feedback dialog even if tracking failed (if conditions met)
        // Recalculate shouldShowFeedback here in case variables changed
        const maxAttemptsReached = window.optimizationCount && window.optimizationCount >= 3;
        const withinBudget = optimizedTotalSIP <= userProfile.investmentBudget;
        const shouldShowFeedback = maxAttemptsReached || withinBudget;
        
        if (shouldShowFeedback && currentOptimizationId) {
          setTimeout(() => {
            showOptimizationFeedbackDialog(currentOptimizationId);
          }, 2000);
        }
      });
    }

    tryRecordOptimization();
  }

  // Show feedback dialog to collect user sentiment
  function showOptimizationFeedbackDialog(optimizationId) {
    // Check if dialog already exists
    if (document.querySelector('.ml-feedback-dialog')) {
      return;
    }

    const dialog = document.createElement('div');
    dialog.className = 'ml-feedback-dialog';
    dialog.innerHTML = `
      <div class="ml-feedback-overlay"></div>
      <div class="ml-feedback-modal">
        <h3>📊 Help Us Improve</h3>
        <p>How do you feel about this optimization?</p>

        <div class="ml-feedback-options">
          <button class="ml-feedback-btn ml-feedback-positive" data-feedback="positive">
            <span class="feedback-emoji">😊</span>
            <span class="feedback-text">Looks good!</span>
          </button>
          <button class="ml-feedback-btn ml-feedback-neutral" data-feedback="neutral">
            <span class="feedback-emoji">🤔</span>
            <span class="feedback-text">Acceptable</span>
          </button>
          <button class="ml-feedback-btn ml-feedback-negative" data-feedback="negative">
            <span class="feedback-emoji">😟</span>
            <span class="feedback-text">Not satisfied</span>
          </button>
        </div>

        <textarea id="ml-feedbackText" placeholder="Any specific concerns or suggestions? (optional)" rows="3"></textarea>

        <div class="ml-feedback-actions">
          <button class="btn btn-secondary" id="ml-skipFeedback">Skip</button>
          <button class="btn btn-primary" id="ml-submitFeedback" disabled>Submit</button>
        </div>

        <p class="ml-feedback-note">Your feedback helps improve future recommendations using machine learning.</p>
      </div>
    `;

    document.body.appendChild(dialog);

    let selectedFeedback = null;

    // Handle feedback button selection
    dialog.querySelectorAll('.ml-feedback-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        dialog.querySelectorAll('.ml-feedback-btn').forEach(b => b.classList.remove('selected'));
        const target = e.currentTarget;
        target.classList.add('selected');
        selectedFeedback = target.dataset.feedback;
        document.getElementById('ml-submitFeedback').disabled = false;
      });
    });

    // Handle submit
    document.getElementById('ml-submitFeedback').addEventListener('click', async () => {
      const feedbackText = document.getElementById('ml-feedbackText').value;

      if (!window.outcomeTracker) {
        console.error('❌ outcomeTracker not available');
        document.body.removeChild(dialog);
        showThankYouMessage(selectedFeedback === 'positive');
        return;
      }

      try {
        await window.outcomeTracker.recordUserDecision(
          optimizationId,
          selectedFeedback === 'positive',
          {
            sentiment: selectedFeedback,
            comments: feedbackText,
            timestamp: Date.now()
          }
        );
        console.log('✅ User feedback saved to localStorage');
      } catch (err) {
        console.error('❌ Failed to save feedback:', err);
      }

      document.body.removeChild(dialog);

      // Show thank you message
      showThankYouMessage(selectedFeedback === 'positive');
    });

    // Handle skip
    document.getElementById('ml-skipFeedback').addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }

  // Show thank you message
  function showThankYouMessage(positive) {
    const message = document.createElement('div');
    message.className = 'ml-thank-you-toast';
    message.innerHTML = positive
      ? '✨ Thank you! Your feedback helps us improve.'
      : '🙏 Thank you! We\'ll work on better recommendations.';

    document.body.appendChild(message);

    setTimeout(() => {
      message.classList.add('show');
    }, 100);

    setTimeout(() => {
      message.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(message);
      }, 300);
    }, 3000);
  }

  // Wait for optimizePlan function to be available, then wrap it
  let setupAttempts = 0;
  const maxSetupAttempts = 50; // 5 seconds max

  function setupMLIntegration() {
    setupAttempts++;

    if (typeof window.optimizePlan === 'function') {
      // Store original function
      const originalOptimizePlanFunction = window.optimizePlan;

      // Wrap it with ML tracking AND preloading
      window.optimizePlan = async function() {
        console.log('🤖 ML-Enhanced Optimization Starting...');

        // Preload ML constraints FIRST (async)
        await preloadMLConstraints();

        // Track BEFORE optimization
        trackOptimizationStart();

        // Call original optimization function
        const result = originalOptimizePlanFunction.call(this);

        // Track AFTER optimization (with delay to let it complete)
        setTimeout(() => {
          trackOptimizationComplete();
        }, 2000);

        return result;
      };

      console.log('✅ Step 6 ML Integration Active');
      return;
    }

    if (setupAttempts >= maxSetupAttempts) {
      console.warn('⚠️ optimizePlan function not found after 5 seconds.');
      console.warn('💡 ML tracking will not work, but optimization will still function normally.');
      console.warn('💡 This might happen if step6.js failed to load or has errors.');
      return;
    }

    // optimizePlan not ready yet, try again
    if (setupAttempts === 1 || setupAttempts % 10 === 0) {
      console.log(`⏳ Waiting for optimizePlan function... (attempt ${setupAttempts}/${maxSetupAttempts})`);
    }
    setTimeout(setupMLIntegration, 100);
  }

  // Start trying to setup integration when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMLIntegration);
  } else {
    setupMLIntegration();
  }

  // Add CSS for feedback dialog
  const style = document.createElement('style');
  style.textContent = `
    .ml-feedback-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.2);
      z-index: 9998;
      animation: fadeIn 0.3s ease;
    }

    .ml-feedback-modal {
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-card, white);
      border: 1px solid var(--border-primary, #e5e7eb);
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: calc(100% - 40px);
      z-index: 9999;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      animation: slideInRight 0.3s ease;
    }

    @media (min-width: 768px) {
      .ml-feedback-modal {
        width: 380px;
      }
    }

    .ml-feedback-modal h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: var(--text-primary, #111827);
    }

    .ml-feedback-modal > p {
      margin: 0 0 20px 0;
      color: var(--text-secondary, #6b7280);
      font-size: 14px;
    }

    .ml-feedback-options {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .ml-feedback-btn {
      flex: 1;
      padding: 16px 12px;
      border: 2px solid var(--border-primary, #e5e7eb);
      border-radius: 8px;
      background: var(--bg-primary, white);
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .ml-feedback-btn:hover {
      border-color: var(--primary-500, #22c55e);
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .ml-feedback-btn.selected {
      border-color: var(--primary-500, #22c55e);
      background: rgba(34, 197, 94, 0.05);
    }

    .feedback-emoji {
      font-size: 32px;
    }

    .feedback-text {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #111827);
    }

    #ml-feedbackText {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--border-primary, #e5e7eb);
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
      margin-bottom: 16px;
      background: var(--bg-primary, white);
      color: var(--text-primary, #111827);
    }

    #ml-feedbackText:focus {
      outline: none;
      border-color: var(--primary-500, #22c55e);
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
    }

    .ml-feedback-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .ml-feedback-note {
      margin: 16px 0 0 0;
      padding-top: 16px;
      border-top: 1px solid var(--border-primary, #e5e7eb);
      font-size: 12px;
      color: var(--text-muted, #9ca3af);
      text-align: center;
    }

    .ml-thank-you-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--primary-500, #22c55e);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
    }

    .ml-thank-you-toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);

})();
