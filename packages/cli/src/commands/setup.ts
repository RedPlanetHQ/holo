import { intro, outro } from '@clack/prompts';
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
  promptCoreUrl,
  promptCoreApiKey,
  promptProviderModel,
  promptProviderApiKey,
  saveHoloConfig,
  updateEnvFile,
  PROVIDER_TEMPLATES,
} from '../utilities/configSetup';
import { generateIntroduction } from '../utilities/generateIntroduction';

export function configureSetupCommand(program: Command) {
  return commonOptions(
    program
      .command('setup')
      .description('Setup Holo configuration (holo.json and .env)'),
  )
    .version(getVersion(), '-v, --version', 'Display the version number')
    .action(async (options) => {
      await printInitialBanner(false);
      await setupCommand(options);
    });
}

export async function setupCommand(options: unknown) {
  return await wrapCommandAction(
    'setupCommand',
    CommonCommandOptions,
    options,
    async (opts) => {
      return await _setupCommand(opts);
    },
  );
}

async function _setupCommand(options: CommonCommandOptions) {
  return setup();
}

export async function setup() {
  intro('Setting up Holo configuration...');

  // Step 1: Load existing configuration if it exists
  const existingConfig = loadExistingConfig();

  // Step 2: Get Core URL and API Key
  const coreUrl = await promptCoreUrl(existingConfig);
  const coreApiKey = await promptCoreApiKey();

  // Step 3: Use OpenAI as the provider (for now)
  const selectedProvider = PROVIDER_TEMPLATES.openai;

  // Step 4: Get provider-specific details
  const providerModel = await promptProviderModel(
    selectedProvider.name,
    selectedProvider.defaultModel,
    existingConfig,
  );
  const providerApiKey = await promptProviderApiKey(selectedProvider.name);

  // Step 5: Create/Update holo.json
  saveHoloConfig(
    coreUrl,
    {
      name: selectedProvider.name,
      model: providerModel,
      baseUrl: selectedProvider.baseUrl,
    },
    existingConfig,
  );

  // Step 6: Create/Update .env
  updateEnvFile(coreApiKey, selectedProvider.name, providerApiKey);

  // Step 7: Fetch persona from Core API and generate introduction.mdx
  await generateIntroduction(coreUrl, coreApiKey, {
    name: selectedProvider.name,
    model: providerModel,
    baseUrl: selectedProvider.baseUrl,
    apiKey: providerApiKey,
  });

  outro('Holo setup completed successfully! 🎉');
}
