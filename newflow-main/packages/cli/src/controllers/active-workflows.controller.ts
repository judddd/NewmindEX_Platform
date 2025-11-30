/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Get, RestController } from '@newflow/decorators';

import { ActiveWorkflowRequest } from '@/requests';
import { ActiveWorkflowsService } from '@/services/active-workflows.service';

@RestController('/active-workflows')
export class ActiveWorkflowsController {
	constructor(private readonly activeWorkflowsService: ActiveWorkflowsService) {}

	@Get('/')
	async getActiveWorkflows(req: ActiveWorkflowRequest.GetAllActive) {
		return await this.activeWorkflowsService.getAllActiveIdsFor(req.user);
	}

	@Get('/error/:id')
	async getActivationError(req: ActiveWorkflowRequest.GetActivationError) {
		const {
			user,
			params: { id: workflowId },
		} = req;
		return await this.activeWorkflowsService.getActivationError(workflowId, user);
	}
}
