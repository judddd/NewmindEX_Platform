/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { validate } from 'class-validator';

import { NoUrl } from '../no-url.validator';

describe('NoUrl', () => {
	class Entity {
		@NoUrl()
		name = '';
	}

	const entity = new Entity();

	describe('URLs', () => {
		const URLS = ['http://google.com', 'www.domain.tld', 'n8n.io'];

		for (const str of URLS) {
			test(`should block ${str}`, async () => {
				entity.name = str;
				const errors = await validate(entity);
				expect(errors).toHaveLength(1);
				const [error] = errors;
				expect(error.property).toEqual('name');
				expect(error.constraints).toEqual({ NoUrl: 'Potentially malicious string' });
			});
		}
	});
});
