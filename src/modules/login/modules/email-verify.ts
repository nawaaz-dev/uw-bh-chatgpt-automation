import { Page } from 'puppeteer';

import { Errors } from '@/config/errors';
import { ErrorReturn } from '@/types/generic';
import { getUserInput } from '@/utils/cli';
import { logger } from '@/utils/logger';

import loginConfig from '../login.config';

const { selectors } = loginConfig;

/**
 * Submits the email verification code in the email verification input field.
 * It waits for the user to enter the verification code sent to their email and
 * submits it to complete the email verification process.
 */

export async function emailVerify(page: Page): Promise<ErrorReturn<void>> {
  const printExitMessage = () =>
    logger.log('If you want to end this process, please press Ctrl + C.');

  logger.info('Email verification required. Please check your email for the verification code.');

  /**
   * The loop below runs until the verification process is either completed or manually exited.
   * It does the following:
   * 1. Waits for the user to enter the verification code
   * 2. Validates the verification code. If invalid, it prompts the user to enter it again.
   * 3. Submits the verification code.
   * 4. Allow users to end the process by pressing Ctrl + C.
   */
  while (true) {
    const verificationCode = (await getUserInput('Enter the verification code:')).trim();

    // Only accept 6-digit verification codes
    if (!RegExp(/^\d{6}$/).exec(verificationCode)) {
      logger.error('Invalid verification code. Please enter a 6-digit code.');
      printExitMessage();
      continue;
    }

    // Submit the verification code
    const emailVerificationInput = await page.waitForSelector(selectors.emailVerificationInput);

    if (!emailVerificationInput) {
      logger.error('Email verification input not found');
      return {
        error: Errors.ElementNotFound.EmailVerificationInput
      };
    }

    // Clear the input field before entering the verification code
    await emailVerificationInput.evaluate((el) => ((el as HTMLInputElement).value = ''));
    await emailVerificationInput.type(verificationCode, { delay: 50 });

    // Click the submit button
    const emailVerificationSubmitButton = await page.waitForSelector(
      selectors.emailVerificationSubmitButton
    );
    if (!emailVerificationSubmitButton) {
      logger.error('Submit button not found');
      return {
        error: Errors.ElementNotFound.EmailVerificationSubmitButton
      };
    }

    logger.progress('Entered verification code. Submitting...');
    await emailVerificationSubmitButton.click();
    logger.success('Verification code submitted');

    logger.progress('Waiting for verification...');

    // Wait to see if there are any errors while verifying the code
    try {
      // Wait for the error message to appear
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const errorMessageEl = await page.waitForSelector(selectors.emailVerificationError, {
        timeout: 3000
      });

      // If the error message element is found, it means the verification code was invalid.
      if (errorMessageEl) {
        const errorMessage = await page.evaluate(
          (el) => (el as HTMLDivElement).textContent,
          errorMessageEl
        );

        logger.error('Failed to verify code.', errorMessage);
        printExitMessage();
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // If no error message found, it means the verification code was accepted.
      logger.success('Verification code accepted');
      break;
    }
  }

  return {
    error: null
  };
}
