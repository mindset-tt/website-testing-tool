#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const electronVitePackageJsonUrl = import.meta.resolve('electron-vite/package.json');
const electronVitePackageDir = dirname(fileURLToPath(electronVitePackageJsonUrl));
const electronViteCli = join(electronVitePackageDir, 'bin', 'electron-vite.js');
const env = { ...process.env };

delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(process.execPath, [electronViteCli, 'dev', ...process.argv.slice(2)], {
  env,
  stdio: 'inherit'
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

child.on('close', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
