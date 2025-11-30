/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Logger } from '@newflow/backend-common';
import type { User } from '@newflow/db';
import { SharedWorkflowRepository, WorkflowRepository } from '@newflow/db';
import { Service } from '@newflow/di';
import { hasGlobalScope } from '@newflow/permissions';

import { ActivationErrorsService } from '@/activation-errors.service';
import { BadRequestError } from '@/errors/response-errors/bad-request.error';
import { WorkflowFinderService } from '@/workflows/workflow-finder.service';

@Service()
export class ActiveWorkflowsService {
	constructor(
		private readonly logger: Logger,
		private readonly workflowRepository: WorkflowRepository,
		private readonly sharedWorkflowRepository: SharedWorkflowRepository,
		private readonly activationErrorsService: ActivationErrorsService,
		private readonly workflowFinderService: WorkflowFinderService,
	) {}

	async getAllActiveIdsInStorage() {
		const activationErrors = await this.activationErrorsService.getAll();
		const activeWorkflowIds = await this.workflowRepository.getActiveIds();
		return activeWorkflowIds.filter((workflowId) => !activationErrors[workflowId]);
	}

	async getAllActiveIdsFor(user: User) {
		const activationErrors = await this.activationErrorsService.getAll();
		const activeWorkflowIds = await this.workflowRepository.getActiveIds();

		const hasFullAccess = hasGlobalScope(user, 'workflow:list');
		if (hasFullAccess) {
			return activeWorkflowIds.filter((workflowId) => !activationErrors[workflowId]);
		}

		const sharedWorkflowIds =
			await this.sharedWorkflowRepository.getSharedWorkflowIds(activeWorkflowIds);
		return sharedWorkflowIds.filter((workflowId) => !activationErrors[workflowId]);
	}

	async getActivationError(workflowId: string, user: User) {
		const workflow = await this.workflowFinderService.findWorkflowForUser(workflowId, user, [
			'workflow:read',
		]);
		if (!workflow) {
			this.logger.warn('User attempted to access workflow errors without permissions', {
				workflowId,
				userId: user.id,
			});

			throw new BadRequestError(`Workflow with ID "${workflowId}" could not be found.`);
		}

		return await this.activationErrorsService.get(workflowId);
	}
}
