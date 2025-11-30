/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { useUsersStore } from '@/stores/users.store';
import type { RBACPermissionCheck, RolePermissionOptions } from '@/types/rbac';
import { ROLE, type Role } from '@newflow/api-types';

export const hasRole: RBACPermissionCheck<RolePermissionOptions> = (checkRoles) => {
	const usersStore = useUsersStore();
	const currentUser = usersStore.currentUser;

	if (currentUser && checkRoles) {
		const userRole = currentUser.isDefaultUser ? ROLE.Default : currentUser.role;
		return checkRoles.includes(userRole as Role);
	}

	return false;
};
