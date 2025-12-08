import path from 'path';
import fs from 'node:fs';
import { log } from '@clack/prompts';
import { HoloConfigSchema } from './holoSchema';
import { fromZodError } from 'zod-validation-error';

/**
 * Check if holo.json exists and validate its schema.
 * @returns {boolean} True if holo.json exists and is valid, otherwise exits.
 */
export function checkHoloJson() {
  const holoJsonPath = path.join(process.cwd(), 'holo.json');

  // Check if file exists
  if (!fs.existsSync(holoJsonPath)) {
    log.error('holo.json not found in the current directory. Exiting...');
    process.exit(1);
  }

  // Read and parse the file
  let holoConfig;
  try {
    const fileContent = fs.readFileSync(holoJsonPath, 'utf-8');
    holoConfig = JSON.parse(fileContent);
  } catch (error) {
    log.error('Failed to parse holo.json. Please ensure it is valid JSON.');
    if (error instanceof Error) {
      log.error(error.message);
    }
    process.exit(1);
  }

  // Validate against Zod schema
  const result = HoloConfigSchema.safeParse(holoConfig);

  if (!result.success) {
    log.error('Invalid holo.json configuration:');
    const validationError = fromZodError(result.error);
    log.error(validationError.toString());
    process.exit(1);
  }

  log.success('holo.json is valid!');
  return true;
}
