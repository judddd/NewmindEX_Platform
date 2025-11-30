/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { splitName } from '@/utils/projects.utils';

describe('splitName', () => {
	test.each([
		[
			'First Last <email@domain.com>',
			{
				name: 'First Last',
				email: 'email@domain.com',
			},
		],
		[
			'First Last Third <email@domain.com>',
			{
				name: 'First Last Third',
				email: 'email@domain.com',
			},
		],
		[
			'First Last Third Fourth <email@domain.com>',
			{
				name: 'First Last Third Fourth',
				email: 'email@domain.com',
			},
		],
		[
			' First Last Third Fourth <email@domain.com>',
			{
				name: 'First Last Third Fourth',
				email: 'email@domain.com',
			},
		],
		[
			'<email@domain.com>',
			{
				name: undefined,
				email: 'email@domain.com',
			},
		],
		[
			' <email@domain.com>',
			{
				name: undefined,
				email: 'email@domain.com',
			},
		],
		[
			'My project',
			{
				name: 'My project',
				email: undefined,
			},
		],
		[
			' My project ',
			{
				name: 'My project',
				email: undefined,
			},
		],
		[
			'MyProject',
			{
				name: 'MyProject',
				email: undefined,
			},
		],
		[
			undefined,
			{
				name: undefined,
				email: undefined,
			},
		],
	])('should split a name in the format "First Last <email@domain.com>"', (input, result) => {
		expect(splitName(input)).toEqual(result);
	});
});
