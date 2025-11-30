/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';
import { Z } from 'zod-class';

import {
	dataStoreColumnNameSchema,
	dataStoreColumnValueSchema,
} from '../../schemas/data-store.schema';
import { dataTableFilterSchema } from '../../schemas/data-table-filter.schema';

const upsertFilterSchema = dataTableFilterSchema.refine((filter) => filter.filters.length > 0, {
	message: 'filter must not be empty',
});

const upsertDataStoreRowShape = {
	filter: upsertFilterSchema,
	data: z
		.record(dataStoreColumnNameSchema, dataStoreColumnValueSchema)
		.refine((obj) => Object.keys(obj).length > 0, {
			message: 'data must not be empty',
		}),
	returnData: z.boolean().optional().default(false),
};

export class UpsertDataStoreRowDto extends Z.class(upsertDataStoreRowShape) {}
