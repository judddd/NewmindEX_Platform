/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { isStringArray } from '@newflow/db';
import { jsonParse, UnexpectedError } from 'n8n-workflow';

export class BaseSelect {
	static selectableFields: Set<string>;

	protected static toSelect(rawFilter: string, Select: typeof BaseSelect) {
		const dto = jsonParse(rawFilter, { errorMessage: 'Failed to parse filter JSON' });

		if (!isStringArray(dto)) throw new UnexpectedError('Parsed select is not a string array');

		return dto.reduce<Record<string, true>>((acc, field) => {
			if (!Select.selectableFields.has(field)) return acc;
			return (acc[field] = true), acc;
		}, {});
	}
}
