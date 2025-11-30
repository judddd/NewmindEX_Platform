/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/** Ensures `error` is an `Error */
export function ensureError(error: unknown): Error {
	return error instanceof Error
		? error
		: new Error('Error that was not an instance of Error was thrown', {
				// We should never throw anything except something that derives from Error
				cause: error,
			});
}
