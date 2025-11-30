/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { UserError } from 'n8n-workflow';

export class DataStoreColumnNameConflictError extends UserError {
	constructor(columnName: string, dataStoreName: string) {
		super(
			`Data store column with name '${columnName}' already exists in data store '${dataStoreName}'`,
			{
				level: 'warning',
			},
		);
	}
}
