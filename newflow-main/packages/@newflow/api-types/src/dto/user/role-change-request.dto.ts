/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { assignableGlobalRoleSchema } from '@newflow/permissions';
import { Z } from 'zod-class';

export class RoleChangeRequestDto extends Z.class({
	newRoleName: assignableGlobalRoleSchema
		// enforce required (non-nullable, non-optional) with custom error message on undefined
		.nullish()
		.refine((val): val is NonNullable<typeof val> => val !== null && typeof val !== 'undefined', {
			message: 'New role is required',
		}),
}) {}
