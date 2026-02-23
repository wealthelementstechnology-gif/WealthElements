const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, 'WealthElementsv25');
const targetDir = path.join(__dirname, 'frontend', 'public', 'WealthElementsv25');

console.log('🔄 Syncing WealthElementsv25 to frontend/public...');
console.log(`Source: ${sourceDir}`);
console.log(`Target: ${targetDir}`);

// Check if source exists
if (!fs.existsSync(sourceDir)) {
  console.error('❌ Error: WealthElementsv25 folder not found at root level!');
  process.exit(1);
}

try {
  // Remove old target if it exists
  if (fs.existsSync(targetDir)) {
    console.log('🗑️  Removing old frontend/public/WealthElementsv25...');
    fs.removeSync(targetDir);
  }

  // Copy source to target
  console.log('📦 Copying WealthElementsv25 to frontend/public...');
  fs.copySync(sourceDir, targetDir, {
    filter: (src) => {
      // Don't copy .git folder to reduce size
      return !src.includes('.git');
    }
  });

  console.log('✅ Sync completed successfully!');
  console.log('✨ Your app should now work with the updated WealthElementsv25 folder.');

  // Verify critical file exists
  const criticalFile = path.join(targetDir, '8-events-calculator', '8-events.html');
  if (fs.existsSync(criticalFile)) {
    console.log('✓ Verified: 8-events.html exists at correct path');
  } else {
    console.warn('⚠️  Warning: 8-events.html not found! The events calculator may not work.');
  }

} catch (error) {
  console.error('❌ Error during sync:', error.message);
  process.exit(1);
}
