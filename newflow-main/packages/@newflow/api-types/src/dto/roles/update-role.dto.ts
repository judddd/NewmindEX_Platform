/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { scopeSchema } from '@newflow/permissions';
import { z } from 'zod';
import { Z } from 'zod-class';

export class UpdateRoleDto extends Z.class({
	displayName: z.string().min(2).max(100).optional(),
	description: z.string().max(500).optional(),
	scopes: z.array(scopeSchema).optional(),
}) {}
