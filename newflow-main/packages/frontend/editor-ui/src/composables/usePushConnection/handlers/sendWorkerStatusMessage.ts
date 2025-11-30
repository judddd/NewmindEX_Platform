/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { SendWorkerStatusMessage } from '@newflow/api-types';
import { useOrchestrationStore } from '@/stores/orchestration.store';

/**
 * Handles the 'sendWorkerStatusMessage' event from the push connection, which indicates
 * that a worker status message should be sent.
 */
export async function sendWorkerStatusMessage({ data }: SendWorkerStatusMessage) {
	const orchestrationStore = useOrchestrationStore();
	orchestrationStore.updateWorkerStatus(data.status);
}
