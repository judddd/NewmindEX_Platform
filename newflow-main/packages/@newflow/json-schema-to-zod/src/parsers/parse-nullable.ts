/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { parseSchema } from './parse-schema';
import type { JsonSchemaObject, Refs } from '../types';
import { omit } from '../utils/omit';

/**
 * For compatibility with open api 3.0 nullable
 */
export const parseNullable = (jsonSchema: JsonSchemaObject & { nullable: true }, refs: Refs) => {
	return parseSchema(omit(jsonSchema, 'nullable'), refs, true).nullable();
};
