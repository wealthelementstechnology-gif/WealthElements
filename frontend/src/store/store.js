import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import networthReducer from './slices/networthSlice';
import transactionReducer from './slices/transactionSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import cashFlowReducer from './slices/cashFlowSlice';
import emergencyFundReducer from './slices/emergencyFundSlice';
import goalsReducer from './slices/goalsSlice';
import healthScoreReducer from './slices/healthScoreSlice';
import lifestyleInflationReducer from './slices/lifestyleInflationSlice';
import riskGuardrailsReducer from './slices/riskGuardrailsSlice';
import lifeEventsReducer from './slices/lifeEventsSlice';
import hygieneReducer from './slices/hygieneSlice';
import realityReportReducer from './slices/realityReportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    networth: networthReducer,
    transactions: transactionReducer,
    subscriptions: subscriptionReducer,
    cashFlow: cashFlowReducer,
    emergencyFund: emergencyFundReducer,
    goals: goalsReducer,
    healthScore: healthScoreReducer,
    lifestyleInflation: lifestyleInflationReducer,
    riskGuardrails: riskGuardrailsReducer,
    lifeEvents: lifeEventsReducer,
    hygiene: hygieneReducer,
    realityReport: realityReportReducer,
  },
});

export default store;
