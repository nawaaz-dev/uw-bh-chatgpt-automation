import { Page } from 'puppeteer';

import { getRunArgs } from './config/args';
import { getPromptResponse } from './modules/chat';
import { login } from './modules/login';
import { getBrowser } from './utils/browser';
import { CSVWriterDataFormat, writeCSVFile } from './utils/csvWriter';
import { htmlToMarkdown } from './utils/format';
import { logger } from './utils/logger';

(async () => {
  const { email, password, prompt1, prompt2 } = getRunArgs();

  // Launch browser
  const browser = await getBrowser();

  const page: Page = await browser.newPage();

  try {
    // Login to the website
    const { error: loginError, data: loginData } = await login(page, email, password);
    if (loginError) throw new Error(loginError);

    if (!loginData?.authenticated) {
      logger.error('Something went wrong during login');
      return;
    }

    logger.success('Logged in sucessfully!');

    // Generate responses from the prompts
    const { error: chatError, data: chatData } = await getPromptResponse(page, [prompt1, prompt2]);
    if (chatError) throw new Error(chatError);

    if (!chatData) {
      logger.error('Something went wrong during the generation of the responses.');
      return;
    }

    /**
     * Convert the HTML response to Markdown format.
     */
    const formattedData: CSVWriterDataFormat[] = chatData
      .map((item, index) => [
        {
          id: 'prompt' + (index + 1),
          title: 'Prompt ' + (index + 1),
          value: item.prompt
        },
        {
          id: 'response' + (index + 1),
          title: 'Response ' + (index + 1),
          value: htmlToMarkdown(item.response)
        }
      ])
      .flat();

    /**
     * Write the formatted data to a CSV file.
     */
    const { error: writeError, data: writeData } = await writeCSVFile(formattedData);

    if (writeError) throw new Error(writeError);
    logger.info('File saved at ' + writeData?.filename);
    logger.success('All operations completed successfully.');
  } catch (error) {
    logger.error('Failed to complete operations:', error);
  } finally {
    browser.close().catch((err) => {
      logger.error('Failed to close browser:', err);
    });
    process.exit(0);
  }
})();
