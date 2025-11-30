/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { RequestHandler } from 'express';

import type { ListQuery } from '@/requests';
import * as ResponseHelper from '@/response-helper';
import { toError } from '@/utils';

import { CredentialsSelect } from './dtos/credentials.select.dto';
import { UserSelect } from './dtos/user.select.dto';
import { WorkflowSelect } from './dtos/workflow.select.dto';

export const selectListQueryMiddleware: RequestHandler = (req: ListQuery.Request, res, next) => {
	const { select: rawSelect } = req.query;

	if (!rawSelect) return next();

	let Select;

	if (req.baseUrl.endsWith('workflows')) {
		Select = WorkflowSelect;
	} else if (req.baseUrl.endsWith('credentials')) {
		Select = CredentialsSelect;
	} else if (req.baseUrl.endsWith('users')) {
		Select = UserSelect;
	} else {
		return next();
	}

	try {
		const select = Select.fromString(rawSelect);

		if (Object.keys(select).length === 0) return next();

		req.listQueryOptions = { ...req.listQueryOptions, select };

		next();
	} catch (maybeError) {
		ResponseHelper.sendErrorResponse(res, toError(maybeError));
	}
};
