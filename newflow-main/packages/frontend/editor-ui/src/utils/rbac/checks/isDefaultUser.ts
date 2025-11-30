/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { useUsersStore } from '@/stores/users.store';
import type { DefaultUserMiddlewareOptions, RBACPermissionCheck } from '@/types/rbac';

export const isDefaultUser: RBACPermissionCheck<DefaultUserMiddlewareOptions> = () => {
	const usersStore = useUsersStore();
	const currentUser = usersStore.currentUser;

	if (currentUser) {
		return currentUser.isDefaultUser;
	}
	return false;
};
