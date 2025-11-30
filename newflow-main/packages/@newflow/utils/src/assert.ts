/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/**
 * Asserts given condition
 */
export function assert(condition: unknown, message?: string): asserts condition {
	if (!condition) {
		// eslint-disable-next-line n8n-local-rules/no-plain-errors
		throw new Error(message ?? 'Assertion failed');
	}
}
