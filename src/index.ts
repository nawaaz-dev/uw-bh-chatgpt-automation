import { Page } from 'puppeteer';

import { login } from './auth/login';
import { getArgs } from './config/args';
import { getBrowser } from './utils/browser';

(async () => {
  const { email, password } = getArgs();

  // Launch browser
  const browser = await getBrowser();

  const page: Page = await browser.newPage();

  try {
    const { error: loginError, data: loginData } = await login(page, email, password);
    if (loginError) throw new Error(loginError);

    if (!loginData?.authenticated) {
      console.error('❌ Something went wrong during login');
      return;
    }
    // ... Do something with the authenticated page
  } catch (err) {
    console.error('❌ Operation failed:', err);
  } finally {
    // Don't close the browser yet if you want to test post-login actions
    // await browser.close();
    // browser.close().catch((err) => {
    //   console.error('❌ Failed to close browser:', err);
    // });
    // process.exit(1);
  }
})();
