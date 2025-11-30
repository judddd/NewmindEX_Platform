/*
 * SPDX-License-Identifier: Apache-2.0
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import https from 'https';
import fs from 'fs';
import type {
  CmdbConfig,
  LoginResponse,
  QueryCondition,
  QueryViewPayload,
  CmdbApiResponse,
} from './types.js';

/**
 * CMDB API Client
 * Handles authentication and data queries to CMDB API
 */
export class CmdbClient {
  private config: CmdbConfig;
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: CmdbConfig) {
    this.config = config;

    // Create axios instance configuration
    const axiosConfig: any = {
      baseURL: config.domain.replace(/\/$/, ''),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Accept: 'application/json',
      },
    };

    // Add HTTPS agent only for HTTPS connections
    if (config.domain.startsWith('https')) {
      let verifySsl = config.verifySsl;

      // Add custom CA certificate if provided
      const agentOptions: https.AgentOptions = {};
      
      if (config.caCertPath) {
        try {
          const caCert = fs.readFileSync(config.caCertPath, 'utf8');
          agentOptions.ca = caCert;
          agentOptions.rejectUnauthorized = true; // Enable verification when using custom CA
          verifySsl = true;
          process.stderr.write(`[CMDB] ✓ Loaded custom CA certificate from: ${config.caCertPath}\n`);
          process.stderr.write(`[CMDB] SSL verification: ENABLED (custom CA)\n`);
        } catch (error) {
          process.stderr.write(`[CMDB] ✗ Warning: Failed to load CA certificate from ${config.caCertPath}: ${error}\n`);
          agentOptions.rejectUnauthorized = config.verifySsl;
        }
      } else {
        agentOptions.rejectUnauthorized = verifySsl;
        if (!verifySsl) {
          process.stderr.write(`[CMDB] ⚠ SSL verification: DISABLED (not recommended for production)\n`);
        } else {
          process.stderr.write(`[CMDB] SSL verification: ENABLED\n`);
        }
      }

      axiosConfig.httpsAgent = new https.Agent(agentOptions);
    }

    this.axiosInstance = axios.create(axiosConfig);
  }

  /**
   * Login and get authentication token
   * Based on get_token function from query_example.py
   */
  async login(): Promise<string> {
    try {
      const response = await this.axiosInstance.post<LoginResponse>(
        '/api/v2/auth/login',
        {
          appId: this.config.appId,
          appSecret: this.config.appSecret,
        }
      );

      const data = response.data;
      const token =
        data.Authorization || data.token || data.access_token;

      if (!token) {
        throw new Error(`Login successful but no token returned. Response: ${JSON.stringify(data)}`);
      }

      // Cache token for 1 hour
      this.token = token;
      this.tokenExpiry = Date.now() + 3600000;

      return token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new Error(
          `Login failed: ${axiosError.message}${
            axiosError.response?.data
              ? ` - ${JSON.stringify(axiosError.response.data)}`
              : ''
          }`
        );
      }
      throw error;
    }
  }

  /**
   * Get cached token or login to get new one
   */
  private async getToken(): Promise<string> {
    // Return cached token if still valid
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    // Otherwise login to get new token
    return await this.login();
  }

  /**
   * Query view data with optional conditions
   * Based on query_view function from query_example.py
   */
  async queryView<T = any>(
    viewid: string,
    pageSize: number = 50,
    startPage: number = 1,
    conditions: QueryCondition[] = []
  ): Promise<CmdbApiResponse<T>> {
    try {
      const token = await this.getToken();

      const payload: QueryViewPayload = {
        pageSize,
        startPage,
        viewid,
        queryCondition: conditions,
      };

      const response = await this.axiosInstance.post<CmdbApiResponse<T>>(
        '/api/v2/data/view',
        payload,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new Error(
          `Query failed: ${axiosError.message}${
            axiosError.response?.data
              ? ` - ${JSON.stringify(axiosError.response.data)}`
              : ''
          }`
        );
      }
      throw error;
    }
  }

  /**
   * Test connection by attempting to login
   */
  async testConnection(): Promise<{ success: boolean; message: string; tokenPreview?: string }> {
    try {
      const token = await this.login();
      return {
        success: true,
        message: 'Successfully connected to CMDB API',
        tokenPreview: token.substring(0, 8) + '...',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Extract specific fields from records
   * Supports dot notation for nested fields (e.g., "manager_show_value")
   */
  extractFields<T = any>(
    records: any[],
    fields: string[]
  ): Record<string, any>[] {
    return records.map((record) => {
      const extracted: Record<string, any> = {};
      for (const field of fields) {
        extracted[field] = this.getNestedValue(record, field);
      }
      return extracted;
    });
  }

  /**
   * Get nested value from object using dot notation
   * Based on pick function from query_example.py
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return null;
      }
      if (typeof current !== 'object') {
        return null;
      }
      if (!(part in current)) {
        return null;
      }
      current = current[part];
    }

    return current;
  }
}

