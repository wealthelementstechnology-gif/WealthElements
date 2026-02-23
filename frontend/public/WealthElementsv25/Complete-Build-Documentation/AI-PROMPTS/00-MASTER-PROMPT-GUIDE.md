# Master AI Prompt Guide - WealthElements Build

## 🎯 How to Use These Prompts

This folder contains **copy-paste ready prompts** for building WealthElements from scratch using an AI system (Claude, GPT-4, etc.).

---

## 📋 Build Order

Execute prompts in this exact order:

| Step | Prompt File | What It Builds | Time Est. |
|------|-------------|----------------|-----------|
| 1 | `01-PROMPT-Design-System.md` | CSS design system, theme toggle | 2 hours |
| 2 | `02-PROMPT-Landing-Page.md` | Main landing page, navigation | 1 hour |
| 3 | `03-PROMPT-Calculator-SIP.md` | SIP Future Value Calculator | 1 hour |
| 4 | `04-PROMPT-Calculator-All.md` | Remaining 14+ calculators | 3 hours |
| 5 | `05-PROMPT-Step1-PersonalDetails.md` | 8-Events Step 1 | 3 hours |
| 6 | `06-PROMPT-Step2-Insurance.md` | 8-Events Step 2 | 2 hours |
| 7 | `07-PROMPT-Step3-Assets.md` | 8-Events Step 3 | 2 hours |
| 8 | `08-PROMPT-Step4-Retirement.md` | 8-Events Step 4 | 3 hours |
| 9 | `09-PROMPT-Step5-Inflation.md` | 8-Events Step 5 | 2 hours |
| 10 | `10-PROMPT-ML-Features.md` | ML Feature Engineering | 3 hours |
| 11 | `11-PROMPT-ML-Model.md` | TensorFlow.js Model | 4 hours |
| 12 | `12-PROMPT-ML-Tracker.md` | Outcome Tracking System | 3 hours |
| 13 | `13-PROMPT-Step6-Optimization.md` | 8-Events Step 6 (with ML) | 4 hours |
| 14 | `14-PROMPT-Step7-MonteCarlo.md` | Monte Carlo Simulation | 3 hours |
| 15 | `15-PROMPT-Step8-Allocation.md` | Investment Allocation | 2 hours |
| 16 | `16-PROMPT-MutualFund-API.md` | Mutual Fund API Integration | 3 hours |
| 17 | `17-PROMPT-MutualFund-Analyzer.md` | React Fund Analyzer UI | 5 hours |
| 18 | `18-PROMPT-Tax-Calculator.md` | Tax Calculator Module | 3 hours |
| 19 | `19-PROMPT-Financial-Snapshot.md` | Financial Snapshot Dashboard | 2 hours |
| 20 | `20-PROMPT-Integration-Testing.md` | Testing & Bug Fixes | 4 hours |

**Total**: 20 prompts, ~55 hours estimated build time

---

## 🚀 Quick Start Instructions

### For Each Prompt:

1. **Open the prompt file** (e.g., `01-PROMPT-Design-System.md`)
2. **Copy the entire prompt** (from the section marked `=== COPY FROM HERE ===`)
3. **Paste into your AI chat** (Claude, ChatGPT, etc.)
4. **Wait for AI to generate code**
5. **Save the generated files** to your project folder
6. **Test the code** in a browser
7. **Move to the next prompt**

### Example Workflow:

```
You: [Paste prompt from 01-PROMPT-Design-System.md]

AI: [Generates design-system.css with 500+ lines]

You: [Copy code, save to design-system.css]

You: [Test by opening in browser]

You: [Move to 02-PROMPT-Landing-Page.md]
```

---

## 📁 Folder Structure You'll Create

After completing all prompts:

```
WealthElements/
├── index.html                          [Prompt 2]
├── design-system.css                   [Prompt 1]
├── theme.js                            [Prompt 1]
├── index.css                           [Prompt 2]
│
├── calculators/                        [Prompts 3-4]
│   ├── index.html
│   ├── sip-calculator.html
│   ├── sip-calculator.js
│   ├── [14 more calculators]
│   └── styles.css
│
├── 8-events-calculator/                [Prompts 5-15]
│   ├── index.html
│   ├── 8-events.js
│   ├── step1.html
│   ├── step1.js
│   ├── step2.html → step8.html
│   ├── step2.js → step8.js
│   ├── ml-features.js                  [Prompt 10]
│   ├── ml-model.js                     [Prompt 11]
│   ├── outcome-tracker.js              [Prompt 12]
│   └── styles.css
│
├── mutual-fund-analyzer/               [Prompts 16-17]
│   ├── index.html
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   ├── calculations.js
│   │   ├── components.js
│   │   └── utils.js
│   └── styles.css
│
├── tax-calculator/                     [Prompt 18]
│   ├── index.html
│   ├── tax-calc.js
│   └── styles.css
│
├── financial-snapshot/                 [Prompt 19]
│   ├── index.html
│   ├── snapshot.js
│   └── styles.css
│
└── images/                             [Manual]
    └── [Logo and assets]
```

---

## 🎨 Prompt Template Structure

Each prompt follows this format:

```markdown
# [Component Name]

## Context
[What this component does]

## Requirements
[Detailed specifications]

## Code Structure
[File organization]

## Implementation Details
[Formulas, algorithms, logic]

## Code Examples
[Reference implementations]

=== COPY FROM HERE ===

[ACTUAL PROMPT TO COPY-PASTE]

=== COPY UNTIL HERE ===
```

