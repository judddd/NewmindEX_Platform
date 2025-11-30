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
	WorkflowHistory,
	WorkflowVersion,
} from '@newflow/rest-api-client/api/workflowHistory';

export const workflowHistoryDataFactory: () => WorkflowHistory = () => ({
	versionId: faker.string.nanoid(),
	createdAt: faker.date.past().toDateString(),
	updatedAt: faker.date.past().toDateString(),
	authors: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, faker.person.fullName).join(
		', ',
	),
});

export const workflowVersionDataFactory: () => WorkflowVersion = () => ({
	...workflowHistoryDataFactory(),
	workflowId: faker.string.nanoid(),
	connections: {},
	nodes: [],
});
