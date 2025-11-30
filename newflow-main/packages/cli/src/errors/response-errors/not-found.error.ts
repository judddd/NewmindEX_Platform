/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ResponseError } from './abstract/response.error';

export class NotFoundError extends ResponseError {
	static isDefinedAndNotNull<T>(
		value: T | undefined | null,
		message: string,
		hint?: string,
	): asserts value is T {
		if (value === undefined || value === null) {
			throw new NotFoundError(message, hint);
		}
	}

	constructor(message: string, hint: string | undefined = undefined) {
		super(message, 404, 404, hint);
	}
}
