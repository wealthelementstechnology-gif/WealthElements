const fs = require('fs');
const path = require('path');

const AI_DIR = __dirname;
let _cachedInstructions = null;

/**
 * Loads all .md files from the ai/ folder (alphabetical order, skipping README.md
 * and any file prefixed with _ ).
 * Result is cached after first call — restart server to pick up changes.
 */
const loadInstructions = () => {
  if (_cachedInstructions !== null) return _cachedInstructions;

  const files = fs.readdirSync(AI_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md')
    .sort();

  if (files.length === 0) {
    _cachedInstructions = '';
    return _cachedInstructions;
  }

  const sections = files.map(file => {
    const content = fs.readFileSync(path.join(AI_DIR, file), 'utf8').trim();
    return content;
  });

  _cachedInstructions = sections.join('\n\n');
  console.log(`[AI] Loaded ${files.length} instruction file(s): ${files.join(', ')}`);
  return _cachedInstructions;
};

/** Call this during dev to force a reload without restarting the server. */
const reloadInstructions = () => {
  _cachedInstructions = null;
  return loadInstructions();
};

module.exports = { loadInstructions, reloadInstructions };
