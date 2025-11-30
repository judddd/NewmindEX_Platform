/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { NodeExecuteAfter } from '@newflow/api-types/push/execution';
import { useAssistantStore } from '@/stores/assistant.store';
import { useWorkflowsStore } from '@/stores/workflows.store';
import type { INodeExecutionData, ITaskData } from 'n8n-workflow';
import { TRIMMED_TASK_DATA_CONNECTIONS_KEY } from 'n8n-workflow';
import type { PushPayload } from '@newflow/api-types';
import { isValidNodeConnectionType } from '@/utils/typeGuards';

/**
 * Handles the 'nodeExecuteAfter' event, which happens after a node is executed.
 */
export async function nodeExecuteAfter({ data: pushData }: NodeExecuteAfter) {
	const workflowsStore = useWorkflowsStore();
	const assistantStore = useAssistantStore();

	/**
	 * We trim the actual data returned from the node execution to avoid performance issues
	 * when dealing with large datasets. Instead of storing the actual data, we initially store
	 * a placeholder object indicating that the data has been trimmed until the
	 * `nodeExecuteAfterData` event comes in.
	 */

	const placeholderOutputData: ITaskData['data'] = {
		main: [],
	};

	if (
		pushData.itemCountByConnectionType &&
		typeof pushData.itemCountByConnectionType === 'object'
	) {
		const fillObject: INodeExecutionData = { json: { [TRIMMED_TASK_DATA_CONNECTIONS_KEY]: true } };
		for (const [connectionType, outputs] of Object.entries(pushData.itemCountByConnectionType)) {
			if (isValidNodeConnectionType(connectionType)) {
				placeholderOutputData[connectionType] = outputs.map((count) =>
					Array.from({ length: count }, () => fillObject),
				);
			}
		}
	}

	const pushDataWithPlaceholderOutputData: PushPayload<'nodeExecuteAfterData'> = {
		...pushData,
		data: {
			...pushData.data,
			data: placeholderOutputData,
		},
	};

	workflowsStore.updateNodeExecutionData(pushDataWithPlaceholderOutputData);
	workflowsStore.removeExecutingNode(pushData.nodeName);

	void assistantStore.onNodeExecution(pushData);
}
