import { Page } from 'puppeteer';

import { Errors } from '@/config/errors';
import { ErrorReturn } from '@/types/generic';
import { logger } from '@/utils/logger';

const text = {
  cookieRejectButton: 'Reject non-essential'
};

/**
 * Dismisses the cookie consent banner on the ChatGPT page.
 */
export async function dismissCookieConsent(page: Page): Promise<
  ErrorReturn<{
    encountered: boolean;
  }>
> {
  try {
    // Wait for the buttons to load
    await page.waitForSelector('button');

    // Perform the operation inside the browser context
    const encountered = await page.evaluate((buttonText) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const rejectButton = buttons.find((button) => button.innerText?.trim().includes(buttonText));

      if (rejectButton) {
        rejectButton.click();
        return true; // Button was found and clicked
      }

      return false; // Button was not found
    }, text.cookieRejectButton);

    if (encountered) {
      logger.success('Cookie consent banner dismissed');
      // Timeout to allow the page to process the click
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { error: null, data: { encountered: true } };
    } else {
      logger.info('Cookie consent banner not found');
      return { error: null, data: { encountered: false } };
    }
  } catch (error) {
    logger.error('Failed to dismiss the cookie consent banner:', error);
    return { error: Errors.Generic.CookieLayover };
  }
}
