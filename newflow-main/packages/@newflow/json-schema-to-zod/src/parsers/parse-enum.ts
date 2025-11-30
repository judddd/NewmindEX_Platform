/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';

import type { JsonSchemaObject, Serializable } from '../types';

export const parseEnum = (jsonSchema: JsonSchemaObject & { enum: Serializable[] }) => {
	if (jsonSchema.enum.length === 0) {
		return z.never();
	}

	if (jsonSchema.enum.length === 1) {
		// union does not work when there is only one element
		return z.literal(jsonSchema.enum[0] as z.Primitive);
	}

	if (jsonSchema.enum.every((x) => typeof x === 'string')) {
		return z.enum(jsonSchema.enum as [string]);
	}

	return z.union(
		jsonSchema.enum.map((x) => z.literal(x as z.Primitive)) as unknown as [
			z.ZodTypeAny,
			z.ZodTypeAny,
		],
	);
};
