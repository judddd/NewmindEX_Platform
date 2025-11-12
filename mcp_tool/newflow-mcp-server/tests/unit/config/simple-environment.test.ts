/**
 * Simple environment configuration tests
 */

import { describe, it, expect } from '@jest/globals';

// Simple environment validation function to test
function validateEnvironment(env: Record<string, string | undefined>): { 
  newmindflowApiUrl: string;
  newmindflowApiKey: string;
  debug: boolean;
} {
  // Check required variables
  if (!env.NEWFLOW_API_URL) {
    throw new Error('Missing required environment variable: NEWFLOW_API_URL');
  }
  
  if (!env.NEWFLOW_API_KEY) {
    throw new Error('Missing required environment variable: NEWFLOW_API_KEY');
  }
  
  // Validate URL format
  try {
    new URL(env.NEWFLOW_API_URL);
  } catch (error) {
    throw new Error(`Invalid URL format for NEWFLOW_API_URL: ${env.NEWFLOW_API_URL}`);
  }
  
  // Return parsed config
  return {
    newmindflowApiUrl: env.NEWFLOW_API_URL,
    newmindflowApiKey: env.NEWFLOW_API_KEY,
    debug: env.DEBUG?.toLowerCase() === 'true'
  };
}

describe('Environment Configuration', () => {
  describe('validateEnvironment', () => {
    it('should return a valid config when all required variables are present', () => {
      const env = {
        NEWFLOW_API_URL: 'https://newmindflow.example.com/api/v1',
        NEWFLOW_API_KEY: 'test-api-key'
      };
      
      const config = validateEnvironment(env);
      
      expect(config).toEqual({
        newmindflowApiUrl: 'https://newmindflow.example.com/api/v1',
        newmindflowApiKey: 'test-api-key',
        debug: false
      });
    });
    
    it('should set debug to true when DEBUG=true', () => {
      const env = {
        NEWFLOW_API_URL: 'https://newmindflow.example.com/api/v1',
        NEWFLOW_API_KEY: 'test-api-key',
        DEBUG: 'true'
      };
      
      const config = validateEnvironment(env);
      
      expect(config.debug).toBe(true);
    });
    
    it('should throw an error when NEWFLOW_API_URL is missing', () => {
      const env = {
        NEWFLOW_API_KEY: 'test-api-key'
      };
      
      expect(() => validateEnvironment(env)).toThrow(
        'Missing required environment variable: NEWFLOW_API_URL'
      );
    });
    
    it('should throw an error when NEWFLOW_API_KEY is missing', () => {
      const env = {
        NEWFLOW_API_URL: 'https://newmindflow.example.com/api/v1'
      };
      
      expect(() => validateEnvironment(env)).toThrow(
        'Missing required environment variable: NEWFLOW_API_KEY'
      );
    });
    
    it('should throw an error when NEWFLOW_API_URL is not a valid URL', () => {
      const env = {
        NEWFLOW_API_URL: 'invalid-url',
        NEWFLOW_API_KEY: 'test-api-key'
      };
      
      expect(() => validateEnvironment(env)).toThrow(
        'Invalid URL format for NEWFLOW_API_URL: invalid-url'
      );
    });
  });
});
