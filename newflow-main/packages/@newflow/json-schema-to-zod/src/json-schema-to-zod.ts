/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { z } from 'zod';

import { parseSchema } from './parsers/parse-schema';
import type { JsonSchemaToZodOptions, JsonSchema } from './types';

export const jsonSchemaToZod = <T extends z.ZodTypeAny = z.ZodTypeAny>(
	schema: JsonSchema,
	options: JsonSchemaToZodOptions = {},
): T => {
	return parseSchema(schema, {
		path: [],
		seen: new Map(),
		...options,
	}) as T;
};
