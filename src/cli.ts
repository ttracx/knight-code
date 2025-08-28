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
import { loadConfig } from './config/index.js';
import pkg from '../package.json' with { type: 'json' };

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
function parseCommandLineArgs(): { commandName: string; args: string[]; options: any } {
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
  
  // Parse options (flags starting with -- or -)
  const options: any = {};
  const filteredArgs: string[] = [];
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value || true;
    } else if (arg.startsWith('-') && arg.length === 2) {
      // Handle short flags like -p
      const key = arg.slice(1);
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        options[key] = args[i + 1];
        i++; // Skip the next argument
      } else {
        options[key] = true;
      }
    } else {
      filteredArgs.push(arg);
    }
  }
  
  return { commandName, args: filteredArgs, options };
}

/**
 * Initialize the CLI
 */
async function initCLI(): Promise<void> {
  try {
    // Register commands
    registerCommands();
    
    // Parse command-line arguments
    const { commandName, args, options } = parseCommandLineArgs();
    
    // Get the command
    const command = commandRegistry.get(commandName);
    
    if (!command) {
      console.error(`Unknown command: ${commandName}`);
      console.error('Use "knightcode help" to see available commands.');
      process.exit(1);
    }
    
    // Only initialize AI for commands that require it
    if (command.requiresAuth || command.name === 'ask' || command.name === 'explain' || 
        command.name === 'fix' || command.name === 'generate' || command.name === 'refactor') {
      try {
        // Load configuration and pass it to AI initialization
        const config = await loadConfig(options);
        await initAI(config);
      } catch (error) {
        // If AI initialization fails, show a helpful message but don't crash
        logger.warn('AI initialization failed, some features may not work');
        logger.debug('AI error:', error);
      }
    }
    
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