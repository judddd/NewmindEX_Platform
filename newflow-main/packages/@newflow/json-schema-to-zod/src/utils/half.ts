/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

export const half = <T>(arr: T[]): [T[], T[]] => {
	return [arr.slice(0, arr.length / 2), arr.slice(arr.length / 2)];
};
