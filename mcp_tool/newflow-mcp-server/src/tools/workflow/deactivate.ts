/**
 * Deactivate Workflow Tool
 * 
 * This tool deactivates an existing workflow in n8n.
 */

import { BaseWorkflowToolHandler } from './base-handler.js';
import { ToolCallResult, ToolDefinition } from '../../types/index.js';
import { NewflowApiError } from '../../errors/index.js';

/**
 * Handler for the deactivate_workflow tool
 */
export class DeactivateWorkflowHandler extends BaseWorkflowToolHandler {
  /**
   * Execute the tool
   * 
   * @param args Tool arguments containing workflowId
   * @returns Deactivation confirmation
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async (args) => {
      const { workflowId } = args;
      
      if (!workflowId) {
        throw new NewflowApiError('Missing required parameter: workflowId');
      }
      
      // Deactivate the workflow
      const workflow = await this.apiService.deactivateWorkflow(workflowId);
      
      return this.formatSuccess(
        {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active
        },
        `Workflow "${workflow.name}" (ID: ${workflowId}) has been successfully deactivated`
      );
    }, args);
  }
}

/**
 * Get tool definition for the deactivate_workflow tool
 * 
 * @returns Tool definition
 */
export function getDeactivateWorkflowToolDefinition(): ToolDefinition {
  return {
    name: 'deactivate_workflow',
    description: 'Deactivate a workflow in Newmind Flow',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'ID of the workflow to deactivate',
        },
      },
      required: ['workflowId'],
    },
  };
}
