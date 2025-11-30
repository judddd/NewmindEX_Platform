/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { TestWebhookDeleted } from '@newflow/api-types/push/webhook';
import { useWorkflowsStore } from '@/stores/workflows.store';

/**
 * Handles the 'testWebhookDeleted' push message, which is sent when a test webhook is deleted.
 */
export async function testWebhookDeleted({ data }: TestWebhookDeleted) {
	const workflowsStore = useWorkflowsStore();

	if (data.workflowId === workflowsStore.workflowId) {
		workflowsStore.executionWaitingForWebhook = false;
		workflowsStore.setActiveExecutionId(undefined);
	}
}
