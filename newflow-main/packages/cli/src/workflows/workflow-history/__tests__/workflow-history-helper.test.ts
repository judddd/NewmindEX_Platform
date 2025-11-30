/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { GlobalConfig } from '@newflow/config';
import { mockInstance } from '@newflow/backend-test-utils';

import {
	getWorkflowHistoryPruneTime,
	isWorkflowHistoryEnabled,
} from '@/workflows/workflow-history/workflow-history-helper';

describe('WorkflowHistoryHelper', () => {
	const globalConfig = mockInstance(GlobalConfig, {
		workflowHistory: {
			enabled: true,
			pruneTime: -1,
		},
	});

	beforeEach(() => {
		globalConfig.workflowHistory.enabled = true;
		globalConfig.workflowHistory.pruneTime = -1;
	});

	describe('isWorkflowHistoryEnabled', () => {
		it('should return true when enabled in config', () => {
			globalConfig.workflowHistory.enabled = true;
			expect(isWorkflowHistoryEnabled()).toBe(true);
		});

		it('should return false when disabled in config', () => {
			globalConfig.workflowHistory.enabled = false;
			expect(isWorkflowHistoryEnabled()).toBe(false);
		});
	});

	describe('getWorkflowHistoryPruneTime', () => {
		it('should return config prune time', () => {
			globalConfig.workflowHistory.pruneTime = 168;
			expect(getWorkflowHistoryPruneTime()).toBe(168);
		});

		it('should return -1 when prune time is -1 (infinite)', () => {
			globalConfig.workflowHistory.pruneTime = -1;
			expect(getWorkflowHistoryPruneTime()).toBe(-1);
		});

		it('should return 24 when prune time is 24 hours', () => {
			globalConfig.workflowHistory.pruneTime = 24;
			expect(getWorkflowHistoryPruneTime()).toBe(24);
		});
	});
});
