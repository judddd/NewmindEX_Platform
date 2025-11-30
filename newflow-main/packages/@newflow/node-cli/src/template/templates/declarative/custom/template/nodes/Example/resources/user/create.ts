/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { INodeProperties } from 'n8n-workflow';

const showOnlyForUserCreate = {
	operation: ['create'],
	resource: ['user'],
};

export const userCreateDescription: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForUserCreate,
		},
		description: 'The name of the user',
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
	},
];
