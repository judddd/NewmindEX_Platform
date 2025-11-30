/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ApplicationError } from '@n8n/errors';

/**
 * Error that indicates that a specific function is not available in the
 * Code Node.
 */
export class UnsupportedFunctionError extends ApplicationError {
	constructor(functionName: string) {
		super(`The function "${functionName}" is not supported in the Code Node`, {
			level: 'info',
		});
	}
}
