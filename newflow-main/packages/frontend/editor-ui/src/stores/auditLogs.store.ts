/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { computed } from 'vue';
import { defineStore } from 'pinia';
import { EnterpriseEditionFeature } from '@/constants';
import { useSettingsStore } from '@/stores/settings.store';

export const useAuditLogsStore = defineStore('auditLogs', () => {
	const settingsStore = useSettingsStore();

	const isEnterpriseAuditLogsFeatureEnabled = computed(
		() => settingsStore.isEnterpriseFeatureEnabled[EnterpriseEditionFeature.AuditLogs],
	);

	return {
		isEnterpriseAuditLogsFeatureEnabled,
	};
});
