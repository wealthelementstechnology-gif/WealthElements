# 🤖 ML System - Quick Start Guide

## 📁 Files You Need to Know

### **Essential Files (Don't Touch)**
1. **outcome-tracker.js** - Tracks user decisions and outcomes
2. **ml-features.js** - Extracts features for ML training
3. **ml-model.js** - Neural network training and predictions
4. **step6-ml-integration.js** - Connects ML to optimization

### **Management Files (Use These)**
1. **ml-data-manager.html** - ⭐ All-in-one tool for data management
2. **admin-ml-training.html** - Dashboard for training ML model
3. **ML-QUICK-START-GUIDE.md** - This file

---

## 🚀 Getting Started (3 Steps)

### **Step 1: Manage Your Data**

Open: `ml-data-manager.html`

**Three Tabs:**

#### 📊 **Check Data** Tab
- View current data status
- See how many records you have
- Check if ready to train (need 50+ training-ready samples)
- Export backups
- Fix broken data

#### 🚀 **Generate Test Data** Tab
- Create fake test data for ML training
- **Settings:**
  - Samples: 100 (recommended)
  - Acceptance: 75%
- Click "Generate Data"
- Takes ~2 seconds

#### 🧹 **Cleanup** Tab
- Use if storage is full
- Keep only 100-200 best samples
- Reduces storage size
- Export backup first!

---

### **Step 2: Train the Model**

Open: `admin-ml-training.html`

**Requirements:**
- ✅ 50+ "Training Ready" samples
- ✅ Storage under 5 MB

**How to Train:**
1. Check "Training Ready" count
2. If >= 50: Click "🚀 Train New Model"
3. Wait 2-5 minutes
4. Model saves automatically

**What Happens:**
- Neural network learns from your data
- 100 training epochs
- Saves to browser storage
- "ML Active" badge appears

---

### **Step 3: Use Predictions**

Open: `step6.html` (your normal workflow page)

**Automatic:**
- ML now predicts optimal constraints
- Replaces hardcoded rules
- Personalizes for each user

---

## 🔧 Common Issues & Fixes

### **Problem 1: "Need 50+ training samples"**

**Solution:**
1. Open `ml-data-manager.html`
2. Go to "Generate Test Data" tab
3. Generate 100 samples
4. Go to "Check Data" tab
5. Should show 75+ training-ready

---

### **Problem 2: "QuotaExceededError" (Storage Full)**

**Solution:**
1. Open `ml-data-manager.html`
2. Go to "Cleanup" tab
3. Export backup first!
4. Keep 100 samples (quality priority)
5. Execute cleanup

---

### **Problem 3: Dashboard shows wrong counts**

**Solution:**
1. Open `ml-data-manager.html`
2. "Check Data" tab
3. Click "🔧 Fix Data" button (if shown)
4. Refresh admin-ml-training.html

---

### **Problem 4: Training button disabled**

**Reasons:**
- Not enough training-ready samples (need 50+)
- Samples missing follow-through data
- Storage quota exceeded

**Fix:**
1. Check current status in ml-data-manager.html
2. Generate more data OR fix existing data
3. Cleanup if storage full

---

## 📊 Understanding the Numbers

### **In ml-data-manager.html:**

| Metric | What It Means | Good Value |
|--------|--------------|------------|
| **Total Records** | All optimization attempts | Any |
| **Accepted** | Users who clicked 😊 | 70-80% of total |
| **Training Ready** | Accepted + 3+ months follow-through | 50+ needed |
| **Storage (MB)** | localStorage usage | < 4 MB |

### **In admin-ml-training.html:**

| Metric | What It Means | Good Value |
|--------|--------------|------------|
| **Total Optimizations** | Same as above | Any |
| **Accepted by Users** | Acceptance rate | > 70% |
| **Training Ready** | Can use for ML | 50+ |
| **Acceptance Rate** | % who accepted | 70-85% |

---

## 🎯 Recommended Workflow

### **For Testing (Before Real Users):**

```
1. Open ml-data-manager.html
2. Generate 100 test samples (75% acceptance)
3. Check data shows ~75 training-ready
4. Open admin-ml-training.html
5. Train model (2-5 minutes)
6. See "ML Active" badge
7. Test predictions in step6.html
```

### **For Production (Real Users):**

```
1. Let users use step6.html normally
2. They optimize, accept/reject, provide feedback
3. Data saves automatically
4. After 50-100 real optimizations (8-12 weeks):
   - Open admin-ml-training.html
   - Train model
5. Re-train monthly with new data
```

---

## 💾 Data Backup

### **When to Export:**
- Before cleanup
- Before clearing data
- Weekly (during data collection)
- Before training (just in case)

### **How to Export:**
1. Open ml-data-manager.html
2. Click "💾 Export Backup"
3. JSON file downloads
4. Store safely

### **How to Import:**
(Not built yet - contact developer if needed)

---

## 🎓 Training Requirements Explained

### **Why "Training Ready" ≠ "Total"?**

Not all records can be used for training:

| Record Type | Can Train? | Why? |
|------------|-----------|------|
| Accepted + 3+ months | ✅ YES | Quality data, user followed plan |
| Accepted + 0-2 months | ❌ NO | Too early, no follow-through proof |
| Rejected | ❌ NO | User didn't like it, bad constraints |
| Pending | ❌ NO | No feedback yet |

**ML learns from:** "What constraints worked well and users followed for 3+ months?"

---

## 🔍 File Structure

```
8-events-calculator/
├── step6.html                      (Main optimization page)
├── step6.js                        (Optimization logic)
├── step6-ml-integration.js         (ML wrapper)
├── outcome-tracker.js              (Data collection)
├── ml-features.js                  (Feature extraction)
├── ml-model.js                     (Neural network)
├── ml-data-manager.html           ⭐ (Data management tool)
├── admin-ml-training.html          (Training dashboard)
└── ML-QUICK-START-GUIDE.md        (This file)
```

---

## ❓ FAQ

### **Q: How much data do I need?**
A: Minimum 50 training-ready samples. Ideal: 100-200.

### **Q: Can I use test data for production?**
A: No. Test data is for testing ML training. Use real user data for production.

### **Q: How often should I retrain?**
A: Monthly, or after collecting 50+ new samples.

### **Q: What if training fails?**
A: System falls back to rule-based constraints automatically. Check console for errors.

### **Q: Can I delete old data?**
A: Yes! Use cleanup tab. Keep 100-200 best samples.

### **Q: How do I know ML is working?**
A: Check admin-ml-training.html for "ML Active" badge. Also visible in browser console.

### **Q: Storage limit?**
A: localStorage: 5-10 MB. ~100 records ≈ 0.5 MB. Keep under 500 records.

---

## 🎉 Success Checklist

Before going live with ML:

- [ ] Generated/collected 50+ training-ready samples
- [ ] Trained model successfully in admin-ml-training.html
- [ ] See "ML Active" badge
- [ ] Tested predictions in step6.html
- [ ] Acceptance rate > 70%
- [ ] Storage < 4 MB
- [ ] Exported backup

---

## 📞 Need Help?

1. Check this guide first
2. Check console (F12) for errors
3. Use ml-data-manager.html to diagnose
4. Export data and check JSON structure

---

**Last Updated:** January 2025
**Version:** 1.0
