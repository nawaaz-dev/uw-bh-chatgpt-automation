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
  prompt: string;
  reply: string;
}

export const getArgs = (): ArgsConfig => {
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
    .option('prompt', {
      type: 'string',
      describe: 'Initial prompt to ChatGPT',
      demandOption: true
    })
    .option('reply', {
      type: 'string',
      describe: 'Follow-up reply to ChatGPT',
      demandOption: true
    })
    .help()
    .alias('help', 'h')
    .parseSync();

  return {
    email: argv.email ?? '',
    password: argv.password ?? '',
    prompt: argv.prompt,
    reply: argv.reply
  };
};
