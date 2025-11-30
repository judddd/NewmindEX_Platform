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
import type { JsonSchemaObject, JsonSchema, Refs } from '../types';

export const parseNot = (jsonSchema: JsonSchemaObject & { not: JsonSchema }, refs: Refs) => {
	return z.any().refine(
		(value) =>
			!parseSchema(jsonSchema.not, {
				...refs,
				path: [...refs.path, 'not'],
			}).safeParse(value).success,
		'Invalid input: Should NOT be valid against schema',
	);
};
