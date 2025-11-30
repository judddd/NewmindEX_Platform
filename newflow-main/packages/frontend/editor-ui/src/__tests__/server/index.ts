/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createServer } from 'miragejs';
import { endpoints } from './endpoints';
import { models } from './models';
import { factories } from './factories';
import { fixtures } from './fixtures';

export function setupServer() {
	const server = createServer({
		models,
		factories,
		fixtures,
		seeds(server) {
			server.loadFixtures('tags', 'workflows');
			server.createList('credentialType', 8);
			server.create('user', {
				firstName: 'Nathan',
				lastName: 'Doe',
				isDefaultUser: true,
			});
		},
	});

	// Set server url prefix
	server.urlPrefix = process.env.API_URL || '';

	// Enable logging
	server.logging = false;

	// Handle defined endpoints
	for (const endpointsFn of endpoints) {
		endpointsFn(server);
	}

	// Handle undefined endpoints
	server.post('/rest/:any', async () => ({}));

	// Reset for everything else
	server.namespace = '';
	server.passthrough();

	if (server.logging) {
		console.log('Mirage database');
		console.log(server.db.dump());
	}

	return server;
}
