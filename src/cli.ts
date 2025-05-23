#!/usr/bin/env node
/**
 * Knightcode CLI
 * 
 * Main entry point for the Knightcode CLI tool. Handles command-line
 * argument parsing, command dispatching, and error handling.
 */

import { commandRegistry, executeCommand, generateCommandHelp } from './commands/index.js';
import { logger } from './utils/logger.js';
import { formatErrorForDisplay } from './errors/formatter.js';
import { initAI } from './ai/index.js';
import { authManager } from './auth/index.js';
import { registerCommands } from './commands/register.js';
import { UserError } from './errors/types.js';
import pkg from '../package.json' assert { type: 'json' };

// Get version from package.json
const version = pkg.version;

// Maximum width of the help output
const HELP_WIDTH = 100;

/**
 * Display help information
 */
function displayHelp(commandName?: string): void {
  if (commandName && commandName !== 'help') {
    // Display help for a specific command
    const command = commandRegistry.get(commandName);
    
    if (!command) {
      console.error(`Unknown command: ${commandName}`);
      console.error('Use "knightcode help" to see available commands.');
      process.exit(1);
    }
    
    console.log(generateCommandHelp(command));
    return;
  }
  
  // Display general help
  console.log(`
Knightcode CLI v${version}

A command-line interface for interacting with Knightcode AI for code assistance,
generation, refactoring, and more.

Usage:
  knightcode <command> [arguments] [options]

Available Commands:`);
  
  // Group commands by category
  const categories = commandRegistry.getCategories();
  
  // Commands without a category
  const uncategorizedCommands = commandRegistry.list()
    .filter(cmd => !cmd.category && !cmd.hidden)
    .sort((a, b) => a.name.localeCompare(b.name));
  
  if (uncategorizedCommands.length > 0) {
    for (const command of uncategorizedCommands) {
      console.log(`  ${command.name.padEnd(15)} ${command.description}`);
    }
    console.log('');
  }
  
  // Commands with categories
  for (const category of categories) {
    console.log(`${category}:`);
    
    const commands = commandRegistry.getByCategory(category)
      .filter(cmd => !cmd.hidden)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    for (const command of commands) {
      console.log(`  ${command.name.padEnd(15)} ${command.description}`);
    }
    
    console.log('');
  }
  
  console.log(`For more information on a specific command, use:
  knightcode help <command>

Examples:
  $ knightcode ask "How do I implement a binary search tree in TypeScript?"
  $ knightcode explain path/to/file.js
  $ knightcode refactor path/to/file.py --focus=performance
  $ knightcode fix path/to/code.ts
`);
}

/**
 * Display version information
 */
function displayVersion(): void {
  console.log(`Knightcode CLI v${version}`);
}

/**
 * Parse command-line arguments
 */
function parseCommandLineArgs(): { commandName: string; args: string[] } {
  // Get arguments, excluding node and script path
  const args = process.argv.slice(2);
  
  // Handle empty command
  if (args.length === 0) {
    displayHelp();
    process.exit(0);
  }
  
  // Extract command name
  const commandName = args[0].toLowerCase();
  
  // Handle help command
  if (commandName === 'help') {
    displayHelp(args[1]);
    process.exit(0);
  }
  
  // Handle version command
  if (commandName === 'version' || commandName === '--version' || commandName === '-v') {
    displayVersion();
    process.exit(0);
  }
  
  return { commandName, args: args.slice(1) };
}

/**
 * Initialize the CLI
 */
async function initCLI(): Promise<void> {
  try {
    // Register commands
    registerCommands();
    
    // Parse command-line arguments
    const { commandName, args } = parseCommandLineArgs();
    
    // Get the command
    const command = commandRegistry.get(commandName);
    
    if (!command) {
      console.error(`Unknown command: ${commandName}`);
      console.error('Use "knightcode help" to see available commands.');
      process.exit(1);
    }
    
    // Initialize AI
    await initAI();
    
    // Execute the command
    await executeCommand(commandName, args);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Handle errors
 */
function handleError(error: unknown): void {
  const formattedError = formatErrorForDisplay(error);
  
  console.error(formattedError);
  
  // Exit with error code
  if (error instanceof UserError) {
    process.exit(1);
  } else {
    // Unexpected error, use a different exit code
    process.exit(2);
  }
}

// Run the CLI
initCLI().catch(handleError); 