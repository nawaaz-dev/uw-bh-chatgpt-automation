import { Page } from 'puppeteer';

import { Errors } from '@/config/errors';
import { ErrorReturn } from '@/types/generic';
import { logger } from '@/utils/logger';

import loginConfig from '../login.config';

const { selectors } = loginConfig;

export async function emailSubmit(page: Page, email: string): Promise<ErrorReturn<void>> {
  const emailInput = await page.waitForSelector(selectors.emailInput);

  if (!emailInput) {
    logger.error('Email input not found');
    return {
      error: Errors.ElementNotFound.EmailInput
    };
  }

  logger.progress('Entering email...');

  // Step 2: Submit the email
  await emailInput.type(email, { delay: 50 });
  logger.success('Email entered');

  logger.progress('📧 Entered email. Submitting...');
  const emailSubmitButton = await page.waitForSelector(selectors.emailSubmitButton);
  if (!emailSubmitButton) {
    logger.error('Email submit button not found');
    return {
      error: Errors.ElementNotFound.EmailSubmitButton
    };
  }

  // Click the submit button
  await emailSubmitButton.click();
  logger.success('Email submitted');

  return {
    error: null
  };
}
