import { Page } from 'puppeteer';

import { Errors } from '@/config/errors';
import { ErrorReturn } from '@/types/generic';
import { logger } from '@/utils/logger';

import loginConfig from '../login.config';

const { selectors } = loginConfig;

type DoAttemptReturn = Promise<{ success: boolean }>;

/**
 * Submits the password in the password input field.
 * As observed, the are two version of the password submission page:
 * 1. One with a button as an input (submit) element
 * 2. And the other with a button as a button element without any distinct selector
 *
 * This funciton first tries to find the button using the default selector.
 * If it fails, it tries to find the button using a different approach, i.e., by
 * searching for the button element with the text "Continue" in it.
 */

async function submitPasswordWithDefaultSelector(page: Page): DoAttemptReturn {
  logger.info('Attempting to find the password submit button using the default selector...');
  try {
    const passwordSubmitButton = await page.waitForSelector(selectors.passwordSubmitButton);
    if (!passwordSubmitButton) {
      throw new Error();
    }
    await passwordSubmitButton.click();
    logger.success('Password submit button found using the default selector');
    return { success: true };
  } catch (error) {
    logger.error('Password submit button path #1 failed', error);
    return { success: false };
  }
}

/**
 * Submits the password in the password input field using an alternative method.
 */
async function submitPasswordWithAlternativeMethod(page: Page): DoAttemptReturn {
  logger.info('Attempting to find the password submit button using a different approach...');
  try {
    const isClicked = await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find((el) =>
        RegExp(/^continue$/i).exec(el.innerText?.trim())
      );

      if (button) {
        button.click();
        return true;
      }

      return false;
    });

    if (!isClicked) {
      throw new Error();
    }

    logger.success('Password submit button found using the alternative approach');
    return { success: true };
  } catch (error) {
    logger.error('Password submit button path #2 failed', error);
    return { success: false };
  }
}

/**
 * The second step of the login process.
 * This function is responsible for submitting the password.
 */
export async function passwordSubmit(page: Page, password: string): Promise<ErrorReturn<void>> {
  // Wait for the page to redirect to the password input
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Get the password input field
  logger.progress('Waiting for password input to load...');
  const passwordInput = await page.waitForSelector(selectors.passwordInput);
  if (!passwordInput) {
    logger.error('Password input not found');
    return {
      error: Errors.ElementNotFound.PasswordInput
    };
  }

  // Submit the password
  logger.progress('Entering password...');
  await passwordInput.type(password, { delay: 50 });
  logger.success('Password entered successfully');

  // Click the password submit button
  if (
    (await submitPasswordWithDefaultSelector(page)).success ||
    (await submitPasswordWithAlternativeMethod(page)).success
  ) {
    return {
      error: null
    };
  } else {
    return {
      error: Errors.ElementNotFound.PasswordSubmitButton
    };
  }
}
