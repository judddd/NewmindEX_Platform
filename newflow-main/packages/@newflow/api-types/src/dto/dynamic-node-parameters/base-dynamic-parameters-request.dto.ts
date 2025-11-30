/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { INodeCredentials, INodeParameters, INodeTypeNameVersion } from 'n8n-workflow';
import { z } from 'zod';
import { Z } from 'zod-class';

import { nodeVersionSchema } from '../../schemas/node-version.schema';

export class BaseDynamicParametersRequestDto extends Z.class({
	path: z.string(),
	nodeTypeAndVersion: z.object({
		name: z.string(),
		version: nodeVersionSchema,
	}) satisfies z.ZodType<INodeTypeNameVersion>,
	currentNodeParameters: z.record(z.string(), z.any()) satisfies z.ZodType<INodeParameters>,
	methodName: z.string().optional(),
	credentials: z.record(z.string(), z.any()).optional() satisfies z.ZodType<
		INodeCredentials | undefined
	>,
	projectId: z.string().optional(),
}) {}
