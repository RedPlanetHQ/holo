import { intro, outro, note, log } from '@clack/prompts';
import { Command } from 'commander';
import {
  CommonCommandOptions,
  commonOptions,
  wrapCommandAction,
} from '../cli/common';
import { getVersion } from '../utilities/getVersion';
import { printInitialBanner } from '../utilities/initialBanner';
import {
  loadExistingConfig,
  fetchLabels,
  promptLabels,
  fetchDocumentsForLabel,
  saveHoloConfig,
} from '../utilities/configSetup';
import fs from 'node:fs';
import path from 'node:path';

export function configureLabelsCommand(program: Command) {
  const labelsCommand = commonOptions(
    program
      .command('labels')
      .description('Manage CORE labels for your Holo project'),
  ).version(getVersion(), '-v, --version', 'Display the version number');

  // List subcommand
  labelsCommand
    .command('list')
    .description('List all available labels from CORE')
    .action(async () => {
      await printInitialBanner(false);
      await listLabelsCommand();
    });

  // Update subcommand
  labelsCommand
    .command('update')
    .description('Update selected labels in holo.json')
    .action(async () => {
      await printInitialBanner(false);
      await updateLabelsCommand();
    });

  return labelsCommand;
}

async function listLabelsCommand() {
  intro('Fetching labels from CORE...');

  try {
    const existingConfig = loadExistingConfig();
    const coreUrl = existingConfig.core?.url;

    if (!coreUrl) {
      log.error(
        'Error: Core URL not found in holo.json. Please run setup first.',
      );
      process.exit(1);
    }

    // Get Core API key from .env
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      log.error('Error: .env file not found. Please run setup first.');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const coreApiKeyMatch = envContent.match(/CORE_API_KEY=(.+)/);
    const coreApiKey = coreApiKeyMatch?.[1]?.trim();

    if (!coreApiKey) {
      log.error(
        'Error: CORE_API_KEY not found in .env. Please run setup first.',
      );
      process.exit(1);
    }

    const labels = await fetchLabels(coreUrl, coreApiKey);

    if (labels.length === 0) {
      log.info('No labels found in your CORE workspace.');
    } else {
      log.info(`Found ${labels.length} labels:`);
      labels.forEach((label) => {
        const selected = existingConfig.core?.labels?.includes(label.id)
          ? '[SELECTED]'
          : '';
        console.log(
          `  ${selected} ${label.name} - ${label.description || 'No description'}`,
        );
      });
    }

    outro('Labels listed successfully!');
  } catch (error) {
    log.error(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    process.exit(1);
  }
}

async function updateLabelsCommand() {
  intro('Updating labels...');

  try {
    const existingConfig = loadExistingConfig();
    const coreUrl = existingConfig.core?.url;

    if (!coreUrl) {
      log.error(
        'Error: Core URL not found in holo.json. Please run setup first.',
      );
      process.exit(1);
    }

    // Get Core API key from .env
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      log.error('Error: .env file not found. Please run setup first.');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const coreApiKeyMatch = envContent.match(/CORE_API_KEY=(.+)/);
    const coreApiKey = coreApiKeyMatch?.[1]?.trim();

    if (!coreApiKey) {
      log.error(
        'Error: CORE_API_KEY not found in .env. Please run setup first.',
      );
      process.exit(1);
    }

    // Fetch labels and prompt for selection
    const labelsData = await fetchLabels(coreUrl, coreApiKey);
    const selectedLabels = await promptLabels(labelsData, existingConfig);

    // Fetch documents for each selected label
    const documentsData = new Map<string, any[]>();
    for (const labelId of selectedLabels) {
      const documents = await fetchDocumentsForLabel(
        coreUrl,
        coreApiKey,
        labelId,
      );
      documentsData.set(labelId, documents);
    }

    // Update holo.json
    if (!existingConfig.providers) {
      log.error(
        'Error: Provider configuration not found. Please run setup first.',
      );
      process.exit(1);
    }

    saveHoloConfig(
      coreUrl,
      selectedLabels,
      existingConfig.providers,
      existingConfig,
      labelsData,
      documentsData,
    );

    outro('Labels updated successfully! 🎉');
  } catch (error) {
    log.error(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    process.exit(1);
  }
}
