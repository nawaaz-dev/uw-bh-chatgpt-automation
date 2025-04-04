import { Page } from 'puppeteer';

import { getRunArgs } from './config/args';
import { login } from './modules/auth/login';
import { runConversation } from './modules/chat/conversation';
import { getBrowser } from './utils/browser';
import { writeCSVFile } from './utils/csvWriter';

(async () => {
  const { email, password, prompt, reply } = getRunArgs();

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

    const { error: chatError, data: chatData } = await runConversation(page, prompt, reply);
    if (chatError) throw new Error(chatError);

    if (!chatData) {
      console.error('❌ Something went wrong during the generation of the responses.');
      return;
    }

    const { error: writeError } = await writeCSVFile(chatData);

    if (writeError) throw new Error(writeError);
    console.log('✅ All operations completed successfully.');
  } catch (error) {
    console.error('❌ Failed to complete operations:', error);
  } finally {
    browser.close().catch((err) => {
      console.error('❌ Failed to close browser:', err);
    });

    process.exit(0);
  }
})();
