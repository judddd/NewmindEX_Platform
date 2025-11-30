/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import type { RequestHandler } from 'express';
import { UnexpectedError } from 'n8n-workflow';

import type { ListQuery } from '@/requests';
import * as ResponseHelper from '@/response-helper';
import { toError } from '@/utils';

import { WorkflowSorting } from './dtos/workflow.sort-by.dto';

export const sortByQueryMiddleware: RequestHandler = (req: ListQuery.Request, res, next) => {
	const { sortBy } = req.query;

	if (!sortBy) return next();

	let SortBy;

	try {
		if (req.baseUrl.endsWith('workflows')) {
			SortBy = WorkflowSorting;
		} else {
			return next();
		}

		const validationResponse = validateSync(plainToInstance(SortBy, { sortBy }));

		if (validationResponse.length) {
			const validationError = validationResponse[0];
			throw new UnexpectedError(validationError.constraints?.workflowSortBy ?? '');
		}

		req.listQueryOptions = { ...req.listQueryOptions, sortBy };

		next();
	} catch (maybeError) {
		ResponseHelper.sendErrorResponse(res, toError(maybeError));
	}
};
