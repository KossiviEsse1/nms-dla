import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

const SCHEMA_FILE_PATH = join(process.cwd(), 'public', 'nsnDB.csv');

export async function getSchema(): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const schema: string[][] = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(SCHEMA_FILE_PATH),
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      // Example: Split the line into fields if it's a CSV row
      const fields = line.split(',');
      schema.push(fields);
    });

    rl.on('close', () => {
      resolve(schema);
    });

    rl.on('error', (error) => {
      reject(error);
    });
  });
}