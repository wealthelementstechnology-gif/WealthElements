# API Integration Guide - Mutual Fund Data

## API Overview

**API Provider**: mfapi.in
**Base URL**: `https://api.mfapi.in`
**Authentication**: None required (public API)
**Rate Limit**: Reasonable use policy (avoid hammering)
**Response Format**: JSON

---

## Endpoints

### 1. Get All Mutual Funds

```
GET https://api.mfapi.in/mf
```

**Response**:
```json
[
  {
    "schemeCode": 119551,
    "schemeName": "Aditya Birla Sun Life Banking & PSU Debt Fund - REGULAGR - IDCW"
  },
  {
    "schemeCode": 112090,
    "schemeName": "Axis Bluechip Fund - Direct Plan - Growth"
  },
  // ... 4000+ funds
]
```

### 2. Get Fund NAV History

```
GET https://api.mfapi.in/mf/{schemeCode}
```

**Example**:
```
GET https://api.mfapi.in/mf/119551
```

**Response**:
```json
{
  "meta": {
    "fund_house": "Aditya Birla Sun Life Mutual Fund",
    "scheme_type": "Open Ended Schemes",
    "scheme_category": "Debt Scheme - Banking and PSU Fund",
    "scheme_code": 119551,
    "scheme_name": "Aditya Birla Sun Life Banking & PSU Debt Fund - Regular Plan - IDCW"
  },
  "data": [
    {
      "date": "02-01-2025",
      "nav": "234.567"
    },
    {
      "date": "01-01-2025",
      "nav": "234.123"
    },
    // ... historical NAV data
  ],
  "status": "SUCCESS"
}
```

---

## Error Handling

### HTTP Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Success | Process data |
| 404 | Fund not found | Show user-friendly error |
| 429 | Too many requests | Wait and retry with exponential backoff |
| 500+ | Server error | Retry with backoff, inform user |
| Timeout | No response in 30s | Retry, check connection |

### Implementation

```javascript
const makeApiRequest = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);  // 30s timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Data not found. Please try a different fund.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please wait and try again.');
      }
    }

    const data = await response.json();

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Check your connection.');
    } else if (error.name === 'TypeError') {
      throw new Error('Network error. Check your connection.');
    }

    throw error;
  }
};
```

---

## Retry Logic

### Exponential Backoff

```javascript
const retryApiCall = async (apiCall, attempts = 3) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === attempts - 1) throw error;  // Last attempt failed

      // Wait: 1s, 2s, 3s
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

**Usage**:
```javascript
const funds = await retryApiCall(async () => {
  return await makeApiRequest('https://api.mfapi.in/mf');
});
```

---

## Fund Filtering

### 24 Fund Categories Supported

```javascript
const categories = [
  { value: 'All', label: 'All Funds' },
  { value: 'Flexi Cap', label: 'Flexi Cap Fund' },
  { value: 'Large Cap', label: 'Large Cap Fund' },
  { value: 'Mid Cap', label: 'Mid Cap Fund' },
  { value: 'Small Cap', label: 'Small Cap Fund' },
  { value: 'Large & Mid Cap', label: 'Large & Mid Cap Fund' },
  { value: 'Multi Cap', label: 'Multi Cap Fund' },
  { value: 'Value', label: 'Value Fund' },
  { value: 'Contra', label: 'Contra Fund' },
  { value: 'Focused', label: 'Focused Fund' },
  { value: 'ELSS', label: 'ELSS / Tax Saver' },
  { value: 'Dividend Yield', label: 'Dividend Yield Fund' },
  { value: 'Index', label: 'Index Fund' },
  { value: 'Sectoral', label: 'Sectoral / Thematic Fund' },
  { value: 'Aggressive Hybrid', label: 'Aggressive Hybrid Fund' },
  { value: 'Conservative Hybrid', label: 'Conservative Hybrid Fund' },
  { value: 'Balanced Advantage', label: 'Balanced Advantage Fund' },
  { value: 'Equity Savings', label: 'Equity Savings Fund' },
  { value: 'Multi Asset', label: 'Multi Asset Allocation' },
  { value: 'International', label: 'International / Global Fund' },
  { value: 'Debt', label: 'Debt Funds' },
  { value: 'Liquid', label: 'Liquid Funds' },
  { value: 'Banking & PSU', label: 'Banking & PSU Debt' },
  { value: 'Corporate Bond', label: 'Corporate Bond Fund' }
];
```

### Filter Logic

```javascript
function filterFunds(allFunds, selectedCategory) {
  if (selectedCategory === 'All') return allFunds;

  return allFunds.filter(fund => {
    const name = fund.schemeName.toLowerCase();
    const category = selectedCategory.toLowerCase();

    // Include if category name is in fund name
    if (name.includes(category)) return true;

    // Exclude filters
    if (name.includes('debt') && category !== 'debt') return false;
    if (name.includes('liquid') && category !== 'liquid') return false;
    if (name.includes('fof') || name.includes('fund of fund')) return false;

    return false;
  });
}
```

---

## Plan Filtering

### Regular vs Direct Plans

```javascript
function filterByPlan(funds, planType) {
  if (planType === 'All') return funds;

  return funds.filter(fund => {
    const name = fund.schemeName.toLowerCase();

    if (planType === 'Direct') {
      return name.includes('direct');
    } else if (planType === 'Regular') {
      return !name.includes('direct');
    }

    return true;
  });
}
```

### Exclude Defunct/Institutional Plans

```javascript
function excludeDefunctFunds(funds) {
  return funds.filter(fund => {
    const name = fund.schemeName.toLowerCase();

    // Exclude defunct plans
    if (name.includes('closed')) return false;
    if (name.includes('wound up')) return false;

    // Exclude institutional plans
    if (name.includes('institutional')) return false;
    if (name.includes('super institutional')) return false;

    return true;
  });
}
```

---

## Benchmark Mapping

```javascript
const getBenchmarkName = (fundName) => {
  const name = fundName.toLowerCase();

  const benchmarkMap = {
    'flexi cap': 'Nifty 500 TRI',
    'large cap': 'Nifty 100 TRI',
    'mid cap': 'Nifty Midcap 150 TRI',
    'small cap': 'Nifty Smallcap 250 TRI',
    'large & mid cap': 'Nifty LargeMidcap 250 TRI',
    'multi cap': 'Nifty 500 TRI',
    'value': 'Nifty 500 Value TRI',
    'contra': 'Nifty 500 Value TRI',
    'focused': 'Nifty 500 TRI',
    'elss': 'Nifty 500 TRI',
    'banking': 'Nifty Bank TRI',
    'nifty 50': 'Nifty 50 TRI',
    'nifty next 50': 'Nifty Next 50 TRI'
  };

  for (const [keyword, benchmark] of Object.entries(benchmarkMap)) {
    if (name.includes(keyword)) return benchmark;
  }

  return 'Nifty 500 TRI';  // Default
};
```

---

## Caching Strategy

### Cache Configuration

```javascript
const CACHE_CONFIG = {
  ttl: 5 * 60 * 1000,  // 5 minutes
  maxSize: 100         // Max 100 funds cached
};

