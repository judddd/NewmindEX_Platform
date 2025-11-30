/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/**
 * Checks if the given value is an expression. An expression is a string that
 * starts with '='.
 */
export const isExpression = (expr: unknown): expr is string => {
	if (typeof expr !== 'string') return false;

	return expr.charAt(0) === '=';
};
