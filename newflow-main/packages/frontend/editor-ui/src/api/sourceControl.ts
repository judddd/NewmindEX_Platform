/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// NewFlow: Source Control feature removed - stub API for compatibility
import type {
	PullWorkFolderRequestDto,
	PushWorkFolderRequestDto,
	SourceControlledFile,
} from '@newflow/api-types';
import type { IRestApiContext } from '@newflow/rest-api-client';
import type {
	SourceControlPreferences,
	SourceControlStatus,
	SshKeyTypes,
} from '@/types/sourceControl.types';
import type { IWorkflowDb } from '@/Interface';
import type { TupleToUnion } from '@/utils/typeHelpers';

export const pushWorkfolder = async (
	_context: IRestApiContext,
	_data: PushWorkFolderRequestDto,
): Promise<void> => {
	throw new Error('Source Control feature has been removed');
};

export const pullWorkfolder = async (
	_context: IRestApiContext,
	_data: PullWorkFolderRequestDto,
): Promise<SourceControlledFile[]> => {
	throw new Error('Source Control feature has been removed');
};

export const getBranches = async (
	_context: IRestApiContext,
): Promise<{ branches: string[]; currentBranch: string }> => {
	return { branches: [], currentBranch: '' };
};

export const savePreferences = async (
	_context: IRestApiContext,
	_preferences: Partial<SourceControlPreferences>,
): Promise<SourceControlPreferences> => {
	throw new Error('Source Control feature has been removed');
};

export const updatePreferences = async (
	_context: IRestApiContext,
	_preferences: Partial<SourceControlPreferences>,
): Promise<SourceControlPreferences> => {
	throw new Error('Source Control feature has been removed');
};

export const getPreferences = async (
	_context: IRestApiContext,
): Promise<SourceControlPreferences> => {
	return {
		branchName: '',
		branches: [],
		repositoryUrl: '',
		branchReadOnly: false,
		branchColor: '#5296D6',
		connected: false,
		publicKey: '',
		keyGeneratorType: 'ed25519',
	};
};

export const getStatus = async (_context: IRestApiContext): Promise<SourceControlStatus> => {
	return {
		ahead: 0,
		behind: 0,
		conflicted: [],
		created: [],
		deleted: [],
		modified: [],
		renamed: [],
		current: '',
		tracking: '',
	};
};

export const getRemoteWorkflow = async (
	_context: IRestApiContext,
	_workflowId: string,
): Promise<{ content: IWorkflowDb; type: 'workflow' }> => {
	throw new Error('Source Control feature has been removed');
};

export const getAggregatedStatus = async (
	_context: IRestApiContext,
	_options: {
		direction: 'push' | 'pull';
		preferLocalVersion: boolean;
		verbose: boolean;
	} = { direction: 'push', preferLocalVersion: true, verbose: false },
): Promise<SourceControlledFile[]> => {
	return [];
};

export const disconnect = async (
	_context: IRestApiContext,
	_keepKeyPair: boolean,
): Promise<string> => {
	throw new Error('Source Control feature has been removed');
};

export const generateKeyPair = async (
	_context: IRestApiContext,
	_keyGeneratorType?: TupleToUnion<SshKeyTypes>,
): Promise<string> => {
	throw new Error('Source Control feature has been removed');
};
