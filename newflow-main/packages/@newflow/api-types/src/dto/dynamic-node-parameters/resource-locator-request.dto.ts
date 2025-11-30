/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';

import { BaseDynamicParametersRequestDto } from './base-dynamic-parameters-request.dto';

export class ResourceLocatorRequestDto extends BaseDynamicParametersRequestDto.extend({
	methodName: z.string(),
	filter: z.string().optional(),
	paginationToken: z.string().optional(),
}) {}
