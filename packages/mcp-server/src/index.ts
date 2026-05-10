export * from './server';
export * from './tools';
export * from './hooks';
export * from './resources';

import { fileURLToPath } from 'url';

const currentFile = fileURLToPath(import.meta.url);
if (currentFile === process.argv[1]) {
  import('./server').then(({ startServer }) => {
    startServer().catch(console.error);
  });
}