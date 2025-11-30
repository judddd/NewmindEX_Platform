/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ResponseError } from './abstract/response.error';

export class InternalServerError extends ResponseError {
	constructor(message?: string, cause?: unknown) {
		super(message ? message : 'Internal Server Error', 500, 500, undefined, cause);
	}
}
