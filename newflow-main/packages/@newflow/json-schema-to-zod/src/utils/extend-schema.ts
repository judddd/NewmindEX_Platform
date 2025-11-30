/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { z } from 'zod';

import type { JsonSchemaObject } from '../types';

export function extendSchemaWithMessage<
	TZod extends z.ZodTypeAny,
	TJson extends JsonSchemaObject,
	TKey extends keyof TJson,
>(
	zodSchema: TZod,
	jsonSchema: TJson,
	key: TKey,
	extend: (zodSchema: TZod, value: NonNullable<TJson[TKey]>, errorMessage?: string) => TZod,
) {
	const value = jsonSchema[key];

	if (value !== undefined) {
		const errorMessage = jsonSchema.errorMessage?.[key as string];
		return extend(zodSchema, value as NonNullable<TJson[TKey]>, errorMessage);
	}

	return zodSchema;
}
