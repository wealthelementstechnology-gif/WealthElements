# WealthElements — Master Build Plan
### From Local Dev → Investor-Ready MVP → Production App

**Document created:** February 2026
**Stack:** MERN (MongoDB, Express, React, Node.js)
**Goal:** Investor-ready MVP hosted on Vercel + Railway, with real auth, Finvu AA, and AI

---

## Current State of the App (What Exists Today)

### What Is Already Built
- React 19 frontend with Tailwind CSS — good UI, mobile responsive
- 6-tab dashboard: Overview, Assets, Spending, Subscriptions, Wellness, Report
- 13 Redux slices (state management for all financial data)
- Financial Wellness scoring system (8 metrics)
- 8 Events Calculator (8-step wizard)
- Mutual Funds page
- Node.js/Express backend with JWT auth (access + refresh tokens)
- Helmet, CORS, rate limiting, bcrypt — security foundations in place
- MongoDB connection configured

### What Is Missing / Broken
- Auth: Frontend uses PIN + localStorage only. Backend uses email + password. **They do not connect.**
- All 13 Redux slices use mock/hardcoded data. **Nothing saves to database.**
- Only 1 MongoDB model exists (User). No Account, Transaction, Subscription, Goal models.
- No backend routes for any financial data — only auth routes exist.
- App resets completely on page refresh — no persistence.
- No OTP / mobile-based login (required for Indian fintech).
- No Finvu AA integration.
- No AI integration.
- No deployment — runs only on localhost.

---

## The Architecture (Final State)

```
USER'S PHONE / BROWSER
        |
        ▼
┌─────────────────────────────────────┐
│  VERCEL (Free)                      │
│  app.wealthelements.in              │
│  React Frontend — UI only           │
│  Makes API calls to backend         │
└──────────────┬──────────────────────┘
               │ HTTPS API calls
               ▼
┌─────────────────────────────────────┐
│  RAILWAY (Free tier)                │
│  api.wealthelements.in              │
│  Node.js/Express Backend            │
│  → OTP Auth (MSG91)                 │
│  → JWT session management           │
│  → All financial data APIs          │
│  → Finvu AA consent + processing    │
│  → AI context builder               │
│  → Anthropic Claude API calls       │
└──────────┬──────────────┬───────────┘
           │              │
           ▼              ▼
  ┌─────────────┐   ┌─────────────────────┐
  │ MongoDB     │   │ External Services   │
  │ Atlas       │   │ → Finvu AA Sandbox  │
  │ (Free tier) │   │ → Anthropic API     │
  │ All user    │   │ → MSG91 OTP         │
  │ data        │   └─────────────────────┘
  └─────────────┘
```

---

## Phase 1 — Real Authentication + Data Persistence
**Timeline: Week 1**
**Goal: Real users can sign up, log in, and their data saves permanently**

### 1.1 Rebuild Authentication (Mobile OTP + PIN)

**What needs to change:**

The current backend expects email + password. The current frontend shows a PIN screen but stores everything in localStorage — no server involved. These two systems need to be unified into a proper Indian fintech auth flow.

**New auth flow:**
```
Step 1: User enters mobile number
Step 2: Backend sends OTP via MSG91
Step 3: User enters OTP → verified → account created or logged in
Step 4: User sets a 4-digit PIN (stored as bcrypt hash in DB)
Step 5: On future logins → enter mobile number → PIN only (no OTP every time)
Step 6: Biometric (Face ID / Fingerprint) unlocks the PIN locally on device
```

**Backend changes needed:**

File: `backend/src/models/User.js`
- Remove `email` field (not needed for Indian fintech)
- Remove `password` field
- Add `phone` (unique, required, Indian format validation)
- Add `pinHash` (bcrypt hash of 4/6-digit PIN)
- Add `otpHash` + `otpExpiry` (for OTP verification)
- Add `isVerified` (boolean — true after first OTP verified)
- Add `profile` object (name, dateOfBirth, onboardingCompleted)
- Keep `refreshToken`, `role`, `timestamps`

New files needed in backend:
- `backend/src/services/otp.service.js` — MSG91 API integration
- `backend/src/controllers/auth.controller.js` — rewrite for OTP + PIN flow
- `backend/src/validators/auth.validator.js` — update for phone + PIN validation
- `backend/src/routes/v1/auth.routes.js` — new routes:
  ```
  POST /api/v1/auth/send-otp       → sends OTP to phone number
  POST /api/v1/auth/verify-otp     → verifies OTP, creates/logs in user
  POST /api/v1/auth/set-pin        → user sets PIN after first OTP verify
  POST /api/v1/auth/login-pin      → subsequent logins via PIN
  POST /api/v1/auth/refresh        → refresh JWT (keep existing)
  POST /api/v1/auth/logout         → logout (keep existing)
  GET  /api/v1/auth/me             → get current user (keep existing)
  ```

