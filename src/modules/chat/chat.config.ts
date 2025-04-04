const urls = {
  chatMain: 'https://chatgpt.com/'
};

const selectors = {
  chatInput: 'div[contenteditable="true"]',
  chatSubmitButton: 'button[id="composer-submit-button"]',
  voiceChatButton: 'button[aria-label="Start voice mode"]',
  chatResponse: 'div[class*="markdown"]'
};

const chatConfig = {
  urls,
  selectors
};

export default chatConfig;
