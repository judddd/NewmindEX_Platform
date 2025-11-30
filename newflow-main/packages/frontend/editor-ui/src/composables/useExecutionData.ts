/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { useWorkflowsStore } from '@/stores/workflows.store';
import type { INode, IRunExecutionData } from 'n8n-workflow';
import { computed, type ComputedRef } from 'vue';

export function useExecutionData({ node }: { node: ComputedRef<INode | undefined> }) {
	const workflowsStore = useWorkflowsStore();

	const workflowExecution = computed(() => {
		return workflowsStore.getWorkflowExecution;
	});

	const workflowRunData = computed(() => {
		if (workflowExecution.value === null) {
			return null;
		}
		const executionData: IRunExecutionData | undefined = workflowExecution.value.data;
		if (!executionData?.resultData?.runData) {
			return null;
		}
		return executionData.resultData.runData;
	});

	const hasNodeRun = computed(() => {
		if (workflowsStore.subWorkflowExecutionError) return true;

		return Boolean(
			node.value &&
				workflowRunData.value &&
				Object.prototype.hasOwnProperty.bind(workflowRunData.value)(node.value.name),
		);
	});

	return {
		workflowExecution,
		workflowRunData,
		hasNodeRun,
	};
}
