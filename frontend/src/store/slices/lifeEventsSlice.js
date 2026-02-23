import { createSlice } from '@reduxjs/toolkit';

// India-specific inflation assumptions by event type
const INFLATION_RATES = {
  MARRIAGE: 8, // Wedding costs inflation
  FIRST_CHILD: 7, // Child-related expenses
  HOME_PURCHASE: 6, // Real estate appreciation
  PARENTS_CARE: 10, // Medical inflation
  CHILD_EDUCATION: 10, // Education inflation in India
  RETIREMENT: 6, // General inflation
};

// Base costs in 2024 rupees (city-adjusted multipliers can be added)
const BASE_COSTS = {
  MARRIAGE: {
    modest: 1000000, // ₹10L
    moderate: 2500000, // ₹25L
    grand: 5000000, // ₹50L+
  },
  FIRST_CHILD: {
    first_year: 300000, // ₹3L first year
    annual_ongoing: 150000, // ₹1.5L/year ongoing
  },
  HOME_PURCHASE: {
    tier1_2bhk: 8000000, // ₹80L in tier-1 city
    tier1_3bhk: 15000000, // ₹1.5Cr
    tier2_2bhk: 4000000, // ₹40L in tier-2
    tier2_3bhk: 7000000, // ₹70L
  },
  PARENTS_CARE: {
    annual_medical: 200000, // ₹2L/year
    emergency_corpus: 1000000, // ₹10L emergency
  },
  CHILD_EDUCATION: {
    school_annual: 200000, // ₹2L/year
    college_engineering: 2000000, // ₹20L total
    college_medical: 5000000, // ₹50L total
    college_abroad: 4000000, // ₹40L+ total
  },
  RETIREMENT: {
    monthly_expense_multiplier: 300, // 25 years × 12 months
  },
};

const initialState = {
  // User's planned life events
  plannedEvents: [],

  // Readiness calculations for each event
  eventReadiness: {},

  // India-specific tips
  tips: {},

  isLoading: false,
  error: null,
};

