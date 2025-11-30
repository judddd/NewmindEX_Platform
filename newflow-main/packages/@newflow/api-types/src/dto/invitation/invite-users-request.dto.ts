/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { assignableGlobalRoleSchema } from '@newflow/permissions';
import { z } from 'zod';

const invitedUserSchema = z.object({
	email: z.string().email(),
	role: assignableGlobalRoleSchema.default('global:member'),
});

const invitationsSchema = z.array(invitedUserSchema);

export class InviteUsersRequestDto extends Array<z.infer<typeof invitedUserSchema>> {
	static safeParse(data: unknown) {
		return invitationsSchema.safeParse(data);
	}
}
