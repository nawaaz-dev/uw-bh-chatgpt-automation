import { Page } from 'puppeteer';

import { Errors } from '@/config/errors';
import { ErrorReturn } from '@/types/generic';
import { getUserInput } from '@/utils/cli';
import { classPartial } from '@/utils/selectors';

import { dismissCookieConsent } from '../layovers/cookie-consent';

/**
 * Logs into ChatGPT using the provided credentials.
 * Assumes you're using email/password login (not Google or Microsoft SSO).
 */

const selectors = {
  loginButton: 'button[data-testid="login-button"]',
  emailInput: 'input[type="email"]',
  emailSubmitButton: 'input[type="submit"]',
  passwordInput: 'input[type="password"]',
  passwordSubmitButton: 'button[type="submit"]',
  emailVerificationInput: 'input[type="number"]',
  emailVerificationError: classPartial('errorMessage'),
  emailVerificationSubmitButton: 'button[type="submit"]',
  chatInput: 'div[contenteditable="true"]'
};

const urls = {
  auth: 'https://auth.openai.com/authorize',
  authError: 'https://chatgpt.com/api/auth/error',
  authChallengeEmail: 'https://auth.openai.com/login_challenge'
};

export async function login(
  page: Page,
  email: string,
  password: string
): Promise<ErrorReturn<{ authenticated: boolean }>> {
  try {
    console.log('🔐 Navigating to ChatGPT login page...');

    await page.goto('https://chat.openai.com/auth/login', { waitUntil: 'networkidle2' });

    const { error: cookieConsentError, data: cookieConsentData } = await dismissCookieConsent(page);
    if (cookieConsentError) throw new Error(cookieConsentError);

    if (cookieConsentData?.encountered) {
      console.log('✅ Cookie consent banner dismissed');
    } else {
      console.log('✅ No cookie consent banner encountered');
    }

    // Step 1: Click "Log in" button
    try {
      const loginButton = await page.waitForSelector(selectors.loginButton);
      await loginButton!.click();
      console.log('👉 Clicked "Log in"');
    } catch (error) {
      console.error(error);
      console.log('❌ "Log in" button not found');
      return {
        error: Errors.ElementNotFound.LoginButton,
        data: null
      };
    }

    // 2. Wait for the page to redirect to the login form and the address contains "auth.openai.com/authorize"
    console.log('🔄 Waiting for login form to load...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    const currentUrl = page.url();

    switch (true) {
      case currentUrl.includes(urls.auth): {
        console.log('🔄 Login form loaded');
        // Step 1: Get the email input field
        const emailInput = await page.waitForSelector(selectors.emailInput);
        if (!emailInput) {
          console.error('❌ Email input not found');
          return {
            error: Errors.ElementNotFound.EmailInput,
            data: null
          };
        }

        console.log('🔑 Entering email...');

        // Step 2: Submit the email
        await emailInput.type(email, { delay: 50 });
        console.log('📧 Entered email. Submitting...');

        const emailSubmitButton = await page.waitForSelector(selectors.emailSubmitButton);
        if (!emailSubmitButton) {
          console.error('❌ Submit button not found');
          return {
            error: Errors.ElementNotFound.EmailSubmitButton,
            data: null
          };
        }

        // Click the submit button
        await emailSubmitButton.click();
        console.log('🔄 Waiting for password input to load...');

        // Wait for the page to redirect to the password input
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('🔄 Password input loaded');

        // Step 3: Get the password input field
        const passwordInput = await page.waitForSelector(selectors.passwordInput);
        if (!passwordInput) {
          console.error('❌ Password input not found');
          return {
            error: Errors.ElementNotFound.PasswordInput,
            data: null
          };
        }

        // Step 4: Submit the password
        console.log('🔑 Entering password...');
        await passwordInput.type(password, { delay: 50 });

        let passwordSubmitButton: any;
        let passwordSubmitButtonTries = 0;
        const passwordSubmitButtonTriesLimit = 2;

        try {
          passwordSubmitButton = await page.waitForSelector(selectors.passwordSubmitButton);
        } catch (error) {
          console.log(error);
          passwordSubmitButtonTries += 1;
          console.error('❌ Password submit button path #1 failed');
        }

        if (passwordSubmitButtonTries > 0) {
          console.log('🔄 Trying to find the submit button using a different selector...');

          // Acquire submit button with path #2
          // This is a workaround for the issue where the submit button is not found
          // when using the default selector
          try {
            passwordSubmitButton = await page.evaluate(() => {
              const button = Array.from(document.querySelectorAll('button')).find((el) =>
                RegExp(/^continue$/i).exec(el.innerText?.trim())
              );
              return button;
            });

            if (!passwordSubmitButton) {
              throw new Error();
            }
          } catch (error) {
            console.error(error);
            console.error('❌ Password submit button path #2 failed');
            passwordSubmitButtonTries += 1;
          }
        }

        if (passwordSubmitButtonTries >= passwordSubmitButtonTriesLimit) {
          console.error(
            '❌ Password submit button not found. Please check the selector configuration.'
          );
          return {
            error: Errors.ElementNotFound.PasswordSubmitButton,
            data: null
          };
        }

        console.log('🔑 Entered password. Submitting...');
        await passwordSubmitButton.click();

        // Wait for the page to redirect to the chat page
        console.log('🔄 Waiting for verification...');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        const currentUrl = page.url();
        if (currentUrl.includes(urls.authChallengeEmail)) {
          // Step 4.1: Get the email verification code from the user
          console.log(
            '📧 Email verification required. Please check your email for the verification code.'
          );
          while (true) {
            const verificationCode = await getUserInput('Enter the verification code: ');

            if (!verificationCode) {
              console.error('❌ Invalid verification code. Please try again.');
              console.log('If you want to end this process, please press Ctrl + C.');
            } else {
              // Step 4.2: Submit the verification code
              const emailVerificationInput = await page.waitForSelector(
                selectors.emailVerificationInput
              );

              if (!emailVerificationInput) {
                console.error('❌ Email verification input not found');
                return {
                  error: Errors.ElementNotFound.EmailVerificationInput,
                  data: null
                };
              }

              await emailVerificationInput.evaluate((el) => ((el as HTMLInputElement).value = ''));
              await emailVerificationInput.type(verificationCode, { delay: 50 });

              const emailVerificationSubmitButton = await page.waitForSelector(
                selectors.emailVerificationSubmitButton
              );
              if (!emailVerificationSubmitButton) {
                console.error('❌ Submit button not found');
                return {
                  error: Errors.ElementNotFound.EmailVerificationSubmitButton,
                  data: null
                };
              }
              console.log('🔑 Entered verification code. Submitting...');
              await emailVerificationSubmitButton.click();
              console.log('🔄 Waiting for verification...');

              // Wait to see if there are any errors
              try {
                // Wait for the error message to appear
                await new Promise((resolve) => setTimeout(resolve, 3000));
                const errorMessageEl = await page.waitForSelector(
                  selectors.emailVerificationError,
                  { timeout: 3000 }
                );

                const errorMessage = await page.evaluate(
                  (el) => (el as HTMLDivElement).textContent,
                  errorMessageEl
                );

                console.error('❌ Failed.\nPossible verification code error: ', errorMessage);
                console.log('If you want to end this process, please press Ctrl + C.\n');
                continue;
              } catch (error) {
                console.error(error);
                // No error message found, so we assume the verification code was accepted
                console.log('✅ Verification code accepted');
              }

              console.log('✅ Entered verification code');

              break;
            }
          }
        }

        return {
          error: null,
          data: {
            authenticated: true
          }
        };
      }

      case currentUrl.includes(urls.authError): {
        console.error(
          '❌ Caught by Cloudflare. Probably a CAPTCHA.\nProxy change is required.\nPlease check the proxy configuration.'
        );

        throw new Error(Errors.Auth.CaptchaRequired);
      }

      default: {
        console.error(
          `❌ Something went wrong after clicking the Log in button.\nNot on expected page.\nCurrent URL: ${currentUrl}\nExpected URL: ${urls.auth}\nPlease check the URL configuration.`
        );
        return {
          error: 'Not on the login page',
          data: null
        };
      }
    }
  } catch (error) {
    console.error(error);
    return {
      error: (error as Error).message || 'An error occurred during login',
      data: null
    };
  }
}
