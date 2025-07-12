/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 */

import 'zone.js';  // Included with Angular CLI.

// Polyfills for Node.js modules used by sql.js
(window as any).global = globalThis;

// Mock Node.js modules that sql.js tries to require
(window as any).require = (module: string) => {
  switch (module) {
    case 'fs':
      return {
        readFileSync: () => { throw new Error('fs.readFileSync not available in browser'); },
        existsSync: () => false,
        createReadStream: () => { throw new Error('fs.createReadStream not available in browser'); }
      };
    case 'path':
      return {
        join: (...paths: string[]) => paths.join('/'),
        resolve: (...paths: string[]) => paths.join('/'),
        dirname: (path: string) => path.split('/').slice(0, -1).join('/'),
        basename: (path: string) => path.split('/').pop() || ''
      };
    case 'crypto':
      return {
        randomBytes: (size: number) => {
          const array = new Uint8Array(size);
          crypto.getRandomValues(array);
          return array;
        }
      };
    default:
      throw new Error(`Module ${module} not found`);
  }
};

// Ensure process is defined for sql.js
(window as any).process = {
  env: {},
  platform: 'browser',
  version: '',
  versions: { node: '18.0.0' }
};
