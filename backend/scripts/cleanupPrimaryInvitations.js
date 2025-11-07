#!/usr/bin/env node

/*
 * Utility script to purge documents from the PrimaryInvitation collection.
 *
 * Usage examples (run from backend directory):
 *   node scripts/cleanupPrimaryInvitations.js --email someone@example.com
 *   node scripts/cleanupPrimaryInvitations.js --token abc123
 *   node scripts/cleanupPrimaryInvitations.js --all --force
 *
 * The script requires MONGODB_URI to be available (dotenv is supported).
 */

const path = require('path');
const readline = require('readline');

// Load environment variables if a local .env exists next to backend package
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const PrimaryInvitation = require('../src/models/PrimaryInvitation');

const parseArgs = () => {
  const rawArgs = process.argv.slice(2);
  const options = {};

  rawArgs.forEach((arg, index) => {
    if (arg === '--email' && rawArgs[index + 1]) {
      options.email = rawArgs[index + 1].toLowerCase();
    }

    if (arg === '--token' && rawArgs[index + 1]) {
      options.token = rawArgs[index + 1];
    }

    if (arg === '--all') {
      options.all = true;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
    }

    if (arg === '--force') {
      options.force = true;
    }
  });

  return options;
};

const askForConfirmation = (message) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
};

const buildQuery = ({ email, token, all }) => {
  if (all) {
    return {};
  }

  const query = {};

  if (email) {
    query.email = email;
  }

  if (token) {
    query.token = token;
  }

  return query;
};

const main = async () => {
  const args = parseArgs();

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined. Please set the connection string before running the script.');
    process.exit(1);
  }

  if (!args.all && !args.email && !args.token) {
    console.error('Usage: node scripts/cleanupPrimaryInvitations.js [--email someone@example.com] [--token abc123] [--all] [--dry-run] [--force]');
    console.error('Provide at least one selector (--email, --token, or --all).');
    process.exit(1);
  }

  const query = buildQuery(args);

  try {
    await connectDB();

    const totalMatching = await PrimaryInvitation.countDocuments(query);
    console.log('🔍 Matched invitations:', totalMatching);

    if (totalMatching === 0) {
      console.log('ℹ️  No invitations matched the provided criteria. Nothing to delete.');
      process.exit(0);
    }

    if (args.dryRun) {
      console.log('🛑 Dry run enabled. No documents were deleted.');
      process.exit(0);
    }

    if (!args.force) {
      const proceed = await askForConfirmation(`⚠️  Delete ${totalMatching} invitation(s) matching ${JSON.stringify(query)}?`);
      if (!proceed) {
        console.log('❎ Deletion cancelled by user.');
        process.exit(0);
      }
    }

    const deletionResult = await PrimaryInvitation.deleteMany(query);
    console.log('✅ Deletion complete:', deletionResult);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error while deleting primary invitations:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
};

main();

