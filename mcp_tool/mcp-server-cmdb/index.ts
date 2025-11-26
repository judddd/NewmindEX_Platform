#!/usr/bin/env node

/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { randomUUID } from 'crypto';
import { CmdbClient } from './src/cmdb-client.js';
import type { CmdbConfig, QueryCondition } from './src/types.js';

// Configuration schema with validation
const ConfigSchema = z.object({
  domain: z
    .string()
    .trim()
    .min(1, 'CMDB domain cannot be empty')
    .url('Invalid CMDB domain URL format')
    .describe('CMDB API domain URL'),

  appId: z
    .string()
    .trim()
    .min(1, 'App ID cannot be empty')
    .describe('CMDB application ID'),

  appSecret: z
    .string()
    .trim()
    .min(1, 'App secret cannot be empty')
    .describe('CMDB application secret'),

  verifySsl: z
    .boolean()
    .default(true)
    .describe('Whether to verify SSL certificates'),
});

type ValidatedConfig = z.infer<typeof ConfigSchema>;

/**
 * Create and configure the CMDB MCP Server
 */
export async function createCmdbMcpServer(config: ValidatedConfig) {
  const validatedConfig = ConfigSchema.parse(config);

  const cmdbClient = new CmdbClient(validatedConfig);

  const server = new McpServer({
    name: 'cmdb-mcp-server',
    version: '0.1.0',
  });

  // Tool 1: Test CMDB connection
  server.tool(
    'cmdb_login',
    'Test connection to CMDB API and verify credentials',
    {},
    async () => {
      try {
        const result = await cmdbClient.testConnection();

        if (result.success) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `✓ ${result.message}`,
              },
              {
                type: 'text' as const,
                text: `Token (partial): ${result.tokenPreview}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text' as const,
                text: `✗ Connection failed: ${result.message}`,
              },
            ],
          };
        }
      } catch (error) {
        console.error(
          `Connection test failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool 2: Query view without conditions
  server.tool(
    'cmdb_query_view',
    'Query a CMDB view and retrieve asset data',
    {
      viewid: z
        .string()
        .trim()
        .min(1, 'View ID is required')
        .describe('The CMDB view ID to query'),

      pageSize: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .default(50)
        .describe('Number of records per page (default: 50)'),

      startPage: z
        .number()
        .int()
        .min(1)
        .default(1)
        .describe('Starting page number (default: 1)'),
    },
    async ({ viewid, pageSize = 50, startPage = 1 }) => {
      try {
        const result = await cmdbClient.queryView(
          viewid,
          pageSize,
          startPage,
          []
        );

        if (!result.success) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Query failed: ${result.message || 'Unknown error'}`,
              },
            ],
          };
        }

        const summary = {
          total: result.total,
          pages: result.pages,
          currentPage: result.pageNum,
          pageSize: result.pageSize,
          recordsInPage: result.content.length,
          startRow: result.startRow,
          endRow: result.endRow,
        };

        return {
          content: [
            {
              type: 'text' as const,
              text: `Query Summary:\n${JSON.stringify(summary, null, 2)}`,
            },
            {
              type: 'text' as const,
              text: `Records:\n${JSON.stringify(result.content, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        console.error(
          `Query failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool 3: Query view with conditions
  server.tool(
    'cmdb_query_with_conditions',
    'Query a CMDB view with filtering conditions',
    {
      viewid: z
        .string()
        .trim()
        .min(1, 'View ID is required')
        .describe('The CMDB view ID to query'),

      conditions: z
        .array(
          z.object({
            key: z.string().describe('Field name to filter on'),
            operation: z
              .string()
              .describe('Operation (eq, like, gt, lt, gte, lte, ne, in, etc.)'),
            value: z.string().describe('Value to compare against'),
          })
        )
        .min(1, 'At least one condition is required')
        .describe('Array of query conditions'),

      pageSize: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .default(50)
        .describe('Number of records per page (default: 50)'),

      startPage: z
        .number()
        .int()
        .min(1)
        .default(1)
        .describe('Starting page number (default: 1)'),
    },
    async ({ viewid, conditions, pageSize = 50, startPage = 1 }) => {
      try {
        const result = await cmdbClient.queryView(
          viewid,
          pageSize,
          startPage,
          conditions as QueryCondition[]
        );

        if (!result.success) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Query failed: ${result.message || 'Unknown error'}`,
              },
            ],
          };
        }

        const summary = {
          total: result.total,
          pages: result.pages,
          currentPage: result.pageNum,
          pageSize: result.pageSize,
          recordsInPage: result.content.length,
          startRow: result.startRow,
          endRow: result.endRow,
          conditions: conditions,
        };

        return {
          content: [
            {
              type: 'text' as const,
              text: `Query Summary:\n${JSON.stringify(summary, null, 2)}`,
            },
            {
              type: 'text' as const,
              text: `Filtered Records:\n${JSON.stringify(result.content, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        console.error(
          `Conditional query failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool 4: Extract specific fields from query results
  server.tool(
    'cmdb_extract_fields',
    'Query CMDB view and extract only specific fields from results',
    {
      viewid: z
        .string()
        .trim()
        .min(1, 'View ID is required')
        .describe('The CMDB view ID to query'),

      fields: z
        .array(z.string())
        .min(1, 'At least one field is required')
        .describe(
          'Array of field names to extract (supports dot notation, e.g., "manager_show_value")'
        ),

      conditions: z
        .array(
          z.object({
            key: z.string().describe('Field name to filter on'),
            operation: z
              .string()
              .describe('Operation (eq, like, gt, lt, gte, lte, ne, in, etc.)'),
            value: z.string().describe('Value to compare against'),
          })
        )
        .optional()
        .default([])
        .describe('Optional array of query conditions'),

      pageSize: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .default(50)
        .describe('Number of records per page (default: 50)'),

      startPage: z
        .number()
        .int()
        .min(1)
        .default(1)
        .describe('Starting page number (default: 1)'),
    },
    async ({ viewid, fields, conditions = [], pageSize = 50, startPage = 1 }) => {
      try {
        const result = await cmdbClient.queryView(
          viewid,
          pageSize,
          startPage,
          conditions as QueryCondition[]
        );

        if (!result.success) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Query failed: ${result.message || 'Unknown error'}`,
              },
            ],
          };
        }

        // Extract only requested fields
        const extractedRecords = cmdbClient.extractFields(
          result.content,
          fields
        );

        const summary = {
          total: result.total,
          pages: result.pages,
          currentPage: result.pageNum,
          pageSize: result.pageSize,
          recordsInPage: extractedRecords.length,
          extractedFields: fields,
          conditions: conditions.length > 0 ? conditions : undefined,
        };

        return {
          content: [
            {
              type: 'text' as const,
              text: `Extraction Summary:\n${JSON.stringify(summary, null, 2)}`,
            },
            {
              type: 'text' as const,
              text: `Extracted Data:\n${JSON.stringify(extractedRecords, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        console.error(
          `Field extraction failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  return server;
}

// Read configuration from environment variables
const config: CmdbConfig = {
  domain: process.env.CMDB_DOMAIN || '',
  appId: process.env.CMDB_APP_ID || '',
  appSecret: process.env.CMDB_APP_SECRET || '',
  verifySsl: process.env.CMDB_VERIFY_SSL !== '0' && process.env.CMDB_VERIFY_SSL !== 'false',
};

async function main() {
  try {
    // Check if HTTP transport mode is enabled
    const useHttp = process.env.MCP_TRANSPORT === 'http';
    const httpPort = parseInt(process.env.MCP_HTTP_PORT || '3000');
    const httpHost = process.env.MCP_HTTP_HOST || 'localhost';

    if (useHttp) {
      // HTTP Streamable Mode - Use Streamable HTTP Transport
      process.stderr.write(
        `Starting CMDB MCP Server in HTTP Streamable mode on ${httpHost}:${httpPort}\n`
      );

      const app = express();
      app.use(express.json());

      // Store active transports by session ID
      const transports = new Map<string, StreamableHTTPServerTransport>();

      // Health check endpoint
      app.get('/health', (req, res) => {
        res.json({
          status: 'ok',
          transport: 'streamable-http',
          cmdb_domain: config.domain,
        });
      });

      // MCP endpoint - POST for JSON-RPC requests
      app.post('/mcp', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;

        try {
          let transport: StreamableHTTPServerTransport;

          // Check if we have an existing session
          if (sessionId && transports.has(sessionId)) {
            transport = transports.get(sessionId)!;
          } else {
            // Create new transport for new session
            transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => randomUUID(),
              onsessioninitialized: async (newSessionId: string) => {
                transports.set(newSessionId, transport);
                process.stderr.write(
                  `New MCP session initialized: ${newSessionId}\n`
                );
              },
              onsessionclosed: async (closedSessionId: string) => {
                transports.delete(closedSessionId);
                process.stderr.write(
                  `MCP session closed: ${closedSessionId}\n`
                );
              },
            });

            // Create server for this transport
            const server = await createCmdbMcpServer(config);
            await server.connect(transport);
          }

          // Handle the request
          await transport.handleRequest(req, res, req.body);
        } catch (error) {
          process.stderr.write(`Error handling MCP request: ${error}\n`);
          if (!res.headersSent) {
            res.status(500).json({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Internal server error',
              },
              id: null,
            });
          }
        }
      });

      // MCP endpoint - GET for SSE streams
      app.get('/mcp', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;

        if (!sessionId || !transports.has(sessionId)) {
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Invalid or missing session ID',
            },
            id: null,
          });
          return;
        }

        try {
          const transport = transports.get(sessionId)!;
          await transport.handleRequest(req, res);
        } catch (error) {
          process.stderr.write(`Error handling SSE stream: ${error}\n`);
          if (!res.headersSent) {
            res.status(500).json({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Failed to establish SSE stream',
              },
              id: null,
            });
          }
        }
      });

      // Start HTTP server
      app.listen(httpPort, httpHost, () => {
        console.log(`\n✓ CMDB MCP Server (HTTP Streamable Mode) is running`);
        console.log(`  Endpoint: http://${httpHost}:${httpPort}/mcp`);
        console.log(`  Health: http://${httpHost}:${httpPort}/health`);
        console.log(`  Transport: Streamable HTTP`);
        console.log(`  CMDB Domain: ${config.domain}\n`);
      });

      // Handle process termination
      process.on('SIGINT', async () => {
        console.log('\nShutting down server...');
        for (const [sessionId, transport] of transports.entries()) {
          await transport.close();
        }
        process.exit(0);
      });
    } else {
      // Stdio Mode (Default) - Use Stdio Transport
      process.stderr.write(`Starting CMDB MCP Server in Stdio mode\n`);

      const transport = new StdioServerTransport();
      const server = await createCmdbMcpServer(config);

      await server.connect(transport);

      // Handle process termination
      process.on('SIGINT', async () => {
        await server.close();
        process.exit(0);
      });
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(
    'Server error:',
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
});

