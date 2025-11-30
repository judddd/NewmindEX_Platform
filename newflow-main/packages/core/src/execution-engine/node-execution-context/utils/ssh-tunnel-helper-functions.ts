/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Container } from '@newflow/di';
import type { SSHTunnelFunctions } from 'n8n-workflow';
import type { Client } from 'ssh2';

import { SSHClientsManager } from '../../ssh-clients-manager';

export const getSSHTunnelFunctions = (): SSHTunnelFunctions => {
	const sshClientsManager = Container.get(SSHClientsManager);
	return {
		getSSHClient: async (credentials, abortController) =>
			await sshClientsManager.getClient(credentials, abortController),
		updateLastUsed: (client: Client) => sshClientsManager.updateLastUsed(client),
	};
};
