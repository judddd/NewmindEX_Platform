/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { copyInputItems } from '../copy-input-items';

describe('copyInputItems', () => {
	it('should pick only selected properties', () => {
		const output = copyInputItems(
			[
				{
					json: {
						a: 1,
						b: true,
						c: {},
					},
				},
			],
			['a'],
		);
		expect(output).toEqual([{ a: 1 }]);
	});

	it('should convert undefined to null', () => {
		const output = copyInputItems(
			[
				{
					json: {
						a: undefined,
					},
				},
			],
			['a'],
		);
		expect(output).toEqual([{ a: null }]);
	});

	it('should clone objects', () => {
		const input = {
			a: { b: 5 },
		};
		const output = copyInputItems(
			[
				{
					json: input,
				},
			],
			['a'],
		);
		expect(output[0].a).toEqual(input.a);
		expect(output[0].a === input.a).toEqual(false);
	});
});
