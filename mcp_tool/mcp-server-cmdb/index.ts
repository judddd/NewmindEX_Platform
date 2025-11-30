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

/**
 * Estimate token count for a given text
 * Simple estimation: ~4 characters per token for English/Chinese mix
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if response content exceeds token limit
 * @param content - The content to check
 * @param limit - Token limit (default: 2000)
 * @returns Object with exceeded flag and estimated tokens
 */
function checkTokenLimit(content: any, limit: number = 2000): {
  exceeded: boolean;
  estimatedTokens: number;
  suggestedPageSize: number | null;
} {
  const jsonString = JSON.stringify(content);
  const estimatedTokens = estimateTokens(jsonString);
  
  let suggestedPageSize = null;
  if (estimatedTokens > limit && Array.isArray(content)) {
    // Calculate suggested page size based on current ratio
    const currentSize = content.length;
    suggestedPageSize = Math.max(1, Math.floor((currentSize * limit) / estimatedTokens));
  }
  
  return {
    exceeded: estimatedTokens > limit,
    estimatedTokens,
    suggestedPageSize,
  };
}

/**
 * Create a token limit exceeded error response
 */
function createTokenLimitError(
  estimatedTokens: number,
  limit: number,
  currentPageSize: number,
  suggestedPageSize: number | null
): any {
  const messages = [
    `⚠️ Response too large: estimated ${estimatedTokens} tokens (limit: ${limit} tokens)`,
    `Current pageSize: ${currentPageSize}`,
  ];
  
  if (suggestedPageSize) {
    messages.push(
      `Suggested action: Reduce pageSize to ${suggestedPageSize} or smaller`,
      `Or use cmdb_extract_fields to fetch only specific fields`
    );
  } else {
    messages.push(
      `Suggested action: Use cmdb_extract_fields to fetch only specific fields`,
      `Or add more specific filter conditions`
    );
  }
  
  return {
    content: [
      {
        type: 'text' as const,
        text: messages.join('\n'),
      },
    ],
    isError: true,
  };
}

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
    .default(false)
    .describe('Whether to verify SSL certificates (default: false for ease of use)'),

  caCertPath: z
    .string()
    .optional()
    .describe('Optional path to custom CA certificate file (PEM format). If provided, SSL verification will be enabled.'),
});

type ValidatedConfig = z.infer<typeof ConfigSchema>;

/**
 * Create and configure the CMDB MCP Server
 * @param config - Validated CMDB configuration
 * @param sharedClient - Optional shared CmdbClient instance (for HTTP mode)
 */
