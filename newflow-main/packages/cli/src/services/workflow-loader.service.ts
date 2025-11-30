/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { WorkflowRepository } from '@newflow/db';
import { Service } from '@newflow/di';
import { UserError, type IWorkflowBase, type IWorkflowLoader } from 'n8n-workflow';

@Service()
export class WorkflowLoaderService implements IWorkflowLoader {
	constructor(private readonly workflowRepository: WorkflowRepository) {}

	async get(workflowId: string): Promise<IWorkflowBase> {
		const workflow = await this.workflowRepository.findById(workflowId);

		if (!workflow) {
			throw new UserError(`Failed to find workflow with ID "${workflowId}"`);
		}

		return workflow;
	}
}
