import { Page } from 'puppeteer';

import { Errors } from '@/config/errors';
import { ErrorReturn } from '@/types/generic';
import { logger } from '@/utils/logger';

import chatConfig from './chat.config';
import { ChatData } from './chat.types';

const { selectors } = chatConfig;

/**
 * Submits a prompt to the chat input field and clicks the submit button.
 */
async function submitPrompt(page: Page, prompt: string): Promise<ErrorReturn<void>> {
  const chatInput = await page.waitForSelector(selectors.chatInput);
  if (!chatInput) {
    logger.error('Chat input not found');
    return { error: Errors.ElementNotFound.ChatInput };
  }

  logger.progress('Entering prompt...');
  await chatInput.type(prompt, { delay: 50 });
  logger.success('Prompt entered.');

  logger.progress('Submitting promt...');
  const chatSubmitButton = await page.waitForSelector(selectors.chatSubmitButton);
  if (!chatSubmitButton) {
    logger.error('Submit button not found');
    return { error: Errors.ElementNotFound.ChatSendButton };
  }
  await chatSubmitButton.click();
  logger.info('Clicked submit button');

  return { error: null };
}

/**
 * Generates a response to the prompt and returns the response HTML.
 */
async function getLastResponse(page: Page): Promise<ErrorReturn<string>> {
  logger.progress('Waiting for the response...');

  try {
    // Wait for the reply to be generated
    await page.waitForFunction(
      ({ selectors }) => {
        return document.querySelector(selectors.voiceChatButton);
      },
      { polling: 500, timeout: 30000 },
      { selectors }
    );
  } catch (err) {
    logger.error('Something went wrong while receiving the first response:', err);
    return { error: Errors.ElementNotFound.ChatResponeTimeout };
  }

  const response = await page.evaluate((selector) => {
    const allResponses = document.querySelectorAll(selector);
    if (allResponses.length === 0) {
      logger.error('No response elements found');
      return null;
    }
    const responseElement = allResponses[allResponses.length - 1];
    const responseText = (responseElement as HTMLDivElement)?.innerHTML?.trim();
    return responseText ?? '';
  }, selectors.chatResponse);

  if (!response) {
    logger.error('Failed to extract response text');
    return { error: Errors.ElementNotFound.ChatResponse };
  }

  logger.log('Response received:');

  return { error: null, data: response };
}

/**
 * Initiates a chat session by submitting a series of prompts and collecting the responses.
 * Returns an array of objects containing the prompt and its corresponding response.
 */
export async function getPromptResponse(
  page: Page,
  prompts: string[]
): Promise<ErrorReturn<ChatData[]>> {
  try {
    const data: ChatData[] = [];

    for (const prompt of prompts) {
      // Submit the prompt
      const { error: promptError } = await submitPrompt(page, prompt);
      if (promptError) {
        logger.error(`Failed to submit prompt: ${prompt}`);
        return { error: promptError };
      }

      // Get the response for the prompt
      const { error: responseError, data: response } = await getLastResponse(page);
      if (responseError) {
        logger.error(`Failed to get response for prompt: ${prompt}`);
        return { error: responseError };
      }

      if (!response) {
        logger.error(`No response received for prompt: ${prompt}`);
        return { error: Errors.Text.NoText };
      }

      // Store the prompt and its response in the data array
      data.push({ prompt, response });
      logger.success(`Prompt processed: "${prompt}"`);
    }

    return { error: null, data };
  } catch (err) {
    logger.error('An error occurred while initiating chat:', err);
    return { error: (err as Error).message };
  }
}
