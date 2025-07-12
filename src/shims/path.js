// Browser shim for Node.js 'path' module
export const join = (...paths) => paths.join('/');
export const resolve = (...paths) => paths.join('/');
export const dirname = (path) => path.split('/').slice(0, -1).join('/');
export const basename = (path) => path.split('/').pop() || '';
export default { join, resolve, dirname, basename };
