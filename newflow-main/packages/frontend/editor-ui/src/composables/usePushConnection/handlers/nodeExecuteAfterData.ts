/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { NodeExecuteAfterData } from '@newflow/api-types/push/execution';
import { useSchemaPreviewStore } from '@/stores/schemaPreview.store';
import { useWorkflowsStore } from '@/stores/workflows.store';

/**
 * Handles the 'nodeExecuteAfterData' event, which is sent after a node has executed and contains the resulting data.
 */
export async function nodeExecuteAfterData({ data: pushData }: NodeExecuteAfterData) {
	const workflowsStore = useWorkflowsStore();
	const schemaPreviewStore = useSchemaPreviewStore();

	workflowsStore.updateNodeExecutionData(pushData);

	void schemaPreviewStore.trackSchemaPreviewExecution(pushData);
}
