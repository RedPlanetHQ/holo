import path from 'path';
import fs from 'node:fs';
import { log } from '@clack/prompts';
import dotenv from 'dotenv';

/**
 * Check if required environment variables are present in .env
 * @param requiredVars - Array of required environment variable names
 * @returns {boolean} True if all required vars exist, otherwise exits
 */
export function checkEnvVariables(requiredVars: string[]): boolean {
  let envConfig: Record<string, string | undefined> = {};

  try {
    const envPath = path.join(process.cwd(), '.env');

    // Load .env file into process.env
    dotenv.config({ path: envPath });

    envConfig = dotenv.parse(fs.readFileSync(envPath, 'utf-8'));
  } catch (e) {}

  envConfig = {
    ...envConfig,
    ...process.env,
  };

  // Check for missing variables
  const missingVars = requiredVars.filter((varName) => !envConfig[varName]);

  if (missingVars.length > 0) {
    log.error(`Missing required environment variables in .env:`);
    missingVars.forEach((varName) => {
      log.error(`  - ${varName}`);
    });
    log.info('Run "holo setup" to configure your environment.');
    process.exit(1);
  }

  return true;
}

/**
 * Get required env vars based on holo.json provider configuration
 * @returns {string[]} Array of required environment variable names
 */
export function getRequiredEnvVars(): string[] {
  const holoJsonPath = path.join(process.cwd(), 'holo.json');

  // Always require CORE_API_KEY
  const requiredVars = ['CORE_API_KEY'];

  // Read holo.json to determine provider
  if (fs.existsSync(holoJsonPath)) {
    try {
      const fileContent = fs.readFileSync(holoJsonPath, 'utf-8');
      const holoConfig = JSON.parse(fileContent);

      if (holoConfig.providers?.name) {
        const providerEnvKey = `${holoConfig.providers.name.toUpperCase()}_API_KEY`;
        requiredVars.push(providerEnvKey);
      }
    } catch (error) {
      // If we can't parse holo.json, checkHoloJson will catch it
    }
  }

  return requiredVars;
}
