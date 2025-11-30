/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';

import { parseSchema } from './parse-schema';
import type { JsonSchemaObject, Refs } from '../types';
import { extendSchemaWithMessage } from '../utils/extend-schema';

export const parseArray = (jsonSchema: JsonSchemaObject & { type: 'array' }, refs: Refs) => {
	if (Array.isArray(jsonSchema.items)) {
		return z.tuple(
			jsonSchema.items.map((v, i) =>
				parseSchema(v, { ...refs, path: [...refs.path, 'items', i] }),
			) as [z.ZodTypeAny],
		);
	}

	let zodSchema = !jsonSchema.items
		? z.array(z.any())
		: z.array(parseSchema(jsonSchema.items, { ...refs, path: [...refs.path, 'items'] }));

	zodSchema = extendSchemaWithMessage(
		zodSchema,
		jsonSchema,
		'minItems',
		(zs, minItems, errorMessage) => zs.min(minItems, errorMessage),
	);
	zodSchema = extendSchemaWithMessage(
		zodSchema,
		jsonSchema,
		'maxItems',
		(zs, maxItems, errorMessage) => zs.max(maxItems, errorMessage),
	);

	return zodSchema;
};
