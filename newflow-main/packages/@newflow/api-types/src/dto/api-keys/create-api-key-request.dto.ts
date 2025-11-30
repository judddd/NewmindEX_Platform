/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';

import { UpdateApiKeyRequestDto } from './update-api-key-request.dto';

const isTimeNullOrInFuture = (value: number | null) => {
	if (!value) return true;
	return value > Date.now() / 1000;
};

export class CreateApiKeyRequestDto extends UpdateApiKeyRequestDto.extend({
	expiresAt: z
		.number()
		.nullable()
		.refine(isTimeNullOrInFuture, { message: 'Expiration date must be in the future or null' }),
}) {}
