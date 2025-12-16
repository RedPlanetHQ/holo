import { text, isCancel, cancel, note, multiselect, log } from '@clack/prompts';
import fs from 'node:fs';
import path from 'node:path';
import { HoloConfigSchema } from './holoSchema';

interface ProviderConfig {
  name: string;
  model: string;
  baseUrl: string;
}

interface CoreConfig {
  url: string;
  labels?: string[];
}

interface ExistingHoloConfig {
  name?: string;
  core?: CoreConfig;
  colors?: any;
  favicon?: string;
  navigation?: any[];
  navbar?: any;
  footer?: any;
  providers?: ProviderConfig;
  deployment?: string;
}

interface Label {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface Document {
  id: string;
  episodeId: string;
  title: string;
  type: string;
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
      log.info('Found existing holo.json. Using existing values as defaults.');
    } catch (error) {
      log.error('Found holo.json but could not parse it. Starting fresh.');
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
    initialValue: existingConfig.core?.url ?? 'https://core.heysol.ai',
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
 * Fetches labels from Core API
 */
export async function fetchLabels(
  coreUrl: string,
  coreApiKey: string,
): Promise<Label[]> {
  try {
    const response = await fetch(`${coreUrl}/api/v1/labels`, {
      headers: {
        Authorization: `Bearer ${coreApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch labels: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    log.error('Warning: Could not fetch labels from Core API');
    return [];
  }
}

/**
 * Prompts user to select labels
 */
export async function promptLabels(
  labels: Label[],
  existingConfig: ExistingHoloConfig,
): Promise<string[]> {
  if (labels.length === 0) {
    log.info('No labels found in your Core workspace');
    return [];
  }

  const selectedLabels = await multiselect({
    message: 'Select labels to include:',
    options: labels.map((label) => ({
      value: label.id,
      label: label.name,
      hint: label.description,
    })),
    initialValues: existingConfig.core?.labels ?? [],
  });

  if (isCancel(selectedLabels)) {
    cancel('Setup cancelled.');
    process.exit(0);
  }

  return selectedLabels as string[];
}

/**
 * Fetches documents for a specific label with pagination support
 */
export async function fetchDocumentsForLabel(
  coreUrl: string,
  coreApiKey: string,
  labelId: string,
): Promise<Document[]> {
  try {
    const allDocuments: Document[] = [];
    let hasMore = true;
    let cursor: string | undefined = undefined;

    while (hasMore) {
      const url = new URL(`${coreUrl}/api/v1/logs`);
      url.searchParams.append('label', labelId);
      url.searchParams.append('type', 'DOCUMENT');
      if (cursor) {
        url.searchParams.append('cursor', cursor);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${coreApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract documents from logs array
      if (data.logs && Array.isArray(data.logs)) {
        allDocuments.push(...data.logs);
      }

      hasMore = data.hasMore || false;
      cursor = data.nextCursor;
    }

    return allDocuments;
  } catch (error) {
    log.error(`Warning: Could not fetch documents for label ${labelId}`);
    return [];
  }
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
export async function promptProviderApiKey(
  providerName: string,
): Promise<string> {
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
  selectedLabels: string[],
  providerConfig: {
    name: string;
    model: string;
    baseUrl: string;
  },
  existingConfig: ExistingHoloConfig,
  labelsData: Label[],
  documentsData: Map<string, Document[]>,
) {
  const holoJsonPath = path.join(process.cwd(), 'holo.json');

  // Build navigation from documents
  const navigation: any[] = [];

  // Get previously selected label IDs
  const previousLabelIds = existingConfig.core?.labels || [];

  // Find newly added labels and removed labels
  const newlyAddedLabelIds = selectedLabels.filter(
    (id) => !previousLabelIds.includes(id),
  );
  const removedLabelIds = previousLabelIds.filter(
    (id) => !selectedLabels.includes(id),
  );

  // Get label names for removed labels to filter out their navigation groups
  const removedLabelNames = removedLabelIds
    .map((id) => labelsData.find((l) => l.id === id)?.name)
    .filter(Boolean);

  // Add existing navigation groups that should be kept
  if (existingConfig.navigation) {
    existingConfig.navigation.forEach((group) => {
      const isCoreGroup = group.pages?.some((page: string) =>
        page.startsWith('CORE '),
      );

      // Keep non-CORE groups
      if (!isCoreGroup) {
        navigation.push(group);
      }
      // Keep CORE groups that are not removed labels
      else if (isCoreGroup && !removedLabelNames.includes(group.group)) {
        // Check if this label is in selectedLabels
        const labelForGroup = labelsData.find((l) => l.name === group.group);
        if (labelForGroup && selectedLabels.includes(labelForGroup.id)) {
          // This is an existing label group that should be kept as-is
          // unless it's a newly added label
          if (!newlyAddedLabelIds.includes(labelForGroup.id)) {
            navigation.push(group);
          }
        }
      }
    });
  }

  // Add default Getting Started if no navigation exists
  if (navigation.length === 0) {
    navigation.push({
      group: 'Getting Started',
      pages: ['introduction'],
    });
  }

  // Add CORE document groups for newly added labels or labels without navigation
  selectedLabels.forEach((labelId) => {
    const label = labelsData.find((l) => l.id === labelId);
    const documents = documentsData.get(labelId) || [];

    if (label && documents.length > 0) {
      // Check if this label's navigation group already exists
      const existingGroupIndex = navigation.findIndex(
        (g) => g.group === label.name,
      );

      // If newly added or doesn't exist in navigation, add it
      if (
        newlyAddedLabelIds.includes(labelId) ||
        existingGroupIndex === -1
      ) {
        navigation.push({
          group: label.name,
          pages: documents.map((doc) => `CORE ${doc.id}`),
        });
      }
    }
  });

  // Build core config - only include labels if there are any selected
  const coreConfig: any = {
    url: coreUrl,
  };

  if (selectedLabels.length > 0) {
    coreConfig.labels = selectedLabels;
  }

  const holoConfig = {
    ...existingConfig, // Preserve all existing fields
    core: coreConfig,
    providers: {
      name: providerConfig.name,
      model: providerConfig.model,
      baseUrl: providerConfig.baseUrl,
    },
    navigation,
  };

  // If no existing config, set default structure
  if (!existingConfig.name) {
    holoConfig.name = 'My Holo Project';
  }

  // Validate the config against the schema
  try {
    HoloConfigSchema.parse(holoConfig);
    fs.writeFileSync(
      holoJsonPath,
      JSON.stringify(holoConfig, null, 2),
      'utf-8',
    );
    log.info(
      `${fs.existsSync(holoJsonPath) ? 'Updated' : 'Created'} holo.json`,
    );
  } catch (error) {
    log.error('Warning: Generated holo.json does not match expected schema');
    if (error instanceof Error) {
      log.error(`Validation error: ${error.message}`);
    }
    // Still write the file but warn the user
    fs.writeFileSync(
      holoJsonPath,
      JSON.stringify(holoConfig, null, 2),
      'utf-8',
    );
    log.info(
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
  log.info(`${fs.existsSync(envPath) ? 'Updated' : 'Created'} .env`);
}
