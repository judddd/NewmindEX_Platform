/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/**
 * Provides syntax highlighting for embedded SQL queries in template strings.
 */
export function sql(strings: TemplateStringsArray, ...values: string[]): string {
	let result = '';

	// Interleave the strings with the values
	for (let i = 0; i < values.length; i++) {
		result += strings[i];
		result += values[i];
	}

	// Add the last string
	result += strings[strings.length - 1];

	return result;
}
