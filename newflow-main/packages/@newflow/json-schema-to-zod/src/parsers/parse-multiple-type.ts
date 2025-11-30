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
import type { JsonSchema, JsonSchemaObject, Refs } from '../types';

export const parseMultipleType = (
	jsonSchema: JsonSchemaObject & { type: string[] },
	refs: Refs,
) => {
	return z.union(
		jsonSchema.type.map((type) => parseSchema({ ...jsonSchema, type } as JsonSchema, refs)) as [
			z.ZodTypeAny,
			z.ZodTypeAny,
		],
	);
};
