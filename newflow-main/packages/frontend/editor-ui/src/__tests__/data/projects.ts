/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { faker } from '@faker-js/faker';
import type {
	Project,
	ProjectListItem,
	ProjectSharingData,
	ProjectType,
} from '@/types/projects.types';
import { ProjectTypes } from '@/types/projects.types';
import { MAX_NAME_LENGTH } from '@/utils/projects.utils';

export const createProjectSharingData = (projectType?: ProjectType): ProjectSharingData => ({
	id: faker.string.uuid(),
	name: faker.lorem.words({ min: 1, max: 3 }).slice(0, MAX_NAME_LENGTH).trimEnd(),
	icon: { type: 'icon', value: 'folder' },
	type: projectType ?? ProjectTypes.Personal,
	createdAt: faker.date.past().toISOString(),
	updatedAt: faker.date.recent().toISOString(),
});

export const createProjectListItem = (projectType?: ProjectType): ProjectListItem => {
	const project = createProjectSharingData(projectType);
	return {
		...project,
		role: 'project:editor',
		createdAt: faker.date.past().toISOString(),
		updatedAt: faker.date.recent().toISOString(),
	};
};

export function createTestProject(data: Partial<Project>): Project {
	return {
		id: faker.string.uuid(),
		name: faker.lorem.words({ min: 1, max: 3 }),
		icon: { type: 'icon', value: 'folder' },
		createdAt: faker.date.past().toISOString(),
		updatedAt: faker.date.recent().toISOString(),
		type: ProjectTypes.Team,
		relations: [],
		scopes: [],
		...data,
	};
}
