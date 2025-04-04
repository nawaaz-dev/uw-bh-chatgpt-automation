/**
 * Logger utility for logging messages to the console.
 * Provides custom methods for logging different types of messages.
 */
export const logger = {
  log: (message: string) => {
    console.log(message);
  },
  progress: (message: string) => {
    console.log(`⏳ ${message}`);
  },
  success: (message: string) => {
    console.log(`✅ ${message}`);
  },
  error: (message: string, error?: unknown) => {
    console.error(`❌ ${message}` + (error ? `:\n${error as Error}` : ''));
  },
  info: (message: string) => {
    console.info(`ℹ️ ${message}`);
  }
};
