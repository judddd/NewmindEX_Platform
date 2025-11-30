/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// NewFlow: Replaced n8n AI SDK with CustomAI client
// import type { AiAssistantSDK, SchemaType } from '@n8n_io/ai-assistant-sdk';
import { z } from 'zod';
import { Z } from 'zod-class';

// NewFlow: Define our own types instead of relying on SDK
export type SchemaType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'bigint'
	| 'symbol'
	| 'array'
	| 'object'
	| 'function'
	| 'null'
	| 'undefined';

type Schema = {
	type: SchemaType;
	key?: string;
	value: string | Schema[];
	path: string;
};

export interface AskAiRequestPayload {
	question: string;
	context: {
		schema: Array<{ nodeName: string; schema: Schema }>;
		inputSchema: { nodeName: string; schema: Schema };
		pushRef: string;
		ndvPushRef: string;
	};
	forNode: string;
}

// Create a lazy validator to handle the recursive type
const schemaValidator: z.ZodType<Schema> = z.lazy(() =>
	z.object({
		type: z.enum([
			'string',
			'number',
			'boolean',
			'bigint',
			'symbol',
			'array',
			'object',
			'function',
			'null',
			'undefined',
		]),
		key: z.string().optional(),
		value: z.union([z.string(), z.lazy(() => schemaValidator.array())]),
		path: z.string(),
	}),
);

export class AiAskRequestDto
	extends Z.class({
		question: z.string(),
		context: z.object({
			schema: z.array(
				z.object({
					nodeName: z.string(),
					schema: schemaValidator,
				}),
			),
			inputSchema: z.object({
				nodeName: z.string(),
				schema: schemaValidator,
			}),
			pushRef: z.string(),
			ndvPushRef: z.string(),
		}),
		forNode: z.string(),
	})
	implements AskAiRequestPayload {}
