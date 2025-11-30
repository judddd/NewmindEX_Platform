/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { WorkflowFailedToActivate } from '@newflow/api-types/push/workflow';
import { useToast } from '@/composables/useToast';
import { useI18n } from '@newflow/i18n';
import { useWorkflowsStore } from '@/stores/workflows.store';

export async function workflowFailedToActivate({ data }: WorkflowFailedToActivate) {
	const workflowsStore = useWorkflowsStore();

	if (workflowsStore.workflowId !== data.workflowId) {
		return;
	}

	workflowsStore.setWorkflowInactive(data.workflowId);
	workflowsStore.setActive(false);

	const toast = useToast();
	const i18n = useI18n();
	toast.showError(
		new Error(data.errorMessage),
		i18n.baseText('workflowActivator.showError.title', {
			interpolate: { newStateName: 'activated' },
		}) + ':',
	);
}
