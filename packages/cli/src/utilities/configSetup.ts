import { text, isCancel, cancel, note } from '@clack/prompts';
import fs from 'node:fs';
import path from 'node:path';
import { HoloConfigSchema } from './holoSchema';

interface ProviderConfig {
  name: string;
  model: string;
  baseUrl: string;
}

interface ExistingHoloConfig {
  name?: string;
  coreUrl?: string;
  colors?: any;
  favicon?: string;
  navigation?: any[];
  navbar?: any;
  footer?: any;
  providers?: ProviderConfig;
}

export const PROVIDER_TEMPLATES = {
  openai: {
    name: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4.1-2025-04-14',
  },
};

/**
 * Loads existing holo.json configuration if it exists
 */
export function loadExistingConfig(): ExistingHoloConfig {
  const holoJsonPath = path.join(process.cwd(), 'holo.json');
  let existingConfig: ExistingHoloConfig = {};

  if (fs.existsSync(holoJsonPath)) {
    try {
      const fileContent = fs.readFileSync(holoJsonPath, 'utf-8');
      existingConfig = JSON.parse(fileContent);
      note('Found existing holo.json. Using existing values as defaults.');
    } catch (error) {
      note('Found holo.json but could not parse it. Starting fresh.');
    }
  }

  return existingConfig;
}

/**
 * Prompts user for Core URL
 */
export async function promptCoreUrl(
  existingConfig: ExistingHoloConfig,
): Promise<string> {
  const coreUrl = await text({
    message: 'Enter your Core URL:',
    placeholder: 'https://core.example.com',
    initialValue: existingConfig.coreUrl ?? 'https://core.heysol.ai',
    validate: (value) => {
      if (!value) return 'Core URL is required';
      try {
        new URL(value);
        return undefined;
      } catch {
        return 'Please enter a valid URL';
      }
    },
  });

  if (isCancel(coreUrl)) {
    cancel('Setup cancelled.');
    process.exit(0);
  }

  return coreUrl as string;
}

/**
 * Prompts user for Core API Key
 */
export async function promptCoreApiKey(): Promise<string> {
  const coreApiKey = await text({
    message: 'Enter your Core API Key:',
    placeholder: 'core_xxx',
    validate: (value) => {
      if (!value) return 'Core API Key is required';
      return undefined;
    },
  });

  if (isCancel(coreApiKey)) {
    cancel('Setup cancelled.');
    process.exit(0);
  }

  return coreApiKey as string;
}

/**
 * Prompts user for provider model
 */
export async function promptProviderModel(
  providerName: string,
  defaultModel: string,
  existingConfig: ExistingHoloConfig,
): Promise<string> {
  const providerModel = await text({
    message: `Enter ${providerName} model:`,
    placeholder: defaultModel,
    initialValue: existingConfig.providers?.model || defaultModel,
    validate: (value) => {
      if (!value) return 'Model name is required';
      return undefined;
    },
  });

  if (isCancel(providerModel)) {
    cancel('Setup cancelled.');
    process.exit(0);
  }

  return providerModel as string;
}

/**
 * Prompts user for provider API key
 */
export async function promptProviderApiKey(providerName: string): Promise<string> {
  const providerApiKey = await text({
    message: `Enter your ${providerName.toUpperCase()} API Key:`,
    placeholder: 'sk-xxx',
    validate: (value) => {
      if (!value) return 'API Key is required';
      return undefined;
    },
  });

  if (isCancel(providerApiKey)) {
    cancel('Setup cancelled.');
    process.exit(0);
  }

  return providerApiKey as string;
}

/**
 * Creates or updates holo.json with validation
 */
export function saveHoloConfig(
  coreUrl: string,
  providerConfig: {
    name: string;
    model: string;
    baseUrl: string;
  },
  existingConfig: ExistingHoloConfig,
) {
  const holoJsonPath = path.join(process.cwd(), 'holo.json');

  const holoConfig = {
    ...existingConfig, // Preserve all existing fields
    coreUrl: coreUrl,
    providers: {
      name: providerConfig.name,
      model: providerConfig.model,
      baseUrl: providerConfig.baseUrl,
    },
  };

  // If no existing config, set default structure
  if (!existingConfig.name) {
    holoConfig.name = 'My Holo Project';
    holoConfig.navigation = [
      {
        group: 'Getting Started',
        pages: ['introduction'],
      },
    ];
  }

  // Validate the config against the schema
  try {
    HoloConfigSchema.parse(holoConfig);
    fs.writeFileSync(
      holoJsonPath,
      JSON.stringify(holoConfig, null, 2),
      'utf-8',
    );
    note(`${fs.existsSync(holoJsonPath) ? 'Updated' : 'Created'} holo.json`);
  } catch (error) {
    note('Warning: Generated holo.json does not match expected schema');
    if (error instanceof Error) {
      note(`Validation error: ${error.message}`);
    }
    // Still write the file but warn the user
    fs.writeFileSync(
      holoJsonPath,
      JSON.stringify(holoConfig, null, 2),
      'utf-8',
    );
    note(
      'holo.json was created but may need manual corrections. Please check the schema.',
    );
  }
}

/**
 * Updates or creates .env file with API keys
 */
export function updateEnvFile(
  coreApiKey: string,
  providerName: string,
  providerApiKey: string,
) {
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  // Update or add CORE_API_KEY
  if (envContent.includes('CORE_API_KEY=')) {
    envContent = envContent.replace(
      /CORE_API_KEY=.*/g,
      `CORE_API_KEY=${coreApiKey}`,
    );
  } else {
    envContent += `\nCORE_API_KEY=${coreApiKey}`;
  }

  // Update or add provider API key
  const providerEnvKey = `${providerName.toUpperCase()}_API_KEY`;
  if (envContent.includes(`${providerEnvKey}=`)) {
    envContent = envContent.replace(
      new RegExp(`${providerEnvKey}=.*`, 'g'),
      `${providerEnvKey}=${providerApiKey}`,
    );
  } else {
    envContent += `\n${providerEnvKey}=${providerApiKey}`;
  }

  fs.writeFileSync(envPath, envContent.trim(), 'utf-8');
  note(`${fs.existsSync(envPath) ? 'Updated' : 'Created'} .env`);
}
