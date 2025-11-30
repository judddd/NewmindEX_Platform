/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { WorkflowRepository } from '@newflow/db';
import { Get, RestController } from '@newflow/decorators';
import { InstanceSettings } from 'n8n-core';

import { ActiveWorkflowManager } from '@/active-workflow-manager';
// NewFlow: Multi-main removed
// import { MultiMainSetup } from '@/scaling/multi-main-setup.ee';

@RestController('/debug')
export class DebugController {
	constructor(
		// NewFlow: Multi-main removed
		// private readonly multiMainSetup: MultiMainSetup,
		private readonly activeWorkflowManager: ActiveWorkflowManager,
		private readonly workflowRepository: WorkflowRepository,
		private readonly instanceSettings: InstanceSettings,
	) {}

	@Get('/multi-main-setup', { skipAuth: true })
	async getMultiMainSetupDetails() {
		// NewFlow: Multi-main removed - simplified version
		// const leaderKey = await this.multiMainSetup.fetchLeaderKey();

		const triggersAndPollers = await this.workflowRepository.findIn(
			this.activeWorkflowManager.allActiveInMemory(),
		);

		const webhooks = await this.workflowRepository.findWebhookBasedActiveWorkflows();

		const activationErrors = await this.activeWorkflowManager.getAllWorkflowActivationErrors();

		return {
			instanceId: this.instanceSettings.instanceId,
			leaderKey: null, // NewFlow: always single instance
			isLeader: true, // NewFlow: always leader in single instance
			activeWorkflows: {
				webhooks, // webhook-based active workflows
				triggersAndPollers, // poller- and trigger-based active workflows
			},
			activationErrors,
		};
	}
}
