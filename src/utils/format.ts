import TurndownService from 'turndown';

/**
 * Converts HTML (ChatGPT-style DOM structure) into markdown text.
 */
export function htmlToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    codeBlockStyle: 'fenced',
    headingStyle: 'atx'
  });

  return turndownService.turndown(html).trim();
}
