/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { ILoadOptions } from 'n8n-workflow';
import { z } from 'zod';

import { BaseDynamicParametersRequestDto } from './base-dynamic-parameters-request.dto';

export class OptionsRequestDto extends BaseDynamicParametersRequestDto.extend({
	loadOptions: z
		.object({
			routing: z
				.object({
					operations: z.any().optional(),
					output: z.any().optional(),
					request: z.any().optional(),
				})
				.optional(),
		})
		.optional() as z.ZodType<ILoadOptions | undefined>,
}) {}
