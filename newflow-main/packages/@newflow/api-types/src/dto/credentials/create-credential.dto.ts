/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';
import { Z } from 'zod-class';

export class CreateCredentialDto extends Z.class({
	name: z.string().min(1).max(128),
	type: z.string().min(1).max(128),
	data: z.record(z.string(), z.unknown()),
	projectId: z.string().optional(),
	uiContext: z.string().optional(),
}) {}
