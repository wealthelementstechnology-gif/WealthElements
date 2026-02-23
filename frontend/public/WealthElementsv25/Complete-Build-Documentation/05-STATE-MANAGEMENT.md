# State Management & Data Persistence

## Overview

WealthElements uses **browser localStorage** for all data persistence. This provides:
- Offline-first functionality
- Privacy (data never leaves user's browser)
- No server costs
- Instant load times

---

## localStorage Keys Used

### Core Application Data

```javascript
// Step 1: Personal Details
'we_step1' = {
  familyMode: "individual" | "couple",
  person1: {
    name: string,
    age: number,
    retirementAge: number,
    monthlyIncome: [{ source, amount }],
    otherIncome: number,
    providentFund: number
  },
  person2: { ... },  // If couple
  assets: {
    realEstate: [{ name, value, purchaseYear }],
    vehicles: [{ name, value, purchaseYear }],
    valuables: number,
    investments: number,
    bankBalance: number
  },
  liabilities: [{ name, amount, emi, tenure }],
  insurance: {
    life: number,
    health: number
  },
  monthlyExpenses: {
    housing: number,
    utilities: number,
    groceries: number,
    // ... 22 categories
  }
}

// Step 2: Insurance Analysis (derived, not stored)

// Step 3: Asset Analysis (derived from step1)

// Step 4: Retirement Planning
'we_step4_retirement' = {
  retirementCorpus: number,
  monthlyPostRetirement: number,
  yearsToRetirement: number
}

'we_step4_goals' = [
  {
    id: string,
    name: string,
    targetAmount: number,
    timeline: number,
    priority: "High" | "Medium" | "Low"
  }
]

// Step 5: Expense Inflation (calculated from step1)

// Step 6: Goal Optimization
'we_plan_goals' = [
  {
    id: string,
    name: string,
    fv: number,  // Target future value
    yearsLeft: number,
    sip: number,  // Monthly SIP required
    priority: string,
    type: string,
    rateOfReturn: number,
    targetYear: number
  }
]

'we_invest_rule' = "conservative" | "moderate" | "aggressive"

// Step 7: Probability Analysis (calculated on-the-fly)

// Step 8: Investment Allocation
'we_step8_assignments' = [
  {
    goalId: string,
    goalName: string,
    allocation: number,  // Percentage
    recommendedFunds: [
      {
        schemeCode: string,
        schemeName: string,
        allocation: number  // Percentage within goal
      }
    ]
  }
]
```

### Theme & Preferences

```javascript
'wealth-elements-theme' = "light" | "dark"
```

### ML System Data

```javascript
// User ID (persistent identifier)
'we_user_id' = "user_1704067200000_abc123"

// ML Model
'tensorflowjs_models/constraint-predictor-model/...' = {
  // Model weights and architecture (TensorFlow.js format)
  modelTopology: {},
  weightSpecs: [],
  weightData: ArrayBuffer
}

'ml_model_metadata' = {
  version: "1.0",
  trainedDate: "2025-01-02T12:00:00Z",
  sampleCount: 150,
  finalLoss: 0.0234,
  finalValLoss: 0.0289
}

// Outcome Tracking
'we_optimization_outcomes' = [
  {
    optimizationId: string,
    timestamp: number,
    userId: string,
    userProfile: {},
    originalGoals: [],
    optimizationApplied: {},
    budgetContext: {},
    userAccepted: boolean,
    userFeedback: string,
    outcome: {
      planStarted: boolean,
      monthsFollowed: number,
      actualSIPsPaid: [],
      goalsAchieved: [],
      planAbandoned: boolean
    }
  }
]

// ML Statistics
'ml_statistics' = {
  totalOptimizations: number,
  acceptedOptimizations: number,
  successfulPlans: number,
  acceptanceRate: number,
  successRate: number
}
```

---

## localStorage Limits

### Quota
- **Typical limit**: 5-10 MB per domain
- **Check available space**:
```javascript
function getLocalStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return (total / 1024).toFixed(2) + ' KB';
}
```

### Size Management

```javascript
// Clear old data if approaching limit
function manageStorageQuota() {
  const size = getLocalStorageSize();

  if (size > 4000) {  // 4 MB warning
    console.warn('localStorage approaching limit');

    // Keep only recent 100 outcome records
    const outcomes = JSON.parse(localStorage.getItem('we_optimization_outcomes') || '[]');
    if (outcomes.length > 100) {
      const recent = outcomes.slice(-100);
      localStorage.setItem('we_optimization_outcomes', JSON.stringify(recent));
    }
  }
}
```

---

## Save/Load Utilities

### Generic Save Function

```javascript
function saveToLocalStorage(key, data) {
  try {
    const jsonString = JSON.stringify(data);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      alert('Storage limit reached. Please clear old data.');
    } else {
      console.error('Error saving to localStorage:', error);
    }
    return false;
  }
}
```

### Generic Load Function

```javascript
function loadFromLocalStorage(key, defaultValue = null) {
  try {
    const jsonString = localStorage.getItem(key);

    if (!jsonString) {
      return defaultValue;
    }

    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
}
```

### Delete Function

```javascript
function deleteFromLocalStorage(key) {
  localStorage.removeItem(key);
}
```

---

## Step-Specific Save/Load

### Step 1: Personal Details

```javascript
// Save
function saveStep1Data() {
  const data = {
    familyMode: getFamilyMode(),
    person1: getPerson1Data(),
    person2: getFamilyMode() === 'couple' ? getPerson2Data() : null,
    assets: getAssetsData(),
    liabilities: getLiabilitiesData(),
    insurance: getInsuranceData(),
    monthlyExpenses: getExpensesData()
  };

  saveToLocalStorage('we_step1', data);
  console.log('Step 1 data saved');
}

// Load
function loadStep1Data() {
  const data = loadFromLocalStorage('we_step1');

  if (data) {
    setFamilyMode(data.familyMode);
    setPerson1Data(data.person1);
    if (data.person2) setPerson2Data(data.person2);
    setAssetsData(data.assets);
    setLiabilitiesData(data.liabilities);
    setInsuranceData(data.insurance);
    setExpensesData(data.monthlyExpenses);

    console.log('Step 1 data loaded');
  } else {
    console.log('No saved Step 1 data found');
  }
}
```

### Step 4: Goals

```javascript
// Save goals
function saveGoals(goals) {
  saveToLocalStorage('we_step4_goals', goals);
}

// Load goals
function loadGoals() {
  return loadFromLocalStorage('we_step4_goals', []);
}

// Add new goal
function addGoal(goal) {
  const goals = loadGoals();
  goal.id = 'goal_' + Date.now();
  goals.push(goal);
  saveGoals(goals);
  return goal.id;
}

// Update goal
function updateGoal(goalId, updates) {
  const goals = loadGoals();
  const index = goals.findIndex(g => g.id === goalId);

  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates };
    saveGoals(goals);
    return true;
  }

  return false;
}

// Delete goal
function deleteGoal(goalId) {
  const goals = loadGoals();
  const filtered = goals.filter(g => g.id !== goalId);
  saveGoals(filtered);
}
```

### Step 6: Optimized Goals

```javascript
// Save optimized goals
function saveOptimizedGoals(goals) {
  saveToLocalStorage('we_plan_goals', goals);
  console.log('Optimized goals saved');
}

// Load optimized goals
function loadOptimizedGoals() {
  return loadFromLocalStorage('we_plan_goals', null);
}
```

---

## Data Migration

### Version Updates

```javascript
const DATA_VERSION = '2.0';

function migrateData() {
  const currentVersion = localStorage.getItem('we_data_version');

  if (!currentVersion) {
    // Migrating from v1.x to v2.0
    console.log('Migrating data to v2.0...');

    // Example: Rename keys
    const oldGoals = localStorage.getItem('goals');
    if (oldGoals) {
      localStorage.setItem('we_step4_goals', oldGoals);
      localStorage.removeItem('goals');
    }

    // Set version
    localStorage.setItem('we_data_version', DATA_VERSION);
    console.log('Migration complete');
  } else if (currentVersion === '1.0') {
    // Future migrations
  }
}

// Run on app load
document.addEventListener('DOMContentLoaded', () => {
  migrateData();
});
```

---

## Export/Import Functionality

### Export All Data

```javascript
function exportAllData() {
  const exportData = {
    version: DATA_VERSION,
    exportDate: new Date().toISOString(),
    data: {}
  };

  // Collect all WealthElements data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('we_') || key.startsWith('wealth-elements-')) {
      exportData.data[key] = localStorage.getItem(key);
    }
  }

  return JSON.stringify(exportData, null, 2);
}

// Download as file
function downloadData() {
  const data = exportAllData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `wealth-elements-backup-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
}
```

### Import Data

```javascript
function importData(jsonString) {
  try {
    const importData = JSON.parse(jsonString);

    if (!importData.version || !importData.data) {
      throw new Error('Invalid backup file format');
    }

    // Confirm with user
    const confirm = window.confirm(
      'This will overwrite your current data. Continue?'
    );

    if (!confirm) return false;

    // Clear existing data
    for (let key in localStorage) {
      if (key.startsWith('we_') || key.startsWith('wealth-elements-')) {
        localStorage.removeItem(key);
      }
    }

    // Import new data
    for (let key in importData.data) {
      localStorage.setItem(key, importData.data[key]);
    }

    alert('Data imported successfully. Page will reload.');
    window.location.reload();

    return true;
  } catch (error) {
    alert('Error importing data: ' + error.message);
    return false;
  }
}

