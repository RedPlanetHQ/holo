import path from 'path';
import fs from 'node:fs';
import { log } from '@clack/prompts';

/**
 * Check if holo.json exists in the current directory.
 * @returns {boolean} True if holo.json exists, otherwise false.
 */
export function checkHoloJson() {
  const holoJsonPath = path.join(process.cwd(), 'holo.json');

  if (!fs.existsSync(holoJsonPath)) {
    log.error('holo.json not found in the current directory. Exiting...');
    process.exit(1);
  }

  return true;
}
