/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { useSettingsStore } from '@/stores/settings.store';
import type { RBACPermissionCheck, EnterprisePermissionOptions } from '@/types/rbac';

export const isEnterpriseFeatureEnabled: RBACPermissionCheck<EnterprisePermissionOptions> = (
	options,
) => {
	if (!options?.feature) {
		return true;
	}

	const features = Array.isArray(options.feature) ? options.feature : [options.feature];
	const settingsStore = useSettingsStore();
	const mode = options.mode ?? 'allOf';
	if (mode === 'allOf') {
		return features.every((feature) => settingsStore.isEnterpriseFeatureEnabled[feature]);
	} else {
		return features.some((feature) => settingsStore.isEnterpriseFeatureEnabled[feature]);
	}
};
