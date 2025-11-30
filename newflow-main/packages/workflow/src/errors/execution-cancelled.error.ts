/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ExecutionBaseError } from './abstract/execution-base.error';

export class ExecutionCancelledError extends ExecutionBaseError {
	constructor(executionId: string) {
		super('The execution was cancelled', {
			level: 'warning',
			extra: { executionId },
		});
	}
}
