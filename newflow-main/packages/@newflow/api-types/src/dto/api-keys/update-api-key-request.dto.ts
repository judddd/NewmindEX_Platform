/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import xss from 'xss';
import { z } from 'zod';
import { Z } from 'zod-class';

import { scopesSchema } from '../../schemas/scopes.schema';

const xssCheck = (value: string) =>
	value ===
	xss(value, {
		whiteList: {},
	});

export class UpdateApiKeyRequestDto extends Z.class({
	label: z.string().max(50).min(1).refine(xssCheck),
	scopes: scopesSchema,
}) {}
