/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { RequestHandler } from 'express';
import { UnexpectedError } from 'n8n-workflow';

import type { ListQuery } from '@/requests';
import * as ResponseHelper from '@/response-helper';
import { toError } from '@/utils';

import { Pagination } from './dtos/pagination.dto';

export const paginationListQueryMiddleware: RequestHandler = (
	req: ListQuery.Request,
	res,
	next,
) => {
	const { take: rawTake, skip: rawSkip = '0' } = req.query;

	try {
		if (!rawTake && req.query.skip) {
			throw new UnexpectedError('Please specify `take` when using `skip`');
		}

		if (!rawTake) return next();

		const { take, skip } = Pagination.fromString(rawTake, rawSkip);

		req.listQueryOptions = { ...req.listQueryOptions, skip, take };

		next();
	} catch (maybeError) {
		ResponseHelper.sendErrorResponse(res, toError(maybeError));
	}
};
