/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { EventMessageTypes as EventMessage } from '@/eventbus/event-message-classes';
import { EventMessageNode } from '@/eventbus/event-message-classes/event-message-node';
import { EventMessageWorkflow } from '@/eventbus/event-message-classes/event-message-workflow';

export const setupMessages = (executionId: string, workflowName: string): EventMessage[] => {
	return [
		new EventMessageWorkflow({
			eventName: 'n8n.workflow.started',
			payload: { executionId },
		}),
		new EventMessageNode({
			eventName: 'n8n.node.started',
			payload: {
				executionId,
				workflowName,
				nodeName: 'When clicking "Execute workflow"',
				nodeType: 'n8n-nodes-base.manualTrigger',
				nodeId: '123',
			},
		}),
		new EventMessageNode({
			eventName: 'n8n.node.finished',
			payload: {
				executionId,
				workflowName,
				nodeName: 'When clicking "Execute workflow"',
				nodeType: 'n8n-nodes-base.manualTrigger',
				nodeId: '123',
			},
		}),
		new EventMessageNode({
			eventName: 'n8n.node.started',
			payload: {
				executionId,
				workflowName,
				nodeName: 'DebugHelper',
				nodeType: 'n8n-nodes-base.debugHelper',
				nodeId: '123',
			},
		}),
	];
};
