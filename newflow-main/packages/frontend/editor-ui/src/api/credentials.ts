/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type {
	ICredentialsDecryptedResponse,
	ICredentialsResponse,
	IShareCredentialsPayload,
} from '@/Interface';
import type { IRestApiContext } from '@newflow/rest-api-client';
import { makeRestApiRequest } from '@newflow/rest-api-client';
import type {
	ICredentialsDecrypted,
	ICredentialType,
	IDataObject,
	INodeCredentialTestRequest,
	INodeCredentialTestResult,
} from 'n8n-workflow';
import axios from 'axios';
import type { CreateCredentialDto } from '@newflow/api-types';

export async function getCredentialTypes(baseUrl: string): Promise<ICredentialType[]> {
	const { data } = await axios.get(baseUrl + 'types/credentials.json', { withCredentials: true });
	return data;
}

export async function getCredentialsNewName(
	context: IRestApiContext,
	name?: string,
): Promise<{ name: string }> {
	return await makeRestApiRequest(context, 'GET', '/credentials/new', name ? { name } : {});
}

export async function getAllCredentials(
	context: IRestApiContext,
	filter?: object,
	includeScopes?: boolean,
	onlySharedWithMe?: boolean,
): Promise<ICredentialsResponse[]> {
	return await makeRestApiRequest(context, 'GET', '/credentials', {
		...(includeScopes ? { includeScopes } : {}),
		includeData: true,
		...(filter ? { filter } : {}),
		...(onlySharedWithMe ? { onlySharedWithMe } : {}),
	});
}

export async function getAllCredentialsForWorkflow(
	context: IRestApiContext,
	options: { workflowId: string } | { projectId: string },
): Promise<ICredentialsResponse[]> {
	return await makeRestApiRequest(context, 'GET', '/credentials/for-workflow', {
		...options,
	});
}

export async function createNewCredential(
	context: IRestApiContext,
	payload: CreateCredentialDto,
): Promise<ICredentialsResponse> {
	return await makeRestApiRequest(context, 'POST', '/credentials', payload);
}

export async function deleteCredential(context: IRestApiContext, id: string): Promise<boolean> {
	return await makeRestApiRequest(context, 'DELETE', `/credentials/${id}`);
}

export async function updateCredential(
	context: IRestApiContext,
	id: string,
	data: ICredentialsDecrypted,
): Promise<ICredentialsResponse> {
	return await makeRestApiRequest(
		context,
		'PATCH',
		`/credentials/${id}`,
		data as unknown as IDataObject,
	);
}

export async function getCredentialData(
	context: IRestApiContext,
	id: string,
): Promise<ICredentialsDecryptedResponse | ICredentialsResponse | undefined> {
	return await makeRestApiRequest(context, 'GET', `/credentials/${id}`, {
		includeData: true,
	});
}

// Get OAuth1 Authorization URL using the stored credentials
export async function oAuth1CredentialAuthorize(
	context: IRestApiContext,
	data: ICredentialsResponse,
): Promise<string> {
	return await makeRestApiRequest(
		context,
		'GET',
		'/oauth1-credential/auth',
		data as unknown as IDataObject,
	);
}

// Get OAuth2 Authorization URL using the stored credentials
export async function oAuth2CredentialAuthorize(
	context: IRestApiContext,
	data: ICredentialsResponse,
): Promise<string> {
	return await makeRestApiRequest(
		context,
		'GET',
		'/oauth2-credential/auth',
		data as unknown as IDataObject,
	);
}

export async function testCredential(
	context: IRestApiContext,
	data: INodeCredentialTestRequest,
): Promise<INodeCredentialTestResult> {
	return await makeRestApiRequest(
		context,
		'POST',
		'/credentials/test',
		data as unknown as IDataObject,
	);
}

// =============================================================================
// Credential Sharing and Project Management
// =============================================================================

/**
 * Share a credential with specific projects or users.
 *
 * This function allows credential owners to grant access to their credentials
 * to other users or projects within the workspace. Sharing enables team
 * collaboration while maintaining security boundaries.
 *
 * The sharing operation will:
 * - Update the credential's access control list
 * - Notify affected users (if configured)
 * - Validate permissions before applying changes
 *
 * @param context - REST API context containing auth and base URL
 * @param id - The unique identifier of the credential to share
 * @param data - Sharing configuration specifying target users/projects and access levels
 * @returns Promise resolving to the updated credential with new sharing settings
 *
 * @example
 * // Share a credential with a specific project
 * const result = await setCredentialSharedWith(context, 'cred-123', {
 *   shareWithIds: ['project-456'],
 *   shareWithProjects: true
 * });
 *
 * @throws {Error} If the user lacks permission to share this credential
 * @throws {Error} If any target project/user ID is invalid
 */
export async function setCredentialSharedWith(
	context: IRestApiContext,
	id: string,
	data: IShareCredentialsPayload,
): Promise<ICredentialsResponse> {
	return await makeRestApiRequest(
		context,
		'PUT',
		`/credentials/${id}/share`,
		data as unknown as IDataObject,
	);
}

/**
 * Move a credential from its current project to a different project.
 *
 * This operation performs a complete transfer of credential ownership,
 * including all associated metadata and configurations. The credential
 * will no longer be accessible in the source project after the transfer.
 *
 * Use cases:
 * - Reorganizing credentials during project restructuring
 * - Transferring resources between teams
 * - Consolidating credentials into a central project
 *
 * Important notes:
 * - Requires appropriate permissions in both source and destination projects
 * - Any workflows using this credential in the source project may break
 * - Consider using sharing instead of moving for cross-project access
 *
 * @param context - REST API context containing auth and base URL
 * @param id - The unique identifier of the credential to move
 * @param destinationProjectId - The ID of the target project
 * @returns Promise that resolves when the transfer is complete
 *
 * @example
 * // Move a credential to the production project
 * await moveCredentialToProject(
 *   context,
 *   'cred-dev-123',
 *   'project-production-456'
 * );
 *
 * @throws {Error} If the user lacks permission to move credentials
 * @throws {Error} If the destination project doesn't exist
 * @throws {Error} If the credential is currently in use by active workflows
 */
export async function moveCredentialToProject(
	context: IRestApiContext,
	id: string,
	destinationProjectId: string,
): Promise<void> {
	return await makeRestApiRequest(context, 'PUT', `/credentials/${id}/transfer`, {
		destinationProjectId,
	});
}
