import { note, spinner } from '@clack/prompts';
import { execa } from 'execa';
import fs from 'node:fs';
import degit from 'degit';
import path from 'node:path';

/**
 * Sets up the Holo project by cloning the repository and installing dependencies
 */
export async function setupProject(dir?: string) {
  const currentDir = process.cwd();
  const holoDir = dir ? path.join(dir) : path.join(currentDir, '.holo');

  // Create .holo folder if it doesn't exist
  if (!fs.existsSync(holoDir)) {
    fs.mkdirSync(holoDir);
  }

  // Clone the repository
  const emitter = degit('redplanethq/holo', {
    cache: false,
    force: true,
    verbose: false,
  });

  const spin = spinner();
  spin.start('Setting up Holo project...');

  try {
    await emitter.clone(holoDir);
  } catch (error) {
    spin.stop('Failed to clone repository');
    console.error(error);
    process.exit(1);
  }

  // Check if pnpm is installed, if not install it
  await ensurePnpmInstalled();

  // Run pnpm install in the .holo folder
  try {
    await execa('pnpm', ['install'], {
      cwd: holoDir,
      stdio: 'pipe',
    });
    spin.stop('Holo project setup complete');
  } catch (error) {
    spin.stop('Failed to install dependencies');
    console.error(error);
    process.exit(1);
  }
}

/**
 * Ensures pnpm is installed globally
 */
async function ensurePnpmInstalled() {
  try {
    await execa('corepack', ['prepare', 'pnpm@9.0.0', '--activate'], {
      stdio: 'pipe',
    });
    const response = await execa('pnpm', ['--version'], { stdio: 'pipe' });
    console.log(response);
  } catch (error) {
    console.error('Error: pnpm installation failed');
    console.error(error);
    process.exit(1);
  }
}

/**
 * Gets the path to the .holo directory
 */
export function getHoloPath(): string {
  const currentDir = process.cwd();
  return path.join(currentDir, '.holo');
}

/**
 * Gets the path to the holo app directory
 */
export function getHoloAppPath(): string {
  return path.join(getHoloPath(), 'apps', 'holo');
}

/**
 * Checks if the Holo project is set up
 */
export function isProjectSetup(): boolean {
  const holoAppPath = getHoloAppPath();
  return (
    fs.existsSync(holoAppPath) &&
    fs.existsSync(path.join(holoAppPath, 'package.json'))
  );
}

/**
 * Ensures the Holo project is set up, sets it up if not
 */
export async function ensureProjectSetup() {
  if (!isProjectSetup()) {
    await setupProject();
  }
}
