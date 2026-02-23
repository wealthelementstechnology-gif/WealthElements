# WealthElementsv25 Replacement Guide

## Overview
Your MERN app uses the WealthElementsv25 folder from `frontend/public/WealthElementsv25/`.
When you update the root-level `WealthElementsv25/` folder, you need to sync it to the frontend.

## When You Replace WealthElementsv25 Folder

### Step 1: Replace the Root Folder
Replace the `WealthElementsv25/` folder at the root of MERN WEALTHELEMENTS with your updated version.

### Step 2: Run the Sync Command
After replacing, run this command from the root directory:

```bash
npm run sync:wealth
```

This will automatically:
- Remove the old `frontend/public/WealthElementsv25/` folder
- Copy your updated `WealthElementsv25/` to `frontend/public/WealthElementsv25/`
- Verify that critical files exist (like 8-events.html)

### Step 3: Verify
The sync script will show you:
- ✅ Success messages if everything worked
- ⚠️ Warnings if critical files are missing
- ❌ Errors if something went wrong

### Step 4: Test the App
Start your app and test:
```bash
npm run dev
```

Navigate to the Mutual Funds page and click on "Events Calculator" to verify it opens correctly.

## Critical Files Required
Your app specifically needs:
- `8-events-calculator/8-events.html` - Used by the Mutual Funds page

## Manual Sync (Alternative)
If you prefer to sync manually:

```bash
# Remove old folder
rm -rf frontend/public/WealthElementsv25

# Copy new folder (excluding .git)
cp -r WealthElementsv25 frontend/public/WealthElementsv25
rm -rf frontend/public/WealthElementsv25/.git
```

## Important Notes
- The sync script excludes the `.git` folder to keep the public folder clean
- Your app references files using `/WealthElementsv25/` path (served by Vite)
- Any file structure changes in WealthElementsv25 must maintain the existing paths used by the app
