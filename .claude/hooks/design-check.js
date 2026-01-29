#!/usr/bin/env node

/**
 * PostToolUse Hook: Design System Check
 *
 * Validates edited files against design system rules:
 * - No hardcoded hex colors
 * - No arbitrary Tailwind spacing values
 * - Interactive elements have focus/hover states
 *
 * Outputs JSON feedback for Claude to process and self-correct.
 */

const fs = require('fs');
const path = require('path');

// Get the edited file path from arguments
const filePath = process.argv[2];

// Only check React/TSX/JSX files
if (!filePath || !filePath.match(/\.(tsx|jsx)$/)) {
  process.exit(0);
}

// Read file contents
let content;
try {
  content = fs.readFileSync(filePath, 'utf8');
} catch (err) {
  process.exit(0);
}

const issues = [];
const lines = content.split('\n');

// Pattern: Hardcoded hex colors in className or style
const hexColorPattern = /#[0-9a-fA-F]{3,8}\b/g;
const arbitraryColorPattern = /(?:text|bg|border|fill|stroke)-\[#[0-9a-fA-F]+\]/g;

// Pattern: Arbitrary spacing values
const arbitrarySpacingPattern = /(?:p|m|gap|space|w|h|top|left|right|bottom|inset)-\[\d+px\]/g;

// Pattern: Interactive elements without focus/hover
const buttonPattern = /<button[^>]*className="([^"]*)"[^>]*>/g;
const linkPattern = /<a[^>]*className="([^"]*)"[^>]*>/g;
const clickablePattern = /onClick[^}]*className="([^"]*)"/g;

lines.forEach((line, index) => {
  const lineNum = index + 1;

  // Check for hardcoded hex colors in JSX/className context
  if (line.includes('className=') || line.includes('style=')) {
    const hexMatches = line.match(hexColorPattern);
    if (hexMatches) {
      // Exclude CSS variable definitions and comments
      if (!line.includes('--') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        issues.push(`Line ${lineNum}: Hardcoded hex color "${hexMatches[0]}" - use Tailwind color classes instead`);
      }
    }

    // Check for arbitrary color values
    const arbColorMatches = line.match(arbitraryColorPattern);
    if (arbColorMatches) {
      issues.push(`Line ${lineNum}: Arbitrary color "${arbColorMatches[0]}" - use Tailwind color classes instead`);
    }

    // Check for arbitrary spacing values
    const arbSpacingMatches = line.match(arbitrarySpacingPattern);
    if (arbSpacingMatches) {
      issues.push(`Line ${lineNum}: Arbitrary spacing "${arbSpacingMatches[0]}" - use Tailwind spacing scale (1,2,3,4,6,8,12,16)`);
    }
  }

  // Check interactive elements for focus/hover states
  const checkInteractiveClasses = (classNames, elementType) => {
    if (!classNames) return;

    const hasFocus = classNames.includes('focus:') || classNames.includes('focus-visible:');
    const hasHover = classNames.includes('hover:');
    const hasTransition = classNames.includes('transition');

    if (!hasFocus && !hasHover) {
      issues.push(`Line ${lineNum}: ${elementType} missing focus and hover states - add hover:* and focus:* classes`);
    } else if (!hasFocus) {
      issues.push(`Line ${lineNum}: ${elementType} missing focus state - add focus:ring-2 focus:outline-none`);
    } else if (!hasHover) {
      issues.push(`Line ${lineNum}: ${elementType} missing hover state - add hover:* class`);
    }

    if (!hasTransition && (hasFocus || hasHover)) {
      issues.push(`Line ${lineNum}: ${elementType} has states but missing transition - add transition-colors`);
    }
  };

  // Check buttons
  let match;
  while ((match = buttonPattern.exec(line)) !== null) {
    checkInteractiveClasses(match[1], 'Button');
  }
  buttonPattern.lastIndex = 0;

  // Check links
  while ((match = linkPattern.exec(line)) !== null) {
    checkInteractiveClasses(match[1], 'Link');
  }
  linkPattern.lastIndex = 0;
});

// Check for images without alt text
const imgWithoutAlt = /<img[^>]*(?!alt=)[^>]*>/g;
lines.forEach((line, index) => {
  if (line.includes('<img') && !line.includes('alt=')) {
    issues.push(`Line ${index + 1}: Image missing alt attribute - add alt="description" or alt="" for decorative`);
  }
});

// Check for icon-only buttons without aria-label
lines.forEach((line, index) => {
  if (line.includes('<button') && line.includes('Icon') && !line.includes('aria-label')) {
    // Simple heuristic: if button contains Icon but no visible text
    if (!line.match(/<button[^>]*>[^<]*[a-zA-Z]/)) {
      issues.push(`Line ${index + 1}: Icon-only button may need aria-label for accessibility`);
    }
  }
});

// Output results
if (issues.length > 0) {
  const limitedIssues = issues.slice(0, 8);
  const moreCount = issues.length > 8 ? issues.length - 8 : 0;

  console.log(JSON.stringify({
    feedback: `⚠️ Design system issues in ${path.basename(filePath)}:\n${limitedIssues.join('\n')}${moreCount > 0 ? `\n... and ${moreCount} more issues` : ''}\n\nFix these issues before presenting code to user.`,
    suppressOutput: false
  }));
} else {
  console.log(JSON.stringify({
    feedback: `✅ Design check passed for ${path.basename(filePath)}`,
    suppressOutput: true
  }));
}

process.exit(0);
