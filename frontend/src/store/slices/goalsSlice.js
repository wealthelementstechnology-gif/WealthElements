import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import goalsService from '../../services/goals.service';

export const fetchGoals = createAsyncThunk('goals/fetchGoals', async (_, { rejectWithValue }) => {
  try { return await goalsService.getGoals(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load goals'); }
});

const initialState = {
  // Active goals
  goals: [],

  // Goal progress tracking
  goalProgress: {},

  // Goal leakage tracking
  leakages: [],
  totalLeakageThisYear: 0,

  // Discipline score
  disciplineScore: {
    score: 0,
    consistencyRate: 0,
    totalLeakage: 0,
    goalsOnTrack: 0,
    totalGoals: 0,
    recommendations: [],
  },

  // Monthly commitment tracking
  monthlyCommitments: [],
  totalMonthlyCommitment: 0,

  isLoading: false,
  error: null,
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setGoalsData: (state, action) => {
      const { goals, leakages, monthlyCommitments } = action.payload;

      // Set goals with defaults for missing properties
      state.goals = (goals || []).map(g => ({
        ...g,
        isActive: g.isActive !== undefined ? g.isActive : true,
        monthlyCommitment: g.monthlyCommitment || g.monthlyContribution || 0,
      }));

      // Set leakages with proper property mapping
      state.leakages = (leakages || []).map(l => ({
        ...l,
        leakageAmount: l.leakageAmount || l.amount || 0,
        month: l.month || new Date().toISOString().slice(0, 7),
      }));

      state.monthlyCommitments = monthlyCommitments || [];

      // Calculate total monthly commitment
      state.totalMonthlyCommitment = state.goals
        .filter((g) => g.isActive)
        .reduce((sum, g) => sum + (g.monthlyCommitment || 0), 0);

      // Calculate progress for each goal
      state.goalProgress = {};
      state.goals.forEach((goal) => {
        const progress = calculateGoalProgress(goal);
        state.goalProgress[goal.id] = progress;
      });

      // Calculate total leakage this year
      const currentYear = new Date().getFullYear();
      state.totalLeakageThisYear = state.leakages
        .filter((l) => l.month && l.month.startsWith(currentYear.toString()))
        .reduce((sum, l) => sum + (l.leakageAmount || 0), 0);

      // Calculate discipline score
      state.disciplineScore = calculateDisciplineScore(
        state.goals,
        state.leakages,
        state.goalProgress
      );

      state.isLoading = false;
      state.error = null;
    },

    addGoal: (state, action) => {
      const goal = {
        ...action.payload,
        id: action.payload.id || action.payload._id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      state.goals.push(goal);
      state.totalMonthlyCommitment += goal.monthlyCommitment || 0;
      state.goalProgress[goal.id] = calculateGoalProgress(goal);
      state.disciplineScore.totalGoals += 1;
    },

    updateGoal: (state, action) => {
      const id = action.payload.id || action.payload._id;
      const index = state.goals.findIndex((g) => g.id === id || g._id === id);
      if (index !== -1) {
        const oldCommitment = state.goals[index].monthlyCommitment || 0;
        state.goals[index] = { ...state.goals[index], ...action.payload };
        const newCommitment = state.goals[index].monthlyCommitment || 0;
        state.totalMonthlyCommitment += (newCommitment - oldCommitment);
        state.goalProgress[id] = calculateGoalProgress(state.goals[index]);
      }
    },

    deactivateGoal: (state, action) => {
      const goal = state.goals.find((g) => g.id === action.payload || g._id === action.payload);
      if (goal) {
        goal.isActive = false;
        state.totalMonthlyCommitment -= goal.monthlyCommitment || 0;
      }
    },

    recordContribution: (state, action) => {
      const { goalId, amount, month } = action.payload;
      const goal = state.goals.find((g) => g.id === goalId || g._id === goalId);
      if (goal) {
        goal.currentAmount += amount;
        state.goalProgress[goalId] = calculateGoalProgress(goal);

        // Check for leakage
        if (amount < goal.monthlyCommitment) {
          const leakage = {
            id: Date.now().toString(),
            goalId,
            month,
            committedAmount: goal.monthlyCommitment,
            actualContribution: amount,
            leakageAmount: goal.monthlyCommitment - amount,
            leakageReason: 'Partial contribution',
            competingSpends: [],
          };
          state.leakages.push(leakage);
          state.totalLeakageThisYear += leakage.leakageAmount;
        }

        // Recalculate discipline score
        state.disciplineScore = calculateDisciplineScore(
          state.goals,
          state.leakages,
          state.goalProgress
        );
      }
    },

    recordLeakage: (state, action) => {
      const leakage = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.leakages.push(leakage);
      state.totalLeakageThisYear += leakage.leakageAmount;

      // Recalculate discipline score
      state.disciplineScore = calculateDisciplineScore(
        state.goals,
        state.leakages,
        state.goalProgress
      );
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        const goals = (action.payload || []).map(g => ({
          ...g,
          id: g._id || g.id,
          isActive: !g.isCompleted,
          monthlyCommitment: g.monthlyCommitment || 0,
        }));
        state.goals = goals;
        state.totalMonthlyCommitment = goals
          .filter(g => g.isActive)
          .reduce((sum, g) => sum + (g.monthlyCommitment || 0), 0);
        state.goalProgress = {};
        goals.forEach(goal => {
          state.goalProgress[goal.id] = calculateGoalProgress(goal);
        });
        state.disciplineScore = calculateDisciplineScore(goals, state.leakages, state.goalProgress);
        state.isLoading = false;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

// Helper function to calculate goal progress
function calculateGoalProgress(goal) {
  const { targetAmount, currentAmount, targetDate, monthlyCommitment } = goal;

  const progressPercent = targetAmount > 0
    ? Math.min(100, (currentAmount / targetAmount) * 100)
    : 0;

  const targetDateObj = new Date(targetDate);
  const now = new Date();
  const monthsRemaining = Math.max(
    0,
    (targetDateObj.getFullYear() - now.getFullYear()) * 12 +
      (targetDateObj.getMonth() - now.getMonth())
  );

  const remaining = targetAmount - currentAmount;
  const requiredMonthlyToComplete = monthsRemaining > 0
    ? Math.ceil(remaining / monthsRemaining)
    : remaining;

  const isOnTrack = monthlyCommitment >= requiredMonthlyToComplete;

  // Project shortfall at current pace
  const projectedTotal = currentAmount + (monthlyCommitment * monthsRemaining);
  const projectedShortfall = Math.max(0, targetAmount - projectedTotal);

  let statusMessage = '';
  if (progressPercent >= 100) {
    statusMessage = 'Goal achieved! Congratulations!';
  } else if (isOnTrack) {
    statusMessage = `On track! Continue your ₹${monthlyCommitment.toLocaleString('en-IN')}/month contribution.`;
  } else if (monthsRemaining === 0) {
    statusMessage = `Target date reached. You need ₹${remaining.toLocaleString('en-IN')} more.`;
  } else {
    statusMessage = `Behind schedule. Increase to ₹${requiredMonthlyToComplete.toLocaleString('en-IN')}/month to catch up.`;
  }

  return {
    goalId: goal.id,
    progressPercent: parseFloat(progressPercent.toFixed(1)),
    monthsRemaining,
    requiredMonthlyToComplete,
    isOnTrack,
    projectedShortfall,
    statusMessage,
  };
}

// Helper function to calculate discipline score
function calculateDisciplineScore(goals, leakages, goalProgress) {
  const activeGoals = goals.filter((g) => g.isActive);
  const totalGoals = activeGoals.length;

  if (totalGoals === 0) {
    return {
      score: 0,
      consistencyRate: 0,
      totalLeakage: 0,
      goalsOnTrack: 0,
      totalGoals: 0,
      recommendations: ['Start by setting at least one financial goal.'],
    };
  }

  // Calculate goals on track
  const goalsOnTrack = Object.values(goalProgress).filter(
    (p) => p.isOnTrack || p.progressPercent >= 100
  ).length;

  // Calculate total leakage in last 12 months
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const recentLeakages = leakages.filter(
    (l) => new Date(l.month) >= oneYearAgo
  );
  const totalLeakage = recentLeakages.reduce((sum, l) => sum + l.leakageAmount, 0);

  // Calculate consistency rate (months with full contribution / total months)
  const totalExpectedContributions = totalGoals * 12;
  const missedContributions = recentLeakages.length;
  const consistencyRate = Math.max(
    0,
    ((totalExpectedContributions - missedContributions) / totalExpectedContributions) * 100
  );

  // Calculate score (weighted)
  const onTrackScore = (goalsOnTrack / totalGoals) * 40;
  const consistencyScore = (consistencyRate / 100) * 40;
  const leakageScore = totalLeakage > 0
    ? Math.max(0, 20 - (totalLeakage / 10000))
    : 20;

  const score = Math.round(onTrackScore + consistencyScore + leakageScore);

  // Generate recommendations
  const recommendations = [];
  if (goalsOnTrack < totalGoals) {
    recommendations.push(`${totalGoals - goalsOnTrack} goal(s) need attention. Review your contribution amounts.`);
  }
  if (consistencyRate < 80) {
    recommendations.push('Set up auto-debit to improve contribution consistency.');
  }
  if (totalLeakage > 50000) {
    recommendations.push(`You leaked ₹${totalLeakage.toLocaleString('en-IN')} from goals. Identify and plug spending leaks.`);
  }
  if (recommendations.length === 0) {
    recommendations.push('Excellent discipline! Consider increasing your goal targets.');
  }

  return {
    score,
    consistencyRate: parseFloat(consistencyRate.toFixed(1)),
    totalLeakage,
    goalsOnTrack,
    totalGoals,
    recommendations,
  };
}

export const {
  setLoading,
  setGoalsData,
  addGoal,
  updateGoal,
  deactivateGoal,
  recordContribution,
  recordLeakage,
  setError,
  clearError,
} = goalsSlice.actions;

export default goalsSlice.reducer;
