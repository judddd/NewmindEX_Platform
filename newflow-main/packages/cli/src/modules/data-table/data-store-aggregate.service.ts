/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { ListDataStoreQueryDto } from '@newflow/api-types';
import { Logger } from '@newflow/backend-common';
import { User } from '@newflow/db';
import { Service } from '@newflow/di';

import { ProjectService } from '@/services/project.service';

import { DataStoreRepository } from './data-store.repository';

@Service()
export class DataStoreAggregateService {
	constructor(
		private readonly dataStoreRepository: DataStoreRepository,
		private readonly projectService: ProjectService,
		private readonly logger: Logger,
	) {
		this.logger = this.logger.scoped('data-table');
	}
	async start() {}
	async shutdown() {}

	async getManyAndCount(user: User, options: ListDataStoreQueryDto) {
		const projects = await this.projectService.getProjectRelationsForUser(user);
		let projectIds = projects.map((x) => x.projectId);
		if (options.filter?.projectId) {
			const mask = [options.filter?.projectId].flat();
			projectIds = projectIds.filter((x) => mask.includes(x));
		}

		if (projectIds.length === 0) {
			return { count: 0, data: [] };
		}

		return await this.dataStoreRepository.getManyAndCount({
			...options,
			filter: {
				...options.filter,
				projectId: projectIds,
			},
		});
	}
}
