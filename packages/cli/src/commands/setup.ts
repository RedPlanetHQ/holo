import { intro, note, outro, spinner } from '@clack/prompts';
import { Command } from 'commander';
import {
  CommonCommandOptions,
  commonOptions,
  wrapCommandAction,
} from '../cli/common';
import { getVersion } from '../utilities/getVersion';
import { printInitialBanner } from '../utilities/initialBanner';
import { execa } from 'execa';
import fs from 'node:fs';
import degit from 'degit';
import path from 'node:path';
import { checkHoloJson } from '../utilities/checkConfigFile';

export function configureSetupCommand(program: Command) {
  return commonOptions(
    program
      .command('setup')
      .description('Setup next.js app required to run holo'),
  )
    .version(getVersion(), '-v, --version', 'Display the version number')
    .action(async (options) => {
      checkHoloJson(); // Check for holo.json before proceeding
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
  intro('Setting up Holo project...');

  const homeDir = require('os').homedir();
  const holoDir = path.join(homeDir, '.holo');

  // Create .holo folder if it doesn't exist
  if (!fs.existsSync(holoDir)) {
    fs.mkdirSync(holoDir);
    note(`Created directory: ${holoDir}`);
  } else {
    note(`Directory already exists: ${holoDir}`);
  }

  // Clone the repository
  const emitter = degit('harshithmullapudi/holo', {
    cache: false,
    force: true,
    verbose: true,
  });

  const spin = spinner();
  spin.start('Cloning repository...');

  try {
    await emitter.clone(holoDir);
    spin.stop('Repository cloned successfully.');
  } catch (error) {
    spin.stop('Failed to clone repository.');
    console.error(error);
    process.exit(1);
  }

  // Check if pnpm is installed, if not install it
  try {
    await execa('pnpm', ['--version']);
    note('pnpm is already installed.');
  } catch {
    note('pnpm is not installed. Installing pnpm...');
    try {
      await execa('npm', ['install', '-g', 'pnpm']);
      note('pnpm installed successfully.');
    } catch (error) {
      console.error('Error: pnpm installation failed');
      console.error(error);
      process.exit(1);
    }
  }

  // Run pnpm install in the .holo folder
  try {
    await execa('pnpm', ['install'], { cwd: holoDir, stdio: 'inherit' });
    note('pnpm install completed successfully.');
  } catch (error) {
    console.error('Error: pnpm install failed');
    console.error(error);
    process.exit(1);
  }

  outro('Holo project setup completed successfully!');
}
