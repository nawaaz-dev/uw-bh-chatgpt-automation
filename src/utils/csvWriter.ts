import { createObjectCsvWriter } from 'csv-writer';
import { CsvWriter } from 'csv-writer/src/lib/csv-writer';
import { ObjectMap } from 'csv-writer/src/lib/lang/object';
import fs from 'fs';
import path from 'path';
import TurndownService from 'turndown';

import { Errors } from '@/config/errors';
import { ErrorReturn } from '@/types/generic';

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

const dir = {
  csv: {
    responses: path.resolve('./data/csv')
  }
};

const file = {
  csv: {
    response: (name: string) => dir.csv.responses + `/${name}.csv`
  }
};

/**
 * Converts HTML to Markdown format.
 */
export async function writeCSVFile({
  prompt1,
  chatResponse1,
  prompt2,
  chatResponse2
}: {
  prompt1: string;
  chatResponse1: string;
  prompt2: string;
  chatResponse2: string;
}): Promise<ErrorReturn<void>> {
  let csvWriter: CsvWriter<ObjectMap<string>>;

  // Create the directory recursively if it doesn't exist
  if (!fs.existsSync(dir.csv.responses)) {
    // If it doesn't exist, create the directory
    console.log('📁 CSV directory does not exist. Creating...');
    fs.mkdirSync(dir.csv.responses, { recursive: true });
  }

  try {
    // Instantiate the CSV writer
    csvWriter = createObjectCsvWriter({
      path: file.csv.response(`responses_${Date.now()}`),
      header: [
        { id: 'prompt1', title: 'Prompt #1' },
        { id: 'chatResponse1', title: 'Response #1' },
        { id: 'prompt2', title: 'Prompt #2' },
        { id: 'chatResponse2', title: 'Response #2' }
      ]
    });
  } catch (error) {
    console.error('❌ Failed to initialize CSV writer:', error);
    return { error: Errors.File.CSVCreateFailed, data: null };
  }

  try {
    // Save the reply response to the CSV file
    await csvWriter.writeRecords([
      {
        prompt1,
        chatResponse1: htmlToMarkdown(chatResponse1),
        prompt2,
        chatResponse2: htmlToMarkdown(chatResponse2)
      }
    ]);
  } catch (error) {
    console.error('❌ Failed to write to CSV file:', error);
    return { error: Errors.File.CSVWriteFailed, data: null };
  }

  console.log('✅ Reply response saved to chat_responses.csv');

  return { error: null, data: undefined };
}
