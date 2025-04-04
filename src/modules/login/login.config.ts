const selectors = {
  loginButton: 'button[data-testid="login-button"]',
  emailInput: 'input[type="email"]',
  emailSubmitButton: 'input[type="submit"]',
  passwordInput: 'input[type="password"]',
  passwordSubmitButton: 'button[type="submit"]',
  emailVerificationInput: 'input[type="number"]',
  emailVerificationError: `[class*="errorMessage"]`,
  emailVerificationSubmitButton: 'button[type="submit"]',
  chatInput: 'div[contenteditable="true"]'
};

const urls = {
  chat: 'https://chatgpt.com/',
  login: 'https://chat.openai.com/auth/login',
  auth: 'https://auth.openai.com/authorize',
  authError: 'https://chatgpt.com/api/auth/error',
  authChallengeEmail: 'https://auth.openai.com/login_challenge'
};

const loginConfig = {
  selectors,
  urls
};

export default loginConfig;
