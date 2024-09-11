// IMPORTANT DO NOT ADD DevContainer IMPORTS HERE!
// Nothing should be exposed here which eventually hits vite's __federation__ module

export { Plugin } from './plugins/types.js';
export { LoggerExtensionPoint, LogMessage } from './plugins/impl/logger';