export async function createCmdbMcpServer(
  config: ValidatedConfig,
  sharedClient?: CmdbClient
) {
  const validatedConfig = ConfigSchema.parse(config);

  // Use shared client if provided, otherwise create new one
  const cmdbClient = sharedClient || new CmdbClient(validatedConfig);

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
    'Query a CMDB view and retrieve asset data. IMPORTANT for AI: Start with pageSize=10 to avoid overwhelming responses. Only increase or fetch more pages if the user explicitly needs more data.',
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
        .default(10)
        .describe('Number of records per page. RECOMMENDED: Start with 10 for initial queries. Only increase (20, 50, 100) if user explicitly needs more data. Default: 10'),

      startPage: z
        .number()
        .int()
        .min(1)
        .default(1)
        .describe('Starting page number for pagination. Use to fetch additional pages only when necessary. Default: 1'),
    },
    async ({ viewid, pageSize = 10, startPage = 1 }) => {
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

        // Check token limit before returning
        const tokenCheck = checkTokenLimit(result.content, 2000);
        if (tokenCheck.exceeded) {
          return createTokenLimitError(
            tokenCheck.estimatedTokens,
            2000,
            pageSize,
            tokenCheck.suggestedPageSize
          );
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
    'Query a CMDB view with filtering conditions. IMPORTANT for AI: Start with pageSize=10. Only increase if user explicitly requests more results. Avoid multiple calls unless necessary.',
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
        .default(10)
        .describe('Number of records per page. RECOMMENDED: Start with 10. Increase progressively (20→50→100) only if needed. Default: 10'),

      startPage: z
        .number()
        .int()
        .min(1)
        .default(1)
        .describe('Starting page number. Use pagination (startPage=2,3...) only when user explicitly needs more results. Default: 1'),
    },
    async ({ viewid, conditions, pageSize = 10, startPage = 1 }) => {
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

        // Check token limit before returning
        const tokenCheck = checkTokenLimit(result.content, 2000);
        if (tokenCheck.exceeded) {
          return createTokenLimitError(
            tokenCheck.estimatedTokens,
            2000,
            pageSize,
            tokenCheck.suggestedPageSize
          );
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
    'Query CMDB view and extract only specific fields from results. IMPORTANT for AI: Use this for focused queries. Start with pageSize=10. This tool returns minimal data - perfect for AI analysis.',
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
          'Array of field names to extract (supports dot notation, e.g., "manager_show_value"). Extract only necessary fields to reduce response size.'
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
        .default(10)
        .describe('Number of records per page. RECOMMENDED: Start with 10. This tool already extracts specific fields, so less data is returned. Default: 10'),

      startPage: z
        .number()
        .int()
        .min(1)
        .default(1)
        .describe('Starting page number. Paginate only when user needs comprehensive data across multiple pages. Default: 1'),
    },
    async ({ viewid, fields, conditions = [], pageSize = 10, startPage = 1 }) => {
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

        // Check token limit before returning
        const tokenCheck = checkTokenLimit(extractedRecords, 2000);
        if (tokenCheck.exceeded) {
          return createTokenLimitError(
            tokenCheck.estimatedTokens,
            2000,
            pageSize,
            tokenCheck.suggestedPageSize
          );
        }

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
  // Default to false (no SSL verification) unless explicitly set to '1' or 'true'
  verifySsl: process.env.CMDB_VERIFY_SSL === '1' || process.env.CMDB_VERIFY_SSL === 'true',
  caCertPath: process.env.CMDB_CA_CERT_PATH,
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

      // Create a shared CmdbClient instance for all sessions in HTTP mode
      // This ensures token is shared across all sessions and reduces login overhead
      process.stderr.write('[MCP] Creating shared CMDB client for HTTP mode...\n');
      const sharedCmdbClient = new CmdbClient(config);
      process.stderr.write('[MCP] ✓ Shared CMDB client created\n');

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
            console.log(`[MCP] Reusing existing session: ${sessionId}`);
          } else {
            // Create new transport for new session
            console.log('[MCP] Creating new session...');
            transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => randomUUID(),
              onsessioninitialized: async (newSessionId: string) => {
                transports.set(newSessionId, transport);
                console.log(`[MCP] ✓ New session initialized: ${newSessionId}`);
                console.log(`[MCP] Active sessions: ${transports.size}`);
              },
              onsessionclosed: async (closedSessionId: string) => {
                transports.delete(closedSessionId);
                console.log(`[MCP] Session closed: ${closedSessionId}`);
                console.log(`[MCP] Active sessions: ${transports.size}`);
              },
            });

            // Create server for this transport with shared client
            const server = await createCmdbMcpServer(config, sharedCmdbClient);
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
        console.log('\n[MCP] Shutting down HTTP server...');
        console.log(`[MCP] Closing ${transports.size} active session(s)...`);
        for (const [sessionId, transport] of transports.entries()) {
          console.log(`[MCP] Closing session: ${sessionId}`);
          await transport.close();
        }
        console.log('[MCP] ✓ All sessions closed');
        process.exit(0);
      });
    } else {
      // Stdio Mode (Default) - Use Stdio Transport
      process.stderr.write(`Starting CMDB MCP Server in Stdio mode\n`);
      process.stderr.write(`[MCP] Transport: Stdio\n`);
      process.stderr.write(`[MCP] CMDB Domain: ${config.domain}\n`);

      const transport = new StdioServerTransport();
      const server = await createCmdbMcpServer(config);

      await server.connect(transport);
      process.stderr.write('[MCP] ✓ Server connected and ready\n');

      // Handle process termination
      process.on('SIGINT', async () => {
        process.stderr.write('\n[MCP] Shutting down server...\n');
        await server.close();
        process.stderr.write('[MCP] ✓ Server closed\n');
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

