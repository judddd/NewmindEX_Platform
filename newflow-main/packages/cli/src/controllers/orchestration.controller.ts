/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Post, RestController, GlobalScope } from '@newflow/decorators';

import { License } from '@/license';
// NewFlow: Multi-main removed
// import { WorkerStatusService } from '@/scaling/worker-status.service.ee';

@RestController('/orchestration')
export class OrchestrationController {
	constructor(
		private readonly licenseService: License,
		// NewFlow: Multi-main removed
		// private readonly workerStatusService: WorkerStatusService,
	) {}

	/**
	 * This endpoint does not return anything, it just triggers the message to
	 * the workers to respond on Redis with their status.
	 *
	 * NewFlow: Multi-main removed - endpoint disabled
	 */
	@GlobalScope('orchestration:read')
	@Post('/worker/status')
	async getWorkersStatusAll() {
		// NewFlow: Multi-main removed - always return empty
		return [];
		// if (!this.licenseService.isWorkerViewLicensed()) return;
		// return await this.workerStatusService.requestWorkerStatus();
	}
}
