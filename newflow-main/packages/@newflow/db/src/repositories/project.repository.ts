/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';
import { PROJECT_OWNER_ROLE_SLUG } from '@newflow/permissions';
import type { EntityManager } from '@n8n/typeorm';
import { DataSource, Repository } from '@n8n/typeorm';

import { Project } from '../entities';

@Service()
export class ProjectRepository extends Repository<Project> {
	constructor(dataSource: DataSource) {
		super(Project, dataSource.manager);
	}

	async getPersonalProjectForUser(userId: string, entityManager?: EntityManager) {
		const em = entityManager ?? this.manager;

		return await em.findOne(Project, {
			where: {
				type: 'personal',
				projectRelations: { userId, role: { slug: PROJECT_OWNER_ROLE_SLUG } },
			},
			relations: ['projectRelations.role'],
		});
	}

	async getPersonalProjectForUserOrFail(userId: string, entityManager?: EntityManager) {
		const em = entityManager ?? this.manager;

		return await em.findOneOrFail(Project, {
			where: {
				type: 'personal',
				projectRelations: { userId, role: { slug: PROJECT_OWNER_ROLE_SLUG } },
			},
		});
	}

	async getAccessibleProjects(userId: string) {
		return await this.find({
			where: [
				{ type: 'personal' },
				{
					projectRelations: {
						userId,
					},
				},
			],
		});
	}

	async getProjectCounts() {
		return {
			personal: await this.count({ where: { type: 'personal' } }),
			team: await this.count({ where: { type: 'team' } }),
		};
	}
}
