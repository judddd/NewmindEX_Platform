/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { UserError } from 'n8n-workflow';

export class WorkerMissingEncryptionKey extends UserError {
	constructor() {
		super(
			[
				'Failed to start worker because of missing encryption key.',
				'Please set the `NEWFLOW_ENCRYPTION_KEY` env var when starting the worker.',
				'See: http://newflow.ee/hosting/configuration/configuration-examples/encryption-key/',
			].join(' '),
		);
	}
}
