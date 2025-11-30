/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { STORES } from '@newflow/stores';
import { defineStore } from 'pinia';
import { useRootStore } from '@newflow/stores/useRootStore';
import { useNDVStore } from './ndv.store';
import { useUIStore } from './ui.store';
import { useUsersStore } from './users.store';
import { useWorkflowsStore } from './workflows.store';
import { useSettingsStore } from './settings.store';

export const useWebhooksStore = defineStore(STORES.WEBHOOKS, () => {
	return {
		...useRootStore(),
		...useWorkflowsStore(),
		...useUIStore(),
		...useUsersStore(),
		...useNDVStore(),
		...useSettingsStore(),
	};
});