// File upload handler
document.getElementById('import-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    importData(event.target.result);
  };

  reader.readAsText(file);
});
```

---

## Clear Data

### Clear Specific Step

```javascript
function clearStep(stepNumber) {
  const key = `we_step${stepNumber}`;
  deleteFromLocalStorage(key);
  console.log(`Step ${stepNumber} data cleared`);
}
```

### Clear All Data

```javascript
function clearAllData() {
  const confirm = window.confirm(
    'Are you sure you want to delete ALL your data? This cannot be undone.'
  );

  if (!confirm) return;

  // Clear all WealthElements keys
  const keysToDelete = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('we_') || key.startsWith('wealth-elements-') || key.startsWith('tensorflowjs')) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => localStorage.removeItem(key));

  alert('All data cleared. Page will reload.');
  window.location.href = '/';
}
```

---

## Session vs Persistent Storage

### Session Storage (for temporary data)

```javascript
// Use sessionStorage for wizard state that should not persist
sessionStorage.setItem('current_step', '3');
sessionStorage.setItem('temp_calculation', JSON.stringify(tempData));

// Clears when tab/browser closes
```

### Cookies (for preferences)

```javascript
// Set cookie (7 days)
function setCookie(name, value, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Get cookie
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
}
```

---

## Data Validation

### Validate Before Save

```javascript
function validateStep1Data(data) {
  const errors = [];

  if (!data.familyMode) {
    errors.push('Family mode is required');
  }

  if (!data.person1 || !data.person1.name) {
    errors.push('Name is required');
  }

  if (!data.person1.age || data.person1.age < 18 || data.person1.age > 100) {
    errors.push('Valid age is required (18-100)');
  }

  if (!data.monthlyExpenses || Object.keys(data.monthlyExpenses).length === 0) {
    errors.push('Monthly expenses are required');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// Use in save function
function saveStep1DataWithValidation() {
  const data = collectStep1Data();
  const validation = validateStep1Data(data);

  if (!validation.valid) {
    alert('Please fix the following errors:\n' + validation.errors.join('\n'));
    return false;
  }

  saveToLocalStorage('we_step1', data);
  return true;
}
```

---

## Auto-Save

### Debounced Auto-Save

```javascript
let autoSaveTimeout = null;

function scheduleAutoSave() {
  // Clear existing timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  // Save after 2 seconds of inactivity
  autoSaveTimeout = setTimeout(() => {
    saveStep1Data();
    showNotification('Auto-saved');
  }, 2000);
}

// Attach to input events
document.querySelectorAll('input, select, textarea').forEach(element => {
  element.addEventListener('input', scheduleAutoSave);
  element.addEventListener('change', scheduleAutoSave);
});
```

---

## localStorage Best Practices

### 1. Always Use Try-Catch
```javascript
try {
  localStorage.setItem(key, value);
} catch (error) {
  handleStorageError(error);
}
```

### 2. Check for Availability
```javascript
function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
```

### 3. Compress Large Data
```javascript
// For very large datasets, consider compression
function compressData(data) {
  // Simple example - in production use a library like lz-string
  return btoa(JSON.stringify(data));
}

function decompressData(compressed) {
  return JSON.parse(atob(compressed));
}
```

### 4. Namespace Your Keys
```javascript
// Good: Prefixed keys
'we_step1'
'we_optimization_outcomes'

// Bad: Generic keys
'data'
'user'
```

### 5. Set Reasonable Defaults
```javascript
const defaultExpenses = {
  housing: 0,
  utilities: 0,
  groceries: 0,
  // ... all categories with 0
};

const expenses = loadFromLocalStorage('we_step1_expenses', defaultExpenses);
```

---

## Debugging Tools

### View All localStorage

```javascript
function debugLocalStorage() {
  console.log('=== localStorage Contents ===');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value.substring(0, 100) + '...');
  }
}
```

### Clear Browser Console

```
localStorage.clear();  // Clear all
localStorage.removeItem('we_step1');  // Clear specific key
```

---

## Summary

**Key Points**:
1. All data stored in browser's localStorage
2. ~5MB limit (monitor usage)
3. Validate before saving
4. Provide export/import for backup
5. Auto-save for better UX
6. Namespace keys with 'we_' prefix
7. Handle QuotaExceededError gracefully

**Next**: See [06-CODE-EXAMPLES.md](./06-CODE-EXAMPLES.md) for complete implementation examples.
