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
import { half } from '../utils/half';

const originalIndex = Symbol('Original index');

const ensureOriginalIndex = (arr: JsonSchema[]) => {
	const newArr = [];

	for (let i = 0; i < arr.length; i++) {
		const item = arr[i];
		if (typeof item === 'boolean') {
			newArr.push(item ? { [originalIndex]: i } : { [originalIndex]: i, not: {} });
		} else if (originalIndex in item) {
			return arr;
		} else {
			newArr.push({ ...item, [originalIndex]: i });
		}
	}

	return newArr;
};

export function parseAllOf(
	jsonSchema: JsonSchemaObject & { allOf: JsonSchema[] },
	refs: Refs,
): z.ZodTypeAny {
	if (jsonSchema.allOf.length === 0) {
		return z.never();
	}

	if (jsonSchema.allOf.length === 1) {
		const item = jsonSchema.allOf[0];

		return parseSchema(item, {
			...refs,
			path: [...refs.path, 'allOf', (item as never)[originalIndex]],
		});
	}

	const [left, right] = half(ensureOriginalIndex(jsonSchema.allOf));

	return z.intersection(parseAllOf({ allOf: left }, refs), parseAllOf({ allOf: right }, refs));
}
