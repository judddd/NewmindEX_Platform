/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ApplicationError } from '@n8n/errors';

export class InvalidExecutionMetadataError extends ApplicationError {
	constructor(
		public type: 'key' | 'value',
		key: unknown,
		message?: string,
		options?: ErrorOptions,
	) {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		super(message ?? `Custom data ${type}s must be a string (key "${key}")`, options);
	}
}