**Frontend changes needed:**

File: `frontend/src/pages/auth/AuthPage.jsx` — full rewrite:
- Screen 1: Phone number entry (Indian format, +91 prefix)
- Screen 2: OTP entry (6-digit, 5-minute expiry, resend option)
- Screen 3: PIN setup (first time only)
- Screen 4: PIN login (returning users)

File: `frontend/src/services/auth.service.js` — rewrite to call new backend endpoints
File: `frontend/src/store/slices/authSlice.js` — add `phone`, `isVerified`, `profile` fields

**New environment variables needed:**
```
backend/.env additions:
MSG91_AUTH_KEY=your_msg91_key
MSG91_TEMPLATE_ID=your_template_id
MSG91_SENDER_ID=WLTHEL
OTP_EXPIRY_MINUTES=5
```

---

### 1.2 Build All MongoDB Models

All models go in `backend/src/models/`

**Account.js**
```
Fields:
- userId (ref: User)
- accountType: SAVINGS | CURRENT | CREDIT_CARD | LOAN | FD | RD | MUTUAL_FUND | EPF | PPF | STOCKS | REAL_ESTATE | GOLD | OTHER
- accountName (e.g. "HDFC Savings")
- balance (Number)
- assetOrLiability: ASSET | LIABILITY
- currency (default: INR)
- lastSyncedAt (Date — for Finvu AA sync timestamp)
- source: MANUAL | FINVU_AA (how the data was added)
- finvuAccountId (optional — for AA-linked accounts)
- isActive (Boolean)
- timestamps
```

**Transaction.js**
```
Fields:
- userId (ref: User)
- accountId (ref: Account)
- amount (Number)
- type: CREDIT | DEBIT
- category (from EXPENSE_CATEGORIES constants)
- isManualCategory (Boolean — true if user manually set it)
- description (raw narration from bank)
- cleanDescription (AI/rule cleaned version)
- date (Date)
- source: MANUAL | FINVU_AA
- tags (Array of strings)
- timestamps
```

**Subscription.js**
```
Fields:
- userId (ref: User)
- brandName (Netflix, Spotify, etc.)
- amount (Number)
- frequency: MONTHLY | QUARTERLY | ANNUAL
- nextRenewalDate (Date)
- status: ACTIVE | INACTIVE | DETECTED (detected = needs user confirmation)
- detectedFromTransactionId (ref: Transaction — if auto-detected)
- source: MANUAL | AUTO_DETECTED
- timestamps
```

**Goal.js**
```
Fields:
- userId (ref: User)
- title (e.g. "Buy Home in Vikhroli")
- targetAmount (Number)
- currentAmount (Number)
- targetDate (Date)
- category: HOME | RETIREMENT | EDUCATION | EMERGENCY | TRAVEL | WEDDING | OTHER
- priority: HIGH | MEDIUM | LOW
- isCompleted (Boolean)
- timestamps
```

**FinancialProfile.js**
```
Fields:
- userId (ref: User, unique)
- monthlyIncome (Number)
- monthlyExpenses (Number — calculated from transactions)
- savingsRate (Number — calculated)
- emergencyFundMonths (Number — calculated)
- riskProfile: CONSERVATIVE | MODERATE | AGGRESSIVE
- aaConsentHandle (String — Finvu AA consent reference)
- aaConsentStatus: ACTIVE | EXPIRED | REVOKED | NONE
- aaLastSyncedAt (Date)
- onboardingStep (Number 1-5 — tracks where user is in onboarding)
- timestamps
```

**Conversation.js** (for AI memory)
```
Fields:
- userId (ref: User)
- messages (Array):
    - role: user | assistant
    - content (String)
    - timestamp (Date)
- sessionId (String)
- timestamps
```

---

### 1.3 Build All Backend API Routes

All routes go under `/api/v1/`
All routes are protected (JWT required) except auth routes

**Accounts routes** — `backend/src/routes/v1/accounts.routes.js`
```
GET    /accounts              → get all accounts (assets + liabilities)
POST   /accounts              → add account manually
PUT    /accounts/:id          → update account
DELETE /accounts/:id          → delete account
GET    /accounts/networth     → get networth summary + trend data
```

