import { Page } from 'puppeteer';

import { Errors } from '@/config/errors';
import { ErrorReturn } from '@/types/generic';

const url = {
  chatMain: 'https://chatgpt.com/'
};

const selectors = {
  chatInput: 'div[contenteditable="true"]',
  chatSubmitButton: 'button[id="composer-submit-button"]',
  voiceChatButton: 'button[aria-label="Start voice mode"]',
  chatResponse: 'div[class*="markdown"]'
};

export async function runConversation(
  page: Page,
  prompt1: string,
  prompt2: string
): Promise<
  ErrorReturn<{
    prompt1: string;
    chatResponse1: string;
    prompt2: string;
    chatResponse2: string;
  }>
> {
  try {
    // Navigate to the chat page
    await page.goto(url.chatMain, { waitUntil: 'networkidle2' });

    // Step 1: Enter the prompt
    const chatInput = await page.waitForSelector(selectors.chatInput);
    if (!chatInput) {
      console.error('❌ Chat input not found');
      return { error: Errors.ElementNotFound.ChatInput, data: null };
    }
    console.log('💬 Entering prompt...');
    await chatInput.type(prompt1, { delay: 50 });
    console.log('📩 Prompt entered. Submitting...');

    const chatSubmitButton = await page.waitForSelector(selectors.chatSubmitButton);
    if (!chatSubmitButton) {
      console.error('❌ Submit button not found');
      return { error: Errors.ElementNotFound.ChatSendButton, data: null };
    }
    await chatSubmitButton.click();
    console.log('👉 Clicked submit button');

    // Step 2: Wait for the response
    console.log('📩 Waiting for the response...');
    try {
      // Wait for the reply to be generated
      await page.waitForFunction(
        ({ selectors }) => {
          return document.querySelector(selectors.voiceChatButton);
        },
        { polling: 500, timeout: 15000 },
        { selectors }
      );
    } catch (err) {
      console.error('❌ Something went wrong while receiving the first response:', err);
      return {
        error: Errors.ElementNotFound.ChatResponeTimeout,
        data: null
      };
    }

    // Step 3: Extract the response text
    const chatResponse1 = await page.evaluate((selector) => {
      const allResponses = document.querySelectorAll(selector);
      if (allResponses.length === 0) {
        console.error('❌ No response elements found');
        return null;
      }
      const responseElement = allResponses[allResponses.length - 1];
      const responseText = (responseElement as HTMLDivElement)?.innerHTML?.trim();
      return responseText ?? '';
    }, selectors.chatResponse);

    console.log('Chat response 1:', chatResponse1);

    if (!chatResponse1) {
      console.error('❌ Failed to extract response text');
      return { error: Errors.ElementNotFound.ChatResponse, data: null };
    }
    console.log('✅ Response received:', chatResponse1, typeof chatResponse1, chatResponse1.length);

    // Step 5: Send the reply
    await chatInput.evaluate((el) => ((el as HTMLInputElement).innerHTML = ''));
    await chatInput.type(prompt2, { delay: 50 });
    console.log('💬 Entering reply...');
    console.log('📩 Reply entered. Submitting...');
    const replySubmitButton = await page.waitForSelector(selectors.chatSubmitButton);
    if (!replySubmitButton) {
      console.error('❌ Submit button not found');
      return { error: Errors.ElementNotFound.ChatSendButton, data: null };
    }
    await replySubmitButton.click();
    console.log('👉 Clicked submit button');

    // Step 6: Wait for the reply response
    console.log('📩 Waiting for the reply response...');
    await page.waitForSelector(selectors.chatResponse, { timeout: 15000 });

    try {
      // Wait for the reply to be generated
      await page.waitForFunction(
        ({ selectors }) => {
          return document.querySelector(selectors.voiceChatButton);
        },
        { polling: 500, timeout: 15000 },
        { selectors }
      );
    } catch (err) {
      console.error('❌ Something went wrong while receiving the first response:', err);
      return {
        error: Errors.ElementNotFound.ChatResponeTimeout,
        data: null
      };
    }

    const chatResponse2 = await page.evaluate((selector) => {
      const allResponses = document.querySelectorAll(selector);
      if (allResponses.length === 0) {
        console.error('❌ No response elements found');
        return null;
      }
      const responseElement = allResponses[allResponses.length - 1];
      const responseText = (responseElement as HTMLDivElement)?.innerHTML?.trim();
      return responseText ?? '';
    }, selectors.chatResponse);

    console.log('Chat response 2:', chatResponse2);

    if (!chatResponse2) {
      console.error('❌ Failed to extract reply response text');
      return { error: Errors.ElementNotFound.ChatResponse, data: null };
    }
    console.log('✅ Reply response received:', chatResponse2);

    return {
      error: null,
      data: { prompt1, chatResponse1, prompt2, chatResponse2 }
    };
  } catch (err) {
    console.error('❌ An error occurred:', err);
    return { error: (err as Error).message, data: null };
  }
}
