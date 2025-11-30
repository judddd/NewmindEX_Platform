/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { mock } from 'jest-mock-extended';
import type { SSHCredentials } from 'n8n-workflow';

import { mockInstance } from '@test/utils';

import { SSHClientsManager } from '../../../ssh-clients-manager';
import { getSSHTunnelFunctions } from '../ssh-tunnel-helper-functions';

describe('getSSHTunnelFunctions', () => {
	const abortController = new AbortController();
	const credentials = mock<SSHCredentials>();
	const sshClientsManager = mockInstance(SSHClientsManager);
	const sshTunnelFunctions = getSSHTunnelFunctions();

	it('should return SSH tunnel functions', () => {
		expect(typeof sshTunnelFunctions.getSSHClient).toBe('function');
	});

	describe('getSSHClient', () => {
		it('should invoke sshClientsManager.getClient', async () => {
			await sshTunnelFunctions.getSSHClient(credentials, abortController);

			expect(sshClientsManager.getClient).toHaveBeenCalledWith(credentials, abortController);
		});
	});

	describe('updateLastUsed', () => {
		it('should invoke sshClientsManager.updateLastUsed', async () => {
			// ARRANGE
			const client = await sshTunnelFunctions.getSSHClient(credentials, abortController);

			// ACT
			sshTunnelFunctions.updateLastUsed(client);

			// ASSERT
			expect(sshClientsManager.updateLastUsed).toHaveBeenCalledWith(client);
		});
	});
});
