/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { WorkflowRepository } from '@newflow/db';
import { Command } from '@newflow/decorators';
import { Container } from '@newflow/di';
import { z } from 'zod';

import { BaseCommand } from '../base-command';

const flagsSchema = z.object({
	active: z
		.string()
		.describe('Filters workflows by active status. Can be true or false')
		.optional(),
	onlyId: z.boolean().describe('Outputs workflow IDs only, one per line.').default(false),
});

@Command({
	name: 'list:workflow',
	description: 'List workflows',
	examples: ['', '--active=true --onlyId', '--active=false'],
	flagsSchema,
})
export class ListWorkflowCommand extends BaseCommand<z.infer<typeof flagsSchema>> {
	async run() {
		const { flags } = this;

		if (flags.active !== undefined && !['true', 'false'].includes(flags.active)) {
			this.error('The --active flag has to be passed using true or false');
		}

		const workflowRepository = Container.get(WorkflowRepository);

		const workflows =
			flags.active !== undefined
				? await workflowRepository.findByActiveState(flags.active === 'true')
				: await workflowRepository.find();

		if (flags.onlyId) {
			workflows.forEach((workflow) => this.logger.info(workflow.id));
		} else {
			workflows.forEach((workflow) => this.logger.info(`${workflow.id}|${workflow.name}`));
		}
	}

	async catch(error: Error) {
		this.logger.error('\nGOT ERROR');
		this.logger.error('====================================');
		this.logger.error(error.message);
		this.logger.error(error.stack!);
	}
}
