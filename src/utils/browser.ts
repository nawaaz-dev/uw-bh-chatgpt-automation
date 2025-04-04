import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export function getBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: false,
    timeout: 0,
    protocolTimeout: 0,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--ignore-certificate-errors',
      '--ignore-certifcate-errors-spki-list',
      `--window-size=${480},${853}`,
      '--window-position=0,0',
      '--mute-audio',
      '--incognito',
      '--disable-extensions'
    ]
  });
}
