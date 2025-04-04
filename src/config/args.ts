/**
 * Handles CLI and environment-based configuration for the ChatGPT automation script.
 *
 * - Accepts email, password, prompt, and reply via command-line arguments.
 * - Falls back to .env values for email and password if not passed via CLI.
 * - Ensures all required inputs are available before proceeding.
 *
 * Returns a strongly typed Config object used throughout the app.
 */

import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

dotenv.config();

export interface ArgsConfig {
  email: string;
  password: string;
  prompt1: string;
  prompt2: string;
}

export const getRunArgs = (): ArgsConfig => {
  const argv = yargs(hideBin(process.argv))
    .option('email', {
      type: 'string',
      describe: 'Email to login',
      default: process.env.EMAIL,
      demandOption: !process.env.EMAIL
    })
    .option('password', {
      type: 'string',
      describe: 'Password to login',
      default: process.env.PASSWORD,
      demandOption: !process.env.PASSWORD
    })
    .option('prompt1', {
      type: 'string',
      describe: 'Initial prompt to ChatGPT',
      demandOption: !process.env.PROMPT1
    })
    .option('prompt2', {
      type: 'string',
      describe: 'Follow-up reply to ChatGPT',
      demandOption: !process.env.PROMPT2
    })
    .help()
    .alias('help', 'h')
    .parseSync();

  if (![argv.email, argv.password, argv.prompt1, argv.prompt2].every((e) => e?.trim())) {
    throw new Error(
      'Required arguments cannot be empty. Use the [-h] flag to know about the arguments'
    );
  }

  return {
    email: argv.email ?? '',
    password: argv.password ?? '',
    prompt1: argv.prompt1 ?? '',
    prompt2: argv.prompt2 ?? ''
  };
};
