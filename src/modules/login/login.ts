import { Page } from 'puppeteer';

import { Errors } from '@/config/errors';
import { ErrorReturn } from '@/types/generic';
import { logger } from '@/utils/logger';

import { dismissCookieConsent } from '../cookie-consent';
import loginConfig from './login.config';
import { emailSubmit } from './modules/email-submit';
import { emailVerify } from './modules/email-verify';
import { passwordSubmit } from './modules/password-submit';

const { selectors, urls } = loginConfig;

type ReturnType = {
  authenticated: boolean;
};

/**
 * Handles the main authentication flow.
 */
async function mainAuthFlow(
  page: Page,
  email: string,
  password: string
): Promise<ErrorReturn<ReturnType>> {
  //Get the email input field
  const { error: emailSubmitError } = await emailSubmit(page, email);
  if (emailSubmitError) {
    logger.error('Failed to submit email');
    return {
      error: emailSubmitError
    };
  }

  /**
   * After this step, the user might be redirected to the email verification page or
   * directly to the chat page.
   */
  const { error: passwordSubmitError } = await passwordSubmit(page, password);
  if (passwordSubmitError) {
    logger.error('Failed to submit password');
    return {
      error: passwordSubmitError
    };
  }

  return await handleEmailVerification(page);
}
/**
 * Handles the case where the login page is blocked by Cloudflare.
 * This is a temporary workaround until a better solution is found.
 */
async function handleAuthError(_: Page): Promise<ErrorReturn<ReturnType>> {
  logger.error('Request blocked by Cloudflare. Changing the IP address may help.');
  return {
    error: Errors.Auth.CaptchaRequired
  };
}

/**
 * Handles the email verification process.
 * Waits for the user to enter the verification code and submits it to complete the email verification process.
 */
async function handleEmailVerification(page: Page): Promise<ErrorReturn<ReturnType>> {
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  const currentUrl = page.url();
  if (!currentUrl.includes(urls.authChallengeEmail)) {
    logger.info('Email verification not required. Proceeding to chat.');

    return {
      error: null,
      data: {
        authenticated: true
      }
    };
  }

  const { error: emailVerificationError } = await emailVerify(page);
  if (emailVerificationError) {
    logger.error('Failed to verify email');
    return {
      error: emailVerificationError
    };
  }

  return {
    error: null,
    data: {
      authenticated: true
    }
  };
}

/**
 * Calls the appropriate function based on the current URL of the page.
 */

async function urlWiseOperations(
  page: Page,
  email: string,
  password: string
): Promise<ErrorReturn<ReturnType>> {
  const currentUrl = page.url();
  switch (true) {
    case currentUrl.includes(urls.auth):
      logger.info('Login form loaded');
      return await mainAuthFlow(page, email, password);
    case currentUrl.includes(urls.authError):
      logger.error('Request blocked by Cloudflare. Changing the IP address may help.');
      return await handleAuthError(page);
    case currentUrl.includes(urls.authChallengeEmail):
      logger.info(
        'Email verification required. Please check your email for the verification code.'
      );
      return await handleEmailVerification(page);
    case currentUrl.includes(urls.chat): {
      return {
        error: null,
        data: {
          authenticated: true
        }
      };
    }
    default:
      logger.error('Unexpected error. Please check whether the login URL has changed.');
      throw new Error(Errors.Generic.UnexpectedError);
  }
}

/**
 * Logs in to ChatGPT using the provided email and password.
 */

export async function login(
  page: Page,
  email: string,
  password: string
): Promise<ErrorReturn<{ authenticated: boolean }>> {
  try {
    logger.progress('Navigating to ChatGPT login page...');
    await page.goto(urls.login, { waitUntil: 'networkidle2' });

    /**
     * A cookie consent banner may appear on the page.
     * This function will dismiss it if it exists.
     */
    const { error: cookieConsentError } = await dismissCookieConsent(page);
    if (cookieConsentError) throw new Error(cookieConsentError);

    // Interact with the login button
    try {
      logger.progress('Waiting for login button to load...');
      const loginButton = await page.waitForSelector(selectors.loginButton);
      if (!loginButton) {
        logger.error('Login button not found');
        throw new Error();
      }

      await loginButton.click();
    } catch (error) {
      logger.error('Log in button not found', (error as Error).message && error);
      return {
        error: Errors.ElementNotFound.LoginButton
      };
    }

    logger.progress('Waiting for login form to load...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    return await urlWiseOperations(page, email, password);
  } catch (error) {
    logger.error('An error occurred during login', error);
    return {
      error: (error as Error).message || ''
    };
  }
}
