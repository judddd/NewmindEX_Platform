/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type {
	ChangeLocationSearchResponseItem,
	FolderCreateResponse,
	FolderTreeResponseItem,
	IExecutionResponse,
	IExecutionsCurrentSummaryExtended,
	IShareWorkflowsPayload,
	IUsedCredential,
	IWorkflowDb,
	IWorkflowsShareResponse,
	NewWorkflowResponse,
	WorkflowListResource,
	WorkflowResource,
} from '@/Interface';
import type { IRestApiContext } from '@newflow/rest-api-client';
import type { TransferWorkflowBodyDto } from '@newflow/api-types';
import type {
	ExecutionFilters,
	ExecutionOptions,
	ExecutionSummary,
	IDataObject,
} from 'n8n-workflow';
import { getFullApiResponse, makeRestApiRequest } from '@newflow/rest-api-client';

export async function getNewWorkflow(context: IRestApiContext, data?: IDataObject) {
	const response = await makeRestApiRequest<NewWorkflowResponse>(
		context,
		'GET',
		'/workflows/new',
		data,
	);
	return {
		name: response.name,
		settings: response.defaultSettings,
	};
}

export async function getWorkflow(context: IRestApiContext, id: string) {
	return await makeRestApiRequest<IWorkflowDb>(context, 'GET', `/workflows/${id}`);
}

export async function getWorkflows(context: IRestApiContext, filter?: object, options?: object) {
	return await getFullApiResponse<IWorkflowDb[]>(context, 'GET', '/workflows', {
		includeScopes: true,
		...(filter ? { filter } : {}),
		...(options ? options : {}),
	});
}

export async function getWorkflowsWithNodesIncluded(context: IRestApiContext, nodeTypes: string[]) {
	return await getFullApiResponse<WorkflowResource[]>(
		context,
		'POST',
		'/workflows/with-node-types',
		{
			nodeTypes,
		},
	);
}

export async function getWorkflowsAndFolders(
	context: IRestApiContext,
	filter?: object,
	options?: object,
	includeFolders?: boolean,
	onlySharedWithMe?: boolean,
) {
	return await getFullApiResponse<WorkflowListResource[]>(context, 'GET', '/workflows', {
		includeScopes: true,
		includeFolders,
		onlySharedWithMe,
		...(filter ? { filter } : {}),
		...(options ? options : {}),
	});
}

export async function getActiveWorkflows(context: IRestApiContext) {
	return await makeRestApiRequest<string[]>(context, 'GET', '/active-workflows');
}

export async function getActiveExecutions(context: IRestApiContext, filter: IDataObject) {
	const output = await makeRestApiRequest<{
		results: ExecutionSummary[];
		count: number;
		estimated: boolean;
	}>(context, 'GET', '/executions', { filter });

	return output.results;
}

export async function getExecutions(
	context: IRestApiContext,
	filter?: ExecutionFilters,
	options?: ExecutionOptions,
): Promise<{ count: number; results: IExecutionsCurrentSummaryExtended[]; estimated: boolean }> {
	return await makeRestApiRequest(context, 'GET', '/executions', { filter, ...options });
}

export async function getExecutionData(context: IRestApiContext, executionId: string) {
	return await makeRestApiRequest<IExecutionResponse | null>(
		context,
		'GET',
		`/executions/${executionId}`,
	);
}

export async function createFolder(
	context: IRestApiContext,
	projectId: string,
	name: string,
	parentFolderId?: string,
): Promise<FolderCreateResponse> {
	return await makeRestApiRequest(context, 'POST', `/projects/${projectId}/folders`, {
		name,
		parentFolderId,
	});
}

export async function getFolderPath(
	context: IRestApiContext,
	projectId: string,
	folderId: string,
): Promise<FolderTreeResponseItem[]> {
	return await makeRestApiRequest(
		context,
		'GET',
		`/projects/${projectId}/folders/${folderId}/tree`,
	);
}

export async function deleteFolder(
	context: IRestApiContext,
	projectId: string,
	folderId: string,
	transferToFolderId?: string,
): Promise<void> {
	return await makeRestApiRequest(context, 'DELETE', `/projects/${projectId}/folders/${folderId}`, {
		transferToFolderId,
	});
}

export async function renameFolder(
	context: IRestApiContext,
	projectId: string,
	folderId: string,
	name: string,
): Promise<void> {
	return await makeRestApiRequest(context, 'PATCH', `/projects/${projectId}/folders/${folderId}`, {
		name,
	});
}

export async function getProjectFolders(
	context: IRestApiContext,
	projectId: string,
	options?: {
		skip?: number;
		take?: number;
		sortBy?: string;
	},
	filter?: {
		excludeFolderIdAndDescendants?: string;
		name?: string;
	},
	select?: string[],
): Promise<{ data: ChangeLocationSearchResponseItem[]; count: number }> {
	const res = await getFullApiResponse<ChangeLocationSearchResponseItem[]>(
		context,
		'GET',
		`/projects/${projectId}/folders`,
		{
			...(filter ? { filter } : {}),
			...(options ? options : {}),
			...(select ? { select: JSON.stringify(select) } : {}),
		},
	);
	return {
		data: res.data,
		count: res.count,
	};
}

export async function getFolderUsedCredentials(
	context: IRestApiContext,
	projectId: string,
	folderId: string,
): Promise<IUsedCredential[]> {
	const res = await getFullApiResponse<IUsedCredential[]>(
		context,
		'GET',
		`/projects/${projectId}/folders/${folderId}/credentials`,
	);
	return res.data;
}

export async function moveFolder(
	context: IRestApiContext,
	projectId: string,
	folderId: string,
	parentFolderId?: string,
): Promise<void> {
	return await makeRestApiRequest(context, 'PATCH', `/projects/${projectId}/folders/${folderId}`, {
		parentFolderId,
	});
}

