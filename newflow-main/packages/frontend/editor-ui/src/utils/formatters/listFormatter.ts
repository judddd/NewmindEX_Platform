/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { I18nClass } from '@newflow/i18n';

/**
 * Formats a list of items into a string. Each item is formatted using
 * the given function and the are separated by a comma except for the last
 * item which is separated by "and".
 *
 * @example
 * formatList(['a', 'b', 'c'], {
 *   formatFn: (x) => `"${x}"`
 *   i18n
 * });
 * // => '"a", "b" and "c"'
 */
export const formatList = <T>(
	list: T[],
	opts: {
		formatFn: (item: T) => string;
		i18n: I18nClass;
	},
) => {
	const { i18n, formatFn } = opts;
	if (list.length === 0) {
		return '';
	}
	if (list.length === 1) {
		return formatFn(list[0]);
	}

	const allButLast = list.slice(0, -1);
	const last = list[list.length - 1];
	return `${allButLast.map(formatFn).join(', ')} ${i18n.baseText('generic.and')} ${formatFn(last)}`;
};
