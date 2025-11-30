/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { CredentialsRepository, WorkflowRepository } from '@newflow/db';
import { Service } from '@newflow/di';

@Service()
export class NamingService {
	constructor(
		private readonly workflowRepository: WorkflowRepository,
		private readonly credentialsRepository: CredentialsRepository,
	) {}

	async getUniqueWorkflowName(requestedName: string) {
		return await this.getUniqueName(requestedName, 'workflow');
	}

	async getUniqueCredentialName(requestedName: string) {
		return await this.getUniqueName(requestedName, 'credential');
	}

	private async getUniqueName(requestedName: string, entity: 'workflow' | 'credential') {
		const repository = entity === 'workflow' ? this.workflowRepository : this.credentialsRepository;

		const found = await repository.findStartingWith(requestedName);

		if (found.length === 0) return requestedName;

		if (found.length === 1) return [requestedName, 2].join(' ');

		const maxSuffix = found.reduce((max, { name }) => {
			const [_, strSuffix] = name.split(`${requestedName} `);

			const numSuffix = parseInt(strSuffix);

			if (isNaN(numSuffix)) return max;

			if (numSuffix > max) max = numSuffix;

			return max;
		}, 2);

		return [requestedName, maxSuffix + 1].join(' ');
	}
}
