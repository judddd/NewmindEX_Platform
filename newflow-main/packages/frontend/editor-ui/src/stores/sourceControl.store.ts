/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// NewFlow: Source Control feature removed - stub store for compatibility
import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import type { SourceControlPreferences, SshKeyTypes } from '@/types/sourceControl.types';
import type { TupleToUnion } from '@/utils/typeHelpers';
import type { SourceControlledFile } from '@newflow/api-types';

export const useSourceControlStore = defineStore('sourceControl', () => {
	// NewFlow: Always false - Source Control feature removed
	const isEnterpriseSourceControlEnabled = computed(() => false);

	const sshKeyTypes: SshKeyTypes = ['ed25519', 'rsa'];
	const sshKeyTypesWithLabel = reactive(
		sshKeyTypes.map((value) => ({ value, label: value.toUpperCase() })),
	);

	const preferences = reactive<SourceControlPreferences>({
		branchName: '',
		branches: [],
		repositoryUrl: '',
		branchReadOnly: false,
		branchColor: '#5296D6',
		connected: false,
		publicKey: '',
		keyGeneratorType: 'ed25519',
	});

	const state = reactive<{
		commitMessage: string;
	}>({
		commitMessage: 'commit message',
	});

	// NewFlow: All Source Control functionality removed - stub implementations
	const pushWorkfolder = async (_data: {
		commitMessage: string;
		fileNames: SourceControlledFile[];
		force: boolean;
	}) => {
		throw new Error('Source Control feature has been removed');
	};

	const pullWorkfolder = async (_force: boolean) => {
		throw new Error('Source Control feature has been removed');
	};

	const setPreferences = (_data: Partial<SourceControlPreferences>) => {
		// No-op
	};

	const getBranches = async () => {
		throw new Error('Source Control feature has been removed');
	};

	const getPreferences = async () => {
		return preferences;
	};

	const savePreferences = async (_preferences: Partial<SourceControlPreferences>) => {
		throw new Error('Source Control feature has been removed');
	};

	const updatePreferences = async (_preferences: Partial<SourceControlPreferences>) => {
		throw new Error('Source Control feature has been removed');
	};

	const disconnect = async (_keepKeyPair: boolean) => {
		throw new Error('Source Control feature has been removed');
	};

	const generateKeyPair = async (_keyGeneratorType?: TupleToUnion<SshKeyTypes>) => {
		throw new Error('Source Control feature has been removed');
	};

	const getStatus = async () => {
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

	const getAggregatedStatus = async () => {
		return { files: [] };
	};

	const getRemoteWorkflow = async (_workflowId: string) => {
		throw new Error('Source Control feature has been removed');
	};

	return {
		isEnterpriseSourceControlEnabled,
		state,
		preferences,
		pushWorkfolder,
		pullWorkfolder,
		getPreferences,
		setPreferences,
		generateKeyPair,
		getBranches,
		savePreferences,
		updatePreferences,
		disconnect,
		getStatus,
		getAggregatedStatus,
		getRemoteWorkflow,
		sshKeyTypesWithLabel,
	};
});