**Transactions routes** — `backend/src/routes/v1/transactions.routes.js`
```
GET    /transactions           → get transactions (with filters: month, category)
POST   /transactions           → add transaction manually
PUT    /transactions/:id       → update transaction
PUT    /transactions/:id/category → update category (manual override)
GET    /transactions/summary   → monthly spending summary by category
GET    /transactions/trend     → 6-month spending trend
```

**Subscriptions routes** — `backend/src/routes/v1/subscriptions.routes.js`
```
GET    /subscriptions          → get all subscriptions
POST   /subscriptions          → add subscription manually
PUT    /subscriptions/:id      → update subscription
PUT    /subscriptions/:id/confirm  → confirm auto-detected subscription
PUT    /subscriptions/:id/cancel   → mark as cancelled
```

**Goals routes** — `backend/src/routes/v1/goals.routes.js`
```
GET    /goals                  → get all goals
POST   /goals                  → create goal
PUT    /goals/:id              → update goal
DELETE /goals/:id              → delete goal
```

**Profile routes** — `backend/src/routes/v1/profile.routes.js`
```
GET    /profile                → get financial profile
PUT    /profile                → update profile (income, risk profile, etc.)
PUT    /profile/onboarding     → update onboarding step
```

**Wellness routes** — `backend/src/routes/v1/wellness.routes.js`
```
GET    /wellness/score         → calculate + return full wellness score
GET    /wellness/cashflow      → cash flow clarity metrics
GET    /wellness/emergency     → emergency fund readiness
GET    /wellness/goals         → goal discipline score
```

---

### 1.4 Connect Frontend to Backend (Remove All Mock Data)

Each Redux slice needs to be updated to fetch from backend instead of using mock data.

**Changes per slice:**

`networthSlice.js` — add async thunk `fetchNetworth`:
- Calls `GET /api/v1/accounts/networth`
- Stores real accounts + trend data

`transactionSlice.js` — add async thunk `fetchTransactions`:
- Calls `GET /api/v1/transactions`
- Stores real transactions + monthly summary

`subscriptionSlice.js` — add async thunks `fetchSubscriptions`, `confirmSubscription`:
- Calls `GET /api/v1/subscriptions`

`goalsSlice.js` — add async thunks `fetchGoals`, `createGoal`:
- Calls `GET /api/v1/goals`

All mock data in `frontend/src/services/mockData.js` gets replaced by API calls.

---

### 1.5 User Onboarding Flow (Manual Data Entry)

Before Finvu AA is integrated, users need to enter their data manually on first login.
This is a 4-step wizard shown after OTP verification:

```
Step 1: Basic details (name, age, monthly income)
Step 2: Add accounts (bank balance, MF, loans — manual entry)
Step 3: Monthly expenses (category-wise, pre-filled with estimates)
Step 4: Goals (what are you saving for?)
```

After completing onboarding:
- Dashboard shows real user data
- AI has enough context to start advising
- FinancialProfile.onboardingCompleted = true

---

## Phase 2 — Finvu Account Aggregator Integration
**Timeline: Week 2**
**Goal: Auto-populate all financial data from real bank/MF sources**

### 2.1 Prerequisites (You Handle These)
- Register on Finvu developer portal: finvu.in/developer
- Get sandbox credentials: `clientApiKey`, `clientSecret`, `fipIds`
- Finvu provides a sandbox with test data — no real bank connection needed
- FIU production registration runs in parallel (takes weeks — start early)

New environment variables:
```
backend/.env additions:
FINVU_BASE_URL=https://webvwdev.finvu.in/consentapi
FINVU_CLIENT_API_KEY=your_sandbox_key
FINVU_CLIENT_SECRET=your_sandbox_secret
FINVU_REDIRECT_URL=https://api.wealthelements.in/api/v1/finvu/callback
```

### 2.2 The Finvu AA Flow (Technical)

```
1. User taps "Connect Your Accounts" in app
        ↓
2. Frontend calls: POST /api/v1/finvu/initiate-consent
        ↓
3. Backend calls Finvu API → generates consentHandle
   Specifies what data to request:
   - DEPOSIT (bank accounts)
   - MUTUAL_FUNDS
   - INSURANCE_POLICIES
   - EPF
   - TERM_DEPOSIT
        ↓
4. Backend returns consentUrl to frontend
        ↓
5. Frontend opens Finvu consent screen (in-app webview or redirect)
   User sees: "WealthElements is requesting access to..."
   User approves → OTP verified on their registered mobile
        ↓
6. Finvu calls our backend: POST /api/v1/finvu/callback
   Sends: consentHandle + status (ACTIVE)
        ↓
7. Backend calls Finvu: POST /finvu/fetchData
   Finvu contacts each bank/institution
   Returns encrypted signed JSON (JWE format)
        ↓
8. Backend decrypts + parses the data
        ↓
9. Categorization engine runs (see 2.3)
        ↓
10. Data saved to MongoDB
    Dashboard updates with real data
```

