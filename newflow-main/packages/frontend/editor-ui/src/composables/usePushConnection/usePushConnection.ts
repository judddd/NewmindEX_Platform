/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ref } from 'vue';
import type { PushMessage } from '@newflow/api-types';

import { usePushConnectionStore } from '@/stores/pushConnection.store';
import {
	testWebhookDeleted,
	testWebhookReceived,
	reloadNodeType,
	removeNodeType,
	nodeDescriptionUpdated,
	nodeExecuteBefore,
	nodeExecuteAfter,
	nodeExecuteAfterData,
	executionStarted,
	sendWorkerStatusMessage,
	sendConsoleMessage,
	workflowFailedToActivate,
	executionFinished,
	executionRecovered,
	workflowActivated,
	workflowDeactivated,
} from '@/composables/usePushConnection/handlers';
import { createEventQueue } from '@newflow/utils/event-queue';
import type { useRouter } from 'vue-router';

export function usePushConnection(options: { router: ReturnType<typeof useRouter> }) {
	const pushStore = usePushConnectionStore();

	const { enqueue } = createEventQueue<PushMessage>(processEvent);

	const removeEventListener = ref<(() => void) | null>(null);

	function initialize() {
		removeEventListener.value = pushStore.addEventListener((message) => {
			enqueue(message);
		});
	}

	function terminate() {
		if (typeof removeEventListener.value === 'function') {
			removeEventListener.value();
		}
	}

	/**
	 * Process received push message event by calling the correct handler
	 */
	async function processEvent(event: PushMessage) {
		switch (event.type) {
			case 'testWebhookDeleted':
				return await testWebhookDeleted(event);
			case 'testWebhookReceived':
				return await testWebhookReceived(event);
			case 'reloadNodeType':
				return await reloadNodeType(event);
			case 'removeNodeType':
				return await removeNodeType(event);
			case 'nodeDescriptionUpdated':
				return await nodeDescriptionUpdated(event);
			case 'nodeExecuteBefore':
				return await nodeExecuteBefore(event);
			case 'nodeExecuteAfter':
				return await nodeExecuteAfter(event);
			case 'nodeExecuteAfterData':
				return await nodeExecuteAfterData(event);
			case 'executionStarted':
				return await executionStarted(event);
			case 'sendWorkerStatusMessage':
				return await sendWorkerStatusMessage(event);
			case 'sendConsoleMessage':
				return await sendConsoleMessage(event);
			case 'workflowFailedToActivate':
				return await workflowFailedToActivate(event);
			case 'executionFinished':
				return await executionFinished(event, options);
			case 'executionRecovered':
				return await executionRecovered(event, options);
			case 'workflowActivated':
				return await workflowActivated(event);
			case 'workflowDeactivated':
				return await workflowDeactivated(event);
		}
	}

	return {
		initialize,
		terminate,
	};
}
