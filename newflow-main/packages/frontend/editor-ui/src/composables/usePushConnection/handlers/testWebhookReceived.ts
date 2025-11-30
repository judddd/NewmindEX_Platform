/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { TestWebhookReceived } from '@newflow/api-types/push/webhook';
import { useWorkflowsStore } from '@/stores/workflows.store';

/**
 * Handles the 'testWebhookReceived' push message, which is sent when a test webhook is received.
 */
export async function testWebhookReceived({ data }: TestWebhookReceived) {
	const workflowsStore = useWorkflowsStore();

	if (data.workflowId === workflowsStore.workflowId) {
		workflowsStore.executionWaitingForWebhook = false;
		workflowsStore.setActiveExecutionId(data.executionId ?? null);
	}
}
