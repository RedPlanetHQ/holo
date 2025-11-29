import { Command } from 'commander';
import { commonOptions } from '../cli/common';
import { getVersion } from '../utilities/getVersion';
import { printInitialBanner } from '../utilities/initialBanner';
import { note, log } from '@clack/prompts';
import { execa } from 'execa';
import path from 'node:path';
import cpy from 'cpy';
import { checkHoloJson } from '../utilities/checkConfigFile';
import { checkEnvVariables, getRequiredEnvVars } from '../utilities/checkEnv';
import { getHoloAppPath, ensureProjectSetup } from '../utilities/setupProject';

export function configureBuildCommand(program: Command) {
  return commonOptions(
    program
      .command('build')
      .description('build holo in local and save to dist folder'),
  )
    .version(getVersion(), '-v, --version', 'Display the version number')
    .action(async (options) => {
      checkHoloJson(); // Check for holo.json before proceeding
      checkEnvVariables(getRequiredEnvVars()); // Check for required .env variables
      await ensureProjectSetup(); // Ensure project is set up before building
      await runBuild();
      await copyFiles();
    });
}

// Function to run the build command
async function runBuild() {
  note(`Starting build`);
  const holoPath = getHoloAppPath();

  try {
    await execa('pnpm', ['build'], {
      cwd: holoPath,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    note('Build completed successfully.');
  } catch (err: any) {
    log.error(`Build failed: ${err.message}`);
    process.exit(1);
  }
}

// Function to copy files
async function copyFiles() {
  const holoPath = getHoloAppPath();
  const distPath = path.join(process.cwd(), 'dist');

  try {
    // Create the dist directory if it doesn't exist
    await cpy(['.next/**', 'package.json'], distPath, { cwd: holoPath });

    // Copy all items from the current working directory to dist
    await cpy(['*', '!build_dist/**'], distPath, { cwd: process.cwd() });

    note('Files copied successfully.');
  } catch (err: any) {
    log.error(`File copy failed: ${err.message}`);
    process.exit(1);
  }
}
