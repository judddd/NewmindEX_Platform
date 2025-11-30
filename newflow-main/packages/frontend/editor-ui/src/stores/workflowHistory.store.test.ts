/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createPinia, setActivePinia } from 'pinia';
import type { FrontendSettings } from '@newflow/api-types';
import { useWorkflowHistoryStore } from '@/stores/workflowHistory.store';
import { useSettingsStore } from '@/stores/settings.store';

describe('Workflow history store', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	test('should always set `shouldUpgrade` to false (license checks removed)', () => {
		const workflowHistoryStore = useWorkflowHistoryStore();
		const settingsStore = useSettingsStore();

		settingsStore.settings = {
			workflowHistory: {
				pruneTime: 24,
			},
		} as FrontendSettings;

		expect(workflowHistoryStore.shouldUpgrade).toBe(false);
	});

	test('should set evaluatedPruneTime to config pruneTime', () => {
		const workflowHistoryStore = useWorkflowHistoryStore();
		const settingsStore = useSettingsStore();

		settingsStore.settings = {
			workflowHistory: {
				pruneTime: 168,
			},
		} as FrontendSettings;

		expect(workflowHistoryStore.evaluatedPruneTime).toBe(168);
	});

	test('should default to -1 when pruneTime is not set', () => {
		const workflowHistoryStore = useWorkflowHistoryStore();
		const settingsStore = useSettingsStore();

		settingsStore.settings = {
			workflowHistory: {},
		} as FrontendSettings;

		expect(workflowHistoryStore.evaluatedPruneTime).toBe(-1);
	});
});
