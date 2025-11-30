/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

export const omit = <T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> =>
	Object.keys(obj).reduce((acc: Record<string, unknown>, key) => {
		if (!keys.includes(key as K)) {
			acc[key] = obj[key as K];
		}

		return acc;
	}, {}) as Omit<T, K>;
