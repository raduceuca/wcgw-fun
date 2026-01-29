#!/usr/bin/env node

/**
 * PostToolUse Hook: Type Check After Edit
 *
 * Runs TypeScript type checking after a file is edited.
 * Outputs JSON feedback for Claude to process.
 */

const { execSync } = require('child_process');
const path = require('path');

// Get the edited file path from arguments
const filePath = process.argv[2];

// Only check TypeScript/JavaScript files
if (!filePath || !filePath.match(/\.(tsx?|jsx?)$/)) {
  // Exit silently for non-TS/JS files
  process.exit(0);
}

try {
  // Run TypeScript check (non-blocking, just report)
  execSync('npx tsc --noEmit', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 30000
  });

  // No errors - output success feedback
  console.log(JSON.stringify({
    feedback: `✅ Type check passed for ${path.basename(filePath)}`,
    suppressOutput: true
  }));

} catch (error) {
  // Parse TypeScript errors
  const output = error.stdout || error.stderr || '';
  const errorLines = output.split('\n').filter(line => line.includes('error TS'));

  if (errorLines.length > 0) {
    // Has type errors - provide feedback
    console.log(JSON.stringify({
      feedback: `⚠️ Type errors detected:\n${errorLines.slice(0, 5).join('\n')}${errorLines.length > 5 ? `\n... and ${errorLines.length - 5} more` : ''}`,
      suppressOutput: false
    }));

    // Exit code 0 to not block, just inform
    process.exit(0);
  }
}