const cache = new Map();
```

### Cache Implementation

```javascript
function getCachedData(key) {
  const cached = cache.get(key);

  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_CONFIG.ttl) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

function setCachedData(key, data) {
  // Limit cache size
  if (cache.size >= CACHE_CONFIG.maxSize) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }

  cache.set(key, {
    data: data,
    timestamp: Date.now()
  });
}
```

### Usage

```javascript
async function fetchNavHistoryWithCache(schemeCode) {
  const cacheKey = `nav_${schemeCode}`;
  const cached = getCachedData(cacheKey);

  if (cached) {
    console.log('Using cached data');
    return cached;
  }

  const data = await fetchNavHistory(schemeCode);
  setCachedData(cacheKey, data);

  return data;
}
```

---

## Performance Optimization

### Limit Historical Lookback

To prevent inflated old data and improve performance:

```javascript
function limitHistoricalData(navHistory, maxYears = 15) {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - maxYears);

  return navHistory.filter(item => {
    const itemDate = parseDate(item.date);  // Parse "DD-MM-YYYY"
    return itemDate >= cutoffDate;
  });
}
```

### Parallel Fetching

```javascript
async function fetchMultipleFunds(schemeCodes) {
  const promises = schemeCodes.map(code => fetchNavHistory(code));
  return await Promise.all(promises);
}
```

---

## Complete Integration Example

```javascript
// Fetch and display mutual funds
async function loadMutualFunds() {
  try {
    showLoader();

    // 1. Fetch all funds
    const allFunds = await fetchAllFunds();
    console.log(`Loaded ${allFunds.length} funds`);

    // 2. Filter by category
    const categoryFunds = filterFunds(allFunds, selectedCategory);

    // 3. Filter by plan type
    const planFunds = filterByPlan(categoryFunds, selectedPlan);

    // 4. Exclude defunct funds
    const activeFunds = excludeDefunctFunds(planFunds);

    // 5. Display in UI
    displayFundList(activeFunds);

    hideLoader();
  } catch (error) {
    hideLoader();
    showError(error.message);
  }
}

// Fetch and analyze specific fund
async function analyzeFund(schemeCode) {
  try {
    showLoader();

    // 1. Fetch NAV history (with cache)
    const navData = await fetchNavHistoryWithCache(schemeCode);

    // 2. Limit to 15 years
    const limitedData = limitHistoricalData(navData, 15);

    // 3. Calculate metrics
    const metrics = calculateMetrics(limitedData);

    // 4. Display results
    displayFundMetrics(metrics);

    hideLoader();
  } catch (error) {
    hideLoader();
    showError(error.message);
  }
}
```

---

## API Best Practices

1. **Always use timeout** (30 seconds max)
2. **Implement retry logic** (3 attempts with backoff)
3. **Cache responses** (5 minute TTL)
4. **Limit data fetched** (10-15 years max)
5. **Handle all error scenarios**
6. **Validate response data**
7. **Show loading states to users**
8. **Provide user-friendly error messages**

This completes the API integration documentation.
