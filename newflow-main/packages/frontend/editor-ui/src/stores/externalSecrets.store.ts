/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// NewFlow: External Secrets feature removed - stub store for compatibility
import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import type { ExternalSecretsProvider } from '@newflow/api-types';

export const useExternalSecretsStore = defineStore('externalSecrets', () => {
	const state = reactive({
		providers: [] as ExternalSecretsProvider[],
		secrets: {} as Record<string, string[]>,
		connectionState: {} as Record<string, ExternalSecretsProvider['state']>,
	});

	// Always false - feature removed
	const isEnterpriseExternalSecretsEnabled = computed(() => false);

	const secrets = computed(() => state.secrets);
	const providers = computed(() => state.providers);
	const connectionState = computed(() => state.connectionState);
	const secretsAsObject = computed(() => ({}));

	// All methods return empty/no-op
	async function fetchAllSecrets() {
		return {};
	}

	async function reloadProvider(_id: string) {
		return false;
	}

	async function getProviders() {
		return [];
	}

	async function testProviderConnection(_id: string, _data: ExternalSecretsProvider['data']) {
		return { success: false };
	}

	async function getProvider(_id: string) {
		throw new Error('External Secrets feature has been removed');
	}

	function updateStoredProvider(_id: string, _data: Partial<ExternalSecretsProvider>) {
		// No-op
	}

	async function updateProviderConnected(_id: string, _value: boolean) {
		// No-op
	}

	async function updateProvider(_id: string, _data: Partial<ExternalSecretsProvider>) {
		// No-op
	}

	function setConnectionState(_id: string, _connectionState: ExternalSecretsProvider['state']) {
		// No-op
	}

	return {
		state,
		providers,
		secrets,
		connectionState,
		secretsAsObject,
		isEnterpriseExternalSecretsEnabled,
		fetchAllSecrets,
		getProvider,
		getProviders,
		testProviderConnection,
		updateProvider,
		updateStoredProvider,
		updateProviderConnected,
		reloadProvider,
		setConnectionState,
	};
});
