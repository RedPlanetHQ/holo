import { intro, outro, note, select, log } from '@clack/prompts';
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
  fetchDocumentsForLabel,
} from '../utilities/configSetup';
import fs from 'node:fs';
import path from 'node:path';

export function configureDocumentsCommand(program: Command) {
  return commonOptions(
    program
      .command('documents')
      .description('List documents from CORE by label'),
  )
    .version(getVersion(), '-v, --version', 'Display the version number')
    .action(async (options) => {
      await printInitialBanner(false);
      await documentsCommand(options);
    });
}

async function documentsCommand(options: unknown) {
  return await wrapCommandAction(
    'documentsCommand',
    CommonCommandOptions,
    options,
    async (opts) => {
      return await _documentsCommand(opts);
    },
  );
}

async function _documentsCommand(options: CommonCommandOptions) {
  intro('Fetching documents from CORE...');

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

    // Fetch all labels
    const labels = await fetchLabels(coreUrl, coreApiKey);

    if (labels.length === 0) {
      log.info('No labels found in your CORE workspace.');
      outro('Done');
      return;
    }

    // Prompt user to select a label
    const selectedLabelId = await select({
      message: 'Select a label to view documents:',
      options: labels.map((label) => ({
        value: label.id,
        label: label.name,
        hint: label.description,
      })),
    });

    if (!selectedLabelId) {
      outro('Cancelled');
      return;
    }

    // Fetch documents for the selected label
    const documents = await fetchDocumentsForLabel(
      coreUrl,
      coreApiKey,
      selectedLabelId as string,
    );

    if (documents.length === 0) {
      log.info('No documents found for this label.');
    } else {
      const selectedLabel = labels.find((l) => l.id === selectedLabelId);
      log.info(`Documents in ${selectedLabel?.name}:`);
      console.log('\nID\t\t\t\t\tTitle');
      console.log('─'.repeat(80));
      documents.forEach((doc) => {
        console.log(`${doc.id}\t${doc.title || 'Untitled'}`);
      });
    }

    outro('Documents listed successfully!');
  } catch (error) {
    log.error(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    process.exit(1);
  }
}