---

## 💡 Tips for Best Results

### 1. **Use a Capable AI Model**
- ✅ Claude Sonnet 4.5 or Opus 4.5 (Recommended)
- ✅ GPT-4 or GPT-4 Turbo
- ✅ Gemini Pro
- ❌ Avoid: GPT-3.5, Claude Haiku (too simple)

### 2. **Be Specific in Follow-ups**
If AI generates incomplete code:
```
"The code is missing the calculateSIPFutureValue function.
Please add it using this formula: FV = P × [(1+r)^n - 1] / r × (1+r)"
```

### 3. **Test Incrementally**
Don't wait until all 20 prompts are done. Test after each prompt:
- Open HTML in browser
- Check console for errors
- Verify calculations manually
- Test edge cases

### 4. **Request Corrections**
If something doesn't work:
```
"The SIP calculation is incorrect. For ₹10,000/month at 12% for 10 years,
it should return ₹23,23,391 but it's showing ₹25,00,000. Please fix the formula."
```

### 5. **Ask for Explanations**
If you need to understand:
```
"Can you explain how the Box-Muller transform works in the Monte Carlo simulation?"
```

---

## 🔧 Troubleshooting Common Issues

### Issue 1: "Code is too long, truncated"
**Solution**: Ask AI to split into multiple files
```
"Please split this into separate files:
1. HTML structure only
2. CSS styles only
3. JavaScript logic only"
```

### Issue 2: "Function not defined"
**Solution**: Check script loading order
```html
<!-- Wrong order -->
<script src="app.js"></script>
<script src="utils.js"></script>

<!-- Correct order -->
<script src="utils.js"></script>
<script src="app.js"></script>
```

### Issue 3: "localStorage not saving"
**Solution**: Check browser settings
```
"My localStorage isn't working. Can you add error handling and
console logs to debug the save/load functions?"
```

### Issue 4: "Charts not rendering"
**Solution**: Verify Chart.js is loaded
```html
<!-- Add before your script -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
```

---

## 📊 Progress Tracking

Use this checklist as you complete prompts:

### Foundation (Prompts 1-2)
- [ ] Design system CSS created and tested
- [ ] Theme toggle works (light/dark mode)
- [ ] Landing page displays correctly
- [ ] Navigation links work

### Calculators (Prompts 3-4)
- [ ] SIP calculator works correctly
- [ ] Charts display properly
- [ ] All 15 calculators functional
- [ ] Input validation works

### 8-Events Core (Prompts 5-9)
- [ ] Step 1: Can enter personal details
- [ ] Step 2: Insurance gaps calculated
- [ ] Step 3: Asset values correct
- [ ] Step 4: Retirement corpus calculated
- [ ] Step 5: Inflation projection works
- [ ] Data saves to localStorage
- [ ] Navigation between steps works

### ML System (Prompts 10-13)
- [ ] Feature extraction works
- [ ] TensorFlow.js loads successfully
- [ ] Model trains with sample data
- [ ] Outcome tracker saves data
- [ ] Step 6 optimization uses ML
- [ ] Fallback to rules works

### Advanced (Prompts 14-15)
- [ ] Monte Carlo runs 10,000 scenarios
- [ ] Percentiles calculated correctly
- [ ] Step 8 fund allocation works

### Mutual Funds (Prompts 16-17)
- [ ] API fetches fund list
- [ ] Filtering by category works
- [ ] Metrics calculated correctly
- [ ] React components render

### Final Modules (Prompts 18-20)
- [ ] Tax calculator accurate
- [ ] Financial snapshot displays
- [ ] All tests pass
- [ ] No console errors

---

## 🎯 Expected Outcomes

After completing all 20 prompts, you'll have:

✅ **Fully functional web application**
- 6 major modules
- 15+ calculators
- ML-powered optimization
- Monte Carlo simulation
- Mutual fund analyzer
- Tax calculator

✅ **Production-ready code**
- Clean, commented code
- Error handling
- Input validation
- Responsive design
- Dark mode support

✅ **No backend required**
- Pure client-side
- localStorage persistence
- API integration
- Offline-capable (except MF data)

---

## 📞 Support Resources

If you get stuck:

1. **Review the main documentation**
   - [01-PROJECT-OVERVIEW.md](../01-PROJECT-OVERVIEW.md)
   - [02-FINANCIAL-FORMULAS.md](../02-FINANCIAL-FORMULAS.md)
   - [03-ML-SYSTEM-ARCHITECTURE.md](../03-ML-SYSTEM-ARCHITECTURE.md)

2. **Check the existing codebase**
   - Look at actual implementation
   - Copy patterns that work
   - Use as reference

3. **Debug systematically**
   - Check browser console
   - Verify localStorage
   - Test calculations manually
   - Inspect network requests

---

## 🚀 Ready to Start?

Begin with **Prompt 1**: [01-PROMPT-Design-System.md](./01-PROMPT-Design-System.md)

Follow the order strictly for best results!

---

**Total Build Time**: ~55 hours (spread over 2-3 weeks)
**Skill Level Required**: AI does the coding, you just copy-paste and test
**Cost**: Free (just needs AI chat access)

Good luck! 🎉
