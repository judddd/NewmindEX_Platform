/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { Server } from 'miragejs';
import { Response } from 'miragejs';
import type { AppSchema } from '../types';

export function routesForCredentials(server: Server) {
	server.get('/rest/credentials', (schema: AppSchema) => {
		const { models: data } = schema.all('credential');

		return new Response(200, {}, { data });
	});
}
