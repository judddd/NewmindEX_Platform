/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// NewFlow: Worker View feature removed - this store is now stubbed
import { defineStore } from 'pinia';
import type { WorkerStatus } from '@newflow/api-types';

export const WORKER_HISTORY_LENGTH = 100;
const STALE_SECONDS = 120 * 1000;

export interface IOrchestrationStoreState {
	initialStatusReceived: boolean;
	workers: { [id: string]: WorkerStatus };
	workersHistory: {
		[id: string]: IWorkerHistoryItem[];
	};
	workersLastUpdated: { [id: string]: number };
	statusInterval: NodeJS.Timeout | null;
}

export interface IWorkerHistoryItem {
	timestamp: number;
	data: WorkerStatus;
}

// NewFlow: Worker View removed - all functionality stubbed
export const useOrchestrationStore = defineStore('orchestrationManager', {
	state: (): IOrchestrationStoreState => ({
		initialStatusReceived: false,
		workers: {},
		workersHistory: {},
		workersLastUpdated: {},
		statusInterval: null,
	}),
	actions: {
		updateWorkerStatus(_data: WorkerStatus) {
			// NewFlow: Worker View removed - no-op
		},
		removeStaleWorkers() {
			// NewFlow: Worker View removed - no-op
		},
		startWorkerStatusPolling() {
			// NewFlow: Worker View removed - no-op
		},
		stopWorkerStatusPolling() {
			// NewFlow: Worker View removed - no-op
		},
		getWorkerLastUpdated(_workerId: string): number {
			return 0;
		},
		getWorkerStatus(_workerId: string): WorkerStatus | undefined {
			return undefined;
		},
		getWorkerStatusHistory(_workerId: string): IWorkerHistoryItem[] {
			return [];
		},
	},
});
