import { spawn } from 'node:child_process';

export async function startAstroDev() {
  const dev = spawn('npx', ['astro', 'dev'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const cleanup = () => {
    if (!dev.killed) dev.kill('SIGTERM');
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(130); });

  const url = await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Dev server did not start within 30s')),
      30_000,
    );
    const onData = (buf) => {
      const match = buf.toString().match(/http:\/\/localhost:\d+\/?/);
      if (match) {
        clearTimeout(timeout);
        dev.stdout.off('data', onData);
        resolve(match[0]);
      }
    };
    dev.stdout.on('data', onData);
    dev.on('exit', (code) => reject(new Error(`Dev server exited with code ${code}`)));
  });

  return { url, cleanup };
}
