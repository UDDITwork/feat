#!/usr/bin/env node

/**
 * Admin Login Debug Script for IP India Patent Auto-Fill System
 * This script will help diagnose why the admin dashboard is not working
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test functions
async function testServerConnection() {
  logSection('SERVER CONNECTION TEST');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    logSuccess(`Server is running on ${BASE_URL}`);
    logInfo(`Health check response: ${JSON.stringify(response.data, null, 2)}`);
    return true;
  } catch (error) {
    logError(`Server connection failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      logWarning('Server is not running. Please start the server first:');
      logInfo('  npm run dev');
      logInfo('  or');
      logInfo('  npm start');
    }
    return false;
  }
}

async function testDatabaseConnection() {
  logSection('DATABASE CONNECTION TEST');
  
  try {
    // Test if we can fetch clients (this requires database)
    const response = await axios.get(`${API_BASE}/clients`, { timeout: 10000 });
    logSuccess('Database connection is working');
    logInfo(`Found ${response.data.clients?.length || 0} clients in database`);
    return true;
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    if (error.response?.status === 500) {
      logWarning('This might be a database connection issue');
      logInfo('Check your MongoDB connection in server/config/database.ts');
    }
    return false;
  }
}

async function testAdminEndpoints() {
  logSection('ADMIN ENDPOINTS TEST');
  
  const endpoints = [
    { method: 'GET', path: '/clients', description: 'Get all clients' },
    { method: 'GET', path: '/invitations', description: 'Get all invitations' },
    { method: 'POST', path: '/add-client', description: 'Add client directly' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const config = {
        method: endpoint.method,
        url: `${API_BASE}${endpoint.path}`,
        timeout: 5000
      };
      
      if (endpoint.method === 'POST') {
        config.data = {
          email: 'test@example.com',
          clientName: 'Test Client',
          companyName: 'Test Company'
        };
        config.headers = { 'Content-Type': 'application/json' };
      }
      
      const response = await axios(config);
      logSuccess(`${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
      logInfo(`Response status: ${response.status}`);
      
    } catch (error) {
      logError(`${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
      logError(`Error: ${error.response?.data?.error || error.message}`);
    }
  }
}

async function testFrontendAccess() {
  logSection('FRONTEND ACCESS TEST');
  
  try {
    const response = await axios.get(`${BASE_URL}/admin`, { timeout: 5000 });
    logSuccess('Admin dashboard is accessible');
    logInfo(`Response status: ${response.status}`);
    logInfo(`Content type: ${response.headers['content-type']}`);
    
    // Check if it's serving the React app
    if (response.data.includes('Admin Dashboard')) {
      logSuccess('React app is being served correctly');
    } else {
      logWarning('React app might not be built or served correctly');
    }
    
  } catch (error) {
    logError(`Frontend access failed: ${error.message}`);
    if (error.response?.status === 404) {
      logWarning('Admin route not found. Check your routing configuration');
    }
  }
}

function checkEnvironmentVariables() {
  logSection('ENVIRONMENT VARIABLES CHECK');
  
  const requiredVars = [
    'MONGODB_URI',
    'EMAIL_USER',
    'EMAIL_PASS',
    'NODE_ENV'
  ];
  
  const optionalVars = [
    'PORT',
    'FRONTEND_URL',
    'EMAIL_HOST',
    'EMAIL_PORT'
  ];
  
  logInfo('Required Environment Variables:');
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName}: Set`);
    } else {
      logError(`${varName}: Not set`);
    }
  });
  
  logInfo('\nOptional Environment Variables:');
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName}: ${process.env[varName]}`);
    } else {
      logWarning(`${varName}: Not set (using default)`);
    }
  });
}

function checkFileStructure() {
  logSection('FILE STRUCTURE CHECK');
  
  const criticalFiles = [
    'server/index.ts',
    'server/routes/api.ts',
    'server/config/database.ts',
    'client/src/App.tsx',
    'client/src/pages/AdminDashboard.tsx',
    'package.json'
  ];
  
  criticalFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      logSuccess(`${filePath} exists`);
    } else {
      logError(`${filePath} missing`);
    }
  });
}

function checkBuildStatus() {
  logSection('BUILD STATUS CHECK');
  
  const buildPaths = [
    'dist/client/index.html',
    'dist/server/index.js',
    'client/dist/index.html'
  ];
  
  buildPaths.forEach(buildPath => {
    const fullPath = path.join(process.cwd(), buildPath);
    if (fs.existsSync(fullPath)) {
      logSuccess(`${buildPath} exists (built)`);
    } else {
      logWarning(`${buildPath} missing (not built)`);
    }
  });
}

async function testEmailService() {
  logSection('EMAIL SERVICE TEST');
  
  try {
    // Test sending an invitation
    const testData = {
      recipientEmail: 'test@example.com',
      clientName: 'Test Client',
      companyName: 'Test Company'
    };
    
    const response = await axios.post(`${API_BASE}/send-invitation`, testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    if (response.data.success) {
      logSuccess('Email service is working');
      logInfo(`Invitation ID: ${response.data.invitationId}`);
    } else {
      logError('Email service failed');
      logError(`Error: ${response.data.error}`);
    }
    
  } catch (error) {
    logError(`Email service test failed: ${error.message}`);
    if (error.response?.data?.error) {
      logError(`Server error: ${error.response.data.error}`);
    }
  }
}

function checkAdminDashboardCode() {
  logSection('ADMIN DASHBOARD CODE CHECK');
  
  try {
    const adminDashboardPath = path.join(process.cwd(), 'client/src/pages/AdminDashboard.tsx');
    const content = fs.readFileSync(adminDashboardPath, 'utf8');
    
    // Check for the bug with undefined 'invitations' variable
    const invitationsReferences = (content.match(/invitations\./g) || []).length;
    if (invitationsReferences > 0) {
      logError(`Found ${invitationsReferences} references to undefined 'invitations' variable`);
      logWarning('This is likely causing the admin dashboard to crash');
      logInfo('The variable should be replaced with clientsData?.clients || []');
    } else {
      logSuccess('No undefined variable references found');
    }
    
    // Check if the component is properly structured
    if (content.includes('export default function AdminDashboard')) {
      logSuccess('AdminDashboard component is properly exported');
    } else {
      logError('AdminDashboard component export not found');
    }
    
  } catch (error) {
    logError(`Error reading AdminDashboard.tsx: ${error.message}`);
  }
}

async function runDiagnostics() {
  log('🔍 IP India Patent Auto-Fill System - Admin Login Diagnostics', 'bright');
  log('This script will help diagnose why the admin dashboard is not working\n', 'cyan');
  
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    logError('Please run this script from the project root directory');
    logInfo('Try navigating to: C:\\Users\\USER\\Downloads\\IndiaPatent\\IndiaPatent');
    process.exit(1);
  }
  
  // Load environment variables
  require('dotenv').config();
  
  // Run all diagnostic tests
  const serverRunning = await testServerConnection();
  
  if (serverRunning) {
    await testDatabaseConnection();
    await testAdminEndpoints();
    await testFrontendAccess();
    await testEmailService();
  }
  
  checkEnvironmentVariables();
  checkFileStructure();
  checkBuildStatus();
  checkAdminDashboardCode();
  
  // Summary and recommendations
  logSection('SUMMARY & RECOMMENDATIONS');
  
  logInfo('Based on the analysis, here are the most likely issues:');
  log('');
  log('1. 🔧 CODE BUG: The AdminDashboard component has undefined variable references');
  log('   - Fix: Replace "invitations" with "clientsData?.clients || []"');
  log('');
  log('2. 🚀 SERVER NOT RUNNING: Make sure the server is started');
  log('   - Run: npm run dev (for development)');
  log('   - Or: npm start (for production)');
  log('');
  log('3. 🗄️ DATABASE CONNECTION: Check MongoDB connection');
  log('   - Verify MONGODB_URI in .env file');
  log('   - Ensure MongoDB is running');
  log('');
  log('4. 📦 BUILD ISSUES: Frontend might not be built');
  log('   - Run: npm run build');
  log('   - Or: npm run build:client');
  log('');
  log('5. 🔐 NO AUTHENTICATION: This app has no login system');
  log('   - Admin dashboard is directly accessible at /admin');
  log('   - No username/password required');
  log('');
  
  log('Next steps:');
  log('1. Fix the code bug in AdminDashboard.tsx');
  log('2. Start the server: npm run dev');
  log('3. Open browser: http://localhost:3000/admin');
  log('4. If still not working, check the console for errors');
}

// Run the diagnostics
runDiagnostics().catch(error => {
  logError(`Diagnostic script failed: ${error.message}`);
  process.exit(1);
});
