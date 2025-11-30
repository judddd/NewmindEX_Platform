/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { computed } from 'vue';
import type { N8nEnvFeatFlags } from '@newflow/api-types';
import { useSettingsStore } from '@/stores/settings.store';

export const useEnvFeatureFlag = () => {
	const settingsStore = useSettingsStore();

	const check = computed(() => (flag: Uppercase<string>): boolean => {
		const key = `NEWFLOW_ENV_FEAT_${flag}` as const;

		// Settings provided by the backend take precedence over build-time or runtime flags
		const settingsProvidedEnvFeatFlag = settingsStore.settings.envFeatureFlags?.[key];
		if (settingsProvidedEnvFeatFlag !== undefined) {
			return settingsProvidedEnvFeatFlag !== 'false' && !!settingsProvidedEnvFeatFlag;
		}

		// "Vite exposes certain constants under the special import.meta.env object. These constants are defined as global variables during dev and statically replaced at build time to make tree-shaking effective."
		// See https://vite.dev/guide/env-and-mode.html
		const buildTimeValue = (import.meta.env as N8nEnvFeatFlags)[key];
		if (buildTimeValue !== undefined) {
			return buildTimeValue !== 'false' && !!buildTimeValue;
		}

		return false;
	});

	return {
		check,
	};
};