### 2.3 Categorization Engine

Two-layer system for labeling bank transactions:

**Layer 1 — Rule-based (handles ~80% of transactions)**

File: `backend/src/services/categorization.service.js`

Rules based on existing constants in `frontend/src/utils/constants.js` (EXPENSE_CATEGORIES keywords):
```javascript
// Examples of rules:
"BIGBASKET" or "GROFERS" or "ZEPTO" or "BLINKIT" → Grocery & Toiletries
"RENTPAY" or "RENT" or "SOCIETY"                 → House Rent, Maintenance
"SWIGGY" or "ZOMATO"                             → Dining, Movies, Sports
"UBER" or "OLA" or "IRCTC"                       → Travel
"APOLLO" or "MEDPLUS" or "PHARMACY"              → Doctor Visits, Medicines
"NACH" + amount pattern                          → Insurance / EMI (check amount)
"RAZORPAY" + ₹649/month                         → Netflix (subscription detection)
"RAZORPAY" + ₹199/month                         → Spotify
"NEFT" + "SALARY" or "SAL"                      → Income (skip categorizing)
"MUTUAL" or "CAMS" or "KFINTECH"                → Investment (skip categorizing)
```

**Layer 2 — AI categorization (remaining ~20%)**

Transactions Layer 1 cannot identify go to Claude Haiku (cheapest model):
```
Prompt: "Categorize these Indian bank transactions into one of:
[Grocery, Rent, Transport, Healthcare, Education, Insurance,
Investment, Entertainment, Subscriptions, EMI/Loans, Utilities,
Shopping, Income, Transfer, Other]

Return JSON array with transactionId and category only."
```

**Layer 3 — User confirmation (for ambiguous ones)**

If AI confidence is low, flag for user review:
- App shows: "We saw a ₹8,500 transfer — what was this for?"
- User picks category once → saved permanently
- That merchant is learned for future transactions

### 2.4 Subscription Auto-Detection

After categorization, run subscription detection:

File: `backend/src/services/subscription.service.js`

Logic:
```
1. Find all transactions where:
   - Same amount (±₹5)
   - Same merchant/narration pattern
   - Recurring: monthly (28-31 days apart) OR annual (360-365 days apart)

2. If pattern found → create Subscription with status: DETECTED

3. Frontend shows: "We detected a recurring ₹649 charge (Netflix).
   Is this correct?" → User confirms → status: ACTIVE
```

### 2.5 New Backend Routes for Finvu AA

`backend/src/routes/v1/finvu.routes.js`
```
POST   /finvu/initiate-consent   → start consent flow, return consentUrl
GET    /finvu/consent-status     → check if consent is active
POST   /finvu/callback           → Finvu webhook (consent approved)
POST   /finvu/sync               → manually trigger data re-fetch
DELETE /finvu/revoke             → user revokes consent, delete AA data
GET    /finvu/consent-info       → show user what data is shared + expiry
```

### 2.6 What Gets Auto-Populated After AA

| App Section | Populated From AA |
|---|---|
| Net Worth / Assets | Bank balances, MF holdings, EPF, FDs |
| Liabilities | Loans, credit card outstanding |
| Spending Tab | Transaction history, categorized |
| Subscriptions Tab | Auto-detected from recurring debits |
| 8 Events Step 1 | Expense categories (3-month average) |
| 8 Events Step 4 | Investment data from CAMS/CDSL |
| 8 Events Step 5 | Asset data from all accounts |
| Wellness Tab | Real cash flow, savings rate, EMI burden |
| AI Context | Complete verified financial snapshot |

---

## Phase 3 — AI Integration
**Timeline: Week 3**
**Goal: Working AI advisor that knows user's real financial data**

### 3.1 Prerequisites (You Handle These)
- Create Anthropic account: console.anthropic.com
- Get API key — add credits ($10 is enough for testing)
- Add to backend environment:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3.2 The AI Architecture

**Context Builder** — runs before every AI message

File: `backend/src/services/ai.context.service.js`

