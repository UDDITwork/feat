#!/usr/bin/env node

/**
 * Quick Fix Script for AdminDashboard.tsx
 * This script fixes the undefined 'invitations' variable bug
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function fixAdminDashboard() {
  log('🔧 Fixing AdminDashboard.tsx...', 'bright');
  
  // Try to find the AdminDashboard file in common locations
  const possiblePaths = [
    path.join(process.cwd(), 'client/src/pages/AdminDashboard.tsx'),
    path.join(process.cwd(), 'src/pages/AdminDashboard.tsx'),
    path.join(process.cwd(), 'pages/AdminDashboard.tsx'),
    path.join(process.cwd(), 'AdminDashboard.tsx'),
    path.join(process.cwd(), '../client/src/pages/AdminDashboard.tsx'),
    path.join(process.cwd(), '../src/pages/AdminDashboard.tsx'),
    path.join(process.cwd(), '../../client/src/pages/AdminDashboard.tsx'),
    path.join(process.cwd(), '../../src/pages/AdminDashboard.tsx')
  ];
  
  let filePath = null;
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      filePath = testPath;
      break;
    }
  }
  
  if (!filePath) {
    log('❌ Could not find AdminDashboard.tsx file', 'red');
    log('Please run this script from the project root directory', 'yellow');
    log('Or navigate to: C:\\Users\\USER\\Downloads\\IndiaPatent\\IndiaPatent', 'blue');
    return;
  }
  
  log(`📁 Found AdminDashboard.tsx at: ${filePath}`, 'blue');
  
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Count occurrences of the bug
    const invitationsCount = (content.match(/invitations\./g) || []).length;
    log(`Found ${invitationsCount} references to undefined 'invitations' variable`, 'yellow');
    
    if (invitationsCount === 0) {
      log('✅ No fixes needed - file is already correct', 'green');
      return;
    }
    
    // Create backup
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, content);
    log(`📁 Created backup: ${backupPath}`, 'blue');
    
    // Fix the bug by replacing 'invitations' with 'clientsData?.clients || []'
    const fixedContent = content.replace(/invitations\./g, '(clientsData?.clients || []).');
    
    // Write the fixed content
    fs.writeFileSync(filePath, fixedContent);
    
    // Verify the fix
    const newInvitationsCount = (fixedContent.match(/invitations\./g) || []).length;
    
    if (newInvitationsCount === 0) {
      log('✅ Successfully fixed AdminDashboard.tsx', 'green');
      log('✅ All undefined variable references have been replaced', 'green');
    } else {
      log(`⚠️  Warning: ${newInvitationsCount} references still remain`, 'yellow');
    }
    
    log('\n📋 Summary of changes:', 'blue');
    log('- Replaced "invitations." with "(clientsData?.clients || [])."', 'blue');
    log('- This ensures the component uses the correct data from the API', 'blue');
    log('- The admin dashboard should now work without crashing', 'blue');
    
  } catch (error) {
    log(`❌ Error fixing AdminDashboard.tsx: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the fix
fixAdminDashboard();
