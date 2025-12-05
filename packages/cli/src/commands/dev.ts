import { Command } from 'commander';
import { commonOptions } from '../cli/common';
import { getVersion } from '../utilities/getVersion';
import { printInitialBanner } from '../utilities/initialBanner';
import chokidar from 'chokidar';
import { log } from '@clack/prompts';
import { execa } from 'execa';
import { checkHoloJson } from '../utilities/checkConfigFile';
import { checkEnvVariables, getRequiredEnvVars } from '../utilities/checkEnv';
import { getHoloAppPath, ensureProjectSetup } from '../utilities/setupProject';

let currentProcess;

export function configureDevCommand(program: Command) {
  return commonOptions(program.command('dev').description('run holo in local'))
    .version(getVersion(), '-v, --version', 'Display the version number')
    .action(async (options) => {
      checkHoloJson(); // Check for holo.json before proceeding
      checkEnvVariables(getRequiredEnvVars()); // Check for required .env variables
      await printInitialBanner(true);
      await ensureProjectSetup(); // Ensure project is set up before running
      currentProcess = await runDev();
      watchFiles(currentProcess);
    });
}

// Watch for file changes
function watchFiles(currentProcess: any) {
  const watcher = chokidar.watch('.', { ignored: /node_modules/ });

  watcher.on('change', (path) => {
    log.info(`File ${path} has been changed. Restarting...`);
    if (currentProcess) {
      currentProcess.kill();
    }
    currentProcess = runDev();
  });

  watcher.on('add', (path) => {
    log.info(`File ${path} has been added. Restarting...`);
    if (currentProcess) {
      currentProcess.kill();
    }
    currentProcess = runDev();
  });

  watcher.on('unlink', (path) => {
    log.info(`File ${path} has been removed. Restarting...`);
    if (currentProcess) {
      currentProcess.kill();
    }
    currentProcess = runDev();
  });
}

function runDev() {
  log.info(`Starting dev mode`);
  const cwd = process.cwd();
  const holoPath = getHoloAppPath();
  const env = { ...process.env, HOLO_CONFIG_PATH: cwd };

  // Execute pnpm dev command
  const child = execa('pnpm', ['dev'], {
    env,
    cwd: holoPath,
    stdout: 'pipe',
    stderr: 'pipe',
  });

  child.stdout.on('data', (data) => {
    log.info(data.toString());
  });

  child.stderr.on('data', (data) => {
    log.error(data.toString());
  });

  child.on('close', (code) => {
    log.info(`pnpm dev process exited with code ${code}`);
  });

  return child;
}