Before sending any message to Claude, build a complete financial snapshot:
```javascript
{
  user: {
    name: "Sumit",
    age: 28,
    monthlyIncome: 124000,
    riskProfile: "MODERATE"
  },
  networth: {
    total: 450000,
    assets: 650000,
    liabilities: 200000
  },
  spending: {
    lastMonthTotal: 31200,
    topCategories: [
      { name: "Rent", amount: 25000 },
      { name: "Groceries", amount: 4200 },
      { name: "Subscriptions", amount: 1448 }
    ],
    savingsRate: 0.74  // 74% of income saved
  },
  goals: [
    { title: "Home Purchase", target: 10000000, current: 450000, deadline: "2029-01" }
  ],
  subscriptions: {
    total: 1648,
    count: 4,
    list: ["Netflix ₹649", "Spotify ₹199", "Amazon Prime ₹299"]
  },
  emergencyFund: {
    months: 3.2,
    isAdequate: false  // less than 6 months
  },
  aaConnected: true,
  aaLastSync: "2026-02-15"
}
```

This snapshot is injected into every AI conversation as the system context.

**System Prompt** — the AI's personality and expertise

File: `backend/src/services/ai.system-prompt.js`

```
You are WealthElements AI — a specialized personal finance advisor for Indian users.
You have deep expertise in:
- Indian financial products (MF, FD, PPF, NPS, ELSS, SGB)
- Indian tax law (Section 80C, 80D, 24(b), LTCG, STCG)
- Indian real estate market dynamics
- RBI regulations and banking norms
- Indian insurance (term, health, ULIP)
- SIP, SWP, lumpsum investment strategies
- EMI calculations and loan management

You have access to the user's complete financial data (shown above).
Always reference their actual numbers. Never give generic advice.
Run real calculations. Show your math.
Take a clear position — do not hedge with "it depends."
Validate emotions before correcting financial thinking.
Flag risks clearly. Offer multiple concrete scenarios.
End responses with a follow-up question to keep the conversation going.

You are NOT a SEBI-registered investment advisor.
Frame advice as analysis and education, not direct investment recommendations.
Add appropriate disclaimers for investment decisions.
```

**Conversation Memory**

Each conversation saves to the `Conversation` MongoDB model.
On each new message, the last 10 messages are included as context.
This gives the AI memory of what was discussed earlier in the session.

**Model Selection (Cost Optimization)**

```
Simple questions (balance check, EMI calc):  Claude Haiku  (~₹0.50/query)
Complex advice (home purchase, investment):   Claude Sonnet (~₹5-8/query)
```

The backend auto-selects based on query complexity.

### 3.3 New Backend Routes for AI

`backend/src/routes/v1/ai.routes.js`
```
POST   /ai/chat              → send message, get AI response
GET    /ai/conversations     → get conversation history
DELETE /ai/conversations     → clear conversation history
GET    /ai/insight           → get today's proactive insight (home screen)
POST   /ai/scenario          → run a specific financial scenario
```

### 3.4 AI UI in Frontend

**AI Chat Panel** — accessible from home screen search bar (when implemented)
- Floating button on dashboard (interim solution)
- Full-screen chat interface
- User's financial snapshot shown at top
- Conversation history displayed

**Proactive Insight Card** — home screen, above Networth
- Single AI-generated insight based on user's current data
- Examples:
  - "Your subscription spend is up ₹800 this month. Netflix, Spotify, Prime — want me to review?"
  - "You're 3 months behind on your Home goal. Here's how to catch up."
  - "Your emergency fund covers 3.2 months. Target is 6. You're ₹94,000 short."
- Tapping the card opens full AI chat with that topic pre-loaded

---

## Phase 4 — PWA + Deployment
**Timeline: Week 4**
**Goal: Live on a real HTTPS URL, installable on phone like an app**

### 4.1 PWA Setup (Makes It Feel Like a Native App)

