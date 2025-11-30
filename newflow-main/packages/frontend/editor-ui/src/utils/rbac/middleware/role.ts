/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { RouterMiddleware } from '@/types/router';
import type { RolePermissionOptions } from '@/types/rbac';
import { VIEWS } from '@/constants';
import { hasRole } from '@/utils/rbac/checks';

export const roleMiddleware: RouterMiddleware<RolePermissionOptions> = async (
	_to,
	_from,
	next,
	checkRoles,
) => {
	const valid = hasRole(checkRoles);
	if (!valid) {
		return next({ name: VIEWS.HOMEPAGE });
	}
};
