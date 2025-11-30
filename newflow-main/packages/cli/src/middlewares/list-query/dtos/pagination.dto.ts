/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { UnexpectedError } from 'n8n-workflow';

import { isIntegerString } from '@/utils';

export class Pagination {
	static fromString(rawTake: string, rawSkip: string) {
		if (!isIntegerString(rawTake)) {
			throw new UnexpectedError('Parameter take is not an integer string');
		}

		if (!isIntegerString(rawSkip)) {
			throw new UnexpectedError('Parameter skip is not an integer string');
		}

		const [take, skip] = [rawTake, rawSkip].map((o) => parseInt(o, 10));

		const MAX_ITEMS_PER_PAGE = 50;

		return {
			take: Math.min(take, MAX_ITEMS_PER_PAGE),
			skip,
		};
	}
}