File: `frontend/public/manifest.json` — create this:
```json
{
  "name": "WealthElements",
  "short_name": "WealthElements",
  "description": "Your AI-powered personal finance advisor",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#111827",
  "theme_color": "#059669",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

File: `frontend/src/sw.js` — service worker for offline support
File: `frontend/index.html` — add manifest link + meta tags

When investor opens the app on their phone:
```
Browser shows: "Add WealthElements to Home Screen"
They tap Add → icon appears on home screen
Opens full screen — no browser bar — looks completely native
```

### 4.2 Backend Deployment on Railway

Steps:
1. Create account at railway.app
2. Connect GitHub repo (push code to GitHub first)
3. Railway auto-detects Node.js — deploys automatically
4. Set environment variables in Railway dashboard:
   - MONGODB_URI (from Atlas)
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - MSG91_AUTH_KEY
   - FINVU_CLIENT_API_KEY
   - ANTHROPIC_API_KEY
   - CLIENT_URL (Vercel URL)
5. Railway assigns URL: `your-app.railway.app`
6. Custom domain: point `api.wealthelements.in` to Railway

### 4.3 Frontend Deployment on Vercel

Steps:
1. Create account at vercel.com
2. Connect GitHub repo
3. Vercel auto-detects Vite — builds and deploys automatically
4. Set environment variable:
   - VITE_API_URL=https://api.wealthelements.in/api/v1
5. Vercel assigns URL: `your-app.vercel.app`
6. Custom domain: point `app.wealthelements.in` to Vercel

### 4.4 MongoDB Atlas (Cloud Database)

Steps:
1. Create account at mongodb.com/atlas
2. Create free cluster (M0 — 512MB, free forever)
3. Create database user + password
4. Whitelist Railway's IP (or allow all IPs: 0.0.0.0/0 for MVP)
5. Get connection string → add to Railway env as MONGODB_URI

### 4.5 Domain Setup (Optional for MVP, Recommended)

Buy `wealthelements.in` (~₹800/year) from GoDaddy/Namecheap/BigRock:
```
app.wealthelements.in    → CNAME → Vercel
api.wealthelements.in    → CNAME → Railway
```
Both Vercel and Railway provide free SSL certificates automatically.

---

## Security Implementation

### Authentication Security
- JWT access token: 15-minute expiry
- JWT refresh token: 7-day expiry, stored in httpOnly cookie
- PIN stored as bcrypt hash (12 rounds) — never plain text
- OTP: valid 5 minutes, max 3 attempts, then 10-minute lockout
- New device login → OTP re-verification required

### API Security (Already Partially In Place)
- Helmet.js for security headers ✓ (already exists)
- CORS restricted to app domain ✓ (already exists)
- Rate limiting ✓ (already exists — may need tuning)
- Input validation via express-validator ✓ (already exists)

Additional needed:
- Specific rate limit for OTP endpoint: 3 per phone per hour
- Specific rate limit for AI endpoint: 20 per user per hour
- Request size limits: 10kb for general, 1MB for file uploads

### Data Security
- All sensitive fields encrypted at rest (pinHash, AA consent data)
- Bank account numbers stored masked only (XXXX1234)
- Finvu AA raw data not stored — only processed output stored
- All API communication over HTTPS (enforced by Vercel + Railway)

### Finvu AA Data Policy
- Raw bank statements: not stored, processed in memory only
- Processed/categorized data: stored per user consent period
- On account deletion: all data purged within 72 hours
- User can revoke AA consent at any time from app Settings

---

## Cost Summary

### During Development (Your PC Only)
| Item | Cost |
|---|---|
| Everything | ₹0 |

### MVP Hosting (After Deployment)
| Service | What | Cost/month |
|---|---|---|
| Vercel | React frontend | Free |
| Railway | Node.js backend | Free ($5 credit) |
| MongoDB Atlas | Database | Free (512MB) |
| MSG91 | OTP SMS | ₹0.15/OTP × ~50 OTPs = ~₹8 |
| Anthropic API | AI conversations | ₹500–1,000 (testing) |
| Finvu Sandbox | AA integration | Free |
| **Total** | | **~₹500–1,000/month** |

### When You Have Real Users (500+)
| Service | Cost/month |
|---|---|
| Railway (paid) | ~₹1,000 |
| MongoDB Atlas (M2) | ~₹750 |
| Anthropic API | ₹17,000–42,000 |
| Finvu (per fetch) | ₹5,000–20,000 |
| MSG91 | ₹500–2,000 |
| **Total** | **~₹25,000–65,000** |

---

## What You Need to Arrange (Your Actions)

| Item | Where | When | Status |
|---|---|---|---|
| MSG91 account + API key | msg91.com | Before Week 1 | Pending |
| MongoDB Atlas account | mongodb.com/atlas | Before Week 1 | Pending |
| Railway account | railway.app | Before Week 4 | Pending |
| Vercel account | vercel.com | Before Week 4 | Pending |
| GitHub account + repo | github.com | Before Week 4 | Pending |
| Anthropic API key | console.anthropic.com | Before Week 3 | Pending |
| Finvu developer sandbox | finvu.in/developer | Before Week 2 | Pending |
| Finvu FIU registration (prod) | Sahamati/Finvu | Start now, long lead | Pending |
| Domain name (optional) | GoDaddy/Namecheap | Before Week 4 | Optional |

---

## Week-by-Week Execution Plan

### Week 1 — Foundation
**Day 1–2:**
- Rebuild User model (phone + PIN instead of email + password)
- Build OTP service (MSG91 integration)
- Rewrite auth controller and routes
- Update frontend auth page (phone → OTP → PIN flow)

**Day 3–4:**
- Build all MongoDB models (Account, Transaction, Subscription, Goal, FinancialProfile, Conversation)
- Build all backend API routes (accounts, transactions, subscriptions, goals, profile)
- Build all backend controllers and services

**Day 5–7:**
- Connect all frontend Redux slices to real backend APIs
- Remove all mock data
- Build onboarding flow (4-step wizard for manual data entry)
- Test: sign up → enter data → dashboard shows real data → refresh → data still there

**End of Week 1 milestone:**
> A real user can sign up with their phone number, verify via OTP, set a PIN, enter their financial data manually, and see it on the dashboard — persisting across sessions.

---

### Week 2 — Finvu AA
**Day 1–2:**
- Build Finvu consent flow (initiate, callback webhook, status check)
- Build data decryption and parsing service
- Build categorization engine (Layer 1 rules-based)

**Day 3–4:**
- Build AI categorization fallback (Layer 2 — Claude Haiku)
- Build subscription auto-detection service
- Build AA data sync → MongoDB pipeline

**Day 5–7:**
- Build frontend AA consent UI ("Connect your accounts")
- Build detected subscriptions UI (confirm/dismiss flow)
- Test full flow: connect → data fetches → dashboard populates
- Test categorization accuracy

**End of Week 2 milestone:**
> User connects via Finvu AA sandbox → realistic test financial data populates all tabs automatically → subscriptions auto-detected → 8 Events Step 1 pre-filled.

---

### Week 3 — AI Integration
**Day 1–2:**
- Build context builder service (financial snapshot from MongoDB)
- Build system prompt (Indian finance expertise)
- Anthropic API integration
- Build conversation memory (save/retrieve from MongoDB)

**Day 3–4:**
- Build AI chat UI (full-screen chat panel in frontend)
- Build proactive insight card (home screen)
- Build model routing (Haiku for simple, Sonnet for complex)
- Test with real financial scenarios

**Day 5–7:**
- Fine-tune system prompt based on test conversations
- Add scenario modeling capability (EMI calculator, SIP projections)
- Test the Vikhroli home purchase conversation end-to-end
- Test emotional pushback handling

**End of Week 3 milestone:**
> Investor can have a full AI conversation about their real (sandbox) financial data. AI knows their numbers, runs scenarios, gives grounded recommendations.

---

### Week 4 — PWA + Deployment
**Day 1–2:**
- Push all code to GitHub
- Set up MongoDB Atlas cloud cluster
- Deploy backend to Railway
- Deploy frontend to Vercel
- Configure environment variables on both platforms

**Day 3–4:**
- Set up PWA manifest and service worker
- Test "Add to Home Screen" on actual phones (Android + iOS)
- Set up custom domain (if purchased)
- Configure CORS for production URLs

**Day 5–7:**
- End-to-end testing on real phones
- Performance testing (loading speed, API response times)
- Fix any deployment-specific issues
- Create demo accounts for investor pitches

**End of Week 4 milestone:**
> App is live on https://app.wealthelements.in, installable on phone as a PWA, fully functional with real auth, AA data, and AI. Ready to share with investors.

---

## The Investor Demo Flow

When an investor opens the app for the first time:

```
1. Opens app.wealthelements.in on their phone
2. Sees "Add to Home Screen" prompt → installs as app
3. Opens WealthElements — sees clean onboarding screen
4. Enters their (real or demo) phone number
5. Receives OTP → enters it → sets PIN
6. Sees 4-step onboarding: enters rough income, expenses, goals
7. Sees dashboard with their own data
8. Taps "Connect your accounts" → Finvu AA consent flow
9. AA populates all tabs with realistic sandbox data
10. Taps "Ask AI" or sees proactive insight on home screen
11. Has a real AI conversation about their finances
12. AI knows their numbers, runs real scenarios, gives real advice

