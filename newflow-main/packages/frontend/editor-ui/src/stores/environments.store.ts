/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// NewFlow: Variables feature removed - stub store for compatibility
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { EnvironmentVariable } from '@/Interface';

export const useEnvironmentsStore = defineStore('environments', () => {
	const variables = ref<EnvironmentVariable[]>([]);

	// NewFlow: All methods return empty/no-op
	async function fetchAllVariables() {
		return [];
	}

	async function createVariable(variable: Omit<EnvironmentVariable, 'id'>) {
		throw new Error('Variables feature has been removed');
	}

	async function updateVariable(variable: EnvironmentVariable) {
		throw new Error('Variables feature has been removed');
	}

	async function deleteVariable(variable: EnvironmentVariable) {
		throw new Error('Variables feature has been removed');
	}

	const variablesAsObject = computed(() => {
		return {};
	});

	return {
		variables,
		variablesAsObject,
		fetchAllVariables,
		createVariable,
		updateVariable,
		deleteVariable,
	};
});

export default useEnvironmentsStore;
