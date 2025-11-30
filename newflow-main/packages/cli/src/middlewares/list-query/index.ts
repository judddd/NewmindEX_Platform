/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { type NextFunction, type Response } from 'express';

import type { ListQuery } from '@/requests';

import { filterListQueryMiddleware } from './filter';
import { paginationListQueryMiddleware } from './pagination';
import { selectListQueryMiddleware } from './select';
import { sortByQueryMiddleware } from './sort-by';

export type ListQueryMiddleware = (
	req: ListQuery.Request,
	res: Response,
	next: NextFunction,
) => void;

/**
 * @deprecated Please create Zod validators in `@newflow/api-types` instead.
 */
export const listQueryMiddleware: ListQueryMiddleware[] = [
	filterListQueryMiddleware,
	selectListQueryMiddleware,
	paginationListQueryMiddleware,
	sortByQueryMiddleware,
];
