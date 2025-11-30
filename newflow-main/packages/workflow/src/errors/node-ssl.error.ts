/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ExecutionBaseError } from './abstract/execution-base.error';

export class NodeSslError extends ExecutionBaseError {
	constructor(cause: Error) {
		super("SSL Issue: consider using the 'Ignore SSL issues' option", { cause });
	}
}