export async function getFolderContent(
	context: IRestApiContext,
	projectId: string,
	folderId: string,
): Promise<{ totalSubFolders: number; totalWorkflows: number }> {
	const res = await getFullApiResponse<{ totalSubFolders: number; totalWorkflows: number }>(
		context,
		'GET',
		`/projects/${projectId}/folders/${folderId}/content`,
	);
	return res.data;
}

// =============================================================================
// Workflow Sharing and Project Management
// =============================================================================

/**
 * Share a workflow with specific projects or users within the workspace.
 *
 * This function enables workflow owners to grant access to their workflows
 * to other team members or projects. Sharing facilitates collaboration while
 * maintaining granular control over who can view, edit, or execute workflows.
 *
 * The sharing operation will:
 * - Update the workflow's access control list
 * - Apply role-based permissions (viewer, editor, owner)
 * - Notify affected users of the shared resource
 * - Validate user permissions before making changes
 *
 * @param context - REST API context containing authentication and base URL
 * @param id - The unique identifier of the workflow to share
 * @param data - Sharing configuration specifying target users/projects and their roles
 * @returns Promise resolving to sharing response with updated access information
 *
 * @example
 * // Share a workflow with editing rights to a project
 * const result = await setWorkflowSharedWith(context, 'workflow-123', {
 *   shareWithIds: ['project-456'],
 *   shareRole: 'editor'
 * });
 *
 * @throws {Error} If the user lacks permission to share this workflow
 * @throws {Error} If any target project/user ID is invalid
 * @throws {Error} If the sharing configuration violates workspace policies
 */
export async function setWorkflowSharedWith(
	context: IRestApiContext,
	id: string,
	data: IShareWorkflowsPayload,
): Promise<IWorkflowsShareResponse> {
	return await makeRestApiRequest(
		context,
		'PUT',
		`/workflows/${id}/share`,
		data as unknown as IDataObject,
	);
}

/**
 * Transfer a workflow from its current project to a different project.
 *
 * This operation performs a complete ownership transfer of the workflow,
 * including all execution history, tags, and associated metadata. The
 * workflow will no longer be accessible in the source project after transfer.
 *
 * Key considerations:
 * - All workflow versions are transferred together
 * - Execution history is preserved and moved with the workflow
 * - Active executions are not interrupted but will appear in the new project
 * - Credentials used by the workflow must be accessible in the destination project
 *
 * Use cases:
 * - Reorganizing workflows during team restructuring
 * - Moving production workflows to dedicated projects
 * - Consolidating workflows from multiple projects
 *
 * @param context - REST API context containing authentication and base URL
 * @param id - The unique identifier of the workflow to transfer
 * @param body - Transfer configuration including destination project and options
 * @returns Promise that resolves when the transfer is successfully completed
 *
 * @example
 * // Move a workflow to the production project
 * await moveWorkflowToProject(context, 'workflow-dev-123', {
 *   destinationProjectId: 'project-production-456'
 * });
 *
 * @throws {Error} If the user lacks transfer permissions
 * @throws {Error} If the destination project doesn't exist or is inaccessible
 * @throws {Error} If credentials are not available in the destination project
 */
export async function moveWorkflowToProject(
	context: IRestApiContext,
	id: string,
	body: TransferWorkflowBodyDto,
): Promise<void> {
	return await makeRestApiRequest(context, 'PUT', `/workflows/${id}/transfer`, body);
}

/**
 * Transfer an entire folder (including workflows and subfolders) to a different project.
 *
 * This operation performs a bulk transfer of all contents within a folder,
 * recursively moving all workflows, subfolders, and their contents to the
 * destination project. This is useful for large-scale project reorganizations.
 *
 * The transfer process:
 * - Moves all workflows within the folder
 * - Recursively moves all subfolders and their contents
 * - Optionally shares required credentials with the destination project
 * - Preserves folder structure and hierarchy
 * - Maintains workflow execution history
 *
 * Credential handling:
 * - You can specify which credentials to share with the destination project
 * - Workflows using unshared credentials may fail after transfer
 * - It's recommended to review credential dependencies before transfer
 *
 * @param context - REST API context containing authentication and base URL
 * @param projectId - The ID of the source project containing the folder
 * @param folderId - The unique identifier of the folder to transfer
 * @param destinationProjectId - The ID of the target project
 * @param destinationParentFolderId - Optional ID of the parent folder in destination (defaults to root)
 * @param shareCredentials - Optional array of credential IDs to share with destination project
 * @returns Promise that resolves when the transfer is complete
 *
 * @example
 * // Move an entire folder with credential sharing
 * await moveFolderToProject(
 *   context,
 *   'project-source-123',
 *   'folder-456',
 *   'project-destination-789',
 *   undefined, // root level
 *   ['cred-1', 'cred-2'] // share these credentials
 * );
 *
 * @throws {Error} If the user lacks permission to transfer folders
 * @throws {Error} If any project or folder ID is invalid
 * @throws {Error} If the destination folder structure would create cycles
 * @throws {Error} If credential sharing fails for specified credentials
 */
export async function moveFolderToProject(
	context: IRestApiContext,
	projectId: string,
	folderId: string,
	destinationProjectId: string,
	destinationParentFolderId?: string,
	shareCredentials?: string[],
): Promise<void> {
	return await makeRestApiRequest(
		context,
		'PUT',
		`/projects/${projectId}/folders/${folderId}/transfer`,
		{
			destinationProjectId,
			destinationParentFolderId: destinationParentFolderId ?? '0',
			shareCredentials,
		},
	);
}
