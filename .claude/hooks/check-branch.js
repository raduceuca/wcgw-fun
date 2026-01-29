#!/usr/bin/env node

/**
 * PreToolUse Hook: Check Branch Before Edit
 *
 * Warns if editing files on main/master branch.
 * Helps prevent accidental commits to protected branches.
 */

const { execSync } = require('child_process');

try {
  const branch = execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  }).trim();

  if (branch === 'main' || branch === 'master') {
    console.log(JSON.stringify({
      feedback: `⚠️ Warning: You are on the ${branch} branch. Consider creating a feature branch first.`,
      suppressOutput: false
    }));
  }
} catch (error) {
  // Not a git repo or git not available - silently continue
  process.exit(0);
}
