/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { NodeExecuteBefore } from '@newflow/api-types/push/execution';
import { useWorkflowsStore } from '@/stores/workflows.store';

/**
 * Handles the 'nodeExecuteBefore' event, which happens before a node is executed.
 */
export async function nodeExecuteBefore({ data }: NodeExecuteBefore) {
	const workflowsStore = useWorkflowsStore();

	workflowsStore.addExecutingNode(data.nodeName);
	workflowsStore.addNodeExecutionStartedData(data);
}
