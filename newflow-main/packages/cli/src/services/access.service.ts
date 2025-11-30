/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { User } from '@newflow/db';
import { UserRepository } from '@newflow/db';
import { Service } from '@newflow/di';
import type { Workflow } from 'n8n-workflow';

import { WorkflowFinderService } from '@/workflows/workflow-finder.service';

/**
 * Responsible for checking whether a user has access to a resource.
 */
@Service()
export class AccessService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly workflowFinderService: WorkflowFinderService,
	) {}

	/** Whether a user has read access to a workflow based on their project and scope. */
	async hasReadAccess(userId: User['id'], workflowId: Workflow['id']) {
		const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['role'] });

		if (!user) return false;

		const workflow = await this.workflowFinderService.findWorkflowForUser(workflowId, user, [
			'workflow:read',
		]);

		return workflow !== null;
	}
}
