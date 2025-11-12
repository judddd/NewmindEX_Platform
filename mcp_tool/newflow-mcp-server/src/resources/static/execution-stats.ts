/**
 * Static Execution Statistics Resource Handler
 * 
 * This module provides the MCP resource implementation for execution statistics.
 */

import { NewflowApiService } from '../../api/n8n-client.js';
import { formatExecutionStats, formatResourceUri } from '../../utils/resource-formatter.js';
import { McpError, ErrorCode } from '../../errors/index.js';

/**
 * Get execution statistics resource data
 * 
 * @param apiService Newmind Flow API service
 * @returns Formatted execution statistics resource data
 */
export async function getExecutionStatsResource(apiService: NewflowApiService): Promise<string> {
  try {
    // Get executions from the API
    const executions = await apiService.getExecutions();
    
    // Format the execution statistics
    const stats = formatExecutionStats(executions);
    
    // Add metadata about the resource
    const result = {
      resourceType: 'execution-stats',
      ...stats,
      _links: {
        self: formatResourceUri('execution-stats'),
      }
    };
    
    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error('Error fetching execution statistics resource:', error);
    throw new McpError(
      ErrorCode.InternalError, 
      `Failed to retrieve execution statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get execution statistics resource URI
 * 
 * @returns Formatted resource URI
 */
export function getExecutionStatsResourceUri(): string {
  return formatResourceUri('execution-stats');
}

/**
 * Get execution statistics resource metadata
 * 
 * @returns Resource metadata object
 */
export function getExecutionStatsResourceMetadata(): Record<string, any> {
  return {
    uri: getExecutionStatsResourceUri(),
    name: 'Newmind Flow Execution Statistics',
    mimeType: 'application/json',
    description: 'Summary statistics of workflow executions including success rates, average duration, and trends from Newmind Flow',
  };
}