Total time from opening app to "wow moment": under 3 minutes.
```

---

## Future Roadmap (Post-Investment)

### After Funding — Phase 5
- React Native app (proper Android + iOS)
- Play Store + App Store submission
- KYC integration (PAN verification via Karza/IDfy)
- SEBI investment advisor registration (for formal investment advice)
- Mutual fund transaction capability (buy/sell MF via BSE StarMF)
- Real-time bank transaction webhooks

### Phase 6
- Multi-user (family accounts)
- Financial planner partner network
- White-label product for banks/NBFCs
- Vernacular language support (Hindi, Marathi, Tamil, Telugu)
- Voice interface for AI conversations

---

## File Structure After Full Build

```
MERN WEALTHELEMENTS/
├── frontend/src/
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AIChatPanel.jsx         ← NEW
│   │   │   ├── AIInsightCard.jsx       ← NEW
│   │   │   └── AIMessageBubble.jsx     ← NEW
│   │   ├── finvu/
│   │   │   ├── ConnectAccountsCard.jsx ← NEW
│   │   │   ├── ConsentStatus.jsx       ← NEW
│   │   │   └── DetectedSubscriptions.jsx ← NEW
│   │   ├── onboarding/
│   │   │   ├── OnboardingWizard.jsx    ← NEW
│   │   │   ├── Step1BasicDetails.jsx   ← NEW
│   │   │   ├── Step2Accounts.jsx       ← NEW
│   │   │   ├── Step3Expenses.jsx       ← NEW
│   │   │   └── Step4Goals.jsx          ← NEW
│   │   ├── cards/                      ← EXISTING (kept)
│   │   ├── charts/                     ← EXISTING (kept)
│   │   ├── common/                     ← EXISTING (kept)
│   │   └── layout/                     ← EXISTING (kept)
│   ├── pages/
│   │   ├── auth/AuthPage.jsx           ← REWRITE
│   │   ├── dashboard/                  ← EXISTING (minor updates)
│   │   └── settings/Settings.jsx       ← UPDATE (add AA revoke, account delete)
│   ├── services/
│   │   ├── api.js                      ← KEEP (minor update)
│   │   ├── auth.service.js             ← REWRITE
│   │   ├── accounts.service.js         ← NEW
│   │   ├── transactions.service.js     ← NEW
│   │   ├── subscriptions.service.js    ← NEW
│   │   ├── goals.service.js            ← NEW
│   │   ├── finvu.service.js            ← NEW
│   │   └── ai.service.js              ← NEW
│   └── store/slices/                   ← UPDATE all to use real APIs
│
├── backend/src/
│   ├── models/
│   │   ├── User.js                     ← REWRITE
│   │   ├── Account.js                  ← NEW
│   │   ├── Transaction.js              ← NEW
│   │   ├── Subscription.js             ← NEW
│   │   ├── Goal.js                     ← NEW
│   │   ├── FinancialProfile.js         ← NEW
│   │   └── Conversation.js             ← NEW
│   ├── controllers/
│   │   ├── auth.controller.js          ← REWRITE
│   │   ├── accounts.controller.js      ← NEW
│   │   ├── transactions.controller.js  ← NEW
│   │   ├── subscriptions.controller.js ← NEW
│   │   ├── goals.controller.js         ← NEW
│   │   ├── profile.controller.js       ← NEW
│   │   ├── finvu.controller.js         ← NEW
│   │   ├── ai.controller.js            ← NEW
│   │   └── wellness.controller.js      ← NEW
│   ├── services/
│   │   ├── auth.service.js             ← REWRITE
│   │   ├── otp.service.js              ← NEW (MSG91)
│   │   ├── finvu.service.js            ← NEW
│   │   ├── categorization.service.js   ← NEW
│   │   ├── subscription.service.js     ← NEW (auto-detection)
│   │   ├── ai.service.js               ← NEW
│   │   ├── ai.context.service.js       ← NEW
│   │   ├── ai.system-prompt.js         ← NEW
│   │   └── wellness.service.js         ← NEW
│   ├── routes/v1/
│   │   ├── auth.routes.js              ← REWRITE
│   │   ├── accounts.routes.js          ← NEW
│   │   ├── transactions.routes.js      ← NEW
│   │   ├── subscriptions.routes.js     ← NEW
│   │   ├── goals.routes.js             ← NEW
│   │   ├── profile.routes.js           ← NEW
│   │   ├── finvu.routes.js             ← NEW
│   │   ├── ai.routes.js                ← NEW
│   │   └── wellness.routes.js          ← NEW
│   └── middleware/                     ← KEEP existing + minor additions
│
└── MASTER_BUILD_PLAN.md               ← THIS FILE
```

---

*This document is the single source of truth for the WealthElements MVP build.
All decisions made in planning conversations are captured here.
Update this document as decisions change or new requirements emerge.*
