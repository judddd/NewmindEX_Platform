/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { UserError } from 'n8n-workflow';

export class CredentialNotFoundError extends UserError {
	constructor(credentialId: string, credentialType: string) {
		super(`Credential with ID "${credentialId}" does not exist for type "${credentialType}".`);
	}
}
