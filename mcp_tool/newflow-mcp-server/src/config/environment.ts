/**
 * Environment Configuration
 * 
 * This module handles loading and validating environment variables
 * required for connecting to the Newmind Flow API.
 */

import dotenv from 'dotenv';
import findConfig from 'find-config';
import path from 'path';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { ErrorCode } from '../errors/error-codes.js';

// Environment variable names
export const ENV_VARS = {
  NEWFLOW_API_URL: 'NEWFLOW_API_URL',
  NEWFLOW_API_KEY: 'NEWFLOW_API_KEY',
  NEWFLOW_WEBHOOK_USERNAME: 'NEWFLOW_WEBHOOK_USERNAME',
  NEWFLOW_WEBHOOK_PASSWORD: 'NEWFLOW_WEBHOOK_PASSWORD',
  DEBUG: 'DEBUG',
};

// Interface for validated environment variables
export interface EnvConfig {
  newflowApiUrl: string;
  newflowApiKey: string;
  newflowWebhookUsername?: string; // Made optional
  newflowWebhookPassword?: string; // Made optional
  debug: boolean;
}

/**
 * Load environment variables from .env file if present
 */
export function loadEnvironmentVariables(): void {
  const {
    NEWFLOW_API_URL,
    NEWFLOW_API_KEY,
    NEWFLOW_WEBHOOK_USERNAME,
    NEWFLOW_WEBHOOK_PASSWORD
  } = process.env;

  if (
    !NEWFLOW_API_URL &&
    !NEWFLOW_API_KEY &&
    !NEWFLOW_WEBHOOK_USERNAME &&
    !NEWFLOW_WEBHOOK_PASSWORD
  ) {
    const projectRoot = findConfig('package.json');
    if (projectRoot) {
      const envPath = path.resolve(path.dirname(projectRoot), '.env');
      dotenv.config({ path: envPath });
    }
  }
}

/**
 * Validate and retrieve required environment variables
 * 
 * @returns Validated environment configuration
 * @throws {McpError} If required environment variables are missing
 */
export function getEnvConfig(): EnvConfig {
  const newflowApiUrl = process.env[ENV_VARS.NEWFLOW_API_URL];
  const newflowApiKey = process.env[ENV_VARS.NEWFLOW_API_KEY];
  const newflowWebhookUsername = process.env[ENV_VARS.NEWFLOW_WEBHOOK_USERNAME];
  const newflowWebhookPassword = process.env[ENV_VARS.NEWFLOW_WEBHOOK_PASSWORD];
  const debug = process.env[ENV_VARS.DEBUG]?.toLowerCase() === 'true';

  // Validate required core environment variables
  if (!newflowApiUrl) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Missing required environment variable: ${ENV_VARS.NEWFLOW_API_URL}`
    );
  }

  if (!newflowApiKey) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Missing required environment variable: ${ENV_VARS.NEWFLOW_API_KEY}`
    );
  }

  // NEWFLOW_WEBHOOK_USERNAME and NEWFLOW_WEBHOOK_PASSWORD are now optional at startup.
  // Tools requiring them should perform checks at the point of use.

  // Validate URL format
  try {
    new URL(newflowApiUrl);
  } catch (error) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Invalid URL format for ${ENV_VARS.NEWFLOW_API_URL}: ${newflowApiUrl}`
    );
  }

  return {
    newflowApiUrl,
    newflowApiKey,
    newflowWebhookUsername: newflowWebhookUsername || undefined, // Ensure undefined if empty
    newflowWebhookPassword: newflowWebhookPassword || undefined, // Ensure undefined if empty
    debug,
  };
}
