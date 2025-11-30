/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { IDataObject } from 'n8n-workflow';
import { z } from 'zod';

import { BaseDynamicParametersRequestDto } from './base-dynamic-parameters-request.dto';

export class ActionResultRequestDto extends BaseDynamicParametersRequestDto.extend({
	handler: z.string(),
	payload: z
		.union([z.object({}).catchall(z.any()) satisfies z.ZodType<IDataObject>, z.string()])
		.optional(),
}) {}