const lifeEventsSlice = createSlice({
  name: 'lifeEvents',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setLifeEventsData: (state, action) => {
      const { events, currentSavings } = action.payload;

      state.plannedEvents = events || [];

      // Calculate readiness for each event
      state.plannedEvents.forEach((event) => {
        state.eventReadiness[event.id] = calculateEventReadiness(event, currentSavings);
        state.tips[event.id] = generateEventTips(event);
      });

      state.isLoading = false;
      state.error = null;
    },

    addLifeEvent: (state, action) => {
      const event = {
        ...action.payload,
        id: action.payload.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      state.plannedEvents.push(event);
      state.eventReadiness[event.id] = calculateEventReadiness(event, action.payload.currentSavings || 0);
      state.tips[event.id] = generateEventTips(event);
    },

    updateLifeEvent: (state, action) => {
      const index = state.plannedEvents.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.plannedEvents[index] = { ...state.plannedEvents[index], ...action.payload };
        state.eventReadiness[action.payload.id] = calculateEventReadiness(
          state.plannedEvents[index],
          action.payload.currentSavings || 0
        );
      }
    },

    updateEventSavings: (state, action) => {
      const { eventId, savedAmount } = action.payload;
      const event = state.plannedEvents.find((e) => e.id === eventId);
      if (event) {
        event.currentSavings = savedAmount;
        state.eventReadiness[eventId] = calculateEventReadiness(event, savedAmount);
      }
    },

    removeLifeEvent: (state, action) => {
      state.plannedEvents = state.plannedEvents.filter((e) => e.id !== action.payload);
      delete state.eventReadiness[action.payload];
      delete state.tips[action.payload];
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

// Calculate inflation-adjusted cost
function calculateInflationAdjustedCost(baseCost, yearsAway, eventType) {
  const inflationRate = INFLATION_RATES[eventType] || 6;
  return Math.round(baseCost * Math.pow(1 + inflationRate / 100, yearsAway));
}

// Calculate readiness for a life event
function calculateEventReadiness(event, currentSavings = 0) {
  const { type, targetYear, customCost, variant } = event;
  const savedForEvent = event.currentSavings || currentSavings || 0;

  const now = new Date();
  const yearsAway = Math.max(0, targetYear - now.getFullYear());
  const monthsAway = yearsAway * 12;

  // Get base cost
  let baseCost = customCost || 0;
  if (!customCost) {
    switch (type) {
      case 'MARRIAGE':
        baseCost = BASE_COSTS.MARRIAGE[variant || 'moderate'];
        break;
      case 'FIRST_CHILD':
        baseCost = BASE_COSTS.FIRST_CHILD.first_year;
        break;
      case 'HOME_PURCHASE':
        baseCost = BASE_COSTS.HOME_PURCHASE[variant || 'tier1_2bhk'];
        break;
      case 'PARENTS_CARE':
        baseCost = BASE_COSTS.PARENTS_CARE.annual_medical * 10 + BASE_COSTS.PARENTS_CARE.emergency_corpus;
        break;
      case 'CHILD_EDUCATION':
        baseCost = BASE_COSTS.CHILD_EDUCATION[variant || 'college_engineering'];
        break;
      case 'RETIREMENT':
        baseCost = (event.monthlyExpense || 50000) * BASE_COSTS.RETIREMENT.monthly_expense_multiplier;
        break;
      default:
        baseCost = 500000; // Default ₹5L
    }
  }

  // Calculate inflation-adjusted cost
  const inflationAdjustedCost = calculateInflationAdjustedCost(baseCost, yearsAway, type);

  // Generate cost breakdown explanation
  const inflationRate = INFLATION_RATES[type] || 6;
  const costBreakdown = `Today's cost: ₹${(baseCost / 100000).toFixed(1)}L → At ${inflationRate}% inflation → ${targetYear} cost: ₹${(inflationAdjustedCost / 100000).toFixed(1)}L`;

  // Calculate readiness
  const readinessPercent = inflationAdjustedCost > 0
    ? Math.min(100, (savedForEvent / inflationAdjustedCost) * 100)
    : 0;

  // Calculate monthly needed
  const remaining = Math.max(0, inflationAdjustedCost - savedForEvent);
  const monthlyNeeded = monthsAway > 0 ? Math.ceil(remaining / monthsAway) : remaining;

  // Determine status
  let status = 'NOT_STARTED';
  if (readinessPercent >= 100) {
    status = 'AHEAD';
  } else if (readinessPercent >= 75) {
    status = 'ON_TRACK';
  } else if (readinessPercent >= 25) {
    status = 'BEHIND';
  } else if (savedForEvent > 0) {
    status = 'BEHIND';
  }

  // Generate message
  let message = '';
  switch (status) {
    case 'AHEAD':
      message = `You're fully prepared for this! Consider investing the surplus.`;
      break;
    case 'ON_TRACK':
      message = `Good progress! ${readinessPercent.toFixed(0)}% ready. Keep the momentum.`;
      break;
    case 'BEHIND':
      message = `Need ₹${(monthlyNeeded / 1000).toFixed(0)}K/month to be ready. Consider increasing contributions.`;
      break;
    case 'NOT_STARTED':
      message = `Start saving ₹${(monthlyNeeded / 1000).toFixed(0)}K/month to be ready by ${targetYear}.`;
      break;
  }

  return {
    event: type,
    eventName: getEventName(type),
    targetYear,
    cost: {
      event: type,
      estimatedCost: baseCost,
      inflationAdjustedCost,
      yearsAway,
      inflationRate: INFLATION_RATES[type] || 6,
      costBreakdown,
    },
    currentSavings: savedForEvent,
    readinessPercent: parseFloat(readinessPercent.toFixed(1)),
    monthlyNeeded,
    status,
    message,
    tips: [], // Will be filled separately
  };
}

// Generate India-specific tips
function generateEventTips(event) {
  const tips = [];
  const { type, targetYear } = event;
  const yearsAway = targetYear - new Date().getFullYear();

  switch (type) {
    case 'MARRIAGE':
      tips.push('Book venue and caterer early - prices jump 20-30% closer to auspicious dates.');
      tips.push('Consider weekday or off-season dates for 15-20% savings.');
      tips.push('Prioritize experiences over decor - guests remember food and fun, not flowers.');
      if (yearsAway >= 3) {
        tips.push('Start a dedicated recurring deposit - earns ~7% and builds discipline.');
      }
      break;

    case 'FIRST_CHILD':
      tips.push('Hospital delivery costs ₹50K-3L+ depending on city and hospital type.');
      tips.push('Company health insurance often covers maternity - check your policy.');
      tips.push('Baby gear has high resale value - buy second-hand for items used briefly.');
      tips.push('Start a dedicated child fund from pregnancy itself.');
      break;

    case 'HOME_PURCHASE':
      tips.push('Don\'t stretch beyond 40% of income for EMI - leaves room for life.');
      tips.push('Save for 20% down payment to get better interest rates.');
      tips.push('Factor in registration (5-7%), furnishing (10-15%), and moving costs.');
      tips.push('PMAY subsidy can save ₹2-2.5L for eligible buyers.');
      if (yearsAway >= 5) {
        tips.push('Consider SIP in equity funds for down payment - potential 12%+ returns.');
      }
      break;

    case 'PARENTS_CARE':
      tips.push('Get parents health insurance NOW - premiums double every 5 years after 60.');
      tips.push('Super top-up policies are cost-effective for additional coverage.');
      tips.push('Keep ₹5-10L liquid specifically for medical emergencies.');
      tips.push('Understand their existing insurance and pension - avoid duplication.');
      break;

    case 'CHILD_EDUCATION':
      tips.push('Education inflation in India is 10-12% - start saving early.');
      tips.push('Sukanya Samriddhi Yojana (for girls) gives 8%+ tax-free returns.');
      tips.push('Don\'t sacrifice retirement savings for education - loans exist for education, not retirement.');
      tips.push('Build corpus in child\'s name only after age 10 - you may need flexibility before.');
      if (yearsAway >= 10) {
        tips.push('Equity mutual funds (SIP) can potentially double money in 7-8 years.');
      }
      break;

    case 'RETIREMENT':
      tips.push('Target 25-30x annual expenses for retirement corpus.');
      tips.push('NPS gives extra ₹50,000 tax deduction under 80CCD(1B).');
      tips.push('Healthcare in retirement is expensive - ₹1Cr+ health corpus recommended.');
      tips.push('Don\'t rely only on EPF - returns barely beat inflation.');
      tips.push('Plan for 25-30 years of retirement - life expectancy is increasing.');
      break;

    default:
      tips.push('Set a specific monthly savings target and automate it.');
      tips.push('Review progress every quarter and adjust as needed.');
  }

  return tips;
}

// Get friendly event name
function getEventName(type) {
  const names = {
    MARRIAGE: 'Marriage',
    FIRST_CHILD: 'First Child',
    HOME_PURCHASE: 'Home Purchase',
    PARENTS_CARE: 'Parents Care',
    CHILD_EDUCATION: 'Child Education',
    RETIREMENT: 'Retirement',
  };
  return names[type] || type;
}

export const {
  setLoading,
  setLifeEventsData,
  addLifeEvent,
  updateLifeEvent,
  updateEventSavings,
  removeLifeEvent,
  setError,
  clearError,
} = lifeEventsSlice.actions;

export default lifeEventsSlice.reducer;
