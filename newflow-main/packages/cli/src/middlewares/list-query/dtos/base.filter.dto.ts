/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { isObjectLiteral } from '@newflow/backend-common';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import { validate } from 'class-validator';
import { jsonParse, UnexpectedError } from 'n8n-workflow';

export class BaseFilter {
	protected static async toFilter(rawFilter: string, Filter: typeof BaseFilter) {
		const dto = jsonParse(rawFilter, { errorMessage: 'Failed to parse filter JSON' });

		if (!isObjectLiteral(dto)) throw new UnexpectedError('Filter must be an object literal');

		const instance = plainToInstance(Filter, dto, {
			excludeExtraneousValues: true, // remove fields not in class
		});

		await instance.validate();

		return instanceToPlain(instance, {
			exposeUnsetFields: false, // remove in-class undefined fields
		});
	}

	private async validate() {
		const result = await validate(this);

		if (result.length > 0) throw new UnexpectedError('Parsed filter does not fit the schema');
	}
}
