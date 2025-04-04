import { createObjectCsvWriter } from 'csv-writer';
import { CsvWriter } from 'csv-writer/src/lib/csv-writer';
import { ObjectMap } from 'csv-writer/src/lib/lang/object';
import fs from 'fs';
import path from 'path';

import { Errors } from '@/config/errors';
import { ErrorReturn } from '@/types/generic';

import { logger } from './logger';

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

export type CSVWriterDataFormat = { id: string; title: string; value: string };

/**
 * Converts HTML to Markdown format.
 */
export async function writeCSVFile(
  data: CSVWriterDataFormat[]
): Promise<ErrorReturn<{ filename: string }>> {
  let csvWriter: CsvWriter<ObjectMap<string>>;

  // Create the directory recursively if it doesn't exist
  if (!fs.existsSync(dir.csv.responses)) {
    // If it doesn't exist, create the directory
    logger.log('📁 CSV directory does not exist. Creating...');
    fs.mkdirSync(dir.csv.responses, { recursive: true });
  }

  /**
   * Create headers and values from the data.
   */
  const { header, values } = data.reduce(
    (acc, curr) => {
      acc.header.push({
        id: curr.id,
        title: curr.title
      });
      acc.values.push({
        [curr.id]: curr.value
      });
      return acc;
    },
    { header: [], values: [] } as {
      header: { id: string; title: string }[];
      values: Record<string, string>[];
    }
  );

  const filename = file.csv.response(`responses_${Date.now()}`);

  try {
    // Instantiate the CSV writer
    csvWriter = createObjectCsvWriter({
      path: filename,
      header: header
    });
  } catch (error) {
    logger.error('Failed to initialize CSV writer:', error);
    return { error: Errors.File.CSVCreateFailed };
  }

  try {
    // Save the reply response to the CSV file
    await csvWriter.writeRecords(values);
  } catch (error) {
    logger.error('Failed to write to CSV file:', error);
    return { error: Errors.File.CSVWriteFailed };
  }

  logger.success('Reply response saved to chat_responses.csv');

  return { error: null, data: { filename } };
}
