// Runs the built API and worker together against the local services, after applying any
// pending migrations, as the browser tests need them (Seam 3). Settings come from the
// environment first and ../../.env.example second; stopping this process stops both.
import { execFileSync, spawn } from 'node:child_process';

const ENV_FILE = '--env-file=../../.env.example';
const isWindows = process.platform === 'win32';

execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  shell: isWindows,
});

const processes = ['dist/main.js', 'dist/worker.js'].map((entry) =>
  spawn(process.execPath, [ENV_FILE, entry], { stdio: 'inherit' }),
);

function stopAll() {
  for (const child of processes) child.kill();
}

for (const child of processes) {
  child.on('exit', (code) => {
    stopAll();
    process.exit(code ?? 1);
  });
}
process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
